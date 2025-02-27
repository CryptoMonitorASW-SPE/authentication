import { RefreshTokenUseCasePort } from '../../domain/ports/RefreshTokenUseCasePort'
import { TokenService } from '../../domain/ports/TokenService'
import { ValidationTokenPayload } from '../../domain/model/ValidationTokenPayload'

export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
  constructor(private tokenService: TokenService) {}

  async refresh(
    refreshToken: string
  ): Promise<{ newToken: string; newRefresh: string; userId: string; email: string }> {
    // Verify the refresh token
    const payload: ValidationTokenPayload = this.tokenService.verifyToken(
      refreshToken
    ) as unknown as ValidationTokenPayload

    // Generate new tokens
    const newToken = this.tokenService.generateToken(payload.userId, payload.email)
    const newRefresh = this.tokenService.generateRefreshToken(payload.userId, payload.email)

    return { newToken, newRefresh, userId: payload.userId, email: payload.email }
  }
}
