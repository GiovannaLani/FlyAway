import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Expense } from './expense.model';
import { User } from '../users/user.model';

@Table({ tableName: 'expense_splits', timestamps: false })
export class ExpenseSplit extends Model {
  @ForeignKey(() => Expense)
  @Column({ allowNull: false })
  declare expenseId: number;

  @BelongsTo(() => Expense)
  declare expense: Expense;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare amount: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare settled: boolean;
}