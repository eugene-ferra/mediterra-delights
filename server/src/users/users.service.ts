import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user-entity.type';
import { UserRepository } from './repositories/user.repository';
import { UserRole } from './types/user-role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.userRepo.findByEmail(dto.email);

    if (exists)
      throw new ConflictException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const created = await this.userRepo.create({
      name: dto.name,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return created;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findByEmail(email);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const payload: UpdateUserDto = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.lastName !== undefined) payload.lastName = dto.lastName;
    if (dto.phone !== undefined) payload.phone = dto.phone;

    const updated = await this.userRepo.update(id, payload);

    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async changePassword(
    id: string,
    dto: UpdateUserPasswordDto,
  ): Promise<{ changed: true }> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.oldPassword, user.password as string);
    if (!ok)
      throw new UnprocessableEntityException('Incorrect current password');

    const newPass = await bcrypt.hash(dto.newPassword, 12);

    await this.userRepo.update(id, { password: newPass });

    return { changed: true };
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const deletedUser = await this.userRepo.delete(id);
    if (!deletedUser) throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async isExist(id: string): Promise<boolean> {
    return this.userRepo.isExist(id);
  }
}
