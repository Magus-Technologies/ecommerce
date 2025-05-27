// src\app\services\usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: {
    nombre: string;
  };
  created_at: string;
  // Agrega otros campos que necesites del backend
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
private apiUrl = `${environment.apiUrl}/usuarios`; // Ajusta según tu configuración

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}
