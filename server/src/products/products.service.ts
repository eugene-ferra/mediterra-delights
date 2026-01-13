import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './types/product-entity.type';
import { Product, ProductDocument } from './schema/product.schema';

import { ProductCategoryService } from 'src/product-category/product-category.service';
import { ProductCategoryEntity } from 'src/product-category/types/product-category.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindManyProductsQuery } from './types/product-query.type';
import { FindManyProductsResult } from './types/find-many-products-result.type';
import { ProductsSortKey, SortOrder } from './types/products-sort.type';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  private toEntity(
    product: ProductDocument,
    category: ProductCategoryEntity,
  ): ProductEntity {
    return {
      id: product._id,
      title: product.title,
      slug: product.slug,
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      imgCover: product.imgCover,
      description: product.description,
      category: {
        id: category.id,
        title: category.title,
        slug: category.slug,
      },
      images: product.images,
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
    const category = await this.productCategoryService.findById(
      data.categoryId,
    );

    const slug = slugify(data.title, { lower: true, locale: 'en' });

    const imgCover = {
      jpg: 'placeholder.jpg',
      webp: 'placeholder.webp',
      avif: 'placeholder.avif',
    };

    if (!category)
      throw new BadRequestException(
        'Invalid categoryId: Category does not exist.',
      );

    let createdProduct;

    try {
      createdProduct = await this.productModel.create({
        ...data,
        slug,
        imgCover,
      });
    } catch (error) {
      throw new BadRequestException('Error creating product');
    }

    return this.toEntity(createdProduct, category);
  }

  async findOne(idOrSlug: string): Promise<ProductEntity | null> {
    if (Types.ObjectId.isValid(idOrSlug)) {
      return this.findById(idOrSlug);
    } else {
      return this.findBySlug(idOrSlug);
    }
  }

  private async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      return null;
    }

    const category = await this.productCategoryService.findById(
      String(product.categoryId),
    );

    if (!category) {
      throw new BadRequestException(
        'Data integrity error: Product has invalid categoryId.',
      );
    }

    return this.toEntity(product, category);
  }

  private async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await this.productModel.findOne({ slug }).exec();
    if (!product) {
      return null;
    }

    const category = await this.productCategoryService.findById(
      String(product.categoryId),
    );

    if (!category) {
      throw new BadRequestException(
        'Data integrity error: Product has invalid categoryId.',
      );
    }

    return this.toEntity(product, category);
  }

  async updateById(id: string, data: UpdateProductDto): Promise<ProductEntity> {
    const slug = data.title
      ? slugify(data.title, { lower: true, locale: 'en' })
      : undefined;

    const product = await this.productModel
      .findByIdAndUpdate(id, { ...data, slug }, { new: true })
      .exec();

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const category = await this.productCategoryService.findById(
      String(product.categoryId),
    );

    if (!category) {
      throw new BadRequestException(
        'Data integrity error: Product has invalid categoryId.',
      );
    }

    return this.toEntity(product, category);
  }

  async deleteById(id: string): Promise<{ deleted: true }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new BadRequestException('Product not found');
    }
    return { deleted: true };
  }

  async findMany(
    query: FindManyProductsQuery = {},
  ): Promise<FindManyProductsResult> {
    // defaults
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

    const sortBy: ProductsSortKey = query.sortBy ?? 'createdAt';
    const sortOrder: SortOrder = query.sortOrder ?? 'desc';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const sortFieldMap: Record<ProductsSortKey, string> = {
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

    // filter build
    const filter: Record<string, any> = {};

    if (query.categoryId) {
      if (!Types.ObjectId.isValid(query.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (typeof query.isVegan === 'boolean') {
      filter.isVegan = query.isVegan;
    }

    if (typeof query.isNewProduct === 'boolean') {
      filter.isNewProduct = query.isNewProduct;
    }

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

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ [sortField]: sortDir, _id: sortDir }) // stable
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    if (products.length === 0) {
      return {
        items: [],
        meta: {
          page,
          limit,
          total,
          pages: 0,
          sortBy,
          sortOrder,
        },
      };
    }

    // batch categories
    const uniqueCategoryIds = [
      ...new Set(products.map((p) => String(p.categoryId))),
    ];

    const categories =
      await this.productCategoryService.findManyByIds(uniqueCategoryIds);

    const categoryMap = new Map<string, ProductCategoryEntity>(
      categories.map((c) => [c.id.toString(), c]),
    );

    const items = products.map((p) => {
      const category = categoryMap.get(String(p.categoryId));
      if (!category) {
        throw new BadRequestException(
          `Data integrity error: Product ${String(p._id)} has invalid categoryId.`,
        );
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
