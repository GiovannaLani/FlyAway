import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { UserTrip } from '../user-trips/user-trip.model';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare password: string;

    @HasMany(() => UserTrip, { as: 'userTrips' })
    declare userTrips: UserTrip[];

    @Column({ type: DataType.STRING, allowNull: true })
    declare avatarUrl?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare bio?: string;

    @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'local' })
    declare provider: 'local' | 'google';
}