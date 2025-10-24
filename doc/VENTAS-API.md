# 🛒 API de Ventas y POS

## 📋 Índice
- [Ventas](#ventas)
- [Clientes](#clientes)
- [Series](#series)
- [Flujo POS Completo](#flujo-pos-completo)

---

## 🛒 VENTAS

### Crear Venta
```http
POST /api/ventas
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_id": 1,
  "productos": [
    {
      "producto_id": 10,
      "cantidad": 2,
      "precio_unitario": 100.00,
      "descuento_unitario": 0
    }
  ],
  "descuento_total": 0,
  "metodo_pago": "efectivo",
  "observaciones": "Venta de prueba",
  "requiere_factura": true
}
```

**Métodos de pago válidos:**
- `efectivo`
- `tarjeta_credito`
- `tarjeta_debito`
- `transferencia`
- `yape`
- `plin`
- `credito`

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "data": {
    "venta": {
      "id": 100,
      "codigo_venta": "V-2025-100",
      "fecha_venta": "2025-10-23 10:30:00",
      "cliente_id": 1,
      "subtotal": "169.49",
      "igv": "30.51",
      "descuento_total": "0.00",
      "total": "200.00",
      "estado": "FACTURADO",
      "metodo_pago": "efectivo"
    },
    "comprobante": {
      "id": 50,
      "numero_completo": "B001-6",
      "estado": "ACEPTADO"
    }
  }
}
```

### Listar Ventas
```http
GET /api/ventas?estado=FACTURADO&page=1&per_page=15
Authorization: Bearer {token}
```

**Filtros disponibles:**
- `estado`: `PENDIENTE`, `FACTURADO`, `ANULADO`
- `fecha_inicio`: `YYYY-MM-DD`
- `fecha_fin`: `YYYY-MM-DD`
- `search`: Buscar por código, cliente
- `page`: Número de página
- `per_page`: Registros por página (default: 15)

### Obtener Detalle de Venta
```http
GET /api/ventas/{id}
Authorization: Bearer {token}
```

### Facturar Venta Existente
```http
POST /api/ventas/{id}/facturar
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_datos": {
    "tipo_documento": "6",
    "numero_documento": "20123456789",
    "razon_social": "EMPRESA CLIENTE S.A.C.",
    "direccion": "AV. CLIENTE 456",
    "email": "cliente@empresa.com"
  }
}
```

### Anular Venta
```http
PUT /api/ventas/{id}/anular
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo": "Error en el registro"
}
```

**Nota:** Restaura automáticamente el stock de los productos.

### Descargar PDF
```http
GET /api/ventas/{id}/pdf
Authorization: Bearer {token}
```

**Respuesta:** Archivo PDF (Blob)

### Descargar XML
```http
GET /api/ventas/{id}/xml
Authorization: Bearer {token}
```

**Respuesta:** Archivo XML firmado digitalmente

### Descargar CDR (Constancia SUNAT)
```http
GET /api/ventas/{id}/cdr
Authorization: Bearer {token}
```

**Respuesta:** Archivo ZIP con el CDR

### Enviar por Email
```http
POST /api/ventas/{id}/email
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "cliente@email.com",
  "mensaje": "Adjunto encontrará su comprobante"
}
```

### Reenviar a SUNAT
```http
POST /api/ventas/{id}/reenviar-sunat
Authorization: Bearer {token}
```

### Consultar Estado en SUNAT
```http
POST /api/ventas/{id}/consultar-sunat
Authorization: Bearer {token}
```

### Mis Ventas (Cliente)
```http
GET /api/ventas/mis-ventas
Authorization: Bearer {token}
```

### Crear Venta desde E-commerce
```http
POST /api/ventas/ecommerce
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_id": 1,
  "productos": [...],
  "direccion_entrega": "Av. Principal 123",
  "observaciones": "Entrega programada"
}
```

---

## 👥 CLIENTES

### Listar Clientes
```http
GET /api/clientes?page=1&per_page=15
Authorization: Bearer {token}
```

**Filtros:**
- `documento`: Buscar por número de documento
- `search`: Búsqueda general
- `page`: Número de página
- `per_page`: Registros por página

### Crear Cliente
```http
POST /api/clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_documento": "1",
  "numero_documento": "12345678",
  "razon_social": "JUAN PEREZ GARCIA",
  "nombre_comercial": "JUAN PEREZ",
  "direccion": "AV. PRINCIPAL 123",
  "email": "juan@email.com",
  "telefono": "987654321",
  "activo": true
}
```

**Tipos de documento:**
- `0`: Otros
- `1`: DNI
- `4`: Carnet de extranjería
- `6`: RUC
- `7`: Pasaporte

### Actualizar Cliente
```http
PUT /api/clientes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon_social": "JUAN PEREZ GARCIA ACTUALIZADO",
  "direccion": "NUEVA DIRECCION 456",
  "email": "nuevo@email.com",
  "telefono": "999888777"
}
```

### Buscar Cliente por Documento
```http
GET /api/clientes/buscar-por-documento?numero_documento=12345678
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo_documento": "1",
    "numero_documento": "12345678",
    "razon_social": "JUAN PEREZ GARCIA",
    "direccion": "AV. PRINCIPAL 123",
    "email": "juan@email.com",
    "telefono": "987654321"
  }
}
```

### Obtener Cliente por Tipo y Número
```http
GET /api/clientes/{tipo}/{numero}
Authorization: Bearer {token}
```

**Ejemplo:**
```http
GET /api/clientes/1/12345678
GET /api/clientes/6/20123456789
```

---

## 📝 SERIES

### Listar Series Activas
```http
GET /api/series?estado=activo
Authorization: Bearer {token}
```

### Listar Series por Tipo de Comprobante
```http
GET /api/series?tipo_comprobante=03
Authorization: Bearer {token}
```

**Tipos de comprobante:**
- `01`: Factura
- `03`: Boleta
- `07`: Nota de Crédito
- `08`: Nota de Débito

### Crear Serie
```http
POST /api/series
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_comprobante": "03",
  "serie": "B002",
  "correlativo_inicio": 1,
  "correlativo_fin": 99999999,
  "descripcion": "Boletas sucursal 2",
  "activo": true
}
```

### Actualizar Serie
```http
PATCH /api/series/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "descripcion": "Serie actualizada",
  "activo": false
}
```

### Reservar Correlativo
```http
POST /api/series/reservar-correlativo
Authorization: Bearer {token}
Content-Type: application/json

{
  "serie_id": 1
}
```

### Estadísticas de Series
```http
GET /api/series/estadisticas
Authorization: Bearer {token}
```

---

## 🔄 FLUJO POS COMPLETO

### 1. Inicialización del POS

```typescript
// 1. Cargar series disponibles
GET /api/series?estado=activo

// 2. Cargar productos
GET /api/productos

// 3. Cargar información de empresa
GET /api/empresa-info

// 4. Verificar estado del sistema
GET /api/facturacion/status
```

### 2. Buscar/Crear Cliente

```typescript
// Buscar cliente existente
GET /api/clientes/buscar-por-documento?numero_documento=12345678

// Si no existe y es RUC, validar con SUNAT
GET /api/utilidades/validar-ruc/20123456789

// Crear cliente si no existe
POST /api/clientes
```

### 3. Procesar Venta

**Opción A: Solo guardar venta (Nota de Venta)**
```http
POST /api/ventas
{
  "cliente_id": 1,
  "productos": [...],
  "metodo_pago": "efectivo",
  "requiere_factura": false
}
```

**Opción B: Venta con facturación automática**
```http
POST /api/ventas
{
  "cliente_id": 1,
  "productos": [...],
  "metodo_pago": "efectivo",
  "requiere_factura": true
}
```

**Opción C: Facturar venta existente**
```http
POST /api/ventas/{id}/facturar
{
  "cliente_datos": {...}
}
```

### 4. Acciones Post-Venta

```typescript
// Descargar PDF
GET /api/ventas/{id}/pdf

// Descargar XML
GET /api/ventas/{id}/xml

// Enviar por email
POST /api/ventas/{id}/email

// Consultar en SUNAT
POST /api/ventas/{id}/consultar-sunat
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Venta Rápida (Cliente General)

```bash
# 1. Buscar cliente general (DNI: 00000000)
curl -X GET "http://localhost:8000/api/clientes/buscar-por-documento?numero_documento=00000000" \
  -H "Authorization: Bearer {token}"

# 2. Crear venta con facturación automática
curl -X POST "http://localhost:8000/api/ventas" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "productos": [
      {"producto_id": 10, "cantidad": 1, "precio_unitario": 100}
    ],
    "metodo_pago": "efectivo",
    "requiere_factura": true
  }'

# 3. Descargar PDF
curl -X GET "http://localhost:8000/api/ventas/100/pdf" \
  -H "Authorization: Bearer {token}" \
  --output comprobante.pdf
```

### Ejemplo 2: Venta con Cliente Nuevo (RUC)

```bash
# 1. Validar RUC con SUNAT
curl -X GET "http://localhost:8000/api/utilidades/validar-ruc/20123456789" \
  -H "Authorization: Bearer {token}"

# 2. Crear cliente con datos de SUNAT
curl -X POST "http://localhost:8000/api/clientes" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento": "6",
    "numero_documento": "20123456789",
    "razon_social": "MI EMPRESA S.A.C.",
    "direccion": "AV. PRINCIPAL 123",
    "email": "contacto@miempresa.com"
  }'

# 3. Crear venta
curl -X POST "http://localhost:8000/api/ventas" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 2,
    "productos": [
      {"producto_id": 10, "cantidad": 5, "precio_unitario": 100}
    ],
    "metodo_pago": "transferencia",
    "requiere_factura": true
  }'
```

### Ejemplo 3: Facturar Venta Existente

```bash
# Facturar una venta que fue creada sin comprobante
curl -X POST "http://localhost:8000/api/ventas/99/facturar" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_datos": {
      "tipo_documento": "6",
      "numero_documento": "20123456789",
      "razon_social": "CLIENTE EMPRESA S.A.C.",
      "direccion": "AV. CLIENTE 456",
      "email": "facturacion@cliente.com"
    }
  }'
```

---

## ⚠️ Validaciones Importantes

### Validación de Productos
- La cantidad debe ser mayor a 0
- El precio unitario debe ser mayor a 0
- Debe haber stock disponible

### Validación de Cliente
- El tipo de documento debe ser válido (0, 1, 4, 6, 7)
- DNI debe tener 8 dígitos
- RUC debe tener 11 dígitos y empezar con 10 o 20
- Email debe ser válido (si se proporciona)

### Validación de Comprobantes
- Para Factura (01): Cliente debe tener RUC (tipo_documento = 6)
- Para Boleta (03): Cliente puede tener DNI o RUC
- Serie debe estar activa
- Debe haber correlativos disponibles

---

## 🚨 Manejo de Errores

### Error: Stock Insuficiente
```json
{
  "success": false,
  "error": "Stock insuficiente para el producto 'Laptop HP'",
  "data": {
    "producto_id": 10,
    "stock_disponible": 3,
    "cantidad_solicitada": 5
  }
}
```

### Error: Cliente No Encontrado
```json
{
  "success": false,
  "error": "Cliente no encontrado",
  "codigo": "CLIENTE_NO_ENCONTRADO"
}
```

### Error: Serie No Disponible
```json
{
  "success": false,
  "error": "No hay series disponibles para el tipo de comprobante solicitado",
  "tipo_comprobante": "03"
}
```

### Error SUNAT
```json
{
  "success": false,
  "error": "Error SUNAT: El documento electrónico ya ha sido enviado anteriormente",
  "codigo_sunat": "2324",
  "solucion": "El comprobante ya existe en SUNAT. Verificar el estado del comprobante."
}
```

---

**Última actualización:** 2025-10-23
**Versión:** 2.0.0
