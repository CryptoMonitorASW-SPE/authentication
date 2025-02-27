import { ValidationUseCasePort } from '../../domain/ports/ValidationUseCasePort'
import { TokenService } from '../../domain/ports/TokenService'
import { ValidationTokenPayload } from '../../domain/model/ValidationTokenPayload'

export class ValidationUseCase implements ValidationUseCasePort {
  constructor(private tokenService: TokenService) {}

  async validateToken(
    token: string
  ): Promise<{ valid: boolean; payload: ValidationTokenPayload; error?: string }> {
    try {
      const payload: ValidationTokenPayload = this.tokenService.verifyToken(
        token
      ) as unknown as ValidationTokenPayload
      if (!payload) {
        throw new Error('Invalid token')
      }

      return { valid: true, payload }
    } catch (error) {
      let errorMessage = 'Invalid token'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      return { valid: false, payload: {} as ValidationTokenPayload, error: errorMessage }
    }
  }
}
