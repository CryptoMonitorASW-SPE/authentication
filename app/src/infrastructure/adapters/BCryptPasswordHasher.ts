import bcrypt from 'bcrypt'
import { PasswordHasher } from '../../domain/ports/PasswordHasher'

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly SALT_ROUNDS = 10

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
