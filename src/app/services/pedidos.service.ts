import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pedido {
  id: number;
  codigo_pedido: string;
  cliente_id: number | null;
  user_cliente_id: number | null;
  fecha_pedido: string;
  subtotal: string;
  igv: string;
  descuento_total: string;
  total: string;
  estado_pedido_id: number;
  metodo_pago: string;
  observaciones: string | null;
  direccion_envio: string;
  telefono_contacto: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  cliente_nombre: string;
  tipo_pedido: string;
  cliente?: any;
  user_cliente?: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    numero_documento: string;
  };
  estado_pedido?: {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
  };
  detalles?: PedidoDetalle[];
}

export interface PedidoDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: string;
  subtotal_linea: string;
  imagen_url: string;
  producto?: {
    id: number;
    nombre: string;
    descripcion: string;
    codigo_producto: string;
    imagen: string;
  };
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

export interface PedidosResponse {
  status: string;
  pedidos: Pedido[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de pedidos
   */
  getPedidos(): Observable<PedidosResponse> {
    return this.http.get<PedidosResponse>(`${environment.apiUrl}/pedidos`);
  }

  /**
   * Obtener pedido por ID
   */
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${environment.apiUrl}/pedidos/${id}`);
  }

  /**
   * Actualizar estado del pedido
   */
  actualizarEstado(pedidoId: number, estadoId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/pedidos/${pedidoId}/estado`, {
      estado_pedido_id: estadoId
    });
  }

  /**
   * Crear nuevo pedido
   */
  crearPedido(pedidoData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/pedidos`, pedidoData);
  }

  /**
   * Crear pedido desde e-commerce
   */
  crearPedidoEcommerce(pedido: CrearPedidoRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/pedidos/ecommerce`, pedido);
  }

  /**
   * Obtener estadísticas de pedidos
   */
  getEstadisticas(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/pedidos/estadisticas`);
  }

  /**
   * Obtener pedidos por usuario
   */
  getPedidosPorUsuario(userId: number): Observable<PedidosResponse> {
    return this.http.get<PedidosResponse>(`${environment.apiUrl}/pedidos/usuario/${userId}`);
  }
}