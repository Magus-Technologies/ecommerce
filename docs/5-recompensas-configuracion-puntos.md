# 🎯 SUBMÓDULO: Configuración de Puntos

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/puntos`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/puntos`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la configuración detallada del sistema de puntos para recompensas de tipo "puntos", incluyendo la definición de reglas de otorgamiento, simulación de cálculos y validación de configuraciones.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/puntos` - Ver Configuración

**Descripción:** Obtiene la configuración actual de puntos para una recompensa específica.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/puntos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Configuración de puntos obtenida exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024",
      "tipo": "puntos"
    },
    "configuraciones": [
      {
        "id": 1,
        "puntos_por_compra": 10.0,
        "puntos_por_monto": 1.0,
        "puntos_registro": 50.0,
        "configuracion_valida": true,
        "descripcion": "10 puntos por compra + 1 punto por sol gastado + 50 puntos por registro",
        "resumen": {
          "total_tipos_activos": 3,
          "puntos_maximos_por_compra": 11.0,
          "puntos_por_registro": 50.0
        }
      }
    ]
  }
}
```

**Ejemplo de Response (Recompensa No es de Tipo Puntos):**
```json
{
  "success": false,
  "message": "Esta recompensa no es de tipo puntos"
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/puntos` - Crear/Actualizar Configuración

**Descripción:** Crea o actualiza la configuración de puntos para una recompensa (reemplaza la configuración existente).

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "puntos_por_compra": "number (required, min:0, max:9999.99)",
  "puntos_por_monto": "number (required, min:0, max:9999.99)",
  "puntos_registro": "number (required, min:0, max:9999.99)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/1/puntos
Authorization: Bearer {token}
Content-Type: application/json

{
  "puntos_por_compra": 15.0,
  "puntos_por_monto": 1.5,
  "puntos_registro": 100.0
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Configuración de puntos guardada exitosamente",
  "data": {
    "id": 2,
    "puntos_por_compra": 15.0,
    "puntos_por_monto": 1.5,
    "puntos_registro": 100.0,
    "configuracion_valida": true,
    "descripcion": "15 puntos por compra + 1.5 puntos por sol gastado + 100 puntos por registro",
    "resumen": {
      "total_tipos_activos": 3,
      "puntos_maximos_por_compra": 16.5,
      "puntos_por_registro": 100.0
    }
  }
}
```

**Ejemplo de Response (422 - Configuración Inválida):**
```json
{
  "success": false,
  "message": "Debe configurar al menos un tipo de puntos mayor a 0"
}
```

**Ejemplo de Response (422 - Errores de Validación):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": {
    "puntos_por_compra": ["Los puntos por compra no pueden exceder 9999.99"],
    "puntos_por_monto": ["Los puntos por monto no pueden ser negativos"]
  }
}
```

---

### 3. **PUT** `/api/admin/recompensas/{recompensaId}/puntos/{configId}` - Actualizar Configuración Específica

**Descripción:** Actualiza una configuración específica de puntos existente.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Body Request:**
```json
{
  "puntos_por_compra": "number (optional, min:0, max:9999.99)",
  "puntos_por_monto": "number (optional, min:0, max:9999.99)",
  "puntos_registro": "number (optional, min:0, max:9999.99)"
}
```

**Ejemplo de Request:**
```bash
PUT /api/admin/recompensas/1/puntos/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "puntos_por_compra": 20.0,
  "puntos_por_monto": 2.0
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de puntos actualizada exitosamente",
  "data": {
    "id": 2,
    "puntos_por_compra": 20.0,
    "puntos_por_monto": 2.0,
    "puntos_registro": 100.0,
    "configuracion_valida": true,
    "descripcion": "20 puntos por compra + 2 puntos por sol gastado + 100 puntos por registro",
    "resumen": {
      "total_tipos_activos": 3,
      "puntos_maximos_por_compra": 22.0,
      "puntos_por_registro": 100.0
    }
  }
}
```

---

### 4. **DELETE** `/api/admin/recompensas/{recompensaId}/puntos/{configId}` - Eliminar Configuración

**Descripción:** Elimina una configuración específica de puntos.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/1/puntos/2
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de puntos eliminada exitosamente"
}
```

---

### 5. **POST** `/api/admin/recompensas/{recompensaId}/puntos/simular` - Simular Cálculo de Puntos

**Descripción:** Simula el cálculo de puntos basado en la configuración actual y parámetros de prueba.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "monto_compra": "number (required, min:0.01)",
  "cantidad_items": "integer (optional, min:1, default:1)",
  "es_registro": "boolean (optional, default:false)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/1/puntos/simular
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto_compra": 150.50,
  "cantidad_items": 3,
  "es_registro": false
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Simulación de puntos calculada exitosamente",
  "data": {
    "parametros": {
      "monto_compra": 150.50,
      "cantidad_items": 3,
      "es_registro": false
    },
    "configuracion": {
      "puntos_por_compra": 20.0,
      "puntos_por_monto": 2.0,
      "puntos_registro": 100.0
    },
    "resultado": {
      "puntos_por_compra_fija": 20.0,
      "puntos_por_monto_gastado": 301.0,
      "puntos_por_registro": 0.0,
      "total_puntos": 321.0
    },
    "descripcion": {
      "compra_fija": "20 puntos por realizar la compra",
      "monto_gastado": "2 puntos por cada sol gastado",
      "registro": "Sin puntos por registro"
    }
  }
}
```

**Ejemplo de Request (Con Registro):**
```bash
POST /api/admin/recompensas/1/puntos/simular
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto_compra": 75.25,
  "cantidad_items": 1,
  "es_registro": true
}
```

**Ejemplo of Response (Con Registro):**
```json
{
  "success": true,
  "message": "Simulación de puntos calculada exitosamente",
  "data": {
    "parametros": {
      "monto_compra": 75.25,
      "cantidad_items": 1,
      "es_registro": true
    },
    "configuracion": {
      "puntos_por_compra": 20.0,
      "puntos_por_monto": 2.0,
      "puntos_registro": 100.0
    },
    "resultado": {
      "puntos_por_compra_fija": 20.0,
      "puntos_por_monto_gastado": 150.5,
      "puntos_por_registro": 100.0,
      "total_puntos": 270.5
    },
    "descripcion": {
      "compra_fija": "20 puntos por realizar la compra",
      "monto_gastado": "2 puntos por cada sol gastado",
      "registro": "100 puntos por registro"
    }
  }
}
```

---

### 6. **GET** `/api/admin/recompensas/puntos/ejemplos` - Ejemplos de Configuración

**Descripción:** Obtiene ejemplos predefinidos de configuraciones de puntos para diferentes escenarios.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/puntos/ejemplos
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Ejemplos de configuración obtenidos exitosamente",
  "data": [
    {
      "nombre": "Configuración Básica",
      "descripcion": "Puntos simples por compra",
      "configuracion": {
        "puntos_por_compra": 10,
        "puntos_por_monto": 0,
        "puntos_registro": 50
      },
      "ejemplo_calculo": "10 puntos por cada compra + 50 puntos al registrarse"
    },
    {
      "nombre": "Configuración por Monto",
      "descripcion": "Puntos basados en el monto gastado",
      "configuracion": {
        "puntos_por_compra": 0,
        "puntos_por_monto": 1,
        "puntos_registro": 100
      },
      "ejemplo_calculo": "1 punto por cada sol gastado + 100 puntos al registrarse"
    },
    {
      "nombre": "Configuración Mixta",
      "descripcion": "Combinación de puntos fijos y por monto",
      "configuracion": {
        "puntos_por_compra": 5,
        "puntos_por_monto": 0.5,
        "puntos_registro": 25
      },
      "ejemplo_calculo": "5 puntos por compra + 0.5 puntos por sol + 25 puntos al registrarse"
    },
    {
      "nombre": "Configuración Generosa",
      "descripcion": "Para clientes VIP o promociones especiales",
      "configuracion": {
        "puntos_por_compra": 20,
        "puntos_por_monto": 2,
        "puntos_registro": 200
      },
      "ejemplo_calculo": "20 puntos por compra + 2 puntos por sol + 200 puntos al registrarse"
    }
  ]
}
```

---

### 7. **POST** `/api/admin/recompensas/puntos/validar` - Validar Configuración

**Descripción:** Valida una configuración de puntos sin guardarla, incluyendo recomendaciones.

**Permisos:** `recompensas.ver`

**Body Request:**
```json
{
  "puntos_por_compra": "number (required, min:0, max:9999.99)",
  "puntos_por_monto": "number (required, min:0, max:9999.99)",
  "puntos_registro": "number (required, min:0, max:9999.99)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/puntos/validar
Authorization: Bearer {token}
Content-Type: application/json

{
  "puntos_por_compra": 25.0,
  "puntos_por_monto": 0.5,
  "puntos_registro": 150.0
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "es_valida": true,
    "total_puntos_configurados": 175.5,
    "validaciones": {
      "puntos_por_compra": {
        "valor": 25.0,
        "activo": true,
        "valido": true
      },
      "puntos_por_monto": {
        "valor": 0.5,
        "activo": true,
        "valido": true
      },
      "puntos_registro": {
        "valor": 150.0,
        "activo": true,
        "valido": true
      }
    },
    "recomendaciones": []
  }
}
```

**Ejemplo of Response (Con Recomendaciones):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "es_valida": true,
    "total_puntos_configurados": 125.0,
    "validaciones": {
      "puntos_por_compra": {
        "valor": 150.0,
        "activo": true,
        "valido": true
      },
      "puntos_por_monto": {
        "valor": 0.005,
        "activo": true,
        "valido": true
      },
      "puntos_registro": {
        "valor": 0.0,
        "activo": false,
        "valido": true
      }
    },
    "recomendaciones": [
      "Los puntos por compra muy altos pueden afectar la rentabilidad",
      "Los puntos por monto muy bajos pueden no ser atractivos para los clientes"
    ]
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Configurador de Puntos**

```typescript
interface ConfiguradorPuntosProps {
  recompensa: Recompensa;
  configuracion?: ConfiguracionPuntos;
  onConfiguracionGuardada: (configuracion: ConfiguracionPuntos) => void;
  onSimular: (parametros: ParametrosSimulacion) => void;
}

interface ConfiguracionPuntos {
  id?: number;
  puntos_por_compra: number;
  puntos_por_monto: number;
  puntos_registro: number;
  configuracion_valida: boolean;
  descripcion: string;
  resumen: ResumenConfiguracion;
}

interface ResumenConfiguracion {
  total_tipos_activos: number;
  puntos_maximos_por_compra: number;
  puntos_por_registro: number;
}
```

**Características:**
- Formulario con tres campos de configuración
- Validación en tiempo real
- Indicadores visuales de configuración válida
- Botones para guardar y simular
- Resumen de la configuración

### 2. **Simulador de Puntos**

```typescript
interface SimuladorPuntosProps {
  configuracion: ConfiguracionPuntos;
  resultado?: ResultadoSimulacion;
  onSimular: (parametros: ParametrosSimulacion) => void;
  isLoading: boolean;
}

interface ParametrosSimulacion {
  monto_compra: number;
  cantidad_items: number;
  es_registro: boolean;
}

interface ResultadoSimulacion {
  parametros: ParametrosSimulacion;
  configuracion: ConfiguracionPuntos;
  resultado: {
    puntos_por_compra_fija: number;
    puntos_por_monto_gastado: number;
    puntos_por_registro: number;
    total_puntos: number;
  };
  descripcion: {
    compra_fija: string;
    monto_gastado: string;
    registro: string;
  };
}
```

**Características:**
- Formulario de parámetros de simulación
- Cálculo en tiempo real
- Desglose detallado de puntos
- Descripciones legibles de cada tipo
- Ejemplos de diferentes escenarios

### 3. **Selector de Ejemplos**

```typescript
interface SelectorEjemplosProps {
  ejemplos: EjemploConfiguracion[];
  onEjemploSeleccionado: (ejemplo: EjemploConfiguracion) => void;
}

interface EjemploConfiguracion {
  nombre: string;
  descripcion: string;
  configuracion: {
    puntos_por_compra: number;
    puntos_por_monto: number;
    puntos_registro: number;
  };
  ejemplo_calculo: string;
}
```

**Características:**
- Lista de ejemplos predefinidos
- Descripción de cada configuración
- Ejemplo de cálculo para cada tipo
- Aplicación rápida de configuración
- Preview de la configuración seleccionada

### 4. **Validador de Configuración**

```typescript
interface ValidadorConfiguracionProps {
  configuracion: ConfiguracionPuntos;
  resultado?: ResultadoValidacion;
  onValidar: (configuracion: ConfiguracionPuntos) => void;
}

interface ResultadoValidacion {
  es_valida: boolean;
  total_puntos_configurados: number;
  validaciones: {
    puntos_por_compra: ValidacionCampo;
    puntos_por_monto: ValidacionCampo;
    puntos_registro: ValidacionCampo;
  };
  recomendaciones: string[];
}

interface ValidacionCampo {
  valor: number;
  activo: boolean;
  valido: boolean;
}
```

**Características:**
- Validación en tiempo real
- Indicadores de estado por campo
- Lista de recomendaciones
- Alertas de configuración inválida
- Sugerencias de mejora

### 5. **Dashboard de Configuración**

```typescript
interface DashboardPuntosProps {
  recompensa: Recompensa;
  configuracion: ConfiguracionPuntos;
  estadisticas?: EstadisticasPuntos;
}

interface EstadisticasPuntos {
  total_puntos_otorgados: number;
  promedio_puntos_por_cliente: number;
  configuracion_mas_usada: string;
  efectividad_configuracion: number;
}
```

**Características:**
- Vista general de la configuración
- Métricas de efectividad
- Historial de cambios
- Comparación con otras configuraciones
- Exportación de reportes

---

## 🔧 Implementación Técnica

### Modelo de Configuración de Puntos

```php
class RecompensaPuntos extends Model
{
    protected $fillable = [
        'recompensa_id', 'puntos_por_compra', 'puntos_por_monto', 'puntos_registro'
    ];

    protected $casts = [
        'puntos_por_compra' => 'decimal:2',
        'puntos_por_monto' => 'decimal:2',
        'puntos_registro' => 'decimal:2'
    ];

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    // Accessors
    public function getOtorgaPuntosPorCompraAttribute(): bool
    {
        return $this->puntos_por_compra > 0;
    }

    public function getOtorgaPuntosPorMontoAttribute(): bool
    {
        return $this->puntos_por_monto > 0;
    }

    public function getOtorgaPuntosPorRegistroAttribute(): bool
    {
        return $this->puntos_registro > 0;
    }

    public function getDescripcionConfiguracionAttribute(): string
    {
        $partes = [];
        
        if ($this->otorga_puntos_por_compra) {
            $partes[] = "{$this->puntos_por_compra} puntos por compra";
        }
        
        if ($this->otorga_puntos_por_monto) {
            if ($this->puntos_por_monto >= 1) {
                $partes[] = "{$this->puntos_por_monto} puntos por cada sol gastado";
            } else {
                $partes[] = "1 punto por cada " . round(1 / $this->puntos_por_monto, 0) . " soles gastados";
            }
        }
        
        if ($this->otorga_puntos_por_registro) {
            $partes[] = "{$this->puntos_registro} puntos por registro";
        }

        return implode(' + ', $partes);
    }

    // Métodos de validación
    public function esConfiguracionValida(): bool
    {
        return $this->puntos_por_compra > 0 || 
               $this->puntos_por_monto > 0 || 
               $this->puntos_registro > 0;
    }

    public function getResumenConfiguracion(): array
    {
        $tiposActivos = 0;
        if ($this->otorga_puntos_por_compra) $tiposActivos++;
        if ($this->otorga_puntos_por_monto) $tiposActivos++;
        if ($this->otorga_puntos_por_registro) $tiposActivos++;

        return [
            'total_tipos_activos' => $tiposActivos,
            'puntos_maximos_por_compra' => $this->puntos_por_compra + $this->puntos_por_monto,
            'puntos_por_registro' => $this->puntos_registro
        ];
    }

    // Métodos de cálculo
    public function calcularPuntosPorCompra(float $monto, int $cantidadItems = 1): float
    {
        $puntosCompra = $this->puntos_por_compra;
        $puntosMonto = $monto * $this->puntos_por_monto;
        
        return $puntosCompra + $puntosMonto;
    }

    public function calcularPuntosPorRegistro(): float
    {
        return $this->puntos_registro;
    }
}
```

### Lógica de Simulación

```php
public function simular(Request $request, $recompensaId): JsonResponse
{
    $configuracion = RecompensaPuntos::where('recompensa_id', $recompensaId)->first();
    
    $montoCompra = $request->monto_compra;
    $cantidadItems = $request->get('cantidad_items', 1);
    $esRegistro = $request->get('es_registro', false);

    // Calcular puntos
    $puntosPorCompra = $configuracion->calcularPuntosPorCompra($montoCompra, $cantidadItems);
    $puntosPorRegistro = $esRegistro ? $configuracion->calcularPuntosPorRegistro() : 0;
    $puntosTotal = $puntosPorCompra + $puntosPorRegistro;

    // Desglose detallado
    $desglose = [
        'puntos_por_compra_fija' => $configuracion->otorga_puntos_por_compra ? $configuracion->puntos_por_compra : 0,
        'puntos_por_monto_gastado' => $configuracion->otorga_puntos_por_monto ? ($montoCompra * $configuracion->puntos_por_monto) : 0,
        'puntos_por_registro' => $puntosPorRegistro,
        'total_puntos' => $puntosTotal
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'parametros' => $request->only(['monto_compra', 'cantidad_items', 'es_registro']),
            'configuracion' => $configuracion->only(['puntos_por_compra', 'puntos_por_monto', 'puntos_registro']),
            'resultado' => $desglose,
            'descripcion' => $this->generarDescripcion($configuracion, $esRegistro)
        ]
    ]);
}
```

### Validación de Configuración

```php
public function validar(Request $request): JsonResponse
{
    $totalPuntos = $request->puntos_por_compra + $request->puntos_por_monto + $request->puntos_registro;
    $esValida = $totalPuntos > 0;

    $validacion = [
        'es_valida' => $esValida,
        'total_puntos_configurados' => $totalPuntos,
        'validaciones' => [
            'puntos_por_compra' => [
                'valor' => $request->puntos_por_compra,
                'activo' => $request->puntos_por_compra > 0,
                'valido' => $request->puntos_por_compra >= 0 && $request->puntos_por_compra <= 9999.99
            ],
            // ... otros campos
        ],
        'recomendaciones' => $this->generarRecomendaciones($request)
    ];

    return response()->json([
        'success' => true,
        'data' => $validacion
    ]);
}

private function generarRecomendaciones(Request $request): array
{
    $recomendaciones = [];
    
    if ($request->puntos_por_monto > 0 && $request->puntos_por_monto < 0.01) {
        $recomendaciones[] = 'Los puntos por monto muy bajos pueden no ser atractivos para los clientes';
    }
    
    if ($request->puntos_por_compra > 100) {
        $recomendaciones[] = 'Los puntos por compra muy altos pueden afectar la rentabilidad';
    }
    
    return $recomendaciones;
}
```

---

## 📊 Métricas y KPIs

### Métricas de Configuración
- **Total de Tipos Activos:** Número de tipos de puntos configurados
- **Puntos Máximos por Compra:** Suma de puntos fijos y por monto
- **Puntos por Registro:** Puntos otorgados al registrarse
- **Configuración Válida:** Si al menos un tipo está activo

### Métricas de Efectividad
- **Puntos Otorgados Total:** Suma de todos los puntos entregados
- **Promedio de Puntos por Cliente:** Puntos promedio por cliente
- **Configuración Más Usada:** Tipo de puntos más efectivo
- **Tasa de Conversión:** % de clientes que usan los puntos

### Métricas de Rentabilidad
- **Costo por Punto:** Costo estimado de cada punto
- **ROI de Puntos:** Retorno de inversión del sistema
- **Valor Promedio de Canje:** Valor promedio de canjes realizados

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Límites:** Límites máximos en puntos para evitar abuso
2. **Validación de Configuración:** Al menos un tipo de puntos debe estar activo
3. **Prevención de Valores Negativos:** No se permiten puntos negativos
4. **Auditoría:** Registro de cambios en configuraciones
5. **Permisos Granulares:** Verificación de permisos en cada operación

---

## 📝 Notas de Implementación

- **Configuración Única:** Solo una configuración por recompensa
- **Reemplazo Automático:** Nueva configuración reemplaza la anterior
- **Validación en Tiempo Real:** Validación inmediata de configuraciones
- **Simulación Precisa:** Cálculos exactos para simulación
- **Ejemplos Predefinidos:** Configuraciones comunes para facilitar setup

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No es de Tipo Puntos:**
   ```json
   {
     "success": false,
     "message": "Esta recompensa no es de tipo puntos"
   }
   ```

2. **Configuración Inválida:**
   ```json
   {
     "success": false,
     "message": "Debe configurar al menos un tipo de puntos mayor a 0"
   }
   ```

3. **Valores Fuera de Rango:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "puntos_por_compra": ["Los puntos por compra no pueden exceder 9999.99"]
     }
   }
   ```

4. **Configuración No Encontrada:**
   ```json
   {
     "success": false,
     "message": "No hay configuración de puntos para esta recompensa"
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
