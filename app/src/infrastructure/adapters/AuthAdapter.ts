import { Request, Response } from 'express'
import { LoginUseCase } from '../../application/use-cases/LoginUseCase'
import { UserRepository } from '../../domain/ports/UserRepository'
import { RefreshTokenUseCasePort } from '../../domain/ports/RefreshTokenUseCasePort'

export class AuthAdapter {
  constructor(
    private loginUseCase: LoginUseCase,
    private userRepository: UserRepository,
    private refreshTokenUseCase: RefreshTokenUseCasePort
  ) {}

  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.login(req.body)
      res.json(result)
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed ' + error })
    }
  }

  async createUser(req: Request, res: Response) {
    const { email, password } = req.body
    try {
      const newUser = await this.userRepository.createUser(email, password)
      res.status(201).json({ message: 'User created', user: newUser })
    } catch (error) {
      res.status(500).json({ error: 'Error creating user ' + error })
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.headers['x-refresh-token'] as string
      if (!refreshToken) {
        res.status(400).json({ error: 'Missing refresh token' })
        return
      }
      const { newToken, newRefresh } = await this.refreshTokenUseCase.refresh(refreshToken)
      res.json({ token: newToken, refreshToken: newRefresh })
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token ' + error })
    }
  }
}
