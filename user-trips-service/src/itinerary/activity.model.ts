import {Table, Column, Model, ForeignKey, DataType, BelongsTo,} from 'sequelize-typescript';
import { TripDay } from './trip-day.model';

@Table({ tableName: 'activities', timestamps: true })
export class Activity extends Model {
    @ForeignKey(() => TripDay)
    @Column
    declare tripDayId: number;

    @BelongsTo(() => TripDay, { as: 'day' })
    day: TripDay;

    @Column({ allowNull: false })
    declare name: string;

    @Column({ allowNull: true })
    declare place?: string;

    @Column({ type: DataType.TIME, allowNull: true })
    declare startTime?: string;

    @Column({ type: DataType.TIME, allowNull: true })
    declare endTime?: string;

    @Column({ type: DataType.DECIMAL, allowNull: true })
    declare price?: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description?: string;

    @Column({ type: DataType.JSON, allowNull: true })
    declare images?: string[];
}