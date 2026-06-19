import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PaginationParamsDto } from '../common/dto/pagination-params.dto';
import type { IAuthRequest } from '../auth/interfaces/auth-request.interface';
import { Journal } from './entities/journal.entity';

@ApiTags('Journals')
@ApiBearerAuth()
@Controller('journals')
@UseGuards(JwtAuthGuard)
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('journals.create')
  @ApiOperation({ summary: 'Create a journal entry' })
  @ApiResponse({ status: 201, type: Journal })
  create(@Body() dto: CreateJournalDto, @Req() req: IAuthRequest) {
    return this.journalsService.createForUser(req.user.userId, dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('journals.read')
  @ApiOperation({ summary: 'Get journals (own, or all if journals.read_all)' })
  findAll(@Query() params: PaginationParamsDto, @Req() req: IAuthRequest) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const canReadAll = req.user.permissions.includes('journals.read_all');

    if (canReadAll) {
      return this.journalsService.findAllPaginated(
        page,
        limit,
        params.search,
        params.sort,
        params.direction,
      );
    }

    return this.journalsService.findPaginatedForUser(
      req.user.userId,
      page,
      limit,
      params.search,
      params.sort,
      params.direction,
    );
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('journals.read')
  @ApiOperation({ summary: 'Get a journal by ID' })
  @ApiResponse({ status: 200, type: Journal })
  findOne(@Param('id') id: string) {
    return this.journalsService.findOne(+id, ['user']);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('journals.update')
  @ApiOperation({ summary: 'Update a journal entry (own only)' })
  @ApiResponse({ status: 200, type: Journal })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
    @Req() req: IAuthRequest,
  ) {
    return this.journalsService.updateOwn(req.user.userId, +id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('journals.delete')
  @ApiOperation({ summary: 'Delete a journal entry (own only)' })
  remove(@Param('id') id: string, @Req() req: IAuthRequest) {
    return this.journalsService.removeOwn(req.user.userId, +id);
  }
}
