import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlujoCajaService {
  private apiUrl = `${environment.apiUrl}/contabilidad/flujo-caja`;

  constructor(private http: HttpClient) {}

  /**
   * Listar proyecciones de flujo de caja
   */
  getAll(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  /**
   * Crear proyección
   */
  create(data: {
    fecha: string;
    tipo: string;
    concepto: string;
    monto_proyectado: number;
    categoria: string;
    recurrente?: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * Registrar monto real
   */
  registrarReal(id: number, data: {
    monto_real: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/registrar-real`, data);
  }

  /**
   * Obtener proyección mensual
   */
  getProyeccionMensual(params: {
    mes: number;
    anio: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key as keyof typeof params].toString());
    });
    return this.http.get<any>(`${this.apiUrl}/proyeccion-mensual`, { params: httpParams });
  }
}
