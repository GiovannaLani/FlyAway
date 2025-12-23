import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { Trip } from 'src/trips/trip.model';
import { UserTrip } from 'src/user-trips/user-trip.model';
import { Friendship } from './friendship.model';

@Module({
  imports: [SequelizeModule.forFeature([User]), 
    SequelizeModule.forFeature([Friendship]),
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([User, UserTrip, Trip]),],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
