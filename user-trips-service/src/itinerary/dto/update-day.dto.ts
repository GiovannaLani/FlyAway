import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDayDto {
  @ApiPropertyOptional({ example: 'Roma' })
  @IsOptional()
  @IsString()
  destination?: string;
}