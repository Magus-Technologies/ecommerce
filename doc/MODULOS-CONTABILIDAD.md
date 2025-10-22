# 📊 Módulos de Contabilidad - Sistema Magus

## 🎯 Resumen

Sistema completo de gestión contable y financiera para ecommerce, implementando:
- ✅ Caja y Tesorería
- ✅ Kardex de Inventario
- ✅ Cuentas por Cobrar (CxC)
- ✅ Cuentas por Pagar (CxP)
- ✅ Caja Chica
- ✅ Flujo de Caja
- ✅ Reportes Financieros

---

## 📦 1. CAJA Y TESORERÍA

### Funcionalidades
- Apertura y cierre de caja diaria
- Registro de ingresos y egresos
- Arqueo de caja
- Múltiples cajas por tienda
- Reporte de caja diaria

### Endpoints

```bash
# Listar cajas
GET /api/contabilidad/cajas

# Crear caja
POST /api/contabilidad/cajas
{
  "nombre": "Caja Principal",
  "codigo": "CAJA-01",
  "tienda_id": 1
}

# Aperturar caja
POST /api/contabilidad/cajas/aperturar
{
  "caja_id": 1,
  "monto_inicial": 500.00,
  "observaciones": "Apertura del día"
}

# Cerrar caja
POST /api/contabilidad/cajas/{id}/cerrar
{
  "monto_final": 2500.00,
  "observaciones": "Cierre del día"
}

# Registrar transacción
POST /api/contabilidad/cajas/transaccion
{
  "caja_movimiento_id": 1,
  "tipo": "INGRESO",
  "categoria": "VENTA",
  "monto": 150.00,
  "metodo_pago": "efectivo",
  "descripcion": "Venta #123"
}

# Reporte de caja
GET /api/contabilidad/cajas/{id}/reporte
```

---

## 📋 2. KARDEX DE INVENTARIO

### Funcionalidades
- Registro automático de movimientos
- Valorización por costo promedio ponderado
- Ajustes de inventario
- Trazabilidad completa
- Inventario valorizado

### Endpoints

```bash
# Ver kardex de producto
GET /api/contabilidad/kardex/producto/{productoId}?fecha_inicio=2025-01-01&fecha_fin=2025-12-31

# Registrar ajuste
POST /api/contabilidad/kardex/ajuste
{
  "producto_id": 1,
  "cantidad": 10,
  "tipo": "AJUSTE_POSITIVO",
  "costo_unitario": 100.00,
  "observaciones": "Ajuste por inventario físico"
}

# Inventario valorizado
GET /api/contabilidad/kardex/inventario-valorizado
```

---

## 💰 3. CUENTAS POR COBRAR (CxC)

### Funcionalidades
- Registro de ventas al crédito
- Control de pagos parciales
- Antigüedad de saldos
- Alertas de vencimiento
- Reporte de cobranza

### Endpoints

```bash
# Listar cuentas por cobrar
GET /api/contabilidad/cuentas-por-cobrar?estado=PENDIENTE&vencidas=true

# Crear cuenta por cobrar
POST /api/contabilidad/cuentas-por-cobrar
{
  "cliente_id": 1,
  "numero_documento": "F001-00123",
  "fecha_emision": "2025-01-15",
  "fecha_vencimiento": "2025-02-15",
  "monto_total": 1500.00,
  "dias_credito": 30
}

# Registrar pago
POST /api/contabilidad/cuentas-por-cobrar/{id}/pago
{
  "monto": 500.00,
  "fecha_pago": "2025-01-20",
  "metodo_pago": "transferencia",
  "referencia": "OP-123456"
}

# Antigüedad de saldos
GET /api/contabilidad/cuentas-por-cobrar/antiguedad-saldos
```

---

## 💳 4. CUENTAS POR PAGAR (CxP)

### Funcionalidades
- Registro de compras al crédito
- Control de pagos a proveedores
- Calendario de pagos
- Antigüedad de deudas

### Endpoints

```bash
# Listar cuentas por pagar
GET /api/contabilidad/cuentas-por-pagar?estado=PENDIENTE

# Crear cuenta por pagar
POST /api/contabilidad/cuentas-por-pagar
{
  "proveedor_id": 1,
  "numero_documento": "001-12345",
  "fecha_emision": "2025-01-10",
  "fecha_vencimiento": "2025-02-10",
  "monto_total": 5000.00,
  "dias_credito": 30
}

# Registrar pago
POST /api/contabilidad/cuentas-por-pagar/{id}/pago
{
  "monto": 2500.00,
  "fecha_pago": "2025-01-25",
  "metodo_pago": "transferencia",
  "referencia": "TRF-789"
}

# Antigüedad de saldos
GET /api/contabilidad/cuentas-por-pagar/antiguedad-saldos
```

---

## 🏪 5. PROVEEDORES

### Endpoints

```bash
# Listar proveedores
GET /api/contabilidad/proveedores?search=nombre&activo=true

# Crear proveedor
POST /api/contabilidad/proveedores
{
  "tipo_documento": "RUC",
  "numero_documento": "20123456789",
  "razon_social": "Proveedor SAC",
  "direccion": "Av. Principal 123",
  "telefono": "987654321",
  "email": "contacto@proveedor.com",
  "dias_credito": 30,
  "limite_credito": 10000.00
}

# Ver proveedor
GET /api/contabilidad/proveedores/{id}

# Actualizar proveedor
PUT /api/contabilidad/proveedores/{id}
```

---

## 💵 6. CAJA CHICA

### Funcionalidades
- Fondo fijo de caja chica
- Registro de gastos menores
- Reposición de fondo
- Rendición de caja chica

### Endpoints

```bash
# Listar cajas chicas
GET /api/contabilidad/caja-chica

# Crear caja chica
POST /api/contabilidad/caja-chica
{
  "nombre": "Caja Chica Oficina",
  "codigo": "CC-001",
  "fondo_fijo": 500.00,
  "responsable_id": 1
}

# Registrar gasto
POST /api/contabilidad/caja-chica/gasto
{
  "caja_chica_id": 1,
  "fecha": "2025-01-15",
  "monto": 50.00,
  "categoria": "movilidad",
  "descripcion": "Taxi para entrega",
  "comprobante_tipo": "boleta",
  "comprobante_numero": "B001-123"
}

# Reposición
POST /api/contabilidad/caja-chica/{id}/reposicion
{
  "monto": 300.00
}

# Rendición
GET /api/contabilidad/caja-chica/{id}/rendicion?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
```

---

## 📈 7. FLUJO DE CAJA

### Funcionalidades
- Proyección de ingresos y egresos
- Registro de montos reales
- Comparación proyectado vs real
- Proyección mensual

### Endpoints

```bash
# Listar proyecciones
GET /api/contabilidad/flujo-caja?fecha_inicio=2025-01-01&fecha_fin=2025-01-31

# Crear proyección
POST /api/contabilidad/flujo-caja
{
  "fecha": "2025-01-20",
  "tipo": "INGRESO",
  "concepto": "Cobro cliente ABC",
  "monto_proyectado": 5000.00,
  "categoria": "COBROS",
  "recurrente": false
}

# Registrar monto real
POST /api/contabilidad/flujo-caja/{id}/registrar-real
{
  "monto_real": 4800.00
}

# Proyección mensual
GET /api/contabilidad/flujo-caja/proyeccion-mensual?mes=1&anio=2025
```

---

## 📊 8. REPORTES CONTABLES

### Endpoints

```bash
# Ventas diarias
GET /api/contabilidad/reportes/ventas-diarias?fecha=2025-01-15

# Ventas mensuales
GET /api/contabilidad/reportes/ventas-mensuales?mes=1&anio=2025

# Productos más vendidos
GET /api/contabilidad/reportes/productos-mas-vendidos?fecha_inicio=2025-01-01&fecha_fin=2025-01-31

# Rentabilidad por producto
GET /api/contabilidad/reportes/rentabilidad-productos?fecha_inicio=2025-01-01&fecha_fin=2025-01-31

# Dashboard financiero
GET /api/contabilidad/reportes/dashboard-financiero
```

---

## 🔄 Integración Automática

### Kardex Automático

El sistema registra automáticamente en kardex cuando:
- Se realiza una compra → Entrada
- Se realiza una venta → Salida
- Se hace una devolución → Entrada/Salida

### Uso del KardexService

```php
use App\Services\KardexService;

$kardexService = new KardexService();

// Al registrar una compra
$kardexService->registrarEntradaCompra($compra, $detalleCompra);

// Al registrar una venta
$kardexService->registrarSalidaVenta($venta, $detalleVenta);

// Al registrar una devolución
$kardexService->registrarDevolucionVenta($venta, $detalleVenta, $cantidad);
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Creadas

1. **cajas** - Puntos de venta
2. **caja_movimientos** - Aperturas y cierres
3. **caja_transacciones** - Ingresos y egresos
4. **kardex** - Movimientos de inventario
5. **cuentas_por_cobrar** - Créditos a clientes
6. **cxc_pagos** - Pagos de clientes
7. **proveedores** - Datos de proveedores
8. **cuentas_por_pagar** - Deudas con proveedores
9. **cxp_pagos** - Pagos a proveedores
10. **caja_chica** - Fondos de caja chica
11. **caja_chica_movimientos** - Gastos y reposiciones
12. **flujo_caja_proyecciones** - Proyecciones financieras

---

## 🚀 Instalación

```bash
# Ejecutar migraciones
php artisan migrate

# Las rutas ya están configuradas en routes/api.php
# Todas requieren autenticación: middleware(['auth:api'])
```

---

## ✅ Checklist de Implementación

- ✅ Migraciones creadas
- ✅ Modelos creados
- ✅ Controladores implementados
- ✅ Rutas configuradas
- ✅ Servicio de Kardex
- ✅ Documentación completa

---

## 📝 Notas Importantes

1. **Todas las rutas requieren autenticación JWT**
2. **El kardex usa costo promedio ponderado**
3. **Las fechas de vencimiento se calculan automáticamente**
4. **Los reportes son en tiempo real**
5. **El sistema actualiza stock automáticamente**

---

**Fecha de implementación:** 19 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completado
