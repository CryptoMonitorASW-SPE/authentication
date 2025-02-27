import { injectable } from 'tsyringe'

import bcrypt from 'bcrypt'
import { PasswordHasher } from '../../domain/ports/PasswordHasher'

/**
 * Implementation of the PasswordHasher interface using bcrypt.
 *
 * This class provides methods to hash passwords and compare plaintext passwords
 * against hashed passwords using the bcrypt library.
 */
@injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly SALT_ROUNDS = 10

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
