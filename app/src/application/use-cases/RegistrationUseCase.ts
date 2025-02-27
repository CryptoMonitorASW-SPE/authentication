import { injectable, inject } from 'tsyringe'
import { UserRepository } from '../../domain/ports/UserRepository'
import { RegistrationUseCasePort } from '../../domain/ports/RegistrationUseCasePort'
import User from '../../domain/model/User'

@injectable()
export class RegistrationUseCase implements RegistrationUseCasePort {
  constructor(@inject('UserRepository') private userRepository: UserRepository) {}

  async register(email: string, password: string): Promise<User> {
    return await this.userRepository.createUser(email, password)
  }
}
