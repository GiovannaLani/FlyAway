import { IsString, IsNumber, IsInt, IsOptional, IsIn, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CustomSplitDto {
  @IsInt()
  userId: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  originalAmount: number;

  @IsString()
  currency: string;

  @IsInt()
  tripId: number;

  @IsIn(['EQUAL', 'CUSTOM'])
  splitType: 'EQUAL' | 'CUSTOM';

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomSplitDto)
  splits?: CustomSplitDto[];
}