import { Module } from '@nestjs/common';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripDay } from './trip-day.model';
import { Activity } from './activity.model';
import { UserTrip } from 'src/user-trips/user-trip.model';
import { Trip } from 'src/trips/trip.model';

@Module({
  imports: [SequelizeModule.forFeature([TripDay, Activity, Trip, UserTrip])],
  controllers: [ItineraryController],
  providers: [ItineraryService]
})
export class ItineraryModule {}
