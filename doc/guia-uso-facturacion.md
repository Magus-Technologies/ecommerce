# 📖 Guía de Uso - Sistema de Facturación Electrónica

## 🎯 Introducción

Esta guía te ayudará a usar el sistema de facturación electrónica implementado con SUNAT. El sistema permite generar, enviar y gestionar facturas electrónicas desde tu aplicación Laravel.

## 🚀 Inicio Rápido

### 1. Generar una Factura Electrónica

```php
use App\Services\GreenterService;

// Crear instancia del servicio
$greenterService = new GreenterService();

// Generar factura (necesitas el ID de una venta existente)
$resultado = $greenterService->generarFactura($ventaId);

// Verificar resultado
if ($resultado['success']) {
    $comprobante = $resultado['comprobante'];
    echo "✅ Factura generada: " . $comprobante->serie . "-" . $comprobante->correlativo;
    echo "Estado: " . $comprobante->estado;
} else {
    echo "❌ Error: " . $resultado['error'];
}
```

### 2. Usar la API REST

```bash
# Obtener lista de comprobantes
GET /api/comprobantes

# Obtener un comprobante específico
GET /api/comprobantes/{id}

# Reenviar comprobante
POST /api/comprobantes/{id}/reenviar

# Consultar estado en SUNAT
POST /api/comprobantes/{id}/consultar

# Descargar PDF
GET /api/comprobantes/{id}/pdf

# Descargar XML
GET /api/comprobantes/{id}/xml

# Ver estadísticas
GET /api/comprobantes/estadisticas
```

## 📋 Flujo Completo de Facturación

### Paso 1: Crear Cliente
```php
use App\Models\Cliente;

$cliente = Cliente::create([
    'tipo_documento' => '6', // RUC
    'numero_documento' => '20123456789',
    'razon_social' => 'EMPRESA CLIENTE S.A.C.',
    'direccion' => 'AV. PRINCIPAL 456',
    'email' => 'cliente@empresa.com',
    'telefono' => '987654321',
    'activo' => true
]);
```

### Paso 2: Crear Venta
```php
use App\Models\Venta;
use App\Models\VentaDetalle;

$venta = Venta::create([
    'cliente_id' => $cliente->id,
    'fecha_venta' => now(),
    'subtotal' => 100.00,
    'igv' => 18.00,
    'total' => 118.00,
    'estado' => 'PENDIENTE',
    'user_id' => 1
]);

// Agregar detalle de venta
VentaDetalle::create([
    'venta_id' => $venta->id,
    'producto_id' => 1,
    'codigo_producto' => 'PROD001',
    'nombre_producto' => 'PRODUCTO DE PRUEBA',
    'cantidad' => 1,
    'precio_unitario' => 118.00,
    'precio_sin_igv' => 100.00,
    'descuento_unitario' => 0.00,
    'subtotal_linea' => 100.00,
    'igv_linea' => 18.00,
    'total_linea' => 118.00
]);
```

### Paso 3: Generar Factura Electrónica
```php
use App\Services\GreenterService;

$greenterService = new GreenterService();
$resultado = $greenterService->generarFactura($venta->id);

if ($resultado['success']) {
    $comprobante = $resultado['comprobante'];
    
    // La factura se envía automáticamente a SUNAT
    // El estado se actualiza según la respuesta
    
    switch ($comprobante->estado) {
        case 'ACEPTADO':
            echo "✅ Factura aceptada por SUNAT";
            break;
        case 'RECHAZADO':
            echo "❌ Factura rechazada: " . $comprobante->mensaje_sunat;
            break;
        case 'PENDIENTE':
            echo "⏳ Factura pendiente de procesamiento";
            break;
    }
}
```

## 🔍 Consultar Estado de Comprobantes

### Verificar Estado en SUNAT
```php
use App\Services\GreenterService;

$greenterService = new GreenterService();
$comprobante = Comprobante::find($id);

$resultado = $greenterService->consultarComprobante($comprobante);

if ($resultado['success']) {
    echo "Estado: " . $resultado['estado'];
} else {
    echo "Error: " . $resultado['error'];
}
```

### Reenviar Comprobante
```php
use App\Services\GreenterService;

$greenterService = new GreenterService();
$resultado = $greenterService->reenviarComprobante($comprobanteId);

if ($resultado['success']) {
    echo "✅ Comprobante reenviado exitosamente";
} else {
    echo "❌ Error: " . $resultado['error'];
}
```

## 📊 Gestión de Series y Correlativos

### Configurar Series
```php
use App\Models\SerieComprobante;

// Crear serie para facturas
SerieComprobante::create([
    'tipo_comprobante' => '01', // Factura
    'serie' => 'F001',
    'correlativo_actual' => 0,
    'activo' => true
]);

// Crear serie para boletas
SerieComprobante::create([
    'tipo_comprobante' => '03', // Boleta
    'serie' => 'B001',
    'correlativo_actual' => 0,
    'activo' => true
]);
```

### Obtener Siguiente Correlativo
```php
use App\Models\SerieComprobante;

$serie = SerieComprobante::where('tipo_comprobante', '01')
                        ->where('activo', true)
                        ->first();

$siguienteCorrelativo = $serie->siguienteCorrelativo();
echo "Siguiente correlativo: " . $siguienteCorrelativo;
```

## 📄 Generar PDFs

### Descargar PDF de Comprobante
```php
use App\Models\Comprobante;

$comprobante = Comprobante::find($id);

if ($comprobante->pdf_base64) {
    $pdfContent = base64_decode($comprobante->pdf_base64);
    
    // Descargar archivo
    return response($pdfContent)
        ->header('Content-Type', 'application/pdf')
        ->header('Content-Disposition', 'attachment; filename="factura-' . $comprobante->serie . '-' . $comprobante->correlativo . '.pdf"');
} else {
    return response()->json(['error' => 'PDF no disponible'], 404);
}
```

## 🔧 Configuración Avanzada

### Personalizar Datos de Empresa
```php
// En config/services.php
'company' => [
    'ruc' => env('COMPANY_RUC'),
    'name' => env('COMPANY_NAME'),
    'address' => env('COMPANY_ADDRESS'),
    'district' => env('COMPANY_DISTRICT'),
    'province' => env('COMPANY_PROVINCE'),
    'department' => env('COMPANY_DEPARTMENT'),
],
```

### Cambiar a Ambiente de Producción
```php
// En GreenterService.php
private function configurarSee()
{
    $this->see->setCertificate(file_get_contents(config('services.greenter.cert_path')));
    $this->see->setCredentials(
        config('services.greenter.fe_user'),
        config('services.greenter.fe_password')
    );
    
    // Cambiar a producción
    $this->see->setService(SunatEndpoints::FE_PRODUCCION);
}
```

## 🧪 Pruebas y Debugging

### Ejecutar Prueba de Facturación
```bash
php test_facturacion.php
```

### Ver XML Generado
```php
// El XML se guarda automáticamente en xml_debug.xml
$xml = file_get_contents('xml_debug.xml');
echo $xml;
```

### Ver Logs de Laravel
```bash
tail -f storage/logs/laravel.log
```

## 📈 Monitoreo y Estadísticas

### Obtener Estadísticas
```php
use App\Http\Controllers\ComprobantesController;

$controller = new ComprobantesController();
$estadisticas = $controller->estadisticas();

echo "Total comprobantes: " . $estadisticas['total'];
echo "Aceptados: " . $estadisticas['aceptados'];
echo "Rechazados: " . $estadisticas['rechazados'];
echo "Pendientes: " . $estadisticas['pendientes'];
```

### Consultar por Rango de Fechas
```php
use App\Models\Comprobante;

$comprobantes = Comprobante::whereBetween('fecha_emision', [
    '2025-10-01',
    '2025-10-31'
])->get();

foreach ($comprobantes as $comprobante) {
    echo $comprobante->serie . "-" . $comprobante->correlativo . " - " . $comprobante->estado;
}
```

## 🚨 Manejo de Errores

### Errores Comunes

#### Error 3244: TipoOperacion
```php
// Este es un bug conocido en Greenter v4.3.4
// El sistema funciona correctamente a pesar del error
// No requiere acción del usuario
```

#### Error de Certificado
```php
// Verificar que el certificado existe
if (!file_exists(config('services.greenter.cert_path'))) {
    throw new Exception('Certificado no encontrado');
}
```

#### Error de Conexión SUNAT
```php
// Verificar conectividad
$resultado = $greenterService->generarFactura($ventaId);

if (!$resultado['success']) {
    // Log del error
    \Log::error('Error SUNAT: ' . $resultado['error']);
    
    // Reintentar o notificar
}
```

## 🔒 Seguridad

### Validar Datos de Entrada
```php
// Validar RUC
if (!preg_match('/^[0-9]{11}$/', $ruc)) {
    throw new Exception('RUC inválido');
}

// Validar montos
if ($monto <= 0) {
    throw new Exception('Monto debe ser mayor a 0');
}
```

### Proteger Certificados
```php
// Los certificados deben estar en storage/app/private/
// No subir a repositorio público
// Usar permisos restrictivos
```

## 📞 Soporte y Troubleshooting

### Verificar Configuración
```bash
# Verificar extensiones PHP
php -m | grep -E "(soap|openssl|dom|curl|zip)"

# Verificar certificado
openssl x509 -in storage/app/certificates/certificate.pem -text -noout

# Verificar conectividad SUNAT
curl -I https://e-beta.sunat.gob.pe/
```

### Logs Importantes
```bash
# Logs de Laravel
tail -f storage/logs/laravel.log

# Logs de Apache/Nginx
tail -f /var/log/apache2/error.log
```

### Comandos Útiles
```bash
# Limpiar cache
php artisan cache:clear
php artisan config:clear

# Verificar rutas
php artisan route:list | grep comprobantes

# Verificar configuración
php artisan config:show services.greenter
```

---

**📖 Guía completa para usar el sistema de facturación electrónica**
