import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/expenses')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateExpenseDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('trip/:tripId')
  findAll(@Req() req, @Param('tripId') tripId: number) {
    return this.service.findAll(req.user.id, tripId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: number) {
    return this.service.findOne(req.user.id, id);
  }

  @Patch(':id/settle/:userId')
  settle( @Req() req, @Param('id') expenseId: number, @Param('userId') splitUserId: number ) {
    return this.service.settleSplit(
      req.user.id,
      expenseId,
      splitUserId,
    );
  }

  @Get('trip/:tripId/balances')
  balances(@Req() req, @Param('tripId') tripId: number) {
    return this.service.getBalances(req.user.id, tripId);
  }
}