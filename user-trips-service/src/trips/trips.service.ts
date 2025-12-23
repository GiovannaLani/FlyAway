import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './trip.model';
import { User } from 'src/users/user.model';
import { UserTrip } from 'src/user-trips/user-trip.model';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class TripsService {
    constructor(
        @InjectModel(Trip) private tripModel: typeof Trip,
        @InjectModel(UserTrip) private userTripModel: typeof UserTrip,
        @InjectModel(User) private userModel: typeof User
    ) {}

    async createTrip(userId: number, dto: CreateTripDto, file?: Express.Multer.File) {
        let imageUrl: string | undefined;

        if (file) {
            const uploadDir = path.join(__dirname, '../../uploads');

            if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
            }

            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadDir, filename);

            fs.writeFileSync(filePath, file.buffer);

            imageUrl = `/uploads/${filename}`;
        }

        const trip = await this.tripModel.create({
            ...dto,
            imageUrl,
        });

        await this.userTripModel.create({
            userId,
            tripId: trip.id,
            role: 'admin',
        });

        if (dto.participants?.length) {
            for (const email of dto.participants) {
                const user = await this.userModel.findOne({ where: { email } });
                if (!user) continue;

                const exists = await this.userTripModel.findOne({
                where: { userId: user.id, tripId: trip.id }
                });
                if (exists) continue;

                await this.userTripModel.create({
                userId: user.id,
                tripId: trip.id,
                role: 'member'
                });
            }
        }

        return trip;
    }

    async getUserTrips(userId: number) {
        const relations = await this.userTripModel.findAll({
            where: { userId },
            include: [{ model: Trip, as: 'trip' }],
        });

        return relations.map(r => r.trip);
    }

    async getTripById(userId: number, tripId: number) {
        const relation = await this.userTripModel.findOne({
            where: { userId, tripId },
            include: [{ model: Trip }],
        });

        if (!relation)
        throw new NotFoundException('Trip not found or not allowed');

        return relation.trip;
    }

    async updateTrip(
        userId: number,
        tripId: number,
        dto: UpdateTripDto
    ) {
        const relation = await this.userTripModel.findOne({
            where: { userId, tripId, role: 'admin' },
            include: [{ model: Trip }],
        });

        if (!relation)
        throw new ForbiddenException('Only admins can edit the trip');

        await relation.trip.update(dto);

        return relation.trip;
    }

    async deleteTrip(userId: number, tripId: number) {
        const relation = await this.userTripModel.findOne({
            where: { userId, tripId, role: 'admin' }
        });

        if (!relation)
        throw new ForbiddenException('Only admins can delete the trip');

        await this.tripModel.destroy({ where: { id: tripId } });

        return { message: 'Trip deleted' };
    }

    async addParticipant(
        userId: number,
        tripId: number,
        email: string
    ) {
        const isAdmin = await this.userTripModel.findOne({
            where: { userId, tripId, role: 'admin' }
        });

        if (!isAdmin)
        throw new ForbiddenException('Only admins can add participants');

        const user = await this.userModel.findOne({ where: { email } });
        if (!user)
        throw new NotFoundException('User not found');

        const exists = await this.userTripModel.findOne({
            where: { userId: user.id, tripId }
        });

        if (exists)
        throw new BadRequestException('User already in trip');

        await this.userTripModel.create({
            userId: user.id,
            tripId,
            role: 'member'
        });

        return { message: 'Participant added' };
    }

    async removeParticipant(
        adminId: number,
        tripId: number,
        userId: number
    ) {
        const isAdmin = await this.userTripModel.findOne({
            where: { userId: adminId, tripId, role: 'admin' }
        });

        if (!isAdmin)
        throw new ForbiddenException('Only admins can remove participants');

        if (adminId === userId)
        throw new BadRequestException('Admin cannot remove themselves');

        const removed = await this.userTripModel.destroy({
            where: { userId, tripId }
        });

        if (!removed)
        throw new NotFoundException('Participant not found');

        return { message: 'Participant removed' };
    }

    async changeRole(
        adminId: number,
        tripId: number,
        userId: number,
        role: 'admin' | 'member'
    ) {
        if (!['admin', 'member'].includes(role))
        throw new BadRequestException('Invalid role');

        const isAdmin = await this.userTripModel.findOne({
            where: { userId: adminId, tripId, role: 'admin' }
        });

        if (!isAdmin)
        throw new ForbiddenException('Only admins can change roles');

        if (adminId === userId && role === 'member')
        throw new BadRequestException('Admin cannot demote themselves');

        const relation = await this.userTripModel.findOne({
            where: { userId, tripId }
        });

        if (!relation)
        throw new NotFoundException('User not part of trip');

        relation.role = role;
        await relation.save();

        return { message: 'Role updated' };
    }

    async getParticipants(userId: number, tripId: number) {
        const allowed = await this.userTripModel.findOne({
            where: { userId, tripId }
        });

        if (!allowed)
        throw new ForbiddenException('Not allowed');

        const participants = await this.userTripModel.findAll({
            where: { tripId },
            include: [{ model: User }],
        });

        return participants.map(p => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            role: p.role
        }));
    }
}
