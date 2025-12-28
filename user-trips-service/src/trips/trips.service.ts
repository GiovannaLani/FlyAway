import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './trip.model';
import { User } from 'src/users/user.model';
import { UserTrip } from 'src/user-trips/user-trip.model';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import path, { join } from 'path';
import * as fs from 'fs';
import { TripDay } from 'src/itinerary/trip-day.model';
import { Sequelize } from 'sequelize-typescript/dist/sequelize/sequelize/sequelize';
import { Activity } from 'src/itinerary/activity.model';


@Injectable()
export class TripsService {
    constructor(
        @InjectModel(Trip) private tripModel: typeof Trip,
        @InjectModel(UserTrip) private userTripModel: typeof UserTrip,
        @InjectModel(User) private userModel: typeof User,
        @InjectModel(TripDay) private dayModel: typeof TripDay,
        @InjectModel(Activity) private activityModel: typeof Activity,
        private readonly sequelize: Sequelize
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

        const dates = this.generateDates(dto.startDate!, dto.endDate);

        for (const date of dates) {
            await this.dayModel.create({
            tripId: trip.id,
            date,
            });
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
        const userTrip = await this.userTripModel.findOne({
            where: { userId, tripId },
            include: [{ model: Trip }],
        });

        if (!userTrip)
        throw new NotFoundException('Trip not found or not allowed');

        const trip = userTrip.trip;

        return {
            id: trip.id,
            name: trip.name,
            description: trip.description,
            imageUrl: trip.imageUrl,
            isPublic: trip.isPublic,
            startDate: trip.startDate,
            role: userTrip.role
        };
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
        return this.sequelize.transaction(async (t) => {

            const rel = await this.userTripModel.findOne({
            where: { userId, tripId },
            include: [{ model: Trip }],
            transaction: t,
            });

            if (!rel || rel.role !== 'admin') {
            throw new ForbiddenException();
            }

            if (rel.trip.imageUrl) {
            const path = join(__dirname, '../../', rel.trip.imageUrl);
            if (fs.existsSync(path)) fs.unlinkSync(path);
            }

            const days = await this.dayModel.findAll({
            where: { tripId },
            transaction: t,
            });

            const dayIds = days.map(d => d.id);

            if (dayIds.length > 0) {
            await this.activityModel.destroy({
                where: { tripDayId: dayIds },
                transaction: t,
            });
            }

            await this.dayModel.destroy({
            where: { tripId },
            transaction: t,
            });

            await this.userTripModel.destroy({
            where: { tripId },
            transaction: t,
            });

            await this.tripModel.destroy({
            where: { id: tripId },
            transaction: t,
            });

            return { success: true };
        });
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

    generateDates(start: string, end?: string): string[] {
        const dates: string[] = [];

        const current = new Date(start);
        const last = end ? new Date(end) : new Date(start);

        while (current <= last) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    async updateStartDate(userId: number, tripId: number, newStartDate: string,) {

        const days = await this.dayModel.findAll({ where: { tripId }, order: [['date', 'ASC']],});

        if (!days.length) return;

        const oldStart = new Date(days[0].date);
        const newStart = new Date(newStartDate);

        const diffDays = Math.round((newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24),);

        for (let i = 0; i < days.length; i++) {
            const date = new Date(days[i].date);
            date.setDate(date.getDate() + diffDays);

            await days[i].update({date: date.toISOString().split('T')[0],});
        }

        await this.tripModel.update({ startDate: newStartDate }, { where: { id: tripId } },);
    }

    async updateTripImage( userId: number, tripId: number, file: Express.Multer.File ) {
        const rel = await this.userTripModel.findOne({where: { userId, tripId },});

        if (!rel || rel.role !== 'admin') {
            throw new ForbiddenException('No tienes permisos');
        }

        const trip = await this.tripModel.findByPk(tripId);
        if (!trip) throw new NotFoundException('Trip not found');

        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (trip.imageUrl) {
            const oldPath = path.join(__dirname,'../../',trip.imageUrl.replace(/^\//, ''),);

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);

        const imageUrl = `/uploads/${filename}`;

        await trip.update({ imageUrl });

        return { imageUrl };
    }

}
