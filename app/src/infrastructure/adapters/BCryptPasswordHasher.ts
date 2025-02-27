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

  /**
   * Hashes a plaintext password using bcrypt.
   *
   * @param password - The plaintext password to hash.
   * @returns A Promise resolving to the hashed password as a string.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  /**
   * Compares a plaintext password against a previously hashed password using bcrypt.
   *
   * @param password - The plaintext password to verify.
   * @param hash - The hashed password to compare against.
   * @returns A Promise resolving to a boolean indicating if the password matches.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
