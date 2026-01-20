import { Module } from '@nestjs/common';
import { CatalogDataModule } from '../data/catalog-data.module';
import { CategoryService } from './category.service';
import { PublicCategoryController } from './controllers/public-category.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';

@Module({
  imports: [CatalogDataModule],
  providers: [CategoryService],
  controllers: [PublicCategoryController, AdminCategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
