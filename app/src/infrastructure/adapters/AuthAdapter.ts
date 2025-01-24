import { Request, Response } from 'express'
import { LoginUseCase } from '../../application/use-cases/LoginUseCase'
import { UserRepository } from '../../domain/ports/UserRepository'

export class AuthAdapter {
  constructor(
    private loginUseCase: LoginUseCase,
    private userRepository: UserRepository
  ) {}

  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.login(req.body)
      res.json(result)
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed ' + error })
    }
  }

  async createUser(req: Request, res: Response) {
    const { email, password } = req.body
    try {
      const newUser = await this.userRepository.createUser(email, password)
      res.status(201).json({ message: 'User created', user: newUser })
    } catch (error) {
      res.status(500).json({ error: 'Error creating user ' + error })
    }
  }
}
