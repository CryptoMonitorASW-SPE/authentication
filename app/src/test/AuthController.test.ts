import { expect } from 'chai'
import { Request, Response } from 'express'
import { AuthAdapter } from '../infrastructure/adapters/AuthAdapter'
import { LoginUseCase } from '../application/use-cases/LoginUseCase'
import { InMemoryUserRepository } from '../infrastructure/adapters/InMemoryUserRepository'
import { JwtTokenService } from '../infrastructure/adapters/JwtTokenService'
import { BcryptPasswordHasher } from '../infrastructure/adapters/BCryptPasswordHasher'

describe('AuthController Test Suite', () => {
  let userRepository: InMemoryUserRepository
  let tokenService: JwtTokenService
  let passwordHasher: BcryptPasswordHasher
  let loginUseCase: LoginUseCase
  let authController: AuthAdapter

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    tokenService = new JwtTokenService('secret', '1h')
    passwordHasher = new BcryptPasswordHasher()
    loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasher)
    authController = new AuthAdapter(loginUseCase, userRepository)
  })

  it('should register a new user', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    } as Request

    const res = {
      status: function (statusCode: number) {
        expect(statusCode).to.equal(201)
        return this
      },
      json: function (data: any) {
        expect(data.message).to.equal('User created')
        expect(data.user.email).to.equal('test@example.com')
      }
    } as unknown as Response

    await authController.createUser(req, res)
  })

  it('should login an existing user', async () => {
    const email = 'test@example.com'
    const password = 'password123'
    await userRepository.createUser(email, password)

    const req = {
      body: {
        email: email,
        password: password
      }
    } as Request

    const res = {
      json: function (data: any) {
        expect(data).to.have.property('token')
      },
      status: function (statusCode: number) {
        expect(statusCode).to.equal(200)
        return this
      }
    } as unknown as Response

    await authController.login(req, res)
  })

  it('should fail to login with incorrect password', async () => {
    const email = 'test@example.com'
    const password = 'password123'
    await userRepository.createUser(email, password)

    const req = {
      body: {
        email: email,
        password: 'wrongpassword'
      }
    } as Request

    const res = {
      status: function (statusCode: number) {
        expect(statusCode).to.equal(401)
        return this
      },
      json: function (data: any) {
        expect(data.error).to.include('Authentication failed')
      }
    } as unknown as Response

    await authController.login(req, res)
  })
})
