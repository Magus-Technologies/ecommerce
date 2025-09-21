export interface ClienteInfo {
  id: number;
  nombre_completo: string;
  email: string;
  numero_documento?: string;
  segmento_actual?: string;
}

export interface SegmentoAsignado {
  id: number;
  segmento: string;
  segmento_nombre: string;
  cliente_id?: number;
  cliente?: ClienteInfo;
  es_cliente_especifico: boolean;
}

export interface SegmentoDisponible {
  value: string;
  label: string;
  descripcion: string;
}

export interface SegmentoFormData {
  segmento: string;
  cliente_id?: number;
}

export interface EstadisticasSegmentacion {
  total_segmentos_configurados: number;
  clientes_especificos: number;
  segmentos_generales: number;
  por_segmento: Array<{
    segmento: string;
    cantidad: number;
    clientes_especificos: number;
  }>;
  clientes_potenciales: {
    todos: number;
    nuevos: number;
    regulares: number;
    vip: number;
    inactivos: number;
    distribuciones: {
      nuevos_porcentaje: number;
      regulares_porcentaje: number;
      vip_porcentaje: number;
      inactivos_porcentaje: number;
    };
  };
  distribucion_por_segmento: Array<{
    segmento: string;
    segmento_nombre: string;
    recompensas_asignadas: number;
    descripcion: string;
  }>;
  efectividad_segmentos: Array<{
    segmento: string;
    segmento_nombre: string;
    cliente_especifico?: ClienteInfo;
    metricas: {
      aplicaciones_totales: number;
      clientes_unicos: number;
      puntos_otorgados: number;
      promedio_aplicaciones_por_cliente: number;
      promedio_puntos_por_aplicacion: number;
    };
  }>;
}

export interface ValidacionCliente {
  cliente: ClienteInfo;
  cumple_recompensa: boolean;
  segmentos_cumplidos: Array<{
    segmento: string;
    segmento_nombre: string;
  }>;
  total_segmentos_configurados: number;
}

export interface SegmentoCumplido {
  segmento: string;
  segmento_nombre: string;
}
