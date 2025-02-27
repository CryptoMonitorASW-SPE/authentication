import { ValidationTokenPayload } from '../model/ValidationTokenPayload'

/**
 * Interface for the validation use case.
 *
 * This interface defines the contract for validating tokens,
 * providing a method to validate an authentication token.
 */
export interface ValidationUseCasePort {
  /**
   * Validates an authentication token.
   *
   * @param token - The authentication token to validate
   * @returns A Promise resolving to an object containing a boolean indicating if the token is valid,
   *          the payload of the validated token, and an optional error message.
   */
  validateToken(
    token: string
  ): Promise<{ valid: boolean; payload: ValidationTokenPayload; error?: string }>
}
