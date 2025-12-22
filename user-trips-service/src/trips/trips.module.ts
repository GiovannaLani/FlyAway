import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Trip } from './trip.model';
import { UserTrip } from '../user-trips/user-trip.model';
import { User } from '../users/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Trip, UserTrip, User]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}