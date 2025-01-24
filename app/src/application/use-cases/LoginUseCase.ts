import { TokenService } from '../../domain/ports/TokenService'
import { UserRepository } from '../../domain/ports/UserRepository'
import { PasswordHasher } from '../../domain/ports/PasswordHasher'
import { LoginCredentials, AuthResultDTO } from './AuthDTO'

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private passwordHasher: PasswordHasher
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
      token: this.tokenService.generateToken(user.id, user.email),
      userId: user.id,
      email: user.email
    }
  }
}
