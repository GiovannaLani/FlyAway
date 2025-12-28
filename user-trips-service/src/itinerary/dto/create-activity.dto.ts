import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  place?: string;

  @ApiProperty({ example: '12:00', required: false })
  startTime?: string;

  @ApiProperty({ example: '13:30', required: false })
  endTime?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false, example: 25 })
  price?: number;
}