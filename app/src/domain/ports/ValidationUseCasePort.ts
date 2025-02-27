import { ValidationTokenPayload } from '../model/ValidationTokenPayload'

export interface ValidationUseCasePort {
  validateToken(
    token: string
  ): Promise<{ valid: boolean; payload: ValidationTokenPayload; error?: string }>
}
