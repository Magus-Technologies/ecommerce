// src/app/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}
