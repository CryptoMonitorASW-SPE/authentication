import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import { JwtTokenService } from '../infrastructure/adapters/JwtTokenService'
import { ValidationTokenPayload } from '../domain/model/ValidationTokenPayload'
import crypto from 'crypto'

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService
  let secretKey: string

  beforeEach(() => {
    // Generate a random 256-bit (32-byte) key
    secretKey = crypto.randomBytes(32).toString('hex')
    jwtTokenService = new JwtTokenService(secretKey, '1h', '7d')
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = '123'
      const email = 'test@example.com'
      const token = jwtTokenService.generateToken(userId, email)

      const decoded = jwt.verify(token, secretKey) as ValidationTokenPayload
      expect(decoded).to.have.property('userId', userId)
      expect(decoded).to.have.property('email', email)
      expect(decoded).to.have.property('jti')
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh JWT token', () => {
      const userId = '123'
      const email = 'test@example.com'
      const token = jwtTokenService.generateRefreshToken(userId, email)

      const decoded = jwt.verify(token, secretKey) as ValidationTokenPayload
      expect(decoded).to.have.property('userId', userId)
      expect(decoded).to.have.property('email', email)
      expect(decoded).to.have.property('jti')
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid JWT token and return the payload', () => {
      const userId = '123'
      const email = 'test@example.com'
      const token = jwtTokenService.generateToken(userId, email)

      const payload = jwtTokenService.verifyToken(token)
      expect(payload).to.have.property('userId', userId)
      expect(payload).to.have.property('email', email)
      expect(payload).to.have.property('jti')
    })

    it('should throw an error for an invalid JWT token', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => jwtTokenService.verifyToken(invalidToken)).to.throw(jwt.JsonWebTokenError)
    })
  })
})
