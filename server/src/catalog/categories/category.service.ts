import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryEntity } from './types/category-entity.type';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './data/category-data.repository';
import { CategoryRecord } from './data/types/category-record.type';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoriesRepository) {}

  private toEntity(doc: CategoryRecord): CategoryEntity {
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      isActive: doc.isActive,
    };
  }

  async findAll(): Promise<CategoryEntity[]> {
    const records = await this.categoryRepo.findAll();
    return records.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      throw new BadRequestException('Invalid category ID');
    }

    const record = await this.categoryRepo.findById(id);

    return record ? this.toEntity(record) : null;
  }

  async createOne(payload: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = slugify(payload.title, { lower: true, locale: 'en' });

    const createdDoc = await this.categoryRepo.create({
      title: payload.title,
      slug,
      isActive: payload.isActive,
    });

    return this.toEntity(createdDoc);
  }

  async updateOne(
    id: string,
    payload: UpdateCategoryDto,
  ): Promise<CategoryEntity | null> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      throw new BadRequestException('Invalid category ID');
    }

    const slug = payload.title
      ? slugify(payload.title, { lower: true, locale: 'en' })
      : undefined;

    const updatedDoc = await this.categoryRepo.updateById(id, {
      ...payload,
      slug,
    });

    return updatedDoc ? this.toEntity(updatedDoc) : null;
  }

  async isExist(id: string): Promise<boolean> {
    const doc = await this.categoryRepo.IsExist(id);

    return !!doc;
  }

  async countDocuments(id: string): Promise<number> {
    const count = await this.categoryRepo.countById(id);
    return count;
  }

  async findManyByIds(ids: string[]): Promise<CategoryEntity[]> {
    const objectIds = ids.filter((id) =>
      this.categoryRepo.isValidCategoryId(id),
    );

    if (objectIds.length === 0) return [];

    const docs = await this.categoryRepo.findManyByIds(ids);

    return docs.map((d) => this.toEntity(d));
  }
}
