type ProductFindQuery = {
  filters?: {
    q?: string;
    categoryId?: string;
    avgRatingMin?: number;
    avgRatingMax?: number;
    reviewCountMin?: number;
    reviewCountMax?: number;
    priceMin?: number;
    priceMax?: number;
    weightMin?: number;
    weightMax?: number;
    isVegan?: boolean;
    isNewProduct?: boolean;
    cookTimeMin?: number;
    cookTimeMax?: number;
    isActive?: boolean;
    isCategoryActive?: boolean;
  };
  sortKey?:
    | 'title'
    | 'price'
    | 'avgRating'
    | 'reviewCount'
    | 'createdAt'
    | 'updatedAt'
    | 'cookTime'
    | 'weight'
    | 'isNewProduct'
    | 'isVegan'
    | 'isActive';

  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
};
