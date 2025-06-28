import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../environments/environment"

export interface Pedido {
  id: number
  codigo_pedido: string
  cliente: {
    nombre_completo: string
    tipo_documento: string
    numero_documento: string
  }
  fecha: string
  total: string
  estado: {
    id: number
    nombre: string
  }
  metodo_pago: string
  tienda: string
  moneda: string
}

export interface PedidoDetalle {
  id: number
  codigo_pedido: string
  cliente: {
    nombre_completo: string
    tipo_documento: string
    numero_documento: string
  }
  fecha: string
  estado: {
    id: number
    nombre: string
  }
  metodo_pago: string
  direccion: string
  tienda: string
  subtotal: number
  igv: number
  descuento_total: number
  total: number
  moneda: string
  observaciones: string
  productos: {
    nombre: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }[]
}

export interface EstadoPedido {
  id: number
  nombre_estado: string
  descripcion: string
}

export interface MetodoPago {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface PedidosFiltros {
  cliente?: string
  estado?: number
  tienda?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}

export interface PedidosResponse {
  pedidos: Pedido[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

@Injectable({
  providedIn: "root",
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/pedidos`

  constructor(private http: HttpClient) {}

  getPedidos(filtros: PedidosFiltros = {}): Observable<PedidosResponse> {
    let params = new HttpParams()
    if (filtros.cliente) params = params.set("cliente", filtros.cliente)
    if (filtros.estado) params = params.set("estado", filtros.estado.toString())
    if (filtros.tienda) params = params.set("tienda", filtros.tienda.toString())
    if (filtros.fecha_desde) params = params.set("fecha_desde", filtros.fecha_desde)
    if (filtros.fecha_hasta) params = params.set("fecha_hasta", filtros.fecha_hasta)
    if (filtros.page) params = params.set("page", filtros.page.toString())
    if (filtros.per_page) params = params.set("per_page", filtros.per_page.toString())

    return this.http.get<PedidosResponse>(this.apiUrl, { params })
  }

  getPedido(id: number): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiUrl}/${id}`)
  }

  updateEstado(id: number, estadoId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, {
      estado_pedido_id: estadoId,
    })
  }

  getEstados(): Observable<EstadoPedido[]> {
    return this.http.get<EstadoPedido[]>(`${this.apiUrl}/estados`)
  }

  getMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/metodos-pago`)
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }
}
