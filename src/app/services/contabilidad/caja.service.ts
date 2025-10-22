import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Caja {
  id: number;
  nombre: string;
  codigo: string;
  tienda_id?: number;
  activo: boolean;
  created_at?: string;
}

export interface CajaMovimiento {
  id: number;
  caja_id: number;
  caja?: Caja;
  fecha_apertura: string;
  fecha_cierre?: string;
  monto_inicial: number;
  monto_final?: number;
  estado: 'ABIERTA' | 'CERRADA';
  usuario_apertura_id: number;
  usuario_cierre_id?: number;
  observaciones_apertura?: string;
  observaciones_cierre?: string;
  created_at?: string;
}

export interface CajaTransaccion {
  id: number;
  caja_movimiento_id: number;
  tipo: 'INGRESO' | 'EGRESO';
  categoria: string;
  monto: number;
  metodo_pago: string;
  descripcion?: string;
  referencia?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private apiUrl = `${environment.apiUrl}/contabilidad/cajas`;

  constructor(private http: HttpClient) {}

  // Gestión de Cajas
  getCajas(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  getCaja(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearCaja(datos: Partial<Caja>): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  actualizarCaja(id: number, datos: Partial<Caja>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  // Movimientos de Caja
  aperturarCaja(datos: { caja_id: number; monto_inicial: number; observaciones?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/aperturar`, datos);
  }

  cerrarCaja(id: number, datos: { monto_final: number; observaciones?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cerrar`, datos);
  }

  // Transacciones
  registrarTransaccion(datos: Partial<CajaTransaccion>): Observable<any> {
    return this.http.post(`${this.apiUrl}/transaccion`, datos);
  }

  getTransacciones(cajaMovimientoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movimiento/${cajaMovimientoId}/transacciones`);
  }

  // Reportes
  getReporteCaja(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/reporte`);
  }

  getMovimientosActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movimientos-activos`);
  }
}
