# 📊 SUBMÓDULO: Analytics Avanzados de Recompensas

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/analytics`  
**Prefijo API:** `/api/admin/recompensas/analytics`  
**Permisos Requeridos:** `recompensas.ver`

Este submódulo proporciona análisis avanzados y métricas detalladas del sistema de recompensas, incluyendo dashboards ejecutivos, tendencias, comparativas y análisis de comportamiento de clientes.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/analytics/dashboard` - Dashboard Principal

**Descripción:** Obtiene el dashboard principal con métricas consolidadas y resumen ejecutivo.

**Permisos:** `recompensas.ver`

**Parámetros de Query:** Ninguno (datos cacheados por 1 hora)

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/analytics/dashboard
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Dashboard de analytics obtenido exitosamente",
  "data": {
    "resumen_ejecutivo": {
      "aplicaciones_mes": 1250,
      "clientes_activos_mes": 890,
      "puntos_otorgados_mes": 62500,
      "crecimiento": {
        "aplicaciones": {
          "porcentaje": 27.55,
          "direccion": "subida",
          "diferencia": 270
        },
        "clientes": {
          "porcentaje": 23.61,
          "direccion": "subida",
          "diferencia": 170
        },
        "puntos": {
          "porcentaje": 27.55,
          "direccion": "subida",
          "diferencia": 13500
        }
      },
      "participacion_clientes": 68.5
    },
    "metricas_principales": {
      "recompensas_totales": 67,
      "recompensas_activas": 45,
      "recompensas_vigentes": 38,
      "utilizacion_promedio": 27.78,
      "efectividad_general": 68.5,
      "roi_estimado": {
        "costo_estimado": 625.0,
        "beneficio_estimado": 6250.0,
        "roi_porcentaje": 900.0
      }
    },
    "tendencias_mensuales": {
      "2024-01": {
        "total_aplicaciones": 1250,
        "total_clientes": 890,
        "total_puntos": 62500,
        "por_tipo": {
          "puntos": {
            "aplicaciones": 800,
            "clientes_unicos": 600,
            "puntos_otorgados": 40000
          },
          "descuento": {
            "aplicaciones": 300,
            "clientes_unicos": 250,
            "puntos_otorgados": 15000
          }
        }
      }
    },
    "top_recompensas": [
      {
        "id": 1,
        "nombre": "Programa de Fidelidad Q1 2024",
        "tipo": "puntos",
        "total_aplicaciones": 450,
        "clientes_unicos": 320,
        "puntos_otorgados": 22500,
        "promedio_puntos": 50.0
      }
    ],
    "segmentacion_uso": [
      {
        "segmento": "nuevos",
        "aplicaciones": 300,
        "clientes_unicos": 250,
        "puntos_totales": 15000
      },
      {
        "segmento": "regulares",
        "aplicaciones": 600,
        "clientes_unicos": 400,
        "puntos_totales": 30000
      },
      {
        "segmento": "veteranos",
        "aplicaciones": 350,
        "clientes_unicos": 240,
        "puntos_totales": 17500
      }
    ],
    "conversion_rates": {
      "tasa_adopcion": 68.5,
      "clientes_activos": 890,
      "clientes_totales": 1300,
      "conversiones_por_tipo": {
        "puntos": 600,
        "descuento": 250,
        "envio_gratis": 150,
        "regalo": 100
      }
    }
  },
  "metadata": {
    "generado_en": "2024-01-15T17:30:00.000000Z",
    "cache_hasta": "2024-01-15T18:30:00.000000Z",
    "periodo_analisis": "Últimos 12 meses"
  }
}
```

---

### 2. **GET** `/api/admin/recompensas/analytics/tendencias` - Tendencias Detalladas

**Descripción:** Obtiene tendencias detalladas por período configurable.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "periodo": "diario|mensual|anual (default: mensual)",
  "fecha_inicio": "YYYY-MM-DD (default: 6 meses atrás)",
  "fecha_fin": "YYYY-MM-DD (default: hoy)"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/analytics/tendencias?periodo=mensual&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Tendencias obtenidas exitosamente",
  "data": {
    "periodo": "mensual",
    "rango_fechas": {
      "inicio": "2024-01-01",
      "fin": "2024-12-31"
    },
    "tendencias": {
      "2024-01": [
        {
          "periodo": "2024-01",
          "aplicaciones": 800,
          "clientes_unicos": 600,
          "puntos_otorgados": 40000,
          "tipo": "puntos"
        },
        {
          "periodo": "2024-01",
          "aplicaciones": 300,
          "clientes_unicos": 250,
          "puntos_otorgados": 15000,
          "tipo": "descuento"
        }
      ],
      "2024-02": [
        {
          "periodo": "2024-02",
          "aplicaciones": 850,
          "clientes_unicos": 620,
          "puntos_otorgados": 42500,
          "tipo": "puntos"
        }
      ]
    },
    "resumen": {
      "totales": {
        "aplicaciones": 1650,
        "clientes": 1220,
        "puntos": 82500
      },
      "promedios": {
        "aplicaciones_por_periodo": 825.0,
        "clientes_por_periodo": 610.0,
        "puntos_por_periodo": 41250.0
      }
    }
  }
}
```

---

### 3. **GET** `/api/admin/recompensas/analytics/rendimiento` - Métricas de Rendimiento

**Descripción:** Obtiene métricas de rendimiento específicas por recompensa o generales.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "recompensa_id": "integer (optional - para recompensa específica)",
  "periodo": "integer (días, default: 30)"
}
```

**Ejemplo de Request (Rendimiento General):**
```bash
GET /api/admin/recompensas/analytics/rendimiento?periodo=30
Authorization: Bearer {token}
```

**Ejemplo de Response (Rendimiento General):**
```json
{
  "success": true,
  "message": "Métricas de rendimiento obtenidas exitosamente",
  "data": {
    "resumen_general": {
      "aplicaciones_totales": 1250,
      "clientes_unicos": 890,
      "recompensas_utilizadas": 15,
      "puntos_totales": 62500
    },
    "por_tipo": [
      {
        "tipo": "puntos",
        "aplicaciones": 800,
        "clientes": 600,
        "puntos": 40000
      },
      {
        "tipo": "descuento",
        "aplicaciones": 300,
        "clientes": 250,
        "puntos": 15000
      },
      {
        "tipo": "envio_gratis",
        "aplicaciones": 100,
        "clientes": 80,
        "puntos": 5000
      },
      {
        "tipo": "regalo",
        "aplicaciones": 50,
        "clientes": 40,
        "puntos": 2500
      }
    ]
  }
}
```

**Ejemplo de Request (Rendimiento Específico):**
```bash
GET /api/admin/recompensas/analytics/rendimiento?recompensa_id=1&periodo=30
Authorization: Bearer {token}
```

**Ejemplo de Response (Rendimiento Específico):**
```json
{
  "success": true,
  "message": "Métricas de rendimiento obtenidas exitosamente",
  "data": {
    "aplicaciones": 450,
    "clientes_unicos": 320,
    "puntos_totales": 22500,
    "promedio_puntos": 50.0,
    "ultima_aplicacion": "2024-01-15T16:45:00.000000Z",
    "primera_aplicacion": "2024-01-01T10:00:00.000000Z"
  }
}
```

---

### 4. **GET** `/api/admin/recompensas/analytics/comparativa` - Comparativa entre Períodos

**Descripción:** Compara métricas entre dos períodos específicos.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "periodo_actual_inicio": "YYYY-MM-DD (default: 30 días atrás)",
  "periodo_actual_fin": "YYYY-MM-DD (default: hoy)",
  "periodo_anterior_inicio": "YYYY-MM-DD (default: 60 días atrás)",
  "periodo_anterior_fin": "YYYY-MM-DD (default: 30 días atrás)"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/analytics/comparativa?periodo_actual_inicio=2024-01-01&periodo_actual_fin=2024-01-31&periodo_anterior_inicio=2023-12-01&periodo_anterior_fin=2023-12-31
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Comparativa de períodos obtenida exitosamente",
  "data": {
    "periodo_actual": {
      "fechas": {
        "inicio": "2024-01-01",
        "fin": "2024-01-31"
      },
      "metricas": {
        "aplicaciones": 1250,
        "clientes_unicos": 890,
        "puntos_totales": 62500,
        "recompensas_utilizadas": 15
      }
    },
    "periodo_anterior": {
      "fechas": {
        "inicio": "2023-12-01",
        "fin": "2023-12-31"
      },
      "metricas": {
        "aplicaciones": 980,
        "clientes_unicos": 720,
        "puntos_totales": 49000,
        "recompensas_utilizadas": 12
      }
    },
    "comparativa": {
      "aplicaciones": {
        "porcentaje": 27.55,
        "direccion": "subida",
        "diferencia": 270
      },
      "clientes": {
        "porcentaje": 23.61,
        "direccion": "subida",
        "diferencia": 170
      },
      "puntos": {
        "porcentaje": 27.55,
        "direccion": "subida",
        "diferencia": 13500
      }
    }
  }
}
```

---

### 5. **GET** `/api/admin/recompensas/analytics/comportamiento-clientes` - Análisis de Comportamiento

**Descripción:** Obtiene análisis detallado del comportamiento de los clientes con las recompensas.

**Permisos:** `recompensas.ver`

**Parámetros de Query:** Ninguno (datos cacheados por 30 minutos)

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/analytics/comportamiento-clientes
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Análisis de comportamiento obtenido exitosamente",
  "data": {
    "segmentacion_participacion": [
      {
        "segmento": "nuevos",
        "aplicaciones": 300,
        "clientes_participantes": 250
      },
      {
        "segmento": "regulares",
        "aplicaciones": 600,
        "clientes_participantes": 400
      },
      {
        "segmento": "veteranos",
        "aplicaciones": 350,
        "clientes_participantes": 240
      }
    ],
    "frecuencia_uso": {
      "ocasional": 450,
      "regular": 300,
      "frecuente": 120,
      "muy_frecuente": 20
    },
    "patrones_temporales": {
      "por_dia_semana": [
        {
          "dia_semana": "Monday",
          "aplicaciones": 180
        },
        {
          "dia_semana": "Tuesday",
          "aplicaciones": 200
        },
        {
          "dia_semana": "Wednesday",
          "aplicaciones": 220
        },
        {
          "dia_semana": "Thursday",
          "aplicaciones": 190
        },
        {
          "dia_semana": "Friday",
          "aplicaciones": 250
        },
        {
          "dia_semana": "Saturday",
          "aplicaciones": 300
        },
        {
          "dia_semana": "Sunday",
          "aplicaciones": 280
        }
      ],
      "por_hora_dia": [
        {
          "hora": 9,
          "aplicaciones": 45
        },
        {
          "hora": 10,
          "aplicaciones": 78
        },
        {
          "hora": 11,
          "aplicaciones": 95
        },
        {
          "hora": 12,
          "aplicaciones": 120
        },
        {
          "hora": 13,
          "aplicaciones": 110
        },
        {
          "hora": 14,
          "aplicaciones": 125
        },
        {
          "hora": 15,
          "aplicaciones": 140
        },
        {
          "hora": 16,
          "aplicaciones": 155
        },
        {
          "hora": 17,
          "aplicaciones": 180
        },
        {
          "hora": 18,
          "aplicaciones": 200
        },
        {
          "hora": 19,
          "aplicaciones": 185
        },
        {
          "hora": 20,
          "aplicaciones": 160
        }
      ]
    },
    "fidelizacion": {
      "tasa_retencion": 45.2,
      "clientes_fidelizados": 402,
      "total_clientes": 890
    },
    "valor_cliente": {
      "valor_promedio_por_aplicacion": 50.0,
      "valor_maximo": 500,
      "valor_minimo": 10,
      "desviacion_estandar": 45.67
    }
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Dashboard Principal de Analytics**

```typescript
interface DashboardAnalyticsProps {
  resumenEjecutivo: ResumenEjecutivo;
  metricasPrincipales: MetricasPrincipales;
  tendenciasMensuales: TendenciasMensuales;
  topRecompensas: RecompensaRendimiento[];
  segmentacionUso: SegmentacionUso[];
  conversionRates: ConversionRates;
}

interface ResumenEjecutivo {
  aplicaciones_mes: number;
  clientes_activos_mes: number;
  puntos_otorgados_mes: number;
  crecimiento: {
    aplicaciones: Tendencia;
    clientes: Tendencia;
    puntos: Tendencia;
  };
  participacion_clientes: number;
}

interface Tendencia {
  porcentaje: number;
  direccion: 'subida' | 'bajada' | 'estable';
  diferencia: number;
}
```

**Características:**
- Tarjetas con métricas principales y tendencias
- Gráficos de crecimiento con indicadores visuales
- Tabla de top recompensas por rendimiento
- Gráfico de segmentación de uso
- Indicadores de conversión y adopción

### 2. **Vista de Tendencias**

```typescript
interface TendenciasViewProps {
  periodo: 'diario' | 'mensual' | 'anual';
  rangoFechas: {
    inicio: string;
    fin: string;
  };
  tendencias: Record<string, TendenciaPeriodo[]>;
  resumen: ResumenTendencias;
  onPeriodoChange: (periodo: string) => void;
  onFechasChange: (inicio: string, fin: string) => void;
}

interface TendenciaPeriodo {
  periodo: string;
  aplicaciones: number;
  clientes_unicos: number;
  puntos_otorgados: number;
  tipo: string;
}
```

**Características:**
- Selector de período (diario, mensual, anual)
- Selector de rango de fechas
- Gráficos de líneas para tendencias
- Filtros por tipo de recompensa
- Exportación de datos

### 3. **Análisis de Rendimiento**

```typescript
interface RendimientoViewProps {
  tipo: 'general' | 'especifico';
  recompensaId?: number;
  periodo: number;
  datos: RendimientoData;
  onRecompensaSelect: (id: number) => void;
  onPeriodoChange: (dias: number) => void;
}

interface RendimientoData {
  resumen_general?: ResumenGeneral;
  por_tipo?: RendimientoPorTipo[];
  // Para rendimiento específico
  aplicaciones?: number;
  clientes_unicos?: number;
  puntos_totales?: number;
  promedio_puntos?: number;
  ultima_aplicacion?: string;
  primera_aplicacion?: string;
}
```

**Características:**
- Toggle entre vista general y específica
- Selector de recompensa para análisis específico
- Slider para ajustar período de análisis
- Gráficos de barras y donut
- Métricas de tiempo (primera/última aplicación)

### 4. **Comparativa de Períodos**

```typescript
interface ComparativaViewProps {
  periodoActual: PeriodoConfig;
  periodoAnterior: PeriodoConfig;
  comparativa: ComparativaData;
  onPeriodoChange: (tipo: 'actual' | 'anterior', config: PeriodoConfig) => void;
}

interface PeriodoConfig {
  inicio: string;
  fin: string;
}

interface ComparativaData {
  periodo_actual: {
    fechas: PeriodoConfig;
    metricas: MetricasPeriodo;
  };
  periodo_anterior: {
    fechas: PeriodoConfig;
    metricas: MetricasPeriodo;
  };
  comparativa: {
    aplicaciones: Tendencia;
    clientes: Tendencia;
    puntos: Tendencia;
  };
}
```

**Características:**
- Selectores de fechas para ambos períodos
- Vista lado a lado de métricas
- Indicadores de crecimiento/declive
- Gráficos comparativos
- Exportación de reporte comparativo

### 5. **Análisis de Comportamiento de Clientes**

```typescript
interface ComportamientoClientesProps {
  segmentacionParticipacion: SegmentacionParticipacion[];
  frecuenciaUso: FrecuenciaUso;
  patronesTemporales: PatronesTemporales;
  fidelizacion: Fidelizacion;
  valorCliente: ValorCliente;
}

interface FrecuenciaUso {
  ocasional: number;
  regular: number;
  frecuente: number;
  muy_frecuente: number;
}

interface PatronesTemporales {
  por_dia_semana: PatronTemporal[];
  por_hora_dia: PatronTemporal[];
}

interface PatronTemporal {
  periodo: string;
  aplicaciones: number;
}
```

**Características:**
- Gráfico de barras para segmentación
- Gráfico de donut para frecuencia de uso
- Gráfico de líneas para patrones temporales
- Heatmap de horas del día
- Métricas de fidelización y valor del cliente

---

## 🔧 Implementación Técnica

### Cache y Optimización

```php
// Cache por 1 hora para dashboard principal
$cacheKey = 'recompensas_dashboard_' . now()->format('Y-m-d-H');
$dashboard = Cache::remember($cacheKey, 3600, function () {
    return $this->generarDashboard();
});

// Cache por 30 minutos para comportamiento de clientes
$cacheKey = 'recompensas_comportamiento_clientes_' . now()->format('Y-m-d-H');
$analisis = Cache::remember($cacheKey, 1800, function () {
    return $this->generarAnalisisComportamiento();
});
```

### Consultas Optimizadas

```php
// Consulta optimizada para tendencias mensuales
$tendencias = DB::table('recompensas_historial as rh')
    ->join('recompensas as r', 'rh.recompensa_id', '=', 'r.id')
    ->selectRaw('
        DATE_FORMAT(rh.fecha_aplicacion, "%Y-%m") as mes,
        r.tipo,
        COUNT(*) as aplicaciones,
        COUNT(DISTINCT rh.cliente_id) as clientes_unicos,
        SUM(rh.puntos_otorgados) as puntos_otorgados
    ')
    ->whereBetween('rh.fecha_aplicacion', [$inicio, $fin])
    ->groupBy('mes', 'r.tipo')
    ->orderBy('mes')
    ->get();
```

### Cálculo de Tendencias

```php
private function calcularCrecimiento($anterior, $actual): array
{
    if ($anterior == 0 && $actual == 0) {
        return ['porcentaje' => 0, 'direccion' => 'estable', 'diferencia' => 0];
    }

    if ($anterior == 0) {
        return ['porcentaje' => 100, 'direccion' => 'subida', 'diferencia' => $actual];
    }

    $porcentaje = (($actual - $anterior) / $anterior) * 100;
    $direccion = $porcentaje > 0 ? 'subida' : ($porcentaje < 0 ? 'bajada' : 'estable');

    return [
        'porcentaje' => round(abs($porcentaje), 2),
        'direccion' => $direccion,
        'diferencia' => $actual - $anterior
    ];
}
```

---

## 📊 Métricas y KPIs

### Métricas Principales
- **Aplicaciones por Mes:** Número total de aplicaciones de recompensas
- **Clientes Activos:** Número único de clientes que usaron recompensas
- **Puntos Otorgados:** Total de puntos entregados en el período
- **Tasa de Adopción:** % de clientes que han usado recompensas
- **ROI Estimado:** Retorno de inversión calculado

### Tendencias a Monitorear
- **Crecimiento Mensual:** Comparación mes a mes
- **Efectividad por Tipo:** Rendimiento de cada tipo de recompensa
- **Patrones Temporales:** Comportamiento por día/hora
- **Segmentación de Clientes:** Uso por segmento de cliente
- **Fidelización:** Tasa de retención y recompra

### Análisis de Comportamiento
- **Frecuencia de Uso:** Clasificación de clientes por frecuencia
- **Patrones Temporales:** Horarios y días de mayor actividad
- **Valor del Cliente:** Métricas de valor por aplicación
- **Retención:** Análisis de fidelización y recompra

---

## 🔐 Consideraciones de Seguridad

1. **Cache Seguro:** Los datos cacheados no contienen información sensible
2. **Límites de Consulta:** Límites en consultas para evitar sobrecarga
3. **Validación de Fechas:** Validación estricta de rangos de fechas
4. **Rate Limiting:** Límites en endpoints de analytics para evitar abuso
5. **Permisos Granulares:** Verificación de permisos en cada endpoint

---

## 📝 Notas de Implementación

- **Cache Inteligente:** Diferentes tiempos de cache según la criticidad de los datos
- **Consultas Optimizadas:** Uso de índices y consultas eficientes
- **Límites de Datos:** Límites en consultas para evitar timeouts
- **Formato Flexible:** Soporte para diferentes períodos (diario, mensual, anual)
- **Exportación:** Preparado para exportación de datos a Excel/PDF
- **Tiempo Real:** Posibilidad de actualización en tiempo real para métricas críticas

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Rango de Fechas Inválido:**
   ```json
   {
     "success": false,
     "message": "El rango de fechas especificado es inválido",
     "error": "La fecha de inicio debe ser anterior a la fecha de fin"
   }
   ```

2. **Período No Soportado:**
   ```json
   {
     "success": false,
     "message": "El período especificado no es válido",
     "error": "Los períodos válidos son: diario, mensual, anual"
   }
   ```

3. **Recompensa No Encontrada:**
   ```json
   {
     "success": false,
     "message": "La recompensa especificada no existe",
     "error": "Recompensa con ID 999 no encontrada"
   }
   ```

### Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Datos obtenidos exitosamente |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para analytics |
| 500 | Internal Server Error | Error en consultas o procesamiento |
