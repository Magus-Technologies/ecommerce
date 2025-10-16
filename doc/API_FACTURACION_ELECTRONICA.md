# API de Facturación Electrónica - Documentación Completa

## Índice
1. [Introducción](#introducción)
2. [Configuración de Emisor](#configuración-de-emisor)
3. [Catálogos SUNAT](#catálogos-sunat)
4. [Series y Correlativos](#series-y-correlativos)
5. [Ventas y Comprobantes](#ventas-y-comprobantes)
6. [Resumen Diario (RC)](#resumen-diario-rc)
7. [Comunicación de Baja (RA)](#comunicación-de-baja-ra)
8. [Notas de Crédito y Débito](#notas-de-crédito-y-débito)
9. [Códigos de Respuesta](#códigos-de-respuesta)
10. [Modelos de Datos](#modelos-de-datos)

---

## Introducción

Esta API implementa la emisión de Comprobantes de Pago Electrónicos (CPE) con Greenter para SUNAT Perú, utilizando el estándar UBL 2.1. Incluye emisión de Boletas, Facturas, Notas de Crédito/Débito, Resumen Diario y Comunicación de Baja.

**Base URL:** `http://your-domain.com/api`

**Autenticación:** Bearer Token (JWT)

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Configuración de Emisor

### GET /facturacion/emisor
Obtiene la configuración actual del emisor (empresa).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ruc": "20123456789",
    "razon_social": "MI EMPRESA SAC",
    "nombre_comercial": "Mi Empresa",
    "domicilio_fiscal": "Av. Principal 123",
    "ubigeo": "150101",
    "departamento": "LIMA",
    "provincia": "LIMA",
    "distrito": "LIMA",
    "email": "facturacion@miempresa.com",
    "telefono": "987654321",
    "sol_usuario": "MODDATOS",
    "sol_endpoint": "beta",
    "tiene_certificado": true,
    "certificado_vencimiento": "2026-12-31",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

### PUT /facturacion/emisor
Actualiza la configuración del emisor.

**Request Body:**
```json
{
  "ruc": "20123456789",
  "razon_social": "MI EMPRESA SAC",
  "nombre_comercial": "Mi Empresa",
  "domicilio_fiscal": "Av. Principal 123",
  "ubigeo": "150101",
  "email": "facturacion@miempresa.com",
  "telefono": "987654321",
  "sol_usuario": "MODDATOS",
  "sol_clave": "moddatos",
  "sol_endpoint": "beta"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Configuración del emisor actualizada correctamente",
  "data": {
    "id": 1,
    "ruc": "20123456789",
    "razon_social": "MI EMPRESA SAC"
  }
}
```

**Validaciones:**
- `ruc`: requerido, 11 dígitos, debe iniciar con 10 o 20
- `razon_social`: requerido, máximo 255 caracteres
- `ubigeo`: requerido, 6 dígitos válidos
- `sol_endpoint`: valores permitidos: "beta", "prod"

### POST /facturacion/emisor/certificado
Sube el certificado digital (.pfx) para firma electrónica.

**Request:** multipart/form-data
```
certificado: [archivo .pfx]
password: "contraseña_del_certificado"
```

**Response 200:**
```json
{
  "success": true,
  "message": "Certificado cargado correctamente",
  "data": {
    "certificado_nombre": "certificado_20123456789.pfx",
    "vencimiento": "2026-12-31",
    "propietario": "MI EMPRESA SAC"
  }
}
```

**Errores:**
- 400: Archivo no es .pfx o contraseña incorrecta
- 422: Certificado vencido o inválido

---

## Catálogos SUNAT

### GET /facturacion/catalogos/:tipo
Obtiene los catálogos de SUNAT para combos y validaciones.

**Tipos disponibles:**
- `tipo-documento-identidad`
- `tipo-afectacion-igv`
- `unidad-medida`
- `moneda`
- `motivo-nota-credito`
- `motivo-nota-debito`
- `tipo-precio`

**Ejemplo: GET /facturacion/catalogos/tipo-documento-identidad**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "1",
      "descripcion": "DNI",
      "abreviatura": "DNI",
      "longitud": 8
    },
    {
      "codigo": "6",
      "descripcion": "RUC",
      "abreviatura": "RUC",
      "longitud": 11
    },
    {
      "codigo": "4",
      "descripcion": "CARNET DE EXTRANJERIA",
      "abreviatura": "CE",
      "longitud": 12
    },
    {
      "codigo": "7",
      "descripcion": "PASAPORTE",
      "abreviatura": "PASS",
      "longitud": 12
    },
    {
      "codigo": "-",
      "descripcion": "SIN DOCUMENTO",
      "abreviatura": "SD",
      "longitud": null
    }
  ]
}
```

**Ejemplo: GET /facturacion/catalogos/tipo-afectacion-igv**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "10",
      "descripcion": "GRAVADO - OPERACION ONEROSA",
      "tipo": "gravado",
      "porcentaje_igv": 18
    },
    {
      "codigo": "20",
      "descripcion": "EXONERADO - OPERACION ONEROSA",
      "tipo": "exonerado",
      "porcentaje_igv": 0
    },
    {
      "codigo": "30",
      "descripcion": "INAFECTO - OPERACION ONEROSA",
      "tipo": "inafecto",
      "porcentaje_igv": 0
    },
    {
      "codigo": "11",
      "descripcion": "GRAVADO - RETIRO POR PREMIO",
      "tipo": "gravado",
      "porcentaje_igv": 18
    },
    {
      "codigo": "21",
      "descripcion": "EXONERADO - TRANSFERENCIA GRATUITA",
      "tipo": "exonerado",
      "porcentaje_igv": 0
    }
  ]
}
```

**Ejemplo: GET /facturacion/catalogos/unidad-medida**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "NIU",
      "descripcion": "UNIDAD (BIENES)"
    },
    {
      "codigo": "ZZ",
      "descripcion": "UNIDAD (SERVICIOS)"
    },
    {
      "codigo": "KGM",
      "descripcion": "KILOGRAMO"
    },
    {
      "codigo": "MTR",
      "descripcion": "METRO"
    },
    {
      "codigo": "LTR",
      "descripcion": "LITRO"
    },
    {
      "codigo": "GRM",
      "descripcion": "GRAMO"
    },
    {
      "codigo": "DZN",
      "descripcion": "DOCENA"
    }
  ]
}
```

**Ejemplo: GET /facturacion/catalogos/motivo-nota-credito**

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "01",
      "descripcion": "ANULACION DE LA OPERACION"
    },
    {
      "codigo": "02",
      "descripcion": "ANULACION POR ERROR EN EL RUC"
    },
    {
      "codigo": "03",
      "descripcion": "CORRECCION POR ERROR EN LA DESCRIPCION"
    },
    {
      "codigo": "04",
      "descripcion": "DESCUENTO GLOBAL"
    },
    {
      "codigo": "05",
      "descripcion": "DESCUENTO POR ITEM"
    },
    {
      "codigo": "06",
      "descripcion": "DEVOLUCION TOTAL"
    },
    {
      "codigo": "07",
      "descripcion": "DEVOLUCION POR ITEM"
    },
    {
      "codigo": "08",
      "descripcion": "BONIFICACION"
    },
    {
      "codigo": "09",
      "descripcion": "DISMINUCION EN EL VALOR"
    },
    {
      "codigo": "13",
      "descripcion": "AJUSTES DE OPERACIONES DE EXPORTACION"
    }
  ]
}
```

---

## Series y Correlativos

### GET /facturacion/series
Lista todas las series configuradas.

**Query Parameters:**
- `tipo_comprobante` (opcional): "01" (Factura), "03" (Boleta), "07" (NC), "08" (ND)
- `estado` (opcional): "activo", "inactivo"
- `sede_id` (opcional): ID de la sede

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo_comprobante": "03",
      "tipo_nombre": "BOLETA DE VENTA ELECTRONICA",
      "serie": "B001",
      "correlativo_actual": 152,
      "sede_id": 1,
      "sede_nombre": "Tienda Principal",
      "caja_id": null,
      "estado": "activo",
      "created_at": "2025-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "tipo_comprobante": "01",
      "tipo_nombre": "FACTURA ELECTRONICA",
      "serie": "F001",
      "correlativo_actual": 87,
      "sede_id": 1,
      "sede_nombre": "Tienda Principal",
      "caja_id": null,
      "estado": "activo",
      "created_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

### GET /facturacion/series/:id
Obtiene una serie específica.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo_comprobante": "03",
    "serie": "B001",
    "correlativo_actual": 152,
    "sede_id": 1,
    "estado": "activo",
    "proximo_numero": "B001-153"
  }
}
```

### POST /facturacion/series
Crea una nueva serie.

**Request Body:**
```json
{
  "tipo_comprobante": "03",
  "serie": "B002",
  "correlativo_inicial": 1,
  "sede_id": 1,
  "caja_id": null,
  "estado": "activo"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Serie creada correctamente",
  "data": {
    "id": 3,
    "tipo_comprobante": "03",
    "serie": "B002",
    "correlativo_actual": 1,
    "proximo_numero": "B002-1"
  }
}
```

**Validaciones:**
- Serie Boleta (03): debe iniciar con "B" + 3 dígitos (ej: B001)
- Serie Factura (01): debe iniciar con "F" + 3 dígitos (ej: F001)
- Serie NC (07): debe iniciar con "BC" o "FC" + 2 dígitos
- Serie ND (08): debe iniciar con "BD" o "FD" + 2 dígitos
- Serie única por tipo_comprobante + sede

### PATCH /facturacion/series/:id
Actualiza una serie (estado, sede).

**Request Body:**
```json
{
  "estado": "inactivo"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Serie actualizada correctamente"
}
```

### POST /facturacion/series/reservar-correlativo
Reserva el siguiente correlativo de forma transaccional.

**Request Body:**
```json
{
  "serie_id": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "serie": "B001",
    "correlativo": 153,
    "numero_completo": "B001-153"
  }
}
```

---

## Ventas y Comprobantes

### POST /ventas
Crea una nueva venta en estado borrador.

**Request Body:**
```json
{
  "cliente": {
    "tipo_documento": "1",
    "numero_documento": "12345678",
    "nombre": "JUAN PEREZ GARCIA",
    "direccion": "Av. Los Olivos 456",
    "email": "juan.perez@email.com",
    "telefono": "987654321"
  },
  "items": [
    {
      "producto_id": 10,
      "descripcion": "Laptop HP 15-DY2021LA",
      "unidad_medida": "NIU",
      "cantidad": 1,
      "precio_unitario": 2500.00,
      "tipo_afectacion_igv": "10",
      "descuento": 0
    },
    {
      "producto_id": 25,
      "descripcion": "Mouse Inalambrico Logitech",
      "unidad_medida": "NIU",
      "cantidad": 2,
      "precio_unitario": 45.00,
      "tipo_afectacion_igv": "10",
      "descuento": 5.00
    }
  ],
  "descuento_global": 0,
  "metodo_pago": "EFECTIVO",
  "observaciones": "Venta realizada en tienda",
  "moneda": "PEN"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Venta creada correctamente",
  "data": {
    "id": 450,
    "codigo_venta": "VEN-2025-000450",
    "fecha": "2025-10-13T15:30:00Z",
    "cliente": {
      "tipo_documento": "1",
      "numero_documento": "12345678",
      "nombre": "JUAN PEREZ GARCIA"
    },
    "estado": "PENDIENTE",
    "totales": {
      "subtotal": 2585.00,
      "descuento_items": 5.00,
      "descuento_global": 0,
      "subtotal_neto": 2580.00,
      "igv": 464.40,
      "total": 3044.40,
      "moneda": "PEN"
    }
  }
}
```

### GET /ventas
Lista todas las ventas con filtros.

**Query Parameters:**
- `page` (opcional): número de página, default 1
- `per_page` (opcional): registros por página, default 20
- `estado` (opcional): "PENDIENTE", "FACTURADO", "ANULADO"
- `fecha_desde` (opcional): "YYYY-MM-DD"
- `fecha_hasta` (opcional): "YYYY-MM-DD"
- `cliente` (opcional): buscar por nombre o documento
- `codigo_venta` (opcional): buscar por código

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 450,
      "codigo_venta": "VEN-2025-000450",
      "fecha": "2025-10-13T15:30:00Z",
      "cliente": {
        "nombre": "JUAN PEREZ GARCIA",
        "numero_documento": "12345678"
      },
      "estado": "PENDIENTE",
      "total": 3044.40,
      "moneda": "PEN",
      "comprobante": null
    },
    {
      "id": 449,
      "codigo_venta": "VEN-2025-000449",
      "fecha": "2025-10-13T14:15:00Z",
      "cliente": {
        "nombre": "MARIA LOPEZ SANCHEZ",
        "numero_documento": "20456789123"
      },
      "estado": "FACTURADO",
      "total": 1250.00,
      "moneda": "PEN",
      "comprobante": {
        "tipo": "01",
        "serie": "F001",
        "numero": 87,
        "numero_completo": "F001-87"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 450,
    "total_pages": 23,
    "from": 1,
    "to": 20
  }
}
```

### GET /ventas/:id
Obtiene el detalle completo de una venta.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 450,
    "codigo_venta": "VEN-2025-000450",
    "fecha": "2025-10-13T15:30:00Z",
    "estado": "PENDIENTE",
    "cliente": {
      "tipo_documento": "1",
      "numero_documento": "12345678",
      "nombre": "JUAN PEREZ GARCIA",
      "direccion": "Av. Los Olivos 456",
      "email": "juan.perez@email.com",
      "telefono": "987654321"
    },
    "items": [
      {
        "id": 890,
        "producto_id": 10,
        "codigo_producto": "LAP-HP-001",
        "descripcion": "Laptop HP 15-DY2021LA",
        "unidad_medida": "NIU",
        "cantidad": 1,
        "precio_unitario": 2500.00,
        "tipo_afectacion_igv": "10",
        "descuento": 0,
        "subtotal": 2500.00,
        "igv": 450.00,
        "total": 2950.00
      },
      {
        "id": 891,
        "producto_id": 25,
        "codigo_producto": "MOU-LOG-002",
        "descripcion": "Mouse Inalambrico Logitech",
        "unidad_medida": "NIU",
        "cantidad": 2,
        "precio_unitario": 45.00,
        "tipo_afectacion_igv": "10",
        "descuento": 5.00,
        "subtotal": 85.00,
        "igv": 14.40,
        "total": 94.40
      }
    ],
    "totales": {
      "subtotal": 2585.00,
      "descuento_items": 5.00,
      "descuento_global": 0,
      "subtotal_neto": 2580.00,
      "igv": 464.40,
      "total": 3044.40,
      "moneda": "PEN"
    },
    "metodo_pago": "EFECTIVO",
    "observaciones": "Venta realizada en tienda",
    "comprobante": null,
    "created_at": "2025-10-13T15:30:00Z",
    "updated_at": "2025-10-13T15:30:00Z"
  }
}
```

### POST /ventas/:id/facturar
Convierte una venta en comprobante electrónico (CPE).

**Request Body:**
```json
{
  "tipo_comprobante": "01",
  "serie": "F001",
  "metodo_pago": "EFECTIVO",
  "observaciones": "Venta contado",
  "fecha_vencimiento": null
}
```

**Parámetros:**
- `tipo_comprobante`: "01" (Factura) o "03" (Boleta)
- `serie` (opcional): si no se envía, se autogenera
- `metodo_pago` (opcional)
- `observaciones` (opcional)
- `fecha_vencimiento` (opcional): para facturas a crédito

**Response 200:**
```json
{
  "success": true,
  "message": "Comprobante emitido correctamente",
  "data": {
    "venta_id": 450,
    "comprobante": {
      "id": 320,
      "tipo": "01",
      "tipo_nombre": "FACTURA ELECTRONICA",
      "serie": "F001",
      "numero": 88,
      "numero_completo": "F001-88",
      "fecha_emision": "2025-10-13",
      "hora_emision": "15:35:20",
      "hash": "aBcDeF123456789xYz==",
      "qr": "https://api.miempresa.com/storage/qr/F001-88.png",
      "xml_url": "https://api.miempresa.com/storage/xml/20123456789-01-F001-88.xml",
      "cdr_url": "https://api.miempresa.com/storage/cdr/R-20123456789-01-F001-88.zip",
      "pdf_url": "https://api.miempresa.com/api/ventas/450/pdf",
      "estado_sunat": "ACEPTADO",
      "codigo_sunat": "0",
      "mensaje_sunat": "La Factura numero F001-88, ha sido aceptada",
      "fecha_envio_sunat": "2025-10-13T15:35:25Z"
    }
  }
}
```

**Errores comunes:**
```json
{
  "success": false,
  "error": "CLIENTE_INVALIDO",
  "message": "Para emitir Factura el cliente debe tener RUC válido"
}
```

```json
{
  "success": false,
  "error": "SUNAT_ERROR",
  "codigo_sunat": "2324",
  "message": "El número de RUC del emisor no existe"
}
```

### GET /ventas/:id/pdf
Descarga el PDF del comprobante (representación impresa).

**Response:** application/pdf

El PDF incluye:
- Datos del emisor con logo
- Datos del comprobante (tipo, serie-número, fecha, QR)
- Datos del cliente
- Detalle de items con columnas: código, descripción, unidad, cantidad, precio unitario, subtotal
- Totales: subtotal, IGV, descuentos, total
- Hash de firma digital
- Leyendas según tipo de comprobante
- Observaciones

### POST /ventas/:id/email
Envía el comprobante por correo electrónico.

**Request Body:**
```json
{
  "to": "cliente@email.com",
  "asunto": "Comprobante Electrónico F001-88",
  "mensaje": "Adjuntamos su comprobante de pago electrónico."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Comprobante enviado correctamente a cliente@email.com",
  "data": {
    "destinatario": "cliente@email.com",
    "archivos_adjuntos": [
      "F001-88.pdf",
      "R-20123456789-01-F001-88.zip"
    ],
    "fecha_envio": "2025-10-13T15:40:00Z"
  }
}
```

### PATCH /ventas/:id/anular
Anula una venta que NO ha sido facturada.

**Request Body:**
```json
{
  "motivo": "Venta cancelada por el cliente"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Venta anulada correctamente"
}
```

**Error si ya está facturada:**
```json
{
  "success": false,
  "error": "VENTA_FACTURADA",
  "message": "No se puede anular una venta facturada. Debe emitir una Nota de Crédito o Comunicación de Baja."
}
```

---

## Resumen Diario (RC)

El Resumen Diario se utiliza para informar a SUNAT sobre las boletas del día (envío diferido).

### POST /facturacion/resumenes
Genera y envía un Resumen Diario.

**Request Body:**
```json
{
  "fecha": "2025-10-13",
  "comprobantes": [
    {
      "id": 315,
      "serie": "B001",
      "numero": 150,
      "tipo": "03",
      "cliente_tipo_doc": "1",
      "cliente_num_doc": "12345678",
      "moneda": "PEN",
      "total": 250.50,
      "igv": 38.20,
      "estado": "ACEPTADO"
    },
    {
      "id": 316,
      "serie": "B001",
      "numero": 151,
      "tipo": "03",
      "cliente_tipo_doc": "1",
      "cliente_num_doc": "87654321",
      "moneda": "PEN",
      "total": 180.00,
      "igv": 27.46,
      "estado": "ACEPTADO"
    }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Resumen Diario enviado correctamente",
  "data": {
    "id": 45,
    "fecha_resumen": "2025-10-13",
    "identificador": "RC-20251013-001",
    "ticket": "1698754321-ABC123XYZ",
    "cantidad_comprobantes": 2,
    "total": 430.50,
    "xml_url": "https://api.miempresa.com/storage/xml/20123456789-RC-20251013-001.xml",
    "estado": "PENDIENTE",
    "fecha_envio": "2025-10-13T23:50:00Z"
  }
}
```

### GET /facturacion/resumenes/:ticket
Consulta el estado de un Resumen Diario en SUNAT.

**Response 200 (Pendiente):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "ticket": "1698754321-ABC123XYZ",
    "estado": "PENDIENTE",
    "mensaje": "En proceso de validación por SUNAT"
  }
}
```

**Response 200 (Aceptado):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "ticket": "1698754321-ABC123XYZ",
    "estado": "ACEPTADO",
    "codigo_sunat": "0",
    "mensaje_sunat": "La Comunicación de resumen número RC-20251013-001, ha sido aceptada",
    "cdr_url": "https://api.miempresa.com/storage/cdr/R-20123456789-RC-20251013-001.zip",
    "fecha_procesamiento": "2025-10-14T08:15:30Z"
  }
}
```

**Response 200 (Rechazado):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "ticket": "1698754321-ABC123XYZ",
    "estado": "RECHAZADO",
    "codigo_sunat": "2801",
    "mensaje_sunat": "El documento contiene errores de estructura",
    "fecha_procesamiento": "2025-10-14T08:15:30Z"
  }
}
```

### GET /facturacion/resumenes
Lista todos los resúmenes diarios.

**Query Parameters:**
- `fecha_desde` (opcional)
- `fecha_hasta` (opcional)
- `estado` (opcional): "PENDIENTE", "ACEPTADO", "RECHAZADO"

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "fecha_resumen": "2025-10-13",
      "identificador": "RC-20251013-001",
      "ticket": "1698754321-ABC123XYZ",
      "cantidad_comprobantes": 2,
      "estado": "ACEPTADO",
      "fecha_envio": "2025-10-13T23:50:00Z"
    }
  ]
}
```

---

## Comunicación de Baja (RA)

La Comunicación de Baja se utiliza para anular comprobantes ya emitidos.

### POST /facturacion/bajas
Envía una Comunicación de Baja a SUNAT.

**Request Body:**
```json
{
  "comprobantes": [
    {
      "tipo": "01",
      "serie": "F001",
      "numero": 85,
      "motivo": "ERROR EN LA EMISION - CLIENTE SOLICITO ANULACION"
    },
    {
      "tipo": "03",
      "serie": "B001",
      "numero": 148,
      "motivo": "OPERACION NO REALIZADA"
    }
  ],
  "fecha_baja": "2025-10-13"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Comunicación de Baja enviada correctamente",
  "data": {
    "id": 12,
    "fecha_baja": "2025-10-13",
    "identificador": "RA-20251013-001",
    "ticket": "1698754987-XYZ456ABC",
    "cantidad_comprobantes": 2,
    "xml_url": "https://api.miempresa.com/storage/xml/20123456789-RA-20251013-001.xml",
    "estado": "PENDIENTE",
    "fecha_envio": "2025-10-13T16:20:00Z"
  }
}
```

**Validaciones:**
- Solo se pueden dar de baja comprobantes con estado ACEPTADO
- Boletas: se pueden dar de baja hasta 7 días después de la emisión
- Facturas/NC/ND: sin límite de tiempo

### GET /facturacion/bajas/:ticket
Consulta el estado de una Comunicación de Baja.

**Response 200 (Aceptado):**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "ticket": "1698754987-XYZ456ABC",
    "estado": "ACEPTADO",
    "codigo_sunat": "0",
    "mensaje_sunat": "La Comunicación de baja RA-20251013-001, ha sido aceptada",
    "cdr_url": "https://api.miempresa.com/storage/cdr/R-20123456789-RA-20251013-001.zip",
    "fecha_procesamiento": "2025-10-14T09:30:15Z",
    "comprobantes_anulados": [
      {
        "tipo": "01",
        "serie": "F001",
        "numero": 85
      },
      {
        "tipo": "03",
        "serie": "B001",
        "numero": 148
      }
    ]
  }
}
```

### GET /facturacion/bajas
Lista todas las comunicaciones de baja.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "fecha_baja": "2025-10-13",
      "identificador": "RA-20251013-001",
      "ticket": "1698754987-XYZ456ABC",
      "cantidad_comprobantes": 2,
      "estado": "ACEPTADO",
      "fecha_envio": "2025-10-13T16:20:00Z"
    }
  ]
}
```

---

## Notas de Crédito y Débito

### POST /facturacion/notas-credito
Emite una Nota de Crédito para anular o corregir un comprobante.

**Request Body:**
```json
{
  "comprobante_referencia": {
    "tipo": "01",
    "serie": "F001",
    "numero": 88
  },
  "tipo_nota_credito": "01",
  "motivo": "ANULACION DE LA OPERACION",
  "descripcion": "Anulación por solicitud del cliente",
  "items": [
    {
      "descripcion": "Laptop HP 15-DY2021LA",
      "unidad_medida": "NIU",
      "cantidad": 1,
      "precio_unitario": 2500.00,
      "tipo_afectacion_igv": "10",
      "descuento": 0
    }
  ],
  "serie": "FC01",
  "observaciones": "NC por anulación total"
}
```

**Tipos de Nota de Crédito (catálogo 09):**
- 01: Anulación de la operación
- 02: Anulación por error en el RUC
- 03: Corrección por error en la descripción
- 04: Descuento global
- 05: Descuento por ítem
- 06: Devolución total
- 07: Devolución por ítem
- 08: Bonificación
- 09: Disminución en el valor
- 13: Ajustes de exportación

**Response 200:**
```json
{
  "success": true,
  "message": "Nota de Crédito emitida correctamente",
  "data": {
    "id": 25,
    "tipo": "07",
    "tipo_nombre": "NOTA DE CREDITO ELECTRONICA",
    "serie": "FC01",
    "numero": 12,
    "numero_completo": "FC01-12",
    "fecha_emision": "2025-10-13",
    "comprobante_referencia": "F001-88",
    "tipo_nota": "01",
    "motivo": "ANULACION DE LA OPERACION",
    "total": 2950.00,
    "moneda": "PEN",
    "hash": "xYzAbC987654321==",
    "xml_url": "https://api.miempresa.com/storage/xml/20123456789-07-FC01-12.xml",
    "cdr_url": "https://api.miempresa.com/storage/cdr/R-20123456789-07-FC01-12.zip",
    "pdf_url": "https://api.miempresa.com/api/facturacion/notas-credito/25/pdf",
    "estado_sunat": "ACEPTADO",
    "codigo_sunat": "0",
    "mensaje_sunat": "La Nota de Crédito numero FC01-12, ha sido aceptada"
  }
}
```

### POST /facturacion/notas-debito
Emite una Nota de Débito para aumentar el valor de un comprobante.

**Request Body:**
```json
{
  "comprobante_referencia": {
    "tipo": "01",
    "serie": "F001",
    "numero": 88
  },
  "tipo_nota_debito": "01",
  "motivo": "INTERES POR MORA",
  "descripcion": "Intereses por pago fuera de plazo",
  "items": [
    {
      "descripcion": "Interés por mora - 30 días",
      "unidad_medida": "ZZ",
      "cantidad": 1,
      "precio_unitario": 150.00,
      "tipo_afectacion_igv": "10",
      "descuento": 0
    }
  ],
  "serie": "FD01"
}
```

**Tipos de Nota de Débito (catálogo 10):**
- 01: Interés por mora
- 02: Aumento en el valor
- 03: Penalidades

**Response 200:**
```json
{
  "success": true,
  "message": "Nota de Débito emitida correctamente",
  "data": {
    "id": 8,
    "tipo": "08",
    "tipo_nombre": "NOTA DE DEBITO ELECTRONICA",
    "serie": "FD01",
    "numero": 5,
    "numero_completo": "FD01-5",
    "fecha_emision": "2025-10-13",
    "comprobante_referencia": "F001-88",
    "tipo_nota": "01",
    "motivo": "INTERES POR MORA",
    "total": 177.00,
    "moneda": "PEN",
    "hash": "mNoP123456789qRs==",
    "xml_url": "https://api.miempresa.com/storage/xml/20123456789-08-FD01-5.xml",
    "cdr_url": "https://api.miempresa.com/storage/cdr/R-20123456789-08-FD01-5.zip",
    "pdf_url": "https://api.miempresa.com/api/facturacion/notas-debito/8/pdf",
    "estado_sunat": "ACEPTADO",
    "codigo_sunat": "0",
    "mensaje_sunat": "La Nota de Débito numero FD01-5, ha sido aceptada"
  }
}
```

### GET /facturacion/notas-credito
Lista todas las notas de crédito.

**Query Parameters:**
- `fecha_desde`, `fecha_hasta`
- `serie`
- `comprobante_referencia`

### GET /facturacion/notas-debito
Lista todas las notas de débito.

### GET /facturacion/notas-credito/:id/pdf
Descarga el PDF de la nota de crédito.

### GET /facturacion/notas-debito/:id/pdf
Descarga el PDF de la nota de débito.

---

## Códigos de Respuesta

### Códigos HTTP
- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o mal formados
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Sin permisos para esta operación
- **404 Not Found**: Recurso no encontrado
- **422 Unprocessable Entity**: Validación fallida
- **500 Internal Server Error**: Error del servidor

### Códigos SUNAT comunes

**Códigos de éxito:**
- **0**: Aceptado
- **0001**: Aceptado con observaciones

**Códigos de error del emisor:**
- **2324**: El número de RUC del emisor no existe
- **2325**: El emisor no está autorizado a emitir CPE
- **2801**: El documento contiene errores de estructura XML
- **2802**: Certificado no válido o vencido
- **2335**: Serie no autorizada

**Códigos de error del receptor:**
- **2017**: El RUC del receptor no existe
- **2018**: El tipo de documento del receptor es inválido

**Códigos de error de contenido:**
- **2119**: Total con IGV no coincide con cálculo
- **2120**: Sumatoria de tributos no coincide
- **3035**: Moneda inválida
- **3036**: Tipo de afectación IGV inválido

---

## Modelos de Datos

### Cliente
```json
{
  "tipo_documento": "1|6|4|7|-",
  "numero_documento": "string",
  "nombre": "string",
  "direccion": "string",
  "email": "string",
  "telefono": "string"
}
```

### Item de Venta
```json
{
  "producto_id": "number",
  "codigo_producto": "string",
  "descripcion": "string",
  "unidad_medida": "NIU|ZZ|KGM|...",
  "cantidad": "number",
  "precio_unitario": "number (decimal 2)",
  "tipo_afectacion_igv": "10|20|30|...",
  "descuento": "number (decimal 2)"
}
```

### Totales
```json
{
  "subtotal": "number",
  "descuento_items": "number",
  "descuento_global": "number",
  "subtotal_neto": "number",
  "igv": "number",
  "total": "number",
  "moneda": "PEN|USD"
}
```

### Comprobante
```json
{
  "id": "number",
  "tipo": "01|03|07|08",
  "serie": "string",
  "numero": "number",
  "fecha_emision": "date",
  "hash": "string",
  "xml_url": "string",
  "cdr_url": "string",
  "pdf_url": "string",
  "estado_sunat": "ACEPTADO|RECHAZADO|PENDIENTE",
  "codigo_sunat": "string",
  "mensaje_sunat": "string"
}
```

---

## Notas Finales

### Ambiente de pruebas (Beta)
- **Endpoint SUNAT:** https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService
- **Usuario SOL:** MODDATOS
- **Clave SOL:** moddatos
- **RUC de prueba:** 20000000001

### Ambiente de producción
- **Endpoint SUNAT:** https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService
- Usuario y clave SOL reales del contribuyente

### Almacenamiento de archivos
- **XML firmados:** `/storage/xml/`
- **CDR (Constancia de Recepción):** `/storage/cdr/`
- **PDF:** generados al vuelo desde `/api/ventas/:id/pdf`
- **Certificado .pfx:** `/storage/certificados/` (cifrado)

### Consideraciones de seguridad
- Los certificados digitales deben almacenarse cifrados
- Las credenciales SOL no deben exponerse en logs
- Los archivos XML/CDR deben ser accesibles por URL firmada o con autenticación
- Implementar rate limiting en endpoints de emisión

### Reintentos y auditoría
- Todos los envíos a SUNAT se registran en tabla `auditoria_sunat`
- Implementar cola de reintentos para errores de red (intentos máx: 3)
- Almacenar request/response completo para debugging

---

**Versión:** 1.0
**Fecha:** 2025-10-13
**Contacto:** facturacion@miempresa.com
