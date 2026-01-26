import { UserRole } from './user-role.enum';

export type CreateUserRecord = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRecord = Partial<CreateUserRecord>;
