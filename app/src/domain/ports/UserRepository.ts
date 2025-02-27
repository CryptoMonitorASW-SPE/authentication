import User from '../model/User'

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>

  createUser(email: string, password: string): Promise<User>
}
