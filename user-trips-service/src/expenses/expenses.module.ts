import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './expense.model';
import { ExpenseSplit } from './expense-split.model';
import { UserTrip } from '../user-trips/user-trip.model';
import { TripsModule } from '../trips/trips.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SequelizeModule.forFeature([Expense, ExpenseSplit, UserTrip]), forwardRef(() => TripsModule), forwardRef(() => UsersModule), AuthModule],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}