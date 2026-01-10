import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Expense } from './expense.model';
import { ExpenseSplit } from './expense-split.model';
import { UserTrip } from '../user-trips/user-trip.model';
import { User } from '../users/user.model';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense) private expenseModel: typeof Expense,
        @InjectModel(ExpenseSplit) private splitModel: typeof ExpenseSplit,
        @InjectModel(UserTrip) private userTripModel: typeof UserTrip,
    ) {}

    async create(userId: number, dto: CreateExpenseDto) {
        console.log('Creating expense with DTO:', dto);
        const rel = await this.userTripModel.findOne({where: { userId, tripId: dto.tripId }});
        if (!rel) throw new ForbiddenException();

        const expense = await this.expenseModel.create({
            name: dto.name,
            currency: dto.currency,
            amount: dto.amount,
            tripId: dto.tripId,
            paidByUserId: userId,
        });

        if (dto.splitType === 'EQUAL') {
            console.log('Splitting expense equally among users');
            const users = await this.userTripModel.findAll({ where: { tripId: dto.tripId } });
            const perUser = dto.amount / users.length;

            for (const u of users) {
                await this.splitModel.create({ expenseId: expense.id, userId: u.userId, amount: perUser });
                if(u.userId === userId){
                    const split = await this.splitModel.findOne({ where: { expenseId: expense.id, userId: u.userId } });
                    if (split) {
                        split.settled = true;
                        await split.save();
                    }
                }
            }
        } else {
            if (!dto.splits || dto.splits.length === 0) {
                throw new BadRequestException('Splits son requeridos');
            }
            const total = dto.splits.reduce((s, x) => s + x.amount, 0);
            if (Math.abs(total - dto.amount) > 0.01) {
                throw new BadRequestException('La suma de splits no coincide');
            }

            for (const s of dto.splits) {
                await this.splitModel.create({ expenseId: expense.id, userId: s.userId, amount: s.amount, settled: s.userId === userId });
            }
        }

        return this.findOne(userId, expense.id);
    }

    async findAll(userId: number, tripId: number) {
        const rel = await this.userTripModel.findOne({ where: { userId, tripId } });
        if (!rel) throw new ForbiddenException();

        return this.expenseModel.findAll({
            where: { tripId },
            include: [
                { association: 'paidBy' },
                { model: ExpenseSplit, include: ['user'] },
            ],
            order: [['createdAt', 'ASC']],
        });
    }

    async findOne(userId: number, id: number) {
        const expense = await this.expenseModel.findByPk(id, {
        include: [ { association: 'paidBy' }, { model: ExpenseSplit, include: ['user'] }]});
        if (!expense) throw new NotFoundException();

        const rel = await this.userTripModel.findOne({ where: { userId, tripId: expense.tripId } });
        if (!rel) throw new ForbiddenException();

        return expense;
    }

    async settleSplit(userId: number, expenseId: number, splitUserId: number) {
        const expense = await this.expenseModel.findByPk(expenseId);
        if (!expense) throw new NotFoundException();

        if (expense.paidByUserId !== userId) {
            throw new ForbiddenException();
        }

        const split = await this.splitModel.findOne({ where: { expenseId, userId: splitUserId }});
        if (!split) throw new NotFoundException();
        split.settled = true;
        await split.save();
        return split;
    }

    async getBalances(userId: number, tripId: number) {
        const rel = await this.userTripModel.findOne({ where: { userId, tripId } });
        if (!rel) throw new ForbiddenException();

        const users = await this.userTripModel.findAll({ where: { tripId }, include: [{ model: User, attributes: ['id', 'name'] }]});

        const expenses = await this.expenseModel.findAll({
            where: { tripId },
            include: [
            {
                model: ExpenseSplit,
                as: 'splits',
                include: [{ model: User, attributes: ['id', 'name'] }],
            },
            ],
        });

        const balances: { userId: number; name: string; balance: number }[] = [];

        for (const u of users) {
            let balance = 0;

            for (const expense of expenses) {
                if (expense.paidByUserId === u.userId) {
                    for (const split of expense.splits) {
                        if (
                            split.userId !== u.userId &&
                            split.settled === false
                        ) {
                            balance += split.amount;
                        }
                    }
                }

                if (expense.paidByUserId !== u.userId) {
                    const mySplit = expense.splits.find( (s) => s.userId === u.userId );

                    if (mySplit && mySplit.settled === false) {
                        balance -= mySplit.amount;
                    }
                }
            }

            balances.push({ userId: u.userId, name: u.user.name, balance });
        }
        return balances;
    }

}