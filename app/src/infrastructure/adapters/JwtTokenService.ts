import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenService } from '../../domain/ports/TokenService'

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiration: string | number = '1h',
    private readonly refreshExpiration: string | number = '7d'
  ) {}

  generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, this.secret, {
      expiresIn: this.expiration
    } as SignOptions)
  }

  generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, this.secret, {
      expiresIn: this.refreshExpiration
    } as SignOptions)
  }

  verifyToken(token: string): { userId: string; email: string } {
    return jwt.verify(token, this.secret) as { userId: string; email: string }
  }

  refreshToken(refreshToken: string): { newAccessToken: string; newRefreshToken: string } {
    const payload = jwt.verify(refreshToken, this.secret) as { userId: string; email: string }
    const newAccessToken = this.generateToken(payload.userId, payload.email)
    const newRefreshToken = this.generateRefreshToken(payload.userId, payload.email)
    return { newAccessToken, newRefreshToken }
  }
}
