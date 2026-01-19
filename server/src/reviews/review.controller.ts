import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ReviewsService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity } from './types/review-entity.type';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { AccessTokenPayload } from 'src/common/types/access-token-payload.type';

@Controller('reviews')
@UseGuards(AuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @User() user: AccessTokenPayload,
  ): Promise<ReviewEntity> {
    return this.reviewsService.add({
      ...dto,
      userId: user.sub,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reviewsService.delete(id);
  }
}
