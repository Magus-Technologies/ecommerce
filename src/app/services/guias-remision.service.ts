import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GuiaRemision {
  id?: number;
  tipo_comprobante: string;
  serie: string;
  correlativo: number;
  numero_completo?: string;
  fecha_emision: string;
  fecha_inicio_traslado: string;
  cliente_id: number;
  cliente?: any;
  destinatario_tipo_documento: string;
  destinatario_numero_documento: string;
  destinatario_razon_social: string;
  destinatario_direccion: string;
  destinatario_ubigeo: string;
  motivo_traslado: string;
  modalidad_traslado: string;
  peso_total: number;
  numero_bultos?: number;
  modo_transporte?: string;
  numero_placa?: string;
  numero_licencia?: string;
  conductor_dni?: string;
  conductor_nombres?: string;
  punto_partida_ubigeo: string;
  punto_partida_direccion: string;
  punto_llegada_ubigeo: string;
  punto_llegada_direccion: string;
  observaciones?: string;
  estado: string;
  estado_nombre?: string;
  xml_firmado?: string;
  mensaje_sunat?: string;
  codigo_hash?: string;
  fecha_aceptacion?: string;
  detalles?: GuiaRemisionDetalle[];
  created_at?: string;
  updated_at?: string;
}

export interface GuiaRemisionDetalle {
  id?: number;
  guia_remision_id?: number;
  item: number;
  producto_id: number;
  producto?: any;
  codigo_producto: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  peso_unitario: number;
  peso_total: number;
  observaciones?: string;
}

export interface GuiaRemisionFormData {
  cliente_id: number;
  destinatario_tipo_documento: string;
  destinatario_numero_documento: string;
  destinatario_razon_social: string;
  destinatario_direccion: string;
  destinatario_ubigeo: string;
  motivo_traslado: string;
  modalidad_traslado: string;
  fecha_inicio_traslado: string;
  peso_total?: number;
  numero_bultos?: number;
  modo_transporte?: string;
  numero_placa?: string;
  numero_licencia?: string;
  conductor_dni?: string;
  conductor_nombres?: string;
  punto_partida_ubigeo: string;
  punto_partida_direccion: string;
  punto_llegada_ubigeo: string;
  punto_llegada_direccion: string;
  observaciones?: string;
  productos: {
    producto_id: number;
    cantidad: number;
    peso_unitario: number;
    observaciones?: string;
  }[];
}

export interface EstadisticasGuias {
  total_guias: number;
  guias_pendientes: number;
  guias_enviadas: number;
  guias_aceptadas: number;
  guias_rechazadas: number;
  peso_total_transportado: number;
}

@Injectable({
  providedIn: 'root'
})
export class GuiasRemisionService {
  private apiUrl = `${environment.apiUrl}/guias-remision`;

  constructor(private http: HttpClient) {}

  /**
   * Listar guías de remisión con filtros
   */
  getGuias(filtros?: {
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    cliente_id?: number;
    serie?: string;
    page?: number;
    per_page?: number;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = (filtros as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener detalle de una guía
   */
  getGuia(id: number): Observable<{ success: boolean; data: GuiaRemision }> {
    return this.http.get<{ success: boolean; data: GuiaRemision }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva guía de remisión
   */
  crearGuia(datos: GuiaRemisionFormData): Observable<{ success: boolean; message: string; data: GuiaRemision }> {
    return this.http.post<{ success: boolean; message: string; data: GuiaRemision }>(this.apiUrl, datos);
  }

  /**
   * Enviar guía a SUNAT
   */
  enviarSunat(id: number): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${id}/enviar-sunat`, {});
  }

  /**
   * Descargar XML de la guía
   */
  descargarXML(id: number): Observable<{ success: boolean; data: { xml: string; filename: string } }> {
    return this.http.get<{ success: boolean; data: { xml: string; filename: string } }>(`${this.apiUrl}/${id}/xml`);
  }

  /**
   * Obtener estadísticas de guías
   */
  getEstadisticas(filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<{ success: boolean; data: EstadisticasGuias }> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = (filtros as any)[key];
        if (value) {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<{ success: boolean; data: EstadisticasGuias }>(`${this.apiUrl}/estadisticas/resumen`, { params });
  }
}
