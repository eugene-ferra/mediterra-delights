import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Product, ProductDocument } from './product.schema';
import { FindManyProductsQuery } from '../types/product-query.type';
import { ProductsSortKey, SortOrder } from '../types/products-sort.type';
import {
  CreateProductRecord,
  ProductRecord,
  UpdateProductRecord,
} from './types/product-record.type';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private toRecord(doc: ProductDocument): ProductRecord {
    return {
      id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      categoryId: String(doc.categoryId),
      description: doc.description,
      fullText: doc.fullText,
      avgRating: doc.avgRating,
      reviewCount: doc.reviewCount,
      imgCover: doc.imgCover,
      images: doc.images,
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

  async create(data: CreateProductRecord): Promise<ProductRecord> {
    const doc = await this.productModel.create({ ...data });
    await doc.save();
    return this.toRecord(doc);
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const doc = await this.productModel.findById(id).exec();

    if (!doc) return null;

    return this.toRecord(doc);
  }

  async findBySlug(slug: string): Promise<ProductRecord | null> {
    const doc = await this.productModel.findOne({ slug }).exec();

    if (!doc) return null;

    return this.toRecord(doc);
  }

  async updateById(
    id: string,
    data: UpdateProductRecord,
  ): Promise<ProductRecord | null> {
    const updatedDoc = await this.productModel
      .findByIdAndUpdate(id, { ...data }, { new: true })
      .exec();

    if (!updatedDoc) return null;

    return this.toRecord(updatedDoc);
  }

  async deleteById(id: string): Promise<ProductRecord | null> {
    const deletedDoc = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedDoc) return null;

    return this.toRecord(deletedDoc);
  }

  async findMany(params: {
    query: FindManyProductsQuery;
    filter: Record<string, any>;
    page: number;
    limit: number;
    sortBy: ProductsSortKey;
    sortOrder: SortOrder;
  }): Promise<{ docs: ProductRecord[]; total: number }> {
    const { filter, page, limit, sortBy, sortOrder } = params;

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortFieldMap: Record<ProductsSortKey, string> = {
      createdAt: 'createdAt',
      price: 'price',
      avgRating: 'avgRating',
      reviewCount: 'reviewCount',
      title: 'title',
    };

    const sortField = sortFieldMap[sortBy];
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ [sortField]: sortDir, _id: sortDir })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { docs: docs.map((doc) => this.toRecord(doc)), total };
  }

  isValidProductId(id: string): boolean {
    if (!Types.ObjectId.isValid(id)) return false;
    return true;
  }
}
