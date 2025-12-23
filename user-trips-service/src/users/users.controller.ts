import { Controller, Post, Body, Req, Delete, Param, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Add a friend by email' })
    @ApiBody({ schema: { properties: { email: { type: 'string' } }, required: ['email'] } })
    @Post('/friends')
    async addFriend(@Req() req, @Body('email') email: string) {
        return this.usersService.addFriend(req.user.id, email);
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Remove a friend by ID' })
    @Delete('/friends/:friendId')
    async removeFriend(@Req() req, @Param('friendId') friendId: number) {
        return this.usersService.removeFriend(req.user.id, friendId);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get friends of the authenticated user' })
    @Get('/friends')
    async getFriends(@Req() req) {
        return this.usersService.getFriends(req.user.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Accept a friend request' })
    @Post('/friends/:friendId/accept')
    async acceptFriend(@Req() req, @Param('friendId') friendId: number) {
        return this.usersService.respondToRequest(req.user.id, friendId, true);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Reject a friend request' })
    @Post('/friends/:friendId/reject')
    async rejectFriend(@Req() req, @Param('friendId') friendId: number) {
        return this.usersService.respondToRequest(req.user.id, friendId, false);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get pending friend requests for the authenticated user' })
    @Get('/friends/requests/pending')
    async getPendingRequests(@Req() req) {
        return this.usersService.getFriendRequests(req.user.id);
    }
}