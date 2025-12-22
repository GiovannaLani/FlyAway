import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantDto {
    @IsEmail()
    @ApiProperty({ example: 'participant@example.com' })
    email: string;
}