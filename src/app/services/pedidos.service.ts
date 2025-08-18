import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pedido {
  id: number;
  codigo_pedido: string;
  cliente_id?: number;
  user_cliente_id?: number;
  fecha_pedido: string;
  subtotal: number;
  igv: number;
  descuento_total: number;
  total: number;
  estado_pedido_id: number;
  metodo_pago?: string;
  observaciones?: string;
  direccion_envio?: string;
  telefono_contacto?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  cliente?: any;
  userCliente?: any;
  estadoPedido?: {
    id: number;
    nombre: string;
    color?: string;
  };
  user?: any;
  detalles?: PedidoDetalle[];
  
  // Accessors
  cliente_nombre?: string;
  tipo_pedido?: string;
}

export interface PedidoDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal_linea: number;
  producto?: any;
}

export interface CrearPedidoRequest {
  productos: {
    producto_id: number;
    cantidad: number;
  }[];
  metodo_pago: string;
  direccion_envio: string;
  telefono_contacto: string;
  observaciones?: string;
}

export interface EstadoPedido {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  // Obtener todos los pedidos con filtros (para admin)
  obtenerPedidos(filtros?: {
    estado_pedido_id?: number;
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

  // Crear nuevo pedido desde e-commerce
  crearPedidoEcommerce(pedido: CrearPedidoRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ecommerce`, pedido);
  }

  // Obtener pedido por ID
  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  // Actualizar estado del pedido (para admin)
  actualizarEstado(id: number, estadoPedidoId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, {
      estado_pedido_id: estadoPedidoId
    });
  }

  // Obtener estados de pedido disponibles
  obtenerEstados(): Observable<EstadoPedido[]> {
    return this.http.get<EstadoPedido[]>(`${this.apiUrl}/estados`);
  }

  // Obtener pedidos del cliente autenticado
  obtenerMisPedidos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-pedidos`);
  }

  // Cancelar pedido (cliente)
  cancelarPedido(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  // Estadísticas de pedidos (para admin)
  obtenerEstadisticas(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    
    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin);
    }

    return this.http.get<any>(`${this.apiUrl}/estadisticas`, { params });
  }
}