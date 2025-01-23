import { UserRepository } from '../../domain/ports/UserRepository';
import User from '../../domain/entities/User';
import * as bcrypt from 'bcrypt';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = []

  private async saveUser(user: User): Promise<void> {
    this.users.push(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async createUser(email: string, password: string): Promise<User> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User((this.users.length + 1).toString(), email, passwordHash);
    await this.saveUser(newUser);
    return newUser;
  }
}