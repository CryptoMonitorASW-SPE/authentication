import User from '../model/User'

/**
 * Interface for user repository operations.
 *
 * This interface defines the contract for user-related database operations,
 * providing methods to find a user by email and create a new user.
 */
export interface UserRepository {
  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to find
   * @returns A Promise resolving to the user if found, or null if not found
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Creates a new user with the given email and password.
   *
   * @param email - The email address of the new user
   * @param password - The password of the new user
   * @returns A Promise resolving to the created user
   */
  createUser(email: string, password: string): Promise<User>
}
