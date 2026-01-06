// src/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private ensureObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
  }

  private isDuplicateKeyError(err: unknown): err is { code: number } {
    return typeof err === 'object' && err !== null && 'code' in err;
  }

  async create(dto: CreateUserDto): Promise<User | null> {
    // Fast pre-check (still need DB unique index for race conditions)
    const exists = await this.userModel.exists({ email: dto.email });
    if (exists)
      throw new ConflictException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    try {
      const created = await this.userModel.create({
        ...dto,
        role: 'user',
        password: hashedPassword,
      });

      return this.userModel.findById(created._id).lean().exec();
    } catch (err: unknown) {
      // Race-condition safe: unique index violation
      if (this.isDuplicateKeyError(err) && (err as any).code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<User | null> {
    this.ensureObjectId(id);
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    this.ensureObjectId(id);

    const payload: UpdateUserDto = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.lastName !== undefined) payload.lastName = dto.lastName;
    if (dto.phone !== undefined) payload.phone = dto.phone;
    // avatar update should be handled separately (files module), so not here for MVP

    const updated = await this.userModel
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();

    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async changePassword(
    id: string,
    dto: UpdateUserPasswordDto,
  ): Promise<{ changed: true }> {
    this.ensureObjectId(id);

    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.oldPassword, user.password as string);
    if (!ok) throw new BadRequestException('Incorrect current password');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await user.save();

    return { changed: true };
  }

  async delete(id: string): Promise<{ deleted: true }> {
    this.ensureObjectId(id);

    const deleted = await this.userModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('User not found');

    return { deleted: true };
  }
}
