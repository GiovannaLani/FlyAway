import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveImageDto {
  @ApiProperty({ example: '/uploads/activities/123.jpg' })
  @IsString()
  url: string;
}