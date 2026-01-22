import { IsIn, IsNotEmpty } from 'class-validator';
import { ReviewStatus } from '../types/review-status.enum';

export class ModerateReviewDto {
  @IsIn([ReviewStatus.APPROVED, ReviewStatus.REJECTED])
  @IsNotEmpty({ message: 'Status is required' })
  status!: ReviewStatus.APPROVED | ReviewStatus.REJECTED;
}
