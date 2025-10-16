# 🧾 Sistema de Facturación Electrónica - Guía Completa

## ✅ Estado Actual: LISTO PARA PRUEBAS BETA

Tu sistema de facturación electrónica está **100% configurado** y listo para hacer pruebas con SUNAT BETA.

---

## 📊 Resumen de lo Implementado

### ✅ Tablas de Base de Datos
- `comprobantes` - Facturas, boletas, notas
- `comprobante_detalles` - Líneas de comprobantes
- `series_comprobantes` - Series de numeración
- `pagos` - Registro de pagos
- `error_logs` - Logs de errores
- `sunat_logs` - Auditoría de SUNAT
- `resumenes` y `resumenes_detalle` - Resúmenes diarios
- `bajas` y `bajas_detalle` - Comunicaciones de baja
- Todas las columnas en `compras` y `comprobantes` para facturación

### ✅ Código Implementado
- **Controllers:**
  - `ComprobantesController` - CRUD de comprobantes
  - `FacturacionManualController` - Facturación manual
  - `WebhookController` - Webhooks de pago
  - `TestFacturacionController` - Endpoints de prueba

- **Services:**
  - `GreenterService` - Integración con SUNAT
  - `FacturacionComprasService` - Facturación automática

- **Models:**
  - `Comprobante`, `ComprobanteDetalle`
  - `SerieComprobante`, `Pago`, `ErrorLog`
  - Relaciones actualizadas en `Compra`

- **Emails:**
  - `ComprobanteEmail` - Mailable para enviar comprobantes
  - Vista Blade profesional para emails

---

## 🔧 Configuración Actual

### Variables de Entorno (.env)
```env
# Modo de pruebas BETA
GREENTER_MODE=BETA

# Credenciales SUNAT (públicas para pruebas)
GREENTER_FE_USER=20000000001MODDATOS
GREENTER_FE_PASSWORD=MODDATOS

# Certificado digital
GREENTER_CERT_PATH=certificates/certificate.pem

# Datos de la empresa
COMPANY_RUC=20000000001
COMPANY_NAME="EMPRESA DE PRUEBAS S.A.C."
COMPANY_ADDRESS="AV. PRINCIPAL 123"
COMPANY_DISTRICT=LIMA
COMPANY_PROVINCE=LIMA
COMPANY_DEPARTMENT=LIMA
COMPANY_UBIGEO=150101
COMPANY_LOGO_PATH=logo-empresa.png
```

---

## 🚀 Cómo Probar

### Opción 1: Endpoints de Prueba Automáticos

#### 1. Verificar Configuración
```bash
GET http://localhost:8000/api/facturacion/test/verificar-configuracion
```

**Resultado esperado:**
```json
{
  "success": true,
  "configuracion": {
    "modo": "BETA",
    "usuario_sunat": "20000000001MODDATOS",
    "certificado_existe": true,
    "ruc_empresa": "20000000001",
    "nombre_empresa": "EMPRESA DE PRUEBAS S.A.C.",
    "logo_existe": false
  },
  "errores": [],
  "message": "Configuración correcta para facturación electrónica"
}
```

#### 2. Verificar Conexión con SUNAT
```bash
GET http://localhost:8000/api/facturacion/test/estado-sunat
```

**Resultado esperado:**
```json
{
  "success": true,
  "modo": "BETA",
  "url_servicio": "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService",
  "message": "Configurado para ambiente de BETA",
  "nota": "Estás en BETA - Las facturas NO son reales"
}
```

#### 3. Generar Factura de Prueba Completa
```bash
GET http://localhost:8000/api/facturacion/test/generar-factura-prueba
```

Este endpoint hace TODO automáticamente:
- Crea cliente de prueba
- Crea producto de prueba
- Genera factura
- Envía a SUNAT BETA
- Genera PDF y XML
- Retorna URLs de descarga

**Resultado esperado:**
```json
{
  "success": true,
  "message": "¡Factura de prueba generada y enviada a SUNAT BETA exitosamente!",
  "data": {
    "comprobante_id": 1,
    "numero_completo": "F001-00000001",
    "cliente": "EMPRESA DE PRUEBAS S.A.C.",
    "total": "S/ 1,000.00",
    "estado": "ACEPTADO",
    "mensaje_sunat": "La Factura número F001-1 fue aceptada",
    "tiene_pdf": true,
    "tiene_xml": true,
    "tiene_cdr": true,
    "urls": {
      "ver_comprobante": "http://localhost:8000/api/comprobantes/1",
      "descargar_pdf": "http://localhost:8000/api/comprobantes/1/pdf",
      "descargar_xml": "http://localhost:8000/api/comprobantes/1/xml"
    }
  }
}
```

---

### Opción 2: Facturación Manual

#### Crear Factura Manualmente
```bash
POST http://localhost:8000/api/facturas
Content-Type: application/json
Authorization: Bearer {tu_token_jwt}

{
  "cliente_id": 1,
  "tipo_comprobante": "01",
  "serie_id": 1,
  "fecha_emision": "2025-10-15",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 500.00,
      "descuento": 0
    }
  ]
}
```

#### Enviar a SUNAT
```bash
POST http://localhost:8000/api/facturas/{id}/enviar-sunat
Authorization: Bearer {tu_token_jwt}
```

---

### Opción 3: Facturación Automática (Integración E-commerce)

Cuando un cliente hace una compra online y requiere factura:

```json
{
  "cliente_id": 123,
  "productos": [...],
  "requiere_factura": true,
  "datos_facturacion": {
    "tipo_documento": "6",
    "numero_documento": "20123456789",
    "razon_social": "MI EMPRESA S.A.C.",
    "direccion": "AV. EJEMPLO 456"
  }
}
```

Al procesar el pago, el sistema automáticamente:
1. Detecta que requiere factura
2. Genera el comprobante
3. Lo envía a SUNAT
4. Asocia el `comprobante_id` a la compra
5. Envía email al cliente con PDF y XML

---

## 📝 Endpoints Disponibles

### Comprobantes
- `GET /api/comprobantes` - Listar comprobantes
- `GET /api/comprobantes/{id}` - Ver comprobante
- `GET /api/comprobantes/{id}/pdf` - Descargar PDF
- `GET /api/comprobantes/{id}/xml` - Descargar XML
- `GET /api/comprobantes/{id}/cdr` - Descargar CDR
- `POST /api/comprobantes/{id}/email` - Enviar por email
- `POST /api/comprobantes/{id}/reenviar` - Reenviar a SUNAT
- `POST /api/comprobantes/{id}/consultar` - Consultar estado
- `PATCH /api/comprobantes/{id}/anular` - Anular comprobante
- `GET /api/comprobantes/estadisticas` - Estadísticas

### Facturas Manuales
- `GET /api/facturas` - Listar facturas
- `POST /api/facturas` - Crear factura
- `GET /api/facturas/{id}` - Ver factura
- `POST /api/facturas/{id}/enviar-sunat` - Enviar a SUNAT
- `GET /api/facturas/{id}/pdf` - Descargar PDF
- `GET /api/facturas/{id}/xml` - Descargar XML
- `GET /api/facturas/clientes` - Listar clientes
- `GET /api/facturas/series` - Listar series
- `GET /api/facturas/buscar-productos` - Buscar productos
- `GET /api/facturas/estadisticas` - Estadísticas

### Series
- `GET /api/series` - Listar series
- `POST /api/series` - Crear serie
- `PATCH /api/series/{id}` - Actualizar serie
- `POST /api/series/reservar-correlativo` - Reservar correlativo

### Webhooks (Automático)
- `POST /api/webhook/pago` - Webhook genérico
- `POST /api/webhook/culqi` - Webhook Culqi

### Pruebas BETA
- `GET /api/facturacion/test/verificar-configuracion` - Verificar config
- `GET /api/facturacion/test/estado-sunat` - Estado SUNAT
- `GET /api/facturacion/test/generar-factura-prueba` - Factura automática

---

## 🎯 Flujos Implementados

### Flujo 1: Compra Online con Factura
```
Usuario hace compra
    ↓
Marca "Requiere factura"
    ↓
Ingresa datos de facturación
    ↓
Paga con Culqi/otro método
    ↓
Webhook procesa pago
    ↓
FacturacionComprasService detecta requiere_factura=true
    ↓
Genera comprobante automáticamente
    ↓
Envía a SUNAT
    ↓
Guarda PDF/XML/CDR
    ↓
Envía email al cliente
    ↓
Actualiza compra con comprobante_id
```

### Flujo 2: Facturación Manual
```
Usuario administrador
    ↓
Crea factura manual desde panel
    ↓
Selecciona cliente y productos
    ↓
Sistema valida stock
    ↓
Crea comprobante
    ↓
Descuenta stock automáticamente
    ↓
Usuario envía a SUNAT
    ↓
Sistema genera PDF/XML/CDR
    ↓
Usuario puede descargar o enviar por email
```

---

## 📧 Envío de Emails

El sistema envía automáticamente emails con:
- PDF del comprobante
- XML firmado
- Diseño profesional HTML
- Información completa del comprobante

**Template:** `resources/views/emails/comprobante.blade.php`
**Mailable:** `App\Mail\ComprobanteEmail`

---

## 🖼️ Logo de Empresa (Opcional)

Para agregar tu logo a los PDFs:

1. Coloca tu logo PNG en: `public/logo-empresa.png`
2. Tamaño recomendado: 200x80px máximo
3. Fondo transparente preferiblemente

Si no agregas logo, el sistema funciona igual pero el PDF no tendrá logo.

---

## 🔄 Migrar a Producción

Cuando estés listo para SUNAT real:

### 1. Obtener Credenciales Reales
- Solicita credenciales SOL en SUNAT
- Obtén certificado digital (.pfx)
- Convierte .pfx a .pem

### 2. Actualizar .env
```env
GREENTER_MODE=PRODUCCION
GREENTER_FE_USER=tu_ruc_real_MODDATOS
GREENTER_FE_PASSWORD=tu_clave_sol
GREENTER_CERT_PATH=certificates/certificado_real.pem
COMPANY_RUC=tu_ruc_real
COMPANY_NAME="TU EMPRESA S.A.C."
COMPANY_ADDRESS="tu dirección real"
```

### 3. Actualizar Series
Cambia las series de prueba (F001, B001) por tus series autorizadas por SUNAT.

⚠️ **IMPORTANTE:** En producción, las facturas son REALES y tienen valor tributario.

---

## 🐛 Solución de Problemas

### Error: "Certificado no encontrado"
**Causa:** El certificado no existe en `certificates/certificate.pem`
**Solución:** Verifica que el archivo exista en `storage/app/certificates/certificate.pem`

### Error: "Usuario SOL inválido"
**Causa:** Credenciales incorrectas en `.env`
**Solución:** Verifica `GREENTER_FE_USER` y `GREENTER_FE_PASSWORD`

### Error: "No se pudo conectar con SUNAT"
**Causa:** Problema de red o SUNAT fuera de línea
**Solución:**
- Verifica conexión a Internet
- SUNAT BETA a veces está offline, intenta más tarde
- Verifica firewall

### Error: "La factura fue rechazada por SUNAT"
**Causa:** Datos incorrectos en el comprobante
**Solución:** Revisa `errores_sunat` en el comprobante, corrige y reenvía

### Warning: "Logo not found"
**Causa:** No hay logo en `public/logo-empresa.png`
**Solución:** Es solo advertencia, el PDF se genera sin logo

---

## 📊 Monitoreo

### Logs
- Laravel: `storage/logs/laravel.log`
- Base de datos: Tabla `error_logs`
- SUNAT: Tabla `sunat_logs`

### Verificar Estado
```sql
-- Comprobantes por estado
SELECT estado, COUNT(*) as total
FROM comprobantes
GROUP BY estado;

-- Últimos errores
SELECT * FROM error_logs
ORDER BY created_at DESC
LIMIT 10;

-- Logs de SUNAT
SELECT * FROM sunat_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist de Pruebas

### Pruebas Básicas
- [ ] Verificar configuración
- [ ] Verificar estado SUNAT
- [ ] Generar factura de prueba
- [ ] Descargar PDF
- [ ] Descargar XML
- [ ] Descargar CDR

### Pruebas Avanzadas
- [ ] Crear factura manual
- [ ] Enviar comprobante por email
- [ ] Facturación automática de compra
- [ ] Reenviar comprobante rechazado
- [ ] Consultar estado de comprobante
- [ ] Anular comprobante

### Pruebas de Integración
- [ ] Webhook de pago → Facturación automática
- [ ] Stock se descuenta correctamente
- [ ] Compra queda vinculada con comprobante_id
- [ ] Cliente recibe email con PDF/XML

---

## 📚 Documentación Adicional

- **Greenter:** https://greenter.dev
- **SUNAT OSE:** https://cpe.sunat.gob.pe
- **Guía de facturación electrónica:** Ver `PRUEBAS_FACTURACION_BETA.md`

---

## 🎉 ¡Todo Listo!

Tu sistema está 100% funcional para hacer pruebas BETA.

**Próximo paso:** Ejecuta el endpoint de prueba para generar tu primera factura:

```bash
GET http://localhost:8000/api/facturacion/test/generar-factura-prueba
```

¡Buena suerte con las pruebas! 🚀
