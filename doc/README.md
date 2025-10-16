# Documentación - Sistema de Facturación Electrónica

## Bienvenido

Esta es la documentación completa del **Sistema de Facturación Electrónica** con **Greenter** para SUNAT Perú. Incluye todos los módulos, APIs, endpoints, esquemas de base de datos, ejemplos de implementación y guías de configuración necesarias para implementar un sistema completo de emisión de comprobantes de pago electrónicos (CPE).

---

## Índice General

### 1. [API de Facturación Electrónica](API_FACTURACION_ELECTRONICA.md)
Documentación completa de todos los endpoints de la API REST.

**Contenido:**
- Introducción y autenticación
- **Configuración de Emisor**
  - GET/PUT `/facturacion/emisor`
  - POST `/facturacion/emisor/certificado`
- **Catálogos SUNAT**
  - GET `/facturacion/catalogos/:tipo`
  - Tipos de documento, afectación IGV, unidades, motivos NC/ND
- **Series y Correlativos**
  - CRUD de series
  - Reserva segura de correlativos
- **Ventas y Comprobantes**
  - POST `/ventas` - Crear venta
  - POST `/ventas/:id/facturar` - Emitir CPE
  - GET `/ventas/:id/pdf` - Descargar PDF
  - POST `/ventas/:id/email` - Enviar por correo
- **Resumen Diario (RC)**
  - POST `/facturacion/resumenes`
  - GET `/facturacion/resumenes/:ticket`
- **Comunicación de Baja (RA)**
  - POST `/facturacion/bajas`
  - GET `/facturacion/bajas/:ticket`
- **Notas de Crédito/Débito**
  - POST `/facturacion/notas-credito`
  - POST `/facturacion/notas-debito`
- Códigos de respuesta y manejo de errores
- Modelos de datos

---

### 2. [Esquemas de Base de Datos](ESQUEMAS_BASE_DATOS.md)
Diseño completo de la base de datos con todas las tablas necesarias.

**Contenido:**
- Diagrama Entidad-Relación
- **Tablas principales:**
  - `empresas` - Datos del emisor
  - `certificados` - Certificados digitales
  - `series` - Series y correlativos por tipo de CPE
  - `clientes` - Registro de clientes
  - `ventas` y `ventas_items` - Ventas antes de facturar
  - `comprobantes` y `comprobantes_items` - CPE emitidos
  - `resumenes` y `resumenes_detalle` - Resúmenes Diarios (RC)
  - `bajas` y `bajas_detalle` - Comunicaciones de Baja (RA)
  - `auditoria_sunat` - Logs de comunicación con SUNAT
  - `cola_reintentos` - Sistema de reintentos automáticos
- Relaciones entre tablas
- Índices y optimizaciones
- Campos calculados y triggers
- Políticas de backup

---

### 3. [Ejemplos de Implementación](EJEMPLOS_IMPLEMENTACION.md)
Código completo de ejemplo para todos los flujos.

**Contenido:**
- **Configuración Inicial**
  - Configurar datos del emisor
  - Subir certificado digital
  - Crear series de comprobantes
- **Emisión de Boleta (Tipo 03)**
  - Frontend: Crear venta y emitir
  - Backend: Controller completo con Greenter
  - Manejo de respuesta SUNAT
- **Emisión de Factura (Tipo 01)**
  - Validación de RUC
  - Construcción de XML UBL
  - Firma digital y envío
- **Nota de Crédito (Tipo 07)**
  - Anulación total/parcial
  - Devolución de productos
  - Descuentos posteriores
- **Nota de Débito (Tipo 08)**
  - Intereses por mora
  - Aumentos en el valor
- **Resumen Diario (RC)**
  - Generación automática
  - Consulta de ticket (async)
- **Comunicación de Baja (RA)**
  - Anulación de comprobantes
  - Restricciones de tiempo
- **Integración con POS**
  - Flujo completo de punto de venta
  - Carrito, cálculo de totales, emisión
- **Manejo de Errores**
  - Interceptor global
  - Sistema de reintentos con backoff exponencial

---

### 4. [Flujos de Trabajo](FLUJOS_DE_TRABAJO.md)
Diagramas detallados de todos los procesos.

**Contenido:**
- **Flujo General de Facturación**
  - Desde creación de venta hasta emisión de CPE
  - Validaciones, firma, envío, almacenamiento
- **Flujo de Emisión de Boleta**
  - Cliente con DNI/sin documento
  - Validación de monto máximo sin DNI
  - Envío síncrono a SUNAT
  - Inclusión en Resumen Diario
- **Flujo de Emisión de Factura**
  - Validación de RUC obligatorio
  - Tipos de pago (contado/crédito)
  - Fecha de vencimiento
- **Flujo de Nota de Crédito**
  - Selección de CPE a anular/corregir
  - Motivos de NC (catálogo 09)
  - Definición de items (total/parcial)
  - Actualización del CPE original
- **Flujo de Resumen Diario**
  - Cierre del día (23:30)
  - Agrupación de boletas
  - Envío asíncrono (ticket)
  - Consulta de estado cada 30 seg
  - Procesamiento por SUNAT (1-10 min)
- **Flujo de Comunicación de Baja**
  - Validaciones (estado ACEPTADO, plazo 7 días para boletas)
  - Envío asíncrono con ticket
  - Actualización de estado CPE a BAJA
- **Flujo de Reintentos**
  - Captura de errores de red/timeout
  - Cola de reintentos con backoff exponencial
  - Máximo 3 intentos en ~50 minutos
  - Estado FALLIDO requiere intervención manual
- **Flujo POS Completo**
  - Desde apertura de caja hasta cierre
  - Atención de clientes, carrito, facturación
  - Resumen diario automático
  - Arqueo de caja

---

### 5. [Configuración y Variables de Entorno](CONFIGURACION_VARIABLES.md)
Guía completa de configuración del sistema.

**Contenido:**
- **Variables de Entorno (.env)**
  - Ambiente SUNAT (beta/prod)
  - Credenciales SOL
  - Datos del emisor (RUC, razón social, ubigeo)
  - Rutas de certificados y storage
  - Configuración de IGV, moneda, límites
- **Configuración de Greenter**
  - Instalación vía Composer
  - Archivo `config/greenter.php`
  - Endpoints SUNAT (beta/producción)
- **Instalación de Dependencias**
  - PHP: Greenter, DOMPDF, QR, Número a letras
  - Sistema: OpenSSL, SOAP, XML, ZIP
  - Configuración de `composer.json`
- **Configuración del Servidor**
  - Apache: VirtualHost, SSL, módulos
  - Nginx: Server block, FastCGI
  - PHP.ini: límites, extensiones, timezone
- **Configuración de Almacenamiento**
  - Creación de directorios (xml, cdr, pdf, qr, certificados)
  - Permisos correctos (775, 700, 600)
  - Filesystem disks en Laravel
- **Configuración de Email**
  - SMTP (Gmail, Outlook, etc.)
  - Plantilla HTML para envío de comprobantes
- **Configuración de Cron Jobs**
  - Laravel Scheduler
  - Tareas programadas:
    - Reintentos cada 5 min
    - Resumen Diario a las 23:30
    - Consulta de tickets cada 2 min
    - Limpieza de archivos viejos
  - Configuración en crontab del servidor
- **Permisos y Seguridad**
  - Permisos de archivos y directorios
  - Cifrado de certificado .pfx
  - HTTPS obligatorio en producción
  - Rate limiting
  - Firewall
- **Configuración de Base de Datos**
  - Variables de entorno
  - Optimizaciones de MySQL
- **Checklist de Configuración Inicial**
  - Pasos previos
  - Instalación del proyecto
  - Testing
- **Troubleshooting**
  - Errores comunes y soluciones
  - Logs para debugging

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  (Vue.js / React / Angular)                                     │
│                                                                 │
│  - Componentes de Ventas                                        │
│  - Punto de Venta (POS)                                         │
│  - Administración de Series                                     │
│  - Configuración de Emisor                                      │
│  - Reportes y Consultas                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                         BACKEND                                 │
│  (Laravel / PHP)                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CONTROLLERS                                 │  │
│  │  - VentasController                                      │  │
│  │  - FacturacionController                                 │  │
│  │  - SeriesController                                      │  │
│  │  - NotasCreditoController                                │  │
│  │  - ResumenController                                     │  │
│  │  - BajasController                                       │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │              SERVICES                                    │  │
│  │  - GreenterService (integración Greenter)                │  │
│  │  - PDFService (generación de PDFs)                       │  │
│  │  - EmailService (envío de comprobantes)                  │  │
│  │  - QRService (generación de QR)                          │  │
│  │  - NumeroALetrasService                                  │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │              MODELS (Eloquent)                           │  │
│  │  - Venta, VentaItem                                      │  │
│  │  - Comprobante, ComprobanteItem                          │  │
│  │  - Serie, Certificado, Empresa, Cliente                  │  │
│  │  - Resumen, Baja, AuditoriaSunat, ColaReintento         │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  DATABASE   │
                    │   (MySQL)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   STORAGE     │  │   GREENTER    │  │     SUNAT     │
│               │  │   (Library)   │  │               │
│ - XML         │  │               │  │ - Web Services│
│ - CDR         │  │ - Build UBL   │  │ - Endpoints   │
│ - PDF         │  │ - Sign XML    │  │   (beta/prod) │
│ - QR          │  │ - Send SOAP   │  │               │
│ - Certificados│  │ - Parse CDR   │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Módulos del Sistema

### Módulos Core

1. **Gestión de Emisor**
   - Configuración de empresa (RUC, datos fiscales)
   - Gestión de certificados digitales
   - Credenciales SOL SUNAT

2. **Catálogos SUNAT**
   - Tipos de documento de identidad
   - Tipos de afectación IGV
   - Unidades de medida
   - Monedas
   - Motivos de NC/ND

3. **Series y Correlativos**
   - CRUD de series por tipo de CPE
   - Reserva transaccional de correlativos
   - Control por sede/caja

4. **Ventas**
   - Registro de ventas (pre-facturación)
   - Gestión de clientes
   - Cálculo de totales e IGV
   - Conversión de venta a CPE

5. **Comprobantes Electrónicos**
   - Emisión de Boletas (03)
   - Emisión de Facturas (01)
   - Notas de Crédito (07)
   - Notas de Débito (08)
   - Generación de PDF con QR
   - Envío por email

6. **Resumen Diario (RC)**
   - Generación automática al cierre
   - Envío asíncrono con ticket
   - Consulta de estado
   - Almacenamiento de CDR

7. **Comunicación de Baja (RA)**
   - Anulación de comprobantes
   - Validación de plazos
   - Envío asíncrono
   - Actualización de estados

8. **Auditoría y Reintentos**
   - Registro completo de comunicaciones con SUNAT
   - Cola de reintentos con backoff exponencial
   - Logs detallados
   - Notificaciones de errores

---

## Tecnologías Utilizadas

### Backend
- **PHP 8.1+**
- **Laravel 10+**
- **Greenter 6.0+** (biblioteca de facturación electrónica)
- **MySQL 8.0+** o PostgreSQL
- **DOMPDF / TCPDF** (generación de PDFs)
- **BaconQrCode** (generación de códigos QR)

### Frontend
- **Vue.js 3+** / React / Angular
- **Axios** (HTTP client)
- **SweetAlert2** (alertas)
- **Bootstrap / Tailwind** (UI)

### Servidor
- **Apache 2.4+** o **Nginx 1.18+**
- **PHP-FPM**
- **OpenSSL** (firma digital)
- **SOAP** (comunicación con SUNAT)

### Otros
- **Composer** (gestor de dependencias PHP)
- **NPM / Yarn** (gestor de dependencias JS)
- **Git** (control de versiones)
- **Certbot** (certificados SSL gratuitos)

---

## Ambientes de Trabajo

### Desarrollo
- Endpoint SUNAT: **Beta** (`e-beta.sunat.gob.pe`)
- Credenciales SOL: **MODDATOS / moddatos**
- RUC de prueba: **20000000001**
- Certificado: Certificado de prueba proporcionado por SUNAT

### Producción
- Endpoint SUNAT: **Producción** (`e-factura.sunat.gob.pe`)
- Credenciales SOL: **Credenciales reales del contribuyente**
- RUC: **RUC real de la empresa**
- Certificado: **Certificado digital real** emitido por una entidad certificadora autorizada

---

## Requerimientos del Sistema

### Requerimientos mínimos
- **Servidor:** 2 CPU, 4GB RAM, 50GB disco
- **PHP:** 8.1 o superior
- **MySQL:** 8.0 o superior
- **Espacio en disco:** 100GB (para almacenar XML/CDR/PDF)
- **Ancho de banda:** Conexión estable a internet (mínimo 10 Mbps)

### Requerimientos de SUNAT
- RUC activo y válido
- Certificado digital emitido por entidad certificadora autorizada
- Credenciales SOL (Clave SOL SUNAT)
- Afiliación al sistema de facturación electrónica en SUNAT

---

## Guía Rápida de Inicio

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ecommerce-back.git
   cd ecommerce-back
   ```

2. **Instalar dependencias**
   ```bash
   composer install
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   php artisan key:generate
   # Editar .env con tus configuraciones
   ```

4. **Migrar base de datos**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Configurar storage**
   ```bash
   php artisan storage:link
   mkdir -p storage/app/public/{xml,cdr,pdf,qr}
   chmod -R 775 storage
   ```

6. **Subir certificado digital**
   - Colocar archivo `.pfx` en `storage/app/certificados/`
   - Configurar ruta y contraseña en `.env`

7. **Configurar datos del emisor**
   - Ir a `/api/facturacion/emisor`
   - Ingresar RUC, razón social, ubigeo, etc.

8. **Crear series de comprobantes**
   - POST `/api/facturacion/series`
   - Crear series para Boletas (B001), Facturas (F001), NC, ND

9. **Probar emisión**
   - Crear una venta de prueba
   - Emitir boleta/factura
   - Verificar en ambiente beta de SUNAT

10. **Configurar cron jobs**
    ```bash
    crontab -e
    * * * * * cd /var/www/ecommerce-back && php artisan schedule:run
    ```

---

## Soporte y Contribución

### Documentación oficial
- **Greenter:** https://greenter.dev
- **SUNAT:** https://www.sunat.gob.pe
- **Laravel:** https://laravel.com/docs

### Contacto
- **Email:** soporte@miempresa.com
- **GitHub:** https://github.com/tu-usuario/ecommerce-back

### Contribuir
Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## Agradecimientos

- **Greenter Team** - Por la excelente biblioteca de facturación electrónica
- **SUNAT** - Por la documentación y soporte técnico
- **Laravel Community** - Por el framework y los paquetes

---

## Changelog

### v1.0.0 (2025-10-13)
- Documentación completa inicial
- API REST de facturación electrónica
- Esquemas de base de datos
- Ejemplos de implementación
- Flujos de trabajo detallados
- Guía de configuración

---

**Última actualización:** 2025-10-13
**Versión:** 1.0.0
**Autor:** Equipo de Desarrollo
