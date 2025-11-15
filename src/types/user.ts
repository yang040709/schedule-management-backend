export interface LoginResponse {
  userId: string
  username: string
  role: string
  token: string
}

export interface LoginFrom {
  username: string
  password: string
}

export interface RegisterFrom {
  username: string
  password: string
  confirmPassword: string
}

export interface User {
  userId: string
  username: string
  role: string
}
