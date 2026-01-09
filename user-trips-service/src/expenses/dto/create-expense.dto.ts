import { IsString, IsNumber, IsInt, IsOptional, IsIn, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CustomSplitDto {
  @IsInt()
  @ApiProperty({ example: 2 })
  userId: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 50.25 })
  amount: number;
}

export class CreateExpenseDto {
  @IsString()
  @ApiProperty({ example: 'Dinner at Italian Restaurant' })
  name: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 150.75 })
  originalAmount: number;

  @IsString()
  @ApiProperty({ example: 'USD' })
  currency: string;

  @IsInt()
  @ApiProperty({ example: 1 })
  tripId: number;

  @IsIn(['EQUAL', 'CUSTOM'])
  @ApiProperty({ example: 'EQUAL', enum: ['EQUAL', 'CUSTOM'] })
  splitType: 'EQUAL' | 'CUSTOM';

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomSplitDto)
  @ApiProperty({ type: [CustomSplitDto], required: false })
  splits?: CustomSplitDto[];
}