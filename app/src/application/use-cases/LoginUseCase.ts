import { injectable, inject } from 'tsyringe'
import { TokenService } from '../../domain/ports/TokenService'
import { UserRepository } from '../../domain/ports/UserRepository'
import { PasswordHasher } from '../../domain/ports/PasswordHasher'
import { LoginCredentials, AuthResultDTO } from '../DTO/AuthDTO'
import { LoginUseCasePort } from '../../domain/ports/LoginUseCasePort'

@injectable()
export class LoginUseCase implements LoginUseCasePort {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('TokenService') private tokenService: TokenService,
    @inject('PasswordHasher') private passwordHasher: PasswordHasher
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResultDTO> {
    const user = await this.userRepository.findByEmail(credentials.email)

    if (!user) {
      throw new Error('Cant find email')
    }

    const isPasswordValid = await this.passwordHasher.compare(
      credentials.password,
      user.passwordHash
    )
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }

    return {
      authToken: this.tokenService.generateToken(user.id, user.email),
      refreshToken: this.tokenService.generateRefreshToken(user.id, user.email),
      userId: user.id,
      email: user.email
    }
  }
}
