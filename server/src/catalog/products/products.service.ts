import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import slugify from 'slugify';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductsRepository } from '../data/repositories/product.repository';
import { CategoriesRepository } from '../data/repositories/category.repository';
import { ProductEntity } from '../data/entities/product-entity.type';
import { UserFindProductsDto } from './dto/user-find-products.dto';
import {
  DuplicateKeyRepoError,
  InvalidDataRepoError,
} from 'src/common/errors/repository-errors';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesRepo: CategoriesRepository,
  ) {}

  async create(data: CreateProductDto): Promise<ProductEntity> {
    const category = await this.categoriesRepo.findById(data.categoryId);
    if (!category) {
      throw new UnprocessableEntityException(
        'Provided category does not exist.',
      );
    }

    const slug = slugify(data.title, { lower: true, locale: 'en' });
    const nutrients = data.nutrients || {};

    try {
      let created = await this.productsRepo.create({
        ...data,
        slug,
        imgCover: {
          originalKey: '', // to be updated later
          originalWidth: 800,
          originalHeight: 800,
        },
        nutrients,
        isCategoryActive: category.isActive,
      });

      return created;
    } catch (err) {
      if (err instanceof DuplicateKeyRepoError)
        throw new ConflictException(
          'It looks like product with such title already exists',
        );

      if (err instanceof InvalidDataRepoError)
        throw new UnprocessableEntityException(
          'It looks like provided data is invalid. Please check the data and try again.',
        );

      throw err;
    }
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
  ): Promise<ProductEntity | null> {
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

    if (data.discountPrice) {
      const product = await this.productsRepo.findById(id);

      // product to update not found
      if (!product) return null;

      if (data.discountPrice >= product.price) {
        throw new UnprocessableEntityException(
          'Discount price must be less than the original price',
        );
      }
    }

    try {
      const updated = await this.productsRepo.updateById(id, { ...data, slug });

      if (!updated) return null;

      return updated;
    } catch (err) {
      if (err instanceof DuplicateKeyRepoError)
        throw new ConflictException(
          'It looks like product with such title already exists',
        );

      if (err instanceof InvalidDataRepoError)
        throw new UnprocessableEntityException(
          'It looks like provided data is invalid. Please check the data and try again.',
        );

      throw err;
    }
  }

  async deleteById(id: string): Promise<ProductEntity | null> {
    const deleted = await this.productsRepo.deleteById(id);

    if (!deleted) return null;

    return deleted;
  }

  async findMany(params: UserFindProductsDto): Promise<{
    docs: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const { sortBy, sortOrder } = params;
    const { categoryId, isNewProduct, isVegan, maxPrice, minPrice } = params;

    const { docs, total } = await this.productsRepo.findMany({
      page: page || 1,
      limit: limit || 20,
      sortKey: sortBy,
      sortOrder,
      filters: {
        categoryId: categoryId,
        isVegan: isVegan,
        isNewProduct: isNewProduct,
        priceMin: minPrice,
        priceMax: maxPrice,
        q: params.q,
      },
    });

    return {
      docs,
      total,
      page,
      limit,
    };
  }

  async exists(id: string): Promise<boolean> {
    return await this.productsRepo.isExists(id);
  }

  async updateStats(
    productId: string,
    avgRating: number,
    reviewCount: number,
  ): Promise<ProductEntity | null> {
    const product = await this.productsRepo.updateById(productId, {
      avgRating,
      reviewCount,
    });

    if (!product) return null;

    return product;
  }
}
