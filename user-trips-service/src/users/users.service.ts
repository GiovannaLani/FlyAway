import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private authService: AuthService
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
}
