import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { toBool } from 'src/common/ validators/to-bool';
import { toNum } from 'src/common/ validators/to-num';

export class FindManyReviewsQueryDto {
  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['createdAt', 'rating'])
  sortBy?: 'createdAt' | 'rating';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  productId?: string;
}
