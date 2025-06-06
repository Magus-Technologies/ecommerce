// src/app/services/banners.service.ts
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

  obtenerBanners(): Observable<Banner[]> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.apiUrl}/banners`)
      .pipe(
        map(response => response.data.map(banner => ({
          ...banner,
          imagen_url: banner.imagen_url ? `${this.baseUrl}/storage/${banner.imagen_url}` : undefined
        })))
      );
  }

   // ✅ ACTUALIZAR MÉTODO PARA MAPEAR LA RESPUESTA
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
}