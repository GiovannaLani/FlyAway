import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({ tableName: 'friendships', timestamps: true })
export class Friendship extends Model {
    @ForeignKey(() => User)
    @Column
    declare userId: number;

    @ForeignKey(() => User)
    @Column
    declare friendId: number;

    @Column({ defaultValue: 'accepted' })
    declare status: 'pending' | 'accepted' | 'rejected';

    @BelongsTo(() => User, 'userId')
    declare user: User;

    @BelongsTo(() => User, 'friendId')
    declare friend: User;
}