import User from '../entities/User';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  createUser(email: string, password: string): Promise<User>;

  saveUser(user: User): Promise<void>;
}