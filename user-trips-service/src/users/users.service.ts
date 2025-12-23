import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { Friendship } from './friendship.model';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private authService: AuthService,
        @InjectModel(Friendship) private friendshipModel: typeof Friendship
    ) {}

    async register(name: string, email: string, password: string) {
        const existing = await this.userModel.findOne({ where: { email } });
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword
        });

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.userModel.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = this.authService.generateToken(user.id);

        return { token };
    }

    async findById(id: number) {
        return this.userModel.findByPk(id);
    }

    async addFriend(userId: number, friendEmail: string) {
        const friend = await this.userModel.findOne({ where: { email: friendEmail } });
        if (!friend) throw new NotFoundException('User not found');

        if (friend.id === userId) throw new BadRequestException('Cannot add yourself');

        const exists = await this.friendshipModel.findOne({
            where: { userId, friendId: friend.id },
        });
        if (exists) throw new BadRequestException('Already friends');

        const friendship = await this.friendshipModel.create({
            userId,
            friendId: friend.id,
            status: 'pending',
        });

        return friendship;
    }

    async removeFriend(userId: number, friendId: number) {
        const deleted = await this.friendshipModel.destroy({
            where: { userId, friendId },
        });
        if (!deleted) throw new NotFoundException('Friendship not found');
        return { message: 'Friend removed' };
    }

    async getFriends(userId: number) {
        const friendships = await this.friendshipModel.findAll({
            where: {
            status: 'accepted',
            [Op.or]: [
                { userId },
                { friendId: userId }
            ]
            },
            include: [
            { model: User, as: 'friend' },
            { model: User, as: 'user' }
            ],
        });


        return friendships.map(f => {
            const friend = f.userId === userId ? f.friend : f.user;
            return {
            id: friend.id,
            name: friend.name,
            email: friend.email,
            };
        });
    }

    async respondToRequest(userId: number, friendId: number, accept: boolean) {
        const request = await this.friendshipModel.findOne({
            where: { userId: friendId, friendId: userId, status: 'pending' },
        });

        if (!request) throw new NotFoundException('Friend request not found');

        request.status = accept ? 'accepted' : 'rejected';
        await request.save();

        return { message: accept ? 'Friend request accepted' : 'Friend request rejected' };
    }

    async getFriendRequests(userId: number) {
        const requests = await this.friendshipModel.findAll({
            where: { friendId: userId, status: 'pending' },
            include: [{ model: User, as: 'user' }],
        });

        return requests.map(r => ({
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
        }));
    }
}
