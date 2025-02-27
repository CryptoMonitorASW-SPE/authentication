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
  constructor(
    private readonly secret: string,
    private readonly expiration: string | number = '1h',
    private readonly refreshExpiration: string | number = '7d'
  ) {}

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

  verifyToken(token: string): ValidationTokenPayload {
    return jwt.verify(token, this.secret) as ValidationTokenPayload
  }
}
