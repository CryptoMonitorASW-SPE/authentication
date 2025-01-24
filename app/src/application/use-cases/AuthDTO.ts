export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResultDTO {
  token: string
  userId: string
  email: string
}
