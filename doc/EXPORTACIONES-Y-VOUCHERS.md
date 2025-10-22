# 📥 Exportaciones y Vouchers - Guía Completa

## 🎯 Resumen

Se agregaron **2 módulos adicionales**:
1. **Exportaciones** - Descargar reportes en PDF y Excel
2. **Vouchers/Bauchers** - Gestión de comprobantes de pago bancarios

---

## 📊 EXPORTACIONES

### Formatos Disponibles
- ✅ **PDF** - Para imprimir y archivar
- ✅ **Excel (CSV)** - Para análisis en Excel

### Reportes que se pueden exportar

#### 1. Reporte de Caja
```bash
# PDF
GET /api/contabilidad/exportar/caja/{id}/pdf

# Excel
GET /api/contabilidad/exportar/caja/{id}/excel
```

**Incluye:**
- Datos de la caja
- Todas las transacciones del día
- Resumen de ingresos y egresos
- Diferencia de arqueo

#### 2. Kardex de Producto
```bash
# PDF
GET /api/contabilidad/exportar/kardex/{productoId}/pdf?fecha_inicio=2025-01-01&fecha_fin=2025-12-31

# Excel
GET /api/contabilidad/exportar/kardex/{productoId}/excel?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
```

**Incluye:**
- Todos los movimientos del producto
- Entradas y salidas
- Stock y costo promedio
- Valorización

#### 3. Cuentas por Cobrar
```bash
# PDF
GET /api/contabilidad/exportar/cxc/pdf?estado=PENDIENTE

# Excel
GET /api/contabilidad/exportar/cxc/excel?estado=PENDIENTE
```

**Incluye:**
- Listado de todas las cuentas
- Cliente, monto, saldo
- Días vencidos
- Total pendiente

#### 4. Utilidades
```bash
# PDF
GET /api/contabilidad/exportar/utilidades/pdf?fecha_inicio=2025-10-01&fecha_fin=2025-10-31

# Excel
GET /api/contabilidad/exportar/utilidades/excel?fecha_inicio=2025-10-01&fecha_fin=2025-10-31
```

**Incluye:**
- Todas las ventas del período
- Todos los gastos operativos
- Cálculo de utilidad
- Resumen financiero

---

## 💳 VOUCHERS / BAUCHERS

### ¿Qué es un Voucher?

Un **voucher** es el comprobante que genera el banco o pasarela de pago cuando se realiza una transacción. Es diferente a la factura.

**Ejemplo:**
```
Cliente paga S/ 1,500 por transferencia
→ Banco genera voucher con número de operación: 000123456
→ Cliente envía foto del voucher
→ Tú verificas el pago
→ Generas la factura
```

### Tipos de Vouchers

1. **PAGO_CLIENTE** - Cliente te paga
2. **PAGO_PROVEEDOR** - Tú pagas a proveedor
3. **DEPOSITO** - Depósito bancario
4. **TRANSFERENCIA** - Transferencia bancaria
5. **OTRO** - Otros tipos

### Métodos de Pago

- Transferencia bancaria
- Depósito en cuenta
- Yape
- Plin
- Lukita
- Tunki
- POS
- Otros

---

## 🚀 Uso de Vouchers

### 1. Registrar Voucher
```bash
POST /api/contabilidad/vouchers
Content-Type: multipart/form-data

{
  "tipo": "PAGO_CLIENTE",
  "numero_operacion": "000123456",
  "fecha": "2025-10-19",
  "monto": 1500.00,
  "banco": "BCP",
  "metodo_pago": "transferencia",
  "archivo_voucher": [archivo.jpg],
  "cuenta_por_cobrar_id": 15,
  "observaciones": "Pago de factura F001-00123"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "tipo": "PAGO_CLIENTE",
  "numero_operacion": "000123456",
  "fecha": "2025-10-19",
  "monto": 1500.00,
  "estado": "PENDIENTE",
  "archivo_url": "http://localhost/storage/vouchers/1729350000_voucher.jpg"
}
```

### 2. Listar Vouchers
```bash
GET /api/contabilidad/vouchers?estado=PENDIENTE&tipo=PAGO_CLIENTE
```

**Filtros disponibles:**
- `tipo` - Tipo de voucher
- `estado` - PENDIENTE, VERIFICADO, RECHAZADO
- `fecha_inicio` - Desde fecha
- `fecha_fin` - Hasta fecha
- `search` - Buscar por número de operación o banco

### 3. Ver Voucher
```bash
GET /api/contabilidad/vouchers/{id}
```

**Respuesta:**
```json
{
  "id": 1,
  "tipo": "PAGO_CLIENTE",
  "numero_operacion": "000123456",
  "fecha": "2025-10-19",
  "monto": 1500.00,
  "banco": "BCP",
  "metodo_pago": "transferencia",
  "archivo_url": "http://localhost/storage/vouchers/1729350000_voucher.jpg",
  "estado": "PENDIENTE",
  "cuenta_por_cobrar": {
    "id": 15,
    "numero_documento": "F001-00123",
    "cliente": {
      "nombre_completo": "Juan Pérez"
    }
  },
  "user": {
    "name": "Vendedor 1"
  }
}
```

### 4. Verificar Voucher
```bash
POST /api/contabilidad/vouchers/{id}/verificar
{
  "estado": "VERIFICADO",
  "observaciones": "Pago verificado correctamente"
}
```

### 5. Descargar Archivo del Voucher
```bash
GET /api/contabilidad/vouchers/{id}/descargar
```

### 6. Ver Vouchers Pendientes
```bash
GET /api/contabilidad/vouchers/pendientes
```

### 7. Actualizar Voucher
```bash
POST /api/contabilidad/vouchers/{id}
Content-Type: multipart/form-data

{
  "numero_operacion": "000123457",
  "observaciones": "Número corregido",
  "archivo_voucher": [nuevo_archivo.jpg]
}
```

### 8. Eliminar Voucher
```bash
DELETE /api/contabilidad/vouchers/{id}
```

---

## 📋 Flujo Completo con Voucher

### Escenario: Cliente paga al crédito

```bash
# 1. Cliente compra al crédito
POST /api/contabilidad/cuentas-por-cobrar
{
  "cliente_id": 25,
  "numero_documento": "F001-00456",
  "monto_total": 5000.00,
  "fecha_vencimiento": "2025-11-19"
}

# 2. Cliente hace transferencia y envía voucher
POST /api/contabilidad/vouchers
{
  "tipo": "PAGO_CLIENTE",
  "numero_operacion": "BCP-789456",
  "fecha": "2025-10-25",
  "monto": 2000.00,
  "banco": "BCP",
  "metodo_pago": "transferencia",
  "archivo_voucher": [foto_voucher.jpg],
  "cuenta_por_cobrar_id": 1
}

# 3. Contador verifica el voucher
POST /api/contabilidad/vouchers/1/verificar
{
  "estado": "VERIFICADO"
}

# 4. Registrar el pago en CxC
POST /api/contabilidad/cuentas-por-cobrar/1/pago
{
  "monto": 2000.00,
  "fecha_pago": "2025-10-25",
  "metodo_pago": "transferencia",
  "referencia": "BCP-789456"
}
```

---

## 🔐 Permisos

### Exportaciones
```
contabilidad.reportes.ver → Puede exportar todos los reportes
```

### Vouchers
```
contabilidad.vouchers.ver     → Ver vouchers
contabilidad.vouchers.create  → Registrar vouchers
contabilidad.vouchers.edit    → Editar y verificar vouchers
contabilidad.vouchers.delete  → Eliminar vouchers
```

---

## 📁 Almacenamiento de Archivos

### Ubicación
```
storage/app/public/vouchers/
```

### Formatos Permitidos
- JPG, JPEG, PNG (imágenes)
- PDF (documentos)

### Tamaño Máximo
- 5 MB por archivo

### Configuración
```bash
# Crear enlace simbólico (solo una vez)
php artisan storage:link
```

---

## 💡 Casos de Uso

### Caso 1: Cliente paga por Yape
```bash
POST /api/contabilidad/vouchers
{
  "tipo": "PAGO_CLIENTE",
  "numero_operacion": "YPE-20251019-001234",
  "fecha": "2025-10-19",
  "monto": 150.00,
  "metodo_pago": "yape",
  "archivo_voucher": [captura_yape.jpg],
  "venta_id": 123
}
```

### Caso 2: Pago a Proveedor
```bash
POST /api/contabilidad/vouchers
{
  "tipo": "PAGO_PROVEEDOR",
  "numero_operacion": "TRF-456789",
  "fecha": "2025-10-19",
  "monto": 10000.00,
  "banco": "Interbank",
  "metodo_pago": "transferencia",
  "archivo_voucher": [constancia.pdf],
  "cuenta_por_pagar_id": 5
}
```

### Caso 3: Depósito en Cuenta
```bash
POST /api/contabilidad/vouchers
{
  "tipo": "DEPOSITO",
  "numero_operacion": "DEP-123456",
  "fecha": "2025-10-19",
  "monto": 5000.00,
  "banco": "BBVA",
  "cuenta_destino": "0011-0222-0333-4444",
  "metodo_pago": "deposito",
  "archivo_voucher": [boleta_deposito.jpg]
}
```

---

## 📊 Resumen de Endpoints

### Exportaciones (8 endpoints)
```
GET /api/contabilidad/exportar/caja/{id}/pdf
GET /api/contabilidad/exportar/caja/{id}/excel
GET /api/contabilidad/exportar/kardex/{productoId}/pdf
GET /api/contabilidad/exportar/kardex/{productoId}/excel
GET /api/contabilidad/exportar/cxc/pdf
GET /api/contabilidad/exportar/cxc/excel
GET /api/contabilidad/exportar/utilidades/pdf
GET /api/contabilidad/exportar/utilidades/excel
```

### Vouchers (9 endpoints)
```
GET    /api/contabilidad/vouchers
GET    /api/contabilidad/vouchers/pendientes
GET    /api/contabilidad/vouchers/{id}
GET    /api/contabilidad/vouchers/{id}/descargar
POST   /api/contabilidad/vouchers
POST   /api/contabilidad/vouchers/{id}
POST   /api/contabilidad/vouchers/{id}/verificar
DELETE /api/contabilidad/vouchers/{id}
```

**Total nuevo: 17 endpoints**

---

## ✅ Checklist

### Exportaciones
- [x] PDF de caja
- [x] Excel de caja
- [x] PDF de kardex
- [x] Excel de kardex
- [x] PDF de CxC
- [x] Excel de CxC
- [x] PDF de utilidades
- [x] Excel de utilidades

### Vouchers
- [x] Tabla creada
- [x] Modelo creado
- [x] Controlador completo
- [x] Rutas configuradas
- [x] Permisos agregados
- [x] Subida de archivos
- [x] Verificación de vouchers

---

**Implementado:** 19 de Octubre, 2025  
**Estado:** ✅ COMPLETADO

🎉 **¡Ahora puedes exportar reportes y gestionar vouchers!** 🎉
