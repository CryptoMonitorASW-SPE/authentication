import User from '../model/User'

/**
 * Interface for the registration use case.
 *
 * This interface defines the contract for user registration operations,
 * providing a method to register new users with their credentials.
 */
export interface RegistrationUseCasePort {
  /**
   * Registers a new user with the provided email and password.
   *
   * @param email - The email of the new user
   * @param password - The password of the new user
   * @returns A Promise resolving to the newly created user
   * @throws Error if registration fails
   */
  register(email: string, password: string): Promise<User>
}
