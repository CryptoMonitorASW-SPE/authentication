import { ValidationTokenPayload } from '../model/ValidationTokenPayload'

export interface TokenService {
  generateToken(userId: string, email: string): string
  verifyToken(token: string): ValidationTokenPayload
  generateRefreshToken(userId: string, email: string): string
}
