import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { Category, CategoryDocument } from '../models/category.schema';
import { CategoryEntity } from '../entities/category-entity.type';
import {
  CreateCategoryRecord,
  UpdateCategoryRecord,
} from '../types/category.types';
import {
  DuplicateKeyRepoError,
  InvalidDataRepoError,
  RepositoryUnknownError,
} from 'src/common/errors/repository-errors';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private toEntity(doc: CategoryDocument): CategoryEntity {
    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      isActive: doc.isActive,
    };
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildFiltersQuery(
    query: CategoryFindQuery,
  ): QueryFilter<CategoryDocument> {
    const f = query.filters ?? {};
    const where: Record<string, any> = {};

    if (typeof f.q === 'string' && f.q.trim()) {
      const needle = this.escapeRegex(f.q.trim());
      where.title = { $regex: needle, $options: 'i' };
    }

    if (typeof f.isActive === 'boolean') where.isActive = f.isActive;

    return where;
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.categoryModel.findById(id).lean().exec();
    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const doc = await this.categoryModel.findOne({ slug }).lean().exec();
    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findAll(query: CategoryFindQuery): Promise<{
    docs: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;
    const where = this.buildFiltersQuery(query);
    const sorDir: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
    const sortField = query.sortKey || 'createdAt';
    const sort = { [sortField]: sorDir, _id: sorDir };

    const [total, docs] = await Promise.all([
      this.categoryModel.countDocuments(where).exec(),
      this.categoryModel
        .find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    return {
      docs: docs.map((d) => this.toEntity(d)),
      total,
      page,
      limit,
    };
  }

  async countById(id: string): Promise<number> {
    return await this.categoryModel.countDocuments({ _id: id }).exec();
  }

  async create(data: CreateCategoryRecord): Promise<CategoryEntity> {
    try {
      const created = await this.categoryModel.create({
        title: data.title,
        slug: data.slug,
        isActive: data.isActive,
      });

      return this.toEntity(created);
    } catch (err: any) {
      // Mongo duplicate key
      if (err?.code === 11000) {
        const keyValue = err?.keyValue ?? {};
        throw new DuplicateKeyRepoError('categories', keyValue);
      }

      if (err?.name === 'ValidationError') {
        throw new InvalidDataRepoError(err.errors);
      }

      throw new RepositoryUnknownError(err);
    }
  }

  async updateById(
    id: string,
    data: UpdateCategoryRecord,
  ): Promise<CategoryEntity | null> {
    try {
      if (Types.ObjectId.isValid(id) === false) return null;

      const doc = await this.categoryModel
        .findByIdAndUpdate(id, data, { new: true })
        .lean()
        .exec();

      return doc ? this.toEntity(doc) : null;
    } catch (err: any) {
      // Mongo duplicate key
      if (err?.code === 11000) {
        const keyValue = err?.keyValue ?? {};
        throw new DuplicateKeyRepoError('categories', keyValue);
      }

      if (err?.name === 'ValidationError') {
        throw new InvalidDataRepoError(err.errors);
      }

      throw new RepositoryUnknownError(err);
    }
  }

  async deleteById(id: string): Promise<CategoryEntity | null> {
    if (Types.ObjectId.isValid(id) === false) return null;

    const res = await this.categoryModel.findByIdAndDelete(id).lean().exec();
    return res ? this.toEntity(res) : null;
  }

  async IsExist(id: string): Promise<boolean> {
    if (Types.ObjectId.isValid(id) === false) return false;
    return await this.categoryModel.exists({ _id: id }).then(Boolean);
  }

  isValidCategoryId(id: string): boolean {
    if (!Types.ObjectId.isValid(id)) return false;
    return true;
  }
}
