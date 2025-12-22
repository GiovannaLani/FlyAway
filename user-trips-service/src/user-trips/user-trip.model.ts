import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Trip } from '../trips/trip.model';

@Table({ tableName: 'user_trips', timestamps: true })
export class UserTrip extends Model {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare userId: number;

  @ForeignKey(() => Trip)
  @Column(DataType.INTEGER)
  declare tripId: number;

  @Column(DataType.STRING)
  declare role: 'admin' | 'member';

  @BelongsTo(() => User, { as: 'user' })
  declare user: User;

  @BelongsTo(() => Trip, { as: 'trip' })
  declare trip: Trip;
}
