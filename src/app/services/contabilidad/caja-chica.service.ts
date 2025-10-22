import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CajaChicaService {
  private apiUrl = `${environment.apiUrl}/contabilidad/caja-chica`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todas las cajas chicas
   */
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Obtener una caja chica específica
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva caja chica
   */
  create(data: {
    nombre: string;
    codigo: string;
    fondo_fijo: number;
    responsable_id: number;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * Registrar gasto
   */
  registrarGasto(data: {
    caja_chica_id: number;
    fecha: string;
    monto: number;
    categoria: string;
    descripcion: string;
    comprobante_tipo?: string;
    comprobante_numero?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gasto`, data);
  }

  /**
   * Registrar reposición
   */
  registrarReposicion(id: number, data: {
    monto: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reposicion`, data);
  }

  /**
   * Obtener rendición
   */
  getRendicion(id: number, params: {
    fecha_inicio: string;
    fecha_fin: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key as keyof typeof params]);
    });
    return this.http.get<any>(`${this.apiUrl}/${id}/rendicion`, { params: httpParams });
  }
}
