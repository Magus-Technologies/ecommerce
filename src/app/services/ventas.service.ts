// src/app/services/ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Venta {
  id: number;
  codigo_venta: string;
  cliente_id?: number;
  user_cliente_id?: number;
  fecha_venta: string;
  subtotal: number;
  igv: number;
  descuento_total: number;
  total: number;
  estado: 'PENDIENTE' | 'FACTURADO' | 'ANULADO';
  comprobante_id?: number;
  requiere_factura: boolean;
  metodo_pago?: string;
  observaciones?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  cliente?: any;
  userCliente?: any;
  comprobante?: any;
  user?: any;
  detalles?: VentaDetalle[];
  
  // Accessors
  estado_color?: string;
  cliente_nombre?: string;
  tipo_venta?: string;
}

export interface VentaDetalle {
  id: number;
  venta_id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  descripcion_producto?: string;
  cantidad: number;
  precio_unitario: number;
  precio_sin_igv: number;
  descuento_unitario: number;
  subtotal_linea: number;
  igv_linea: number;
  total_linea: number;
  producto?: any;
}

export interface CrearVentaRequest {
  cliente_id?: number;
  user_cliente_id?: number;
  productos: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento_unitario?: number;
  }[];
  descuento_total?: number;
  requiere_factura?: boolean;
  metodo_pago?: string;
  observaciones?: string;
}

export interface FacturarVentaRequest {
  cliente_datos?: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    direccion: string;
    email?: string;
    telefono?: string;
  };
}

export interface EstadisticasVentas {
  total_ventas: number;
  monto_total: number;
  ventas_pendientes: number;
  ventas_facturadas: number;
  ventas_ecommerce: number;
  periodo: {
    inicio: string;
    fin: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las ventas con filtros
  obtenerVentas(filtros?: {
    estado?: string;
    cliente_id?: number;
    user_cliente_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    search?: string;
    page?: number;
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

  // Crear nueva venta
  crearVenta(venta: CrearVentaRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }

  // Obtener venta por ID
  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  // Facturar venta
  facturarVenta(id: number, datos?: FacturarVentaRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/facturar`, datos || {});
  }

  // Anular venta
  anularVenta(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/anular`, {});
  }

  // Obtener estadísticas
  obtenerEstadisticas(fechaInicio?: string, fechaFin?: string): Observable<EstadisticasVentas> {
    let params = new HttpParams();
    
    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin);
    }

    return this.http.get<EstadisticasVentas>(`${this.apiUrl}/estadisticas`, { params });
  }

  // Obtener ventas del cliente autenticado (para e-commerce)
  obtenerMisVentas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-ventas`);
  }

  // Crear venta desde e-commerce
  crearVentaEcommerce(venta: {
    productos: {
      producto_id: number;
      cantidad: number;
    }[];
    metodo_pago: string;
    requiere_factura?: boolean;
    observaciones?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ecommerce`, venta);
  }
}