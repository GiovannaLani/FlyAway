import { Controller,Get,Post,Patch,Delete,Param,Body,Req,UploadedFiles,UseInterceptors,UseGuards } from '@nestjs/common';
import { ApiBearerAuth,ApiConsumes,ApiOperation,ApiTags,ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ItineraryService } from './itinerary.service';
import { CreateDayDto } from './dto/create-day.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateDayDto } from './dto/update-day.dto';
import { RemoveImageDto } from './dto/remove-image.dto';

@ApiTags('Itinerary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/itinerary')
export class ItineraryController {

  constructor(private readonly service: ItineraryService) {}

  @Get('trips/:tripId/itinerary')
  @ApiOperation({ summary: 'Get full itinerary (days + activities)' })
  getItinerary(@Req() req, @Param('tripId') tripId: number) {
    return this.service.getItinerary(req.user.id, tripId);
  }

  @Post('trips/:tripId/days')
  @ApiOperation({ summary: 'Create a day in a trip' })
  createDay(@Req() req, @Param('tripId') tripId: number, @Body() dto: CreateDayDto) {
    return this.service.createDay(req.user.id, tripId, dto);
  }

  @Delete('days/:dayId')
  @ApiOperation({ summary: 'Delete a day and its activities' })
  deleteDay(@Req() req, @Param('dayId') dayId: number) {
    return this.service.deleteDay(req.user.id, dayId);
  }

  @Patch('days/:dayId')
  @ApiOperation({ summary: 'Update day (destination, etc)' })
  updateDay(@Req() req, @Param('dayId') dayId: number, @Body() dto: UpdateDayDto) {
    return this.service.updateDay(req.user.id, dayId, dto);
  }

  @Post('days/:dayId/activities')
  @ApiOperation({ summary: 'Create activity in a day' })
  createActivity( @Req() req, @Param('dayId') dayId: number, @Body() dto: CreateActivityDto) {
    return this.service.createActivity(req.user.id, dayId, dto);
  }

  @Patch('activities/:id')
  @ApiOperation({ summary: 'Update activity' })
  updateActivity( @Req() req, @Param('id') id: number, @Body() dto: UpdateActivityDto ) {
    return this.service.updateActivity(req.user.id, id, dto);
  }

  @Delete('activities/:id')
  @ApiOperation({ summary: 'Delete activity' })
  deleteActivity(@Req() req, @Param('id') id: number) {
    return this.service.deleteActivity(req.user.id, id);
  }

  @Post('activities/:id/images')
  @ApiOperation({ summary: 'Upload images for an activity' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  uploadImages(@Req() req, @Param('id') id: number, @UploadedFiles() files: Express.Multer.File[] ) {
    return this.service.addImages(req.user.id, id, files);
  }

  @Delete('activities/:id/images')
  @ApiOperation({ summary: 'Delete image from activity' })
  @ApiBody({ type: RemoveImageDto })
  deleteImage( @Req() req, @Param('id') id: number, @Body() dto: RemoveImageDto ) {
    return this.service.removeImage(req.user.id, id, dto.url);
  }
  
}