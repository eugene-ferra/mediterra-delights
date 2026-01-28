import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, QueryFilter } from 'mongoose';

import { Product, ProductDocument } from '../models/product.schema';
import { ProductEntity } from '../entities/product-entity.type';
import {
  CreateProductRecord,
  UpdateProductRecord,
} from '../types/product.types';
import { Category } from '../models/category.schema';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private toEntity(
    doc: Omit<Product, 'categoryId'> & { categoryId: Category },
  ): ProductEntity {
    console.log('doc.categoryId:', doc);

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

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private addRange(
    where: Record<string, any>,
    field: string,
    min?: number,
    max?: number,
  ) {
    if (min === undefined && max === undefined) return;
    const r: any = {};
    if (min !== undefined) r.$gte = min;
    if (max !== undefined) r.$lte = max;
    where[field] = r;
  }

  private buildWhere(query: ProductFindQuery): QueryFilter<ProductDocument> {
    const f = query.filters ?? {};
    const where: Record<string, any> = {};

    if (typeof f.q === 'string' && f.q.trim()) {
      const needle = this.escapeRegex(f.q.trim());
      where.title = { $regex: needle, $options: 'i' };
    }

    if (f.categoryId) where.categoryId = f.categoryId;

    if (typeof f.isVegan === 'boolean') where.isVegan = f.isVegan;
    if (typeof f.isNewProduct === 'boolean')
      where.isNewProduct = f.isNewProduct;

    if (typeof f.isActive === 'boolean') where.isActive = f.isActive;

    if (typeof f.isCategoryActive === 'boolean') {
      where.isCategoryActive = f.isCategoryActive;
    }

    this.addRange(where, 'avgRating', f.avgRatingMin, f.avgRatingMax);
    this.addRange(where, 'reviewCount', f.reviewCountMin, f.reviewCountMax);
    this.addRange(where, 'price', f.priceMin, f.priceMax);
    this.addRange(where, 'weight', f.weightMin, f.weightMax);
    this.addRange(where, 'cookTime', f.cookTimeMin, f.cookTimeMax);

    return where;
  }

  async create(data: CreateProductRecord): Promise<ProductEntity> {
    const created = await this.productModel.create(data);

    const full = await created.populate<{ categoryId: Category }>('categoryId');

    return this.toEntity(full);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.productModel
      .findById(id)
      .populate<{ categoryId: Category }>('categoryId')
      .exec();

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const doc = await this.productModel
      .findOne({ slug })
      .populate<{ categoryId: Category }>('categoryId')
      .exec();

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async updateById(
    id: string,
    data: UpdateProductRecord,
  ): Promise<ProductEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updatedDoc = await this.productModel
      .findByIdAndUpdate(id, { ...data }, { new: true })
      .populate<{ categoryId: Category }>('categoryId')
      .exec();

    if (!updatedDoc) return null;

    return this.toEntity(updatedDoc);
  }

  async deleteById(id: string): Promise<ProductEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const deletedDoc = await this.productModel
      .findByIdAndDelete(id)
      .populate<{ categoryId: Category }>('categoryId')
      .exec();

    if (!deletedDoc) return null;

    return this.toEntity(deletedDoc);
  }

  async findMany(query: ProductFindQuery): Promise<{
    docs: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const where = this.buildWhere(query);

    const sortDir: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
    const sortKey = query.sortKey ?? 'createdAt';

    const allowedSortMap: Record<
      NonNullable<ProductFindQuery['sortKey']>,
      string
    > = {
      title: 'title',
      price: 'price',
      avgRating: 'avgRating',
      reviewCount: 'reviewCount',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      cookTime: 'cookTime',
      weight: 'weight',
      isNewProduct: 'isNewProduct',
      isVegan: 'isVegan',
      isActive: 'isActive',
    };

    const sortField = allowedSortMap[sortKey] ?? 'createdAt';
    const sort = { [sortField]: sortDir, _id: sortDir };

    const [total, docs] = await Promise.all([
      this.productModel.countDocuments(where).exec(),
      this.productModel
        .find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate<{ categoryId: Category }>('categoryId')
        .exec(),
    ]);

    console.log('docs:', docs);

    return {
      docs: docs.map((d) => this.toEntity(d)),
      total,
      page,
      limit,
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
