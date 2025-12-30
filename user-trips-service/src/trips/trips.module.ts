import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Trip } from './trip.model';
import { UserTrip } from '../user-trips/user-trip.model';
import { User } from '../users/user.model';
import { TripDay } from 'src/itinerary/trip-day.model';
import { Activity } from 'src/itinerary/activity.model';
import { Friendship } from 'src/users/friendship.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Trip, UserTrip, User, TripDay, Activity, Friendship]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}