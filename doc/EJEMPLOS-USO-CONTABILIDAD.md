# 💡 Ejemplos de Uso - Módulos de Contabilidad

## 🎯 Casos de Uso Reales

### 1. Flujo Completo de Apertura y Cierre de Caja

```javascript
// 1. Aperturar caja al inicio del día
POST /api/contabilidad/cajas/aperturar
{
  "caja_id": 1,
  "monto_inicial": 500.00,
  "observaciones": "Apertura 19/10/2025"
}

// Respuesta:
{
  "id": 15,
  "caja_id": 1,
  "user_id": 1,
  "tipo": "APERTURA",
  "fecha": "2025-10-19",
  "hora": "08:00:00",
  "monto_inicial": 500.00,
  "estado": "ABIERTA"
}

// 2. Registrar ventas del día
POST /api/contabilidad/cajas/transaccion
{
  "caja_movimiento_id": 15,
  "tipo": "INGRESO",
  "categoria": "VENTA",
  "monto": 150.00,
  "metodo_pago": "efectivo",
  "venta_id": 123,
  "descripcion": "Venta #123"
}

// 3. Registrar un gasto
POST /api/contabilidad/cajas/transaccion
{
  "caja_movimiento_id": 15,
  "tipo": "EGRESO",
  "categoria": "GASTO",
  "monto": 50.00,
  "metodo_pago": "efectivo",
  "descripcion": "Compra de útiles"
}

// 4. Cerrar caja al final del día
POST /api/contabilidad/cajas/15/cerrar
{
  "monto_final": 2450.00,
  "observaciones": "Cierre del día - Todo OK"
}

// Respuesta:
{
  "id": 15,
  "monto_inicial": 500.00,
  "monto_final": 2450.00,
  "monto_sistema": 2450.00,
  "diferencia": 0.00,
  "estado": "CERRADA"
}
```

---

### 2. Gestión de Cuentas por Cobrar

```javascript
// Escenario: Cliente compra al crédito por S/ 5,000

// 1. Crear cuenta por cobrar
POST /api/contabilidad/cuentas-por-cobrar
{
  "cliente_id": 25,
  "numero_documento": "F001-00456",
  "fecha_emision": "2025-10-19",
  "fecha_vencimiento": "2025-11-19",
  "monto_total": 5000.00,
  "dias_credito": 30,
  "venta_id": 789,
  "comprobante_id": 456
}

// 2. Cliente paga primera cuota de S/ 2,000
POST /api/contabilidad/cuentas-por-cobrar/1/pago
{
  "monto": 2000.00,
  "fecha_pago": "2025-10-25",
  "metodo_pago": "transferencia",
  "referencia": "BCP-OP-123456",
  "observaciones": "Primera cuota"
}

// Respuesta:
{
  "id": 1,
  "monto_total": 5000.00,
  "monto_pagado": 2000.00,
  "saldo_pendiente": 3000.00,
  "estado": "PARCIAL"
}

// 3. Cliente paga saldo restante
POST /api/contabilidad/cuentas-por-cobrar/1/pago
{
  "monto": 3000.00,
  "fecha_pago": "2025-11-10",
  "metodo_pago": "transferencia",
  "referencia": "BCP-OP-789012"
}

// Respuesta:
{
  "id": 1,
  "monto_total": 5000.00,
  "monto_pagado": 5000.00,
  "saldo_pendiente": 0.00,
  "estado": "PAGADO"
}

// 4. Ver antigüedad de saldos
GET /api/contabilidad/cuentas-por-cobrar/antiguedad-saldos

// Respuesta:
{
  "detalle": [...],
  "rangos": {
    "0-30": 15000.00,
    "31-60": 8000.00,
    "61-90": 3000.00,
    "91+": 2000.00
  },
  "total_pendiente": 28000.00
}
```

---

### 3. Control de Inventario con Kardex

```javascript
// Escenario: Compra de 50 laptops a S/ 2,000 c/u

// 1. Al registrar la compra, el sistema automáticamente:
// - Crea registro en kardex
// - Actualiza stock
// - Calcula costo promedio

// Stock anterior: 20 unidades a S/ 1,800 c/u
// Compra: 50 unidades a S/ 2,000 c/u
// Nuevo costo promedio: ((20 * 1,800) + (50 * 2,000)) / 70 = S/ 1,942.86

// 2. Ver kardex del producto
GET /api/contabilidad/kardex/producto/15?fecha_inicio=2025-01-01

// Respuesta:
{
  "producto": {
    "id": 15,
    "nombre": "Laptop HP Pavilion",
    "stock": 70
  },
  "movimientos": [
    {
      "fecha": "2025-10-19",
      "tipo_movimiento": "ENTRADA",
      "tipo_operacion": "COMPRA",
      "cantidad": 50,
      "costo_unitario": 2000.00,
      "stock_anterior": 20,
      "stock_actual": 70,
      "costo_promedio": 1942.86
    }
  ],
  "stock_actual": 70,
  "costo_promedio": 1942.86
}

// 3. Hacer ajuste de inventario (encontraron 2 unidades dañadas)
POST /api/contabilidad/kardex/ajuste
{
  "producto_id": 15,
  "cantidad": 2,
  "tipo": "AJUSTE_NEGATIVO",
  "costo_unitario": 1942.86,
  "observaciones": "Unidades dañadas en almacén"
}

// 4. Ver inventario valorizado
GET /api/contabilidad/kardex/inventario-valorizado

// Respuesta:
{
  "inventario": [
    {
      "producto_id": 15,
      "codigo": "LAP-HP-001",
      "nombre": "Laptop HP Pavilion",
      "stock": 68,
      "costo_promedio": 1942.86,
      "valor_total": 132114.48
    },
    ...
  ],
  "total_valorizado": 850000.00
}
```

---

### 4. Gestión de Caja Chica

```javascript
// Escenario: Gastos menores del día

// 1. Crear caja chica
POST /api/contabilidad/caja-chica
{
  "nombre": "Caja Chica Tienda Principal",
  "codigo": "CC-TIENDA-01",
  "fondo_fijo": 1000.00,
  "responsable_id": 5
}

// 2. Registrar gasto de movilidad
POST /api/contabilidad/caja-chica/gasto
{
  "caja_chica_id": 1,
  "fecha": "2025-10-19",
  "monto": 25.00,
  "categoria": "movilidad",
  "descripcion": "Taxi para entrega urgente",
  "comprobante_tipo": "recibo",
  "comprobante_numero": "001-123"
}

// 3. Registrar gasto de útiles
POST /api/contabilidad/caja-chica/gasto
{
  "caja_chica_id": 1,
  "fecha": "2025-10-19",
  "monto": 45.00,
  "categoria": "utiles",
  "descripcion": "Papel bond y lapiceros",
  "comprobante_tipo": "boleta",
  "comprobante_numero": "B001-456"
}

// 4. Reponer fondo cuando se agota
POST /api/contabilidad/caja-chica/1/reposicion
{
  "monto": 500.00
}

// 5. Ver rendición del mes
GET /api/contabilidad/caja-chica/1/rendicion?fecha_inicio=2025-10-01&fecha_fin=2025-10-31

// Respuesta:
{
  "caja": {
    "nombre": "Caja Chica Tienda Principal",
    "fondo_fijo": 1000.00,
    "saldo_actual": 430.00
  },
  "movimientos": [...],
  "resumen": {
    "fondo_fijo": 1000.00,
    "total_gastos": 570.00,
    "total_reposiciones": 0.00,
    "saldo_actual": 430.00
  }
}
```

---

### 5. Proyección de Flujo de Caja

```javascript
// Escenario: Planificar el mes de noviembre

// 1. Registrar ingresos proyectados
POST /api/contabilidad/flujo-caja
{
  "fecha": "2025-11-05",
  "tipo": "INGRESO",
  "concepto": "Cobro cliente ABC SAC",
  "monto_proyectado": 15000.00,
  "categoria": "COBROS"
}

POST /api/contabilidad/flujo-caja
{
  "fecha": "2025-11-15",
  "tipo": "INGRESO",
  "concepto": "Ventas estimadas quincena",
  "monto_proyectado": 50000.00,
  "categoria": "VENTAS"
}

// 2. Registrar egresos proyectados
POST /api/contabilidad/flujo-caja
{
  "fecha": "2025-11-10",
  "tipo": "EGRESO",
  "concepto": "Pago proveedor XYZ",
  "monto_proyectado": 20000.00,
  "categoria": "PAGOS_PROVEEDORES"
}

POST /api/contabilidad/flujo-caja
{
  "fecha": "2025-11-30",
  "tipo": "EGRESO",
  "concepto": "Planilla de sueldos",
  "monto_proyectado": 12000.00,
  "categoria": "SUELDOS",
  "recurrente": true,
  "frecuencia": "mensual"
}

// 3. Cuando se realiza el cobro real
POST /api/contabilidad/flujo-caja/1/registrar-real
{
  "monto_real": 14500.00
}

// 4. Ver proyección del mes
GET /api/contabilidad/flujo-caja/proyeccion-mensual?mes=11&anio=2025

// Respuesta:
{
  "saldo_inicial": 25000.00,
  "flujo": [
    {
      "fecha": "2025-11-05",
      "concepto": "Cobro cliente ABC SAC",
      "tipo": "INGRESO",
      "monto": 14500.00,
      "saldo_acumulado": 39500.00
    },
    {
      "fecha": "2025-11-10",
      "concepto": "Pago proveedor XYZ",
      "tipo": "EGRESO",
      "monto": 20000.00,
      "saldo_acumulado": 19500.00
    },
    ...
  ],
  "saldo_final": 42500.00
}
```

---

### 6. Dashboard Financiero

```javascript
// Ver resumen ejecutivo del negocio
GET /api/contabilidad/reportes/dashboard-financiero

// Respuesta:
{
  "ventas": {
    "hoy": 3500.00,
    "mes": 125000.00
  },
  "cuentas_por_cobrar": {
    "pendiente": 45000.00,
    "vencidas": 8000.00
  },
  "cuentas_por_pagar": {
    "pendiente": 32000.00,
    "vencidas": 5000.00
  },
  "inventario": {
    "valor_total": 850000.00,
    "productos_activos": 245
  }
}
```

---

### 7. Reportes de Rentabilidad

```javascript
// Ver productos más rentables del mes
GET /api/contabilidad/reportes/rentabilidad-productos?fecha_inicio=2025-10-01&fecha_fin=2025-10-31

// Respuesta:
{
  "productos": [
    {
      "producto_id": 15,
      "codigo": "LAP-HP-001",
      "nombre": "Laptop HP Pavilion",
      "cantidad_vendida": 25,
      "total_ventas": 62500.00,
      "costo_promedio": 1942.86,
      "costo_total": 48571.50,
      "utilidad": 13928.50,
      "margen_porcentaje": 22.29
    },
    ...
  ],
  "resumen": {
    "total_ventas": 125000.00,
    "total_costos": 85000.00,
    "utilidad_total": 40000.00
  }
}
```

---

## 🎓 Mejores Prácticas

1. **Apertura de Caja**: Siempre aperturar al inicio del día
2. **Kardex**: Dejar que el sistema lo maneje automáticamente
3. **CxC**: Registrar inmediatamente después de la venta al crédito
4. **CxP**: Registrar al recibir la factura del proveedor
5. **Caja Chica**: Solicitar comprobantes para todos los gastos
6. **Flujo de Caja**: Actualizar proyecciones semanalmente

---

**Última actualización:** 19 de Octubre, 2025
