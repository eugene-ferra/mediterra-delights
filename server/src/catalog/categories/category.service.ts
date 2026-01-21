import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CategoryEntity } from '../data/entities/category-entity.type';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from '../data/repositories/category.repository';
import { ProductsRepository } from '../data/repositories/product.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoriesRepository,
    private readonly productRepo: ProductsRepository,
  ) {}

  async findAll(filter?: {
    includeInactive?: boolean;
  }): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepo.findAll(filter?.includeInactive);
    return categories;
  }

  async findOne(id: string): Promise<CategoryEntity | null> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      return await this.categoryRepo.findBySlug(id);
    }

    return await this.categoryRepo.findById(id);
  }

  async createOne(payload: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = slugify(payload.title, { lower: true, locale: 'en' });

    if (await this.categoryRepo.findBySlug(slug)) {
      throw new ConflictException(
        'It looks like category with such title already exists',
      );
    }

    const createdDoc = await this.categoryRepo.create({ ...payload, slug });
    return createdDoc;
  }

  async updateOne(
    id: string,
    payload: UpdateCategoryDto,
  ): Promise<{ updated: true }> {
    const slug = payload.title
      ? slugify(payload.title, { lower: true, locale: 'en' })
      : undefined;

    if (await this.categoryRepo.findBySlug(slug || '')) {
      throw new ConflictException(
        'It looks like category with such title already exists',
      );
    }

    const res = await this.categoryRepo.updateById(id, {
      ...payload,
      slug,
    });

    if (!res)
      throw new NotFoundException('It looks like category to update not found');

    return res;
  }

  async deleteById(id: string): Promise<{ deleted: true }> {
    if (await this.productRepo.countByCategoryId(id)) {
      throw new UnprocessableEntityException(
        'This category has products assigned to it and cannot be deleted.',
      );
    }

    const res = await this.categoryRepo.deleteById(id);

    if (!res)
      throw new NotFoundException('It looks like category to delete not found');

    return res;
  }
}
