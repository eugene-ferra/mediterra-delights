import { Module } from '@nestjs/common';
import { ProductsDataModule } from './data/product-data.module';
import { CategoriesDataModule } from '../categories/data/category-data.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [ProductsDataModule, CategoriesDataModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
