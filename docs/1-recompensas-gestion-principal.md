# 🎯 SUBMÓDULO: Gestión Principal de Recompensas

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas`  
**Prefijo API:** `/api/admin/recompensas`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.create`, `recompensas.edit`, `recompensas.delete`

Este submódulo permite la gestión completa del ciclo de vida de las recompensas, incluyendo su creación, configuración, activación y monitoreo.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas` - Listar Recompensas

**Descripción:** Obtiene una lista paginada de todas las recompensas con filtros avanzados.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "tipo": "puntos|descuento|envio_gratis|regalo",
  "activo": "true|false",
  "vigente": "true|false",
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "buscar": "string",
  "order_by": "created_at|nombre|fecha_inicio|fecha_fin",
  "order_direction": "asc|desc",
  "per_page": "15|25|50|100",
  "page": "1"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas?tipo=puntos&activo=true&vigente=true&per_page=25&page=1
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Recompensas obtenidas exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nombre": "Programa de Fidelidad Q1 2024",
        "descripcion": "Acumula puntos por cada compra y canjéalos por descuentos",
        "tipo": "puntos",
        "tipo_nombre": "Puntos",
        "fecha_inicio": "2024-01-01T00:00:00.000000Z",
        "fecha_fin": "2024-03-31T23:59:59.000000Z",
        "activo": true,
        "es_vigente": true,
        "total_aplicaciones": 1250,
        "creador": {
          "id": 1,
          "name": "Admin Sistema"
        },
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-15T14:30:00.000000Z",
        "tiene_clientes": true,
        "tiene_productos": true,
        "tiene_configuracion": true
      }
    ],
    "first_page_url": "http://localhost/api/admin/recompensas?page=1",
    "from": 1,
    "last_page": 3,
    "last_page_url": "http://localhost/api/admin/recompensas?page=3",
    "links": [...],
    "next_page_url": "http://localhost/api/admin/recompensas?page=2",
    "path": "http://localhost/api/admin/recompensas",
    "per_page": 25,
    "prev_page_url": null,
    "to": 25,
    "total": 67
  }
}
```

---

### 2. **POST** `/api/admin/recompensas` - Crear Recompensa

**Descripción:** Crea una nueva recompensa en el sistema.

**Permisos:** `recompensas.create`

**Body Request:**
```json
{
  "nombre": "string (required, max:255)",
  "descripcion": "string (optional)",
  "tipo": "puntos|descuento|envio_gratis|regalo (required)",
  "fecha_inicio": "YYYY-MM-DD (required)",
  "fecha_fin": "YYYY-MM-DD (required, > fecha_inicio)",
  "estado": "programada|activa|pausada|expirada|cancelada (optional, se aplica lógica automática)"
}
```

**🧠 Lógica de Estados Automática:**

El sistema aplica automáticamente la lógica de estados según la fecha de inicio:

- **Fecha HOY:** Estados disponibles: `activa`, `pausada` (por defecto: `activa`)
- **Fecha FUTURO:** Estados disponibles: `programada` (por defecto: `programada`)  
- **Fecha PASADO:** Estados disponibles: `expirada`, `cancelada` (por defecto: `expirada`)

Si no se especifica el estado, se aplica automáticamente el estado por defecto según la fecha.

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Black Friday 2024",
  "descripcion": "Descuentos especiales para Black Friday",
  "tipo": "descuento",
  "fecha_inicio": "2024-11-24",
  "fecha_fin": "2024-11-30",
  "activo": true
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Recompensa creada exitosamente",
  "data": {
    "recompensa": {
      "id": 15,
      "nombre": "Black Friday 2024",
      "descripcion": "Descuentos especiales para Black Friday",
      "tipo": "descuento",
      "fecha_inicio": "2024-11-24T00:00:00.000000Z",
      "fecha_fin": "2024-11-30T23:59:59.000000Z",
      "estado": "programada",
      "creado_por": 1,
      "created_at": "2024-01-15T16:45:00.000000Z",
      "updated_at": "2024-01-15T16:45:00.000000Z",
      "creador": {
        "id": 1,
        "name": "Admin Sistema"
      }
    },
    "estado_aplicado": "programada",
    "estado_nombre": "Programada",
    "logica_aplicada": {
      "fecha_inicio": "2024-11-24",
      "fecha_actual": "2024-01-15",
      "es_fecha_hoy": false,
      "es_fecha_futura": true,
      "es_fecha_pasada": false
    }
  }
}
```

**Ejemplo de Response (422 - Errores de Validación):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": {
    "nombre": ["El nombre es obligatorio"],
    "fecha_fin": ["La fecha de fin debe ser posterior a la fecha de inicio"]
  }
}
```

---

### 3. **GET** `/api/admin/recompensas/{id}` - Ver Detalle

**Descripción:** Obtiene el detalle completo de una recompensa específica, incluyendo configuraciones y historial.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Detalle de recompensa obtenido exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024",
      "descripcion": "Acumula puntos por cada compra y canjéalos por descuentos",
      "tipo": "puntos",
      "tipo_nombre": "Puntos",
      "fecha_inicio": "2024-01-01T00:00:00.000000Z",
      "fecha_fin": "2024-03-31T23:59:59.000000Z",
      "activo": true,
      "es_vigente": true,
      "total_aplicaciones": 1250,
      "creador": {
        "id": 1,
        "name": "Admin Sistema"
      },
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-15T14:30:00.000000Z"
    },
    "configuracion": {
      "clientes": [
        {
          "id": 1,
          "segmento": "vip",
          "segmento_nombre": "Clientes VIP",
          "cliente": null,
          "es_cliente_especifico": false
        }
      ],
      "productos": [
        {
          "id": 1,
          "tipo_elemento": "categoria",
          "nombre_elemento": "Electrónicos",
          "producto": null,
          "categoria": {
            "id": 5,
            "nombre": "Electrónicos"
          }
        }
      ],
      "puntos": [
        {
          "id": 1,
          "tipo_calculo": "porcentaje",
          "valor": 5.0,
          "minimo_compra": 100.0,
          "maximo_puntos": 1000,
          "multiplicador_nivel": 1.5
        }
      ],
      "descuentos": [],
      "envios": [],
      "regalos": []
    },
    "historial_reciente": [
      {
        "id": 1250,
        "cliente": "Juan Pérez",
        "puntos_otorgados": 50,
        "beneficio_aplicado": "5% de descuento",
        "fecha_aplicacion": "2024-01-15T14:30:00.000000Z",
        "tiempo_transcurrido": "2 horas"
      }
    ]
  }
}
```

---

### 4. **PUT** `/api/admin/recompensas/{id}` - Actualizar

**Descripción:** Actualiza una recompensa existente.

**Permisos:** `recompensas.edit`

**Body Request:**
```json
{
  "nombre": "string (optional, max:255)",
  "descripcion": "string (optional)",
  "tipo": "puntos|descuento|envio_gratis|regalo (optional)",
  "fecha_inicio": "YYYY-MM-DD (optional)",
  "fecha_fin": "YYYY-MM-DD (optional, > fecha_inicio)",
  "activo": "boolean (optional)"
}
```

**Ejemplo de Request:**
```bash
PUT /api/admin/recompensas/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Programa de Fidelidad Q1 2024 - Actualizado",
  "descripcion": "Programa mejorado con nuevos beneficios",
  "fecha_fin": "2024-04-30"
}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Recompensa actualizada exitosamente",
  "data": {
    "id": 1,
    "nombre": "Programa de Fidelidad Q1 2024 - Actualizado",
    "descripcion": "Programa mejorado con nuevos beneficios",
    "tipo": "puntos",
    "fecha_inicio": "2024-01-01T00:00:00.000000Z",
    "fecha_fin": "2024-04-30T23:59:59.000000Z",
    "activo": true,
    "creado_por": 1,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-15T16:50:00.000000Z",
    "creador": {
      "id": 1,
      "name": "Admin Sistema"
    }
  }
}
```

---

### 5. **DELETE** `/api/admin/recompensas/{id}` - Eliminar

**Descripción:** Desactiva una recompensa (soft delete).

**Permisos:** `recompensas.delete`

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/1
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Recompensa desactivada exitosamente"
}
```

---

### 6. **PATCH** `/api/admin/recompensas/{id}/activate` - Activar

**Descripción:** Activa una recompensa específica.

**Permisos:** `recompensas.edit`

**Ejemplo de Request:**
```bash
PATCH /api/admin/recompensas/1/activate
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Recompensa activada exitosamente",
  "data": {
    "id": 1,
    "nombre": "Programa de Fidelidad Q1 2024",
    "activo": true,
    "updated_at": "2024-01-15T17:00:00.000000Z"
  }
}
```

---

### 7. **GET** `/api/admin/recompensas/estadisticas` - Estadísticas

**Descripción:** Obtiene estadísticas completas del sistema de recompensas.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/estadisticas
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "resumen": {
      "total_recompensas": 67,
      "recompensas_activas": 45,
      "recompensas_vigentes": 38,
      "tasa_activacion": 67.16
    },
    "por_tipo": {
      "puntos": {
        "total": 25,
        "activas": 18
      },
      "descuento": {
        "total": 20,
        "activas": 15
      },
      "envio_gratis": {
        "total": 12,
        "activas": 8
      },
      "regalo": {
        "total": 10,
        "activas": 4
      }
    },
    "mes_actual": {
      "aplicaciones": 1250,
      "puntos_otorgados": 62500,
      "clientes_beneficiados": 890,
      "promedio_puntos_por_aplicacion": 50.0
    },
    "comparativa_mes_anterior": {
      "aplicaciones": {
        "actual": 1250,
        "anterior": 980,
        "tendencia": {
          "porcentaje": 27.55,
          "direccion": "subida",
          "diferencia": 270
        }
      },
      "puntos_otorgados": {
        "actual": 62500,
        "anterior": 49000,
        "tendencia": {
          "porcentaje": 27.55,
          "direccion": "subida",
          "diferencia": 13500
        }
      },
      "clientes_beneficiados": {
        "actual": 890,
        "anterior": 720,
        "tendencia": {
          "porcentaje": 23.61,
          "direccion": "subida",
          "diferencia": 170
        }
      }
    },
    "top_recompensas_mes": [
      {
        "id": 1,
        "nombre": "Programa de Fidelidad Q1 2024",
        "tipo": "puntos",
        "total_aplicaciones": 450,
        "clientes_unicos": 320
      },
      {
        "id": 5,
        "nombre": "Black Friday 2024",
        "tipo": "descuento",
        "total_aplicaciones": 380,
        "clientes_unicos": 280
      }
    ],
    "metadata": {
      "generado_en": "2024-01-15T17:30:00.000000Z",
      "periodo_analisis": {
        "mes_actual": "2024-01",
        "mes_anterior": "2023-12"
      },
      "cache_valido_hasta": "2024-01-15T19:30:00.000000Z"
    }
  }
}
```

---

### 8. **GET** `/api/admin/recompensas/tipos` - Tipos Disponibles

**Descripción:** Obtiene la lista de tipos de recompensas disponibles en el sistema.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/tipos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Tipos de recompensas obtenidos exitosamente",
  "data": [
    {
      "value": "puntos",
      "label": "Sistema de Puntos"
    },
    {
      "value": "descuento",
      "label": "Descuentos"
    },
    {
      "value": "envio_gratis",
      "label": "Envío Gratuito"
    },
    {
      "value": "regalo",
      "label": "Productos de Regalo"
    }
  ]
}
```

---

### 9. **GET** `/api/admin/recompensas/estados-disponibles` - Estados Disponibles

**Descripción:** Obtiene los estados disponibles para una recompensa según su fecha de inicio, aplicando la lógica de negocio automática.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "fecha_inicio": "YYYY-MM-DD"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/estados-disponibles?fecha_inicio=2024-12-19
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Estados disponibles obtenidos exitosamente",
  "data": {
    "estados_disponibles": [
      {
        "value": "activa",
        "label": "Activa", 
        "description": "La recompensa estará activa inmediatamente"
      },
      {
        "value": "pausada",
        "label": "Pausada",
        "description": "La recompensa estará pausada y requerirá activación manual"
      }
    ],
    "estado_por_defecto": "activa",
    "mensaje": "Para fechas de hoy, la recompensa puede estar activa o pausada",
    "fecha_inicio": "2024-12-19",
    "fecha_actual": "2024-12-19",
    "es_fecha_pasada": false,
    "es_fecha_hoy": true,
    "es_fecha_futura": false
  }
}
```

**Lógica de Estados por Fecha:**

**📅 Fecha de Inicio = HOY:**
- Estados disponibles: `activa`, `pausada`
- Estado por defecto: `activa`
- Mensaje: "Para fechas de hoy, la recompensa puede estar activa o pausada"

**📅 Fecha de Inicio = FUTURO:**
- Estados disponibles: `programada`
- Estado por defecto: `programada`
- Mensaje: "Para fechas futuras, la recompensa debe estar programada"

**📅 Fecha de Inicio = PASADO:**
- Estados disponibles: `expirada`, `cancelada`
- Estado por defecto: `expirada`
- Mensaje: "Para fechas pasadas, la recompensa debe estar expirada o cancelada"

---

## 🎨 Componentes del Frontend

### 1. **Lista de Recompensas con Filtros**

```typescript
interface RecompensaListaProps {
  recompensas: Recompensa[];
  filtros: FiltrosRecompensas;
  paginacion: Paginacion;
  onFiltroChange: (filtros: FiltrosRecompensas) => void;
  onRecompensaSelect: (recompensa: Recompensa) => void;
}

interface FiltrosRecompensas {
  tipo?: string;
  activo?: boolean;
  vigente?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  per_page?: number;
}
```

**Características:**
- Filtros por tipo, estado, vigencia y fechas
- Búsqueda por nombre
- Ordenamiento por diferentes campos
- Paginación configurable
- Indicadores visuales de estado (activo, vigente, configurado)

### 2. **Formulario de Creación/Edición**

```typescript
interface FormularioRecompensaProps {
  recompensa?: Recompensa;
  tipos: TipoRecompensa[];
  onSubmit: (data: RecompensaFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface RecompensaFormData {
  nombre: string;
  descripcion?: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}
```

**Características:**
- Validación en tiempo real
- Selector de tipos con descripciones
- Calendario para fechas con validaciones
- Toggle para activación
- Preview de la recompensa

### 3. **Modal de Confirmación de Eliminación**

```typescript
interface ModalEliminacionProps {
  recompensa: Recompensa;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

**Características:**
- Información detallada de la recompensa
- Advertencias sobre impactos
- Confirmación con doble verificación
- Estado de carga durante la operación

### 4. **Dashboard con Métricas Principales**

```typescript
interface DashboardRecompensasProps {
  estadisticas: EstadisticasRecompensas;
  topRecompensas: Recompensa[];
  tendencias: TendenciasRecompensas;
}

interface EstadisticasRecompensas {
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
}
```

**Características:**
- Tarjetas con métricas principales
- Gráficos de tendencias
- Comparativas mes anterior
- Top recompensas más utilizadas
- Indicadores de rendimiento

---

## 🔧 Implementación Técnica

### Estructura de Base de Datos

```sql
-- Tabla principal de recompensas
CREATE TABLE recompensas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    tipo ENUM('puntos', 'descuento', 'envio_gratis', 'regalo') NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_por BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_tipo (tipo),
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    INDEX idx_activo (activo),
    FOREIGN KEY (creado_por) REFERENCES users(id)
);
```

### Modelo Eloquent

```php
class Recompensa extends Model
{
    protected $fillable = [
        'nombre', 'descripcion', 'tipo', 
        'fecha_inicio', 'fecha_fin', 'activo', 'creado_por'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'activo' => 'boolean'
    ];

    // Constantes para tipos y estados
    const TIPO_PUNTOS = 'puntos';
    const TIPO_DESCUENTO = 'descuento';
    const TIPO_ENVIO_GRATIS = 'envio_gratis';
    const TIPO_REGALO = 'regalo';

    // Relaciones
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(RecompensaCliente::class);
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    public function scopeVigentes($query)
    {
        $now = now();
        return $query->where('fecha_inicio', '<=', $now)
                    ->where('fecha_fin', '>=', $now);
    }
}
```

### Middleware de Permisos

```php
// En routes/api.php
Route::prefix('admin/recompensas')
    ->middleware('permission:recompensas.ver')
    ->group(function () {
        Route::get('/', [RecompensaController::class, 'index']);
        Route::get('/estadisticas', [RecompensaController::class, 'estadisticas']);
        Route::get('/tipos', [RecompensaController::class, 'tipos']);
        Route::get('/{id}', [RecompensaController::class, 'show']);
        
        Route::middleware('permission:recompensas.create')->group(function () {
            Route::post('/', [RecompensaController::class, 'store']);
        });
        
        Route::middleware('permission:recompensas.edit')->group(function () {
            Route::put('/{id}', [RecompensaController::class, 'update']);
            Route::patch('/{id}/activate', [RecompensaController::class, 'activate']);
        });
        
        Route::middleware('permission:recompensas.delete')->group(function () {
            Route::delete('/{id}', [RecompensaController::class, 'destroy']);
        });
    });
```

---

## 📊 Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, PATCH) |
| 201 | Created | Recompensa creada exitosamente |
| 400 | Bad Request | Datos malformados |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Recompensa no encontrada |
| 422 | Unprocessable Entity | Errores de validación |
| 500 | Internal Server Error | Error interno del servidor |

---

## 🚨 Manejo de Errores

### Estructura de Error Estándar

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalle técnico del error",
  "errors": {
    "campo": ["Mensaje de validación específico"]
  }
}
```

### Errores Comunes

1. **Validación de Fechas:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "fecha_inicio": ["La fecha de inicio debe ser hoy o posterior"],
       "fecha_fin": ["La fecha de fin debe ser posterior a la fecha de inicio"]
     }
   }
   ```

2. **Tipo Inválido:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "tipo": ["El tipo de recompensa no es válido"]
     }
   }
   ```

3. **Estado No Válido para Fecha de Hoy:**
   ```json
   {
     "success": false,
     "message": "Para fechas de hoy, el estado debe ser \"activa\" o \"pausada\"",
     "errors": {
       "estado": ["Estado no válido para fecha de hoy"]
     }
   }
   ```

4. **Estado No Válido para Fecha Futura:**
   ```json
   {
     "success": false,
     "message": "Para fechas futuras, el estado debe ser \"programada\"",
     "errors": {
       "estado": ["Estado no válido para fecha futura"]
     }
   }
   ```

5. **Estado No Válido para Fecha Pasada:**
   ```json
   {
     "success": false,
     "message": "Para fechas pasadas, el estado debe ser \"expirada\" o \"cancelada\"",
     "errors": {
       "estado": ["Estado no válido para fecha pasada"]
     }
   }
   ```

3. **Sin Permisos:**
   ```json
   {
     "success": false,
     "message": "No tienes permisos para realizar esta acción"
   }
   ```

---

## 🔄 Flujo de Trabajo Recomendado

1. **Crear Recompensa:**
   - Validar datos del formulario
   - Crear recompensa con estado inactivo
   - Configurar segmentos de clientes
   - Configurar productos/categorías aplicables
   - Configurar submódulo específico (puntos, descuentos, etc.)
   - Activar recompensa

2. **Monitorear Recompensa:**
   - Revisar estadísticas periódicamente
   - Analizar historial de aplicaciones
   - Ajustar configuraciones si es necesario

3. **Finalizar Recompensa:**
   - Desactivar antes de la fecha de fin
   - Generar reportes finales
   - Archivar datos históricos

---

## 📈 Métricas y KPIs

### Métricas Principales
- **Tasa de Activación:** % de recompensas activas vs total
- **Aplicaciones por Mes:** Número de veces que se aplicó la recompensa
- **Clientes Beneficiados:** Número único de clientes que recibieron beneficios
- **Puntos Otorgados:** Total de puntos entregados en el período
- **ROI de Recompensas:** Retorno de inversión calculado

### Tendencias a Monitorear
- Crecimiento mensual de aplicaciones
- Efectividad por tipo de recompensa
- Comportamiento de clientes por segmento
- Estacionalidad en el uso de recompensas

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Entrada:** Todos los datos son validados tanto en frontend como backend
2. **Autorización:** Verificación de permisos en cada endpoint
3. **Auditoría:** Registro de todas las operaciones críticas
4. **Rate Limiting:** Límites en endpoints de estadísticas para evitar abuso
5. **Sanitización:** Limpieza de datos de entrada para prevenir inyecciones

---

## 📝 Notas de Implementación

- Las recompensas utilizan soft delete (desactivación) en lugar de eliminación física
- Las estadísticas se cachean por 2 horas para optimizar rendimiento
- Los filtros en la lista son acumulativos (se pueden combinar múltiples filtros)
- El sistema valida automáticamente la vigencia de las recompensas
- Se mantiene historial completo de todas las aplicaciones de recompensas
