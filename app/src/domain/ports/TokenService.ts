import { ValidationTokenPayload } from '../model/ValidationTokenPayload'

/**
 * Interface for token service operations.
 *
 * This interface defines the contract for token generation and verification,
 * providing methods to generate authentication tokens, verify tokens, and generate refresh tokens.
 */
export interface TokenService {
  /**
   * Generates an authentication token for a user.
   *
   * @param userId - The ID of the user
   * @param email - The email of the user
   * @returns The generated authentication token as a string
   */
  generateToken(userId: string, email: string): string

  /**
   * Verifies an authentication token and returns the payload.
   *
   * @param token - The authentication token to verify
   * @returns The payload of the validated token
   */
  verifyToken(token: string): ValidationTokenPayload

  /**
   * Generates a refresh token for a user.
   *
   * @param userId - The ID of the user
   * @param email - The email of the user
   * @returns The generated refresh token as a string
   */
  generateRefreshToken(userId: string, email: string): string
}
