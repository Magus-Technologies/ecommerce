// src/app/services/categorias-publicas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoriaPublica {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  imagen_url?: string;
  productos_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasPublicasService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO MODIFICADO: Ahora acepta parámetro de sección
  obtenerCategoriasPublicas(seccionId?: number): Observable<CategoriaPublica[]> {
    let params = new HttpParams();
    
    if (seccionId !== undefined && seccionId !== null) {
      params = params.set('seccion', seccionId.toString());
    }
    
    return this.http.get<CategoriaPublica[]>(`${this.apiUrl}/categorias/publicas`, { params });
  }

  // ✅ NUEVO MÉTODO: Específico para obtener categorías de la sección 1
  obtenerCategoriasSeccion1(): Observable<CategoriaPublica[]> {
    return this.obtenerCategoriasPublicas(1);
  }

    // ✅ NUEVO MÉTODO: Específico para obtener categorías de la sección 2 (Laptops)
  obtenerCategoriasSeccion2(): Observable<CategoriaPublica[]> {
    return this.obtenerCategoriasPublicas(2);
  }

  // ✅ NUEVO MÉTODO: Para obtener categorías configuradas de Arma tu PC
  obtenerCategoriasArmaPc(): Observable<CategoriaPublica[]> {
    return this.http.get<CategoriaPublica[]>(`${this.apiUrl}/arma-pc/categorias`);
  }

}