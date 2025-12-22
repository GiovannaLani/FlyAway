import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { UserTrip } from '../user-trips/user-trip.model';

@Table({ tableName: 'trips', timestamps: true })
export class Trip extends Model {
    
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column(DataType.TEXT)
    declare description: string;

    @Column(DataType.DATE)
    declare startDate: Date;

    @Column(DataType.DATE)
    declare endDate: Date;

    @Column
    declare imageUrl: string;

    @HasMany(() => UserTrip, { as: 'userTrips' })
    declare userTrips: UserTrip[];
}