# 🎯 SUBMÓDULO: Configuración de Descuentos

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/descuentos`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/descuentos`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la configuración detallada del sistema de descuentos para recompensas de tipo "descuento", incluyendo la definición de tipos de descuento, valores, compras mínimas, simulación de cálculos y validación de configuraciones.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/descuentos` - Ver Configuración

**Descripción:** Obtiene la configuración actual de descuentos para una recompensa específica.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/2/descuentos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Configuración de descuentos obtenida exitosamente",
  "data": {
    "recompensa": {
      "id": 2,
      "nombre": "Descuento Black Friday 2024",
      "tipo": "descuento"
    },
    "configuraciones": [
      {
        "id": 1,
        "tipo_descuento": "porcentaje",
        "tipo_descuento_nombre": "Porcentaje (%)",
        "valor_descuento": 15.0,
        "compra_minima": 100.0,
        "tiene_compra_minima": true,
        "configuracion_valida": true,
        "descripcion": "15% de descuento con compra mínima de S/ 100",
        "resumen": {
          "tipo_descuento": "Porcentaje",
          "valor_descuento": "15%",
          "compra_minima": "S/ 100",
          "es_porcentaje": true
        }
      }
    ]
  }
}
```

**Ejemplo de Response (Recompensa No es de Tipo Descuento):**
```json
{
  "success": false,
  "message": "Esta recompensa no es de tipo descuento"
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/descuentos` - Crear Configuración

**Descripción:** Crea una nueva configuración de descuento para una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "tipo_descuento": "string (required, in:porcentaje,cantidad_fija)",
  "valor_descuento": "number (required, min:0.01)",
  "compra_minima": "number (optional, min:0)"
}
```

**Ejemplo de Request (Descuento por Porcentaje):**
```bash
POST /api/admin/recompensas/2/descuentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_descuento": "porcentaje",
  "valor_descuento": 20.0,
  "compra_minima": 150.0
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Configuración de descuento creada exitosamente",
  "data": {
    "id": 2,
    "tipo_descuento": "porcentaje",
    "tipo_descuento_nombre": "Porcentaje (%)",
    "valor_descuento": 20.0,
    "compra_minima": 150.0,
    "tiene_compra_minima": true,
    "configuracion_valida": true,
    "descripcion": "20% de descuento con compra mínima de S/ 150",
    "resumen": {
      "tipo_descuento": "Porcentaje",
      "valor_descuento": "20%",
      "compra_minima": "S/ 150",
      "es_porcentaje": true
    }
  }
}
```

**Ejemplo de Request (Descuento por Cantidad Fija):**
```bash
POST /api/admin/recompensas/2/descuentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_descuento": "cantidad_fija",
  "valor_descuento": 50.0,
  "compra_minima": 200.0
}
```

**Ejemplo of Response (201):**
```json
{
  "success": true,
  "message": "Configuración de descuento creada exitosamente",
  "data": {
    "id": 3,
    "tipo_descuento": "cantidad_fija",
    "tipo_descuento_nombre": "Cantidad Fija (S/)",
    "valor_descuento": 50.0,
    "compra_minima": 200.0,
    "tiene_compra_minima": true,
    "configuracion_valida": true,
    "descripcion": "S/ 50 de descuento con compra mínima de S/ 200",
    "resumen": {
      "tipo_descuento": "Cantidad Fija",
      "valor_descuento": "S/ 50",
      "compra_minima": "S/ 200",
      "es_porcentaje": false
    }
  }
}
```

**Ejemplo of Response (422 - Ya Existe Configuración):**
```json
{
  "success": false,
  "message": "Ya existe una configuración de descuento para esta recompensa. Use el método de actualización."
}
```

**Ejemplo of Response (422 - Porcentaje Inválido):**
```json
{
  "success": false,
  "message": "El porcentaje de descuento no puede ser mayor a 100%"
}
```

---

### 3. **PUT** `/api/admin/recompensas/{recompensaId}/descuentos/{configId}` - Actualizar Configuración

**Descripción:** Actualiza una configuración específica de descuento existente.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Body Request:**
```json
{
  "tipo_descuento": "string (optional, in:porcentaje,cantidad_fija)",
  "valor_descuento": "number (optional, min:0.01)",
  "compra_minima": "number (optional, min:0)"
}
```

**Ejemplo de Request:**
```bash
PUT /api/admin/recompensas/2/descuentos/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_descuento": "porcentaje",
  "valor_descuento": 25.0,
  "compra_minima": 200.0
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de descuento actualizada exitosamente",
  "data": {
    "id": 2,
    "tipo_descuento": "porcentaje",
    "tipo_descuento_nombre": "Porcentaje (%)",
    "valor_descuento": 25.0,
    "compra_minima": 200.0,
    "tiene_compra_minima": true,
    "configuracion_valida": true,
    "descripcion": "25% de descuento con compra mínima de S/ 200",
    "resumen": {
      "tipo_descuento": "Porcentaje",
      "valor_descuento": "25%",
      "compra_minima": "S/ 200",
      "es_porcentaje": true
    }
  }
}
```

---

### 4. **DELETE** `/api/admin/recompensas/{recompensaId}/descuentos/{configId}` - Eliminar Configuración

**Descripción:** Elimina una configuración específica de descuento.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/2/descuentos/2
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de descuento eliminada exitosamente"
}
```

---

### 5. **POST** `/api/admin/recompensas/{recompensaId}/descuentos/simular` - Simular Cálculo de Descuentos

**Descripción:** Simula el cálculo de descuentos para múltiples montos basado en la configuración actual.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "montos": "array (required, min:1) of numbers (min:0.01)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/2/descuentos/simular
Authorization: Bearer {token}
Content-Type: application/json

{
  "montos": [50.0, 100.0, 150.0, 200.0, 300.0, 500.0]
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Simulación de descuentos calculada exitosamente",
  "data": {
    "configuracion": {
      "tipo_descuento": "porcentaje",
      "tipo_descuento_nombre": "Porcentaje (%)",
      "valor_descuento": 20.0,
      "compra_minima": 100.0,
      "descripcion": "20% de descuento con compra mínima de S/ 100"
    },
    "simulaciones": [
      {
        "monto_original": 50.0,
        "cumple_minima": false,
        "descuento": 0.0,
        "monto_final": 50.0,
        "ahorro": 0.0,
        "porcentaje_descuento_efectivo": 0.0,
        "mensaje": "No cumple con la compra mínima de S/ 100"
      },
      {
        "monto_original": 100.0,
        "cumple_minima": true,
        "descuento": 20.0,
        "monto_final": 80.0,
        "ahorro": 20.0,
        "porcentaje_descuento_efectivo": 20.0,
        "mensaje": "Descuento aplicado: S/ 20 (20% de descuento)"
      },
      {
        "monto_original": 150.0,
        "cumple_minima": true,
        "descuento": 30.0,
        "monto_final": 120.0,
        "ahorro": 30.0,
        "porcentaje_descuento_efectivo": 20.0,
        "mensaje": "Descuento aplicado: S/ 30 (20% de descuento)"
      },
      {
        "monto_original": 200.0,
        "cumple_minima": true,
        "descuento": 40.0,
        "monto_final": 160.0,
        "ahorro": 40.0,
        "porcentaje_descuento_efectivo": 20.0,
        "mensaje": "Descuento aplicado: S/ 40 (20% de descuento)"
      },
      {
        "monto_original": 300.0,
        "cumple_minima": true,
        "descuento": 60.0,
        "monto_final": 240.0,
        "ahorro": 60.0,
        "porcentaje_descuento_efectivo": 20.0,
        "mensaje": "Descuento aplicado: S/ 60 (20% de descuento)"
      },
      {
        "monto_original": 500.0,
        "cumple_minima": true,
        "descuento": 100.0,
        "monto_final": 400.0,
        "ahorro": 100.0,
        "porcentaje_descuento_efectivo": 20.0,
        "mensaje": "Descuento aplicado: S/ 100 (20% de descuento)"
      }
    ],
    "resumen": {
      "total_simulaciones": 6,
      "simulaciones_con_descuento": 5,
      "descuento_promedio": 50.0,
      "ahorro_total": 250.0
    }
  }
}
```

---

### 6. **POST** `/api/admin/recompensas/{recompensaId}/descuentos/calcular` - Calcular Descuento Específico

**Descripción:** Calcula el descuento para un monto específico con detalles completos.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "monto_compra": "number (required, min:0.01)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/2/descuentos/calcular
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto_compra": 250.0
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Cálculo de descuento realizado exitosamente",
  "data": {
    "monto_original": 250.0,
    "cumple_compra_minima": true,
    "descuento_aplicado": 50.0,
    "monto_final": 200.0,
    "ahorro": 50.0,
    "porcentaje_descuento_efectivo": 20.0,
    "configuracion": {
      "tipo_descuento": "Porcentaje (%)",
      "valor_descuento": 20.0,
      "compra_minima": 100.0,
      "descripcion": "20% de descuento con compra mínima de S/ 100"
    },
    "detalles": {
      "mensaje": "Descuento aplicado: S/ 50 (20% de descuento)",
      "formula_calculo": "(250 × 20%) = 50"
    }
  }
}
```

**Ejemplo of Response (No Cumple Mínima):**
```json
{
  "success": true,
  "message": "Cálculo de descuento realizado exitosamente",
  "data": {
    "monto_original": 75.0,
    "cumple_compra_minima": false,
    "descuento_aplicado": 0.0,
    "monto_final": 75.0,
    "ahorro": 0.0,
    "porcentaje_descuento_efectivo": 0.0,
    "configuracion": {
      "tipo_descuento": "Porcentaje (%)",
      "valor_descuento": 20.0,
      "compra_minima": 100.0,
      "descripcion": "20% de descuento con compra mínima de S/ 100"
    },
    "detalles": {
      "mensaje": "No cumple con la compra mínima de S/ 100",
      "formula_calculo": "No aplica descuento"
    }
  }
}
```

---

### 7. **GET** `/api/admin/recompensas/descuentos/tipos` - Tipos de Descuento Disponibles

**Descripción:** Obtiene los tipos de descuento disponibles con sus descripciones y ejemplos.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/descuentos/tipos
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Tipos de descuento obtenidos exitosamente",
  "data": [
    {
      "value": "porcentaje",
      "label": "Porcentaje (%)",
      "descripcion": "Descuento basado en un porcentaje del total de la compra",
      "ejemplo": "15% de descuento"
    },
    {
      "value": "cantidad_fija",
      "label": "Cantidad Fija (S/)",
      "descripcion": "Descuento de una cantidad fija en soles",
      "ejemplo": "S/ 50 de descuento"
    }
  ]
}
```

---

### 8. **POST** `/api/admin/recompensas/descuentos/validar` - Validar Configuración

**Descripción:** Valida una configuración de descuento sin guardarla, incluyendo recomendaciones y advertencias.

**Permisos:** `recompensas.ver`

**Body Request:**
```json
{
  "tipo_descuento": "string (required, in:porcentaje,cantidad_fija)",
  "valor_descuento": "number (required, min:0.01)",
  "compra_minima": "number (optional, min:0)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/descuentos/validar
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_descuento": "porcentaje",
  "valor_descuento": 30.0,
  "compra_minima": 100.0
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "es_valida": true,
    "configuracion": {
      "tipo_descuento": "porcentaje",
      "valor_descuento": 30.0,
      "compra_minima": 100.0
    },
    "errores": [],
    "advertencias": [],
    "recomendaciones": [
      "Para porcentajes: Entre 5% y 25% suelen ser atractivos y sostenibles",
      "Para cantidades fijas: Entre S/ 10 y S/ 100 según el ticket promedio",
      "Considere establecer una compra mínima para proteger la rentabilidad"
    ]
  }
}
```

**Ejemplo of Response (Con Advertencias):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "es_valida": true,
    "configuracion": {
      "tipo_descuento": "porcentaje",
      "valor_descuento": 60.0,
      "compra_minima": 50.0
    },
    "errores": [],
    "advertencias": [
      "Un descuento mayor al 50% puede afectar significativamente la rentabilidad"
    ],
    "recomendaciones": [
      "Para porcentajes: Entre 5% y 25% suelen ser atractivos y sostenibles",
      "Para cantidades fijas: Entre S/ 10 y S/ 100 según el ticket promedio",
      "Considere establecer una compra mínima para proteger la rentabilidad"
    ]
  }
}
```

**Ejemplo of Response (Con Errores):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "es_valida": false,
    "configuracion": {
      "tipo_descuento": "porcentaje",
      "valor_descuento": 150.0,
      "compra_minima": 100.0
    },
    "errores": [
      "El porcentaje no puede ser mayor a 100%"
    ],
    "advertencias": [],
    "recomendaciones": [
      "Para porcentajes: Entre 5% y 25% suelen ser atractivos y sostenibles",
      "Para cantidades fijas: Entre S/ 10 y S/ 100 según el ticket promedio",
      "Considere establecer una compra mínima para proteger la rentabilidad"
    ]
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Configurador de Descuentos**

```typescript
interface ConfiguradorDescuentosProps {
  recompensa: Recompensa;
  configuracion?: ConfiguracionDescuento;
  onConfiguracionGuardada: (configuracion: ConfiguracionDescuento) => void;
  onSimular: (montos: number[]) => void;
}

interface ConfiguracionDescuento {
  id?: number;
  tipo_descuento: 'porcentaje' | 'cantidad_fija';
  tipo_descuento_nombre: string;
  valor_descuento: number;
  compra_minima?: number;
  tiene_compra_minima: boolean;
  configuracion_valida: boolean;
  descripcion: string;
  resumen: ResumenConfiguracion;
}

interface ResumenConfiguracion {
  tipo_descuento: string;
  valor_descuento: string;
  compra_minima: string;
  es_porcentaje: boolean;
}
```

**Características:**
- Selector de tipo de descuento (porcentaje/cantidad fija)
- Campo de valor con validación específica por tipo
- Campo opcional de compra mínima
- Validación en tiempo real
- Descripción automática de la configuración
- Botones para guardar y simular

### 2. **Simulador de Descuentos**

```typescript
interface SimuladorDescuentosProps {
  configuracion: ConfiguracionDescuento;
  resultado?: ResultadoSimulacion;
  onSimular: (montos: number[]) => void;
  isLoading: boolean;
}

interface ResultadoSimulacion {
  configuracion: ConfiguracionDescuento;
  simulaciones: SimulacionDescuento[];
  resumen: {
    total_simulaciones: number;
    simulaciones_con_descuento: number;
    descuento_promedio: number;
    ahorro_total: number;
  };
}

interface SimulacionDescuento {
  monto_original: number;
  cumple_minima: boolean;
  descuento: number;
  monto_final: number;
  ahorro: number;
  porcentaje_descuento_efectivo: number;
  mensaje: string;
}
```

**Características:**
- Input para múltiples montos de prueba
- Tabla de resultados con desglose detallado
- Indicadores visuales de cumplimiento de mínima
- Resumen estadístico de simulaciones
- Exportación de resultados
- Gráficos de efectividad

### 3. **Calculadora de Descuento**

```typescript
interface CalculadoraDescuentoProps {
  configuracion: ConfiguracionDescuento;
  resultado?: ResultadoCalculo;
  onCalcular: (monto: number) => void;
  isLoading: boolean;
}

interface ResultadoCalculo {
  monto_original: number;
  cumple_compra_minima: boolean;
  descuento_aplicado: number;
  monto_final: number;
  ahorro: number;
  porcentaje_descuento_efectivo: number;
  configuracion: ConfiguracionDescuento;
  detalles: {
    mensaje: string;
    formula_calculo: string;
  };
}
```

**Características:**
- Input para monto específico
- Cálculo instantáneo
- Desglose detallado del descuento
- Fórmula de cálculo visible
- Indicadores de cumplimiento
- Comparación con configuración

### 4. **Selector de Tipos de Descuento**

```typescript
interface SelectorTiposDescuentoProps {
  tipos: TipoDescuento[];
  tipoSeleccionado?: string;
  onTipoSeleccionado: (tipo: string) => void;
}

interface TipoDescuento {
  value: string;
  label: string;
  descripcion: string;
  ejemplo: string;
}
```

**Características:**
- Lista de tipos disponibles
- Descripción de cada tipo
- Ejemplos de uso
- Selección visual clara
- Preview de configuración

### 5. **Validador de Configuración**

```typescript
interface ValidadorDescuentosProps {
  configuracion: ConfiguracionDescuento;
  resultado?: ResultadoValidacion;
  onValidar: (configuracion: ConfiguracionDescuento) => void;
}

interface ResultadoValidacion {
  es_valida: boolean;
  configuracion: ConfiguracionDescuento;
  errores: string[];
  advertencias: string[];
  recomendaciones: string[];
}
```

**Características:**
- Validación en tiempo real
- Indicadores de errores y advertencias
- Lista de recomendaciones
- Alertas de configuración inválida
- Sugerencias de mejora
- Comparación con mejores prácticas

---

## 🔧 Implementación Técnica

### Modelo de Configuración de Descuentos

```php
class RecompensaDescuento extends Model
{
    const TIPO_PORCENTAJE = 'porcentaje';
    const TIPO_CANTIDAD_FIJA = 'cantidad_fija';

    protected $fillable = [
        'recompensa_id', 'tipo_descuento', 'valor_descuento', 'compra_minima'
    ];

    protected $casts = [
        'valor_descuento' => 'decimal:2',
        'compra_minima' => 'decimal:2'
    ];

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    // Accessors
    public function getTipoDescuentoNombreAttribute(): string
    {
        $nombres = [
            self::TIPO_PORCENTAJE => 'Porcentaje (%)',
            self::TIPO_CANTIDAD_FIJA => 'Cantidad Fija (S/)'
        ];

        return $nombres[$this->tipo_descuento] ?? ucfirst($this->tipo_descuento);
    }

    public function getTieneCompraMinimaAttribute(): bool
    {
        return $this->compra_minima > 0;
    }

    public function getEsPorcentajeAttribute(): bool
    {
        return $this->tipo_descuento === self::TIPO_PORCENTAJE;
    }

    public function getDescripcionDescuentoAttribute(): string
    {
        $descripcion = '';
        
        if ($this->es_porcentaje) {
            $descripcion = "{$this->valor_descuento}% de descuento";
        } else {
            $descripcion = "S/ {$this->valor_descuento} de descuento";
        }

        if ($this->tiene_compra_minima) {
            $descripcion .= " con compra mínima de S/ {$this->compra_minima}";
        }

        return $descripcion;
    }

    // Métodos de validación
    public function esConfiguracionValida(): bool
    {
        if ($this->es_porcentaje && $this->valor_descuento > 100) {
            return false;
        }

        return $this->valor_descuento > 0;
    }

    public function getResumenConfiguracion(): array
    {
        return [
            'tipo_descuento' => $this->tipo_descuento_nombre,
            'valor_descuento' => $this->es_porcentaje ? "{$this->valor_descuento}%" : "S/ {$this->valor_descuento}",
            'compra_minima' => $this->tiene_compra_minima ? "S/ {$this->compra_minima}" : 'Sin mínima',
            'es_porcentaje' => $this->es_porcentaje
        ];
    }

    // Métodos de cálculo
    public function cumpleCompraMinima(float $monto): bool
    {
        return !$this->tiene_compra_minima || $monto >= $this->compra_minima;
    }

    public function calcularDescuento(float $monto): float
    {
        if (!$this->cumpleCompraMinima($monto)) {
            return 0;
        }

        if ($this->es_porcentaje) {
            return $monto * ($this->valor_descuento / 100);
        }

        return $this->valor_descuento;
    }

    public function calcularMontoFinal(float $monto): float
    {
        return $monto - $this->calcularDescuento($monto);
    }

    public function getPorcentajeDescuentoEfectivo(float $monto): float
    {
        if ($monto <= 0) return 0;
        
        $descuento = $this->calcularDescuento($monto);
        return ($descuento / $monto) * 100;
    }

    public function simularDescuentos(array $montos): array
    {
        return collect($montos)->map(function($monto) {
            $cumpleMinima = $this->cumpleCompraMinima($monto);
            $descuento = $this->calcularDescuento($monto);
            $montoFinal = $this->calcularMontoFinal($monto);
            $porcentajeEfectivo = $this->getPorcentajeDescuentoEfectivo($monto);

            $mensaje = $cumpleMinima ? 
                "Descuento aplicado: S/ {$descuento} ({$porcentajeEfectivo}% de descuento)" : 
                ($this->tiene_compra_minima ? 
                    "No cumple con la compra mínima de S/ {$this->compra_minima}" : 
                    'Descuento no aplicable');

            return [
                'monto_original' => $monto,
                'cumple_minima' => $cumpleMinima,
                'descuento' => $descuento,
                'monto_final' => $montoFinal,
                'ahorro' => $descuento,
                'porcentaje_descuento_efectivo' => round($porcentajeEfectivo, 2),
                'mensaje' => $mensaje
            ];
        })->toArray();
    }

    // Métodos estáticos
    public static function getTiposDescuento(): array
    {
        return [self::TIPO_PORCENTAJE, self::TIPO_CANTIDAD_FIJA];
    }
}
```

### Lógica de Simulación

```php
public function simular(Request $request, $recompensaId): JsonResponse
{
    $configuracion = RecompensaDescuento::where('recompensa_id', $recompensaId)->first();
    $montos = $request->montos;
    $simulaciones = $configuracion->simularDescuentos($montos);

    $resultado = [
        'configuracion' => [
            'tipo_descuento' => $configuracion->tipo_descuento,
            'tipo_descuento_nombre' => $configuracion->tipo_descuento_nombre,
            'valor_descuento' => $configuracion->valor_descuento,
            'compra_minima' => $configuracion->compra_minima,
            'descripcion' => $configuracion->descripcion_descuento
        ],
        'simulaciones' => $simulaciones,
        'resumen' => [
            'total_simulaciones' => count($simulaciones),
            'simulaciones_con_descuento' => collect($simulaciones)->where('cumple_minima', true)->count(),
            'descuento_promedio' => collect($simulaciones)->where('cumple_minima', true)->avg('descuento'),
            'ahorro_total' => collect($simulaciones)->where('cumple_minima', true)->sum('descuento')
        ]
    ];

    return response()->json([
        'success' => true,
        'data' => $resultado
    ]);
}
```

### Validación de Configuración

```php
public function validar(Request $request): JsonResponse
{
    $esValida = true;
    $errores = [];
    $advertencias = [];

    // Validaciones específicas
    if ($request->tipo_descuento === 'porcentaje' && $request->valor_descuento > 100) {
        $esValida = false;
        $errores[] = 'El porcentaje no puede ser mayor a 100%';
    }

    if ($request->tipo_descuento === 'porcentaje' && $request->valor_descuento > 50) {
        $advertencias[] = 'Un descuento mayor al 50% puede afectar significativamente la rentabilidad';
    }

    if ($request->tipo_descuento === 'cantidad_fija' && $request->valor_descuento > 500) {
        $advertencias[] = 'Un descuento fijo muy alto puede no ser sostenible';
    }

    if ($request->compra_minima && $request->tipo_descuento === 'cantidad_fija' && $request->compra_minima < $request->valor_descuento) {
        $advertencias[] = 'La compra mínima es menor al descuento fijo, esto podría generar pérdidas';
    }

    $validacion = [
        'es_valida' => $esValida,
        'configuracion' => $request->only(['tipo_descuento', 'valor_descuento', 'compra_minima']),
        'errores' => $errores,
        'advertencias' => $advertencias,
        'recomendaciones' => [
            'Para porcentajes: Entre 5% y 25% suelen ser atractivos y sostenibles',
            'Para cantidades fijas: Entre S/ 10 y S/ 100 según el ticket promedio',
            'Considere establecer una compra mínima para proteger la rentabilidad'
        ]
    ];

    return response()->json([
        'success' => true,
        'data' => $validacion
    ]);
}
```

---

## 📊 Métricas y KPIs

### Métricas de Configuración
- **Tipo de Descuento:** Porcentaje o cantidad fija
- **Valor del Descuento:** Monto o porcentaje configurado
- **Compra Mínima:** Monto mínimo requerido
- **Configuración Válida:** Si cumple con las reglas de negocio

### Métricas de Efectividad
- **Simulaciones con Descuento:** Número de montos que califican
- **Descuento Promedio:** Promedio de descuentos aplicados
- **Ahorro Total:** Suma total de descuentos en simulaciones
- **Porcentaje de Efectividad:** % de simulaciones que califican

### Métricas de Rentabilidad
- **Impacto en Margen:** Efecto del descuento en la rentabilidad
- **Ticket Promedio:** Monto promedio de compras
- **Conversión:** % de clientes que usan el descuento
- **ROI del Descuento:** Retorno de inversión de la promoción

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Límites:** Límites máximos en porcentajes (100%) y montos
2. **Validación de Configuración:** Verificación de coherencia entre tipo y valor
3. **Prevención de Pérdidas:** Validación de compra mínima vs descuento
4. **Auditoría:** Registro de cambios en configuraciones
5. **Permisos Granulares:** Verificación de permisos en cada operación

---

## 📝 Notas de Implementación

- **Configuración Única:** Solo una configuración por recompensa
- **Validación en Tiempo Real:** Validación inmediata de configuraciones
- **Simulación Precisa:** Cálculos exactos para simulación
- **Tipos de Descuento:** Porcentaje y cantidad fija
- **Compra Mínima Opcional:** Protección de rentabilidad
- **Cálculo Automático:** Monto final y porcentaje efectivo

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No es de Tipo Descuento:**
   ```json
   {
     "success": false,
     "message": "Esta recompensa no es de tipo descuento"
   }
   ```

2. **Ya Existe Configuración:**
   ```json
   {
     "success": false,
     "message": "Ya existe una configuración de descuento para esta recompensa. Use el método de actualización."
   }
   ```

3. **Porcentaje Inválido:**
   ```json
   {
     "success": false,
     "message": "El porcentaje de descuento no puede ser mayor a 100%"
   }
   ```

4. **Configuración No Encontrada:**
   ```json
   {
     "success": false,
     "message": "No hay configuración de descuento para esta recompensa"
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
