import { Controller, Post, Body, Req, Delete, Param, Get, UseGuards, Put, UploadedFile, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get authenticated user details' })
    @Get('me')
    getMe(@Req() req) {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Add a friend by email' })
    @ApiBody({ schema: { properties: { email: { type: 'string' } }, required: ['email'] } })
    @Post('/friends')
    async addFriend(@Req() req, @Body('email') email: string) {
        return this.usersService.addFriend(req.user.id, email);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send friend request by userId' })
    @Post(':id/friend-request')
    sendFriendRequest(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.usersService.sendFriendRequest(req.user.id, id);
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

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get public profile of a user' })
    @Get(':id')
    getUserProfile(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserProfile(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update my profile' })
    @Put('me')
    updateMe(
    @Req() req,
    @Body() body: { name?: string; bio?: string }
    ) {
        return this.usersService.updateProfile(req.user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload profile avatar' })
    @Post('me/avatar')
    @UseInterceptors(FileInterceptor('image'))
    uploadAvatar(
    @Req() req,
    @UploadedFile() file: Express.Multer.File
    ) {
        return this.usersService.updateAvatar(req.user.id, file);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get trips of a user (filtered by visibility)' })
    @Get(':id/trips')
    getUserTrips(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.usersService.getUserTrips(req.user.id, id);
    }

}