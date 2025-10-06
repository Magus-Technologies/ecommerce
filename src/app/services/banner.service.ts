// src/app/services/banner.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Banner {
  id: number;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  texto_boton: string;
  precio_desde?: number;
  imagen_url?: string;
  enlace_url: string;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface BannerCreate {
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  texto_boton: string;
  precio_desde?: number;
  imagen?: File;
  enlace_url: string;
  activo: boolean;
  orden: number;
}

export interface BannerPromocional {
  id: number;
  titulo: string;
  precio?: number;
  texto_boton: string;
  imagen_url?: string;
  enlace_url: string;
  orden: number;
  animacion_delay: number;
  color_boton?: string;
  color_texto?: string;
  color_badge_nombre?: string;
  color_badge_precio?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BannerPromocionalCreate {
  titulo: string;
  precio?: number;
  texto_boton: string;
  imagen?: File;
  enlace_url: string;
  orden: number;
  animacion_delay?: number;
  color_boton?: string;
  color_texto?: string;
  color_badge_nombre?: string;
  color_badge_precio?: string;
  activo: boolean;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BannersService {

  private apiUrl = `${environment.apiUrl}`;
  private baseUrl = environment.apiUrl.replace('/api', '');

  constructor(private http: HttpClient) { }

  // ===== MÉTODOS PARA BANNERS PRINCIPALES =====
  obtenerBanners(): Observable<Banner[]> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.apiUrl}/banners`)
      .pipe(
        map(response => response.data.map(banner => ({
          ...banner,
          imagen_url: banner.imagen_url ? `${this.baseUrl}/storage/${banner.imagen_url}` : undefined
        })))
      );
  }

  obtenerBannersPublicos(): Observable<Banner[]> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.apiUrl}/banners/publicos`)
      .pipe(
        map(response => response.data)
      );
  }

  obtenerBanner(id: number): Observable<Banner> {
    return this.http.get<ApiResponse<Banner>>(`${this.apiUrl}/banners/${id}`)
      .pipe(
        map(response => ({
          ...response.data,
          imagen_url: response.data.imagen_url ? `${this.baseUrl}/storage/${response.data.imagen_url}` : undefined
        }))
      );
  }

  crearBanner(bannerData: BannerCreate): Observable<any> {
    const formData = new FormData();
    
    formData.append('titulo', bannerData.titulo);
    if (bannerData.subtitulo) formData.append('subtitulo', bannerData.subtitulo);
    if (bannerData.descripcion) formData.append('descripcion', bannerData.descripcion);
    formData.append('texto_boton', bannerData.texto_boton);
    if (bannerData.precio_desde) formData.append('precio_desde', bannerData.precio_desde.toString());
    formData.append('enlace_url', bannerData.enlace_url);
    formData.append('activo', bannerData.activo ? '1' : '0');
    formData.append('orden', bannerData.orden.toString());
    
    if (bannerData.imagen) {
      formData.append('imagen', bannerData.imagen);
    }

    return this.http.post(`${this.apiUrl}/banners`, formData);
  }

  actualizarBanner(id: number, bannerData: Partial<BannerCreate>): Observable<any> {
    const formData = new FormData();
    
    if (bannerData.titulo) formData.append('titulo', bannerData.titulo);
    if (bannerData.subtitulo) formData.append('subtitulo', bannerData.subtitulo);
    if (bannerData.descripcion) formData.append('descripcion', bannerData.descripcion);
    if (bannerData.texto_boton) formData.append('texto_boton', bannerData.texto_boton);
    if (bannerData.precio_desde) formData.append('precio_desde', bannerData.precio_desde.toString());
    if (bannerData.enlace_url) formData.append('enlace_url', bannerData.enlace_url);
    if (bannerData.activo !== undefined) formData.append('activo', bannerData.activo ? '1' : '0');
    if (bannerData.orden !== undefined) formData.append('orden', bannerData.orden.toString());
    
    if (bannerData.imagen) {
      formData.append('imagen', bannerData.imagen);
    }
    
    return this.http.post(`${this.apiUrl}/banners/${id}`, formData);
  }

  eliminarBanner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banners/${id}`);
  }

  toggleEstado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/banners/${id}/toggle-estado`, {});
  }

  // ===== MÉTODOS PARA BANNERS PROMOCIONALES =====
  obtenerBannersPromocionales(): Observable<BannerPromocional[]> {
    return this.http.get<ApiResponse<BannerPromocional[]>>(`${this.apiUrl}/banners-promocionales`)
      .pipe(
        map(response => response.data.map(banner => ({
          ...banner,
          imagen_url: banner.imagen_url ? `${this.baseUrl}/storage/${banner.imagen_url}` : undefined
        })))
      );
  }

  obtenerBannersPromocionalesPublicos(): Observable<BannerPromocional[]> {
    return this.http.get<ApiResponse<BannerPromocional[]>>(`${this.apiUrl}/banners-promocionales/publicos`)
      .pipe(
        map(response => response.data)
      );
  }

  obtenerBannerPromocional(id: number): Observable<BannerPromocional> {
    return this.http.get<ApiResponse<BannerPromocional>>(`${this.apiUrl}/banners-promocionales/${id}`)
      .pipe(
        map(response => ({
          ...response.data,
          imagen_url: response.data.imagen_url ? `${this.baseUrl}/storage/${response.data.imagen_url}` : undefined
        }))
      );
  }

  crearBannerPromocional(bannerData: BannerPromocionalCreate): Observable<any> {
    const formData = new FormData();
    
    formData.append('titulo', bannerData.titulo);
    if (bannerData.precio) formData.append('precio', bannerData.precio.toString());
    formData.append('enlace_url', bannerData.enlace_url);
    formData.append('orden', bannerData.orden.toString());
    if (bannerData.animacion_delay) formData.append('animacion_delay', bannerData.animacion_delay.toString());
    formData.append('activo', bannerData.activo ? '1' : '0');
    
    if (bannerData.color_boton) formData.append('color_boton', bannerData.color_boton);
    if (bannerData.color_texto) formData.append('color_texto', bannerData.color_texto);
    if (bannerData.color_badge_nombre) formData.append('color_badge_nombre', bannerData.color_badge_nombre);
    if (bannerData.color_badge_precio) formData.append('color_badge_precio', bannerData.color_badge_precio);

    if (bannerData.imagen) {
      formData.append('imagen', bannerData.imagen);
    }

    return this.http.post(`${this.apiUrl}/banners-promocionales`, formData);
  }

  actualizarBannerPromocional(id: number, bannerData: Partial<BannerPromocionalCreate>): Observable<any> {
    const formData = new FormData();
    
    if (bannerData.titulo) formData.append('titulo', bannerData.titulo);
    if (bannerData.precio) formData.append('precio', bannerData.precio.toString());
    bannerData.texto_boton && formData.append('texto_boton', bannerData.texto_boton);
    if (bannerData.enlace_url) formData.append('enlace_url', bannerData.enlace_url);
    if (bannerData.orden !== undefined) formData.append('orden', bannerData.orden.toString());
    if (bannerData.animacion_delay !== undefined) formData.append('animacion_delay', bannerData.animacion_delay.toString());
    if (bannerData.activo !== undefined) formData.append('activo', bannerData.activo ? '1' : '0');
    
    if (bannerData.color_boton) formData.append('color_boton', bannerData.color_boton);
    if (bannerData.color_texto) formData.append('color_texto', bannerData.color_texto);
    if (bannerData.color_badge_nombre) formData.append('color_badge_nombre', bannerData.color_badge_nombre);
    if (bannerData.color_badge_precio) formData.append('color_badge_precio', bannerData.color_badge_precio);

    if (bannerData.imagen) {
      formData.append('imagen', bannerData.imagen);
    }
    
    return this.http.post(`${this.apiUrl}/banners-promocionales/${id}`, formData);
  }

  eliminarBannerPromocional(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banners-promocionales/${id}`);
  }

  toggleEstadoBannerPromocional(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/banners-promocionales/${id}/toggle-estado`, {});
  }
}