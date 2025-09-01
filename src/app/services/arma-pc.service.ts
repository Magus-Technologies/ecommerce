// src/app/services/arma-pc.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoriaArmaPC {
  id: number;
  nombre: string;
  img?: string;
  productos_count?: number;
  orden: number;
  activo: boolean;
}

export interface ConfiguracionArmaPcResponse {
  success: boolean;
  message: string;
  categorias: CategoriaArmaPC[];
}

@Injectable({
  providedIn: 'root'
})
export class ArmaPcService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener configuración actual de Arma tu PC (para admin)
   */
  obtenerConfiguracion(): Observable<ConfiguracionArmaPcResponse> {
    return this.http.get<ConfiguracionArmaPcResponse>(`${this.baseUrl}/arma-pc/configuracion`);
  }

  /**
   * Guardar configuración de Arma tu PC (para admin)
   */
  guardarConfiguracion(categorias: CategoriaArmaPC[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/arma-pc/configuracion`, {
      categorias: categorias
    });
  }

  /**
   * Actualizar orden de las categorías (para admin)
   */
  actualizarOrden(categorias: { id: number, orden: number }[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/arma-pc/configuracion/orden`, {
      categorias: categorias
    });
  }

  /**
   * Obtener categorías públicas para Arma tu PC (para usuarios finales)
   */
  obtenerCategoriasPublicas(): Observable<CategoriaArmaPC[]> {
    return this.http.get<CategoriaArmaPC[]>(`${this.baseUrl}/arma-pc/categorias`);
  }
}