import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/expenses')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({ type: CreateExpenseDto })
  create(@Req() req, @Body() dto: CreateExpenseDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get all expenses for a trip' })
  findAll(@Req() req, @Param('tripId') tripId: number) {
    return this.service.findAll(req.user.id, tripId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Req() req, @Param('id') id: number) {
    return this.service.findOne(req.user.id, id);
  }

  @Patch(':id/settle/:userId')
  @ApiOperation({ summary: 'Settle a split for an expense' })
  settle( @Req() req, @Param('id') expenseId: number, @Param('userId') splitUserId: number ) {
    return this.service.settleSplit( req.user.id, expenseId, splitUserId );
  }

  @Get('trip/:tripId/balances')
  @ApiOperation({ summary: 'Get balances for all users in a trip' })
  balances(@Req() req, @Param('tripId') tripId: number) {
    return this.service.getBalances(req.user.id, tripId);
  }
}