import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDayDto {
  @ApiPropertyOptional({ example: 'Roma' })
  @IsOptional()
  @IsString()
  destinationName?: string;

  @ApiPropertyOptional({ example: 'ChIJu46S-ZZhLxMROG5lkwZ3D7k' })
  @IsOptional()
  @IsString()
  destinationPlaceId?: string; 
}