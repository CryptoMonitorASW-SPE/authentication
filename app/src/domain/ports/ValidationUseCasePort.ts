export interface ValidationUseCasePort {
  validateToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }>
}
