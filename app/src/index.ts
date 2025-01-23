import express from 'express';
import { InMemoryUserRepository } from './infrastructure/adapters/InMemoryUserRepository';
import { BcryptPasswordHasher } from './infrastructure/adapters/BCryptPasswordHasher';
import { JwtTokenService } from './infrastructure/adapters/JwtTokenService';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { AuthController } from './infrastructure/controllers/AuthController';
import { MongoUserRepository } from './infrastructure/adapters/MongoUserRepository';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

interface Dependencies {
  userRepository: MongoUserRepository;
  passwordHasher: BcryptPasswordHasher;
  tokenService: JwtTokenService;
  loginUseCase: LoginUseCase;
}

const jwtKey = process.env.JWT_SIMMETRIC_KEY;
if (!jwtKey) {
  throw new Error('JWT_SIMMETRIC_KEY is not defined in the environment variables');
}
else{
  const userRepository = new MongoUserRepository();
  userRepository.ready
    .then(() => 
      initialiseApp(jwtKey)
  )
  .catch(err => console.error('Error initializing user repository', err));
}

const initialiseApp = async (jwtKey: string) => {
  const configureDependencies = async () => {
    //const userRepository = new InMemoryUserRepository();
    const userRepository = new MongoUserRepository();
    await userRepository.ready;
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService(jwtKey);
  
    return {
      userRepository,
      passwordHasher,
      tokenService,
      loginUseCase: new LoginUseCase(userRepository, tokenService, passwordHasher)
    };
    };
  
    const dependencies = await configureDependencies();
    console.log('Dependencies configured');

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
}


