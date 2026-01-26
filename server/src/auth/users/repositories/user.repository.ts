import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Model, Types } from 'mongoose';
import { UserEntity } from '../entities/user-entity.type';
import { CreateUserRecord, UpdateUserRecord } from '../types/user-record.type';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../types/user-role.enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private toEntity(user: UserDocument): UserEntity {
    return {
      id: user._id.toString(),
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: user.password,
      avatar: {
        jpg: user.avatar.jpg,
        webp: user.avatar.webp,
        avif: user.avatar.avif,
      },
      savedProducts: user.savedProducts.map((id) => id.toString()),
      likedArticles: user.likedArticles.map((id) => id.toString()),
      savedArticles: user.savedArticles.map((id) => id.toString()),
      addedReviews: user.addedReviews.map((id) => id.toString()),
      addedComments: user.addedComments.map((id) => id.toString()),
      cart: user.cart,
      orders: user.orders,
      resetToken: user.resetToken,
      resetTokenExpiresAt: user.resetTokenExpiresAt,
    };
  }

  isValidId(id: string): boolean {
    if (!Types.ObjectId.isValid(id)) return false;
    return true;
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!this.isValidId(id)) return null;

    const user = await this.userModel.findById(id).exec();

    if (!user) return null;
    return this.toEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    return this.toEntity(user);
  }

  async create(userData: CreateUserRecord): Promise<UserEntity> {
    const createdUser = await this.userModel.create(userData);
    return this.toEntity(createdUser);
  }

  async update(
    id: string,
    updateData: Partial<UpdateUserRecord>,
  ): Promise<UserEntity | null> {
    if (!this.isValidId(id)) return null;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!updatedUser) return null;
    return this.toEntity(updatedUser);
  }

  async delete(id: string): Promise<UserEntity | null> {
    if (!this.isValidId(id)) return null;

    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result ? this.toEntity(result) : null;
  }

  async isExist(id: string): Promise<boolean> {
    return await this.userModel.exists({ _id: id }).then((exists) => !!exists);
  }
}
