import { LoginCredentials, AuthResultDTO } from '../../application/DTO/AuthDTO'

/**
 * Interface for the login use case.
 *
 * This interface defines the contract for authentication operations,
 * providing a method to authenticate users with their credentials.
 */
export interface LoginUseCasePort {
  /**
   * Authenticates a user with the provided credentials.
   *
   * @param credentials - The login credentials containing email and password
   * @returns A Promise resolving to an authentication result object containing
   *          the authentication token, refresh token, user ID, and email
   * @throws Error if authentication fails
   */
  login(credentials: LoginCredentials): Promise<AuthResultDTO>
}
