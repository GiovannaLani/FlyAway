import { ApiProperty } from '@nestjs/swagger';

export class CreateDayDto {
  @ApiProperty({ example: '2025-01-01' })
  date: string;

  @ApiProperty({ example: 'Roma', required: false })
  destination?: string;
}