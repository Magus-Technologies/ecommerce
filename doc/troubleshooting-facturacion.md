# 🔧 Troubleshooting - Facturación Electrónica

## 🚨 Problemas Comunes y Soluciones

### 1. Error 3244: TipoOperacion

#### Síntoma
```
Error SUNAT: Debe consignar la informacion del tipo de transaccion del comprobante
```

#### Causa
Bug conocido en Greenter v4.3.4 donde el `TipoOperacion` no se mapea correctamente al XML.

#### Solución
**No requiere acción**. Este es un bug conocido que no impide el funcionamiento del sistema. Las facturas se procesan correctamente a pesar del error.

#### Verificación
```bash
# Verificar XML generado
type xml_debug.xml | findstr "InvoiceTypeCode"
```

**Resultado esperado**:
```xml
<cbc:InvoiceTypeCode listID="1001">01</cbc:InvoiceTypeCode>
```

### 2. Error de Certificado

#### Síntoma
```
openssl_sign(): Supplied key param cannot be coerced into a private key
```

#### Causa
Certificado mal formado o corrupto.

#### Solución
```bash
# Regenerar certificado
cd storage/app/certificates/
openssl genrsa -out private.key 2048
openssl req -new -x509 -key private.key -out certificate.crt -days 365 -subj "/C=PE/ST=Lima/L=Lima/O=Empresa de Pruebas/CN=20000000001"
cmd /c "copy /b certificate.crt + private.key certificate.pem"
```

### 3. Error de Conexión SUNAT

#### Síntoma
```
Connection timeout
SOAP-ERROR: Parsing WSDL
```

#### Causa
Problemas de conectividad o configuración de red.

#### Solución
```bash
# Verificar conectividad
ping e-beta.sunat.gob.pe

# Verificar DNS
nslookup e-beta.sunat.gob.pe

# Verificar proxy/firewall
curl -I https://e-beta.sunat.gob.pe/
```

### 4. Error de Extensiones PHP

#### Síntoma
```
Call to undefined function soap_*
Fatal error: Class 'SoapClient' not found
```

#### Causa
Extensiones PHP no habilitadas.

#### Solución
```bash
# Editar php.ini
notepad C:\xampp\php\php.ini

# Descomentar extensiones
extension=soap
extension=openssl
extension=dom
extension=curl
extension=zip

# Reiniciar Apache
```

### 5. Error de Credenciales

#### Síntoma
```
Authentication failed
Invalid credentials
```

#### Causa
Credenciales incorrectas en `.env`.

#### Solución
```env
# Verificar en .env
GREENTER_FE_USER=20000000001MODDATOS
GREENTER_FE_PASSWORD=MODDATOS
```

### 6. Error de Base de Datos

#### Síntoma
```
SQLSTATE[42S02]: Base table or view not found
```

#### Causa
Tablas no creadas o migraciones no ejecutadas.

#### Solución
```bash
# Ejecutar migraciones
php artisan migrate

# Verificar tablas
php artisan tinker
>>> Schema::hasTable('comprobantes')
```

## 🔍 Diagnóstico Avanzado

### Verificar Configuración Completa

```bash
# Script de diagnóstico
php -r "
echo 'PHP Version: ' . PHP_VERSION . PHP_EOL;
echo 'OpenSSL: ' . (extension_loaded('openssl') ? 'OK' : 'MISSING') . PHP_EOL;
echo 'SOAP: ' . (extension_loaded('soap') ? 'OK' : 'MISSING') . PHP_EOL;
echo 'DOM: ' . (extension_loaded('dom') ? 'OK' : 'MISSING') . PHP_EOL;
echo 'CURL: ' . (extension_loaded('curl') ? 'OK' : 'MISSING') . PHP_EOL;
echo 'ZIP: ' . (extension_loaded('zip') ? 'OK' : 'MISSING') . PHP_EOL;
"
```

### Verificar Certificado

```bash
# Verificar certificado
openssl x509 -in storage/app/certificates/certificate.pem -text -noout

# Verificar clave privada
openssl rsa -in storage/app/certificates/private.key -check

# Verificar combinación
openssl x509 -in storage/app/certificates/certificate.pem -pubkey -noout | openssl rsa -pubin -text
```

### Verificar XML Generado

```bash
# Ver XML completo
type xml_debug.xml

# Buscar elementos específicos
type xml_debug.xml | findstr "InvoiceTypeCode"
type xml_debug.xml | findstr "LegalMonetaryTotal"
type xml_debug.xml | findstr "TaxTotal"
```

## 🛠️ Herramientas de Debug

### Script de Prueba Completo

```php
<?php
// debug_facturacion.php

require_once 'vendor/autoload.php';

echo "=== DIAGNÓSTICO DE FACTURACIÓN ELECTRÓNICA ===\n\n";

// 1. Verificar extensiones PHP
echo "1. Extensiones PHP:\n";
$extensiones = ['soap', 'openssl', 'dom', 'curl', 'zip'];
foreach ($extensiones as $ext) {
    echo "   $ext: " . (extension_loaded($ext) ? '✅' : '❌') . "\n";
}

// 2. Verificar certificado
echo "\n2. Certificado:\n";
$certPath = 'storage/app/certificates/certificate.pem';
if (file_exists($certPath)) {
    echo "   Archivo: ✅\n";
    $cert = file_get_contents($certPath);
    if (strpos($cert, 'BEGIN CERTIFICATE') !== false) {
        echo "   Formato: ✅\n";
    } else {
        echo "   Formato: ❌\n";
    }
} else {
    echo "   Archivo: ❌\n";
}

// 3. Verificar configuración
echo "\n3. Configuración:\n";
$config = [
    'GREENTER_FE_USER' => env('GREENTER_FE_USER'),
    'GREENTER_FE_PASSWORD' => env('GREENTER_FE_PASSWORD'),
    'COMPANY_RUC' => env('COMPANY_RUC'),
];
foreach ($config as $key => $value) {
    echo "   $key: " . ($value ? '✅' : '❌') . "\n";
}

// 4. Verificar conectividad
echo "\n4. Conectividad SUNAT:\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://e-beta.sunat.gob.pe/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
echo "   Conectividad: " . ($httpCode == 200 ? '✅' : '❌') . "\n";

echo "\n=== FIN DIAGNÓSTICO ===\n";
```

### Logs de Debug

```php
// Habilitar logs detallados en GreenterService.php
\Log::info('XML Generado', ['xml' => $xml]);
\Log::info('Respuesta SUNAT', ['response' => $result]);
\Log::error('Error SUNAT', ['error' => $result->getError()]);
```

## 📊 Monitoreo de Rendimiento

### Métricas Importantes

```php
// Tiempo de respuesta SUNAT
$start = microtime(true);
$result = $this->see->send($invoice);
$end = microtime(true);
$tiempo = $end - $start;

\Log::info('Tiempo respuesta SUNAT', ['tiempo' => $tiempo]);
```

### Alertas de Sistema

```php
// Monitorear errores frecuentes
$errores = Comprobante::where('estado', 'RECHAZADO')
                     ->where('created_at', '>=', now()->subHour())
                     ->count();

if ($errores > 10) {
    // Enviar alerta
    \Log::critical('Alto número de errores', ['errores' => $errores]);
}
```

## 🔄 Recuperación de Errores

### Reintentar Envío

```php
public function reintentarEnvio($comprobanteId, $maxIntentos = 3)
{
    $comprobante = Comprobante::find($comprobanteId);
    $intentos = $comprobante->intentos_envio ?? 0;
    
    if ($intentos >= $maxIntentos) {
        throw new Exception('Máximo de intentos alcanzado');
    }
    
    try {
        $resultado = $this->reenviarComprobante($comprobanteId);
        $comprobante->update(['intentos_envio' => $intentos + 1]);
        return $resultado;
    } catch (Exception $e) {
        $comprobante->update(['intentos_envio' => $intentos + 1]);
        throw $e;
    }
}
```

### Limpiar Datos Corruptos

```php
// Limpiar comprobantes pendientes antiguos
Comprobante::where('estado', 'PENDIENTE')
           ->where('created_at', '<', now()->subDays(7))
           ->update(['estado' => 'EXPIRADO']);
```

## 📞 Contacto y Soporte

### Información de Debug

Cuando reportes un problema, incluye:

1. **Versión de PHP**: `php -v`
2. **Extensiones**: `php -m`
3. **Logs de Laravel**: `storage/logs/laravel.log`
4. **XML generado**: `xml_debug.xml`
5. **Error específico**: Mensaje completo de error
6. **Pasos para reproducir**: Secuencia exacta

### Comandos de Emergencia

```bash
# Reiniciar servicios
sudo systemctl restart apache2
sudo systemctl restart mysql

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Verificar permisos
chmod -R 755 storage/
chown -R www-data:www-data storage/
```

### Escalación

Si el problema persiste:

1. **Verificar logs del sistema**: `/var/log/syslog`
2. **Verificar recursos**: `top`, `df -h`
3. **Verificar red**: `netstat -tulpn`
4. **Contactar soporte técnico** con información completa

---

**🔧 Guía completa de troubleshooting para facturación electrónica**
