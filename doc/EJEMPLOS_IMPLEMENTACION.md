# Ejemplos de Implementación - Facturación Electrónica

## Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Emisión de Boleta](#emisión-de-boleta)
3. [Emisión de Factura](#emisión-de-factura)
4. [Nota de Crédito](#nota-de-crédito)
5. [Nota de Débito](#nota-de-débito)
6. [Resumen Diario](#resumen-diario)
7. [Comunicación de Baja](#comunicación-de-baja)
8. [Integración con POS](#integración-con-pos)
9. [Manejo de Errores](#manejo-de-errores)

---

## Configuración Inicial

### 1. Configurar datos del emisor

```javascript
// Frontend - ConfiguracionEmisor.vue
async function guardarConfiguracion() {
  const formData = {
    ruc: "20123456789",
    razon_social: "MI EMPRESA SAC",
    nombre_comercial: "Mi Empresa",
    domicilio_fiscal: "Av. Principal 123",
    ubigeo: "150101",
    email: "facturacion@miempresa.com",
    telefono: "987654321",
    sol_usuario: "MODDATOS",
    sol_clave: "moddatos",
    sol_endpoint: "beta" // o "prod" para producción
  };

  try {
    const response = await axios.put('/api/facturacion/emisor', formData);
    console.log('Emisor configurado:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### 2. Subir certificado digital

```javascript
// Frontend - SubirCertificado.vue
async function subirCertificado() {
  const formData = new FormData();
  formData.append('certificado', certificadoFile); // Archivo .pfx
  formData.append('password', 'contraseña_del_pfx');

  try {
    const response = await axios.post('/api/facturacion/emisor/certificado', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Certificado subido:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### 3. Crear series de comprobantes

```javascript
// Backend - PHP Laravel
public function crearSeries()
{
    // Serie para Boletas
    Serie::create([
        'empresa_id' => 1,
        'tipo_comprobante' => '03',
        'serie' => 'B001',
        'correlativo_actual' => 0,
        'sede_id' => 1,
        'estado' => 'activo'
    ]);

    // Serie para Facturas
    Serie::create([
        'empresa_id' => 1,
        'tipo_comprobante' => '01',
        'serie' => 'F001',
        'correlativo_actual' => 0,
        'sede_id' => 1,
        'estado' => 'activo'
    ]);

    // Serie para Notas de Crédito de Boletas
    Serie::create([
        'empresa_id' => 1,
        'tipo_comprobante' => '07',
        'serie' => 'BC01',
        'correlativo_actual' => 0,
        'sede_id' => 1,
        'estado' => 'activo'
    ]);

    // Serie para Notas de Crédito de Facturas
    Serie::create([
        'empresa_id' => 1,
        'tipo_comprobante' => '07',
        'serie' => 'FC01',
        'correlativo_actual' => 0,
        'sede_id' => 1,
        'estado' => 'activo'
    ]);
}
```

---

## Emisión de Boleta

### Frontend - Crear venta y emitir boleta

```javascript
// VentaPOS.vue
async function procesarVenta() {
  // Paso 1: Crear la venta
  const ventaData = {
    cliente: {
      tipo_documento: "1", // DNI
      numero_documento: "12345678",
      nombre: "JUAN PEREZ GARCIA",
      direccion: "Av. Los Olivos 456",
      email: "juan.perez@email.com"
    },
    items: [
      {
        producto_id: 10,
        descripcion: "Laptop HP 15-DY2021LA",
        unidad_medida: "NIU",
        cantidad: 1,
        precio_unitario: 2500.00,
        tipo_afectacion_igv: "10", // Gravado
        descuento: 0
      },
      {
        producto_id: 25,
        descripcion: "Mouse Inalambrico Logitech",
        unidad_medida: "NIU",
        cantidad: 2,
        precio_unitario: 45.00,
        tipo_afectacion_igv: "10",
        descuento: 5.00
      }
    ],
    descuento_global: 0,
    metodo_pago: "EFECTIVO",
    observaciones: "Venta en tienda",
    moneda: "PEN"
  };

  try {
    // Crear venta
    const ventaResponse = await axios.post('/api/ventas', ventaData);
    const ventaId = ventaResponse.data.data.id;
    console.log('Venta creada:', ventaId);

    // Paso 2: Emitir boleta
    const comprobanteData = {
      tipo_comprobante: "03", // Boleta
      serie: "B001", // Opcional, se autogenera si no se envía
      metodo_pago: "EFECTIVO",
      observaciones: "Venta contado"
    };

    const comprobanteResponse = await axios.post(
      `/api/ventas/${ventaId}/facturar`,
      comprobanteData
    );

    console.log('Boleta emitida:', comprobanteResponse.data);

    // Mostrar resultado
    const comprobante = comprobanteResponse.data.data.comprobante;
    alert(`Boleta emitida: ${comprobante.numero_completo}`);

    // Descargar PDF
    window.open(`/api/ventas/${ventaId}/pdf`, '_blank');

  } catch (error) {
    console.error('Error:', error.response.data);
    alert(`Error: ${error.response.data.message}`);
  }
}
```

### Backend - Controller para emitir boleta

```php
// RecompensaNotificacionController.php o nuevo FacturacionController.php
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Client\Client;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;

public function facturar(Request $request, $ventaId)
{
    $venta = Venta::with('items', 'cliente')->findOrFail($ventaId);

    // Validaciones
    if ($venta->estado === 'FACTURADO') {
        return response()->json([
            'success' => false,
            'error' => 'VENTA_YA_FACTURADA',
            'message' => 'Esta venta ya fue facturada'
        ], 400);
    }

    $tipoComprobante = $request->tipo_comprobante; // "01" o "03"

    // Validar cliente según tipo de comprobante
    if ($tipoComprobante === '01' && $venta->cliente_tipo_documento !== '6') {
        return response()->json([
            'success' => false,
            'error' => 'CLIENTE_INVALIDO',
            'message' => 'Para emitir Factura el cliente debe tener RUC'
        ], 400);
    }

    DB::beginTransaction();
    try {
        // 1. Reservar correlativo
        $serie = $request->serie
            ? Serie::where('serie', $request->serie)->first()
            : Serie::where('tipo_comprobante', $tipoComprobante)
                   ->where('estado', 'activo')
                   ->lockForUpdate()
                   ->first();

        $serie->correlativo_actual += 1;
        $serie->save();

        $numeroComprobante = $serie->correlativo_actual;

        // 2. Construir documento con Greenter
        $invoice = new Invoice();
        $invoice
            ->setUblVersion('2.1')
            ->setTipoOperacion('0101') // Venta interna
            ->setTipoDoc($tipoComprobante)
            ->setSerie($serie->serie)
            ->setCorrelativo($numeroComprobante)
            ->setFechaEmision(new \DateTime())
            ->setTipoMoneda($venta->moneda);

        // Cliente
        $client = new Client();
        $client
            ->setTipoDoc($venta->cliente_tipo_documento)
            ->setNumDoc($venta->cliente_numero_documento)
            ->setRznSocial($venta->cliente_nombre)
            ->setAddress([
                'direccion' => $venta->cliente_direccion
            ]);
        $invoice->setClient($client);

        // Emisor
        $empresa = Empresa::first();
        $address = new \Greenter\Model\Company\Address();
        $address
            ->setUbigueo($empresa->ubigeo)
            ->setDepartamento($empresa->departamento)
            ->setProvincia($empresa->provincia)
            ->setDistrito($empresa->distrito)
            ->setUrbanizacion('-')
            ->setDireccion($empresa->domicilio_fiscal)
            ->setCodLocal('0000');

        $company = new \Greenter\Model\Company\Company();
        $company
            ->setRuc($empresa->ruc)
            ->setRazonSocial($empresa->razon_social)
            ->setNombreComercial($empresa->nombre_comercial)
            ->setAddress($address);
        $invoice->setCompany($company);

        // Items
        $items = [];
        foreach ($venta->items as $index => $item) {
            $detail = new SaleDetail();
            $detail
                ->setCodProducto($item->codigo_producto ?? 'P' . str_pad($item->producto_id, 3, '0', STR_PAD_LEFT))
                ->setUnidad($item->unidad_medida)
                ->setCantidad($item->cantidad)
                ->setDescripcion($item->descripcion)
                ->setMtoBaseIgv($item->subtotal)
                ->setPorcentajeIgv(18.00)
                ->setIgv($item->igv)
                ->setTipAfeIgv($item->tipo_afectacion_igv)
                ->setTotalImpuestos($item->igv)
                ->setMtoValorVenta($item->subtotal)
                ->setMtoValorUnitario($item->precio_unitario_sin_igv)
                ->setMtoPrecioUnitario($item->precio_unitario);

            $items[] = $detail;
        }
        $invoice->setDetails($items);

        // Totales
        $invoice
            ->setMtoOperGravadas($venta->subtotal_neto)
            ->setMtoIGV($venta->igv)
            ->setTotalImpuestos($venta->igv)
            ->setValorVenta($venta->subtotal_neto)
            ->setSubTotal($venta->total)
            ->setMtoImpVenta($venta->total);

        // Leyenda
        $legend = new Legend();
        $legend->setCode('1000')
               ->setValue($this->numeroALetras($venta->total));
        $invoice->setLegends([$legend]);

        // 3. Firmar y enviar a SUNAT
        $see = $this->configurarGreenter();
        $result = $see->send($invoice);

        if (!$result->isSuccess()) {
            throw new \Exception($result->getError()->getMessage());
        }

        // 4. Guardar XML y CDR
        $xmlPath = "xml/{$empresa->ruc}-{$tipoComprobante}-{$serie->serie}-{$numeroComprobante}.xml";
        Storage::put($xmlPath, $see->getFactory()->getLastXml());

        $cdrPath = "cdr/R-{$empresa->ruc}-{$tipoComprobante}-{$serie->serie}-{$numeroComprobante}.zip";
        Storage::put($cdrPath, $result->getCdrZip());

        // 5. Crear comprobante
        $comprobante = Comprobante::create([
            'empresa_id' => $empresa->id,
            'venta_id' => $venta->id,
            'tipo_comprobante' => $tipoComprobante,
            'serie' => $serie->serie,
            'numero' => $numeroComprobante,
            'fecha_emision' => now()->toDateString(),
            'hora_emision' => now()->toTimeString(),
            'cliente_tipo_documento' => $venta->cliente_tipo_documento,
            'cliente_numero_documento' => $venta->cliente_numero_documento,
            'cliente_nombre' => $venta->cliente_nombre,
            'moneda' => $venta->moneda,
            'subtotal' => $venta->subtotal_neto,
            'igv' => $venta->igv,
            'total' => $venta->total,
            'hash' => $result->getHash(),
            'xml_path' => $xmlPath,
            'cdr_path' => $cdrPath,
            'estado_sunat' => 'ACEPTADO',
            'codigo_sunat' => '0',
            'mensaje_sunat' => $result->getCdrResponse()->getDescription(),
            'fecha_envio_sunat' => now(),
            'fecha_respuesta_sunat' => now()
        ]);

        // Copiar items
        foreach ($venta->items as $item) {
            ComprobanteItem::create([
                'comprobante_id' => $comprobante->id,
                'codigo' => $item->codigo_producto,
                'descripcion' => $item->descripcion,
                'unidad_medida' => $item->unidad_medida,
                'cantidad' => $item->cantidad,
                'precio_unitario' => $item->precio_unitario,
                'tipo_afectacion_igv' => $item->tipo_afectacion_igv,
                'subtotal' => $item->subtotal,
                'igv' => $item->igv,
                'total' => $item->total
            ]);
        }

        // 6. Actualizar venta
        $venta->update([
            'estado' => 'FACTURADO',
            'comprobante_id' => $comprobante->id
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Comprobante emitido correctamente',
            'data' => [
                'venta_id' => $venta->id,
                'comprobante' => [
                    'id' => $comprobante->id,
                    'tipo' => $tipoComprobante,
                    'tipo_nombre' => $tipoComprobante === '03' ? 'BOLETA' : 'FACTURA',
                    'serie' => $serie->serie,
                    'numero' => $numeroComprobante,
                    'numero_completo' => "{$serie->serie}-{$numeroComprobante}",
                    'hash' => $result->getHash(),
                    'xml_url' => Storage::url($xmlPath),
                    'cdr_url' => Storage::url($cdrPath),
                    'pdf_url' => "/api/ventas/{$venta->id}/pdf",
                    'estado_sunat' => 'ACEPTADO',
                    'mensaje_sunat' => $result->getCdrResponse()->getDescription()
                ]
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        // Registrar en auditoría
        AuditoriaSunat::create([
            'empresa_id' => $empresa->id,
            'tipo_operacion' => 'EMISION',
            'entidad_tipo' => 'venta',
            'entidad_id' => $venta->id,
            'exitoso' => false,
            'mensaje_sunat' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'error' => 'SUNAT_ERROR',
            'message' => $e->getMessage()
        ], 500);
    }
}

private function configurarGreenter()
{
    $empresa = Empresa::first();
    $certificado = Certificado::where('empresa_id', $empresa->id)
                               ->where('estado', 'activo')
                               ->first();

    $see = new \Greenter\See();
    $see->setService($empresa->sol_endpoint === 'prod'
        ? \Greenter\Ws\Services\SunatEndpoints::FE_PRODUCCION
        : \Greenter\Ws\Services\SunatEndpoints::FE_BETA
    );
    $see->setClaveSOL($empresa->ruc, $empresa->sol_usuario, decrypt($empresa->sol_clave));
    $see->setCertificate(Storage::get($certificado->ruta_archivo));

    return $see;
}

private function numeroALetras($numero)
{
    // Implementar conversión de número a letras
    // Librería: https://github.com/luecano/numero-a-letras
    return "DOS MIL QUINIENTOS Y 00/100 SOLES";
}
```

---

## Emisión de Factura

```javascript
// Frontend - Mismo flujo que boleta, cambiar tipo_comprobante

async function emitirFactura() {
  const ventaData = {
    cliente: {
      tipo_documento: "6", // RUC obligatorio
      numero_documento: "20456789123",
      nombre: "EMPRESA CLIENTE SAC",
      direccion: "Jr. Comercio 789",
      email: "contacto@empresacliente.com"
    },
    items: [
      {
        producto_id: 50,
        descripcion: "Servicio de Consultoria",
        unidad_medida: "ZZ",
        cantidad: 1,
        precio_unitario: 5000.00,
        tipo_afectacion_igv: "10",
        descuento: 0
      }
    ],
    metodo_pago: "CREDITO",
    moneda: "PEN"
  };

  const ventaResponse = await axios.post('/api/ventas', ventaData);
  const ventaId = ventaResponse.data.data.id;

  // Emitir factura
  const comprobanteData = {
    tipo_comprobante: "01", // Factura
    serie: "F001",
    metodo_pago: "CREDITO",
    fecha_vencimiento: "2025-11-13", // 30 días
    observaciones: "Pago a 30 días"
  };

  const response = await axios.post(`/api/ventas/${ventaId}/facturar`, comprobanteData);
  console.log('Factura emitida:', response.data);
}
```

---

## Nota de Crédito

### Anulación total de una factura

```javascript
// Frontend
async function anularFactura(comprobanteId) {
  const notaCreditoData = {
    comprobante_referencia: {
      tipo: "01",
      serie: "F001",
      numero: 88
    },
    tipo_nota_credito: "01", // Anulación de operación
    motivo: "ANULACION DE LA OPERACION",
    descripcion: "Cliente solicitó anulación total",
    items: [
      // Copiar todos los items del comprobante original con valores negativos o positivos
      {
        descripcion: "Servicio de Consultoria",
        unidad_medida: "ZZ",
        cantidad: 1,
        precio_unitario: 5000.00,
        tipo_afectacion_igv: "10",
        descuento: 0
      }
    ],
    serie: "FC01", // Serie de NC para facturas
    observaciones: "NC por anulación total"
  };

  try {
    const response = await axios.post('/api/facturacion/notas-credito', notaCreditoData);
    console.log('Nota de Crédito emitida:', response.data);

    const nc = response.data.data;
    alert(`Nota de Crédito emitida: ${nc.numero_completo}`);

    // Descargar PDF
    window.open(`/api/facturacion/notas-credito/${nc.id}/pdf`, '_blank');

  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Backend - Emitir Nota de Crédito

```php
public function emitirNotaCredito(Request $request)
{
    $comprobanteRef = Comprobante::where('tipo_comprobante', $request->comprobante_referencia['tipo'])
                                  ->where('serie', $request->comprobante_referencia['serie'])
                                  ->where('numero', $request->comprobante_referencia['numero'])
                                  ->firstOrFail();

    if ($comprobanteRef->estado_sunat !== 'ACEPTADO') {
        return response()->json([
            'success' => false,
            'message' => 'Solo se puede emitir NC para comprobantes ACEPTADOS'
        ], 400);
    }

    DB::beginTransaction();
    try {
        $empresa = Empresa::first();

        // Reservar correlativo de serie NC
        $serieNC = Serie::where('tipo_comprobante', '07')
                        ->where('serie', $request->serie)
                        ->lockForUpdate()
                        ->first();
        $serieNC->correlativo_actual += 1;
        $serieNC->save();

        // Construir NC con Greenter
        $note = new \Greenter\Model\Sale\Note();
        $note
            ->setUblVersion('2.1')
            ->setTipoDoc('07')
            ->setSerie($serieNC->serie)
            ->setCorrelativo($serieNC->correlativo_actual)
            ->setFechaEmision(new \DateTime())
            ->setTipDocAfectado($comprobanteRef->tipo_comprobante)
            ->setNumDocfectado("{$comprobanteRef->serie}-{$comprobanteRef->numero}")
            ->setCodMotivo($request->tipo_nota_credito)
            ->setDesMotivo($request->motivo)
            ->setTipoMoneda('PEN');

        // Cliente (copiar del comprobante original)
        $client = new Client();
        $client
            ->setTipoDoc($comprobanteRef->cliente_tipo_documento)
            ->setNumDoc($comprobanteRef->cliente_numero_documento)
            ->setRznSocial($comprobanteRef->cliente_nombre);
        $note->setClient($client);

        // Emisor
        $company = $this->getCompanyData($empresa);
        $note->setCompany($company);

        // Items
        $items = [];
        $subtotal = 0;
        $igv = 0;

        foreach ($request->items as $itemData) {
            $detail = new SaleDetail();
            $valorUnitario = $itemData['precio_unitario'] / 1.18;
            $subtotalItem = $valorUnitario * $itemData['cantidad'];
            $igvItem = $subtotalItem * 0.18;

            $detail
                ->setUnidad($itemData['unidad_medida'])
                ->setCantidad($itemData['cantidad'])
                ->setDescripcion($itemData['descripcion'])
                ->setMtoBaseIgv($subtotalItem)
                ->setPorcentajeIgv(18.00)
                ->setIgv($igvItem)
                ->setTipAfeIgv($itemData['tipo_afectacion_igv'])
                ->setTotalImpuestos($igvItem)
                ->setMtoValorVenta($subtotalItem)
                ->setMtoValorUnitario($valorUnitario)
                ->setMtoPrecioUnitario($itemData['precio_unitario']);

            $items[] = $detail;
            $subtotal += $subtotalItem;
            $igv += $igvItem;
        }
        $note->setDetails($items);

        // Totales
        $total = $subtotal + $igv;
        $note
            ->setMtoOperGravadas($subtotal)
            ->setMtoIGV($igv)
            ->setTotalImpuestos($igv)
            ->setMtoImpVenta($total);

        // Leyenda
        $legend = new Legend();
        $legend->setCode('1000')->setValue($this->numeroALetras($total));
        $note->setLegends([$legend]);

        // Enviar a SUNAT
        $see = $this->configurarGreenter();
        $result = $see->send($note);

        if (!$result->isSuccess()) {
            throw new \Exception($result->getError()->getMessage());
        }

        // Guardar archivos
        $xmlPath = "xml/{$empresa->ruc}-07-{$serieNC->serie}-{$serieNC->correlativo_actual}.xml";
        Storage::put($xmlPath, $see->getFactory()->getLastXml());

        $cdrPath = "cdr/R-{$empresa->ruc}-07-{$serieNC->serie}-{$serieNC->correlativo_actual}.zip";
        Storage::put($cdrPath, $result->getCdrZip());

        // Crear nota de crédito
        $notaCredito = Comprobante::create([
            'empresa_id' => $empresa->id,
            'tipo_comprobante' => '07',
            'serie' => $serieNC->serie,
            'numero' => $serieNC->correlativo_actual,
            'fecha_emision' => now()->toDateString(),
            'hora_emision' => now()->toTimeString(),
            'cliente_tipo_documento' => $comprobanteRef->cliente_tipo_documento,
            'cliente_numero_documento' => $comprobanteRef->cliente_numero_documento,
            'cliente_nombre' => $comprobanteRef->cliente_nombre,
            'moneda' => 'PEN',
            'subtotal' => $subtotal,
            'igv' => $igv,
            'total' => $total,
            'hash' => $result->getHash(),
            'xml_path' => $xmlPath,
            'cdr_path' => $cdrPath,
            'estado_sunat' => 'ACEPTADO',
            'comprobante_ref_id' => $comprobanteRef->id,
            'tipo_comprobante_ref' => $comprobanteRef->tipo_comprobante,
            'serie_ref' => $comprobanteRef->serie,
            'numero_ref' => $comprobanteRef->numero,
            'tipo_nota_credito' => $request->tipo_nota_credito,
            'motivo_nota' => $request->motivo,
            'mensaje_sunat' => $result->getCdrResponse()->getDescription()
        ]);

        // Actualizar estado del comprobante original
        $comprobanteRef->update(['estado_sunat' => 'BAJA']);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Nota de Crédito emitida correctamente',
            'data' => [
                'id' => $notaCredito->id,
                'numero_completo' => $notaCredito->numero_completo,
                'hash' => $notaCredito->hash,
                'pdf_url' => "/api/facturacion/notas-credito/{$notaCredito->id}/pdf"
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}
```

---

## Nota de Débito

```javascript
// Frontend - Similar a NC pero con motivos de débito
async function emitirNotaDebito() {
  const notaDebitoData = {
    comprobante_referencia: {
      tipo: "01",
      serie: "F001",
      numero: 88
    },
    tipo_nota_debito: "01", // Interés por mora
    motivo: "INTERES POR MORA",
    descripcion: "Intereses por pago fuera de plazo - 30 días",
    items: [
      {
        descripcion: "Interés por mora - 30 días",
        unidad_medida: "ZZ",
        cantidad: 1,
        precio_unitario: 150.00,
        tipo_afectacion_igv: "10",
        descuento: 0
      }
    ],
    serie: "FD01"
  };

  const response = await axios.post('/api/facturacion/notas-debito', notaDebitoData);
  console.log('Nota de Débito emitida:', response.data);
}
```

---

## Resumen Diario

```javascript
// Frontend - Generar resumen diario al cierre del día
async function generarResumenDiario() {
  const fecha = "2025-10-13";

  // Obtener todas las boletas del día
  const boletasResponse = await axios.get('/api/ventas', {
    params: {
      estado: 'FACTURADO',
      tipo_comprobante: '03',
      fecha: fecha
    }
  });

  const comprobantes = boletasResponse.data.data.map(venta => ({
    id: venta.comprobante.id,
    serie: venta.comprobante.serie,
    numero: venta.comprobante.numero,
    tipo: '03',
    cliente_tipo_doc: venta.cliente.tipo_documento,
    cliente_num_doc: venta.cliente.numero_documento,
    moneda: venta.moneda,
    total: venta.total,
    igv: venta.igv,
    estado: 'ACEPTADO'
  }));

  const resumenData = {
    fecha: fecha,
    comprobantes: comprobantes
  };

  try {
    const response = await axios.post('/api/facturacion/resumenes', resumenData);
    const ticket = response.data.data.ticket;

    console.log('Resumen enviado, ticket:', ticket);

    // Consultar estado cada 30 segundos
    const intervalo = setInterval(async () => {
      const statusResponse = await axios.get(`/api/facturacion/resumenes/${ticket}`);
      const estado = statusResponse.data.data.estado;

      console.log('Estado resumen:', estado);

      if (estado === 'ACEPTADO') {
        clearInterval(intervalo);
        alert('Resumen Diario ACEPTADO por SUNAT');
      } else if (estado === 'RECHAZADO') {
        clearInterval(intervalo);
        alert('Resumen Diario RECHAZADO: ' + statusResponse.data.data.mensaje_sunat);
      }
    }, 30000);

  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

---

## Comunicación de Baja

```javascript
// Frontend - Dar de baja comprobantes
async function darDeBaja() {
  const bajaData = {
    comprobantes: [
      {
        tipo: "01",
        serie: "F001",
        numero: 85,
        motivo: "ERROR EN LA EMISION - CLIENTE SOLICITO ANULACION"
      },
      {
        tipo: "03",
        serie: "B001",
        numero: 148,
        motivo: "OPERACION NO REALIZADA"
      }
    ],
    fecha_baja: "2025-10-13"
  };

  try {
    const response = await axios.post('/api/facturacion/bajas', bajaData);
    const ticket = response.data.data.ticket;

    console.log('Baja enviada, ticket:', ticket);

    // Consultar estado
    const intervalo = setInterval(async () => {
      const statusResponse = await axios.get(`/api/facturacion/bajas/${ticket}`);
      const estado = statusResponse.data.data.estado;

      if (estado === 'ACEPTADO') {
        clearInterval(intervalo);
        alert('Comunicación de Baja ACEPTADA');
      } else if (estado === 'RECHAZADO') {
        clearInterval(intervalo);
        alert('Baja RECHAZADA: ' + statusResponse.data.data.mensaje_sunat);
      }
    }, 30000);

  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

---

## Integración con POS

```javascript
// Componente PuntoDeVenta.vue
export default {
  data() {
    return {
      carrito: [],
      cliente: null,
      tipoComprobante: '03', // Boleta por defecto
      series: [],
      serieSeleccionada: null
    };
  },

  mounted() {
    this.cargarSeries();
  },

  methods: {
    async cargarSeries() {
      const response = await axios.get('/api/facturacion/series', {
        params: { estado: 'activo' }
      });
      this.series = response.data.data;
    },

    agregarProducto(producto) {
      this.carrito.push({
        producto_id: producto.id,
        codigo_producto: producto.codigo,
        descripcion: producto.nombre,
        unidad_medida: 'NIU',
        cantidad: 1,
        precio_unitario: producto.precio_venta,
        tipo_afectacion_igv: '10',
        descuento: 0
      });
      this.calcularTotales();
    },

    calcularTotales() {
      let subtotal = 0;
      let igv = 0;

      this.carrito.forEach(item => {
        const valorUnitario = item.precio_unitario / 1.18;
        const subtotalItem = valorUnitario * item.cantidad - item.descuento;
        const igvItem = subtotalItem * 0.18;

        subtotal += subtotalItem;
        igv += igvItem;
      });

      this.totales = {
        subtotal: subtotal.toFixed(2),
        igv: igv.toFixed(2),
        total: (subtotal + igv).toFixed(2)
      };
    },

    async procesarVenta() {
      if (!this.cliente) {
        alert('Debe seleccionar un cliente');
        return;
      }

      if (this.tipoComprobante === '01' && this.cliente.tipo_documento !== '6') {
        alert('Para Factura el cliente debe tener RUC');
        return;
      }

      const ventaData = {
        cliente: {
          tipo_documento: this.cliente.tipo_documento,
          numero_documento: this.cliente.numero_documento,
          nombre: this.cliente.nombre,
          direccion: this.cliente.direccion,
          email: this.cliente.email
        },
        items: this.carrito,
        metodo_pago: this.metodoPago,
        moneda: 'PEN'
      };

      try {
        // Crear venta
        const ventaResp = await axios.post('/api/ventas', ventaData);
        const ventaId = ventaResp.data.data.id;

        // Emitir comprobante
        const comprobanteResp = await axios.post(`/api/ventas/${ventaId}/facturar`, {
          tipo_comprobante: this.tipoComprobante,
          serie: this.serieSeleccionada
        });

        const comprobante = comprobanteResp.data.data.comprobante;

        // Mostrar resultado
        this.$swal({
          icon: 'success',
          title: 'Comprobante Emitido',
          html: `
            <p><strong>${comprobante.tipo_nombre}</strong></p>
            <p>${comprobante.numero_completo}</p>
            <p>Total: S/ ${this.totales.total}</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Imprimir',
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`/api/ventas/${ventaId}/pdf`, '_blank');
          }
        });

        // Enviar por email si cliente tiene email
        if (this.cliente.email) {
          await axios.post(`/api/ventas/${ventaId}/email`);
        }

        // Limpiar carrito
        this.carrito = [];
        this.cliente = null;

      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Error',
          text: error.response.data.message
        });
      }
    }
  }
};
```

---

## Manejo de Errores

```javascript
// Interceptor global de errores
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      // Errores de SUNAT
      if (data.error === 'SUNAT_ERROR') {
        const codigoSunat = data.codigo_sunat;

        // Mapear códigos comunes
        const mensajes = {
          '2324': 'El RUC del emisor no existe en SUNAT',
          '2017': 'El RUC del cliente no existe',
          '2119': 'Error en el cálculo de totales',
          '2801': 'Error en la estructura del XML'
        };

        const mensaje = mensajes[codigoSunat] || data.message;

        swal({
          icon: 'error',
          title: 'Error de SUNAT',
          text: `Código ${codigoSunat}: ${mensaje}`
        });
      }

      // Errores de validación
      else if (status === 422) {
        const errores = Object.values(data.errors).flat();
        swal({
          icon: 'warning',
          title: 'Errores de validación',
          html: '<ul>' + errores.map(e => `<li>${e}</li>`).join('') + '</ul>'
        });
      }

      // Error de autenticación
      else if (status === 401) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

### Backend - Cola de reintentos

```php
// Command: php artisan facturacion:procesar-reintentos

class ProcesarReintentosCommand extends Command
{
    public function handle()
    {
        $reintentos = ColaReintento::where('estado', 'PENDIENTE')
                                   ->where('intentos', '<', DB::raw('max_intentos'))
                                   ->where('proximo_reintento_at', '<=', now())
                                   ->get();

        foreach ($reintentos as $reintento) {
            $reintento->update(['estado' => 'PROCESANDO']);

            try {
                if ($reintento->entidad_tipo === 'comprobante') {
                    $this->reintentarComprobante($reintento->entidad_id);
                } elseif ($reintento->entidad_tipo === 'resumen') {
                    $this->consultarResumen($reintento->entidad_id);
                }

                $reintento->update(['estado' => 'COMPLETADO']);

            } catch (\Exception $e) {
                $reintento->increment('intentos');
                $reintento->update([
                    'ultimo_error' => $e->getMessage(),
                    'ultimo_intento_at' => now(),
                    'proximo_reintento_at' => now()->addSeconds($reintento->delay_segundos * $reintento->intentos),
                    'estado' => $reintento->intentos >= $reintento->max_intentos ? 'FALLIDO' : 'PENDIENTE'
                ]);
            }
        }
    }
}
```

---

**Versión:** 1.0
**Fecha:** 2025-10-13
