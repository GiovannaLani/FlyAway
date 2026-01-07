import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Trip } from '../trips/trip.model';
import { ExpenseSplit } from './expense-split.model';

@Table({ tableName: 'expenses', timestamps: true })
export class Expense extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare amount: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare originalAmount: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare currency: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  declare paidByUserId: number;

  @BelongsTo(() => User, 'paidByUserId')
  declare paidBy: User;

  @ForeignKey(() => Trip)
  @Column({ allowNull: false })
  declare tripId: number;

  @BelongsTo(() => Trip)
  declare trip: Trip;

  @HasMany(() => ExpenseSplit)
  declare splits: ExpenseSplit[];
}