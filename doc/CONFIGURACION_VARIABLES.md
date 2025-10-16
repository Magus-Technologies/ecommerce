# Configuración y Variables de Entorno

## Índice
1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración de Greenter](#configuración-de-greenter)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración del Servidor](#configuración-del-servidor)
5. [Configuración de Almacenamiento](#configuración-de-almacenamiento)
6. [Configuración de Email](#configuración-de-email)
7. [Configuración de Cron Jobs](#configuración-de-cron-jobs)
8. [Permisos y Seguridad](#permisos-y-seguridad)

---

## Variables de Entorno

### Archivo .env

Agregar las siguientes variables al archivo `.env`:

```bash
# ============================================
# FACTURACIÓN ELECTRÓNICA - GREENTER
# ============================================

# Ambiente SUNAT (beta para pruebas, prod para producción)
GREENTER_ENV=beta

# Credenciales SOL SUNAT
GREENTER_SOL_USER=MODDATOS
GREENTER_SOL_PASS=moddatos

# Datos del Emisor (Empresa)
EMPRESA_RUC=20123456789
EMPRESA_RAZON=MI EMPRESA SAC
EMPRESA_NOMBRE_COMERCIAL=Mi Empresa
EMPRESA_UBIGEO=150101
EMPRESA_DIRECCION=Av. Principal 123
EMPRESA_DEPARTAMENTO=LIMA
EMPRESA_PROVINCIA=LIMA
EMPRESA_DISTRITO=LIMA
EMPRESA_EMAIL=facturacion@miempresa.com
EMPRESA_TELEFONO=987654321

# Certificado Digital
CERT_PFX_PATH=storage/certificados/certificado.pfx
CERT_PFX_PASS=contraseña_del_certificado

# Rutas de almacenamiento
STORAGE_XML_PATH=storage/app/public/xml
STORAGE_CDR_PATH=storage/app/public/cdr
STORAGE_PDF_PATH=storage/app/public/pdf
STORAGE_QR_PATH=storage/app/public/qr
STORAGE_CERTIFICADOS_PATH=storage/app/certificados

# URLs públicas de storage
STORAGE_XML_URL="${APP_URL}/storage/xml"
STORAGE_CDR_URL="${APP_URL}/storage/cdr"
STORAGE_PDF_URL="${APP_URL}/storage/pdf"
STORAGE_QR_URL="${APP_URL}/storage/qr"

# Configuración de facturación
FACTURACION_IGV_PORCENTAJE=18.00
FACTURACION_MONEDA_DEFAULT=PEN
FACTURACION_MAX_REINTENTOS=3
FACTURACION_DELAY_REINTENTOS=300

# Resumen Diario
FACTURACION_RC_AUTO=true
FACTURACION_RC_HORA=23:30

# Límites
FACTURACION_BOLETA_MAX_SIN_DOC=700.00
FACTURACION_BAJA_BOLETA_DIAS=7

# Logo empresa
EMPRESA_LOGO_PATH=storage/app/public/logo/logo.png
EMPRESA_LOGO_URL="${APP_URL}/storage/logo/logo.png"
```

---

## Configuración de Greenter

### 1. Instalar Greenter vía Composer

```bash
composer require greenter/greenter
composer require greenter/xml-parser
composer require greenter/report
composer require greenter/ws
```

### 2. Configuración en Laravel

Crear archivo de configuración `config/greenter.php`:

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ambiente SUNAT
    |--------------------------------------------------------------------------
    |
    | beta: Ambiente de pruebas
    | prod: Ambiente de producción
    |
    */
    'env' => env('GREENTER_ENV', 'beta'),

    /*
    |--------------------------------------------------------------------------
    | Credenciales SOL
    |--------------------------------------------------------------------------
    */
    'sol' => [
        'user' => env('GREENTER_SOL_USER', 'MODDATOS'),
        'pass' => env('GREENTER_SOL_PASS', 'moddatos'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Endpoints SUNAT
    |--------------------------------------------------------------------------
    */
    'endpoints' => [
        'beta' => [
            'factura' => 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
            'guia' => 'https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-gem-beta/billService',
            'retenciones' => 'https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService',
        ],
        'prod' => [
            'factura' => 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
            'guia' => 'https://e-guiaremision.sunat.gob.pe/ol-ti-itemision-guia-gem/billService',
            'retenciones' => 'https://e-factura.sunat.gob.pe/ol-ti-itemision-otroscpe-gem/billService',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Datos del Emisor
    |--------------------------------------------------------------------------
    */
    'empresa' => [
        'ruc' => env('EMPRESA_RUC'),
        'razon_social' => env('EMPRESA_RAZON'),
        'nombre_comercial' => env('EMPRESA_NOMBRE_COMERCIAL'),
        'ubigeo' => env('EMPRESA_UBIGEO'),
        'direccion' => env('EMPRESA_DIRECCION'),
        'departamento' => env('EMPRESA_DEPARTAMENTO'),
        'provincia' => env('EMPRESA_PROVINCIA'),
        'distrito' => env('EMPRESA_DISTRITO'),
        'email' => env('EMPRESA_EMAIL'),
        'telefono' => env('EMPRESA_TELEFONO'),
        'logo_path' => env('EMPRESA_LOGO_PATH'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Certificado Digital
    |--------------------------------------------------------------------------
    */
    'certificado' => [
        'pfx_path' => env('CERT_PFX_PATH'),
        'pfx_pass' => env('CERT_PFX_PASS'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rutas de Almacenamiento
    |--------------------------------------------------------------------------
    */
    'storage' => [
        'xml' => env('STORAGE_XML_PATH', 'storage/app/public/xml'),
        'cdr' => env('STORAGE_CDR_PATH', 'storage/app/public/cdr'),
        'pdf' => env('STORAGE_PDF_PATH', 'storage/app/public/pdf'),
        'qr' => env('STORAGE_QR_PATH', 'storage/app/public/qr'),
        'certificados' => env('STORAGE_CERTIFICADOS_PATH', 'storage/app/certificados'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Facturación
    |--------------------------------------------------------------------------
    */
    'facturacion' => [
        'igv_porcentaje' => env('FACTURACION_IGV_PORCENTAJE', 18.00),
        'moneda_default' => env('FACTURACION_MONEDA_DEFAULT', 'PEN'),
        'max_reintentos' => env('FACTURACION_MAX_REINTENTOS', 3),
        'delay_reintentos' => env('FACTURACION_DELAY_REINTENTOS', 300),
        'boleta_max_sin_doc' => env('FACTURACION_BOLETA_MAX_SIN_DOC', 700.00),
        'baja_boleta_dias' => env('FACTURACION_BAJA_BOLETA_DIAS', 7),
    ],

    /*
    |--------------------------------------------------------------------------
    | Resumen Diario
    |--------------------------------------------------------------------------
    */
    'resumen_diario' => [
        'auto' => env('FACTURACION_RC_AUTO', true),
        'hora' => env('FACTURACION_RC_HORA', '23:30'),
    ],
];
```

---

## Instalación de Dependencias

### Dependencias de PHP

```bash
# Greenter (Facturación electrónica)
composer require greenter/greenter
composer require greenter/xml-parser
composer require greenter/report
composer require greenter/ws

# Para generar PDFs
composer require barryvdh/laravel-dompdf
# o
composer require tecnickcom/tcpdf

# Para generar códigos QR
composer require bacon/bacon-qr-code

# Para conversión de números a letras
composer require luecano/numero-a-letras

# Para encriptación avanzada (certificados)
# Ya incluido en Laravel, pero asegurar OpenSSL
```

### Dependencias del sistema (Linux/Ubuntu)

```bash
# OpenSSL (para certificados digitales)
sudo apt-get install openssl
sudo apt-get install php-openssl

# XML extensions
sudo apt-get install php-xml
sudo apt-get install php-soap

# ZIP (para CDR)
sudo apt-get install php-zip

# Imagick (para QR y PDFs)
sudo apt-get install php-imagick

# Reiniciar PHP-FPM
sudo systemctl restart php8.1-fpm
```

### Configuración de composer.json

```json
{
    "require": {
        "php": "^8.1",
        "laravel/framework": "^10.0",
        "greenter/greenter": "^6.0",
        "greenter/xml-parser": "^3.0",
        "greenter/report": "^5.0",
        "greenter/ws": "^5.0",
        "barryvdh/laravel-dompdf": "^2.0",
        "bacon/bacon-qr-code": "^2.0",
        "luecano/numero-a-letras": "^3.0"
    }
}
```

---

## Configuración del Servidor

### Configuración de Apache

```apache
# .htaccess o VirtualHost

<VirtualHost *:80>
    ServerName miempresa.com
    DocumentRoot /var/www/ecommerce-back/public

    <Directory /var/www/ecommerce-back/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Habilitar módulos necesarios
    # a2enmod rewrite
    # a2enmod ssl (para HTTPS)

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

# Para HTTPS (obligatorio en producción)
<VirtualHost *:443>
    ServerName miempresa.com
    DocumentRoot /var/www/ecommerce-back/public

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/miempresa.crt
    SSLCertificateKeyFile /etc/ssl/private/miempresa.key

    <Directory /var/www/ecommerce-back/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Configuración de Nginx

```nginx
server {
    listen 80;
    server_name miempresa.com;
    root /var/www/ecommerce-back/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # Aumentar límites para upload de certificados
    client_max_body_size 10M;
}

# HTTPS (producción)
server {
    listen 443 ssl;
    server_name miempresa.com;
    root /var/www/ecommerce-back/public;

    ssl_certificate /etc/ssl/certs/miempresa.crt;
    ssl_certificate_key /etc/ssl/private/miempresa.key;

    # ... resto de configuración igual
}
```

### Configuración de PHP (php.ini)

```ini
; Aumentar límites para procesamiento
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
post_max_size = 20M
upload_max_filesize = 10M

; Habilitar extensiones necesarias
extension=openssl
extension=soap
extension=xml
extension=zip
extension=gd
extension=imagick

; Zona horaria (Perú)
date.timezone = America/Lima

; Manejo de errores (desarrollo)
display_errors = On
error_reporting = E_ALL

; Producción
display_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
log_errors = On
error_log = /var/log/php/error.log
```

---

## Configuración de Almacenamiento

### Crear directorios

```bash
# Desde la raíz del proyecto
php artisan storage:link

# Crear directorios específicos
mkdir -p storage/app/public/xml
mkdir -p storage/app/public/cdr
mkdir -p storage/app/public/pdf
mkdir -p storage/app/public/qr
mkdir -p storage/app/public/logo
mkdir -p storage/app/certificados

# Establecer permisos
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Cambiar propietario (usuario web server)
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

### Configuración de filesystem (config/filesystems.php)

```php
'disks' => [
    // ... otros disks

    'xml' => [
        'driver' => 'local',
        'root' => storage_path('app/public/xml'),
        'url' => env('APP_URL').'/storage/xml',
        'visibility' => 'public',
    ],

    'cdr' => [
        'driver' => 'local',
        'root' => storage_path('app/public/cdr'),
        'url' => env('APP_URL').'/storage/cdr',
        'visibility' => 'public',
    ],

    'certificados' => [
        'driver' => 'local',
        'root' => storage_path('app/certificados'),
        'visibility' => 'private', // IMPORTANTE: privado
    ],

    'qr' => [
        'driver' => 'local',
        'root' => storage_path('app/public/qr'),
        'url' => env('APP_URL').'/storage/qr',
        'visibility' => 'public',
    ],
],
```

---

## Configuración de Email

### Variables de entorno para email

```bash
# .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=facturacion@miempresa.com
MAIL_PASSWORD=contraseña_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=facturacion@miempresa.com
MAIL_FROM_NAME="${APP_NAME}"

# Para Gmail, generar contraseña de aplicación:
# https://myaccount.google.com/apppasswords
```

### Configuración de mail (config/mail.php)

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'facturacion@miempresa.com'),
    'name' => env('MAIL_FROM_NAME', 'Mi Empresa SAC'),
],

'mailers' => [
    'smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', 'smtp.gmail.com'),
        'port' => env('MAIL_PORT', 587),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'timeout' => null,
    ],
],
```

### Plantilla de email (resources/views/emails/comprobante.blade.php)

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Comprobante Electrónico</title>
</head>
<body>
    <h2>{{ $empresa_nombre }}</h2>
    <p>Estimado(a) {{ $cliente_nombre }},</p>

    <p>Adjuntamos su comprobante de pago electrónico:</p>

    <ul>
        <li><strong>Tipo:</strong> {{ $tipo_comprobante }}</li>
        <li><strong>Número:</strong> {{ $numero_comprobante }}</li>
        <li><strong>Fecha:</strong> {{ $fecha_emision }}</li>
        <li><strong>Total:</strong> S/ {{ $total }}</li>
    </ul>

    <p>Este comprobante ha sido aceptado por SUNAT.</p>

    <p>Gracias por su preferencia.</p>

    <hr>
    <small>{{ $empresa_nombre }} | RUC {{ $empresa_ruc }}</small>
</body>
</html>
```

---

## Configuración de Cron Jobs

### Agregar tareas programadas (Laravel Scheduler)

**Archivo: app/Console/Kernel.php**

```php
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Procesar cola de reintentos cada 5 minutos
        $schedule->command('facturacion:procesar-reintentos')
                 ->everyFiveMinutes()
                 ->withoutOverlapping();

        // Generar Resumen Diario automáticamente a las 23:30
        $schedule->command('facturacion:generar-resumen-diario')
                 ->dailyAt('23:30')
                 ->withoutOverlapping();

        // Consultar estado de resúmenes pendientes cada 2 minutos
        $schedule->command('facturacion:consultar-resumenes-pendientes')
                 ->everyTwoMinutes()
                 ->withoutOverlapping();

        // Consultar estado de bajas pendientes cada 2 minutos
        $schedule->command('facturacion:consultar-bajas-pendientes')
                 ->everyTwoMinutes()
                 ->withoutOverlapping();

        // Limpiar archivos temporales viejos (>30 días)
        $schedule->command('facturacion:limpiar-archivos-viejos')
                 ->daily()
                 ->at('02:00');

        // Backup diario de comprobantes
        $schedule->command('facturacion:backup-comprobantes')
                 ->daily()
                 ->at('03:00');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
```

### Configurar cron en el servidor

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar scheduler de Laravel cada minuto)
* * * * * cd /var/www/ecommerce-back && php artisan schedule:run >> /dev/null 2>&1

# Para verificar que funciona
# tail -f storage/logs/laravel.log
```

### Comandos Artisan personalizados

**Crear comando:**
```bash
php artisan make:command Facturacion/ProcesarReintentos
php artisan make:command Facturacion/GenerarResumenDiario
php artisan make:command Facturacion/ConsultarResumenesPendientes
php artisan make:command Facturacion/ConsultarBajasPendientes
```

---

## Permisos y Seguridad

### Permisos de archivos

```bash
# Directorio raíz del proyecto
chmod 755 /var/www/ecommerce-back

# Storage y cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Certificados (PRIVADO)
chmod 700 storage/app/certificados
chmod 600 storage/app/certificados/*.pfx

# Owner (usuario del web server)
chown -R www-data:www-data /var/www/ecommerce-back

# .env debe ser privado
chmod 600 .env
```

### Seguridad del certificado digital

**NUNCA** subir el certificado .pfx al repositorio Git:

```bash
# .gitignore
storage/app/certificados/*.pfx
.env
```

**Cifrar certificado en BD:**

```php
// Al guardar
$certificado->password_cifrado = encrypt($request->password);

// Al usar
$password = decrypt($certificado->password_cifrado);
```

### Variables sensibles

```bash
# Usar Laravel Encryption para:
- Contraseña SOL SUNAT
- Contraseña del certificado .pfx
- Credenciales de base de datos
- API keys

# Generar nueva APP_KEY si es necesario
php artisan key:generate
```

### HTTPS en producción

**OBLIGATORIO usar HTTPS** para:
- Endpoints de la API
- Subida de certificados
- Descarga de XML/CDR/PDF

```bash
# Instalar Certbot (Let's Encrypt)
sudo apt-get install certbot python3-certbot-apache

# Obtener certificado SSL gratuito
sudo certbot --apache -d miempresa.com -d www.miempresa.com

# Renovación automática
sudo certbot renew --dry-run
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw enable

# Bloquear acceso directo a storage desde IP externas (opcional)
# Configurar en nginx/apache
```

### Rate Limiting

**Archivo: app/Http/Kernel.php**

```php
protected $middlewareGroups = [
    'api' => [
        'throttle:60,1', // 60 requests por minuto
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];

// Rate limit específico para facturación
protected $routeMiddleware = [
    'throttle.facturacion' => \App\Http\Middleware\ThrottleFacturacion::class,
];
```

**routes/api.php:**
```php
Route::middleware(['auth:api', 'throttle.facturacion'])
    ->prefix('facturacion')
    ->group(function () {
        Route::post('/ventas/{id}/facturar', [FacturacionController::class, 'facturar']);
        // ... otros endpoints
    });
```

---

## Configuración de Base de Datos

### Variables de entorno

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_facturacion
DB_USERNAME=usuario_db
DB_PASSWORD=contraseña_segura

# Para conexión remota o réplicas
DB_READ_HOST=replica.miempresa.com
DB_WRITE_HOST=master.miempresa.com
```

### Optimizaciones de MySQL

```sql
-- my.cnf o my.ini

[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Para queries de facturación
query_cache_size = 64M
query_cache_type = 1
```

---

## Checklist de Configuración Inicial

### Antes de empezar:

- [ ] Instalar PHP 8.1+ con extensiones (openssl, soap, xml, zip)
- [ ] Instalar Composer
- [ ] Instalar base de datos MySQL/PostgreSQL
- [ ] Configurar servidor web (Apache/Nginx)
- [ ] Obtener certificado SSL para HTTPS
- [ ] Obtener certificado digital .pfx de SUNAT
- [ ] Obtener credenciales SOL de SUNAT
- [ ] Configurar cuenta de email para envíos

### Configuración del proyecto:

- [ ] Clonar repositorio
- [ ] `composer install`
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar variables de entorno
- [ ] `php artisan key:generate`
- [ ] `php artisan migrate`
- [ ] `php artisan db:seed` (catálogos SUNAT)
- [ ] `php artisan storage:link`
- [ ] Crear directorios de storage
- [ ] Establecer permisos correctos
- [ ] Subir certificado .pfx
- [ ] Configurar datos del emisor
- [ ] Crear series de comprobantes
- [ ] Configurar cron jobs
- [ ] Probar envío de email
- [ ] Probar emisión en ambiente beta

### Testing:

- [ ] Emitir boleta de prueba
- [ ] Emitir factura de prueba
- [ ] Emitir nota de crédito
- [ ] Generar resumen diario
- [ ] Enviar comunicación de baja
- [ ] Verificar PDFs generados
- [ ] Verificar emails enviados
- [ ] Probar reintentos
- [ ] Revisar logs de auditoría

---

## Troubleshooting

### Error: "Certificate not found"

```bash
# Verificar que el certificado existe
ls -la storage/app/certificados/

# Verificar permisos
chmod 600 storage/app/certificados/*.pfx

# Verificar ruta en .env
CERT_PFX_PATH=storage/certificados/certificado.pfx
```

### Error: "SOAP connection timeout"

```bash
# Aumentar timeout en php.ini
default_socket_timeout = 300

# Verificar firewall
sudo ufw status

# Verificar DNS
ping e-beta.sunat.gob.pe
```

### Error: "Class 'Greenter\...' not found"

```bash
# Reinstalar dependencias
composer dump-autoload
composer require greenter/greenter

# Verificar autoload en composer.json
```

### Logs para debugging

```bash
# Logs de Laravel
tail -f storage/logs/laravel.log

# Logs de Apache
tail -f /var/log/apache2/error.log

# Logs de Nginx
tail -f /var/log/nginx/error.log

# Logs de PHP
tail -f /var/log/php8.1-fpm.log
```

---

**Versión:** 1.0
**Fecha:** 2025-10-13
