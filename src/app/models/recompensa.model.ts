export interface Recompensa {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'puntos' | 'descuento' | 'envio_gratis' | 'regalo';
  tipo_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  es_vigente: boolean;
  total_aplicaciones: number;
  creador: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  tiene_clientes: boolean;
  tiene_productos: boolean;
  tiene_configuracion: boolean;
}

export interface FiltrosRecompensas {
  tipo?: string;
  activo?: boolean;
  vigente?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface Paginacion {
  current_page: number;
  data: Recompensa[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TipoRecompensa {
  value: string;
  label: string;
}

export interface RecompensaFormData {
  nombre: string;
  descripcion?: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface EstadisticasRecompensas {
  resumen: {
    total_recompensas: number;
    recompensas_activas: number;
    recompensas_vigentes: number;
    tasa_activacion: number;
  };
  por_tipo: Record<string, { total: number; activas: number }>;
  mes_actual: {
    aplicaciones: number;
    puntos_otorgados: number;
    clientes_beneficiados: number;
    promedio_puntos_por_aplicacion: number;
  };
  comparativa_mes_anterior: {
    aplicaciones: Tendencia;
    puntos_otorgados: Tendencia;
    clientes_beneficiados: Tendencia;
  };
  top_recompensas_mes: Array<{
    id: number;
    nombre: string;
    tipo: string;
    total_aplicaciones: number;
    clientes_unicos: number;
  }>;
}

export interface Tendencia {
  porcentaje: number;
  direccion: 'subida' | 'bajada' | 'estable';
  diferencia: number;
}
