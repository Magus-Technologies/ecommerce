# 🎯 SUBMÓDULO: Consulta de Recompensas para Clientes

## 📋 Información General

**Ruta Frontend:** `/cliente/recompensas`  
**Prefijo API:** `/api/cliente/recompensas`  
**Permisos Requeridos:** Autenticación de cliente (`cliente` guard)

Este submódulo permite a los clientes autenticados consultar sus recompensas activas, historial de recompensas recibidas, puntos acumulados y detalles específicos de cada recompensa. Es la interfaz del lado del cliente para interactuar con el sistema de recompensas.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/cliente/recompensas/activas` - Recompensas Activas

**Descripción:** Obtiene las recompensas activas y vigentes que aplican al cliente autenticado.

**Autenticación:** `cliente` guard

**Parámetros de Query:**
- `tipo` (string, optional): Filtrar por tipo de recompensa

**Ejemplo de Request:**
```bash
GET /api/cliente/recompensas/activas?tipo=puntos
Authorization: Bearer {cliente_token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Recompensas activas obtenidas exitosamente",
  "data": {
    "cliente": {
      "id": 123,
      "nombre_completo": "Juan Pérez García",
      "segmento_actual": "regular"
    },
    "total_recompensas": 3,
    "recompensas": [
      {
        "id": 1,
        "nombre": "Programa de Fidelidad Q1 2024",
        "descripcion": "Gana puntos por cada compra y canjéalos por descuentos",
        "tipo": "puntos",
        "tipo_nombre": "Sistema de Puntos",
        "fecha_inicio": "2024-01-01T00:00:00.000000Z",
        "fecha_fin": "2024-03-31T23:59:59.000000Z",
        "dias_restantes": 45,
        "configuracion": {
          "tipo": "puntos",
          "descripcion": "10 puntos por compra + 1 punto por sol gastado + 50 puntos por registro",
          "detalles": {
            "total_tipos_activos": 3,
            "puntos_maximos_por_compra": 11.0,
            "puntos_por_registro": 50.0
          }
        },
        "productos_aplicables": [
          {
            "id": 15,
            "nombre": "Mouse Inalámbrico",
            "codigo_producto": "MOU-001",
            "precio_venta": 25.0,
            "imagen_url": "https://tienda.com/storage/productos/mouse.jpg"
          }
        ],
        "como_obtener": {
          "titulo": "¿Cómo ganar puntos?",
          "pasos": [
            "Realiza compras en nuestra tienda",
            "Los puntos se acreditarán automáticamente",
            "Revisa tu historial de puntos en tu perfil"
          ]
        }
      },
      {
        "id": 2,
        "nombre": "Descuento Black Friday 2024",
        "descripcion": "20% de descuento en todas tus compras",
        "tipo": "descuento",
        "tipo_nombre": "Descuento",
        "fecha_inicio": "2024-11-24T00:00:00.000000Z",
        "fecha_fin": "2024-11-30T23:59:59.000000Z",
        "dias_restantes": 2,
        "configuracion": {
          "tipo": "descuento",
          "descripcion": "20% de descuento con compra mínima de S/ 100",
          "detalles": {
            "tipo_descuento": "Porcentaje",
            "valor_descuento": "20%",
            "compra_minima": "S/ 100",
            "es_porcentaje": true
          }
        },
        "productos_aplicables": [],
        "como_obtener": {
          "titulo": "¿Cómo obtener el descuento?",
          "pasos": [
            "Agrega productos aplicables a tu carrito",
            "Asegúrate de que tu compra sea de al menos S/ 100",
            "El descuento se aplicará automáticamente al finalizar la compra"
          ]
        }
      }
    ]
  }
}
```

**Ejemplo of Response (Sin Autenticación):**
```json
{
  "success": false,
  "message": "Cliente no autenticado"
}
```

---

### 2. **GET** `/api/cliente/recompensas/historial` - Historial de Recompensas

**Descripción:** Consulta el historial de recompensas recibidas por el cliente autenticado.

**Autenticación:** `cliente` guard

**Parámetros de Query:**
- `tipo_recompensa` (string, optional): Filtrar por tipo de recompensa
- `fecha_desde` (date, optional): Fecha de inicio del filtro
- `fecha_hasta` (date, optional): Fecha de fin del filtro
- `con_puntos` (boolean, optional): Solo recompensas con puntos
- `order_by` (string, optional, default: fecha_aplicacion): Campo de ordenamiento
- `order_direction` (string, optional, default: desc): Dirección del ordenamiento
- `per_page` (integer, optional, default: 15): Elementos por página

**Ejemplo de Request:**
```bash
GET /api/cliente/recompensas/historial?tipo_recompensa=puntos&per_page=10
Authorization: Bearer {cliente_token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Historial de recompensas obtenido exitosamente",
  "data": {
    "cliente": {
      "id": 123,
      "nombre_completo": "Juan Pérez García"
    },
    "estadisticas": {
      "total_recompensas_recibidas": 25,
      "total_puntos_ganados": 1250,
      "recompensas_este_mes": 5,
      "puntos_este_mes": 300,
      "primera_recompensa": "2023-06-15T10:30:00.000000Z",
      "ultima_recompensa": "2024-02-15T14:20:00.000000Z"
    },
    "historial": {
      "current_page": 1,
      "data": [
        {
          "id": 45,
          "recompensa": {
            "id": 1,
            "nombre": "Programa de Fidelidad Q1 2024",
            "tipo": "puntos",
            "tipo_nombre": "Sistema de Puntos"
          },
          "pedido": {
            "id": 789,
            "codigo": "PED-2024-001",
            "total": 150.0,
            "fecha": "2024-02-15T14:20:00.000000Z"
          },
          "puntos_otorgados": 65,
          "beneficio_aplicado": "65 puntos por compra de S/ 150",
          "fecha_aplicacion": "2024-02-15T14:20:00.000000Z",
          "tiempo_transcurrido": "hace 2 días",
          "descripcion": "Programa de Fidelidad Q1 2024 - 65 puntos otorgados por compra PED-2024-001"
        },
        {
          "id": 44,
          "recompensa": {
            "id": 2,
            "nombre": "Descuento Black Friday 2024",
            "tipo": "descuento",
            "tipo_nombre": "Descuento"
          },
          "pedido": {
            "id": 788,
            "codigo": "PED-2024-002",
            "total": 200.0,
            "fecha": "2024-02-10T16:45:00.000000Z"
          },
          "puntos_otorgados": 0,
          "beneficio_aplicado": "S/ 40 de descuento aplicado",
          "fecha_aplicacion": "2024-02-10T16:45:00.000000Z",
          "tiempo_transcurrido": "hace 1 semana",
          "descripcion": "Descuento Black Friday 2024 - S/ 40 de descuento aplicado en pedido PED-2024-002"
        }
      ],
      "first_page_url": "http://api.tienda.com/api/cliente/recompensas/historial?page=1",
      "from": 1,
      "last_page": 2,
      "last_page_url": "http://api.tienda.com/api/cliente/recompensas/historial?page=2",
      "links": [...],
      "next_page_url": "http://api.tienda.com/api/cliente/recompensas/historial?page=2",
      "path": "http://api.tienda.com/api/cliente/recompensas/historial",
      "per_page": 10,
      "prev_page_url": null,
      "to": 10,
      "total": 25
    }
  }
}
```

---

### 3. **GET** `/api/cliente/recompensas/puntos` - Puntos Acumulados

**Descripción:** Consulta los puntos acumulados del cliente con estadísticas detalladas.

**Autenticación:** `cliente` guard

**Ejemplo de Request:**
```bash
GET /api/cliente/recompensas/puntos
Authorization: Bearer {cliente_token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Puntos acumulados obtenidos exitosamente",
  "data": {
    "puntos_actuales": {
      "total": 1250,
      "este_mes": 300,
      "este_ano": 1250
    },
    "estadisticas": {
      "promedio_mensual": 104.17,
      "proyeccion_anual": 1250,
      "mejor_mes": {
        "mes": "2024-01",
        "mes_nombre": "January 2024",
        "puntos": 450
      },
      "total_transacciones": 25
    },
    "desglose_por_tipo": [
      {
        "tipo": "puntos",
        "tipo_nombre": "Sistema de Puntos",
        "total_puntos": 800,
        "cantidad_recompensas": 15
      },
      {
        "tipo": "descuento",
        "tipo_nombre": "Descuentos",
        "total_puntos": 0,
        "cantidad_recompensas": 5
      },
      {
        "tipo": "envio_gratis",
        "tipo_nombre": "Envío Gratuito",
        "total_puntos": 0,
        "cantidad_recompensas": 3
      },
      {
        "tipo": "regalo",
        "tipo_nombre": "Productos de Regalo",
        "total_puntos": 0,
        "cantidad_recompensas": 2
      }
    ],
    "historial_mensual": [
      {
        "mes": "2023-03",
        "mes_nombre": "March 2023",
        "puntos": 0
      },
      {
        "mes": "2023-04",
        "mes_nombre": "April 2023",
        "puntos": 0
      },
      {
        "mes": "2023-05",
        "mes_nombre": "May 2023",
        "puntos": 0
      },
      {
        "mes": "2023-06",
        "mes_nombre": "June 2023",
        "puntos": 50
      },
      {
        "mes": "2023-07",
        "mes_nombre": "July 2023",
        "puntos": 75
      },
      {
        "mes": "2023-08",
        "mes_nombre": "August 2023",
        "puntos": 100
      },
      {
        "mes": "2023-09",
        "mes_nombre": "September 2023",
        "puntos": 125
      },
      {
        "mes": "2023-10",
        "mes_nombre": "October 2023",
        "puntos": 150
      },
      {
        "mes": "2023-11",
        "mes_nombre": "November 2023",
        "puntos": 200
      },
      {
        "mes": "2023-12",
        "mes_nombre": "December 2023",
        "puntos": 300
      },
      {
        "mes": "2024-01",
        "mes_nombre": "January 2024",
        "puntos": 450
      },
      {
        "mes": "2024-02",
        "mes_nombre": "February 2024",
        "puntos": 300
      }
    ],
    "ultimas_transacciones": [
      {
        "id": 45,
        "puntos": 65,
        "recompensa": "Programa de Fidelidad Q1 2024",
        "tipo_recompensa": "puntos",
        "pedido_codigo": "PED-2024-001",
        "fecha": "2024-02-15T14:20:00.000000Z",
        "tiempo_transcurrido": "hace 2 días"
      },
      {
        "id": 44,
        "puntos": 50,
        "recompensa": "Programa de Fidelidad Q1 2024",
        "tipo_recompensa": "puntos",
        "pedido_codigo": "PED-2024-002",
        "fecha": "2024-02-10T16:45:00.000000Z",
        "tiempo_transcurrido": "hace 1 semana"
      }
    ],
    "cliente_info": {
      "id": 123,
      "nombre_completo": "Juan Pérez García",
      "segmento_actual": "regular",
      "es_cliente_nuevo": false,
      "es_cliente_recurrente": true,
      "es_cliente_vip": false
    }
  }
}
```

---

### 4. **GET** `/api/cliente/recompensas/{recompensaId}` - Detalle de Recompensa

**Descripción:** Obtiene el detalle completo de una recompensa específica para el cliente autenticado.

**Autenticación:** `cliente` guard

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/cliente/recompensas/1
Authorization: Bearer {cliente_token}
```

**Ejemplo of Response:**
```json
{
  "success": true,
  "message": "Detalle de recompensa obtenido exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024",
      "descripcion": "Gana puntos por cada compra y canjéalos por descuentos",
      "tipo": "puntos",
      "tipo_nombre": "Sistema de Puntos",
      "fecha_inicio": "2024-01-01T00:00:00.000000Z",
      "fecha_fin": "2024-03-31T23:59:59.000000Z",
      "dias_restantes": 45,
      "es_vigente": true,
      "ya_recibida": false
    },
    "configuracion": {
      "tipo": "puntos",
      "descripcion": "10 puntos por compra + 1 punto por sol gastado + 50 puntos por registro",
      "detalles": {
        "total_tipos_activos": 3,
        "puntos_maximos_por_compra": 11.0,
        "puntos_por_registro": 50.0
      }
    },
    "productos_aplicables": [
      {
        "id": 15,
        "nombre": "Mouse Inalámbrico",
        "codigo_producto": "MOU-001",
        "precio_venta": 25.0,
        "imagen_url": "https://tienda.com/storage/productos/mouse.jpg"
      },
      {
        "id": 20,
        "nombre": "Cable USB",
        "codigo_producto": "CAB-001",
        "precio_venta": 15.0,
        "imagen_url": "https://tienda.com/storage/productos/cable.jpg"
      }
    ],
    "como_obtener": {
      "titulo": "¿Cómo ganar puntos?",
      "pasos": [
        "Realiza compras en nuestra tienda",
        "Los puntos se acreditarán automáticamente",
        "Revisa tu historial de puntos en tu perfil"
      ]
    },
    "historial_cliente": []
  }
}
```

**Ejemplo of Response (Recompensa No Aplica):**
```json
{
  "success": false,
  "message": "Esta recompensa no aplica para tu perfil de cliente"
}
```

**Ejemplo of Response (Recompensa Ya Recibida):**
```json
{
  "success": true,
  "message": "Detalle de recompensa obtenido exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024",
      "descripcion": "Gana puntos por cada compra y canjéalos por descuentos",
      "tipo": "puntos",
      "tipo_nombre": "Sistema de Puntos",
      "fecha_inicio": "2024-01-01T00:00:00.000000Z",
      "fecha_fin": "2024-03-31T23:59:59.000000Z",
      "dias_restantes": 45,
      "es_vigente": true,
      "ya_recibida": true
    },
    "configuracion": {
      "tipo": "puntos",
      "descripcion": "10 puntos por compra + 1 punto por sol gastado + 50 puntos por registro",
      "detalles": {
        "total_tipos_activos": 3,
        "puntos_maximos_por_compra": 11.0,
        "puntos_por_registro": 50.0
      }
    },
    "productos_aplicables": [...],
    "como_obtener": {...},
    "historial_cliente": [
      {
        "puntos_otorgados": 65,
        "beneficio_aplicado": "65 puntos por compra de S/ 150",
        "fecha_aplicacion": "2024-02-15T14:20:00.000000Z",
        "pedido_codigo": "PED-2024-001"
      }
    ]
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Dashboard de Recompensas**

```typescript
interface DashboardRecompensasProps {
  cliente: Cliente;
  recompensasActivas: RecompensaActiva[];
  estadisticas: EstadisticasCliente;
  onVerDetalle: (recompensaId: number) => void;
}

interface Cliente {
  id: number;
  nombre_completo: string;
  segmento_actual: string;
}

interface RecompensaActiva {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  tipo_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_restantes: number;
  configuracion: ConfiguracionRecompensa;
  productos_aplicables: Producto[];
  como_obtener: InstruccionesRecompensa;
}

interface EstadisticasCliente {
  total_recompensas: number;
  total_puntos: number;
  recompensas_este_mes: number;
  puntos_este_mes: number;
}
```

**Características:**
- Vista general de recompensas activas
- Estadísticas del cliente
- Filtros por tipo de recompensa
- Ordenamiento por días restantes
- Acceso rápido a detalles

### 2. **Lista de Recompensas Activas**

```typescript
interface ListaRecompensasActivasProps {
  recompensas: RecompensaActiva[];
  filtros: FiltrosRecompensas;
  onFiltrosCambiados: (filtros: FiltrosRecompensas) => void;
  onVerDetalle: (recompensaId: number) => void;
  isLoading: boolean;
}

interface FiltrosRecompensas {
  tipo?: string;
  dias_restantes?: number;
  ordenar_por?: 'dias_restantes' | 'fecha_fin' | 'nombre';
}
```

**Características:**
- Lista de recompensas con información resumida
- Filtros por tipo y días restantes
- Ordenamiento personalizable
- Indicadores visuales de urgencia
- Acceso a detalles de cada recompensa

### 3. **Historial de Recompensas**

```typescript
interface HistorialRecompensasProps {
  historial: HistorialRecompensa[];
  estadisticas: EstadisticasHistorial;
  filtros: FiltrosHistorial;
  onFiltrosCambiados: (filtros: FiltrosHistorial) => void;
  paginacion: Paginacion;
  onPaginaCambiada: (pagina: number) => void;
}

interface HistorialRecompensa {
  id: number;
  recompensa: {
    id: number;
    nombre: string;
    tipo: string;
    tipo_nombre: string;
  };
  pedido?: {
    id: number;
    codigo: string;
    total: number;
    fecha: string;
  };
  puntos_otorgados: number;
  beneficio_aplicado: string;
  fecha_aplicacion: string;
  tiempo_transcurrido: string;
  descripcion: string;
}

interface FiltrosHistorial {
  tipo_recompensa?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  con_puntos?: boolean;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}
```

**Características:**
- Lista paginada del historial
- Filtros por tipo, fechas y puntos
- Ordenamiento personalizable
- Estadísticas del historial
- Información detallada de cada recompensa

### 4. **Dashboard de Puntos**

```typescript
interface DashboardPuntosProps {
  puntos: PuntosCliente;
  estadisticas: EstadisticasPuntos;
  historialMensual: HistorialMensual[];
  ultimasTransacciones: TransaccionPuntos[];
  clienteInfo: InfoCliente;
}

interface PuntosCliente {
  total: number;
  este_mes: number;
  este_ano: number;
}

interface EstadisticasPuntos {
  promedio_mensual: number;
  proyeccion_anual: number;
  mejor_mes: {
    mes: string;
    mes_nombre: string;
    puntos: number;
  };
  total_transacciones: number;
}

interface HistorialMensual {
  mes: string;
  mes_nombre: string;
  puntos: number;
}

interface TransaccionPuntos {
  id: number;
  puntos: number;
  recompensa: string;
  tipo_recompensa: string;
  pedido_codigo?: string;
  fecha: string;
  tiempo_transcurrido: string;
}
```

**Características:**
- Resumen de puntos actuales
- Estadísticas y proyecciones
- Gráfico de historial mensual
- Últimas transacciones
- Información del cliente

### 5. **Detalle de Recompensa**

```typescript
interface DetalleRecompensaProps {
  recompensa: DetalleRecompensa;
  configuracion: ConfiguracionRecompensa;
  productosAplicables: Producto[];
  comoObtener: InstruccionesRecompensa;
  historialCliente: HistorialCliente[];
  onVolver: () => void;
}

interface DetalleRecompensa {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  tipo_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_restantes: number;
  es_vigente: boolean;
  ya_recibida: boolean;
}

interface InstruccionesRecompensa {
  titulo: string;
  pasos: string[];
}

interface HistorialCliente {
  puntos_otorgados: number;
  beneficio_aplicado: string;
  fecha_aplicacion: string;
  pedido_codigo?: string;
}
```

**Características:**
- Información completa de la recompensa
- Configuración específica del tipo
- Productos aplicables
- Instrucciones paso a paso
- Historial del cliente con esta recompensa
- Estado de la recompensa

---

## 🔧 Implementación Técnica

### Lógica de Verificación de Aplicabilidad

```php
private function verificarSiAplicaAlCliente(Recompensa $recompensa, UserCliente $cliente): bool
{
    $segmentosRecompensa = $recompensa->clientes;
    
    if ($segmentosRecompensa->isEmpty()) {
        return true; // Si no hay segmentos configurados, aplica a todos
    }

    foreach ($segmentosRecompensa as $segmento) {
        if ($segmento->clienteCumpleSegmento($cliente)) {
            return true;
        }
    }

    return false;
}
```

### Generación de Configuración para Cliente

```php
private function obtenerConfiguracionParaCliente(Recompensa $recompensa): array
{
    $configuracion = [];

    switch ($recompensa->tipo) {
        case Recompensa::TIPO_PUNTOS:
            $puntos = $recompensa->puntos->first();
            if ($puntos) {
                $configuracion = [
                    'tipo' => 'puntos',
                    'descripcion' => $puntos->descripcion_configuracion,
                    'detalles' => $puntos->getResumenConfiguracion()
                ];
            }
            break;

        case Recompensa::TIPO_DESCUENTO:
            $descuento = $recompensa->descuentos->first();
            if ($descuento) {
                $configuracion = [
                    'tipo' => 'descuento',
                    'descripcion' => $descuento->descripcion_descuento,
                    'detalles' => $descuento->getResumenConfiguracion()
                ];
            }
            break;

        case Recompensa::TIPO_ENVIO_GRATIS:
            $envio = $recompensa->envios->first();
            if ($envio) {
                $configuracion = [
                    'tipo' => 'envio_gratis',
                    'descripcion' => $envio->descripcion_envio,
                    'detalles' => $envio->getResumenConfiguracion()
                ];
            }
            break;

        case Recompensa::TIPO_REGALO:
            $regalos = $recompensa->regalos;
            if ($regalos->isNotEmpty()) {
                $configuracion = [
                    'tipo' => 'regalo',
                    'descripcion' => 'Productos de regalo incluidos',
                    'regalos' => $regalos->map(function($regalo) {
                        return [
                            'producto' => $regalo->producto->nombre,
                            'cantidad' => $regalo->cantidad,
                            'valor' => $regalo->valor_total_regalo,
                            'descripcion' => $regalo->descripcion_regalo
                        ];
                    })
                ];
            }
            break;
    }

    return $configuracion;
}
```

### Generación de Instrucciones

```php
private function generarInstruccionesParaCliente(Recompensa $recompensa): array
{
    $instrucciones = [];

    switch ($recompensa->tipo) {
        case Recompensa::TIPO_PUNTOS:
            $instrucciones = [
                'titulo' => '¿Cómo ganar puntos?',
                'pasos' => [
                    'Realiza compras en nuestra tienda',
                    'Los puntos se acreditarán automáticamente',
                    'Revisa tu historial de puntos en tu perfil'
                ]
            ];
            break;

        case Recompensa::TIPO_DESCUENTO:
            $descuento = $recompensa->descuentos->first();
            $instrucciones = [
                'titulo' => '¿Cómo obtener el descuento?',
                'pasos' => [
                    'Agrega productos aplicables a tu carrito',
                    $descuento && $descuento->tiene_compra_minima ? 
                        "Asegúrate de que tu compra sea de al menos S/ {$descuento->compra_minima}" : 
                        'No hay monto mínimo requerido',
                    'El descuento se aplicará automáticamente al finalizar la compra'
                ]
            ];
            break;

        case Recompensa::TIPO_ENVIO_GRATIS:
            $envio = $recompensa->envios->first();
            $instrucciones = [
                'titulo' => '¿Cómo obtener envío gratis?',
                'pasos' => [
                    $envio && $envio->tiene_monto_minimo ? 
                        "Realiza una compra de al menos S/ {$envio->minimo_compra}" : 
                        'No hay monto mínimo requerido',
                    $envio && $envio->tiene_zonas_especificas ? 
                        'Verifica que tu zona de entrega esté incluida' : 
                        'Aplica para todas las zonas de entrega',
                    'El envío gratis se aplicará automáticamente'
                ]
            ];
            break;

        case Recompensa::TIPO_REGALO:
            $instrucciones = [
                'titulo' => '¿Cómo obtener tu regalo?',
                'pasos' => [
                    'Cumple con los requisitos de la promoción',
                    'Los productos de regalo se agregarán automáticamente',
                    'Revisa tu pedido antes de confirmar la compra'
                ]
            ];
            break;
    }

    return $instrucciones;
}
```

### Historial Mensual Optimizado

```php
private function obtenerHistorialMensualOptimizado($clienteId): array
{
    // Generar fechas de los últimos 12 meses
    $meses = [];
    for ($i = 11; $i >= 0; $i--) {
        $fecha = now()->subMonths($i);
        $meses[$fecha->format('Y-m')] = [
            'mes' => $fecha->format('Y-m'),
            'mes_nombre' => $fecha->format('F Y'),
            'puntos' => 0
        ];
    }

    // Obtener todos los puntos de los últimos 12 meses en una sola consulta
    $inicio12Meses = now()->subMonths(11)->startOfMonth();
    $finMesActual = now()->endOfMonth();

    $puntosObtenidos = RecompensaHistorial::where('cliente_id', $clienteId)
        ->whereBetween('fecha_aplicacion', [$inicio12Meses, $finMesActual])
        ->selectRaw('
            DATE_FORMAT(fecha_aplicacion, "%Y-%m") as mes,
            COALESCE(SUM(puntos_otorgados), 0) as total_puntos
        ')
        ->groupBy('mes')
        ->pluck('total_puntos', 'mes');

    // Combinar con el array de meses (llenando los meses sin datos con 0)
    foreach ($puntosObtenidos as $mes => $puntos) {
        if (isset($meses[$mes])) {
            $meses[$mes]['puntos'] = (int) $puntos;
        }
    }

    return array_values($meses);
}
```

---

## 📊 Métricas y KPIs

### Métricas del Cliente
- **Total de Recompensas Recibidas:** Número total de recompensas obtenidas
- **Total de Puntos Ganados:** Suma de todos los puntos acumulados
- **Recompensas Este Mes:** Número de recompensas recibidas en el mes actual
- **Puntos Este Mes:** Puntos ganados en el mes actual
- **Primera Recompensa:** Fecha de la primera recompensa recibida
- **Última Recompensa:** Fecha de la última recompensa recibida

### Métricas de Puntos
- **Promedio Mensual:** Promedio de puntos ganados por mes
- **Proyección Anual:** Estimación de puntos para el año completo
- **Mejor Mes:** Mes con mayor cantidad de puntos ganados
- **Total de Transacciones:** Número de transacciones con puntos
- **Desglose por Tipo:** Distribución de puntos por tipo de recompensa

### Métricas de Segmentación
- **Segmento Actual:** Segmento del cliente (nuevo, regular, vip)
- **Es Cliente Nuevo:** Si es un cliente nuevo
- **Es Cliente Recurrente:** Si es un cliente recurrente
- **Es Cliente VIP:** Si es un cliente VIP

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación de Cliente:** Verificación obligatoria del guard `cliente`
2. **Filtrado por Cliente:** Solo datos del cliente autenticado
3. **Validación de Aplicabilidad:** Verificación de segmentos y elegibilidad
4. **Límites de Consulta:** Paginación y límites en consultas
5. **Auditoría:** Registro de consultas del cliente

---

## 📝 Notas de Implementación

- **Autenticación Requerida:** Todos los endpoints requieren autenticación de cliente
- **Filtrado Automático:** Solo recompensas que aplican al cliente
- **Optimización de Consultas:** Consultas optimizadas para rendimiento
- **Paginación:** Historial paginado para mejor rendimiento
- **Caché:** Posible implementación de caché para consultas frecuentes
- **Personalización:** Contenido personalizado según el cliente

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Cliente No Autenticado:**
   ```json
   {
     "success": false,
     "message": "Cliente no autenticado"
   }
   ```

2. **Recompensa No Encontrada:**
   ```json
   {
     "success": false,
     "message": "Recompensa no encontrada"
   }
   ```

3. **Recompensa No Aplica:**
   ```json
   {
     "success": false,
     "message": "Esta recompensa no aplica para tu perfil de cliente"
   }
   ```

### Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 401 | Unauthorized | Cliente no autenticado |
| 403 | Forbidden | Recompensa no aplica al cliente |
| 404 | Not Found | Recompensa no encontrada |
| 500 | Internal Server Error | Error interno del servidor |
