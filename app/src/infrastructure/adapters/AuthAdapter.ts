import { injectable, inject } from 'tsyringe'
import { Request, Response } from 'express'
import axios from 'axios'
import { LoginUseCasePort } from '../../domain/ports/LoginUseCasePort'
import { RegistrationUseCasePort } from '../../domain/ports/RegistrationUseCasePort'
import { ValidationUseCasePort } from '../../domain/ports/ValidationUseCasePort'
import { RefreshTokenUseCasePort } from '../../domain/ports/RefreshTokenUseCasePort'

/**
 * Adapter class for handling authentication-related HTTP endpoints.
 *
 * This class integrates with various use cases to handle authentication operations
 * such as login, user registration, token refresh, and logout.
 */
@injectable()
export class AuthAdapter {
  /**
   * Constructs a new AuthAdapter.
   *
   * @param loginUseCase - Use case for handling user logins.
   * @param registrationUseCase - Use case for registering new users.
   * @param validationUseCase - Use case for validating authentication tokens.
   * @param refreshTokenUseCase - Use case for handling token refresh operations.
   */
  constructor(
    @inject('LoginUseCasePort') private loginUseCase: LoginUseCasePort,
    @inject('RegistrationUseCasePort') private registrationUseCase: RegistrationUseCasePort,
    @inject('ValidationUseCasePort') private validationUseCase: ValidationUseCasePort,
    @inject('RefreshTokenUseCasePort') private refreshTokenUseCase: RefreshTokenUseCasePort
  ) {}

  /**
   * Handler for user login.
   *
   * **Route:** POST /api/auth/login
   *
   * **Description:** Authenticates a user and sets authentication and refresh tokens as cookies.
   *
   * @param req - Express Request object containing login credentials in the request body.
   * @param res - Express Response object used to send back the login result or an error.
   * @returns {Promise<void>} A promise that resolves after sending a response with the status and login details.
   */
  public async login(req: Request, res: Response): Promise<void> {
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

  /**
   * Handler for creating a new user.
   *
   * **Route:** POST /api/auth/register
   *
   * **Description:** Creates a new user based on provided credentials,
   * and optionally registers the new user in an external service.
   *
   * **Remarks:**
   * - Expects the request body to contain `email` and `password`.
   * - Uses environment variables USER_MANAGEMENT_SERVICE_NAME and USER_MANAGEMENT_SERVICE_PORT
   *   to determine if the user should also be created in an external service.
   *
   * @param req - Express Request object containing `email` and `password` in its body.
   * @param res - Express Response object for sending back the result of the user creation.
   * @returns {Promise<void>} A promise that resolves after sending a response with the status and user details.
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    try {
      const newUser = await this.registrationUseCase.register(email, password)

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
      if (error instanceof Error && (error as any).code === 11000) {
        res.status(409).json({ error: 'Email already in use' })
      } else {
        res.status(500).json({
          error: 'Error creating user ' + (error instanceof Error ? error.message : 'Unknown error')
        })
      }
    }
  }

  /**
   * Handler for refreshing authentication tokens.
   *
   * **Route:** POST /api/auth/refresh
   *
   * **Description:** Uses a refresh token to generate new authentication and refresh tokens.
   *
   * **Remarks:**
   * - The refresh token is expected to be stored in a cookie called `refreshToken`.
   *
   * @param req - Express Request object containing the `refreshToken` cookie.
   * @param res - Express Response object for sending back the new tokens or an error.
   * @returns {Promise<void>} A promise that resolves after sending a response with the new tokens or an error.
   */
  public async refresh(req: Request, res: Response): Promise<void> {
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

  /**
   * Handler for logging out a user.
   *
   * **Route:** POST /api/auth/logout
   *
   * **Description:** Clears the `authToken` and `refreshToken` cookies, effectively logging out the user.
   *
   * @param req - Express Request object.
   * @param res - Express Response object for sending back the logout status.
   * @returns {Promise<void>} A promise that resolves after clearing cookies and sending the response.
   */
  public async logout(req: Request, res: Response): Promise<void> {
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
