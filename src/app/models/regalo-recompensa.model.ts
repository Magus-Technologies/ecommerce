// Modelos para el submódulo de Configuración de Regalos

export interface ConfiguracionRegalo {
  id: number;
  producto_id: number;
  cantidad: number;
  es_regalo_multiple: boolean;
  valor_total_regalo: number;
  tiene_stock_suficiente: boolean;
  stock_disponible: number;
  puede_ser_otorgado: boolean;
  configuracion_valida: boolean;
  descripcion: string;
  resumen: {
    total_regalos_configurados: number;
    valor_total_regalos: number;
    stock_total_disponible: number;
    regalos_disponibles: number;
  };
  reglas_especiales: ReglaRegaloEspecial[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ReglaRegaloEspecial {
  id: number;
  nombre: string;
  descripcion: string;
  condicion: string;
  producto_id: number;
  cantidad: number;
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
  cantidad_minima?: number;
  cantidad_maxima?: number;
  es_primera_compra: boolean;
}

export interface SimulacionRegalo {
  monto_compra: number;
  categoria_id?: number;
  cantidad_productos?: number;
  es_primera_compra: boolean;
  resultado: {
    regalos_disponibles: RegaloDisponible[];
    regalos_aplicables: RegaloAplicable[];
    total_regalos_otorgados: number;
    valor_total_regalos: number;
    reglas_aplicadas: string[];
    descripcion_calculo: string;
  };
}

export interface RegaloDisponible {
  producto_id: number;
  nombre_producto: string;
  cantidad_disponible: number;
  stock_actual: number;
  valor_unitario: number;
  valor_total: number;
  puede_ser_otorgado: boolean;
  razon_no_disponible?: string;
}

export interface RegaloAplicable {
  producto_id: number;
  nombre_producto: string;
  cantidad_otorgada: number;
  valor_unitario: number;
  valor_total: number;
  regla_aplicada: string;
  condicion_cumplida: string;
}

export interface ValidacionConfiguracionRegalo {
  es_valida: boolean;
  errores: string[];
  advertencias: string[];
  recomendaciones: string[];
  resumen_validacion: {
    configuracion_completa: boolean;
    stock_suficiente: boolean;
    productos_validos: boolean;
    fechas_validas: boolean;
  };
}

export interface EstadisticasRegalos {
  resumen_general: {
    total_configuraciones: number;
    configuraciones_activas: number;
    reglas_especiales_activas: number;
    regalos_otorgados_mes: number;
    valor_total_regalos_mes: number;
  };
  por_producto: {
    producto_id: number;
    nombre_producto: string;
    cantidad_otorgada: number;
    valor_total: number;
    stock_restante: number;
    porcentaje_utilizado: number;
  }[];
  top_reglas_especiales: {
    id: number;
    nombre: string;
    aplicaciones: number;
    valor_total_regalos: number;
    efectividad: number;
  }[];
  tendencia_mensual: {
    mes: string;
    regalos_otorgados: number;
    valor_total_regalos: number;
    promedio_valor_por_regalo: number;
  }[];
  distribucion_por_categoria: {
    categoria_id: number;
    nombre_categoria: string;
    cantidad_regalos: number;
    valor_total: number;
    porcentaje: number;
  }[];
  estado_stock: {
    producto_id: number;
    nombre_producto: string;
    stock_inicial: number;
    stock_actual: number;
    stock_utilizado: number;
    porcentaje_utilizado: number;
    estado: 'disponible' | 'bajo_stock' | 'agotado';
  }[];
  metadata: {
    generado_en: string;
    recompensa_id: number;
    cache_valido_hasta: string;
  };
}

export interface RegaloFormData {
  producto_id: number;
  cantidad: number;
  es_regalo_multiple: boolean;
  descripcion: string;
}

export interface ReglaRegaloFormData {
  nombre: string;
  descripcion: string;
  condicion: string;
  producto_id: number;
  cantidad: number;
  activa: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria_id?: number;
  monto_minimo?: number;
  monto_maximo?: number;
  cantidad_minima?: number;
  cantidad_maxima?: number;
  es_primera_compra: boolean;
}

export interface SimulacionRegaloFormData {
  monto_compra: number;
  categoria_id?: number;
  cantidad_productos?: number;
  es_primera_compra: boolean;
}

export interface RespuestaConfiguracionRegalo {
  success: boolean;
  message: string;
  data: {
    recompensa: {
      id: number;
      nombre: string;
      tipo: string;
    };
    configuraciones: ConfiguracionRegalo[];
    estadisticas: EstadisticasRegalos;
  };
}

export interface RespuestaSimulacionRegalo {
  success: boolean;
  message: string;
  data: SimulacionRegalo;
}

export interface RespuestaValidacionRegalo {
  success: boolean;
  message: string;
  data: ValidacionConfiguracionRegalo;
}

export interface RespuestaReglaRegalo {
  success: boolean;
  message: string;
  data: ReglaRegaloEspecial;
}

export interface RespuestaEstadisticasRegalo {
  success: boolean;
  message: string;
  data: EstadisticasRegalos;
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
  stock: number;
  categoria: CategoriaInfo;
  imagen_url?: string;
  descripcion?: string;
}

export interface FiltrosReglasRegalo {
  activa?: boolean;
  categoria_id?: number;
  producto_id?: number;
  buscar?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginacionReglasRegalo {
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

export interface CondicionRegalo {
  value: string;
  label: string;
  descripcion: string;
}
