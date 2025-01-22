import User from '../entities/User';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  saveUser(user: User): Promise<void>;
}