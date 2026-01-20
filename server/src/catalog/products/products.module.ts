import { Module } from '@nestjs/common';
import { CatalogDataModule } from '../data/catalog-data.module';
import { ProductsService } from './products.service';
import { PublicProductsController } from './controllers/public-products.controller';
import { AdminProductsController } from './controllers/admin-product.controller';

@Module({
  imports: [CatalogDataModule],
  providers: [ProductsService],
  controllers: [PublicProductsController, AdminProductsController],
  exports: [ProductsService],
})
export class ProductModule {}
