// src/app/services/ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================
// INTERFACES - ESTRUCTURA API DOCUMENTADA
// ============================================

/**
 * Información del cliente en la lista de ventas
 */
export interface VentaClienteInfo {
  numero_documento: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
}

/**
 * Información del comprobante electrónico en la lista de ventas
 */
export interface VentaComprobanteInfo {
  documento_tipo: string; // NV=NotaVenta, BT=Boleta, FT=Factura, NC=NotaCredito, ND=NotaDebito
  numero_completo: string; // Ej: "B001-00000001"
  estado: 'GENERADO' | 'PENDIENTE' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'OBSERVADO' | 'ERROR'; // Estados SUNAT
  tiene_xml: boolean;
  tiene_pdf: boolean;
  tiene_cdr: boolean;
  tipo_comprobante: string; // 01=Factura, 03=Boleta, 07=NotaCredito, 08=NotaDebito, 09=NotaVenta
  mensaje_sunat: string | null;
}

/**
 * Venta en lista (GET /api/ventas)
 */
export interface Venta {
  id: number;
  codigo_venta: string;
  cliente_id: number | null;
  user_cliente_id: number | null;
  fecha_venta: string;
  subtotal: string;
  igv: string;
  descuento_total: string;
  total: string;
  estado: 'PENDIENTE' | 'FACTURADO' | 'ANULADO';
  metodo_pago: string;
  cliente_info: VentaClienteInfo;
  comprobante_info?: VentaComprobanteInfo;

  // Relaciones legacy (para compatibilidad)
  cliente?: any;
  userCliente?: any;
  comprobante?: any;
  user?: any;
  detalles?: VentaDetalle[];
}

/**
 * Cliente completo en detalle de venta
 */
export interface VentaCliente {
  id: number;
  numero_documento: string;
  razon_social: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}

/**
 * Detalle de producto en venta
 */
export interface VentaDetalle {
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal_linea: number;
  igv_linea: number;
  total_linea: number;
}

/**
 * Comprobante en detalle de venta
 */
export interface VentaComprobante {
  id: number;
  numero_completo: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  tiene_xml: boolean;
  tiene_pdf: boolean;
  tiene_cdr: boolean;
}

/**
 * Detalle completo de venta (GET /api/ventas/{id})
 */
export interface VentaDetallada {
  id: number;
  codigo_venta: string;
  fecha_venta: string;
  subtotal: string;
  igv: string;
  descuento_total: string;
  total: string;
  estado: 'PENDIENTE' | 'FACTURADO' | 'ANULADO';
  metodo_pago: string;
  observaciones?: string;
  cliente: VentaCliente;
  detalles: VentaDetalle[];
  comprobante?: VentaComprobante;
}

/**
 * Request para crear venta (POST /api/ventas)
 */
export interface CrearVentaRequest {
  cliente_id?: number | null;
  productos: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento_unitario?: number;
  }[];
  descuento_total?: number;
  metodo_pago: string; // EFECTIVO, TARJETA, etc.
  observaciones?: string | null;
  requiere_factura?: boolean;
  cliente_datos?: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    direccion?: string;
    email?: string;
    telefono?: string;
  };
}

/**
 * Response de crear venta
 */
export interface CrearVentaResponse {
  success: true;
  message: string;
  data: {
    id: number;
    codigo_venta: string;
    total: number;
    estado: 'PENDIENTE' | 'FACTURADO' | 'ANULADO';
    comprobante_id?: number;
    comprobante?: {
      id: number;
      numero_completo: string;
      estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
    };
  };
}

/**
 * Request para facturar venta (POST /api/ventas/{id}/facturar)
 */
export interface FacturarVentaRequest {
  cliente_datos?: {
    tipo_documento: string; // 1=DNI, 4=CE, 6=RUC, 7=PASAPORTE, 0=OTROS
    numero_documento: string;
    razon_social: string;
    direccion: string;
    email?: string;
    telefono?: string;
  };
}

/**
 * Response de facturar venta
 */
export interface FacturarVentaResponse {
  message: string;
  comprobante: {
    id: number;
    numero_completo: string;
    estado_sunat: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  };
}

/**
 * Response de anular venta
 */
export interface AnularVentaResponse {
  message: string;
  venta: {
    id: number;
    estado: 'ANULADO';
  };
}

/**
 * Response de enviar email
 */
export interface EnviarEmailResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    venta: string;
  };
}

/**
 * Respuesta paginada de ventas
 */
export interface VentasPaginatedResponse {
  current_page: number;
  data: Venta[];
  total: number;
  per_page: number;
  last_page: number;
}

/**
 * Estadísticas de ventas (GET /api/ventas/estadisticas)
 */
export interface EstadisticasVentas {
  total_ventas: number;
  monto_total: string;
  ventas_pendientes: number;
  ventas_facturadas: number;
  ventas_ecommerce: number;
  periodo: {
    inicio: string;
    fin: string;
  };
}

// ============================================
// SERVICIO DE VENTAS
// ============================================

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) { }

  // ============================================
  // 1. GET /api/ventas - Lista ventas con filtros
  // ============================================
  /**
   * Obtiene lista de ventas con información de comprobantes electrónicos
   * @param filtros Query params: estado, fecha_inicio, fecha_fin, search, page
   */
  obtenerVentas(filtros?: {
    estado?: 'PENDIENTE' | 'FACTURADO' | 'ANULADO';
    fecha_inicio?: string; // 2025-10-01
    fecha_fin?: string;    // 2025-10-31
    search?: string;
    page?: number;
  }): Observable<VentasPaginatedResponse> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = (filtros as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<VentasPaginatedResponse>(this.apiUrl, { params });
  }

  // ============================================
  // 2. GET /api/ventas/{id} - Detalle completo
  // ============================================
  /**
   * Obtiene detalle completo de una venta
   */
  obtenerVenta(id: number): Observable<VentaDetallada> {
    return this.http.get<VentaDetallada>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // 3. POST /api/ventas - Crear venta
  // ============================================
  /**
   * Crea venta y genera comprobante electrónico automáticamente
   */
  crearVenta(venta: CrearVentaRequest): Observable<CrearVentaResponse> {
    return this.http.post<CrearVentaResponse>(this.apiUrl, venta);
  }

  // ============================================
  // 4. GET /api/ventas/{id}/xml - Descargar XML
  // ============================================
  /**
   * Descarga XML firmado digitalmente
   * @returns Archivo XML (application/xml)
   */
  descargarXml(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/xml`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // 5. GET /api/ventas/{id}/pdf - Descargar PDF
  // ============================================
  /**
   * Descarga PDF del comprobante
   * @returns Archivo PDF (application/pdf)
   */
  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // 6. GET /api/ventas/{id}/cdr - Descargar CDR
  // ============================================
  /**
   * Descarga CDR (Constancia de Recepción SUNAT)
   * @returns Archivo XML (application/xml)
   */
  descargarCdr(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/cdr`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // 7. POST /api/ventas/{id}/facturar - Facturar
  // ============================================
  /**
   * Genera comprobante para venta existente
   */
  facturarVenta(id: number, datos?: FacturarVentaRequest): Observable<FacturarVentaResponse> {
    return this.http.post<FacturarVentaResponse>(`${this.apiUrl}/${id}/facturar`, datos || {});
  }

  // ============================================
  // 8. PATCH /api/ventas/{id}/anular - Anular venta
  // ============================================
  /**
   * Anula venta y restaura stock
   */
  anularVenta(id: number): Observable<AnularVentaResponse> {
    return this.http.patch<AnularVentaResponse>(`${this.apiUrl}/${id}/anular`, {});
  }

  // ============================================
  // 9. POST /api/ventas/{id}/email - Enviar email
  // ============================================
  /**
   * Envía comprobante por email
   */
  enviarEmail(id: number, email: string, mensaje?: string): Observable<EnviarEmailResponse> {
    return this.http.post<EnviarEmailResponse>(`${this.apiUrl}/${id}/email`, {
      email,
      mensaje
    });
  }

  // ============================================
  // 9b. POST /api/ventas/{id}/enviar-whatsapp - Enviar WhatsApp
  // ============================================
  /**
   * Envía comprobante por WhatsApp
   */
  enviarWhatsapp(id: number, telefono: string, mensaje?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/enviar-whatsapp`, {
      telefono,
      mensaje
    });
  }

  // ============================================
  // 10. GET /api/ventas/mis-ventas - Mis ventas (e-commerce)
  // ============================================
  /**
   * Obtiene ventas del cliente autenticado
   */
  obtenerMisVentas(page?: number): Observable<VentasPaginatedResponse> {
    let params = new HttpParams();
    if (page) {
      params = params.set('page', page.toString());
    }
    return this.http.get<VentasPaginatedResponse>(`${this.apiUrl}/mis-ventas`, { params });
  }

  // ============================================
  // 11. POST /api/ventas/ecommerce - Crear venta e-commerce
  // ============================================
  /**
   * Crea venta desde carrito de e-commerce
   */
  crearVentaEcommerce(datos: {
    productos: {
      producto_id: number;
      cantidad: number;
    }[];
    metodo_pago: string;
    requiere_factura?: boolean;
    observaciones?: string;
  }): Observable<CrearVentaResponse> {
    return this.http.post<CrearVentaResponse>(`${this.apiUrl}/ecommerce`, datos);
  }

  // ============================================
  // 11b. POST /api/ventas/{id}/enviar-sunat - Enviar a SUNAT (MANUAL)
  // ============================================
  /**
   * Envía comprobante a SUNAT manualmente
   * Usado cuando el comprobante está en estado GENERADO
   */
  enviarSunat(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/enviar-sunat`, {});
  }

  // ============================================
  // 12. POST /api/ventas/{id}/reenviar-sunat - Reenviar a SUNAT
  // ============================================
  /**
   * Reenvía comprobante a SUNAT
   */
  reenviarSunat(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reenviar-sunat`, {});
  }

  // ============================================
  // 13. POST /api/ventas/{id}/consultar-sunat - Consultar estado en SUNAT
  // ============================================
  /**
   * Consulta estado del comprobante en SUNAT
   */
  consultarSunat(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/consultar-sunat`, {});
  }

  // ============================================
  // 14. POST /api/ventas/{id}/generar-pdf - Generar PDF manualmente
  // ============================================
  /**
   * Genera PDF del comprobante manualmente
   */
  generarPdf(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/generar-pdf`, {});
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  /**
   * Helper para descargar archivos con nombre apropiado
   */
  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Determina el color para el badge de estado
   */
  obtenerColorEstado(estado: 'PENDIENTE' | 'FACTURADO' | 'ANULADO'): string {
    const colores = {
      'PENDIENTE': 'warning',
      'FACTURADO': 'success',
      'ANULADO': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Determina el color para el badge de estado SUNAT
   */
  obtenerColorEstadoSunat(estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'): string {
    const colores = {
      'PENDIENTE': 'warning',
      'ACEPTADO': 'success',
      'RECHAZADO': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Formatea el tipo de documento para mostrar
   */
  formatearTipoDocumento(tipo: string): string {
    const tiposCodigo: Record<string, string> = {
      '01': 'Factura',
      '03': 'Boleta',
      '07': 'Nota Crédito',
      '08': 'Nota Débito',
      '09': 'Nota Venta'
    };

    const tiposAbrev: Record<string, string> = {
      'FT': 'Factura',
      'BT': 'Boleta',
      'NC': 'Nota Crédito',
      'ND': 'Nota Débito',
      'NV': 'Nota Venta'
    };

    return tiposCodigo[tipo] || tiposAbrev[tipo] || tipo;
  }

  /**
   * Obtiene el icono para el tipo de documento
   */
  obtenerIconoTipoDocumento(tipo: 'FT' | 'BI' | 'NC' | 'ND' | 'NV'): string {
    const iconos = {
      'FT': 'ph-file-text',
      'BI': 'ph-receipt',
      'NC': 'ph-arrow-bend-up-left',
      'ND': 'ph-arrow-bend-up-right',
      'NV': 'ph-note'
    };
    return iconos[tipo] || 'ph-file';
  }

  /**
   * Obtiene la clase de color para el tipo de documento
   */
  obtenerColorTipoDocumento(tipo: 'FT' | 'BI' | 'NC' | 'ND' | 'NV'): string {
    const colores = {
      'FT': 'primary',
      'BI': 'success',
      'NC': 'warning',
      'ND': 'purple',
      'NV': 'secondary'
    };
    return colores[tipo] || 'secondary';
  }

  // ============================================
  // ESTADÍSTICAS (Método adicional no documentado en API)
  // ============================================
  /**
   * Obtiene estadísticas de ventas
   * Nota: Este endpoint puede no estar disponible en la API actual
   */
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
}