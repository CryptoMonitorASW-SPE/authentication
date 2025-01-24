import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenService } from '../../domain/ports/TokenService'

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiration: string | number = '1h'
  ) {}

  generateToken(userId: string, email: string): string {
    var token = jwt.sign({ userId, email }, this.secret)
    return token
  }

  verifyToken(token: string): { userId: string; email: string } {
    return jwt.verify(token, this.secret) as { userId: string; email: string }
  }
}
