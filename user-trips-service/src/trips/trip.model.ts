import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { UserTrip } from '../user-trips/user-trip.model';
import { TripDay } from 'src/itinerary/trip-day.model';

@Table({ tableName: 'trips', timestamps: true })
export class Trip extends Model {
    
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column(DataType.TEXT)
    declare description: string;

    @Column({type: DataType.DATE,  allowNull: false })
    declare startDate: Date;

    @Column
    declare imageUrl: string;

    @HasMany(() => UserTrip, { as: 'userTrips' })
    declare userTrips: UserTrip[];

    @HasMany(() => TripDay)
    declare days: TripDay[];

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    declare isPublic: boolean;
}