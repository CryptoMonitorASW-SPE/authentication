/**
 * Interface representing the payload of a validated token.
 */
export interface ValidationTokenPayload {
  /**
   * The ID of the user.
   */
  userId: string

  /**
   * The email of the user.
   */
  email: string

  /**
   * The issued at timestamp of the token.
   */
  iat: number

  /**
   * The expiration timestamp of the token.
   */
  exp: number
}
