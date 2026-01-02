import {Table, Column, Model, ForeignKey, HasMany,DataType} from 'sequelize-typescript';
import { Trip } from '../trips/trip.model';
import { Activity } from './activity.model';

@Table({ tableName: 'trip_days', timestamps: true })
export class TripDay extends Model {
    @ForeignKey(() => Trip)
    @Column
    declare tripId: number;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    declare date: string;

    @Column({ allowNull: true })
    declare destinationPlaceId?: string;

    @Column({ allowNull: true })
    declare destinationName?: string;

    @HasMany(() => Activity, { as: 'activities' })
    declare activities: Activity[];
}