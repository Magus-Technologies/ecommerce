// src/app/models/user.model.ts
export interface User {
  id: number;
  name?: string;
  email: string;
  roles: string[];
  permissions: string[];
   tipo_usuario?: 'admin' | 'cliente';
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

   tipo_usuario: 'admin' | 'cliente'; // NUEVO
  user: {
    id: number;
    name?: string;
    nombre_completo?: string; // Para clientes
    email: string;
    roles: string[];
    permissions: string[];
    email_verified_at?: string;
  };
  token: string;
}
