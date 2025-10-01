import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FormaEnvio {
  id?: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  costo: number;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormaEnvioResponse {
  status: string;
  formas_envio: FormaEnvio[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormaEnvioService {
  private apiUrl = `${environment.apiUrl}/formas-envio`;

  constructor(private http: HttpClient) { }

  // Obtener todas las formas de envío (admin)
  obtenerTodas(): Observable<FormaEnvioResponse> {
    return this.http.get<FormaEnvioResponse>(this.apiUrl).pipe(
      map(response => ({
        ...response,
        formas_envio: response.formas_envio.map(forma => ({
          ...forma,
          costo: Number(forma.costo)
        }))
      }))
    );
  }

  // Obtener solo formas de envío activas (público)
  obtenerActivas(): Observable<FormaEnvioResponse> {
    return this.http.get<FormaEnvioResponse>(`${this.apiUrl}/activas`).pipe(
      map(response => ({
        ...response,
        formas_envio: response.formas_envio.map(forma => ({
          ...forma,
          costo: Number(forma.costo)
        }))
      }))
    );
  }

  // Crear forma de envío
  crear(formaEnvio: FormaEnvio): Observable<any> {
    return this.http.post(this.apiUrl, formaEnvio);
  }

  // Actualizar forma de envío
  actualizar(id: number, formaEnvio: FormaEnvio): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formaEnvio);
  }

  // Toggle estado
  toggleEstado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-estado`, {});
  }

  // Eliminar
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
