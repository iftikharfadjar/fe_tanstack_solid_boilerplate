import { createServerFn } from '@tanstack/start';
import * as bcrypt from 'bcryptjs';
import { userRepository } from '../../data/repositories/UserRepository';
import { createSession, deleteSession, verifySession } from './session';

export const signupFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    // Basic validation
    if (typeof data !== 'object' || data === null) throw new Error('Invalid data');
    const { email, password } = data as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid email or password');
    }
    return { email, password };
  })
  .handler(async ({ data }) => {
    const { email, password } = data;
    
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, passwordHash });
    
    await createSession(user.id);
    return { success: true, user };
  });

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (typeof data !== 'object' || data === null) throw new Error('Invalid data');
    const { email, password } = data as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid email or password');
    }
    return { email, password };
  })
  .handler(async ({ data }) => {
    const { email, password } = data;
    
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    await createSession(user.id);
    // return without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  });

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    deleteSession();
    return { success: true };
  });

export const getSessionUserFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await verifySession();
    if (!userId) return null;
    
    const user = await userRepository.findById(userId);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
