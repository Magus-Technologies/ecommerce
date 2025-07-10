// src/app/services/ofertas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Oferta {
  id: number;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  imagen_url?: string;
  banner_imagen_url?: string;
  color_fondo?: string;
  texto_boton: string;
  enlace_url: string;
  mostrar_countdown: boolean;
  es_oferta_principal?: boolean;
  productos?: ProductoOferta[];
}

export interface ProductoOferta {
  id: number;
  nombre: string;
  precio_original: number | string;
  precio_oferta: number | string;
  descuento_porcentaje: number;
  stock_oferta?: number;
  vendidos_oferta: number;
  stock_disponible?: number;
  imagen_url?: string;
  fecha_fin_oferta: string;
  es_flash_sale: boolean;
  categoria?: string;
  marca?: string;
}

export interface OfertaPrincipalResponse {
  oferta_principal: Oferta | null;
  productos: ProductoOferta[];
  mensaje?: string;
}

export interface Cupon {
  id: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  valor_descuento: number;
  compra_minima?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  limite_uso?: number;
  usos_actuales?: number;
  solo_primera_compra?: boolean;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfertasService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  obtenerOfertasPublicas(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/ofertas/publicas`);
  }

  obtenerFlashSales(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/ofertas/flash-sales`);
  }

  obtenerProductosEnOferta(): Observable<ProductoOferta[]> {
    return this.http.get<ProductoOferta[]>(`${this.apiUrl}/ofertas/productos`);
  }

  // ✅ NUEVO MÉTODO: Obtener oferta principal del día
  obtenerOfertaPrincipalDelDia(): Observable<OfertaPrincipalResponse> {
    return this.http.get<OfertaPrincipalResponse>(`${this.apiUrl}/ofertas/principal-del-dia`);
  }

  validarCupon(codigo: string, total: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cupones/validar`, { codigo, total });
  }

    /**
     * Obtener cupones activos para la tienda
     */
    obtenerCuponesActivos(): Observable<Cupon[]> {
      return this.http.get<Cupon[]>(`${this.apiUrl}/cupones/activos`)
        .pipe(
          catchError(error => {
            console.error('Error al obtener cupones activos:', error);
            return of([]); // Retornar array vacío en caso de error
          })
        );
    }

}