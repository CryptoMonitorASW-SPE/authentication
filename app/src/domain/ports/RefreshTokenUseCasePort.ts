export interface RefreshTokenUseCasePort {
  refresh(refreshToken: string): Promise<{ newToken: string; newRefresh: string }>
}
