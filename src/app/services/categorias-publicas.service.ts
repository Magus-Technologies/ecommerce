import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  obtenerCategoriasPublicas(): Observable<CategoriaPublica[]> {
    return this.http.get<CategoriaPublica[]>(`${this.apiUrl}/categorias/publicas`);
  }
}