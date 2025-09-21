// Modelos para el submódulo de Configuración de Puntos

export interface ConfiguracionPuntos {
  id: number;
  puntos_por_peso: number;
  puntos_minimos_redencion: number;
  valor_punto_pesos: number;
  puntos_maximos_por_compra: number;
  dias_expiracion: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ReglaEspecial {
  id: number;
  nombre: string;
  descripcion: string;
  condicion: string;
  puntos_otorgados: number;
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  producto_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
}

export interface SimulacionPuntos {
  monto_compra: number;
  categoria_id?: number;
  producto_id?: number;
  es_registro: boolean;
  resultado: {
    puntos_por_compra: number;
    puntos_por_monto: number;
    puntos_registro: number;
    puntos_reglas_especiales: number;
    total_puntos: number;
    reglas_aplicadas: string[];
    descripcion_calculo: string;
  };
}

export interface ValidacionConfiguracion {
  es_valida: boolean;
  errores: string[];
  advertencias: string[];
  recomendaciones: string[];
  resumen_validacion: {
    configuracion_completa: boolean;
    reglas_conflictivas: boolean;
    puntos_razonables: boolean;
    fechas_validas: boolean;
  };
}

export interface EstadisticasPuntos {
  resumen_general: {
    total_configuraciones: number;
    configuraciones_activas: number;
    reglas_especiales_activas: number;
    puntos_otorgados_mes: number;
  };
  por_tipo_otorgamiento: {
    tipo: string;
    cantidad_aplicaciones: number;
    puntos_otorgados: number;
    promedio_puntos_por_aplicacion: number;
  }[];
  top_reglas_especiales: {
    id: number;
    nombre: string;
    aplicaciones: number;
    puntos_otorgados: number;
    efectividad: number;
  }[];
  tendencia_mensual: {
    mes: string;
    aplicaciones: number;
    puntos_otorgados: number;
    promedio_puntos_por_aplicacion: number;
  }[];
  metadata: {
    generado_en: string;
    recompensa_id: number;
    cache_valido_hasta: string;
  };
}

export interface PuntosFormData {
  puntos_por_compra: number;
  puntos_por_monto: number;
  puntos_registro: number;
  descripcion: string;
}

export interface ReglaEspecialFormData {
  nombre: string;
  descripcion: string;
  condicion: string;
  puntos_otorgados: number;
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  producto_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
}

export interface SimulacionFormData {
  monto_compra: number;
  categoria_id?: number;
  producto_id?: number;
  es_registro: boolean;
}

export interface RespuestaConfiguracionPuntos {
  success: boolean;
  message: string;
  data: {
    recompensa: {
      id: number;
      nombre: string;
      tipo: string;
    };
    configuraciones: ConfiguracionPuntos[];
    estadisticas: EstadisticasPuntos;
  };
}

export interface RespuestaSimulacion {
  success: boolean;
  message: string;
  data: SimulacionPuntos;
}

export interface RespuestaValidacion {
  success: boolean;
  message: string;
  data: ValidacionConfiguracion;
}

export interface RespuestaReglaEspecial {
  success: boolean;
  message: string;
  data: ReglaEspecial;
}

export interface RespuestaEstadisticas {
  success: boolean;
  message: string;
  data: EstadisticasPuntos;
}

export interface CategoriaInfo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface ProductoInfo {
  id: number;
  nombre: string;
  codigo_producto: string;
  precio_venta: number;
  categoria: CategoriaInfo;
}

export interface FiltrosReglas {
  activa?: boolean;
  categoria_id?: number;
  producto_id?: number;
  buscar?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginacionReglas {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
