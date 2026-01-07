import { IsBoolean } from 'class-validator';

export class SettleSplitDto {
  @IsBoolean()
  settled: boolean;
}