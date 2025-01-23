import express from 'express';
import { InMemoryUserRepository } from './infrastructure/adapters/InMemoryUserRepository';
import { BcryptPasswordHasher } from './infrastructure/adapters/BCryptPasswordHasher';
import { JwtTokenService } from './infrastructure/adapters/JwtTokenService';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { AuthController } from './infrastructure/controllers/AuthController';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

const jwtKey = process.env.JWT_SIMMETRIC_KEY;
if (!jwtKey) {
  throw new Error('JWT_SIMMETRIC_KEY is not defined in the environment variables');
}

export const configureDependencies = () => {
  const userRepository = new InMemoryUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(jwtKey);

  return {
    userRepository,
    passwordHasher,
    tokenService,
    loginUseCase: new LoginUseCase(userRepository, tokenService, passwordHasher)
  };
};

const dependencies = configureDependencies();

const authController = new AuthController(dependencies.loginUseCase, dependencies.userRepository);

const app = express();
app.use(express.json());

// Create User Endpoint
app.post('/register', (req, res) => authController.createUser(req, res));

// Login Endpoint
app.post('/login', (req, res) => authController.login(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});