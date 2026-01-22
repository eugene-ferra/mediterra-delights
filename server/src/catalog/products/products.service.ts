import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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
      throw new UnprocessableEntityException(
        'Provided category does not exist.',
      );
    }

    const isCategoryExist = await this.categoriesRepo.IsExist(data.categoryId);
    if (!isCategoryExist) {
      throw new UnprocessableEntityException(
        'Provided category does not exist.',
      );
    }

    const slug = slugify(data.title, { lower: true, locale: 'en' });

    if (await this.productsRepo.findBySlug(slug)) {
      throw new ConflictException(
        'It looks like product with such title already exists',
      );
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
      const isCategoryExist = await this.categoriesRepo.IsExist(
        data.categoryId,
      );
      if (!isCategoryExist)
        throw new UnprocessableEntityException(
          'Provided category does not exist.',
        );
    }

    const slug = data.title
      ? slugify(data.title, { lower: true, locale: 'en' })
      : undefined;

    if (slug) {
      const existingProduct = await this.productsRepo.findBySlug(slug);
      if (existingProduct && existingProduct.id !== id)
        throw new ConflictException(
          'It looks like product with such title already exists',
        );
    }

    if (data.discountPrice) {
      const product = await this.productsRepo.findById(id);

      if (!product) throw new NotFoundException('Product to update not found');

      if (data.discountPrice >= product.price) {
        throw new UnprocessableEntityException(
          'Discount price must be less than the original price',
        );
      }
    }

    const updated = await this.productsRepo.updateById(id, { ...data, slug });

    if (!updated) throw new NotFoundException('Product to update not found');

    return { updated: true };
  }

  async deleteById(id: string): Promise<{ deleted: true }> {
    const deleted = await this.productsRepo.deleteById(id);

    if (!deleted) throw new NotFoundException('Product not found');

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

    const match: Record<string, any> = {};

    if (!visibility.includeInactiveProducts) {
      match.isActive = true;
    }

    if (query.categoryId) match.categoryId = query.categoryId;

    if (typeof query.isVegan === 'boolean') match.isVegan = query.isVegan;
    if (typeof query.isNewProduct === 'boolean')
      match.isNewProduct = query.isNewProduct;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      match.price = {};
      if (query.minPrice !== undefined) {
        const v = Number(query.minPrice);
        match.price.$gte = v;
      }
      if (query.maxPrice !== undefined) {
        const v = Number(query.maxPrice);
        match.price.$lte = v;
      }
    }

    if (query.minRating !== undefined) {
      const v = Number(query.minRating);
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

  async exists(id: string): Promise<boolean> {
    return await this.productsRepo.isExists(id);
  }

  async updateStats(
    productId: string,
    avgRating: number,
    reviewCount: number,
  ): Promise<{ updated: true }> {
    await this.productsRepo.updateById(productId, {
      avgRating,
      reviewCount,
    });
    return { updated: true };
  }
}
