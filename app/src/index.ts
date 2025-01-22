import { InMemoryUserRepository } from './infrastructure/adapters/InMemoryUserRepository';
import { BcryptPasswordHasher } from './infrastructure/adapters/BCryptPasswordHasher';
import { JwtTokenService } from './infrastructure/adapters/JwtTokenService';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import User from './domain/entities/User';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

//dotenv.config({ path: resolve(__dirname, '../../../.env') });
//console.log(process.env.JWT_SIMMETRIC_KEY);

// Configurazione temporanea per sviluppo
export const configureDependencies = () => {
  const userRepository = new InMemoryUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService('SECRETSECRET');

  return {
    userRepository,
    passwordHasher,
    tokenService,
    loginUseCase: new LoginUseCase(userRepository, tokenService, passwordHasher)
  };
};

// Test end-to-end semplificato
const dependencies = configureDependencies();

const createAndLoginUser = async () => {
  try {
    const newUser = await dependencies.userRepository.createUser('test@example.com', 'plain_password');
    console.log('New user created:', newUser);

    const res = await dependencies.loginUseCase.execute({
      email: 'test@example.com',
      password: 'plain_password'
    });
    console.log('Login successful', res);
  } catch (error) {
    console.error('Error:', error);
  }
};

createAndLoginUser().then(() => {
  
}).catch((error) => {
  console.error('Error executing account function:', error);
});



