import { Request, Response } from 'express'
import axios from 'axios'
import { LoginUseCasePort } from '../../domain/ports/LoginUseCasePort'
import { RegistrationUseCasePort } from '../../domain/ports/RegistrationUseCasePort'
import { ValidationUseCasePort } from '../../domain/ports/ValidationUseCasePort'
import { RefreshTokenUseCasePort } from '../../domain/ports/RefreshTokenUseCasePort'
import { ValidationUseCasePort } from '../../domain/ports/ValidationUseCasePort'
import axios from 'axios'

export class AuthAdapter {
  constructor(
    private loginUseCase: LoginUseCase,
    private userRepository: UserRepository,
    private validationUseCase: ValidationUseCasePort,
    private refreshTokenUseCase: RefreshTokenUseCasePort
  ) {}

  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.login(req.body)

      res.cookie('authToken', result.authToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour
      })

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      res.json({
        userId: result.userId,
        email: result.email
      })
    } catch (error) {
      res.status(401).json({
        error: 'Authentication failed ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    }
  }

  async createUser(req: Request, res: Response) {
    const { email, password } = req.body
    try {
      // Create the user locally (or in your primary DB)
      const newUser = await this.userRepository.createUser(email, password)

      const payload = {
        userId: newUser.id,
        email: newUser.email
      }

      const serviceName = process.env.USER_MANAGEMENT_SERVICE_NAME
      const servicePort = process.env.USER_MANAGEMENT_SERVICE_PORT
      if (serviceName && servicePort) {
        const userManagementUrl = `http://${serviceName}:${servicePort}/users`
        await axios.post(userManagementUrl, payload)
      } else {
        console.log(
          'USER_MANAGEMENT_SERVICE_NAME or USER_MANAGEMENT_SERVICE_PORT not set, skipping user save call.'
        )
      }

      res.status(201).json({ message: 'User created', user: newUser })
    } catch (error) {
      // Check for duplicate key error (e.g. if email is already in use)
      if (error instanceof Error && (error as any).code === 11000) {
        res.status(409).json({ error: 'Email already in use' })
      } else {
        res.status(500).json({
          error: 'Error creating user ' + (error instanceof Error ? error.message : 'Unknown error')
        })
      }
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies['refreshToken'] as string

      if (!refreshToken) {
        console.log('AuthAdapter.refresh no refresh token')
        res.status(400).json({ error: 'Missing refresh token' })
        return
      }

      const { newToken, newRefresh, userId, email } =
        await this.refreshTokenUseCase.refresh(refreshToken)

      res.cookie('authToken', newToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour
      })

      res.cookie('refreshToken', newRefresh, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      res.status(201).json({ userId, email })
    } catch (error) {
      console.log('AuthAdapter.refresh error', error)
      res.status(401).json({
        error: 'Invalid refresh token ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      })
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      res.status(500).json({
        error: 'Error during logout ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    }
  }
}
