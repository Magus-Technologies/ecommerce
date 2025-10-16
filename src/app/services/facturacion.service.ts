import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Empresa, 
  Certificado, 
  Serie, 
  Cliente, 
  Venta, 
  VentaFormData, 
  FacturarFormData,
  Comprobante,
  NotaCreditoFormData,
  BajaFormData,
  Resumen,
  Baja,
  AuditoriaSunat,
  ApiResponse,
  PaginatedResponse
} from '../models/facturacion.model';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private apiUrl = environment.apiUrl; // URL del backend Laravel

  constructor(private http: HttpClient) { }

  // ============================================
  // CONFIGURACIÓN DE EMISOR
  // ============================================

  /**
   * Obtener configuración del emisor
   */
  getEmisor(): Observable<ApiResponse<Empresa>> {
    return this.http.get<ApiResponse<Empresa>>(`${this.apiUrl}/empresa-emisora`);
  }

  /**
   * Actualizar configuración del emisor
   */
  updateEmisor(empresa: Partial<Empresa>): Observable<ApiResponse<Empresa>> {
    return this.http.put<ApiResponse<Empresa>>(`${this.apiUrl}/empresa-emisora`, empresa);
  }

  /**
   * Subir certificado digital
   */
  uploadCertificado(certificado: File, password: string): Observable<ApiResponse<Certificado>> {
    const formData = new FormData();
    formData.append('certificado', certificado);
    formData.append('password', password);

    return this.http.post<ApiResponse<Certificado>>(`${this.apiUrl}/certificados`, formData);
  }

  // ============================================
  // CATÁLOGOS SUNAT
  // ============================================

  /**
   * Obtener catálogos de SUNAT
   */
  getCatalogos(tipo: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/catalogos-sunat/${tipo}`);
  }

  // ============================================
  // SERIES Y CORRELATIVOS
  // ============================================

  /**
   * Obtener series
   */
  getSeries(params?: any): Observable<ApiResponse<Serie[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<ApiResponse<Serie[]>>(`${this.apiUrl}/series`, { params: httpParams });
  }

  /**
   * Crear nueva serie
   */
  createSerie(serie: Partial<Serie>): Observable<ApiResponse<Serie>> {
    return this.http.post<ApiResponse<Serie>>(`${this.apiUrl}/series`, serie);
  }

  /**
   * Actualizar serie
   */
  updateSerie(id: number, serie: Partial<Serie>): Observable<ApiResponse<Serie>> {
    return this.http.patch<ApiResponse<Serie>>(`${this.apiUrl}/series/${id}`, serie);
  }

  /**
   * Reservar correlativo
   */
  reservarCorrelativo(serieId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/series/reservar-correlativo`, {
      serie_id: serieId
    });
  }

  // ============================================
  // CLIENTES
  // ============================================

  /**
   * Obtener clientes
   */
  getClientes(params?: any): Observable<PaginatedResponse<Cliente>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Cliente>>(`${this.apiUrl}/clientes`, { params: httpParams });
  }

  /**
   * Crear cliente
   */
  createCliente(cliente: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes`, cliente);
  }

  /**
   * Actualizar cliente
   */
  updateCliente(id: number, cliente: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`, cliente);
  }

  // ============================================
  // VENTAS
  // ============================================

  /**
   * Obtener ventas
   */
  getVentas(params?: any): Observable<PaginatedResponse<Venta>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Venta>>(`${this.apiUrl}/ventas`, { params: httpParams });
  }

  /**
   * Obtener venta por ID
   */
  getVenta(id: number): Observable<ApiResponse<Venta>> {
    return this.http.get<ApiResponse<Venta>>(`${this.apiUrl}/ventas/${id}`);
  }

  /**
   * Crear venta manual
   */
  createVenta(venta: VentaFormData): Observable<ApiResponse<Venta>> {
    return this.http.post<ApiResponse<Venta>>(`${this.apiUrl}/ventas`, venta);
  }

  /**
   * Facturar venta (convertir a comprobante)
   */
  facturarVenta(id: number, datos: FacturarFormData): Observable<ApiResponse<Comprobante>> {
    return this.http.post<ApiResponse<Comprobante>>(`${this.apiUrl}/ventas/${id}/facturar`, datos);
  }

  /**
   * Anular venta
   */
  anularVenta(id: number, motivo: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/ventas/${id}/anular`, { motivo });
  }

  /**
   * Descargar PDF de venta
   */
  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/${id}/pdf`, { responseType: 'blob' });
  }

  /**
   * Enviar comprobante por email
   */
  enviarEmail(id: number, email?: string): Observable<ApiResponse<any>> {
    const body = email ? { to: email } : {};
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ventas/${id}/email`, body);
  }

  // ============================================
  // COMPROBANTES
  // ============================================

  /**
   * Obtener comprobantes
   */
  getComprobantes(params?: any): Observable<PaginatedResponse<Comprobante>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Comprobante>>(`${this.apiUrl}/comprobantes`, { params: httpParams });
  }

  /**
   * Obtener comprobante por ID
   */
  getComprobante(id: number): Observable<ApiResponse<Comprobante>> {
    return this.http.get<ApiResponse<Comprobante>>(`${this.apiUrl}/comprobantes/${id}`);
  }

  /**
   * Reenviar comprobante a SUNAT
   */
  reenviarComprobante(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/comprobantes/${id}/reenviar`, {});
  }

  /**
   * Consultar estado en SUNAT
   */
  consultarEstado(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/comprobantes/${id}/consultar`, {});
  }

  /**
   * Descargar XML del comprobante
   */
  downloadXml(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/comprobantes/${id}/xml`, { responseType: 'blob' });
  }

  /**
   * Descargar CDR del comprobante
   */
  downloadCdr(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/comprobantes/${id}/cdr`, { responseType: 'blob' });
  }

  // ============================================
  // NOTAS DE CRÉDITO
  // ============================================

  /**
   * Emitir nota de crédito
   */
  emitirNotaCredito(datos: NotaCreditoFormData): Observable<ApiResponse<Comprobante>> {
    return this.http.post<ApiResponse<Comprobante>>(`${this.apiUrl}/notas-credito`, datos);
  }

  /**
   * Obtener notas de crédito
   */
  getNotasCredito(params?: any): Observable<PaginatedResponse<Comprobante>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Comprobante>>(`${this.apiUrl}/notas-credito`, { params: httpParams });
  }

  /**
   * Descargar PDF de nota de crédito
   */
  downloadNotaCreditoPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/notas-credito/${id}/pdf`, { responseType: 'blob' });
  }

  // ============================================
  // NOTAS DE DÉBITO
  // ============================================

  /**
   * Emitir nota de débito
   */
  emitirNotaDebito(datos: NotaCreditoFormData): Observable<ApiResponse<Comprobante>> {
    return this.http.post<ApiResponse<Comprobante>>(`${this.apiUrl}/notas-debito`, datos);
  }

  /**
   * Obtener notas de débito
   */
  getNotasDebito(params?: any): Observable<PaginatedResponse<Comprobante>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Comprobante>>(`${this.apiUrl}/notas-debito`, { params: httpParams });
  }

  // ============================================
  // RESÚMENES DIARIOS
  // ============================================

  /**
   * Crear resumen diario
   */
  crearResumen(fecha: string, comprobantes: any[]): Observable<ApiResponse<Resumen>> {
    return this.http.post<ApiResponse<Resumen>>(`${this.apiUrl}/resumenes`, {
      fecha,
      comprobantes
    });
  }

  /**
   * Obtener resúmenes
   */
  getResumenes(params?: any): Observable<PaginatedResponse<Resumen>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Resumen>>(`${this.apiUrl}/resumenes`, { params: httpParams });
  }

  /**
   * Consultar estado de resumen
   */
  consultarEstadoResumen(ticket: string): Observable<ApiResponse<Resumen>> {
    return this.http.get<ApiResponse<Resumen>>(`${this.apiUrl}/resumenes/${ticket}`);
  }

  // ============================================
  // COMUNICACIONES DE BAJA
  // ============================================

  /**
   * Enviar comunicación de baja
   */
  enviarBaja(datos: BajaFormData): Observable<ApiResponse<Baja>> {
    return this.http.post<ApiResponse<Baja>>(`${this.apiUrl}/bajas`, datos);
  }

  /**
   * Obtener bajas
   */
  getBajas(params?: any): Observable<PaginatedResponse<Baja>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<Baja>>(`${this.apiUrl}/bajas`, { params: httpParams });
  }

  /**
   * Consultar estado de baja
   */
  consultarEstadoBaja(ticket: string): Observable<ApiResponse<Baja>> {
    return this.http.get<ApiResponse<Baja>>(`${this.apiUrl}/bajas/${ticket}`);
  }

  // ============================================
  // AUDITORÍA Y REINTENTOS
  // ============================================

  /**
   * Obtener auditoría SUNAT
   */
  getAuditoria(params?: any): Observable<PaginatedResponse<AuditoriaSunat>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<AuditoriaSunat>>(`${this.apiUrl}/auditoria-sunat`, { params: httpParams });
  }

  /**
   * Obtener cola de reintentos
   */
  getReintentos(params?: any): Observable<PaginatedResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/cola-reintentos`, { params: httpParams });
  }

  /**
   * Reintentar operación
   */
  reintentarOperacion(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/cola-reintentos/${id}/reintentar`, {});
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Validar RUC con SUNAT
   */
  validarRUC(ruc: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/utilidades/validar-ruc/${ruc}`);
  }

  /**
   * Buscar empresa por RUC
   */
  buscarEmpresaPorRUC(ruc: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/utilidades/buscar-empresa/${ruc}`);
  }

  /**
   * Obtener productos
   */
  getProductos(params?: any): Observable<ApiResponse<any[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/productos`, { params: httpParams });
  }

  /**
   * Obtener cliente por documento
   */
  getClienteByDocumento(tipo: string, numero: string): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${tipo}/${numero}`);
  }

  /**
   * Obtener estado del sistema
   */
  getEstadoSistema(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/facturacion/status`);
  }

  /**
   * Generar URL de destino por defecto
   */
  generarUrlDestinoDefault(recompensaId: number): string {
    return `/recompensas/${recompensaId}`;
  }
}
