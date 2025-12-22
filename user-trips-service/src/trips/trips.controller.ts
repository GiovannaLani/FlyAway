import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new trip' })
    @ApiBody({ type: CreateTripDto })
    create(@Req() req, @Body() dto: CreateTripDto) {
        return this.tripsService.createTrip(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all trips for the authenticated user' })
    getAll(@Req() req) {
        return this.tripsService.getUserTrips(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific trip by ID' })
    getOne(@Req() req, @Param('id') id: number) {
        return this.tripsService.getTripById(req.user.id, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a specific trip by ID' })
    @ApiBody({ type: UpdateTripDto })
    update(
        @Req() req,
        @Param('id') id: number,
        @Body() dto: UpdateTripDto
    ) {
        return this.tripsService.updateTrip(req.user.id, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a specific trip by ID' })
    delete(@Req() req, @Param('id') id: number) {
        return this.tripsService.deleteTrip(req.user.id, id);
    }

    @Post(':id/participants')
    @ApiOperation({ summary: 'Add a participant to a trip' })
    @ApiBody({ type: AddParticipantDto })
    addParticipant(
        @Req() req,
        @Param('id') id: number,
        @Body() dto: AddParticipantDto
    ) {
        return this.tripsService.addParticipant(req.user.id, id, dto.email);
    }

    @Delete(':id/participants/:userId')
    @ApiOperation({ summary: 'Remove a participant from a trip' })
    removeParticipant(
        @Req() req,
        @Param('id') id: number,
        @Param('userId') userId: number
    ) {
        return this.tripsService.removeParticipant(req.user.id, id, userId);
    }

    @Patch(':id/participants/:userId/role')
    @ApiOperation({ summary: 'Change a participant\'s role in a trip' })
    @ApiBody({ schema: { properties: { role: { type: 'string', enum: ['admin', 'member'] } } } })
    changeRole(
        @Req() req,
        @Param('id') id: number,
        @Param('userId') userId: number,
        @Body('role') role: 'admin' | 'member'
    ) {
        return this.tripsService.changeRole(req.user.id, id, userId, role);
    }

    @Get(':id/participants')
        @ApiOperation({ summary: 'Get all participants of a trip' })
    getParticipants(@Req() req, @Param('id') id: number) {
        return this.tripsService.getParticipants(req.user.id, id);
    }
}
