import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string;
    
    @ApiProperty({ example: '123' })
    password: string;
}