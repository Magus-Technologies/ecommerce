import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Direccion {
  id: number;
  nombre_destinatario: string;
  direccion_completa: string;
  ubigeo_id: string;
  telefono?: string;
  predeterminada: boolean;
  activa: boolean;
  ubigeo?: {
    departamento: string;
    provincia: string;
    distrito: string;
  };
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {
  private baseUrl = `${environment.apiUrl}/mis-direcciones`;

  constructor(private http: HttpClient) {}

  obtenerDirecciones(): Observable<{status: string, direcciones: Direccion[]}> {
    return this.http.get<{status: string, direcciones: Direccion[]}>(`${this.baseUrl}`);
  }

  crearDireccion(direccion: Partial<Direccion>): Observable<any> {
    return this.http.post(`${this.baseUrl}`, direccion);
  }

  actualizarDireccion(id: number, direccion: Partial<Direccion>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, direccion);
  }

  eliminarDireccion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  establecerPredeterminada(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/predeterminada`, {});
  }
}