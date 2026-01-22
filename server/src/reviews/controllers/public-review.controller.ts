import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReviewEntity } from '../entities/review-entity.type';
import { ReviewsService } from '../services/review.service';
import { FindManyReviewsQueryDto } from '../dto/find-many-reviews.dto';

@Controller('/reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/')
  async getAllReviews(
    @Query() query: FindManyReviewsQueryDto,
  ): Promise<ReviewEntity[]> {
    return await this.reviewsService.findMany(query);
  }
}
