import { ValidationUseCasePort } from '../../domain/ports/ValidationUseCasePort'
import { TokenService } from '../../domain/ports/TokenService'

export class ValidationUseCase implements ValidationUseCasePort {
  constructor(private tokenService: TokenService) {}

  async validateToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
      const payload = this.tokenService.verifyToken(token)
      return { valid: true, payload }
    } catch (error: any) {
      return { valid: false, error: error.message || 'Invalid token' }
    }
  }
}
