import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductCategory,
  ProductCategoryDocument,
} from './schema/product-category.schema';
import { ProductCategoryEntity } from './types/product-category.type';
import slugify from 'slugify';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(ProductCategory.name)
    private productCategoryModel: Model<ProductCategoryDocument>,
  ) {}

  private toEntity(doc: ProductCategoryDocument): ProductCategoryEntity {
    return {
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      isActive: doc.isActive,
    };
  }

  async findAll(): Promise<ProductCategoryEntity[]> {
    const docs = await this.productCategoryModel.find().exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<ProductCategoryEntity | null> {
    const doc = await this.productCategoryModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(
    payload: CreateProductCategoryDto,
  ): Promise<ProductCategoryEntity> {
    const slug = slugify(payload.title, { lower: true, locale: 'en' });

    const createdDoc = new this.productCategoryModel({
      title: payload.title,
      slug,
      isActive: payload.isActive,
    });

    let savedDoc;
    try {
      savedDoc = await createdDoc.save();
    } catch (error) {
      throw new BadRequestException('Error creating product category');
    }

    return this.toEntity(savedDoc);
  }

  async update(
    id: string,
    payload: UpdateProductCategoryDto,
  ): Promise<ProductCategoryEntity | null> {
    const slug = payload.title
      ? slugify(payload.title, { lower: true, locale: 'en' })
      : undefined;

    let updatedDoc: ProductCategoryDocument | null;

    try {
      updatedDoc = await this.productCategoryModel
        .findByIdAndUpdate(
          id,
          {
            ...payload,
            ...(slug ? { slug } : {}),
          },
          { new: true },
        )
        .exec();

      return updatedDoc ? this.toEntity(updatedDoc) : null;
    } catch (error) {
      throw new BadRequestException('Error updating product category');
    }
  }

  async isExist(id: string): Promise<boolean> {
    const doc = await this.productCategoryModel.findById(id).lean().exec();

    return !!doc;
  }

  async countDocuments(id: string): Promise<number> {
    const count = await this.productCategoryModel
      .countDocuments({ _id: id })
      .exec();
    return count;
  }
}
