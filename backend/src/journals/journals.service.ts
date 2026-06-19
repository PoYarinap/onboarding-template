import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { BaseService } from '../common/services/base.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalsService extends BaseService<Journal> {
  constructor(
    @InjectRepository(Journal)
    private readonly journalsRepository: Repository<Journal>,
  ) {
    super(journalsRepository, 'Journal', ['title', 'content']);
  }

  async createForUser(userId: number, dto: CreateJournalDto): Promise<Journal> {
    const journal = this.journalsRepository.create({ ...dto, userId });
    return this.journalsRepository.save(journal);
  }

  async findPaginatedForUser(
    userId: number,
    page: number,
    limit: number,
    search?: string,
    sort: string = 'createdAt',
    direction: string = 'DESC',
  ) {
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;

    const qb = this.journalsRepository
      .createQueryBuilder('journal')
      .where('journal.userId = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy(
        `journal.${sort}`,
        direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );

    if (search) {
      qb.andWhere(
        '(journal.title ILIKE :search OR journal.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: +currentPage,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  override async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    sort: string = 'createdAt',
    direction: string = 'DESC',
  ) {
    return super.findAllPaginated(page, limit, search, sort, direction, [
      'user',
    ]);
  }

  async updateOwn(
    userId: number,
    id: number,
    dto: UpdateJournalDto,
  ): Promise<Journal> {
    const journal = await this.findOne(id);
    if (journal.userId !== userId) {
      throw new ForbiddenException('You can only update your own journals');
    }
    return this.update(id, dto);
  }

  async removeOwn(userId: number, id: number): Promise<void> {
    const journal = await this.findOne(id);
    if (journal.userId !== userId) {
      throw new ForbiddenException('You can only delete your own journals');
    }
    return this.remove(id);
  }
}
