import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ example: 'UserName' })
    name: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;
    
    @ApiProperty({ example: '123' })
    password: string;
}