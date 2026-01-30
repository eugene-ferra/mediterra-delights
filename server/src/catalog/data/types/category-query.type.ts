type CategoryFindQuery = {
  filters?: {
    q?: string;
    isActive?: boolean;
  };
  sortKey?: 'title' | 'createdAt' | 'isActive';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
};
