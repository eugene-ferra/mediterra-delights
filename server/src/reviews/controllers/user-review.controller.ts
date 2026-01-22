import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewEntity } from '../entities/review-entity.type';
import { ReviewsService } from '../services/review.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateReviewDto } from '../dto/create-review.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AccessTokenPayload } from 'src/common/types/access-token-payload.type';
import { UpdateReviewDto } from '../dto/update-review.dto';

@UseGuards(AuthGuard)
@Controller('/reviews')
export class UserReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('/')
  async createReview(
    @Body() data: CreateReviewDto,
    @User() user: AccessTokenPayload,
  ): Promise<ReviewEntity> {
    return await this.reviewsService.create({ ...data, userId: user.sub });
  }

  @Patch('/:id')
  async updateReview(
    @Body() data: UpdateReviewDto,
    @User() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<{ updated: true }> {
    return await this.reviewsService.update(id, user.sub, data);
  }

  @Delete('/:id')
  async deleteReview(
    @Param('id') id: string,
    @User() user: AccessTokenPayload,
  ): Promise<{ deleted: true }> {
    await this.reviewsService.delete(id, user.sub);
    return { deleted: true };
  }
}
