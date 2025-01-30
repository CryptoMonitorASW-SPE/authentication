import sinon from 'sinon'
import crypto from 'crypto'
import { InMemoryUserRepository } from '../infrastructure/adapters/InMemoryUserRepository'
import { JwtTokenService } from '../infrastructure/adapters/JwtTokenService'
import { BcryptPasswordHasher } from '../infrastructure/adapters/BCryptPasswordHasher'
import { LoginUseCase } from '../application/use-cases/LoginUseCase'
import { RefreshTokenUseCasePort } from '../domain/ports/RefreshTokenUseCasePort'
import { AuthAdapter } from '../infrastructure/adapters/AuthAdapter'
import { Request, Response } from 'express'
import { ValidationUseCasePort } from '../domain/ports/ValidationUseCasePort'
import { RefreshTokenUseCase } from '../application/use-cases/RefreshTokenUseCase'
import { ValidationUseCase } from '../application/use-cases/ValidationUseCase'
import { expect } from 'chai'

describe('AuthAdapter', () => {
  let userRepository: InMemoryUserRepository
  let tokenService: JwtTokenService
  let passwordHasher: BcryptPasswordHasher
  let loginUseCase: LoginUseCase
  let authController: AuthAdapter
  let validationUseCase: ValidationUseCasePort
  let refreshTokenUseCase: RefreshTokenUseCasePort
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: sinon.SinonStub
  let jsonStub: sinon.SinonStub
  let secretKey: string
  let cookieStub: sinon.SinonStub
  let clearCookieStub: sinon.SinonStub

  beforeEach(() => {
    // Generate a random 256-bit (32-byte) key
    secretKey = crypto.randomBytes(32).toString('hex')

    userRepository = new InMemoryUserRepository()
    tokenService = new JwtTokenService(secretKey, '1h', '7d')
    passwordHasher = new BcryptPasswordHasher()
    loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasher)

    // Create stub instances
    refreshTokenUseCase = new RefreshTokenUseCase(tokenService)
    validationUseCase = new ValidationUseCase(tokenService)

    authController = new AuthAdapter(
      loginUseCase,
      userRepository,
      validationUseCase,
      refreshTokenUseCase
    )

    // Mock Express Request and Response
    req = {
      body: {},
      cookies: {}
    }
    res = {
      status: sinon.stub(),
      json: sinon.stub(),
      cookie: sinon.stub(),
      clearCookie: sinon.stub()
    }
    statusStub = res.status as sinon.SinonStub
    jsonStub = res.json as sinon.SinonStub
    cookieStub = res.cookie as sinon.SinonStub
    clearCookieStub = res.clearCookie as sinon.SinonStub

    // By default, res.status().json() returns res for chaining
    statusStub.returns(res)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should register a new user', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123'
    }

    await authController.createUser(req as Request, res as Response)

    sinon.assert.calledWith(statusStub, 201)
    sinon.assert.calledOnce(jsonStub)

    const response = jsonStub.lastCall.args[0]

    expect(response).to.have.property('message', 'User created')
    expect(response).to.have.property('user')
    expect(response.user).to.include({ email: 'test@example.com' })
    expect(response.user).to.have.property('id')
    expect(response.user).to.have.property('passwordHash')
  })

  it('should login a user and return tokens', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    await authController.login(req as Request, res as Response)

    // Get the response
    const response = jsonStub.lastCall.args[0]

    expect(response).to.have.property('userId', '1')
    expect(response).to.have.property('email', 'login@example.com')

    // Ensure two cookies are set (authToken and refreshToken)
    expect(cookieStub.calledTwice).equal(true)

    // First cookie: authToken
    expect(cookieStub.firstCall.args[0]).to.equal('authToken')
    const authToken = cookieStub.firstCall.args[1]
    expect(authToken).to.be.a('string')
    expect(cookieStub.firstCall.args[2]).to.include({ httpOnly: true })

    // Assert it has JWT-like structure (3 parts separated by '.')
    expect(authToken.split('.')).to.have.length(3)

    // Second cookie: refreshToken
    expect(cookieStub.secondCall.args[0]).to.equal('refreshToken')
    const refreshToken = cookieStub.secondCall.args[1]
    expect(refreshToken).to.be.a('string')
    expect(cookieStub.secondCall.args[2]).to.include({ httpOnly: true })

    // Assert it has JWT-like structure (3 parts separated by '.')
    expect(refreshToken.split('.')).to.have.length(3)
  })

  it('should refresh tokens when provided with a valid refresh token', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    await authController.login(req as Request, res as Response)

    const refreshToken = cookieStub.secondCall.args[1]
    const authToken = cookieStub.firstCall.args[1]

    // Set the refresh token in headers
    req.cookies = {
      refreshToken: refreshToken
    } as Partial<Request['cookies']>

    // Reset the stubs for the refresh test
    jsonStub.resetHistory()
    statusStub.resetHistory()
    cookieStub.resetHistory()

    // Call refresh
    await authController.refresh(req as Request, res as Response)

    const refreshResponse = jsonStub.lastCall.args[0]

    sinon.assert.calledOnce(jsonStub)
    sinon.assert.calledWith(statusStub, 201)

    expect(refreshResponse).to.have.property('userId', '1')
    expect(refreshResponse).to.have.property('email', 'login@example.com')

    // Ensure two cookies are set (authToken and refreshToken)
    expect(cookieStub.calledTwice).equal(true)

    // First cookie: authToken
    expect(cookieStub.firstCall.args[0]).to.equal('authToken')
    const newAuthToken = cookieStub.firstCall.args[1]
    expect(newAuthToken).to.be.a('string')
    expect(cookieStub.firstCall.args[2]).to.include({ httpOnly: true })
    expect(newAuthToken.split('.')).to.have.length(3)

    // Second cookie: refreshToken
    expect(cookieStub.secondCall.args[0]).to.equal('refreshToken')
    const newRefreshToken = cookieStub.secondCall.args[1]
    expect(newRefreshToken).to.be.a('string')
    expect(cookieStub.secondCall.args[2]).to.include({ httpOnly: true })
    expect(newRefreshToken.split('.')).to.have.length(3)

    expect(newAuthToken).to.not.equal(authToken)
    expect(newRefreshToken).to.not.equal(refreshToken)
  })

  // it('should validate a token successfully', async () => {
  //   req.body = {
  //     email: 'login@example.com',
  //     password: 'securepassword'
  //   }

  //   // First, create a user
  //   await userRepository.createUser('login@example.com', 'securepassword')

  //   await authController.login(req as Request, res as Response)

  //   // Get the response
  //   const loginResponse = jsonStub.lastCall.args[0]
  //   const { authToken } = loginResponse

  //   // Set Authorization header
  //   req.headers = {
  //     authorization: `Bearer ${authToken}`
  //   } as Partial<Request['headers']>

  //   jsonStub.resetHistory()
  //   // Call validate
  //   await authController.validate(req as Request, res as Response)

  //   sinon.assert.calledOnce(jsonStub)
  //   sinon.assert.calledWith(statusStub, 200)

  //   const validationResult = jsonStub.lastCall.args[0]

  //   // Assert that the validationResult matches the expected structure
  //   expect(validationResult).to.have.property('valid', true)
  //   expect(validationResult).to.have.property('payload').that.includes({
  //     userId: '1',
  //     email: 'login@example.com'
  //   })
  //   expect(validationResult.payload).to.have.property('iat').that.is.a('number')
  //   expect(validationResult.payload).to.have.property('exp').that.is.a('number')
  // })

  it('should clear auth and refresh cookies and return success message on logout', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    await authController.login(req as Request, res as Response)

    // Reset the stubs for the refresh test
    jsonStub.resetHistory()
    statusStub.resetHistory()
    cookieStub.resetHistory()

    await authController.logout(req as Request, res as Response)

    // Ensure two cookies are cleared (authToken and refreshToken)
    expect(clearCookieStub.calledTwice).equal(true)

    // First cookie: authToken
    expect(clearCookieStub.firstCall.args[0]).to.equal('authToken')
    expect(clearCookieStub.firstCall.args[1]).to.include({
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })

    // Second cookie: refreshToken
    expect(clearCookieStub.secondCall.args[0]).to.equal('refreshToken')
    expect(clearCookieStub.secondCall.args[1]).to.include({
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    })

    sinon.assert.calledOnce(jsonStub)
    sinon.assert.calledWith(statusStub, 200)
    expect(jsonStub.calledOnceWith({ message: 'Logged out successfully' })).equal(true)
  })
})
