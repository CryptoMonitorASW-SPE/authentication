/**
 * Interface for password hashing operations.
 *
 * This interface defines the contract for password hashing implementations,
 * providing methods to hash passwords and verify them against stored hashes.
 */
export interface PasswordHasher {
  /**
   * Hashes a plaintext password using a secure algorithm.
   *
   * @param password - The plaintext password to hash
   * @returns A Promise resolving to the hashed password as a string
   */
  hash(password: string): Promise<string>

  /**
   * Compares a plaintext password against a previously hashed password.
   *
   * @param password - The plaintext password to verify
   * @param hash - The hashed password to compare against
   * @returns A Promise resolving to a boolean indicating if the password matches
   */
  compare(password: string, hash: string): Promise<boolean>
}
