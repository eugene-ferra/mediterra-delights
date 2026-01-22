import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { ReviewEntity } from '../entities/review-entity.type';
import { ReviewsService } from '../services/review.service';
import { FindManyReviewsQueryDto } from '../dto/find-many-reviews.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { ModerateReviewDto } from '../dto/moderate-review.dto';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/')
  async getAllReviews(
    @Query() query: FindManyReviewsQueryDto,
  ): Promise<ReviewEntity[]> {
    return await this.reviewsService.findMany(query);
  }

  @Patch('/:id/moderate')
  async moderateReview(
    @Param('id') id: string,
    @Body() data: ModerateReviewDto,
  ): Promise<{ moderated: true }> {
    await this.reviewsService.moderateReview(id, data.status);
    return { moderated: true };
  }
}
