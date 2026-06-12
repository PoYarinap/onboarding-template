import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, FindOptionsWhere } from 'typeorm';
import { Media } from './entities/media.entity';
import { BaseService } from '../common/services/base.service';
import { DepotClient, DepotError } from '@univstekom/depot-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService extends BaseService<Media> {
  private depot: DepotClient;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly configService: ConfigService,
  ) {
    super(mediaRepository, 'Media', ['filename', 'mimetype']);

    this.depot = new DepotClient({
      baseUrl: this.configService.get<string>('DEPOT_BASE_URL')!,
      apiKey: this.configService.get<string>('DEPOT_API_KEY')!,
    });
  }

  async uploadFile(file: Express.Multer.File, userId: number): Promise<Media> {
    // Backend proxies the upload: the SDK presigns, PUTs the bytes straight to
    // S3, then finalizes. The local row is a facade for RBAC/ownership.
    const depotFile = await this.depot.upload({
      body: file.buffer,
      name: file.originalname,
      mime: file.mimetype,
      size: file.size,
      ownerUserId: userId,
    });

    const media = this.mediaRepository.create({
      filename: file.originalname,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: depotFile.s3Key,
      depotFileId: depotFile.id,
      userId,
    });

    const savedMedia = await this.mediaRepository.save(media);

    // Update with local view URL (302-redirects to a Depot signed URL)
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    savedMedia.url = `${baseUrl}/api/media/${savedMedia.id}/view`;

    return this.mediaRepository.save(savedMedia);
  }

  /** Resolve a short-lived Depot signed URL for the underlying object. */
  async getSignedUrl(id: number): Promise<string> {
    const media = await this.findOne(id);
    const { url } = await this.depot.getUrl(media.depotFileId);
    return url;
  }

  override async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    await super.remove(id);

    // Best-effort remote delete; a missing Depot object must not block the
    // local soft-delete.
    if (media.depotFileId) {
      try {
        await this.depot.delete(media.depotFileId);
      } catch (err) {
        if (!(err instanceof DepotError && err.status === 404)) {
          throw err;
        }
      }
    }
  }

  async findAllMediaPaginated(
    page: number,
    limit: number,
    search?: string,
    sort: string = 'createdAt',
    direction: string = 'DESC',
    userId?: number,
  ) {
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    const findOptions: FindManyOptions<Media> = {
      skip,
      take: limit,
      order: {
        [sort]: direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      relations: ['user'],
    };

    const where: FindOptionsWhere<Media> = {};
    if (userId) {
      where.userId = userId;
    }

    if (search) {
      findOptions.where = this.searchFields.map((field) => ({
        ...where,
        [field]: ILike(`%${search}%`),
      }));
    } else if (userId) {
      findOptions.where = where;
    }

    const [data, total] = await this.mediaRepository.findAndCount(findOptions);

    return {
      data,
      meta: {
        total,
        page: +currentPage,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findAllMedia(userId?: number): Promise<Media[]> {
    if (userId) {
      return this.mediaRepository.find({
        where: { userId },
        relations: ['user'],
      });
    }
    return super.findAll(['user']);
  }

  override async findOne(id: number): Promise<Media> {
    return super.findOne(id, ['user']);
  }
}
