import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import {
  CategoryRecord,
  CreateCategoryRecord,
  UpdateCategoryRecord,
} from './types/category-record.type';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private toRecord(doc: CategoryDocument): CategoryRecord {
    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      isActive: doc.isActive,
    };
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const doc = await this.categoryModel.findById(id).lean().exec();
    if (!doc) return null;

    return this.toRecord(doc);
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const doc = await this.categoryModel.findOne({ slug }).lean().exec();
    if (!doc) return null;

    return this.toRecord(doc);
  }

  async findManyByIds(ids: string[]): Promise<CategoryRecord[]> {
    const objectIds = ids
      .filter(Types.ObjectId.isValid)
      .map((id) => new Types.ObjectId(id));
    if (objectIds.length === 0) return [];

    const docs = await this.categoryModel
      .find({ _id: { $in: objectIds } })
      .lean()
      .exec();

    return docs.map((c) => this.toRecord(c));
  }

  async findAll(): Promise<CategoryRecord[]> {
    const docs = await this.categoryModel.find().lean().exec();

    return docs.map((d) => this.toRecord(d));
  }

  async countById(id: string): Promise<number> {
    if (!Types.ObjectId.isValid(id)) return 0;
    return this.categoryModel.countDocuments({ _id: id }).exec();
  }

  async create(dto: CreateCategoryRecord): Promise<CategoryRecord> {
    const created = await this.categoryModel.create({
      title: dto.title,
      slug: dto.slug,
      isActive: dto.isActive,
    });

    return this.toRecord(created);
  }

  async updateById(
    id: string,
    dto: UpdateCategoryRecord,
  ): Promise<CategoryRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();

    return doc ? this.toRecord(doc) : null;
  }

  async deleteById(id: string): Promise<{ deleted: true } | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const res = await this.categoryModel.deleteOne({ _id: id }).exec();
    return res.deletedCount === 1 ? { deleted: true } : null;
  }

  async IsExist(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    return await this.categoryModel.exists({ _id: id }).then(Boolean);
  }

  isValidCategoryId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
