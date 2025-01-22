import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}