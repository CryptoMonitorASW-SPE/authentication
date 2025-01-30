import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenService } from '../../domain/ports/TokenService'
import { ValidationTokenPayload } from '../../domain/ports/ValidationTokenPayload'
import { randomUUID } from 'crypto'

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
