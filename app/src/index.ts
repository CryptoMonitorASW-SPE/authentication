import express from 'express'
import { BcryptPasswordHasher } from './infrastructure/adapters/BCryptPasswordHasher'
import { JwtTokenService } from './infrastructure/adapters/JwtTokenService'
import { LoginUseCase } from './application/use-cases/LoginUseCase'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { AuthAdapter } from './infrastructure/adapters/AuthAdapter'
import { MongoUserRepository } from './infrastructure/adapters/MongoUserRepository'
import { RefreshTokenUseCase } from './application/use-cases/RefreshTokenUseCase'
import { ValidationUseCase } from './application/use-cases/ValidationUseCase'
//import { InMemoryUserRepository } from './infrastructure/adapters/InMemoryUserRepository'

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

const runApp = async (jwtKey: string) => {
  const configureDependencies = async () => {
    //const userRepository = new InMemoryUserRepository()
    const userRepository = new MongoUserRepository()
    await userRepository.ready
    const passwordHasher = new BcryptPasswordHasher()
    const tokenService = new JwtTokenService(jwtKey)
    const refreshTokenUseCase = new RefreshTokenUseCase(tokenService)
    const validationUseCase = new ValidationUseCase(tokenService)
    const loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasher)
    return {
      userRepository,
      passwordHasher,
      tokenService,
      validationUseCase,
      loginUseCase,
      refreshTokenUseCase
    }
  }

  const dependencies = await configureDependencies()
  console.log('Dependencies configured')

  const authController = new AuthAdapter(
    dependencies.loginUseCase,
    dependencies.userRepository,
    dependencies.validationUseCase,
    dependencies.refreshTokenUseCase
  )

  const app = express()
  app.use(express.json())

  // Create User Endpoint
  app.post('/register', (req, res) => authController.createUser(req, res))

  // Login Endpoint
  app.post('/login', (req, res) => authController.login(req, res))

  // Refresh Token Endpoint
  app.post('/refresh', (req, res) => authController.refresh(req, res))

  app.post('/validate', (req, res) => authController.validate(req, res))

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'event-service',
      timestamp: new Date().toISOString()
    })
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

const jwtKey = process.env.JWT_SIMMETRIC_KEY
if (!jwtKey) {
  throw new Error('JWT_SIMMETRIC_KEY is not defined in the environment variables')
} else {
  runApp(jwtKey)
}
