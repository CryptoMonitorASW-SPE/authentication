import jwt from 'jsonwebtoken';
import { TokenService } from '../../domain/ports/TokenService';

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string, private readonly expiration: string = '1h') {}

  generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, this.secret, { expiresIn: this.expiration });
  }

  verifyToken(token: string): { userId: string; email: string } {
    return jwt.verify(token, this.secret) as { userId: string; email: string };
  }
}