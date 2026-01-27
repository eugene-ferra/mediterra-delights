import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Product, ProductDocument } from '../models/product.schema';
import { ProductEntity } from '../entities/product-entity.type';
import {
  CreateProductRecord,
  ProductLeanWithCategory,
  UpdateProductRecord,
} from '../types/product.types';
import { FindManyProductsDbQuery } from '../types/product-query.type';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private toEntityFromLean(doc: ProductLeanWithCategory): ProductEntity {
    return {
      id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      category: {
        id: String(doc.categoryId._id),
        title: doc.categoryId.title,
        slug: doc.categoryId.slug,
        isActive: doc.categoryId.isActive,
      },
      description: doc.description,
      fullText: doc.fullText,
      avgRating: doc.avgRating,
      reviewCount: doc.reviewCount,
      imgCover: doc.imgCover,
      images: doc.images || [],
      weight: doc.weight,
      price: doc.price,
      discountPrice: doc.discountPrice,
      nutrients: doc.nutrients,
      isVegan: doc.isVegan,
      cookTime: doc.cookTime,
      isNewProduct: doc.isNewProduct,
      compound: doc.compound,
    };
  }

  async create(data: CreateProductRecord): Promise<ProductEntity> {
    const created = await this.productModel.create(data);

    const doc = await this.productModel
      .findById(created._id)
      .populate('categoryId')
      .lean<ProductLeanWithCategory>()
      .exec();

    return this.toEntityFromLean(doc!);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.productModel
      .findById(id)
      .populate('categoryId')
      .lean<ProductLeanWithCategory>()
      .exec();

    if (!doc) return null;

    return this.toEntityFromLean(doc);
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const doc = await this.productModel
      .findOne({ slug })
      .populate('categoryId')
      .lean<ProductLeanWithCategory>()
      .exec();

    if (!doc) return null;

    return this.toEntityFromLean(doc);
  }

  async updateById(
    id: string,
    data: UpdateProductRecord,
  ): Promise<{ updated: true } | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updatedDoc = await this.productModel
      .findByIdAndUpdate(id, { ...data }, { new: true })
      .exec();

    if (!updatedDoc) return null;

    return { updated: true };
  }

  async deleteById(id: string): Promise<{ deleted: true } | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const deletedDoc = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedDoc) return null;

    return { deleted: true };
  }

  async findMany(params: FindManyProductsDbQuery): Promise<{
    docs: ProductEntity[];
    total: number;
  }> {
    const { match, sort, page, limit, withTextScore, visibility } = params;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: match },

      ...(withTextScore
        ? [{ $addFields: { score: { $meta: 'textScore' } } }]
        : []),

      {
        $lookup: {
          from: 'categories',
          let: {
            catId: {
              $convert: {
                input: '$categoryId',
                to: 'objectId',
                onError: null,
                onNull: null,
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: visibility.includeInactiveCategories
                  ? { $eq: ['$_id', '$$catId'] }
                  : {
                      $and: [
                        { $eq: ['$_id', '$$catId'] },
                        { $eq: ['$isActive', true] },
                      ],
                    },
              },
            },
          ],
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $addFields: { categoryId: '$category' } },
      { $project: { category: 0 } },
      { $sort: sort },
      {
        $facet: {
          docs: [
            { $skip: skip },
            { $limit: limit },
            { $project: { score: 0 } },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const result = await this.productModel.aggregate(pipeline).exec();

    const docsRaw = result?.[0]?.docs ?? [];
    const total = result?.[0]?.meta?.[0]?.total ?? 0;

    return {
      docs: docsRaw.map((d: any) => this.toEntityFromLean(d)),
      total,
    };
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    if (!Types.ObjectId.isValid(categoryId)) return 0;

    return this.productModel
      .countDocuments({ categoryId: new Types.ObjectId(categoryId) })
      .exec();
  }

  async isExists(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const isExist = await this.productModel.exists({ _id: id });
    return !!isExist;
  }

  isValidProductId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
