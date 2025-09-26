# 🎯 SUBMÓDULO: Configuración de Envíos

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/envios`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/envios`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la configuración detallada del sistema de envío gratuito para recompensas de tipo "envío gratis", incluyendo la definición de montos mínimos, zonas de cobertura, validación de aplicabilidad y estadísticas de cobertura geográfica.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/envios` - Ver Configuración

**Descripción:** Obtiene la configuración actual de envíos para una recompensa específica.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/3/envios
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Configuración de envíos obtenida exitosamente",
  "data": {
    "recompensa": {
      "id": 3,
      "nombre": "Envío Gratis Nacional",
      "tipo": "envio_gratis"
    },
    "configuraciones": [
      {
        "id": 1,
        "minimo_compra": 150.0,
        "tiene_monto_minimo": true,
        "zonas_aplicables": ["150101", "150102", "150103"],
        "codigos_zona": ["150101", "150102", "150103"],
        "cantidad_zonas": 3,
        "aplica_todas_zonas": false,
        "configuracion_valida": true,
        "descripcion": "Envío gratuito con compra mínima de S/ 150 en 3 zonas específicas",
        "informacion_zonas": [
          {
            "codigo": "150101",
            "nombre": "Lima - Lima - Lima"
          },
          {
            "codigo": "150102",
            "nombre": "Lima - Lima - Ancón"
          },
          {
            "codigo": "150103",
            "nombre": "Lima - Lima - Ate"
          }
        ],
        "resumen": {
          "tipo_recompensa": "Envío Gratuito",
          "monto_minimo": "S/ 150",
          "cobertura": "3 zonas específicas",
          "aplica_todas_zonas": false
        }
      }
    ]
  }
}
```

**Ejemplo de Response (Recompensa No es de Tipo Envío Gratis):**
```json
{
  "success": false,
  "message": "Esta recompensa no es de tipo envío gratis"
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/envios` - Crear Configuración

**Descripción:** Crea una nueva configuración de envío para una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "minimo_compra": "number (optional, min:0, default:0)",
  "zonas_aplicables": "array (optional) of strings (exists:ubigeo_inei,id_ubigeo)"
}
```

**Ejemplo de Request (Con Zonas Específicas):**
```bash
POST /api/admin/recompensas/3/envios
Authorization: Bearer {token}
Content-Type: application/json

{
  "minimo_compra": 200.0,
  "zonas_aplicables": ["150101", "150102", "150103", "150104"]
}
```

**Ejemplo of Response (201):**
```json
{
  "success": true,
  "message": "Configuración de envío creada exitosamente",
  "data": {
    "id": 2,
    "minimo_compra": 200.0,
    "tiene_monto_minimo": true,
    "zonas_aplicables": ["150101", "150102", "150103", "150104"],
    "codigos_zona": ["150101", "150102", "150103", "150104"],
    "cantidad_zonas": 4,
    "aplica_todas_zonas": false,
    "configuracion_valida": true,
    "descripcion": "Envío gratuito con compra mínima de S/ 200 en 4 zonas específicas",
    "informacion_zonas": [
      {
        "codigo": "150101",
        "nombre": "Lima - Lima - Lima"
      },
      {
        "codigo": "150102",
        "nombre": "Lima - Lima - Ancón"
      },
      {
        "codigo": "150103",
        "nombre": "Lima - Lima - Ate"
      },
      {
        "codigo": "150104",
        "nombre": "Lima - Lima - Barranco"
      }
    ],
    "resumen": {
      "tipo_recompensa": "Envío Gratuito",
      "monto_minimo": "S/ 200",
      "cobertura": "4 zonas específicas",
      "aplica_todas_zonas": false
    }
  }
}
```

**Ejemplo de Request (Sin Zonas - Todas las Zonas):**
```bash
POST /api/admin/recompensas/3/envios
Authorization: Bearer {token}
Content-Type: application/json

{
  "minimo_compra": 100.0
}
```

**Ejemplo of Response (201 - Todas las Zonas):**
```json
{
  "success": true,
  "message": "Configuración de envío creada exitosamente",
  "data": {
    "id": 3,
    "minimo_compra": 100.0,
    "tiene_monto_minimo": true,
    "zonas_aplicables": null,
    "codigos_zona": [],
    "cantidad_zonas": 0,
    "aplica_todas_zonas": true,
    "configuracion_valida": true,
    "descripcion": "Envío gratuito con compra mínima de S/ 100 en todas las zonas",
    "informacion_zonas": [],
    "resumen": {
      "tipo_recompensa": "Envío Gratuito",
      "monto_minimo": "S/ 100",
      "cobertura": "Todas las zonas",
      "aplica_todas_zonas": true
    }
  }
}
```

**Ejemplo of Response (422 - Ya Existe Configuración):**
```json
{
  "success": false,
  "message": "Ya existe una configuración de envío para esta recompensa. Use el método de actualización."
}
```

---

### 3. **PUT** `/api/admin/recompensas/{recompensaId}/envios/{configId}` - Actualizar Configuración

**Descripción:** Actualiza una configuración específica de envío existente.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Body Request:**
```json
{
  "minimo_compra": "number (optional, min:0)",
  "zonas_aplicables": "array (optional) of strings (exists:ubigeo_inei,id_ubigeo)"
}
```

**Ejemplo de Request:**
```bash
PUT /api/admin/recompensas/3/envios/2
Authorization: Bearer {token}
Content-Type: application/json

{
  "minimo_compra": 250.0,
  "zonas_aplicables": ["150101", "150102", "150103", "150104", "150105"]
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de envío actualizada exitosamente",
  "data": {
    "id": 2,
    "minimo_compra": 250.0,
    "tiene_monto_minimo": true,
    "zonas_aplicables": ["150101", "150102", "150103", "150104", "150105"],
    "codigos_zona": ["150101", "150102", "150103", "150104", "150105"],
    "cantidad_zonas": 5,
    "aplica_todas_zonas": false,
    "configuracion_valida": true,
    "descripcion": "Envío gratuito con compra mínima de S/ 250 en 5 zonas específicas",
    "informacion_zonas": [
      {
        "codigo": "150101",
        "nombre": "Lima - Lima - Lima"
      },
      {
        "codigo": "150102",
        "nombre": "Lima - Lima - Ancón"
      },
      {
        "codigo": "150103",
        "nombre": "Lima - Lima - Ate"
      },
      {
        "codigo": "150104",
        "nombre": "Lima - Lima - Barranco"
      },
      {
        "codigo": "150105",
        "nombre": "Lima - Lima - Breña"
      }
    ],
    "resumen": {
      "tipo_recompensa": "Envío Gratuito",
      "monto_minimo": "S/ 250",
      "cobertura": "5 zonas específicas",
      "aplica_todas_zonas": false
    }
  }
}
```

---

### 4. **DELETE** `/api/admin/recompensas/{recompensaId}/envios/{configId}` - Eliminar Configuración

**Descripción:** Elimina una configuración específica de envío.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `configId` (integer, required): ID de la configuración

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/3/envios/2
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Configuración de envío eliminada exitosamente"
}
```

---

### 5. **POST** `/api/admin/recompensas/{recompensaId}/envios/validar` - Validar Aplicabilidad

**Descripción:** Valida si un envío gratuito aplica para un monto y zona específicos.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "monto_compra": "number (required, min:0.01)",
  "codigo_zona": "string (optional, exists:ubigeo_inei,id_ubigeo)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/3/envios/validar
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto_compra": 300.0,
  "codigo_zona": "150101"
}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Validación de envío gratuito completada exitosamente",
  "data": {
    "aplica_envio_gratuito": true,
    "parametros": {
      "monto_compra": 300.0,
      "codigo_zona": "150101",
      "zona_info": {
        "codigo": "150101",
        "nombre": "Lima - Lima - Lima"
      }
    },
    "validaciones": {
      "cumple_monto_minimo": {
        "resultado": true,
        "requerido": 250.0,
        "mensaje": "Cumple con el monto mínimo"
      },
      "incluye_zona": {
        "resultado": true,
        "aplica_todas_zonas": false,
        "mensaje": "La zona está incluida en el envío gratuito"
      }
    },
    "configuracion": {
      "minimo_compra": 250.0,
      "tiene_monto_minimo": true,
      "aplica_todas_zonas": false,
      "cantidad_zonas_configuradas": 5,
      "descripcion": "Envío gratuito con compra mínima de S/ 250 en 5 zonas específicas"
    }
  }
}
```

**Ejemplo of Response (No Cumple Mínimo):**
```json
{
  "success": true,
  "message": "Validación de envío gratuito completada exitosamente",
  "data": {
    "aplica_envio_gratuito": false,
    "parametros": {
      "monto_compra": 150.0,
      "codigo_zona": "150101",
      "zona_info": {
        "codigo": "150101",
        "nombre": "Lima - Lima - Lima"
      }
    },
    "validaciones": {
      "cumple_monto_minimo": {
        "resultado": false,
        "requerido": 250.0,
        "mensaje": "Requiere compra mínima de S/ 250"
      },
      "incluye_zona": {
        "resultado": true,
        "aplica_todas_zonas": false,
        "mensaje": "La zona está incluida en el envío gratuito"
      }
    },
    "configuracion": {
      "minimo_compra": 250.0,
      "tiene_monto_minimo": true,
      "aplica_todas_zonas": false,
      "cantidad_zonas_configuradas": 5,
      "descripcion": "Envío gratuito con compra mínima de S/ 250 en 5 zonas específicas"
    }
  }
}
```

**Ejemplo of Response (Zona No Incluida):**
```json
{
  "success": true,
  "message": "Validación de envío gratuito completada exitosamente",
  "data": {
    "aplica_envio_gratuito": false,
    "parametros": {
      "monto_compra": 300.0,
      "codigo_zona": "080101",
      "zona_info": {
        "codigo": "080101",
        "nombre": "Cusco - Cusco - Cusco"
      }
    },
    "validaciones": {
      "cumple_monto_minimo": {
        "resultado": true,
        "requerido": 250.0,
        "mensaje": "Cumple con el monto mínimo"
      },
      "incluye_zona": {
        "resultado": false,
        "aplica_todas_zonas": false,
        "mensaje": "La zona no está incluida en el envío gratuito"
      }
    },
    "configuracion": {
      "minimo_compra": 250.0,
      "tiene_monto_minimo": true,
      "aplica_todas_zonas": false,
      "cantidad_zonas_configuradas": 5,
      "descripcion": "Envío gratuito con compra mínima de S/ 250 en 5 zonas específicas"
    }
  }
}
```

---

### 6. **GET** `/api/admin/recompensas/envios/zonas` - Buscar Zonas

**Descripción:** Busca zonas (ubigeo) disponibles para configuración con filtros opcionales.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
- `buscar` (string, optional, min:2): Término de búsqueda por nombre
- `limite` (integer, optional, min:1, max:100, default:50): Límite de resultados
- `departamento` (string, optional, size:2): Código de departamento
- `provincia` (string, optional, size:2): Código de provincia

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/envios/zonas?buscar=Lima&limite=10
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Zonas encontradas exitosamente",
  "data": [
    {
      "codigo": "150101",
      "nombre": "Lima - Lima - Lima",
      "departamento": "15",
      "provincia": "01",
      "distrito": "01",
      "nombre_completo": "Lima - Lima - Lima"
    },
    {
      "codigo": "150102",
      "nombre": "Lima - Lima - Ancón",
      "departamento": "15",
      "provincia": "01",
      "distrito": "02",
      "nombre_completo": "Lima - Lima - Ancón"
    },
    {
      "codigo": "150103",
      "nombre": "Lima - Lima - Ate",
      "departamento": "15",
      "provincia": "01",
      "distrito": "03",
      "nombre_completo": "Lima - Lima - Ate"
    }
  ]
}
```

**Ejemplo de Request (Por Departamento):**
```bash
GET /api/admin/recompensas/envios/zonas?departamento=15&limite=20
Authorization: Bearer {token}
```

**Ejemplo of Response (Por Departamento):**
```json
{
  "success": true,
  "message": "Zonas encontradas exitosamente",
  "data": [
    {
      "codigo": "150101",
      "nombre": "Lima - Lima - Lima",
      "departamento": "15",
      "provincia": "01",
      "distrito": "01",
      "nombre_completo": "Lima - Lima - Lima"
    },
    {
      "codigo": "150102",
      "nombre": "Lima - Lima - Ancón",
      "departamento": "15",
      "provincia": "01",
      "distrito": "02",
      "nombre_completo": "Lima - Lima - Ancón"
    }
  ]
}
```

---

### 7. **GET** `/api/admin/recompensas/envios/departamentos` - Departamentos Disponibles

**Descripción:** Obtiene la lista de departamentos disponibles para filtrado.

**Permisos:** `recompensas.ver`

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/envios/departamentos
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Departamentos obtenidos exitosamente",
  "data": [
    {
      "codigo": "01",
      "nombre": "Amazonas"
    },
    {
      "codigo": "02",
      "nombre": "Áncash"
    },
    {
      "codigo": "03",
      "nombre": "Apurímac"
    },
    {
      "codigo": "04",
      "nombre": "Arequipa"
    },
    {
      "codigo": "05",
      "nombre": "Ayacucho"
    },
    {
      "codigo": "06",
      "nombre": "Cajamarca"
    },
    {
      "codigo": "07",
      "nombre": "Callao"
    },
    {
      "codigo": "08",
      "nombre": "Cusco"
    },
    {
      "codigo": "09",
      "nombre": "Huancavelica"
    },
    {
      "codigo": "10",
      "nombre": "Huánuco"
    },
    {
      "codigo": "11",
      "nombre": "Ica"
    },
    {
      "codigo": "12",
      "nombre": "Junín"
    },
    {
      "codigo": "13",
      "nombre": "La Libertad"
    },
    {
      "codigo": "14",
      "nombre": "Lambayeque"
    },
    {
      "codigo": "15",
      "nombre": "Lima"
    },
    {
      "codigo": "16",
      "nombre": "Loreto"
    },
    {
      "codigo": "17",
      "nombre": "Madre de Dios"
    },
    {
      "codigo": "18",
      "nombre": "Moquegua"
    },
    {
      "codigo": "19",
      "nombre": "Pasco"
    },
    {
      "codigo": "20",
      "nombre": "Piura"
    },
    {
      "codigo": "21",
      "nombre": "Puno"
    },
    {
      "codigo": "22",
      "nombre": "San Martín"
    },
    {
      "codigo": "23",
      "nombre": "Tacna"
    },
    {
      "codigo": "24",
      "nombre": "Tumbes"
    },
    {
      "codigo": "25",
      "nombre": "Ucayali"
    }
  ]
}
```

---

### 8. **GET** `/api/admin/recompensas/{recompensaId}/envios/estadisticas` - Estadísticas de Cobertura

**Descripción:** Obtiene estadísticas de cobertura geográfica de la configuración de envío.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/3/envios/estadisticas
Authorization: Bearer {token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Estadísticas de cobertura obtenidas exitosamente",
  "data": {
    "cobertura": {
      "aplica_todas_zonas": false,
      "zonas_configuradas": 5,
      "total_zonas_disponibles": 1874,
      "porcentaje_cobertura": 0.27
    },
    "configuracion": {
      "minimo_compra": 250.0,
      "tiene_monto_minimo": true,
      "descripcion": "Envío gratuito con compra mínima de S/ 250 en 5 zonas específicas"
    },
    "informacion_zonas": [
      {
        "codigo": "150101",
        "nombre": "Lima - Lima - Lima"
      },
      {
        "codigo": "150102",
        "nombre": "Lima - Lima - Ancón"
      },
      {
        "codigo": "150103",
        "nombre": "Lima - Lima - Ate"
      },
      {
        "codigo": "150104",
        "nombre": "Lima - Lima - Barranco"
      },
      {
        "codigo": "150105",
        "nombre": "Lima - Lima - Breña"
      }
    ]
  }
}
```

**Ejemplo of Response (Todas las Zonas):**
```json
{
  "success": true,
  "message": "Estadísticas de cobertura obtenidas exitosamente",
  "data": {
    "cobertura": {
      "aplica_todas_zonas": true,
      "zonas_configuradas": 0,
      "total_zonas_disponibles": 1874,
      "porcentaje_cobertura": 100.0
    },
    "configuracion": {
      "minimo_compra": 100.0,
      "tiene_monto_minimo": true,
      "descripcion": "Envío gratuito con compra mínima de S/ 100 en todas las zonas"
    },
    "informacion_zonas": []
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Configurador de Envíos**

```typescript
interface ConfiguradorEnviosProps {
  recompensa: Recompensa;
  configuracion?: ConfiguracionEnvio;
  onConfiguracionGuardada: (configuracion: ConfiguracionEnvio) => void;
  onValidar: (parametros: ParametrosValidacion) => void;
}

interface ConfiguracionEnvio {
  id?: number;
  minimo_compra: number;
  tiene_monto_minimo: boolean;
  zonas_aplicables?: string[];
  codigos_zona: string[];
  cantidad_zonas: number;
  aplica_todas_zonas: boolean;
  configuracion_valida: boolean;
  descripcion: string;
  informacion_zonas: InformacionZona[];
  resumen: ResumenConfiguracion;
}

interface InformacionZona {
  codigo: string;
  nombre: string;
}

interface ResumenConfiguracion {
  tipo_recompensa: string;
  monto_minimo: string;
  cobertura: string;
  aplica_todas_zonas: boolean;
}
```

**Características:**
- Campo de monto mínimo opcional
- Selector de zonas con búsqueda
- Toggle para todas las zonas
- Validación en tiempo real
- Descripción automática de la configuración
- Botones para guardar y validar

### 2. **Selector de Zonas**

```typescript
interface SelectorZonasProps {
  zonasSeleccionadas: string[];
  onZonasCambiadas: (zonas: string[]) => void;
  onBuscarZonas: (filtros: FiltrosBusqueda) => void;
  zonasDisponibles: Zona[];
  isLoading: boolean;
}

interface FiltrosBusqueda {
  buscar?: string;
  departamento?: string;
  provincia?: string;
  limite?: number;
}

interface Zona {
  codigo: string;
  nombre: string;
  departamento: string;
  provincia: string;
  distrito: string;
  nombre_completo: string;
}
```

**Características:**
- Búsqueda por nombre de zona
- Filtros por departamento y provincia
- Selección múltiple de zonas
- Lista de zonas disponibles
- Indicador de zonas seleccionadas
- Búsqueda en tiempo real

### 3. **Validador de Envío**

```typescript
interface ValidadorEnvioProps {
  configuracion: ConfiguracionEnvio;
  resultado?: ResultadoValidacion;
  onValidar: (parametros: ParametrosValidacion) => void;
  isLoading: boolean;
}

interface ParametrosValidacion {
  monto_compra: number;
  codigo_zona?: string;
}

interface ResultadoValidacion {
  aplica_envio_gratuito: boolean;
  parametros: {
    monto_compra: number;
    codigo_zona?: string;
    zona_info?: InformacionZona;
  };
  validaciones: {
    cumple_monto_minimo: ValidacionDetalle;
    incluye_zona: ValidacionDetalle;
  };
  configuracion: ConfiguracionEnvio;
}

interface ValidacionDetalle {
  resultado: boolean;
  requerido?: number;
  aplica_todas_zonas?: boolean;
  mensaje: string;
}
```

**Características:**
- Formulario de validación con monto y zona
- Resultado detallado de validación
- Indicadores visuales de cumplimiento
- Información de zona seleccionada
- Mensajes descriptivos de validación
- Historial de validaciones

### 4. **Dashboard de Cobertura**

```typescript
interface DashboardCoberturaProps {
  recompensa: Recompensa;
  configuracion: ConfiguracionEnvio;
  estadisticas?: EstadisticasCobertura;
}

interface EstadisticasCobertura {
  cobertura: {
    aplica_todas_zonas: boolean;
    zonas_configuradas: number;
    total_zonas_disponibles: number;
    porcentaje_cobertura: number;
  };
  configuracion: ConfiguracionEnvio;
  informacion_zonas: InformacionZona[];
}
```

**Características:**
- Métricas de cobertura geográfica
- Porcentaje de cobertura
- Lista de zonas configuradas
- Comparación con total disponible
- Gráficos de cobertura
- Exportación de reportes

### 5. **Buscador de Zonas**

```typescript
interface BuscadorZonasProps {
  onZonasEncontradas: (zonas: Zona[]) => void;
  onBuscar: (filtros: FiltrosBusqueda) => void;
  departamentos: Departamento[];
  isLoading: boolean;
}

interface Departamento {
  codigo: string;
  nombre: string;
}
```

**Características:**
- Búsqueda por nombre de zona
- Filtros por departamento
- Límite de resultados configurable
- Lista de departamentos disponibles
- Búsqueda en tiempo real
- Resultados paginados

---

## 🔧 Implementación Técnica

### Modelo de Configuración de Envíos

```php
class RecompensaEnvio extends Model
{
    protected $fillable = [
        'recompensa_id', 'minimo_compra', 'zonas_aplicables'
    ];

    protected $casts = [
        'minimo_compra' => 'decimal:2',
        'zonas_aplicables' => 'array'
    ];

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    // Accessors
    public function getTieneMontoMinimoAttribute(): bool
    {
        return $this->minimo_compra > 0;
    }

    public function getCodigosZonaAttribute(): array
    {
        return $this->zonas_aplicables ?? [];
    }

    public function getCantidadZonasAttribute(): int
    {
        return count($this->codigos_zona);
    }

    public function getAplicaTodasZonasAttribute(): bool
    {
        return empty($this->zonas_aplicables);
    }

    public function getDescripcionEnvioAttribute(): string
    {
        $descripcion = 'Envío gratuito';
        
        if ($this->tiene_monto_minimo) {
            $descripcion .= " con compra mínima de S/ {$this->minimo_compra}";
        }

        if ($this->aplica_todas_zonas) {
            $descripcion .= ' en todas las zonas';
        } else {
            $descripcion .= " en {$this->cantidad_zonas} zonas específicas";
        }

        return $descripcion;
    }

    // Métodos de validación
    public function esConfiguracionValida(): bool
    {
        return true; // Siempre válida, solo requiere configuración
    }

    public function getResumenConfiguracion(): array
    {
        return [
            'tipo_recompensa' => 'Envío Gratuito',
            'monto_minimo' => $this->tiene_monto_minimo ? "S/ {$this->minimo_compra}" : 'Sin mínimo',
            'cobertura' => $this->aplica_todas_zonas ? 'Todas las zonas' : "{$this->cantidad_zonas} zonas específicas",
            'aplica_todas_zonas' => $this->aplica_todas_zonas
        ];
    }

    public function getInformacionZonas(): array
    {
        if ($this->aplica_todas_zonas) {
            return [];
        }

        return UbigeoInei::whereIn('id_ubigeo', $this->codigos_zona)
            ->get(['id_ubigeo as codigo', 'nombre'])
            ->toArray();
    }

    // Métodos de validación de aplicabilidad
    public function cumpleMontoMinimo(float $monto): bool
    {
        return !$this->tiene_monto_minimo || $monto >= $this->minimo_compra;
    }

    public function incluyeZona(?string $codigoZona): bool
    {
        if ($this->aplica_todas_zonas) {
            return true;
        }

        if (!$codigoZona) {
            return false;
        }

        return in_array($codigoZona, $this->codigos_zona);
    }

    public function aplicaEnvioGratuito(float $monto, ?string $codigoZona): bool
    {
        return $this->cumpleMontoMinimo($monto) && $this->incluyeZona($codigoZona);
    }
}
```

### Lógica de Validación

```php
public function validar(Request $request, $recompensaId): JsonResponse
{
    $configuracion = RecompensaEnvio::where('recompensa_id', $recompensaId)->first();
    
    $montoCompra = $request->monto_compra;
    $codigoZona = $request->codigo_zona;

    $cumpleMontoMinimo = $configuracion->cumpleMontoMinimo($montoCompra);
    $incluyeZona = $configuracion->incluyeZona($codigoZona);
    $aplicaEnvioGratuito = $configuracion->aplicaEnvioGratuito($montoCompra, $codigoZona);

    // Obtener información de la zona si se proporciona
    $infoZona = null;
    if ($codigoZona) {
        $ubigeo = UbigeoInei::where('id_ubigeo', $codigoZona)->first();
        $infoZona = $ubigeo ? [
            'codigo' => $codigoZona,
            'nombre' => $ubigeo->nombre
        ] : null;
    }

    $validacion = [
        'aplica_envio_gratuito' => $aplicaEnvioGratuito,
        'parametros' => [
            'monto_compra' => $montoCompra,
            'codigo_zona' => $codigoZona,
            'zona_info' => $infoZona
        ],
        'validaciones' => [
            'cumple_monto_minimo' => [
                'resultado' => $cumpleMontoMinimo,
                'requerido' => $configuracion->minimo_compra,
                'mensaje' => $cumpleMontoMinimo ? 
                    'Cumple con el monto mínimo' : 
                    "Requiere compra mínima de S/ {$configuracion->minimo_compra}"
            ],
            'incluye_zona' => [
                'resultado' => $incluyeZona,
                'aplica_todas_zonas' => $configuracion->aplica_todas_zonas,
                'mensaje' => $incluyeZona ? 
                    'La zona está incluida en el envío gratuito' : 
                    'La zona no está incluida en el envío gratuito'
            ]
        ],
        'configuracion' => [
            'minimo_compra' => $configuracion->minimo_compra,
            'tiene_monto_minimo' => $configuracion->tiene_monto_minimo,
            'aplica_todas_zonas' => $configuracion->aplica_todas_zonas,
            'cantidad_zonas_configuradas' => $configuracion->cantidad_zonas,
            'descripcion' => $configuracion->descripcion_envio
        ]
    ];

    return response()->json([
        'success' => true,
        'data' => $validacion
    ]);
}
```

### Búsqueda de Zonas

```php
public function buscarZonas(Request $request): JsonResponse
{
    $buscar = $request->get('buscar', '');
    $limite = $request->get('limite', 50);
    $departamento = $request->departamento;
    $provincia = $request->provincia;

    $query = UbigeoInei::query();

    if (!empty($buscar)) {
        $query->where('nombre', 'like', "%{$buscar}%");
    }

    if ($departamento) {
        $query->where('departamento', $departamento);
    }

    if ($provincia) {
        $query->where('provincia', $provincia);
    }

    $zonas = $query->limit($limite)
        ->get(['id_ubigeo', 'departamento', 'provincia', 'distrito', 'nombre'])
        ->map(function($zona) {
            return [
                'codigo' => $zona->id_ubigeo,
                'nombre' => $zona->nombre,
                'departamento' => $zona->departamento,
                'provincia' => $zona->provincia,
                'distrito' => $zona->distrito,
                'nombre_completo' => $zona->nombre
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $zonas
    ]);
}
```

---

## 📊 Métricas y KPIs

### Métricas de Configuración
- **Monto Mínimo:** Monto mínimo requerido para envío gratuito
- **Zonas Configuradas:** Número de zonas específicas configuradas
- **Cobertura Total:** Si aplica a todas las zonas
- **Configuración Válida:** Si la configuración es coherente

### Métricas de Cobertura
- **Porcentaje de Cobertura:** % de zonas cubiertas vs total disponible
- **Zonas Configuradas:** Número de zonas específicas
- **Total de Zonas:** Total de zonas disponibles en el sistema
- **Cobertura Geográfica:** Distribución por departamentos

### Métricas de Efectividad
- **Validaciones Exitosas:** Número de validaciones que aplican
- **Cumplimiento de Mínimo:** % de validaciones que cumplen monto mínimo
- **Cobertura de Zonas:** % de validaciones en zonas incluidas
- **Tasa de Aplicabilidad:** % de validaciones que resultan en envío gratuito

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Zonas:** Verificación de existencia de códigos de zona
2. **Validación de Montos:** Prevención de montos negativos
3. **Límites de Búsqueda:** Límites en búsquedas de zonas
4. **Auditoría:** Registro de cambios en configuraciones
5. **Permisos Granulares:** Verificación de permisos en cada operación

---

## 📝 Notas de Implementación

- **Configuración Única:** Solo una configuración por recompensa
- **Zonas Opcionales:** Sin zonas = todas las zonas
- **Monto Mínimo Opcional:** Sin monto = sin restricción
- **Validación en Tiempo Real:** Validación inmediata de aplicabilidad
- **Búsqueda Eficiente:** Búsqueda optimizada de zonas
- **Cobertura Geográfica:** Integración con sistema de ubigeo

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No es de Tipo Envío Gratis:**
   ```json
   {
     "success": false,
     "message": "Esta recompensa no es de tipo envío gratis"
   }
   ```

2. **Ya Existe Configuración:**
   ```json
   {
     "success": false,
     "message": "Ya existe una configuración de envío para esta recompensa. Use el método de actualización."
   }
   ```

3. **Zona No Existe:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "zonas_aplicables.0": ["Una o más zonas seleccionadas no existen"]
     }
   }
   ```

4. **Configuración No Encontrada:**
   ```json
   {
     "success": false,
     "message": "No hay configuración de envío para esta recompensa"
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
