import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
    @IsString()
    @ApiProperty({ example: 'Summer Vacation' })
    name: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'A relaxing trip to the beach', required: false })
    description?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2024-07-01', required: false })
    startDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2024-07-15', required: false })
    endDate?: string;

    @IsOptional()
    @IsArray()
    @ApiProperty({ example: ['participant1@example.com', 'participant2@example.com'], required: false })
    participants?: string[];

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '/uploads/summer-vacation.jpg', required: false })
    imageUrl?: string;
}
