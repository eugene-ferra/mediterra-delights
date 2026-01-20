import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../models/category.schema';
import { CategoryEntity } from '../entities/category-entity.type';
import {
  CreateCategoryRecord,
  UpdateCategoryRecord,
} from '../types/category.types';

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

  async findById(id: string): Promise<CategoryEntity | null> {
    const doc = await this.categoryModel.findById(id).lean().exec();
    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const doc = await this.categoryModel.findOne({ slug }).lean().exec();
    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findAll(isActive?: boolean): Promise<CategoryEntity[]> {
    const query = isActive !== undefined ? { isActive } : {};
    const docs = await this.categoryModel.find(query).lean().exec();

    return docs.map((d) => this.toEntity(d));
  }

  async countById(id: string): Promise<number> {
    return this.categoryModel.countDocuments({ _id: id }).exec();
  }

  async create(data: CreateCategoryRecord): Promise<CategoryEntity> {
    const created = await this.categoryModel.create({
      title: data.title,
      slug: data.slug,
      isActive: data.isActive,
    });

    return this.toEntity(created);
  }

  async updateById(
    id: string,
    data: UpdateCategoryRecord,
  ): Promise<{ updated: true } | null> {
    const doc = await this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();

    return doc ? { updated: true } : null;
  }

  async deleteById(id: string): Promise<{ deleted: true } | null> {
    const res = await this.categoryModel.deleteOne({ _id: id }).exec();
    return res.deletedCount === 1 ? { deleted: true } : null;
  }

  async IsExist(id: string): Promise<boolean> {
    return await this.categoryModel.exists({ _id: id }).then(Boolean);
  }

  isValidCategoryId(id: string): boolean {
    if (!Types.ObjectId.isValid(id)) return false;
    return true;
  }
}
