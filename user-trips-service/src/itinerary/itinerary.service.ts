import {ForbiddenException, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TripDay } from './trip-day.model';
import { Activity } from './activity.model';
import { Trip } from '../trips/trip.model';
import { UserTrip } from '../user-trips/user-trip.model';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateDayDto } from './dto/update-day.dto';

export class ItineraryService {
  constructor(
    @InjectModel(TripDay) private dayModel: typeof TripDay,
    @InjectModel(Activity) private activityModel: typeof Activity,
    @InjectModel(Trip) private tripModel: typeof Trip,
    @InjectModel(UserTrip) private userTripModel: typeof UserTrip,
  ) {}

  async checkAccess(userId: number, tripId: number) {
    const rel = await this.userTripModel.findOne({where: { userId, tripId }});
    if (!rel) throw new ForbiddenException();
    return rel;
  }

  async getItinerary(userId: number, tripId: number) {

    return this.dayModel.findAll({
        where: { tripId },
        order: [['date', 'ASC']],
        include: [{model: Activity, as: 'activities', order: [['startTime', 'ASC']]}]
    });
  }

  async createDay(userId: number, tripId: number, dto: any) {
    await this.checkAccess(userId, tripId);
    return this.dayModel.create({tripId, date: dto.date, destination: dto.destination});
  }

  async deleteDay(userId: number, dayId: number) {
    const day = await this.dayModel.findByPk(dayId);
    if (!day) throw new NotFoundException();

    await this.checkAccess(userId, day.tripId);
    await this.activityModel.destroy({ where: { tripDayId: dayId } });
    await day.destroy();
  }

  async updateDay(userId: number, dayId: number, dto: UpdateDayDto) {
    const day = await this.dayModel.findByPk(dayId);

    if (!day) {
      throw new NotFoundException('Day not found');
    }

    await this.checkAccess(userId, day.tripId);
    await day.update({destination: dto.destination});

    return day;
  }

  async createActivity(userId: number, dayId: number, dto: any) {
    const day = await this.dayModel.findByPk(dayId);
    if (!day) throw new NotFoundException();

    await this.checkAccess(userId, day.tripId);

    return this.activityModel.create({tripDayId: dayId,...dto});
  }

  async updateActivity(userId: number, id: number, dto: any) {
    const activity = await this.activityModel.findByPk(id);
    if (!activity) throw new NotFoundException();

    const day = await this.dayModel.findByPk(activity.tripDayId);
    if (!day) throw new NotFoundException();
    await this.checkAccess(userId, day.tripId);

    return activity.update(dto);
  }

  async deleteActivity(userId: number, id: number) {
    const activity = await this.activityModel.findByPk(id);
    if (!activity) throw new NotFoundException();

    const day = await this.dayModel.findByPk(activity.tripDayId);
    if (!day) throw new NotFoundException();
    await this.checkAccess(userId, day.tripId);

    await activity.destroy();
  }

  async addImages(userId: number, activityId: number, files: Express.Multer.File[]) {
    const activity = await this.activityModel.findByPk(activityId);
    if (!activity) throw new NotFoundException();

    const day = await this.dayModel.findByPk(activity.tripDayId);
    if (!day) throw new NotFoundException();
    await this.checkAccess(userId, day.tripId);

    const uploadDir = path.join(__dirname, '../../uploads/activities');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const urls = files.map(file => {
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      return `/uploads/activities/${filename}`;
    });

    const images = [...(activity.images ?? []), ...urls];
    return activity.update({ images });
  }

  async removeImage(userId: number, activityId: number, imageUrl: string) {
    const activity = await this.activityModel.findByPk(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    const day = await this.dayModel.findByPk(activity.tripDayId);
    if (!day) throw new NotFoundException();

    await this.checkAccess(userId, day.tripId);

    const images = activity.images ?? [];
    if (!images.includes(imageUrl)) {
      throw new NotFoundException('Image not found');
    }

    const updatedImages = images.filter(img => img !== imageUrl);
    const filePath = path.join(__dirname,'../../',imageUrl.replace(/^\//, ''),);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return activity.update({ images: updatedImages });
  }

}