import { assert } from 'chai'
import sinon from 'sinon'
import { InMemoryUserRepository } from '../infrastructure/adapters/InMemoryUserRepository'
import { JwtTokenService } from '../infrastructure/adapters/JwtTokenService'
import { BcryptPasswordHasher } from '../infrastructure/adapters/BCryptPasswordHasher'
import { LoginUseCase } from '../application/use-cases/LoginUseCase'
import { RefreshTokenUseCasePort } from '../domain/ports/RefreshTokenUseCasePort'
import { AuthAdapter } from '../infrastructure/adapters/AuthAdapter'
import { Request, Response } from 'express'

// Stub class implementing RefreshTokenUseCasePort
class RefreshTokenUseCaseStub implements RefreshTokenUseCasePort {
  refresh: sinon.SinonStub<[string], Promise<{ newToken: string; newRefresh: string }>>

  constructor() {
    this.refresh = sinon.stub()
  }
}

describe('AuthController', () => {
  let userRepository: InMemoryUserRepository
  let tokenService: JwtTokenService
  let passwordHasher: BcryptPasswordHasher
  let loginUseCase: LoginUseCase
  let refreshTokenUseCase: RefreshTokenUseCaseStub
  let authController: AuthAdapter
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: sinon.SinonStub
  let jsonStub: sinon.SinonStub

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    tokenService = new JwtTokenService('secret', '1h', '7d')
    passwordHasher = new BcryptPasswordHasher()
    loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasher)

    // Create a stub instance of RefreshTokenUseCasePort
    refreshTokenUseCase = new RefreshTokenUseCaseStub()

    authController = new AuthAdapter(loginUseCase, userRepository, refreshTokenUseCase)

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

    const createUserStub = sinon.stub(userRepository, 'createUser').resolves({
      id: 'user123',
      email: 'test@example.com',
      passwordHash: await passwordHasher.hash('password123')
    })

    await authController.createUser(req as Request, res as Response)

    assert.isTrue(
      createUserStub.calledOnceWith('test@example.com', 'password123'),
      'createUser should be called once with correct arguments'
    )
    assert.isTrue(statusStub.calledOnceWith(201), 'status should be called once with 201')
    assert.isTrue(jsonStub.calledOnce, 'json should be called once')
    const responseArg = jsonStub.firstCall.args[0]
    assert.propertyVal(responseArg, 'message', 'User created', 'Response message should be correct')
    assert.property(responseArg, 'user', 'Response should contain user')
    assert.propertyVal(
      responseArg.user,
      'email',
      'test@example.com',
      'User email should be correct'
    )
  })

  it('should login a user and return tokens', async () => {
    req.body = {
      email: 'login@example.com',
      password: 'securepassword'
    }

    // First, create a user
    await userRepository.createUser('login@example.com', 'securepassword')

    const loginUseCaseSpy = sinon.spy(loginUseCase, 'login')

    await authController.login(req as Request, res as Response)

    assert.isTrue(
      loginUseCaseSpy.calledOnceWith(req.body),
      'loginUseCase.login should be called once with correct arguments'
    )
    assert.isTrue(jsonStub.calledOnce, 'json should be called once')
    const responseArg = jsonStub.firstCall.args[0]
    assert.property(responseArg, 'authToken', 'Response should contain authToken')
    assert.property(responseArg, 'refreshToken', 'Response should contain refreshToken')
    assert.property(responseArg, 'userId', 'Response should contain userId')
    assert.propertyVal(responseArg, 'email', 'login@example.com', 'User email should be correct')
  })

  it('should refresh tokens when provided with a valid refresh token', async () => {
    const fakeNewToken = 'new.jwt.token'
    const fakeNewRefreshToken = 'new.refresh.token'

    req.headers = {
      'x-refresh-token': 'validRefreshToken'
    } as Partial<Request['headers']>

    // Set up the refreshTokenUseCase to return new tokens
    refreshTokenUseCase.refresh.resolves({
      newToken: fakeNewToken,
      newRefresh: fakeNewRefreshToken
    })

    await authController.refresh(req as Request, res as Response)

    assert.isTrue(
      refreshTokenUseCase.refresh.calledOnceWith('validRefreshToken'),
      'refresh should be called once with correct refresh token'
    )
    assert.isTrue(
      jsonStub.calledOnceWith({
        token: fakeNewToken,
        refreshToken: fakeNewRefreshToken
      }),
      'json should be called once with new tokens'
    )
  })

  it('should return 400 if refresh token is missing', async () => {
    req.headers = {} as Partial<Request['headers']>

    await authController.refresh(req as Request, res as Response)

    assert.isTrue(refreshTokenUseCase.refresh.notCalled, 'refresh should not be called')
    assert.isTrue(statusStub.calledOnceWith(400), 'status should be called once with 400')
    assert.isTrue(
      jsonStub.calledOnceWith({ error: 'Missing refresh token' }),
      'json should be called once with error message'
    )
  })

  it('should return 401 if refresh token is invalid', async () => {
    req.headers = {
      'x-refresh-token': 'invalidRefreshToken'
    } as Partial<Request['headers']>

    // Set up the refreshTokenUseCase to throw an error
    refreshTokenUseCase.refresh.rejects(new Error('Invalid token'))

    await authController.refresh(req as Request, res as Response)

    assert.isTrue(
      refreshTokenUseCase.refresh.calledOnceWith('invalidRefreshToken'),
      'refresh should be called once with invalid refresh token'
    )
    assert.isTrue(statusStub.calledOnceWith(401), 'status should be called once with 401')
    assert.isTrue(
      jsonStub.calledOnceWith({ error: 'Invalid refresh token Error: Invalid token' }),
      'json should be called once with error message'
    )
  })
})
