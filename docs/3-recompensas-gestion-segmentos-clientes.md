# 👥 SUBMÓDULO: Gestión de Segmentos y Clientes

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/segmentos`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/segmentos`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la gestión de segmentación de clientes para recompensas específicas, incluyendo la asignación de segmentos generales, clientes específicos, validación de elegibilidad y análisis de efectividad.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/segmentos` - Listar Segmentos Asignados

**Descripción:** Obtiene todos los segmentos y clientes específicos asignados a una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/segmentos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Segmentos obtenidos exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024"
    },
    "segmentos": [
      {
        "id": 1,
        "segmento": "vip",
        "segmento_nombre": "Clientes VIP",
        "cliente_id": null,
        "cliente": null,
        "es_cliente_especifico": false
      },
      {
        "id": 2,
        "segmento": "nuevos",
        "segmento_nombre": "Clientes Nuevos",
        "cliente_id": null,
        "cliente": null,
        "es_cliente_especifico": false
      },
      {
        "id": 3,
        "segmento": "todos",
        "segmento_nombre": "Todos los Clientes",
        "cliente_id": 15,
        "cliente": {
          "id": 15,
          "nombre_completo": "Juan Pérez García",
          "email": "juan.perez@email.com"
        },
        "es_cliente_especifico": true
      }
    ]
  }
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/segmentos` - Asignar Segmento/Cliente

**Descripción:** Asigna un segmento general o un cliente específico a una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "segmento": "todos|nuevos|regulares|vip|rango_fechas (required)",
  "cliente_id": "integer (optional - para cliente específico)"
}
```

**Ejemplo de Request (Segmento General):**
```bash
POST /api/admin/recompensas/1/segmentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "segmento": "vip"
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Segmento asignado exitosamente",
  "data": {
    "id": 4,
    "segmento": "vip",
    "segmento_nombre": "Clientes VIP",
    "cliente_id": null,
    "cliente": null,
    "es_cliente_especifico": false
  }
}
```

**Ejemplo de Request (Cliente Específico):**
```bash
POST /api/admin/recompensas/1/segmentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "segmento": "todos",
  "cliente_id": 25
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Segmento asignado exitosamente",
  "data": {
    "id": 5,
    "segmento": "todos",
    "segmento_nombre": "Todos los Clientes",
    "cliente_id": 25,
    "cliente": {
      "id": 25,
      "nombre_completo": "María González López",
      "email": "maria.gonzalez@email.com"
    },
    "es_cliente_especifico": true
  }
}
```

**Ejemplo de Response (422 - Configuración Duplicada):**
```json
{
  "success": false,
  "message": "Esta configuración de segmento ya existe para la recompensa"
}
```

---

### 3. **DELETE** `/api/admin/recompensas/{recompensaId}/segmentos/{segmentoId}` - Eliminar Segmento

**Descripción:** Elimina un segmento o cliente específico asignado a una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `segmentoId` (integer, required): ID del segmento a eliminar

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/1/segmentos/3
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Segmento eliminado exitosamente"
}
```

---

### 4. **GET** `/api/admin/recompensas/{recompensaId}/segmentos/disponibles` - Segmentos Disponibles

**Descripción:** Obtiene la lista de segmentos disponibles para asignar a recompensas.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/segmentos/disponibles
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Segmentos disponibles obtenidos exitosamente",
  "data": [
    {
      "value": "todos",
      "label": "Todos los clientes",
      "descripcion": "Todos los clientes activos del sistema"
    },
    {
      "value": "nuevos",
      "label": "Clientes nuevos (últimos 30 días)",
      "descripcion": "Clientes registrados en los últimos 30 días"
    },
    {
      "value": "regulares",
      "label": "Clientes recurrentes (más de 1 compra)",
      "descripcion": "Clientes con 30-365 días de antigüedad"
    },
    {
      "value": "vip",
      "label": "Clientes VIP (compras > S/ 1000)",
      "descripcion": "Clientes con más de 365 días, +5 pedidos, +$1000 gastado y compra reciente"
    },
    {
      "value": "rango_fechas",
      "label": "Rango de fechas específico",
      "descripcion": "Clientes registrados en un rango de fechas específico"
    }
  ]
}
```

---

### 5. **GET** `/api/admin/recompensas/clientes/buscar` - Buscar Clientes

**Descripción:** Busca clientes para asignación específica a recompensas.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "buscar": "string (required, min:2)",
  "limite": "integer (optional, min:1, max:50, default:20)"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/clientes/buscar?buscar=Juan&limite=10
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Clientes encontrados exitosamente",
  "data": [
    {
      "id": 15,
      "nombre_completo": "Juan Pérez García",
      "email": "juan.perez@email.com",
      "numero_documento": "12345678",
      "segmento_actual": "vip"
    },
    {
      "id": 25,
      "nombre_completo": "Juan Carlos López",
      "email": "juan.lopez@email.com",
      "numero_documento": "87654321",
      "segmento_actual": "regulares"
    }
  ]
}
```

---

### 6. **GET** `/api/admin/recompensas/{recompensaId}/segmentos/estadisticas` - Estadísticas de Segmentación

**Descripción:** Obtiene estadísticas detalladas de la segmentación de una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/segmentos/estadisticas
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Estadísticas de segmentación obtenidas exitosamente",
  "data": {
    "total_segmentos_configurados": 3,
    "clientes_especificos": 1,
    "segmentos_generales": 2,
    "por_segmento": [
      {
        "segmento": "vip",
        "cantidad": 1,
        "clientes_especificos": 0
      },
      {
        "segmento": "nuevos",
        "cantidad": 1,
        "clientes_especificos": 0
      },
      {
        "segmento": "todos",
        "cantidad": 1,
        "clientes_especificos": 1
      }
    ],
    "clientes_potenciales": {
      "todos": 1300,
      "nuevos": 150,
      "regulares": 800,
      "vip": 200,
      "inactivos": 150,
      "distribuciones": {
        "nuevos_porcentaje": 11.54,
        "regulares_porcentaje": 61.54,
        "vip_porcentaje": 15.38,
        "inactivos_porcentaje": 11.54
      }
    },
    "distribucion_por_segmento": [
      {
        "segmento": "todos",
        "segmento_nombre": "Todos los Clientes",
        "recompensas_asignadas": 15,
        "descripcion": "Todos los clientes activos del sistema"
      },
      {
        "segmento": "nuevos",
        "segmento_nombre": "Clientes Nuevos",
        "recompensas_asignadas": 8,
        "descripcion": "Clientes registrados en los últimos 30 días"
      },
      {
        "segmento": "regulares",
        "segmento_nombre": "Clientes Regulares",
        "recompensas_asignadas": 12,
        "descripcion": "Clientes con 30-365 días de antigüedad"
      },
      {
        "segmento": "vip",
        "segmento_nombre": "Clientes VIP",
        "recompensas_asignadas": 5,
        "descripcion": "Clientes con más de 365 días, +5 pedidos, +$1000 gastado y compra reciente"
      }
    ],
    "efectividad_segmentos": [
      {
        "segmento": "vip",
        "segmento_nombre": "Clientes VIP",
        "cliente_especifico": null,
        "metricas": {
          "aplicaciones_totales": 450,
          "clientes_unicos": 180,
          "puntos_otorgados": 22500,
          "promedio_aplicaciones_por_cliente": 2.5,
          "promedio_puntos_por_aplicacion": 50.0
        }
      },
      {
        "segmento": "nuevos",
        "segmento_nombre": "Clientes Nuevos",
        "cliente_especifico": null,
        "metricas": {
          "aplicaciones_totales": 300,
          "clientes_unicos": 120,
          "puntos_otorgados": 15000,
          "promedio_aplicaciones_por_cliente": 2.5,
          "promedio_puntos_por_aplicacion": 50.0
        }
      },
      {
        "segmento": "todos",
        "segmento_nombre": "Cliente Específico",
        "cliente_especifico": {
          "id": 15,
          "nombre": "Juan Pérez García"
        },
        "metricas": {
          "aplicaciones_totales": 25,
          "clientes_unicos": 1,
          "puntos_otorgados": 1250,
          "promedio_aplicaciones_por_cliente": 25.0,
          "promedio_puntos_por_aplicacion": 50.0
        }
      }
    ]
  }
}
```

---

### 7. **POST** `/api/admin/recompensas/{recompensaId}/segmentos/validar-cliente` - Validar Cliente

**Descripción:** Valida si un cliente específico cumple con los segmentos configurados de una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "cliente_id": "integer (required)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/1/segmentos/validar-cliente
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_id": 25
}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "cliente": {
      "id": 25,
      "nombre_completo": "María González López",
      "segmento_actual": "regulares"
    },
    "cumple_recompensa": true,
    "segmentos_cumplidos": [
      {
        "segmento": "regulares",
        "segmento_nombre": "Clientes Regulares"
      },
      {
        "segmento": "todos",
        "segmento_nombre": "Todos los Clientes"
      }
    ],
    "total_segmentos_configurados": 3
  }
}
```

**Ejemplo de Response (Cliente No Elegible):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "cliente": {
      "id": 30,
      "nombre_completo": "Carlos Ruiz Martínez",
      "segmento_actual": "nuevos"
    },
    "cumple_recompensa": false,
    "segmentos_cumplidos": [],
    "total_segmentos_configurados": 3
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Lista de Segmentos Asignados**

```typescript
interface SegmentosListaProps {
  recompensa: Recompensa;
  segmentos: SegmentoAsignado[];
  onAgregarSegmento: () => void;
  onEliminarSegmento: (segmentoId: number) => void;
  onValidarCliente: (clienteId: number) => void;
}

interface SegmentoAsignado {
  id: number;
  segmento: string;
  segmento_nombre: string;
  cliente_id?: number;
  cliente?: ClienteInfo;
  es_cliente_especifico: boolean;
}

interface ClienteInfo {
  id: number;
  nombre_completo: string;
  email: string;
}
```

**Características:**
- Lista de segmentos y clientes específicos asignados
- Indicadores visuales para segmentos generales vs específicos
- Botones de acción para eliminar y validar
- Información detallada de cada asignación

### 2. **Formulario de Asignación de Segmentos**

```typescript
interface FormularioSegmentoProps {
  recompensaId: number;
  segmentosDisponibles: SegmentoDisponible[];
  onSegmentoAsignado: (segmento: SegmentoAsignado) => void;
  onCancelar: () => void;
}

interface SegmentoDisponible {
  value: string;
  label: string;
  descripcion: string;
}

interface FormularioSegmentoData {
  segmento: string;
  cliente_id?: number;
}
```

**Características:**
- Selector de segmento con descripciones
- Campo opcional para cliente específico
- Validación en tiempo real
- Búsqueda de clientes integrada
- Preview de la configuración

### 3. **Buscador de Clientes**

```typescript
interface BuscadorClientesProps {
  onClienteSeleccionado: (cliente: ClienteInfo) => void;
  onBuscar: (termino: string) => void;
  clientes: ClienteInfo[];
  isLoading: boolean;
}

interface ClienteInfo {
  id: number;
  nombre_completo: string;
  email: string;
  numero_documento: string;
  segmento_actual: string;
}
```

**Características:**
- Búsqueda en tiempo real por nombre, email o documento
- Lista de resultados con información del cliente
- Indicador del segmento actual del cliente
- Selección con un click
- Límite configurable de resultados

### 4. **Dashboard de Estadísticas de Segmentación**

```typescript
interface EstadisticasSegmentacionProps {
  estadisticas: EstadisticasSegmentacion;
  recompensaId: number;
}

interface EstadisticasSegmentacion {
  total_segmentos_configurados: number;
  clientes_especificos: number;
  segmentos_generales: number;
  por_segmento: SegmentoEstadistica[];
  clientes_potenciales: ClientesPotenciales;
  distribucion_por_segmento: DistribucionSegmento[];
  efectividad_segmentos: EfectividadSegmento[];
}

interface ClientesPotenciales {
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
}
```

**Características:**
- Tarjetas con métricas principales
- Gráfico de distribución de clientes potenciales
- Tabla de efectividad por segmento
- Gráficos de barras para comparativas
- Exportación de reportes

### 5. **Validador de Clientes**

```typescript
interface ValidadorClienteProps {
  recompensaId: number;
  onClienteValidado: (resultado: ValidacionCliente) => void;
}

interface ValidacionCliente {
  cliente: ClienteInfo;
  cumple_recompensa: boolean;
  segmentos_cumplidos: SegmentoCumplido[];
  total_segmentos_configurados: number;
}

interface SegmentoCumplido {
  segmento: string;
  segmento_nombre: string;
}
```

**Características:**
- Búsqueda de cliente por ID o datos
- Resultado visual de elegibilidad
- Lista de segmentos cumplidos
- Indicadores de estado (elegible/no elegible)
- Información detallada del cliente

---

## 🔧 Implementación Técnica

### Modelo de Segmentación

```php
class RecompensaCliente extends Model
{
    protected $fillable = [
        'recompensa_id', 'segmento', 'cliente_id'
    ];

    // Constantes para segmentos
    const SEGMENTO_TODOS = 'todos';
    const SEGMENTO_NUEVOS = 'nuevos';
    const SEGMENTO_REGULARES = 'regulares';
    const SEGMENTO_VIP = 'vip';
    const SEGMENTO_RANGO_FECHAS = 'rango_fechas';

    public static function getSegmentos(): array
    {
        return [
            self::SEGMENTO_TODOS,
            self::SEGMENTO_NUEVOS,
            self::SEGMENTO_REGULARES,
            self::SEGMENTO_VIP,
            self::SEGMENTO_RANGO_FECHAS
        ];
    }

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(UserCliente::class);
    }

    // Accessors
    public function getEsClienteEspecificoAttribute(): bool
    {
        return !is_null($this->cliente_id);
    }

    public function getSegmentoNombreAttribute(): string
    {
        $nombres = [
            self::SEGMENTO_TODOS => 'Todos los Clientes',
            self::SEGMENTO_NUEVOS => 'Clientes Nuevos',
            self::SEGMENTO_REGULARES => 'Clientes Regulares',
            self::SEGMENTO_VIP => 'Clientes VIP'
        ];

        return $nombres[$this->segmento] ?? $this->segmento;
    }

    // Métodos de validación
    public function clienteCumpleSegmento(UserCliente $cliente): bool
    {
        if ($this->es_cliente_especifico) {
            return $this->cliente_id === $cliente->id;
        }

        return match($this->segmento) {
            self::SEGMENTO_TODOS => true,
            self::SEGMENTO_NUEVOS => $cliente->created_at->gte(now()->subDays(30)),
            self::SEGMENTO_REGULARES => $cliente->created_at->lt(now()->subDays(30)) && 
                                       $cliente->created_at->gte(now()->subDays(365)),
            self::SEGMENTO_VIP => $this->esClienteVIP($cliente),
            default => false
        };
    }

    private function esClienteVIP(UserCliente $cliente): bool
    {
        $diasRegistrado = now()->diffInDays($cliente->created_at);
        
        if ($diasRegistrado < 365) {
            return false;
        }

        $pedidos = $cliente->pedidos();
        $totalPedidos = $pedidos->count();
        $totalGastado = $pedidos->sum('total');
        $ultimaCompra = $pedidos->latest()->first()?->created_at;

        return $totalPedidos > 5 && 
               $totalGastado > 1000 && 
               $ultimaCompra && 
               now()->diffInDays($ultimaCompra) < 90;
    }
}
```

### Lógica de Segmentación

```php
// En el controlador
private function aplicarFiltroSegmento($query, $segmento)
{
    switch ($segmento) {
        case 'nuevos':
            return $query->where('uc.created_at', '>=', now()->subDays(30));
        case 'regulares':
            return $query->where('uc.created_at', '<', now()->subDays(30))
                       ->where('uc.created_at', '>=', now()->subDays(365));
        case 'vip':
            return $query->where('uc.created_at', '<', now()->subDays(365))
                       ->whereExists(function($subquery) {
                           $subquery->select(DB::raw(1))
                                   ->from('pedidos')
                                   ->whereColumn('pedidos.cliente_id', 'uc.id')
                                   ->havingRaw('COUNT(*) > 5 AND SUM(total) > 1000');
                       });
        case 'todos':
        default:
            return $query; // Sin filtro adicional
    }
}
```

### Cálculo de Clientes Potenciales

```php
private function calcularClientesPotenciales(): array
{
    $clientesStats = DB::table('user_clientes as uc')
        ->leftJoin('pedidos as p', 'uc.id', '=', 'p.cliente_id')
        ->select([
            'uc.id',
            'uc.created_at',
            'uc.estado',
            DB::raw('COUNT(p.id) as total_pedidos'),
            DB::raw('COALESCE(SUM(p.total), 0) as total_gastado'),
            DB::raw('MAX(p.created_at) as ultima_compra')
        ])
        ->where('uc.estado', true)
        ->groupBy('uc.id', 'uc.created_at', 'uc.estado')
        ->get();

    $totales = [
        'todos' => $clientesStats->count(),
        'nuevos' => 0,
        'regulares' => 0,
        'vip' => 0,
        'inactivos' => 0
    ];

    foreach ($clientesStats as $cliente) {
        $diasRegistrado = now()->diffInDays($cliente->created_at);
        $ultimaCompra = $cliente->ultima_compra ? now()->diffInDays($cliente->ultima_compra) : null;
        
        // Lógica de clasificación...
    }

    return $totales;
}
```

---

## 📊 Métricas y KPIs

### Métricas de Segmentación
- **Total de Segmentos Configurados:** Número de segmentos asignados a la recompensa
- **Clientes Específicos:** Número de clientes individuales asignados
- **Segmentos Generales:** Número de segmentos de tipo general
- **Distribución por Segmento:** Cantidad de recompensas que usan cada segmento

### Métricas de Efectividad
- **Aplicaciones por Segmento:** Número de veces que se aplicó la recompensa por segmento
- **Clientes Únicos por Segmento:** Número único de clientes que usaron la recompensa
- **Puntos Otorgados por Segmento:** Total de puntos entregados por segmento
- **Promedio de Aplicaciones por Cliente:** Efectividad de engagement por segmento

### Métricas de Clientes Potenciales
- **Distribución de Clientes:** Porcentaje de clientes en cada segmento
- **Clientes Activos vs Inactivos:** Análisis de participación
- **Tendencias de Segmentación:** Evolución de los segmentos en el tiempo

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Segmentos:** Verificación de que los segmentos sean válidos
2. **Prevención de Duplicados:** Validación para evitar configuraciones duplicadas
3. **Límites de Búsqueda:** Límites en búsquedas de clientes para evitar sobrecarga
4. **Permisos Granulares:** Verificación de permisos en cada operación
5. **Auditoría:** Registro de cambios en segmentación

---

## 📝 Notas de Implementación

- **Segmentos Dinámicos:** Los segmentos se calculan en tiempo real basándose en datos actuales
- **Validación Automática:** El sistema valida automáticamente si un cliente cumple con los segmentos
- **Flexibilidad:** Soporte para segmentos generales y clientes específicos
- **Optimización:** Consultas optimizadas para cálculos de segmentación
- **Escalabilidad:** Diseño preparado para manejar grandes volúmenes de clientes

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No Encontrada:**
   ```json
   {
     "success": false,
     "message": "Recompensa no encontrada"
   }
   ```

2. **Segmento Inválido:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "segmento": ["El segmento seleccionado no es válido"]
     }
   }
   ```

3. **Configuración Duplicada:**
   ```json
   {
     "success": false,
     "message": "Esta configuración de segmento ya existe para la recompensa"
   }
   ```

4. **Cliente No Encontrado:**
   ```json
   {
     "success": false,
     "message": "El cliente seleccionado no existe"
   }
   ```

### Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, DELETE) |
| 201 | Created | Segmento asignado exitosamente |
| 400 | Bad Request | Parámetros malformados |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Recompensa o segmento no encontrado |
| 422 | Unprocessable Entity | Errores de validación o configuración duplicada |
| 500 | Internal Server Error | Error interno del servidor |

