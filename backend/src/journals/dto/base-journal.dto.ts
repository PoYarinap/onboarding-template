import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class BaseJournalDto {
  @ApiProperty({ example: 'My Journal Entry' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Today I learned about NestJS and TypeORM...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  date?: string;
}
