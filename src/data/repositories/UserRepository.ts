import { prisma } from '../db/prisma';
import type { User } from '../../core/domain/User';

export class UserRepository {
  async findByEmail(email: string): Promise<(User & { password?: string }) | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<(User & { password?: string }) | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
