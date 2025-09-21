// Modelos para el submódulo de Configuración de Envíos

export interface ConfiguracionEnvio {
  id: number;
  minimo_compra: number;
  tiene_monto_minimo: boolean;
  zonas_aplicables: string[];
  codigos_zona: string[];
  cantidad_zonas: number;
  aplica_todas_zonas: boolean;
  configuracion_valida: boolean;
  descripcion: string;
  resumen: {
    total_zonas_activas: number;
    monto_minimo_promedio: number;
    cobertura_porcentaje: number;
    zonas_principales: string[];
  };
  reglas_especiales: ReglaEnvioEspecial[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ReglaEnvioEspecial {
  id: number;
  nombre: string;
  descripcion: string;
  condicion: string;
  minimo_compra?: number;
  zonas_aplicables: string[];
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  producto_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
  cantidad_minima?: number;
  cantidad_maxima?: number;
}

export interface SimulacionEnvio {
  monto_compra: number;
  codigo_postal: string;
  categoria_id?: number;
  producto_id?: number;
  cantidad_productos?: number;
  es_primera_compra: boolean;
  resultado: {
    aplica_envio_gratis: boolean;
    monto_minimo_requerido: number;
    monto_faltante: number;
    zonas_aplicables: string[];
    reglas_aplicadas: string[];
    descripcion_calculo: string;
  };
}

export interface ValidacionConfiguracionEnvio {
  es_valida: boolean;
  errores: string[];
  advertencias: string[];
  recomendaciones: string[];
  resumen_validacion: {
    configuracion_completa: boolean;
    zonas_validas: boolean;
    montos_razonables: boolean;
    fechas_validas: boolean;
  };
}

export interface EstadisticasEnvios {
  resumen_general: {
    total_configuraciones: number;
    configuraciones_activas: number;
    reglas_especiales_activas: number;
    envios_gratis_aplicados_mes: number;
    monto_ahorrado_mes: number;
  };
  por_zona: {
    codigo_zona: string;
    nombre_zona: string;
    cantidad_aplicaciones: number;
    monto_ahorrado: number;
    promedio_ahorro_por_aplicacion: number;
  }[];
  top_reglas_especiales: {
    id: number;
    nombre: string;
    aplicaciones: number;
    monto_ahorrado: number;
    efectividad: number;
  }[];
  tendencia_mensual: {
    mes: string;
    aplicaciones: number;
    monto_ahorrado: number;
    promedio_ahorro_por_aplicacion: number;
  }[];
  distribucion_por_monto: {
    rango: string;
    cantidad_aplicaciones: number;
    porcentaje: number;
  }[];
  cobertura_geografica: {
    departamento: string;
    provincias: number;
    distritos: number;
    cobertura_porcentaje: number;
  }[];
  metadata: {
    generado_en: string;
    recompensa_id: number;
    cache_valido_hasta: string;
  };
}

export interface EnvioFormData {
  minimo_compra: number;
  tiene_monto_minimo: boolean;
  zonas_aplicables: string[];
  aplica_todas_zonas: boolean;
  descripcion: string;
}

export interface ReglaEnvioFormData {
  nombre: string;
  descripcion: string;
  condicion: string;
  minimo_compra?: number;
  zonas_aplicables: string[];
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  producto_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
  cantidad_minima?: number;
  cantidad_maxima?: number;
}

export interface SimulacionEnvioFormData {
  monto_compra: number;
  codigo_postal: string;
  categoria_id?: number;
  producto_id?: number;
  cantidad_productos?: number;
  es_primera_compra: boolean;
}

export interface RespuestaConfiguracionEnvio {
  success: boolean;
  message: string;
  data: {
    recompensa: {
      id: number;
      nombre: string;
      tipo: string;
    };
    configuraciones: ConfiguracionEnvio[];
    estadisticas: EstadisticasEnvios;
  };
}

export interface RespuestaSimulacionEnvio {
  success: boolean;
  message: string;
  data: SimulacionEnvio;
}

export interface RespuestaValidacionEnvio {
  success: boolean;
  message: string;
  data: ValidacionConfiguracionEnvio;
}

export interface RespuestaReglaEnvio {
  success: boolean;
  message: string;
  data: ReglaEnvioEspecial;
}

export interface RespuestaEstadisticasEnvio {
  success: boolean;
  message: string;
  data: EstadisticasEnvios;
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

export interface ZonaInfo {
  codigo: string;
  nombre: string;
  departamento: string;
  provincia: string;
  distrito: string;
  activa: boolean;
}

export interface FiltrosReglasEnvio {
  activa?: boolean;
  categoria_id?: number;
  producto_id?: number;
  buscar?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginacionReglasEnvio {
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

export interface CondicionEnvio {
  value: string;
  label: string;
  descripcion: string;
}
