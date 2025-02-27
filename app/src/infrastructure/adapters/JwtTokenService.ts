import { injectable } from 'tsyringe'
import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenService } from '../../domain/ports/TokenService'
import { ValidationTokenPayload } from '../../domain/model/ValidationTokenPayload'
import { randomUUID } from 'crypto'

/**
 * Implementation of the TokenService interface using JWT.
 *
 * This class provides methods to generate authentication tokens, generate refresh tokens,
 * and verify tokens using the JSON Web Token (JWT) library.
 */
@injectable()
export class JwtTokenService implements TokenService {
  /**
   * Constructs a new JwtTokenService.
   *
   * @param secret - The secret key used to sign the tokens.
   * @param expiration - The expiration time for the authentication tokens (default is '1h').
   * @param refreshExpiration - The expiration time for the refresh tokens (default is '7d').
   */
  constructor(
    private readonly secret: string,
    private readonly expiration: string | number = '1h',
    private readonly refreshExpiration: string | number = '7d'
  ) {}

  /**
   * Generates an authentication token for a user.
   *
   * @param userId - The ID of the user.
   * @param email - The email of the user.
   * @returns The generated authentication token as a string.
   */
  generateToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
        jti: randomUUID()
      },
      this.secret,
      {
        expiresIn: this.expiration
      } as SignOptions
    )
  }

  /**
   * Generates a refresh token for a user.
   *
   * @param userId - The ID of the user.
   * @param email - The email of the user.
   * @returns The generated refresh token as a string.
   */
  generateRefreshToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
        jti: randomUUID()
      },
      this.secret,
      {
        expiresIn: this.refreshExpiration
      } as SignOptions
    )
  }

  /**
   * Verifies an authentication token and returns the payload.
   *
   * @param token - The authentication token to verify.
   * @returns The payload of the validated token.
   */
  verifyToken(token: string): ValidationTokenPayload {
    return jwt.verify(token, this.secret) as ValidationTokenPayload
  }
}
