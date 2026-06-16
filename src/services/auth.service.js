import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import database from '#config/database.js';
import { User } from '#models/user.model.js';

import logger from '#config/logger.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw new Error('Error hashing', { cause: error });
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparing password: ${error}`);
    throw new Error('Error validating credentials', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const { db } = database;
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, email));
    logger.info(
      `existingUser lookup for ${email}: ${existingUser.length} row(s)`,
    );
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(User)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: User.id,
        name: User.name,
        email: User.email,
        role: User.role,
        created_at: User.createdAt,
      });

    logger.info(`User created successfully: ${newUser.email}`);
    return newUser;
  } catch (error) {
    logger.error(`Error creating user: ${error}`);

    if (error.message === 'User with this email already exists') {
      throw error;
    }
    throw new Error('Error creating user', { cause: error });
  }
};
export const loginUser = async ({ email, password }) => {
  try {
    const { db } = database;
    const [user] = await db.select().from(User).where(eq(User.email, email));

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    logger.error(`Error logging in user: ${error}`);

    if (error.message === 'Invalid email or password') {
      throw error;
    }
    throw new Error('Error logging in user', { cause: error });
  }
};
