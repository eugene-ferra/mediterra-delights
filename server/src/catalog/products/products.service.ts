import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import slugify from 'slugify';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductsRepository } from '../data/repositories/product.repository';
import { CategoriesRepository } from '../data/repositories/category.repository';
import { ProductEntity } from '../data/entities/product-entity.type';
import { FindManyProductsQueryDto } from './dto/find-many-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesRepo: CategoriesRepository,
  ) {}

  async create(data: CreateProductDto): Promise<ProductEntity> {
    if (!this.categoriesRepo.isValidCategoryId(data.categoryId)) {
      throw new BadRequestException('Invalid categoryId');
    }

    const isCategoryExist = await this.categoriesRepo.IsExist(data.categoryId);
    if (!isCategoryExist) {
      throw new BadRequestException(
        'Invalid categoryId: Category does not exist.',
      );
    }

    const slug = slugify(data.title, { lower: true, locale: 'en' });

    if (await this.productsRepo.findBySlug(slug)) {
      throw new ConflictException('Product with this slug already exists.');
    }

    // TODO: Replace with actual image upload logic
    const imgCover = {
      jpg: 'placeholder.jpg',
      webp: 'placeholder.webp',
      avif: 'placeholder.avif',
    };

    const images = [
      {
        jpg: 'placeholder.jpg',
        webp: 'placeholder.webp',
        avif: 'placeholder.avif',
      },
    ];

    const nutrients = data.nutrients || {};

    let created;

    created = await this.productsRepo.create({
      ...data,
      slug,
      imgCover,
      images,
      nutrients,
    });

    return created;
  }

  async findOne(id: string): Promise<ProductEntity | null> {
    if (this.productsRepo.isValidProductId(id)) {
      return await this.productsRepo.findById(id);
    }

    return await this.productsRepo.findBySlug(id);
  }

  async updateById(
    id: string,
    data: UpdateProductDto,
  ): Promise<{ updated: true }> {
    if (data.categoryId) {
      if (!this.categoriesRepo.isValidCategoryId(data.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }

      const isCategoryExist = await this.categoriesRepo.IsExist(
        data.categoryId,
      );
      if (!isCategoryExist) {
        throw new BadRequestException(
          'Invalid categoryId: Category does not exist.',
        );
      }
    }

    const slug = data.title
      ? slugify(data.title, { lower: true, locale: 'en' })
      : undefined;

    if (this.productsRepo.isValidProductId(id) === false) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productsRepo.updateById(id, { ...data, slug });
    if (!product) throw new BadRequestException('Product not found');

    return { updated: true };
  }

  async deleteById(id: string): Promise<{ deleted: true }> {
    if (this.productsRepo.isValidProductId(id) === false) {
      throw new BadRequestException('Invalid product ID');
    }

    const deleted = await this.productsRepo.deleteById(id);

    if (!deleted) throw new BadRequestException('Product not found');

    return { deleted: true };
  }

  async findMany(
    query: FindManyProductsQueryDto = {},
    visibility = {
      includeInactiveProducts: false,
      includeInactiveCategories: false,
    },
  ): Promise<ProductEntity[]> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const sortDir: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

    const sortFieldMap = {
      createdAt: 'createdAt',
      price: 'price',
      avgRating: 'avgRating',
      reviewCount: 'reviewCount',
      title: 'title',
    };
    const sortField = sortFieldMap[sortBy];
    if (!sortField) {
      throw new BadRequestException(`Invalid sortBy: ${String(query.sortBy)}`);
    }

    const match: Record<string, any> = {};

    if (!visibility.includeInactiveProducts) {
      match.isActive = true;
    }

    if (query.categoryId) {
      if (!this.categoriesRepo.isValidCategoryId(query.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }

      match.categoryId = query.categoryId;
    }

    if (typeof query.isVegan === 'boolean') match.isVegan = query.isVegan;
    if (typeof query.isNewProduct === 'boolean')
      match.isNewProduct = query.isNewProduct;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      match.price = {};
      if (query.minPrice !== undefined) {
        const v = Number(query.minPrice);
        if (!Number.isFinite(v))
          throw new BadRequestException('Invalid minPrice');
        match.price.$gte = v;
      }
      if (query.maxPrice !== undefined) {
        const v = Number(query.maxPrice);
        if (!Number.isFinite(v))
          throw new BadRequestException('Invalid maxPrice');
        match.price.$lte = v;
      }
      if (
        match.price.$gte !== undefined &&
        match.price.$lte !== undefined &&
        match.price.$gte > match.price.$lte
      ) {
        throw new BadRequestException(
          'minPrice cannot be greater than maxPrice',
        );
      }
    }

    if (query.minRating !== undefined) {
      const v = Number(query.minRating);
      if (!Number.isFinite(v))
        throw new BadRequestException('Invalid minRating');
      match.avgRating = { $gte: v };
    }

    const q = typeof query.q === 'string' ? query.q.trim() : '';
    const withTextScore = q.length > 0;
    if (withTextScore) {
      match.$text = { $search: q };
    }

    const sort = withTextScore
      ? {
          score: { $meta: 'textScore' as const },
          [sortField]: sortDir,
          _id: sortDir,
        }
      : {
          [sortField]: sortDir,
          _id: sortDir,
        };

    const { docs } = await this.productsRepo.findMany({
      match,
      sort,
      page,
      limit,
      withTextScore,
      visibility,
    });

    return docs;
  }
}
