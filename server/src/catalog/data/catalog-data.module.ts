import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './models/category.schema';
import { Product, ProductSchema } from './models/product.schema';
import { CategoriesRepository } from './repositories/category.repository';
import { ProductsRepository } from './repositories/product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [CategoriesRepository, ProductsRepository],
  exports: [CategoriesRepository, ProductsRepository],
})
export class CatalogDataModule {}
