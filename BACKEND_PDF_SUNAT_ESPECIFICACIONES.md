# 🎯 BACKEND - Especificaciones PDF SUNAT Compliant

## 📋 RESUMEN EJECUTIVO

El backend debe modificar el endpoint `POST /api/ventas/{id}/generar-pdf` para generar PDFs que incluyan **TODOS los parámetros requeridos por SUNAT** para facturación electrónica.

## 🔥 ENDPOINT A MODIFICAR

```
POST /api/ventas/{id}/generar-pdf
```

### 📤 Respuesta Actual vs Nueva

#### ❌ Respuesta Actual (Básica)
```json
{
  "success": true,
  "message": "PDF generado exitosamente"
}
```

#### ✅ Nueva Respuesta Requerida (Compliant SUNAT)
```json
{
  "success": true,
  "message": "PDF generado exitosamente con todos los parámetros SUNAT",
  "data": {
    "comprobante_id": 123,
    "numero_completo": "F001-00000123",
    "tiene_pdf": true,
    "template_usado": "primary",
    "elementos_incluidos": {
      "datos_empresa": true,
      "tipo_comprobante_especifico": true,
      "detalle_productos_completo": true,
      "informacion_legal_sunat": true,
      "totales_detallados": true,
      "codigo_qr": true,
      "hash_xml": true
    }
  }
}
```

## 🏗️ ARQUITECTURA DEL SISTEMA PDF

### 🔧 Sistema de 3 Niveles (Fallback Garantizado)

```php
class PdfGeneratorService 
{
    public function generarPdfSunat($comprobante) 
    {
        try {
            // NIVEL 1: Template Principal (DomPDF)
            return $this->generarConDomPDF($comprobante);
        } catch (Exception $e) {
            Log::warning("Nivel 1 falló: " . $e->getMessage());
            
            try {
                // NIVEL 2: Template Simplificado (HTML2PDF)
                return $this->generarConHTML2PDF($comprobante);
            } catch (Exception $e2) {
                Log::warning("Nivel 2 falló: " . $e2->getMessage());
                
                // NIVEL 3: Template Emergencia (HTML básico)
                return $this->generarConHTMLBasico($comprobante);
            }
        }
    }
}
```

## 📋 ELEMENTOS OBLIGATORIOS PARA SUNAT

### 🏢 1. DATOS DE EMPRESA (CRÍTICO)
```php
$datosEmpresa = [
    'ruc' => config('empresa.ruc'), // Ej: "20123456789"
    'razon_social' => config('empresa.razon_social'), // Ej: "MI EMPRESA SAC"
    'direccion_fiscal' => config('empresa.direccion'), // Dirección completa
    'logo_path' => public_path('images/logo-empresa.png'),
    'telefono' => config('empresa.telefono'),
    'email' => config('empresa.email'),
    'web' => config('empresa.web')
];
```

### 📄 2. TIPO ESPECÍFICO DE COMPROBANTE (CRÍTICO)
```php
$tiposComprobante = [
    '01' => 'FACTURA ELECTRÓNICA',
    '03' => 'BOLETA DE VENTA ELECTRÓNICA', 
    '07' => 'NOTA DE CRÉDITO ELECTRÓNICA',
    '08' => 'NOTA DE DÉBITO ELECTRÓNICA',
    '09' => 'NOTA DE VENTA'
];

$tipoEspecifico = $tiposComprobante[$comprobante->tipo_comprobante] ?? 'COMPROBANTE ELECTRÓNICO';
```

### 🛍️ 3. DETALLE COMPLETO DE PRODUCTOS (CRÍTICO)
```php
foreach ($comprobante->detalles as $detalle) {
    $productos[] = [
        'codigo' => $detalle->producto->codigo ?? 'N/A',
        'descripcion' => $detalle->producto->nombre,
        'unidad_medida' => $detalle->producto->unidad_medida ?? 'NIU',
        'cantidad' => number_format($detalle->cantidad, 2),
        'precio_unitario' => number_format($detalle->precio_unitario, 2), // Sin IGV
        'valor_venta' => number_format($detalle->subtotal_linea, 2), // Sin IGV
        'igv_linea' => number_format($detalle->igv_linea, 2),
        'total_linea' => number_format($detalle->total_linea, 2)
    ];
}
```

### ⚖️ 4. INFORMACIÓN LEGAL SUNAT (CRÍTICO)
```php
$infoLegal = [
    'hash_xml' => $comprobante->hash_xml, // Hash completo del XML
    'codigo_qr' => $this->generarCodigoQR($comprobante), // QR para consulta SUNAT
    'leyenda_legal' => 'Representación impresa del comprobante electrónico',
    'url_consulta' => 'https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp',
    'estado_cdr' => $comprobante->estado_cdr ?? null
];
```

### 💰 5. TOTALES DETALLADOS (CRÍTICO)
```php
$totales = [
    'operacion_gravada' => number_format($comprobante->subtotal, 2),
    'igv_18' => number_format($comprobante->igv, 2),
    'total_numeros' => number_format($comprobante->total, 2),
    'total_letras' => $this->convertirNumeroALetras($comprobante->total), // "SON: CIENTO CINCUENTA CON 00/100 SOLES"
    'descuentos' => $comprobante->descuento_total > 0 ? number_format($comprobante->descuento_total, 2) : null
];
```

### 🔍 6. CÓDIGO QR SUNAT (CRÍTICO)
```php
private function generarCodigoQR($comprobante) 
{
    $qrData = implode('|', [
        config('empresa.ruc'),                    // RUC emisor
        $comprobante->tipo_comprobante,           // Tipo comprobante
        $comprobante->serie,                      // Serie
        $comprobante->correlativo,                // Correlativo
        number_format($comprobante->igv, 2),     // IGV
        number_format($comprobante->total, 2),   // Total
        $comprobante->fecha_emision,              // Fecha
        $comprobante->cliente->tipo_documento,   // Tipo doc cliente
        $comprobante->cliente->numero_documento, // Número doc cliente
        $comprobante->hash_xml                   // Hash del XML
    ]);
    
    // Generar QR con librería (SimpleSoftwareIO/simple-qrcode)
    return QrCode::format('png')->size(150)->generate($qrData);
}
```

## 🎨 TEMPLATES REQUERIDOS

### 📄 Template Principal (resources/views/pdf/comprobante-sunat.blade.php)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $tipo_comprobante }} {{ $numero_completo }}</title>
    <style>
        /* CSS optimizado para DomPDF */
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
        .empresa-logo { float: left; width: 100px; }
        .empresa-datos { float: right; text-align: right; }
        .comprobante-titulo { text-align: center; font-size: 16px; font-weight: bold; }
        .tabla-productos { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .tabla-productos th, .tabla-productos td { border: 1px solid #ddd; padding: 8px; }
        .totales { float: right; width: 300px; }
        .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
        .qr-code { float: left; }
        .info-legal { float: right; font-size: 10px; }
    </style>
</head>
<body>
    <!-- ENCABEZADO CON DATOS EMPRESA -->
    <div class="header">
        <div class="empresa-logo">
            @if($datos_empresa['logo_path'] && file_exists($datos_empresa['logo_path']))
                <img src="{{ $datos_empresa['logo_path'] }}" alt="Logo" width="80">
            @endif
        </div>
        <div class="empresa-datos">
            <strong>{{ $datos_empresa['razon_social'] }}</strong><br>
            RUC: {{ $datos_empresa['ruc'] }}<br>
            {{ $datos_empresa['direccion_fiscal'] }}<br>
            Tel: {{ $datos_empresa['telefono'] }} | Email: {{ $datos_empresa['email'] }}
        </div>
        <div style="clear: both;"></div>
    </div>

    <!-- TÍTULO ESPECÍFICO DEL COMPROBANTE -->
    <div class="comprobante-titulo">
        {{ $tipo_comprobante }}<br>
        {{ $numero_completo }}
    </div>

    <!-- DATOS DEL CLIENTE -->
    <div style="margin: 20px 0;">
        <strong>Cliente:</strong> {{ $cliente['razon_social'] }}<br>
        <strong>{{ $cliente['tipo_documento'] === '6' ? 'RUC' : 'DNI' }}:</strong> {{ $cliente['numero_documento'] }}<br>
        <strong>Dirección:</strong> {{ $cliente['direccion'] ?? 'No especificada' }}<br>
        <strong>Fecha:</strong> {{ $fecha_emision }}
    </div>

    <!-- DETALLE DE PRODUCTOS -->
    <table class="tabla-productos">
        <thead>
            <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Valor Venta</th>
                <th>IGV</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($productos as $producto)
            <tr>
                <td>{{ $producto['codigo'] }}</td>
                <td>{{ $producto['descripcion'] }}</td>
                <td>{{ $producto['unidad_medida'] }}</td>
                <td style="text-align: center;">{{ $producto['cantidad'] }}</td>
                <td style="text-align: right;">S/ {{ $producto['precio_unitario'] }}</td>
                <td style="text-align: right;">S/ {{ $producto['valor_venta'] }}</td>
                <td style="text-align: right;">S/ {{ $producto['igv_linea'] }}</td>
                <td style="text-align: right;">S/ {{ $producto['total_linea'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTALES DETALLADOS -->
    <div class="totales">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td><strong>Operación Gravada:</strong></td>
                <td style="text-align: right;"><strong>S/ {{ $totales['operacion_gravada'] }}</strong></td>
            </tr>
            <tr>
                <td><strong>IGV (18%):</strong></td>
                <td style="text-align: right;"><strong>S/ {{ $totales['igv_18'] }}</strong></td>
            </tr>
            @if($totales['descuentos'])
            <tr>
                <td><strong>Descuento:</strong></td>
                <td style="text-align: right;"><strong>- S/ {{ $totales['descuentos'] }}</strong></td>
            </tr>
            @endif
            <tr style="border-top: 2px solid #333;">
                <td><strong>TOTAL:</strong></td>
                <td style="text-align: right; font-size: 14px;"><strong>S/ {{ $totales['total_numeros'] }}</strong></td>
            </tr>
        </table>
        <div style="margin-top: 10px; font-size: 10px;">
            <strong>{{ $totales['total_letras'] }}</strong>
        </div>
    </div>

    <div style="clear: both;"></div>

    <!-- PIE DE PÁGINA CON INFORMACIÓN LEGAL -->
    <div class="footer">
        <div class="qr-code">
            <img src="data:image/png;base64,{{ base64_encode($info_legal['codigo_qr']) }}" alt="Código QR" width="100">
        </div>
        <div class="info-legal">
            <strong>{{ $info_legal['leyenda_legal'] }}</strong><br>
            <strong>Hash:</strong> {{ $info_legal['hash_xml'] }}<br>
            <strong>Consulte en:</strong> {{ $info_legal['url_consulta'] }}<br>
            @if($info_legal['estado_cdr'])
                <strong>Estado CDR:</strong> {{ $info_legal['estado_cdr'] }}
            @endif
        </div>
        <div style="clear: both;"></div>
    </div>
</body>
</html>
```

## 🔧 IMPLEMENTACIÓN EN CONTROLADOR

### VentasController.php - Método generarPdf()
```php
public function generarPdf(Request $request, $id)
{
    try {
        $venta = Venta::with(['cliente', 'detalles.producto', 'comprobante'])->findOrFail($id);
        
        if (!$venta->comprobante) {
            return response()->json([
                'success' => false,
                'message' => 'La venta no tiene comprobante generado'
            ], 422);
        }

        // Usar el nuevo servicio PDF
        $pdfService = new PdfGeneratorService();
        $resultado = $pdfService->generarPdfSunat($venta->comprobante);
        
        // Actualizar estado en base de datos
        $venta->comprobante->update(['tiene_pdf' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'PDF generado exitosamente con todos los parámetros SUNAT',
            'data' => [
                'comprobante_id' => $venta->comprobante->id,
                'numero_completo' => $venta->comprobante->numero_completo,
                'tiene_pdf' => true,
                'template_usado' => $resultado['template_usado'],
                'elementos_incluidos' => $resultado['elementos_incluidos']
            ]
        ]);
        
    } catch (Exception $e) {
        Log::error('Error generando PDF SUNAT: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Error al generar PDF: ' . $e->getMessage()
        ], 500);
    }
}
```

## 📦 LIBRERÍAS REQUERIDAS

### Composer Dependencies
```bash
composer require dompdf/dompdf
composer require simplesoftwareio/simple-qrcode
composer require smalot/pdfparser  # Para validación
```

### Configuración en config/app.php
```php
'providers' => [
    // ...
    SimpleSoftwareIO\QrCode\QrCodeServiceProvider::class,
],

'aliases' => [
    // ...
    'QrCode' => SimpleSoftwareIO\QrCode\Facades\QrCode::class,
],
```

## 🔍 VALIDACIÓN Y TESTING

### Tests Requeridos
```php
// tests/Feature/PdfSunatTest.php
class PdfSunatTest extends TestCase
{
    public function test_genera_pdf_con_todos_parametros_sunat()
    {
        $venta = Venta::factory()->conComprobante()->create();
        
        $response = $this->postJson("/api/ventas/{$venta->id}/generar-pdf");
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'comprobante_id',
                        'numero_completo',
                        'tiene_pdf',
                        'template_usado',
                        'elementos_incluidos' => [
                            'datos_empresa',
                            'tipo_comprobante_especifico',
                            'detalle_productos_completo',
                            'informacion_legal_sunat',
                            'totales_detallados',
                            'codigo_qr',
                            'hash_xml'
                        ]
                    ]
                ]);
    }
}
```

## 🚀 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Tareas Backend

- [ ] **Crear PdfGeneratorService con 3 niveles**
- [ ] **Implementar generación de código QR SUNAT**
- [ ] **Crear template Blade completo con todos los parámetros**
- [ ] **Modificar respuesta del endpoint para incluir elementos_incluidos**
- [ ] **Agregar configuración de datos de empresa**
- [ ] **Implementar conversión de números a letras**
- [ ] **Crear templates de fallback (simplificado y emergencia)**
- [ ] **Agregar logging completo para debugging**
- [ ] **Crear tests unitarios y de integración**
- [ ] **Validar que el PDF generado sea compliant SUNAT**

### 🔧 Configuración Requerida

```php
// config/empresa.php
return [
    'ruc' => env('EMPRESA_RUC', '20123456789'),
    'razon_social' => env('EMPRESA_RAZON_SOCIAL', 'MI EMPRESA SAC'),
    'direccion' => env('EMPRESA_DIRECCION', 'Av. Principal 123, Lima, Perú'),
    'telefono' => env('EMPRESA_TELEFONO', '+51 1 234-5678'),
    'email' => env('EMPRESA_EMAIL', 'contacto@miempresa.com'),
    'web' => env('EMPRESA_WEB', 'www.miempresa.com'),
    'logo_path' => env('EMPRESA_LOGO_PATH', 'images/logo-empresa.png')
];
```

## 🎯 RESULTADO ESPERADO

Al implementar estas especificaciones, el sistema generará PDFs que:

1. ✅ **Cumplen 100% con requisitos SUNAT**
2. ✅ **Incluyen todos los 7 elementos críticos faltantes**
3. ✅ **Tienen sistema robusto de 3 niveles con fallback**
4. ✅ **Proporcionan respuesta detallada al frontend**
5. ✅ **Son profesionales y listos para impresión**
6. ✅ **Incluyen código QR funcional para consulta SUNAT**
7. ✅ **Muestran totales en números y letras**
8. ✅ **Contienen toda la información legal requerida**

## 📞 SOPORTE

Una vez implementado, el frontend ya está 100% listo para usar estos PDFs mejorados. El usuario verá:

- **Modales informativos** explicando todos los parámetros incluidos
- **Indicadores visuales** del estado del PDF
- **Nombres de archivo descriptivos** (FACTURA_F001-00000123.pdf)
- **Confirmaciones detalladas** con información del contenido

¡El sistema estará completamente compliant con SUNAT! 🎉