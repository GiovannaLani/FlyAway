import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterUserDto })
    register(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.register(
            registerUserDto.name,
            registerUserDto.email,
            registerUserDto.password
        );
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginUserDto })
    login(@Body() loginUserDto: LoginUserDto) {
        return this.usersService.login(
            loginUserDto.email,
            loginUserDto.password
        );
    }
}