import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewsRepository } from '../repositories/review.repository';

import { ReviewEntity } from '../entities/review-entity.type';
import { ProductsService } from 'src/catalog/products/products.service';
import { UsersService } from 'src/users/users.service';
import { ReviewStatus } from '../types/review-status.enum';
import { FindManyReviewsQueryDto } from '../dto/find-many-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepo: ReviewsRepository,
    private readonly productService: ProductsService,
    private readonly userService: UsersService,
  ) {}

  async create(
    data: CreateReviewDto & { userId: string },
  ): Promise<ReviewEntity> {
    if (!(await this.productService.exists(data.productId))) {
      throw new UnprocessableEntityException(
        'Cannot add review: this product does not exist',
      );
    }

    if (!(await this.userService.isExist(data.userId))) {
      throw new UnprocessableEntityException(
        'Cannot add review: this user does not exist',
      );
    }

    const createdRecord = await this.reviewRepo.create({
      productId: data.productId,
      userId: data.userId,
      review: data.review,
      rating: data.rating,
      status: ReviewStatus.PENDING,
    });

    return createdRecord;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateReviewDto,
  ): Promise<{ updated: true }> {
    const existing = await this.reviewRepo.findById(id);

    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    if (existing.user.id !== userId) {
      throw new ForbiddenException(
        'Cannot update review: you are not the author of this review',
      );
    }

    const updatedRecord = await this.reviewRepo.updateById(id, {
      review: data.review,
      rating: data.rating,
      status: ReviewStatus.PENDING,
    });

    if (!updatedRecord) throw new NotFoundException('Review not found');

    await this.updateProductStats(updatedRecord.product.id as string);

    return { updated: true };
  }

  async moderateReview(
    id: string,
    status: ReviewStatus.APPROVED | ReviewStatus.REJECTED,
  ): Promise<{ updated: true }> {
    const updatedRecord = await this.reviewRepo.updateById(id, { status });

    if (!updatedRecord) throw new NotFoundException('Review not found');

    await this.updateProductStats(updatedRecord.product.id as string);

    return { updated: true };
  }

  async delete(id: string, userId: string): Promise<{ deleted: true }> {
    const existing = await this.reviewRepo.findById(id);

    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    if (existing.user.id !== userId) {
      throw new ForbiddenException(
        'Cannot delete review: you are not the author of this review',
      );
    }

    const deleted = await this.reviewRepo.deleteById(id);

    if (!deleted) throw new NotFoundException('Review not found');

    await this.updateProductStats(deleted.product.id as string);

    return { deleted: true };
  }

  async findMany(query: FindManyReviewsQueryDto): Promise<ReviewEntity[]> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const sortDir: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

    const sortFieldMap = {
      createdAt: 'createdAt',
      rating: 'rating',
    };

    const sortField = sortFieldMap[sortBy];

    const match: Record<string, any> = {};

    if (query.productId) {
      match.productId = query.productId;
    }

    const reviews = await this.reviewRepo.find({
      match,
      sort: { [sortField]: sortDir },
      page,
      limit,
    });

    return reviews.docs;
  }

  private async updateProductStats(productId: string): Promise<void> {
    const productExists = await this.productService.exists(productId);

    if (productExists) {
      const stats = await this.reviewRepo.calcStatsForProduct(productId);
      const avgRating = stats ? stats.avgRating : 0;
      const reviewCount = stats ? stats.reviewCount : 0;

      await this.productService.updateStats(productId, avgRating, reviewCount);
    }
  }
}
