# 🔌 API Guías de Remisión - Endpoints Detallados

## 📋 Información General

**Base URL:** `/api/guias-remision`  
**Autenticación:** Bearer Token (Sanctum)  
**Permisos:** `facturacion.guias` (requerido)

## 🛠️ Endpoints Disponibles

### **1. Listar Guías de Remisión**

```http
GET /api/guias-remision
```

**Parámetros de Query:**
- `estado` (string, opcional): Filtrar por estado
- `fecha_inicio` (date, opcional): Fecha inicio del rango
- `fecha_fin` (date, opcional): Fecha fin del rango
- `cliente_id` (integer, opcional): ID del cliente
- `serie` (string, opcional): Serie de la guía
- `per_page` (integer, opcional): Elementos por página (default: 15)

**Ejemplo de Request:**
```bash
GET /api/guias-remision?estado=ACEPTADO&fecha_inicio=2024-01-01&per_page=20
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "tipo_comprobante": "09",
                "serie": "T001",
                "correlativo": 1,
                "numero_completo": "T001-00000001",
                "fecha_emision": "2024-01-15",
                "fecha_inicio_traslado": "2024-01-15",
                "cliente": {
                    "id": 1,
                    "razon_social": "EMPRESA DE PRUEBAS S.A.C.",
                    "numero_documento": "20000000001"
                },
                "destinatario_razon_social": "DESTINATARIO S.A.C.",
                "peso_total": 10.00,
                "estado": "ACEPTADO",
                "estado_nombre": "Aceptado",
                "created_at": "2024-01-15T10:30:00.000000Z"
            }
        ],
        "total": 1,
        "per_page": 15,
        "last_page": 1
    }
}
```

---

### **2. Crear Guía de Remisión**

```http
POST /api/guias-remision
```

**Body (JSON):**
```json
{
    "cliente_id": 1,
    "destinatario_tipo_documento": "1",
    "destinatario_numero_documento": "12345678",
    "destinatario_razon_social": "DESTINATARIO S.A.C.",
    "destinatario_direccion": "AV. PRINCIPAL 123, LIMA",
    "destinatario_ubigeo": "150101",
    "motivo_traslado": "01",
    "modalidad_traslado": "01",
    "fecha_inicio_traslado": "2024-01-15",
    "peso_total": 10.00,
    "numero_bultos": 1,
    "modo_transporte": "01",
    "numero_placa": "ABC-123",
    "numero_licencia": "LIC123456",
    "conductor_dni": "87654321",
    "conductor_nombres": "JUAN PEREZ GARCIA",
    "punto_partida_ubigeo": "150101",
    "punto_partida_direccion": "AV. ORIGEN 456, LIMA",
    "punto_llegada_ubigeo": "150101",
    "punto_llegada_direccion": "AV. DESTINO 789, LIMA",
    "observaciones": "Mercadería frágil",
    "productos": [
        {
            "producto_id": 1,
            "cantidad": 5.00,
            "peso_unitario": 2.00,
            "observaciones": "Producto frágil"
        },
        {
            "producto_id": 2,
            "cantidad": 3.00,
            "peso_unitario": 1.50,
            "observaciones": "Manejar con cuidado"
        }
    ]
}
```

**Validaciones:**
- `cliente_id`: Requerido, debe existir
- `destinatario_tipo_documento`: Requerido, máximo 1 carácter
- `destinatario_numero_documento`: Requerido, máximo 20 caracteres
- `destinatario_razon_social`: Requerido, máximo 200 caracteres
- `destinatario_direccion`: Requerido, máximo 200 caracteres
- `destinatario_ubigeo`: Requerido, máximo 6 caracteres
- `motivo_traslado`: Requerido, máximo 2 caracteres
- `modalidad_traslado`: Requerido, máximo 2 caracteres
- `fecha_inicio_traslado`: Requerido, formato fecha
- `productos`: Requerido, array con mínimo 1 elemento
- `productos.*.producto_id`: Requerido, debe existir
- `productos.*.cantidad`: Requerido, numérico, mínimo 0.01
- `productos.*.peso_unitario`: Requerido, numérico, mínimo 0.01

**Respuesta Exitosa (201):**
```json
{
    "success": true,
    "message": "Guía de remisión creada exitosamente",
    "data": {
        "id": 1,
        "tipo_comprobante": "09",
        "serie": "T001",
        "correlativo": 1,
        "numero_completo": "T001-00000001",
        "fecha_emision": "2024-01-15",
        "estado": "PENDIENTE",
        "cliente": {
            "id": 1,
            "razon_social": "EMPRESA DE PRUEBAS S.A.C."
        },
        "detalles": [
            {
                "id": 1,
                "item": 1,
                "producto": {
                    "id": 1,
                    "nombre": "PRODUCTO DE PRUEBA",
                    "codigo_producto": "PROD-001"
                },
                "cantidad": 5.00,
                "peso_unitario": 2.00,
                "peso_total": 10.00
            }
        ],
        "created_at": "2024-01-15T10:30:00.000000Z"
    }
}
```

**Respuesta de Error (422):**
```json
{
    "success": false,
    "message": "Datos de validación incorrectos",
    "errors": {
        "cliente_id": ["El campo cliente id es obligatorio."],
        "destinatario_numero_documento": ["El campo destinatario numero documento es obligatorio."]
    }
}
```

---

### **3. Ver Detalle de Guía**

```http
GET /api/guias-remision/{id}
```

**Parámetros:**
- `id` (integer, requerido): ID de la guía de remisión

**Ejemplo de Request:**
```bash
GET /api/guias-remision/1
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "tipo_comprobante": "09",
        "serie": "T001",
        "correlativo": 1,
        "numero_completo": "T001-00000001",
        "fecha_emision": "2024-01-15",
        "fecha_inicio_traslado": "2024-01-15",
        "cliente": {
            "id": 1,
            "tipo_documento": "6",
            "numero_documento": "20000000001",
            "razon_social": "EMPRESA DE PRUEBAS S.A.C.",
            "direccion": "AV. FICTICIA 123, LIMA"
        },
        "destinatario_tipo_documento": "1",
        "destinatario_numero_documento": "12345678",
        "destinatario_razon_social": "DESTINATARIO S.A.C.",
        "destinatario_direccion": "AV. PRINCIPAL 123, LIMA",
        "destinatario_ubigeo": "150101",
        "motivo_traslado": "01",
        "modalidad_traslado": "01",
        "peso_total": 10.00,
        "numero_bultos": 1,
        "modo_transporte": "01",
        "numero_placa": "ABC-123",
        "conductor_dni": "87654321",
        "conductor_nombres": "JUAN PEREZ GARCIA",
        "punto_partida_ubigeo": "150101",
        "punto_partida_direccion": "AV. ORIGEN 456, LIMA",
        "punto_llegada_ubigeo": "150101",
        "punto_llegada_direccion": "AV. DESTINO 789, LIMA",
        "observaciones": "Mercadería frágil",
        "estado": "ACEPTADO",
        "estado_nombre": "Aceptado",
        "xml_firmado": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>...",
        "mensaje_sunat": "La guía ha sido aceptada",
        "codigo_hash": "abc123def456...",
        "fecha_aceptacion": "2024-01-15T10:35:00.000000Z",
        "detalles": [
            {
                "id": 1,
                "item": 1,
                "producto": {
                    "id": 1,
                    "nombre": "PRODUCTO DE PRUEBA",
                    "codigo_producto": "PROD-001",
                    "descripcion": "Producto de prueba para guías"
                },
                "codigo_producto": "PROD-001",
                "descripcion": "PRODUCTO DE PRUEBA",
                "unidad_medida": "KGM",
                "unidad_medida_nombre": "Kilogramo",
                "cantidad": 5.00,
                "peso_unitario": 2.00,
                "peso_total": 10.00,
                "observaciones": "Producto frágil"
            }
        ],
        "usuario": {
            "id": 1,
            "name": "Administrador",
            "email": "admin@example.com"
        },
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:35:00.000000Z"
    }
}
```

**Respuesta de Error (404):**
```json
{
    "success": false,
    "message": "Guía de remisión no encontrada",
    "error": "No query results for model [App\\Models\\GuiaRemision] 999"
}
```

---

### **4. Enviar Guía a SUNAT**

```http
POST /api/guias-remision/{id}/enviar-sunat
```

**Parámetros:**
- `id` (integer, requerido): ID de la guía de remisión

**Ejemplo de Request:**
```bash
POST /api/guias-remision/1/enviar-sunat
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Guía de remisión enviada a SUNAT exitosamente",
    "data": {
        "id": 1,
        "numero_completo": "T001-00000001",
        "estado": "ACEPTADO",
        "mensaje_sunat": "La guía ha sido aceptada",
        "codigo_hash": "abc123def456...",
        "fecha_aceptacion": "2024-01-15T10:35:00.000000Z"
    }
}
```

**Respuesta de Error (400):**
```json
{
    "success": false,
    "message": "La guía de remisión no puede ser enviada en su estado actual"
}
```

**Respuesta de Error (500):**
```json
{
    "success": false,
    "message": "Error al enviar guía de remisión a SUNAT",
    "error": "El nombre del archivo ZIP es incorrecto - Detalle: xxx.xxx.xxx value='ticket: error: Error de nombre archivo \"20000000001-09-T001-3.zip codigo cpe: 09\" no es un cpe valido'"
}
```

---

### **5. Descargar XML**

```http
GET /api/guias-remision/{id}/xml
```

**Parámetros:**
- `id` (integer, requerido): ID de la guía de remisión

**Ejemplo de Request:**
```bash
GET /api/guias-remision/1/xml
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<DespatchAdvice xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2\" xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\" xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\" xmlns:ccts=\"urn:un:unece:uncefact:documentation:2\" xmlns:qdt=\"urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2\" xmlns:udt=\"urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2\">...</DespatchAdvice>",
        "filename": "T001-00000001.xml"
    }
}
```

**Respuesta de Error (404):**
```json
{
    "success": false,
    "message": "No hay XML disponible para esta guía de remisión"
}
```

---

### **6. Estadísticas de Guías**

```http
GET /api/guias-remision/estadisticas/resumen
```

**Parámetros de Query:**
- `fecha_inicio` (date, opcional): Fecha inicio del rango (default: inicio del mes)
- `fecha_fin` (date, opcional): Fecha fin del rango (default: fin del mes)

**Ejemplo de Request:**
```bash
GET /api/guias-remision/estadisticas/resumen?fecha_inicio=2024-01-01&fecha_fin=2024-01-31
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "total_guias": 150,
        "guias_pendientes": 5,
        "guias_enviadas": 20,
        "guias_aceptadas": 120,
        "guias_rechazadas": 5,
        "peso_total_transportado": 2500.50
    }
}
```

## 📊 Códigos de Estado HTTP

| **Código** | **Descripción** | **Cuándo Ocurre** |
|------------|-----------------|-------------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Guía creada exitosamente |
| `400` | Bad Request | Datos inválidos o estado incorrecto |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Guía no encontrada |
| `422` | Unprocessable Entity | Errores de validación |
| `500` | Internal Server Error | Error interno del servidor |

## 🔐 Autenticación y Permisos

### **Headers Requeridos**
```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

### **Permisos Necesarios**
- `facturacion.guias`: Acceso básico al módulo
- `facturacion.ver`: Ver listado de guías
- `facturacion.create`: Crear nuevas guías
- `facturacion.show`: Ver detalle de guía
- `facturacion.enviar`: Enviar a SUNAT
- `facturacion.descargar`: Descargar archivos
- `facturacion.reportes`: Ver estadísticas

## 📝 Ejemplos de Uso con cURL

### **Crear Guía de Remisión**
```bash
curl -X POST "https://tu-dominio.com/api/guias-remision" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "destinatario_tipo_documento": "1",
    "destinatario_numero_documento": "12345678",
    "destinatario_razon_social": "DESTINATARIO S.A.C.",
    "destinatario_direccion": "AV. PRINCIPAL 123",
    "destinatario_ubigeo": "150101",
    "motivo_traslado": "01",
    "modalidad_traslado": "01",
    "fecha_inicio_traslado": "2024-01-15",
    "punto_partida_ubigeo": "150101",
    "punto_partida_direccion": "AV. ORIGEN 456",
    "punto_llegada_ubigeo": "150101",
    "punto_llegada_direccion": "AV. DESTINO 789",
    "productos": [
      {
        "producto_id": 1,
        "cantidad": 5.00,
        "peso_unitario": 2.00
      }
    ]
  }'
```

### **Enviar a SUNAT**
```bash
curl -X POST "https://tu-dominio.com/api/guias-remision/1/enviar-sunat" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json"
```

### **Descargar XML**
```bash
curl -X GET "https://tu-dominio.com/api/guias-remision/1/xml" \
  -H "Authorization: Bearer tu_token_aqui" \
  -o "guia_remision.xml"
```

## 🚨 Manejo de Errores

### **Errores Comunes**

#### **1. Error de Validación (422)**
```json
{
    "success": false,
    "message": "Datos de validación incorrectos",
    "errors": {
        "cliente_id": ["El campo cliente id es obligatorio."],
        "productos": ["El campo productos debe tener al menos 1 elemento."]
    }
}
```

#### **2. Error de Permisos (403)**
```json
{
    "success": false,
    "message": "No tienes permisos para realizar esta acción"
}
```

#### **3. Error de SUNAT (500)**
```json
{
    "success": false,
    "message": "Error al enviar guía de remisión a SUNAT",
    "error": "El nombre del archivo ZIP es incorrecto"
}
```

## 📈 Rate Limiting

- **Límite:** 60 requests por minuto por usuario
- **Headers de respuesta:**
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## 🔄 Paginación

### **Parámetros**
- `page`: Número de página (default: 1)
- `per_page`: Elementos por página (default: 15, máximo: 100)

### **Headers de Respuesta**
```json
{
    "current_page": 1,
    "data": [...],
    "first_page_url": "https://api.example.com/guias-remision?page=1",
    "from": 1,
    "last_page": 10,
    "last_page_url": "https://api.example.com/guias-remision?page=10",
    "links": [...],
    "next_page_url": "https://api.example.com/guias-remision?page=2",
    "path": "https://api.example.com/guias-remision",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 150
}
```

---

*Documentación de API actualizada el: 17 de Enero, 2025*
*Versión: 1.0*
