import { assert } from 'chai'
import sinon from 'sinon'
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

// Stub class implementing RefreshTokenUseCasePort
// class RefreshTokenUseCaseStub implements RefreshTokenUseCasePort {
//   refresh: sinon.SinonStub<[string], Promise<{ newToken: string; newRefresh: string }>>

//   constructor() {
//     this.refresh = sinon.stub()
//   }
// }

// // Stub class implementing ValidationUseCasePort
// import { ValidationUseCasePort } from '../domain/ports/ValidationUseCasePort'

// class ValidationUseCaseStub implements ValidationUseCasePort {
//   validateToken: sinon.SinonStub<[string], Promise<{ valid: boolean; payload?: any; error?: string }>>

//   constructor() {
//     this.validateToken = sinon.stub()
//   }
// }

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

  beforeEach(() => {
    const crypto = require('crypto')

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
    req = {}
    res = {
      status: sinon.stub(),
      json: sinon.stub()
    }
    statusStub = res.status as sinon.SinonStub
    jsonStub = res.json as sinon.SinonStub

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

    const result = await authController.createUser(req as Request, res as Response)

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

    // Assert that authToken and refreshToken are present and are strings
    expect(response).to.have.property('authToken').that.is.a('string')
    expect(response).to.have.property('refreshToken').that.is.a('string')
    expect(response).to.have.property('userId', '1')
    expect(response).to.have.property('email', 'login@example.com')

    // Assert that the tokens have three parts separated by dots (basic JWT structure)
    expect(response.authToken.split('.')).to.have.lengthOf(3)
    expect(response.refreshToken.split('.')).to.have.lengthOf(3)
  })

  it('should refresh tokens when provided with a valid refresh token', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    await authController.login(req as Request, res as Response)

    // Get the response
    const loginResponse = jsonStub.lastCall.args[0]

    const { refreshToken } = loginResponse

    // Set the refresh token in headers
    req.headers = {
      'x-refresh-token': refreshToken
    } as Partial<Request['headers']>

    jsonStub.resetHistory()
    // Call refresh
    await authController.refresh(req as Request, res as Response)

    const refreshResponse = jsonStub.lastCall.args[0]

    sinon.assert.calledOnce(jsonStub)
    sinon.assert.calledWith(statusStub, 201)

    expect(refreshResponse).to.have.property('token').that.is.a('string')
    expect(refreshResponse).to.have.property('refreshToken').that.is.a('string')

    // Assert JWT structure
    expect(refreshResponse.token.split('.')).to.have.lengthOf(3)
    expect(refreshResponse.refreshToken.split('.')).to.have.lengthOf(3)
  })

  it('should validate a token successfully', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    await authController.login(req as Request, res as Response)

    // Get the response
    const loginResponse = jsonStub.lastCall.args[0]
    const { authToken } = loginResponse

    // Set Authorization header
    req.headers = {
      authorization: `Bearer ${authToken}`
    } as Partial<Request['headers']>

    jsonStub.resetHistory()
    // Call validate
    await authController.validate(req as Request, res as Response)

    sinon.assert.calledOnce(jsonStub)
    sinon.assert.calledWith(statusStub, 200)

    const validationResult = jsonStub.lastCall.args[0]

    // Assert that the validationResult matches the expected structure
    expect(validationResult).to.have.property('valid', true)
    expect(validationResult).to.have.property('payload').that.includes({
      userId: '1',
      email: 'login@example.com'
    })
    expect(validationResult.payload).to.have.property('iat').that.is.a('number')
    expect(validationResult.payload).to.have.property('exp').that.is.a('number')
  })
})
