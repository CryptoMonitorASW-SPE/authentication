import express from 'express'
import { BcryptPasswordHasher } from './infrastructure/adapters/BCryptPasswordHasher'
import { JwtTokenService } from './infrastructure/adapters/JwtTokenService'
import { LoginUseCase } from './application/use-cases/LoginUseCase'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { AuthAdapter } from './infrastructure/adapters/AuthAdapter'
import { MongoUserRepository } from './infrastructure/adapters/MongoUserRepository'
//import { InMemoryUserRepository } from './infrastructure/adapters/InMemoryUserRepository'

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

const runApp = async (jwtKey: string) => {
  const configureDependencies = async () => {
    //const userRepository = new InMemoryUserRepository()
    const userRepository = new MongoUserRepository()
    await userRepository.ready
    const passwordHasher = new BcryptPasswordHasher()
    const tokenService = new JwtTokenService(jwtKey)

    return {
      userRepository,
      passwordHasher,
      tokenService,
      loginUseCase: new LoginUseCase(userRepository, tokenService, passwordHasher)
    }
  }

  const dependencies = await configureDependencies()
  console.log('Dependencies configured')

  const authController = new AuthAdapter(dependencies.loginUseCase, dependencies.userRepository)

  const app = express()
  app.use(express.json())

  // Create User Endpoint
  app.post('/register', (req, res) => authController.createUser(req, res))

  // Login Endpoint
  app.post('/login', (req, res) => authController.login(req, res))

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
