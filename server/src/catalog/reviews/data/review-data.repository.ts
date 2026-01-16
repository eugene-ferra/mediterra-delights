import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Review, ReviewDocument } from './review.schema';
import {
  CreateReviewRecord,
  ReviewRecord,
  UpdateReviewRecord,
} from './types/review-record.type';
import {
  FindManyReviewsQuery,
  ReviewsSortKey,
  SortOrder,
} from './types/review-query.type';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  private toRecord(doc: ReviewDocument): ReviewRecord {
    return {
      id: String(doc._id),
      productId: String(doc.productId),
      userId: String(doc.userId),
      review: doc.review ?? '',
      rating: doc.rating,
      status: doc.status,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }

  async create(data: CreateReviewRecord): Promise<ReviewRecord> {
    const doc = await this.reviewModel.create({
      productId: new Types.ObjectId(data.productId),
      userId: new Types.ObjectId(data.userId),
      review: data.review ?? '',
      rating: data.rating,
    });

    return this.toRecord(doc);
  }

  async findById(id: string): Promise<ReviewRecord | null> {
    const doc = await this.reviewModel.findById(id).exec();
    if (!doc) return null;
    return this.toRecord(doc);
  }

  async updateById(
    id: string,
    data: UpdateReviewRecord,
  ): Promise<ReviewRecord | null> {
    const updatedDoc = await this.reviewModel
      .findByIdAndUpdate(id, { ...data }, { new: true })
      .exec();

    if (!updatedDoc) return null;

    return this.toRecord(updatedDoc);
  }

  async deleteById(id: string): Promise<ReviewRecord | null> {
    const deletedDoc = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!deletedDoc) return null;
    return this.toRecord(deletedDoc);
  }

  buildFilter(query: FindManyReviewsQuery): Record<string, any> {
    const filter: Record<string, any> = {};

    if (query.productId) filter.productId = new Types.ObjectId(query.productId);
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (typeof query.isModerated === 'boolean')
      filter.isModerated = query.isModerated;

    if (typeof query.rating === 'number') filter.rating = query.rating;

    if (
      typeof query.ratingGte === 'number' ||
      typeof query.ratingLte === 'number'
    ) {
      filter.rating = {
        ...(typeof query.ratingGte === 'number'
          ? { $gte: query.ratingGte }
          : {}),
        ...(typeof query.ratingLte === 'number'
          ? { $lte: query.ratingLte }
          : {}),
      };
    }

    return filter;
  }

  async findMany(params: {
    filter: Record<string, any>;
    page: number;
    limit: number;
    sortBy: ReviewsSortKey;
    sortOrder: SortOrder;
  }): Promise<{ docs: ReviewRecord[]; total: number }> {
    const { filter, page, limit, sortBy, sortOrder } = params;

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortFieldMap: Record<ReviewsSortKey, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      rating: 'rating',
      isModerated: 'isModerated',
    };

    const sortField = sortFieldMap[sortBy];
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ [sortField]: sortDir, _id: sortDir })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return { docs: docs.map((doc) => this.toRecord(doc)), total };
  }

  async countModeratedByProductId(productId: string): Promise<number> {
    return this.reviewModel
      .countDocuments({
        productId: new Types.ObjectId(productId),
        isModerated: true,
      })
      .exec();
  }

  async getModeratedStatsByProductId(productId: string): Promise<{
    reviewCount: number;
    avgRating: number;
  }> {
    const pid = new Types.ObjectId(productId);

    const stats = await this.reviewModel.aggregate([
      { $match: { productId: pid, isModerated: true } },
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (!stats[0]) return { reviewCount: 0, avgRating: 0 };

    return {
      reviewCount: Number(stats[0].reviewCount ?? 0),
      avgRating: Number(stats[0].avgRating ?? 0),
    };
  }

  isValidId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
