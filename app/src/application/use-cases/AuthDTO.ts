export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResultDTO {
  authToken: string
  refreshToken: string
  userId: string
  email: string
}
