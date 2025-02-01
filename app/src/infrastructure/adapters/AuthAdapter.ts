import { Request, Response } from 'express'
import { LoginUseCase } from '../../application/use-cases/LoginUseCase'
import { UserRepository } from '../../domain/ports/UserRepository'
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

      const response = await axios.post('http://user-management:3000/users', payload)

      console.log('Response from user-management:', response.data)
      console.log('User created locally:', newUser)

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

  // async validate(req: Request, res: Response): Promise<void> {
  //   try {
  //     // Assume the token is sent in the Authorization header as "Bearer <token>"
  //     const authHeader = req.headers['authorization']
  //     if (!authHeader) {
  //       res.status(400).json({ error: 'Missing Authorization header' })
  //       return
  //     }

  //     const token = authHeader.split(' ')[1]
  //     if (!token) {
  //       res.status(400).json({ error: 'Missing token' })
  //       return
  //     }

  //     const validationResult = await this.validationUseCase.validateToken(token)

  //     if (validationResult.valid) {
  //       res.status(200).json({ valid: true, payload: validationResult.payload })
  //     } else {
  //       res.status(401).json({ valid: false, error: validationResult.error })
  //     }
  //   } catch (error: unknown) {
  //     res
  //       .status(500)
  //       .json({
  //         valid: false,
  //         error: 'Server error ' + (error instanceof Error ? error.message : 'Unknown error')
  //       })
  //   }
  // }
}
