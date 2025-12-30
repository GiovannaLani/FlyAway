import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from 'bcryptjs';
import { User } from "src/users/user.model";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User
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

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { token: token};
  }

  generateToken(user: { id?: number; email: string }) {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }

  async googleLogin(googleUser: { email: string; name: string; avatarUrl?: string}) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.createGoogleUser({
        name: googleUser.name,
        email: googleUser.email
      });
    }

    return { token: this.generateToken(user) };
  }
}