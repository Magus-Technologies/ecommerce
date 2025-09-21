import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Modelos
import { 
  Recompensa, 
  FiltrosRecompensas, 
  Paginacion, 
  TipoRecompensa, 
  RecompensaFormData,
  EstadisticasRecompensas 
} from '../models/recompensa.model';

// Interfaces para respuestas de la API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RecompensaDetalleResponse {
  recompensa: Recompensa;
  configuracion: {
    clientes: Array<{
      id: number;
      segmento: string;
      segmento_nombre: string;
      cliente: any;
      es_cliente_especifico: boolean;
    }>;
    productos: Array<{
      id: number;
      tipo_elemento: string;
      nombre_elemento: string;
      producto: any;
      categoria: any;
    }>;
    puntos: Array<{
      id: number;
      tipo_calculo: string;
      valor: number;
      minimo_compra: number;
      maximo_puntos: number;
      multiplicador_nivel: number;
    }>;
    descuentos: any[];
    envios: any[];
    regalos: any[];
  };
  historial_reciente: Array<{
    id: number;
    cliente: string;
    puntos_otorgados: number;
    beneficio_aplicado: string;
    fecha_aplicacion: string;
    tiempo_transcurrido: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RecompensasService {
  private readonly baseUrl = `${environment.apiUrl}/admin/recompensas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista paginada de recompensas con filtros
   */
  getRecompensas(filtros: FiltrosRecompensas = {}): Observable<ApiResponse<Paginacion>> {
    let params = new HttpParams();
    
    // Agregar filtros a los parámetros
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof FiltrosRecompensas];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Paginacion>>(this.baseUrl, { params });
  }

  /**
   * Obtiene el detalle completo de una recompensa
   */
  getRecompensaDetalle(id: number): Observable<ApiResponse<RecompensaDetalleResponse>> {
    return this.http.get<ApiResponse<RecompensaDetalleResponse>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva recompensa
   */
  createRecompensa(data: RecompensaFormData): Observable<ApiResponse<Recompensa>> {
    return this.http.post<ApiResponse<Recompensa>>(this.baseUrl, data);
  }

  /**
   * Actualiza una recompensa existente
   */
  updateRecompensa(id: number, data: Partial<RecompensaFormData>): Observable<ApiResponse<Recompensa>> {
    return this.http.put<ApiResponse<Recompensa>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Elimina (desactiva) una recompensa
   */
  deleteRecompensa(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activa una recompensa
   */
  activarRecompensa(id: number): Observable<ApiResponse<Recompensa>> {
    return this.http.patch<ApiResponse<Recompensa>>(`${this.baseUrl}/${id}/activate`, {});
  }

  /**
   * Obtiene las estadísticas del sistema de recompensas
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasRecompensas>> {
    return this.http.get<ApiResponse<EstadisticasRecompensas>>(`${this.baseUrl}/estadisticas`);
  }

  /**
   * Obtiene los tipos de recompensas disponibles
   */
  getTiposRecompensas(): Observable<ApiResponse<TipoRecompensa[]>> {
    return this.http.get<ApiResponse<TipoRecompensa[]>>(`${this.baseUrl}/tipos`);
  }

  /**
   * Obtiene las páginas para la paginación
   */
  getPageNumbers(currentPage: number, lastPage: number, maxPages: number = 5): number[] {
    const pages: number[] = [];
    const half = Math.floor(maxPages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(lastPage, start + maxPages - 1);
    
    // Ajustar el inicio si estamos cerca del final
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Valida los datos de una recompensa antes de enviar
   */
  validarRecompensa(data: RecompensaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre es obligatorio');
    } else if (data.nombre.length > 255) {
      errors.push('El nombre no puede exceder 255 caracteres');
    }

    // Validar tipo
    if (!data.tipo) {
      errors.push('Debe seleccionar un tipo de recompensa');
    }

    // Validar fechas
    if (!data.fecha_inicio) {
      errors.push('La fecha de inicio es obligatoria');
    }

    if (!data.fecha_fin) {
      errors.push('La fecha de fin es obligatoria');
    }

    if (data.fecha_inicio && data.fecha_fin) {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaInicio < hoy) {
        errors.push('La fecha de inicio debe ser hoy o posterior');
      }

      if (fechaFin <= fechaInicio) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea los filtros para la API
   */
  formatearFiltros(filtros: FiltrosRecompensas): FiltrosRecompensas {
    const filtrosFormateados: Partial<FiltrosRecompensas> = {};

    // Solo incluir filtros que tengan valor
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof FiltrosRecompensas];
      if (value !== undefined && value !== null && value !== '') {
        (filtrosFormateados as any)[key] = value;
      }
    });

    return filtrosFormateados as FiltrosRecompensas;
  }

  /**
   * Obtiene el texto de error amigable para el usuario
   */
  getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.error?.errors) {
      const errors = error.error.errors;
      const firstError = Object.keys(errors)[0];
      return errors[firstError][0];
    }
    
    if (error.status === 401) {
      return 'No tienes permisos para realizar esta acción';
    }
    
    if (error.status === 403) {
      return 'Acceso denegado';
    }
    
    if (error.status === 404) {
      return 'Recurso no encontrado';
    }
    
    if (error.status === 422) {
      return 'Los datos proporcionados no son válidos';
    }
    
    if (error.status >= 500) {
      return 'Error interno del servidor. Intenta nuevamente más tarde';
    }
    
    return 'Ha ocurrido un error inesperado';
  }
}
