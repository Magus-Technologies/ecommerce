// src/app/services/ofertas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  imagen_url?: string;
  fecha_fin_oferta: string;
  es_flash_sale: boolean;
  categoria?: string; // ✅ Agregada esta propiedad opcional
  marca?: string; // ✅ Agregada esta propiedad opcional
}

export interface Cupon {
  id: number;
  codigo: string;
  titulo: string;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  valor_descuento: number;
  compra_minima?: number;
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

  validarCupon(codigo: string, total: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cupones/validar`, { codigo, total });
  }
}