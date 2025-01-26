import { RefreshTokenUseCasePort } from '../../domain/ports/RefreshTokenUseCasePort'
import { TokenService } from '../../domain/ports/TokenService'

export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
  constructor(private tokenService: TokenService) {}

  async refresh(refreshToken: string): Promise<{ newToken: string; newRefresh: string }> {
    // Verify the refresh token
    const { userId, email } = this.tokenService.verifyToken(refreshToken)

    // Generate new tokens
    const newToken = this.tokenService.generateToken(userId, email)
    const newRefresh = this.tokenService.generateRefreshToken(userId, email)

    return { newToken, newRefresh }
  }
}
