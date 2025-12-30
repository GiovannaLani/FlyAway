import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { AuthService } from '../auth/auth.service';
import { Friendship } from './friendship.model';
import { Op } from 'sequelize';
import { UserTrip } from 'src/user-trips/user-trip.model';
import { Trip } from 'src/trips/trip.model';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(
      @InjectModel(User) private userModel: typeof User,
      private authService: AuthService,
      @InjectModel(Friendship) private friendshipModel: typeof Friendship,
      @InjectModel(Trip) private tripModel: typeof Trip,
      @InjectModel(UserTrip) private userTripModel: typeof UserTrip,
  ) {}

  async findById(id: number) {
    const user = await this.userModel.findByPk(id);
    return user;
  }

  async findByEmail(email: string) {
      return this.userModel.findOne({ where: { email } });
  }

  async createGoogleUser(data: { name: string; email: string; avatarUrl?: string }) {
    return this.userModel.create({
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      password: null,
      provider: 'google',
    });
  }

  async addFriend(userId: number, friendEmail: string) {
      const friend = await this.userModel.findOne({ where: { email: friendEmail } });
      if (!friend) throw new NotFoundException('User not found');

      if (friend.id === userId) throw new BadRequestException('Cannot add yourself');

      const exists = await this.friendshipModel.findOne({
        where: { userId, friendId: friend.id },
      });
      if (exists) throw new BadRequestException('Already friends');

      const friendship = await this.friendshipModel.create({ userId, friendId: friend.id, status: 'pending' });

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
        avatarUrl: friend.avatarUrl,
      };
    });
  }

  async respondToRequest(userId: number, friendId: number, accept: boolean) {
    const request = await this.friendshipModel.findOne({ where: { userId: friendId, friendId: userId, status: 'pending' }});

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
      avatarUrl: r.user.avatarUrl,
    }));
  }

  async sendFriendRequest(myId: number, userId: number) {
    if (myId === userId) {
    throw new BadRequestException('Cannot add yourself');
    }

    const target = await this.userModel.findByPk(userId);
    if (!target) throw new NotFoundException('User not found');

    const exists = await this.friendshipModel.findOne({
      where: {
        [Op.or]: [
          { userId: myId, friendId: userId },
          { userId: userId, friendId: myId },
        ],
      },
    });

    if (exists) {
      throw new BadRequestException('Friend request already exists');
    }

    return this.friendshipModel.create({
      userId: myId,
      friendId: userId,
      status: 'pending',
    });
  }

  async getUserProfile(viewerId: number, profileUserId: number) {
    const user = await this.userModel.findByPk(profileUserId);
    if (!user) throw new NotFoundException();

    if (viewerId === profileUserId) {
      const friendsCount = await this.friendshipModel.count({
        where: {
          status: 'accepted',
          [Op.or]: [
            { userId: profileUserId },
            { friendId: profileUserId },
          ],
        },
      });
      const pendingRequestsCount = await this.friendshipModel.count({
        where: {
          status: 'pending',
          friendId: profileUserId,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        friendsCount,
        friendStatus: 'me',
        pendingRequestsCount
      };
    }

    const friendsCount = await this.friendshipModel.count({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: profileUserId },
          { friendId: profileUserId },
        ],
      },
    });

    const friendship = await this.friendshipModel.findOne({
      where: {
        [Op.or]: [
          { userId: viewerId, friendId: profileUserId },
          { userId: profileUserId, friendId: viewerId },
        ],
      },
    });

    let friendStatus: 'none' | 'requested' | 'friend' = 'none';

    if (friendship) {
      friendStatus =
        friendship.status === 'accepted' ? 'friend' : 'requested';
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      friendsCount,
      friendStatus,
    };
  }


  async updateProfile( userId: number, data: { name?: string; bio?: string }) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException();

    await user.update({
      name: data.name ?? user.name,
      bio: data.bio ?? user.bio,
    });

    return user;
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException();

    const uploadDir = join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    if (user.avatarUrl) {
      const oldPath = join(__dirname, '../../', user.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await user.update({
      avatarUrl: `/uploads/avatars/${filename}`,
    });

    return { avatarUrl: user.avatarUrl };
  }

  async getUserTrips(viewerId: number, profileUserId: number) {
    const { Op } = require("sequelize");

    if (profileUserId === viewerId) {
      const myTrips = await this.tripModel.findAll({
        include: [
          { model: UserTrip, as: 'userTrips', where: { userId: profileUserId } }
        ],
      });
      return myTrips;
    }

    const friendship = await this.friendshipModel.findOne({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: viewerId, friendId: profileUserId },
          { userId: profileUserId, friendId: viewerId },
        ],
      },
    });

    const profilePrivateTrips = await this.tripModel.findAll({
      where: { isPublic: false },
      include: [{ model: UserTrip, as: 'userTrips' }]
    });

    const privateSharedTrips = profilePrivateTrips.filter(trip =>
      trip.userTrips.some((ut: any) => ut.userId === profileUserId) &&
      trip.userTrips.some((ut: any) => ut.userId === viewerId)
    );

    const publicTrips = await this.tripModel.findAll({
      where: { isPublic: true },
      include: [{ model: UserTrip, as: 'userTrips', where: { userId: profileUserId }, required: true }],
    });

    if (!friendship) {
      return privateSharedTrips;
    }

    const allTripsMap = new Map<number, any>();
    [...publicTrips, ...privateSharedTrips].forEach(trip => allTripsMap.set(trip.id, trip));

    return Array.from(allTripsMap.values());
  }

}
