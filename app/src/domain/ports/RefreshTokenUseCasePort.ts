/**
 * Interface for the refresh token use case.
 *
 * This interface defines the contract for refreshing tokens,
 * providing a method to refresh the authentication token using a refresh token.
 */
export interface RefreshTokenUseCasePort {
  /**
   * Refreshes the authentication token using a provided refresh token.
   *
   * @param refreshToken - The refresh token to use for generating new tokens
   * @returns A Promise resolving to an object containing the new authentication token,
   *          new refresh token, user ID, and email.
   */
  refresh(
    refreshToken: string
  ): Promise<{ newToken: string; newRefresh: string; userId: string; email: string }>
}
