import { BadRequestException, Injectable } from '@nestjs/common';
import { ReviewsRepository } from './data/review-data.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './types/review-entity.type';
import { ReviewRecord } from './data/types/review-record.type';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewRepo: ReviewsRepository) {}

  private toEntity(record: ReviewRecord): ReviewEntity {
    return {
      id: record.id,
      productId: record.productId,
      userId: record.userId,
      review: record.review,
      rating: record.rating,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async add(data: CreateReviewDto & { userId: string }): Promise<ReviewEntity> {
    const reviewRecord = await this.reviewRepo.create({
      productId: data.productId,
      userId: data.userId,
      review: data.review,
      rating: data.rating,
    });

    return this.toEntity(reviewRecord);
  }

  async update(id: string, data: UpdateReviewDto): Promise<ReviewEntity> {
    const updatedRecord = await this.reviewRepo.updateById(id, {
      review: data.review,
      rating: data.rating,
    });

    if (!updatedRecord) {
      throw new BadRequestException('Review not found');
    }

    return this.toEntity(updatedRecord);
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepo.deleteById(id);
  }
}
