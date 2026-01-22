import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './models/review.schema';
import { ReviewsService } from './services/review.service';
import { ProductModule } from 'src/catalog/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { ReviewsRepository } from './repositories/review.repository';
import { AdminReviewsController } from './controllers/admin-review.controller';
import { UserReviewsController } from './controllers/user-review.controller';
import { PublicReviewsController } from './controllers/public-review.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ProductModule,
    UsersModule,
  ],
  controllers: [
    AdminReviewsController,
    UserReviewsController,
    PublicReviewsController,
  ],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewModule {}
