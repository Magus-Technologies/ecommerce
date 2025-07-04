// src/app/services/ofertas-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface OfertaAdmin {
  id?: number;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  tipo_oferta_id?: number;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  valor_descuento: number;
  precio_minimo?: number;
  fecha_inicio: string;
  fecha_fin: string;
  imagen?: File;
  banner_imagen?: File;
  imagen_url?: string;
  banner_imagen_url?: string;
  color_fondo: string;
  texto_boton: string;
  enlace_url: string;
  limite_uso?: number;
  usos_actuales?: number;
  activo: boolean;
  mostrar_countdown: boolean;
  mostrar_en_slider: boolean;
  mostrar_en_banner: boolean;
  prioridad: number;
  created_at?: string;
  updated_at?: string;
}

export interface CuponAdmin {
  id?: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  valor_descuento: number;
  compra_minima?: number;
  fecha_inicio: string;
  fecha_fin: string;
  limite_uso?: number;
  usos_actuales?: number;
  solo_primera_compra: boolean;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TipoOferta {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}

export interface ProductoDisponible {
  id: number;
  nombre: string;
  codigo: string;
  precio_venta: number;
  stock: number;
  imagen_url?: string;
  categoria?: { nombre: string };
  marca?: { nombre: string };
}

export interface ProductoEnOferta {
  id: number;
  producto_id: number;
  nombre: string;
  codigo: string;
  precio_original: number;
  precio_oferta: number;
  stock_original: number;
  stock_oferta: number;
  vendidos_oferta: number;
  imagen_url?: string;
  categoria?: string;
  marca?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfertasAdminService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ==================== OFERTAS ====================
  obtenerOfertas(): Observable<OfertaAdmin[]> {
    return this.http.get<OfertaAdmin[]>(`${this.apiUrl}/ofertas`);
  }

  obtenerOferta(id: number): Observable<OfertaAdmin> {
    return this.http.get<OfertaAdmin>(`${this.apiUrl}/ofertas/${id}`);
  }

  crearOferta(oferta: OfertaAdmin): Observable<OfertaAdmin> {
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('titulo', oferta.titulo);
    formData.append('tipo_descuento', oferta.tipo_descuento);
    formData.append('valor_descuento', oferta.valor_descuento.toString());
    formData.append('fecha_inicio', oferta.fecha_inicio);
    formData.append('fecha_fin', oferta.fecha_fin);
    formData.append('color_fondo', oferta.color_fondo);
    formData.append('texto_boton', oferta.texto_boton);
    formData.append('enlace_url', oferta.enlace_url);
    formData.append('activo', oferta.activo ? '1' : '0');
    formData.append('mostrar_countdown', oferta.mostrar_countdown ? '1' : '0');
    formData.append('mostrar_en_slider', oferta.mostrar_en_slider ? '1' : '0');
    formData.append('mostrar_en_banner', oferta.mostrar_en_banner ? '1' : '0');
    formData.append('prioridad', oferta.prioridad.toString());

    // Campos opcionales
    if (oferta.subtitulo) formData.append('subtitulo', oferta.subtitulo);
    if (oferta.descripcion) formData.append('descripcion', oferta.descripcion);
    if (oferta.tipo_oferta_id) formData.append('tipo_oferta_id', oferta.tipo_oferta_id.toString());
    if (oferta.precio_minimo) formData.append('precio_minimo', oferta.precio_minimo.toString());
    if (oferta.limite_uso) formData.append('limite_uso', oferta.limite_uso.toString());

    // Archivos
    if (oferta.imagen) formData.append('imagen', oferta.imagen);
    if (oferta.banner_imagen) formData.append('banner_imagen', oferta.banner_imagen);

    return this.http.post<OfertaAdmin>(`${this.apiUrl}/ofertas`, formData);
  }

  actualizarOferta(id: number, oferta: Partial<OfertaAdmin>): Observable<OfertaAdmin> {
    const formData = new FormData();
    
    // Agregar campos que se están actualizando
    Object.keys(oferta).forEach(key => {
      const value = (oferta as any)[key];
      if (value !== null && value !== undefined) {
        if (key === 'imagen' || key === 'banner_imagen') {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('_method', 'PUT');
    return this.http.post<OfertaAdmin>(`${this.apiUrl}/ofertas/${id}`, formData);
  }

  eliminarOferta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ofertas/${id}`);
  }

  // ==================== GESTIÓN DE PRODUCTOS EN OFERTAS ====================

  /**
   * Obtener productos disponibles para agregar a ofertas
   */
  obtenerProductosDisponibles(search?: string, categoriaId?: number): Observable<any> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoriaId) params = params.set('categoria_id', categoriaId.toString());

    return this.http.get<any>(`${this.apiUrl}/productos-disponibles`, { params });
  }

  /**
   * Obtener productos de una oferta específica
   */
  obtenerProductosOferta(ofertaId: number): Observable<ProductoEnOferta[]> {
    return this.http.get<ProductoEnOferta[]>(`${this.apiUrl}/ofertas/${ofertaId}/productos`);
  }

  /**
   * Agregar producto a una oferta
   */
  agregarProductoOferta(ofertaId: number, productoId: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ofertas/${ofertaId}/productos`, {
      producto_id: productoId,
      precio_oferta: datos.precio_oferta,
      stock_oferta: datos.stock_oferta
    });
  }

  /**
   * Actualizar producto en oferta
   */
  actualizarProductoOferta(ofertaId: number, productoOfertaId: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ofertas/${ofertaId}/productos/${productoOfertaId}`, {
      precio_oferta: datos.precio_oferta,
      stock_oferta: datos.stock_oferta
    });
  }

  /**
   * Eliminar producto de oferta
   */
  eliminarProductoOferta(ofertaId: number, productoOfertaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ofertas/${ofertaId}/productos/${productoOfertaId}`);
  }

  // ==================== CUPONES ====================
  obtenerCupones(): Observable<CuponAdmin[]> {
    return this.http.get<CuponAdmin[]>(`${this.apiUrl}/cupones`);
  }

  obtenerCupon(id: number): Observable<CuponAdmin> {
    return this.http.get<CuponAdmin>(`${this.apiUrl}/cupones/${id}`);
  }

  crearCupon(cupon: CuponAdmin): Observable<CuponAdmin> {
    return this.http.post<CuponAdmin>(`${this.apiUrl}/cupones`, cupon);
  }

  actualizarCupon(id: number, cupon: Partial<CuponAdmin>): Observable<CuponAdmin> {
    return this.http.put<CuponAdmin>(`${this.apiUrl}/cupones/${id}`, cupon);
  }

  eliminarCupon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cupones/${id}`);
  }

  // ==================== TIPOS DE OFERTAS ====================
  obtenerTiposOfertas(): Observable<TipoOferta[]> {
    return this.http.get<TipoOferta[]>(`${this.apiUrl}/tipos-ofertas`);
  }
}