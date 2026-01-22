import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../models/review.schema';
import {
  CreateReviewRecord,
  ReviewRecordPopulated,
  UpdateReviewRecord,
} from '../types/review-record.type';

import { ReviewEntity } from '../entities/review-entity.type';
import { ReviewStatus } from '../types/review-status.enum';
import { FindManyReviewsDbQuery } from '../types/review-query.type';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  private toEntity(doc: ReviewRecordPopulated): ReviewEntity {
    return {
      id: String(doc._id),
      product: {
        id: String(doc.productId._id),
        title: doc.productId.title,
        avgRating: doc.productId.avgRating,
        reviewCount: doc.productId.reviewCount,
        image: {
          jpg: doc.productId.image?.jpg,
          webp: doc.productId.image?.webp,
          avif: doc.productId.image?.avif,
        },
      },
      user: {
        id: String(doc.userId._id),
        name: doc.userId.name,
        lastName: doc.userId.lastName,
        avatar: {
          jpg: doc.userId.avatar?.jpg,
          webp: doc.userId.avatar?.webp,
          avif: doc.userId.avatar?.avif,
        },
      },
      review: doc.review,
      rating: doc.rating,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(data: CreateReviewRecord): Promise<ReviewEntity> {
    const doc = await this.reviewModel.create({
      productId: data.productId,
      userId: data.userId,
      review: data.review ?? '',
      rating: data.rating,
    });

    const docPopulated = await this.reviewModel
      .findById(doc._id)
      .populate('productId')
      .populate('userId')
      .lean<ReviewRecordPopulated>()
      .exec();

    return this.toEntity(docPopulated!);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.reviewModel
      .findById(id)
      .populate('productId')
      .populate('userId')
      .lean<ReviewRecordPopulated>()
      .exec();

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async updateById(
    id: string,
    data: UpdateReviewRecord,
  ): Promise<ReviewEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updatedDoc = await this.reviewModel
      .findByIdAndUpdate(id, { ...data }, { new: true })
      .populate('productId')
      .populate('userId')
      .lean<ReviewRecordPopulated>()
      .exec();

    if (!updatedDoc) return null;

    return this.toEntity(updatedDoc);
  }

  async deleteById(id: string): Promise<ReviewEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const deletedDoc = await this.reviewModel
      .findByIdAndDelete(id)
      .populate('productId')
      .populate('userId')
      .lean<ReviewRecordPopulated>()
      .exec();

    if (!deletedDoc) return null;

    return this.toEntity(deletedDoc);
  }

  async calcStatsForProduct(
    productId: string,
  ): Promise<{ avgRating: number; reviewCount: number } | null> {
    if (!Types.ObjectId.isValid(productId)) return null;

    const [stats] = await this.reviewModel
      .aggregate<{ _id: null; avgRating: number; reviewCount: number }>([
        {
          $match: {
            productId: productId,
            status: ReviewStatus.APPROVED,
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    if (!stats) return null;

    return {
      avgRating: stats.avgRating,
      reviewCount: stats.reviewCount,
    };
  }

  async find(params: FindManyReviewsDbQuery): Promise<{
    docs: ReviewEntity[];
    total: number;
  }> {
    const matchStage = { $match: params.match };
    const sortStage = { $sort: params.sort };
    const skipStage = { $skip: (params.page - 1) * params.limit };
    const limitStage = { $limit: params.limit };

    const docsPromise = this.reviewModel
      .aggregate<ReviewRecordPopulated>([
        matchStage,
        sortStage,
        skipStage,
        limitStage,
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'productId',
          },
        },
        { $unwind: '$productId' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        { $unwind: '$userId' },
      ])
      .exec();

    const countPromise = this.reviewModel.countDocuments(params.match).exec();

    const [docs, total] = await Promise.all([docsPromise, countPromise]);

    return {
      docs: docs.map((doc) => this.toEntity(doc)),
      total,
    };
  }
}
