import { ProductEntity } from './product-entity.type';
import { ProductsSortKey, SortOrder } from './products-sort.type';

export type FindManyProductsResult = {
  items: ProductEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    sortBy: ProductsSortKey;
    sortOrder: SortOrder;
  };
};
