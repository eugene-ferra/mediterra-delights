import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import slugify from 'slugify';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindManyProductsQuery } from './types/product-query.type';
import { FindManyProductsResult } from './types/find-many-products-result.type';
import { ProductsSortKey, SortOrder } from './types/products-sort.type';
import { ProductEntity } from './types/product-entity.type';

import { ProductsRepository } from './data/product-data.repository';
import { CategoriesRepository } from '../categories/data/category-data.repository';
import { CategoryEntity } from '../categories/types/category-entity.type';
import { ProductRecord } from './data/types/product-record.type';
import { CategoryRecord } from '../categories/data/types/category-record.type';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesRepo: CategoriesRepository,
  ) {}

  private toEntity(
    product: ProductRecord,
    category: CategoryRecord,
  ): ProductEntity {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      imgCover: product.imgCover,
      description: product.description,
      fullText: product.fullText,
      category: {
        id: category.id,
        title: category.title,
        slug: category.slug,
      },
      images: product.images || [],
      weight: product.weight,
      price: product.price,
      discountPrice: product.discountPrice,
      nutrients: product.nutrients,
      isVegan: product.isVegan,
      cookTime: product.cookTime,
      isNewProduct: product.isNewProduct,
    };
  }

  async create(data: CreateProductDto): Promise<ProductEntity> {
    const isCategoryExist = await this.categoriesRepo.IsExist(data.categoryId);
    if (!isCategoryExist) {
      throw new BadRequestException(
        'Invalid categoryId: Category does not exist.',
      );
    }

    const slug = slugify(data.title, { lower: true, locale: 'en' });

    // TODO: Replace with actual image upload logic
    const imgCover = {
      jpg: 'placeholder.jpg',
      webp: 'placeholder.webp',
      avif: 'placeholder.avif',
    };

    let created;
    try {
      created = await this.productsRepo.create({
        ...data,
        slug,
        imgCover,
      });
    } catch {
      throw new BadRequestException('Error creating product');
    }

    let category = await this.categoriesRepo.findById(data.categoryId);

    if (!category) {
      category = {
        id: data.categoryId,
        title: 'Unknown',
        slug: 'unknown',
        isActive: false,
      };
    }

    return this.toEntity(created, category);
  }

  async findOne(idOrSlug: string): Promise<ProductEntity | null> {
    let doc;

    if (this.productsRepo.isValidProductId(idOrSlug)) {
      doc = await this.productsRepo.findById(idOrSlug);
    } else {
      doc = await this.productsRepo.findBySlug(idOrSlug);
    }

    if (!doc) return null;

    let category = await this.categoriesRepo.findById(String(doc.categoryId));
    if (!category) {
      if (!category) {
        category = {
          id: doc.categoryId,
          title: 'Unknown',
          slug: 'unknown',
          isActive: false,
        };
      }
    }

    return this.toEntity(doc, category);
  }

  async updateById(id: string, data: UpdateProductDto): Promise<ProductEntity> {
    const slug = data.title
      ? slugify(data.title, { lower: true, locale: 'en' })
      : undefined;

    if (this.productsRepo.isValidProductId(id) === false) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productsRepo.updateById(id, { ...data, slug });
    if (!product) throw new BadRequestException('Product not found');

    let category = await this.categoriesRepo.findById(
      String(product.categoryId),
    );
    if (!category) {
      category = {
        id: product.categoryId,
        title: 'Unknown',
        slug: 'unknown',
        isActive: false,
      };
    }

    return this.toEntity(product, category);
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
    query: FindManyProductsQuery = {},
  ): Promise<FindManyProductsResult> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

    const sortBy: ProductsSortKey = query.sortBy ?? 'createdAt';
    const sortOrder: SortOrder = query.sortOrder ?? 'desc';

    const sortFieldMap: Record<ProductsSortKey, string> = {
      createdAt: 'createdAt',
      price: 'price',
      avgRating: 'avgRating',
      reviewCount: 'reviewCount',
      title: 'title',
    };
    if (!sortFieldMap[sortBy]) {
      throw new BadRequestException(`Invalid sortBy: ${String(query.sortBy)}`);
    }

    const filter: Record<string, any> = {};

    if (query.categoryId) {
      if (!Types.ObjectId.isValid(query.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (typeof query.isVegan === 'boolean') filter.isVegan = query.isVegan;
    if (typeof query.isNewProduct === 'boolean')
      filter.isNewProduct = query.isNewProduct;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        const v = Number(query.minPrice);
        if (!Number.isFinite(v))
          throw new BadRequestException('Invalid minPrice');
        filter.price.$gte = v;
      }
      if (query.maxPrice !== undefined) {
        const v = Number(query.maxPrice);
        if (!Number.isFinite(v))
          throw new BadRequestException('Invalid maxPrice');
        filter.price.$lte = v;
      }
      if (
        filter.price.$gte !== undefined &&
        filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte
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
      filter.avgRating = { $gte: v };
    }

    if (query.q && query.q.trim().length > 0) {
      const q = query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { fullText: { $regex: q, $options: 'i' } },
      ];
    }

    const { docs: products, total } = await this.productsRepo.findMany({
      query,
      filter,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    if (products.length === 0) {
      return {
        items: [],
        meta: { page, limit, total, pages: 0, sortBy, sortOrder },
      };
    }

    const uniqueCategoryIds = [
      ...new Set(products.map((p) => String(p.categoryId))),
    ];
    const categories =
      await this.categoriesRepo.findManyByIds(uniqueCategoryIds);

    const categoryMap = new Map<string, CategoryEntity>(
      categories.map((c) => [String(c.id), c]),
    );

    const items = products.map((p) => {
      let category = categoryMap.get(String(p.categoryId));
      if (!category) {
        category = {
          id: p.categoryId,
          title: 'Unknown',
          slug: 'unknown',
          isActive: false,
        };
      }
      return this.toEntity(p, category);
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        sortBy,
        sortOrder,
      },
    };
  }
}
