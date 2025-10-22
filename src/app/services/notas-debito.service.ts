import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotasDebitoService {
  private apiUrl = `${environment.apiUrl}/facturacion/notas-debito`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todas las notas de débito
   */
  getAll(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    serie?: string;
    comprobante_referencia?: string;
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
   * Crear nota de débito
   */
  create(data: {
    comprobante_referencia: {
      tipo: string;
      serie: string;
      numero: number;
    };
    tipo_nota_debito: string;
    motivo: string;
    descripcion: string;
    items: Array<{
      descripcion: string;
      unidad_medida: string;
      cantidad: number;
      precio_unitario: number;
      tipo_afectacion_igv: string;
      descuento: number;
    }>;
    serie?: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * Obtener detalle de una nota de débito
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Descargar PDF de la nota de débito
   */
  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Descargar XML de la nota de débito
   */
  descargarXml(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/xml`, {
      responseType: 'blob'
    });
  }
}
