import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false , example: 'Summer Vacation'})
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false , example: 'A relaxing trip to the beach'})
  description?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false , example: '2024-07-01'})
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false , example: '2024-07-15'})
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
