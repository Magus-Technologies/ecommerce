# 🎯 SUBMÓDULO: Configuración de Regalos

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/regalos`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/regalos`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la configuración detallada del sistema de regalos para recompensas de tipo "regalo", incluyendo la asignación de productos específicos, cantidades, verificación de stock, simulación de otorgamiento y estadísticas de disponibilidad.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/regalos` - Ver Configuración

**Descripción:** Obtiene la configuración actual de regalos para una recompensa específica.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/4/regalos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Configuración de regalos obtenida exitosamente",
  "data": {
    "recompensa": {
      "id": 4,
      "nombre": "Regalos Navideños 2024",
      "tipo": "regalo"
    },
    "configuraciones": [
      {
        "id": 1,
        "producto_id": 15,
        "cantidad": 2,
        "es_regalo_multiple": true,
        "valor_total_regalo": 50.0,
        "tiene_stock_suficiente": true,
        "stock_disponible": 100,
        "puede_ser_otorgado": true,
        "descripcion": "2 unidades de Mouse Inalámbrico como regalo",
        "producto": {
          "id": 15,
          "nombre": "Mouse Inalámbrico",
          "codigo_producto": "MOU-001",
          "precio_venta": 25.0,
          "stock": 100,
          "activo": true
        },
        "resumen": {
          "producto": "Mouse Inalámbrico",
          "cantidad_regalo": 2,
          "valor_regalo": "S/ 50",
          "stock_disponible": 100,
          "regalos_posibles": 50
        }
      }
    ]
  }
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/regalos` - Crear Configuración

**Descripción:** Crea una nueva configuración de regalo para una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "producto_id": "integer (required, exists:productos,id)",
  "cantidad": "integer (required, min:1, max:100)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/4/regalos
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 20,
  "cantidad": 1
}
```

**Ejemplo of Response (201):**
```json
{
  "success": true,
  "message": "Configuración de regalo creada exitosamente",
  "data": {
    "id": 2,
    "producto_id": 20,
    "cantidad": 1,
    "es_regalo_multiple": false,
    "valor_total_regalo": 15.0,
    "tiene_stock_suficiente": true,
    "stock_disponible": 50,
    "puede_ser_otorgado": true,
    "descripcion": "1 unidad de Cable USB como regalo",
    "producto": {
      "id": 20,
      "nombre": "Cable USB",
      "codigo_producto": "CAB-001",
      "precio_venta": 15.0,
      "stock": 50,
      "activo": true
    },
    "resumen": {
      "producto": "Cable USB",
      "cantidad_regalo": 1,
      "valor_regalo": "S/ 15",
      "stock_disponible": 50,
      "regalos_posibles": 50
    }
  }
}
```

**Ejemplo of Response (422 - Producto Inactivo):**
```json
{
  "success": false,
  "message": "No se puede configurar un producto inactivo como regalo"
}
```

**Ejemplo of Response (422 - Stock Insuficiente):**
```json
{
  "success": false,
  "message": "Stock insuficiente. Disponible: 5, Requerido: 10"
}
```

---

### 3. **PUT** `/api/admin/recompensas/{recompensaId}/regalos/{configId}` - Actualizar Configuración

**Descripción:** Actualiza una configuración específica de regalo existente.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Body Request:**
```json
{
  "producto_id": "integer (optional, exists:productos,id)",
  "cantidad": "integer (optional, min:1, max:100)"
}
```

**Ejemplo de Request:**
```bash
PUT /api/admin/recompensas/4/regalos/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "cantidad": 2
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de regalo actualizada exitosamente",
  "data": {
    "id": 2,
    "producto_id": 20,
    "cantidad": 2,
    "es_regalo_multiple": true,
    "valor_total_regalo": 30.0,
    "tiene_stock_suficiente": true,
    "stock_disponible": 50,
    "puede_ser_otorgado": true,
    "descripcion": "2 unidades de Cable USB como regalo",
    "producto": {
      "id": 20,
      "nombre": "Cable USB",
      "codigo_producto": "CAB-001",
      "precio_venta": 15.0,
      "stock": 50,
      "activo": true
    },
    "resumen": {
      "producto": "Cable USB",
      "cantidad_regalo": 2,
      "valor_regalo": "S/ 30",
      "stock_disponible": 50,
      "regalos_posibles": 25
    }
  }
}
```

---

### 4. **DELETE** `/api/admin/recompensas/{recompensaId}/regalos/{configId}` - Eliminar Configuración

**Descripción:** Elimina una configuración específica de regalo.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/4/regalos/2
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de regalo eliminada exitosamente"
}
```

---

### 5. **GET** `/api/admin/recompensas/regalos/productos` - Buscar Productos

**Descripción:** Busca productos disponibles para configurar como regalo.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
- `buscar` (string, required, min:2): Término de búsqueda por nombre o código
- `limite` (integer, optional, min:1, max:50, default:20): Límite de resultados
- `categoria_id` (integer, optional, exists:categorias,id): Filtro por categoría
- `solo_activos` (boolean, optional, default:true): Solo productos activos
- `con_stock` (boolean, optional, default:true): Solo productos con stock

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/regalos/productos?buscar=mouse&limite=10&con_stock=true
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Productos encontrados exitosamente",
  "data": [
    {
      "id": 15,
      "nombre": "Mouse Inalámbrico",
      "codigo_producto": "MOU-001",
      "precio_venta": 25.0,
      "stock": 100,
      "activo": true,
      "puede_ser_regalo": true,
      "categoria": {
        "id": 3,
        "nombre": "Periféricos"
      }
    },
    {
      "id": 16,
      "nombre": "Mouse Óptico",
      "codigo_producto": "MOU-002",
      "precio_venta": 15.0,
      "stock": 50,
      "activo": true,
      "puede_ser_regalo": true,
      "categoria": {
        "id": 3,
        "nombre": "Periféricos"
      }
    }
  ]
}
```

---

### 6. **POST** `/api/admin/recompensas/{recompensaId}/regalos/{configId}/verificar` - Verificar Disponibilidad

**Descripción:** Verifica la disponibilidad de stock para múltiples regalos.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Body Request:**
```json
{
  "cantidad_regalos": "integer (required, min:1, max:1000)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/4/regalos/1/verificar
Authorization: Bearer {token}
Content-Type: application/json

{
  "cantidad_regalos": 30
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Verificación de disponibilidad completada exitosamente",
  "data": {
    "configuracion_regalo": {
      "producto": {
        "id": 15,
        "nombre": "Mouse Inalámbrico",
        "codigo_producto": "MOU-001"
      },
      "cantidad_por_regalo": 2,
      "valor_unitario_regalo": 50.0
    },
    "solicitud": {
      "cantidad_regalos_solicitados": 30,
      "stock_total_requerido": 60,
      "valor_total_regalos": 1500.0
    },
    "disponibilidad": {
      "puede_otorgar": true,
      "stock_disponible": 100,
      "stock_requerido": 60,
      "stock_restante": 40,
      "cantidad_maxima_regalos": 50
    },
    "recomendaciones": []
  }
}
```

**Ejemplo of Response (Stock Insuficiente):**
```json
{
  "success": true,
  "message": "Verificación de disponibilidad completada exitosamente",
  "data": {
    "configuracion_regalo": {
      "producto": {
        "id": 15,
        "nombre": "Mouse Inalámbrico",
        "codigo_producto": "MOU-001"
      },
      "cantidad_por_regalo": 2,
      "valor_unitario_regalo": 50.0
    },
    "solicitud": {
      "cantidad_regalos_solicitados": 60,
      "stock_total_requerido": 120,
      "valor_total_regalos": 3000.0
    },
    "disponibilidad": {
      "puede_otorgar": false,
      "stock_disponible": 100,
      "stock_requerido": 120,
      "stock_restante": -20,
      "cantidad_maxima_regalos": 50
    },
    "recomendaciones": [
      "Stock insuficiente. Máximo posible: 50 regalos",
      "Considere reducir la cantidad a 50 regalos"
    ]
  }
}
```

---

### 7. **POST** `/api/admin/recompensas/{recompensaId}/regalos/simular` - Simular Otorgamiento

**Descripción:** Simula el otorgamiento de regalos para múltiples aplicaciones.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "cantidad_aplicaciones": "integer (optional, min:1, max:100, default:1)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/4/regalos/simular
Authorization: Bearer {token}
Content-Type: application/json

{
  "cantidad_aplicaciones": 25
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Simulación de regalos completada exitosamente",
  "data": {
    "resumen": {
      "cantidad_aplicaciones_solicitadas": 25,
      "total_configuraciones": 2,
      "valor_total_todos_regalos": 2000.0,
      "stock_total_requerido": 75,
      "todas_disponibles": true,
      "configuraciones_disponibles": 2
    },
    "simulaciones": [
      {
        "producto": {
          "id": 15,
          "nombre": "Mouse Inalámbrico",
          "codigo_producto": "MOU-001"
        },
        "configuracion": {
          "cantidad_por_regalo": 2,
          "valor_unitario": 50.0
        },
        "simulacion": {
          "cantidad_aplicaciones": 25,
          "stock_requerido": 50,
          "valor_total": 1250.0,
          "puede_otorgar": true,
          "cantidad_maxima_posible": 50
        }
      },
      {
        "producto": {
          "id": 20,
          "nombre": "Cable USB",
          "codigo_producto": "CAB-001"
        },
        "configuracion": {
          "cantidad_por_regalo": 1,
          "valor_unitario": 30.0
        },
        "simulacion": {
          "cantidad_aplicaciones": 25,
          "stock_requerido": 25,
          "valor_total": 750.0,
          "puede_otorgar": true,
          "cantidad_maxima_posible": 50
        }
      }
    ]
  }
}
```

---

### 8. **GET** `/api/admin/recompensas/{recompensaId}/regalos/estadisticas` - Estadísticas de Regalos

**Descripción:** Obtiene estadísticas detalladas de regalos para una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/4/regalos/estadisticas
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Estadísticas de regalos obtenidas exitosamente",
  "data": {
    "total_configuraciones": 2,
    "valor_total_regalos": 80.0,
    "stock_total_disponible": 150,
    "configuraciones_disponibles": 2,
    "configuraciones_sin_stock": 0,
    "productos_activos": 2,
    "por_producto": [
      {
        "producto": {
          "id": 15,
          "nombre": "Mouse Inalámbrico",
          "codigo_producto": "MOU-001"
        },
        "cantidad_regalo": 2,
        "valor_regalo": 50.0,
        "stock_disponible": 100,
        "puede_otorgar": true,
        "regalos_posibles": 50
      },
      {
        "producto": {
          "id": 20,
          "nombre": "Cable USB",
          "codigo_producto": "CAB-001"
        },
        "cantidad_regalo": 1,
        "valor_regalo": 30.0,
        "stock_disponible": 50,
        "puede_otorgar": true,
        "regalos_posibles": 50
      }
    ]
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Configurador de Regalos**

```typescript
interface ConfiguradorRegalosProps {
  recompensa: Recompensa;
  configuraciones: ConfiguracionRegalo[];
  onConfiguracionGuardada: (configuracion: ConfiguracionRegalo) => void;
  onSimular: (cantidad: number) => void;
}

interface ConfiguracionRegalo {
  id?: number;
  producto_id: number;
  cantidad: number;
  es_regalo_multiple: boolean;
  valor_total_regalo: number;
  tiene_stock_suficiente: boolean;
  stock_disponible: number;
  puede_ser_otorgado: boolean;
  descripcion: string;
  producto: Producto;
  resumen: ResumenConfiguracion;
}

interface Producto {
  id: number;
  nombre: string;
  codigo_producto: string;
  precio_venta: number;
  stock: number;
  activo: boolean;
}
```

**Características:**
- Selector de productos con búsqueda
- Campo de cantidad con validación
- Verificación de stock en tiempo real
- Descripción automática del regalo
- Botones para guardar y simular
- Lista de configuraciones existentes

### 2. **Buscador de Productos**

```typescript
interface BuscadorProductosProps {
  onProductosEncontrados: (productos: Producto[]) => void;
  onBuscar: (filtros: FiltrosBusqueda) => void;
  categorias: Categoria[];
  isLoading: boolean;
}

interface FiltrosBusqueda {
  buscar: string;
  limite?: number;
  categoria_id?: number;
  solo_activos?: boolean;
  con_stock?: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}
```

**Características:**
- Búsqueda por nombre o código de producto
- Filtros por categoría y estado
- Solo productos con stock disponible
- Lista de productos con información completa
- Selección de producto para configuración

### 3. **Simulador de Regalos**

```typescript
interface SimuladorRegalosProps {
  configuraciones: ConfiguracionRegalo[];
  resultado?: ResultadoSimulacion;
  onSimular: (cantidad: number) => void;
  isLoading: boolean;
}

interface ResultadoSimulacion {
  resumen: {
    cantidad_aplicaciones_solicitadas: number;
    total_configuraciones: number;
    valor_total_todos_regalos: number;
    stock_total_requerido: number;
    todas_disponibles: boolean;
    configuraciones_disponibles: number;
  };
  simulaciones: SimulacionRegalo[];
}

interface SimulacionRegalo {
  producto: Producto;
  configuracion: {
    cantidad_por_regalo: number;
    valor_unitario: number;
  };
  simulacion: {
    cantidad_aplicaciones: number;
    stock_requerido: number;
    valor_total: number;
    puede_otorgar: boolean;
    cantidad_maxima_posible: number;
  };
}
```

**Características:**
- Input para cantidad de aplicaciones
- Simulación de todas las configuraciones
- Resumen de disponibilidad general
- Desglose por producto
- Indicadores de stock disponible
- Recomendaciones de optimización

### 4. **Verificador de Disponibilidad**

```typescript
interface VerificadorDisponibilidadProps {
  configuracion: ConfiguracionRegalo;
  resultado?: ResultadoVerificacion;
  onVerificar: (cantidad: number) => void;
  isLoading: boolean;
}

interface ResultadoVerificacion {
  configuracion_regalo: {
    producto: Producto;
    cantidad_por_regalo: number;
    valor_unitario_regalo: number;
  };
  solicitud: {
    cantidad_regalos_solicitados: number;
    stock_total_requerido: number;
    valor_total_regalos: number;
  };
  disponibilidad: {
    puede_otorgar: boolean;
    stock_disponible: number;
    stock_requerido: number;
    stock_restante: number;
    cantidad_maxima_regalos: number;
  };
  recomendaciones: string[];
}
```

**Características:**
- Input para cantidad de regalos
- Verificación de stock específico
- Cálculo de stock requerido vs disponible
- Recomendaciones automáticas
- Indicadores visuales de disponibilidad

### 5. **Dashboard de Estadísticas**

```typescript
interface DashboardRegalosProps {
  recompensa: Recompensa;
  estadisticas?: EstadisticasRegalos;
}

interface EstadisticasRegalos {
  total_configuraciones: number;
  valor_total_regalos: number;
  stock_total_disponible: number;
  configuraciones_disponibles: number;
  configuraciones_sin_stock: number;
  productos_activos: number;
  por_producto: EstadisticaProducto[];
}

interface EstadisticaProducto {
  producto: Producto;
  cantidad_regalo: number;
  valor_regalo: number;
  stock_disponible: number;
  puede_otorgar: boolean;
  regalos_posibles: number;
}
```

**Características:**
- Métricas generales de regalos
- Valor total de regalos configurados
- Stock total disponible
- Estadísticas por producto
- Indicadores de disponibilidad
- Gráficos de distribución

---

## 🔧 Implementación Técnica

### Modelo de Configuración de Regalos

```php
class RecompensaRegalo extends Model
{
    protected $fillable = [
        'recompensa_id', 'producto_id', 'cantidad'
    ];

    protected $casts = [
        'cantidad' => 'integer'
    ];

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    // Accessors
    public function getEsRegaloMultipleAttribute(): bool
    {
        return $this->cantidad > 1;
    }

    public function getValorTotalRegaloAttribute(): float
    {
        return $this->producto ? $this->producto->precio_venta * $this->cantidad : 0;
    }

    public function getTieneStockSuficienteAttribute(): bool
    {
        return $this->producto && $this->producto->stock >= $this->cantidad;
    }

    public function getStockDisponibleAttribute(): int
    {
        return $this->producto ? $this->producto->stock : 0;
    }

    public function getDescripcionRegaloAttribute(): string
    {
        if (!$this->producto) return 'Producto no disponible';
        
        $cantidad = $this->cantidad;
        $producto = $this->producto->nombre;
        
        return "{$cantidad} " . ($cantidad > 1 ? 'unidades' : 'unidad') . " de {$producto} como regalo";
    }

    // Métodos de validación
    public function puedeSerOtorgado(): bool
    {
        return $this->producto && 
               $this->producto->activo && 
               $this->tiene_stock_suficiente;
    }

    public function getResumenConfiguracion(): array
    {
        return [
            'producto' => $this->producto ? $this->producto->nombre : 'No disponible',
            'cantidad_regalo' => $this->cantidad,
            'valor_regalo' => "S/ {$this->valor_total_regalo}",
            'stock_disponible' => $this->stock_disponible,
            'regalos_posibles' => $this->cantidad > 0 ? intval($this->stock_disponible / $this->cantidad) : 0
        ];
    }

    // Métodos de verificación
    public function verificarDisponibilidadMultiple(int $cantidadRegalos): array
    {
        $stockRequerido = $this->cantidad * $cantidadRegalos;
        $stockDisponible = $this->stock_disponible;
        $puedeOtorgar = $stockDisponible >= $stockRequerido;
        $cantidadMaxima = $this->cantidad > 0 ? intval($stockDisponible / $this->cantidad) : 0;

        return [
            'puede_otorgar' => $puedeOtorgar,
            'stock_disponible' => $stockDisponible,
            'stock_requerido' => $stockRequerido,
            'stock_restante' => $stockDisponible - $stockRequerido,
            'cantidad_maxima_regalos' => $cantidadMaxima
        ];
    }
}
```

### Lógica de Simulación

```php
public function simular(Request $request, $recompensaId): JsonResponse
{
    $configuraciones = RecompensaRegalo::where('recompensa_id', $recompensaId)
        ->with('producto')
        ->get();

    $cantidadAplicaciones = $request->get('cantidad_aplicaciones', 1);
    $simulaciones = [];
    $valorTotalRegalos = 0;
    $stockTotalRequerido = 0;

    foreach ($configuraciones as $configuracion) {
        $disponibilidad = $configuracion->verificarDisponibilidadMultiple($cantidadAplicaciones);
        $valorTotal = $configuracion->valor_total_regalo * $cantidadAplicaciones;
        
        $simulacion = [
            'producto' => [
                'id' => $configuracion->producto->id,
                'nombre' => $configuracion->producto->nombre,
                'codigo_producto' => $configuracion->producto->codigo_producto
            ],
            'configuracion' => [
                'cantidad_por_regalo' => $configuracion->cantidad,
                'valor_unitario' => $configuracion->valor_total_regalo
            ],
            'simulacion' => [
                'cantidad_aplicaciones' => $cantidadAplicaciones,
                'stock_requerido' => $disponibilidad['stock_requerido'],
                'valor_total' => $valorTotal,
                'puede_otorgar' => $disponibilidad['puede_otorgar'],
                'cantidad_maxima_posible' => $disponibilidad['cantidad_maxima_regalos']
            ]
        ];

        $simulaciones[] = $simulacion;
        $valorTotalRegalos += $valorTotal;
        $stockTotalRequerido += $disponibilidad['stock_requerido'];
    }

    $resumen = [
        'cantidad_aplicaciones_solicitadas' => $cantidadAplicaciones,
        'total_configuraciones' => $configuraciones->count(),
        'valor_total_todos_regalos' => $valorTotalRegalos,
        'stock_total_requerido' => $stockTotalRequerido,
        'todas_disponibles' => collect($simulaciones)->every(function($sim) {
            return $sim['simulacion']['puede_otorgar'];
        }),
        'configuraciones_disponibles' => collect($simulaciones)->where('simulacion.puede_otorgar', true)->count()
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'resumen' => $resumen,
            'simulaciones' => $simulaciones
        ]
    ]);
}
```

---

## 📊 Métricas y KPIs

### Métricas de Configuración
- **Total de Configuraciones:** Número de productos configurados como regalo
- **Valor Total de Regalos:** Suma del valor de todos los regalos configurados
- **Stock Total Disponible:** Suma del stock disponible de todos los productos
- **Configuraciones Disponibles:** Número de configuraciones con stock suficiente

### Métricas de Disponibilidad
- **Regalos Posibles:** Número máximo de regalos que se pueden otorgar
- **Stock Requerido vs Disponible:** Comparación de stock necesario vs disponible
- **Productos Activos:** Número de productos activos configurados
- **Configuraciones Sin Stock:** Número de configuraciones sin stock suficiente

### Métricas de Valor
- **Valor Promedio por Regalo:** Valor promedio de cada regalo
- **Valor Total por Producto:** Valor total de regalos por producto
- **Costo de Stock:** Valor del stock comprometido para regalos
- **ROI de Regalos:** Retorno de inversión de la promoción

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Productos:** Verificación de existencia y estado activo
2. **Validación de Stock:** Prevención de configuración sin stock suficiente
3. **Límites de Cantidad:** Límites máximos en cantidad de regalos
4. **Auditoría:** Registro de cambios en configuraciones
5. **Permisos Granulares:** Verificación de permisos en cada operación

---

## 📝 Notas de Implementación

- **Configuración Múltiple:** Múltiples productos pueden ser regalos
- **Validación de Stock:** Verificación automática de disponibilidad
- **Simulación Precisa:** Cálculos exactos para simulación
- **Productos Activos:** Solo productos activos pueden ser regalos
- **Cantidad Variable:** Diferentes cantidades por producto
- **Verificación en Tiempo Real:** Validación inmediata de disponibilidad

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No es de Tipo Regalo:**
   ```json
   {
     "success": false,
     "message": "Esta recompensa no es de tipo regalo"
   }
   ```

2. **Producto Inactivo:**
   ```json
   {
     "success": false,
     "message": "No se puede configurar un producto inactivo como regalo"
   }
   ```

3. **Stock Insuficiente:**
   ```json
   {
     "success": false,
     "message": "Stock insuficiente. Disponible: 5, Requerido: 10"
   }
   ```

4. **Producto Ya Configurado:**
   ```json
   {
     "success": false,
     "message": "Este producto ya está configurado como regalo para esta recompensa"
   }
   ```

### Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Configuración creada exitosamente |
| 400 | Bad Request | Parámetros malformados |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Recompensa o configuración no encontrada |
| 422 | Unprocessable Entity | Errores de validación o configuración inválida |
| 500 | Internal Server Error | Error interno del servidor |
