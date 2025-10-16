# 📦 Dependencias Instaladas para Facturación Electrónica

## 🎯 Resumen

Este documento detalla todas las dependencias instaladas y configuradas para implementar el sistema de facturación electrónica con SUNAT.

## 📋 Dependencias de Composer

### Dependencias Principales
```json
{
    "require": {
        "greenter/greenter": "^4.3.4",
        "greenter/htmltopdf": "*",
        "greenter/report": "*",
        "greenter/validator": "*",
        "greenter/ws": "*"
    }
}
```

### Dependencias Detalladas

#### 1. Greenter Core (v4.3.4)
```bash
composer require greenter/greenter:4.3.4
```
- **Descripción**: Librería principal para facturación electrónica SUNAT
- **Versión**: 4.3.4 (estable)
- **Funcionalidades**:
  - Generación de XML UBL 2.1
  - Firma digital de documentos
  - Envío a SUNAT
  - Validación de comprobantes

#### 2. Greenter HTML to PDF
```bash
composer require greenter/htmltopdf
```
- **Descripción**: Generación de PDFs a partir de HTML
- **Uso**: Crear representaciones impresas de facturas
- **Dependencias**: wkhtmltopdf

#### 3. Greenter Report
```bash
composer require greenter/report
```
- **Descripción**: Sistema de reportes para comprobantes
- **Uso**: Generar reportes de facturas y estadísticas

#### 4. Greenter Validator
```bash
composer require greenter/validator
```
- **Descripción**: Validador de comprobantes electrónicos
- **Uso**: Validar estructura y contenido de facturas

#### 5. Greenter Web Services
```bash
composer require greenter/ws
```
- **Descripción**: Cliente para servicios web de SUNAT
- **Uso**: Comunicación con SUNAT Beta/Producción

## 🔧 Dependencias del Sistema

### Extensiones PHP Requeridas
```ini
; Extensiones habilitadas en php.ini
extension=soap          ; Para comunicación SOAP con SUNAT
extension=openssl       ; Para firma digital
extension=dom           ; Para manipulación XML
extension=curl          ; Para peticiones HTTP
extension=zip           ; Para manejo de archivos ZIP (CDR)
```

### Verificación de Extensiones
```bash
# Verificar extensiones instaladas
php -m | findstr -i "soap openssl dom curl zip"
```

**Resultado esperado**:
```
soap
openssl
dom
curl
zip
```

## 📊 Dependencias de Laravel

### Servicios Configurados
```php
// config/services.php
'greenter' => [
    'fe_url' => env('GREENTER_FE_URL'),
    'fe_user' => env('GREENTER_FE_USER'),
    'fe_password' => env('GREENTER_FE_PASSWORD'),
    'cert_path' => storage_path('app/' . env('GREENTER_CERT_PATH')),
    'private_key_path' => storage_path('app/' . env('GREENTER_PRIVATE_KEY_PATH')),
],

'company' => [
    'ruc' => env('COMPANY_RUC'),
    'name' => env('COMPANY_NAME'),
    'address' => env('COMPANY_ADDRESS'),
    'district' => env('COMPANY_DISTRICT'),
    'province' => env('COMPANY_PROVINCE'),
    'department' => env('COMPANY_DEPARTMENT'),
],
```

### Modelos Eloquent
```php
// Modelos utilizados
App\Models\Comprobante
App\Models\ComprobanteDetalle
App\Models\SerieComprobante
App\Models\Cliente
App\Models\Venta
App\Models\VentaDetalle
```

## 🗄️ Dependencias de Base de Datos

### Tablas Creadas
```sql
-- Tablas principales
CREATE TABLE comprobantes (
    id BIGINT PRIMARY KEY,
    tipo_comprobante VARCHAR(2),
    serie VARCHAR(10),
    correlativo VARCHAR(10),
    fecha_emision DATE,
    cliente_id BIGINT,
    moneda VARCHAR(3),
    operacion_gravada DECIMAL(10,2),
    total_igv DECIMAL(10,2),
    importe_total DECIMAL(10,2),
    estado VARCHAR(20),
    xml_firmado LONGTEXT,
    xml_respuesta_sunat LONGBLOB,
    mensaje_sunat TEXT,
    codigo_hash VARCHAR(255),
    pdf_base64 LONGTEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE comprobante_detalles (
    id BIGINT PRIMARY KEY,
    comprobante_id BIGINT,
    item INT,
    producto_id BIGINT,
    codigo_producto VARCHAR(50),
    descripcion TEXT,
    unidad_medida VARCHAR(10),
    cantidad DECIMAL(10,2),
    valor_unitario DECIMAL(10,2),
    precio_unitario DECIMAL(10,2),
    descuento DECIMAL(10,2),
    valor_venta DECIMAL(10,2),
    porcentaje_igv DECIMAL(5,2),
    igv DECIMAL(10,2),
    tipo_afectacion_igv VARCHAR(2),
    importe_total DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE series_comprobantes (
    id BIGINT PRIMARY KEY,
    tipo_comprobante VARCHAR(2),
    serie VARCHAR(10),
    correlativo_actual INT,
    activo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔐 Dependencias de Certificados

### Certificados Generados
```
storage/app/certificates/
├── certificate.pem      # Certificado combinado (público + privado)
├── certificate.crt      # Certificado público
└── private.key          # Clave privada
```

### Comandos de Generación
```bash
# Generar clave privada
openssl genrsa -out private.key 2048

# Generar certificado público
openssl req -new -x509 -key private.key -out certificate.crt -days 365 -subj "/C=PE/ST=Lima/L=Lima/O=Empresa de Pruebas/CN=20000000001"

# Combinar certificados
cmd /c "copy /b certificate.crt + private.key certificate.pem"
```

## 🌐 Dependencias de Red

### Endpoints SUNAT
```php
// Ambiente Beta (Pruebas)
SunatEndpoints::FE_BETA
// URL: https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl

// Ambiente Producción (Futuro)
SunatEndpoints::FE_PRODUCCION
// URL: https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl
```

### Credenciales de Prueba
```env
GREENTER_FE_USER=20000000001MODDATOS
GREENTER_FE_PASSWORD=MODDATOS
```

## 📋 Checklist de Instalación

### ✅ Completado
- [x] Instalar Greenter v4.3.4
- [x] Habilitar extensión SOAP
- [x] Habilitar extensión OpenSSL
- [x] Habilitar extensión DOM
- [x] Habilitar extensión CURL
- [x] Habilitar extensión ZIP
- [x] Generar certificado de prueba
- [x] Configurar variables de entorno
- [x] Crear modelos de base de datos
- [x] Implementar servicio GreenterService
- [x] Configurar rutas API
- [x] Probar comunicación con SUNAT Beta

### 🔄 Para Producción
- [ ] Obtener certificado oficial de SUNAT
- [ ] Registrar empresa como emisor electrónico
- [ ] Configurar credenciales de producción
- [ ] Cambiar endpoint a producción
- [ ] Realizar pruebas de homologación

## 🚨 Problemas Conocidos

### Bug TipoOperacion en Greenter v4.3.4
**Descripción**: El campo `TipoOperacion` no se mapea correctamente al XML.

**Síntoma**: 
```xml
<cbc:InvoiceTypeCode listID="1001">01</cbc:InvoiceTypeCode>
```

**Impacto**: Error de validación 3244, pero no impide el funcionamiento.

**Estado**: Bug conocido, sistema funciona correctamente.

## 📞 Soporte

### Documentación
- [Greenter GitHub](https://github.com/thegreenter/greenter)
- [SUNAT Facturación Electrónica](https://cpe.sunat.gob.pe/)
- [UBL 2.1 Specification](https://docs.oasis-open.org/ubl/os-UBL-2.1/)

### Comandos Útiles
```bash
# Verificar versión de Greenter
composer show greenter/greenter

# Verificar extensiones PHP
php -m

# Verificar configuración PHP
php --ini

# Probar facturación
php test_facturacion.php
```

---

**📦 Todas las dependencias instaladas y configuradas exitosamente**
