# Flujos de Trabajo - Facturación Electrónica

## Índice
1. [Flujo General de Facturación](#flujo-general-de-facturación)
2. [Flujo de Emisión de Boleta](#flujo-de-emisión-de-boleta)
3. [Flujo de Emisión de Factura](#flujo-de-emisión-de-factura)
4. [Flujo de Nota de Crédito](#flujo-de-nota-de-crédito)
5. [Flujo de Resumen Diario](#flujo-de-resumen-diario)
6. [Flujo de Comunicación de Baja](#flujo-de-comunicación-de-baja)
7. [Flujo de Reintentos](#flujo-de-reintentos)
8. [Flujo POS](#flujo-pos)

---

## Flujo General de Facturación

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO GENERAL DE FACTURACIÓN                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐
│  Inicio  │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Crear Venta         │ POST /api/ventas
│ - Cliente           │ {cliente, items, totales}
│ - Items             │
│ - Totales           │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Venta en estado     │ Estado: PENDIENTE
│ PENDIENTE           │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ Seleccionar tipo comprobante        │ POST /api/ventas/:id/facturar
│ - 01: Factura (RUC obligatorio)     │ {tipo_comprobante, serie}
│ - 03: Boleta (DNI o sin doc)        │
└─────┬───────────────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Validar Cliente     │
│ - Tipo doc vs tipo  │
│   comprobante       │
│ - Datos completos   │
└─────┬───────────────┘
      │
      ├──[ERROR]──────────────────────┐
      │                               │
      │ [OK]                          ▼
      │                    ┌────────────────────┐
      │                    │ Retornar error 400 │
      │                    │ CLIENTE_INVALIDO   │
      │                    └────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Reservar Correlativo│ SELECT ... FOR UPDATE
│ - Bloqueo de serie  │ UPDATE series
│ - Incrementar       │ SET correlativo_actual++
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Construir UBL XML   │ Greenter
│ - Invoice/Note      │ - Company
│ - Client            │ - Details
│ - Details           │ - Totales
│ - Totales           │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Firmar con          │ Certificado .pfx
│ Certificado Digital │ XMLSecLibs
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Enviar a SUNAT      │ SOAP WS
│ - Endpoint beta/prod│ billService
│ - Credenciales SOL  │
└─────┬───────────────┘
      │
      ├──[ERROR RED/TIMEOUT]──────────┐
      │                               │
      │ [OK]                          ▼
      │                    ┌───────────────────┐
      │                    │ Guardar en        │
      │                    │ cola_reintentos   │
      │                    └───────────────────┘
      │
      ▼
┌─────────────────────┐
│ Recibir CDR         │ Constancia de Recepción
│ (Constancia)        │ - Código SUNAT
└─────┬───────────────┘ - Mensaje
      │
      ├──[RECHAZADO]─────────────────┐
      │                              │
      │ [ACEPTADO]                   ▼
      │                   ┌────────────────────┐
      │                   │ Retornar error 500 │
      │                   │ SUNAT_ERROR        │
      │                   │ {codigo, mensaje}  │
      │                   └────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Guardar Archivos    │
│ - XML firmado       │ /storage/xml/
│ - CDR (ZIP)         │ /storage/cdr/
│ - Hash              │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Crear Comprobante   │ INSERT INTO comprobantes
│ en BD               │ - Serie-Número
│                     │ - Hash, Paths
│                     │ - Estado SUNAT
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Actualizar Venta    │ UPDATE ventas
│ Estado: FACTURADO   │ SET estado='FACTURADO'
│                     │ comprobante_id=...
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Registrar Auditoría │ INSERT INTO auditoria_sunat
│ - Request/Response  │
│ - Tiempo respuesta  │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Generar PDF         │ GET /api/ventas/:id/pdf
│ - QR con hash       │ DOMPDF/TCPDF
│ - Representación    │
│   impresa           │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Enviar Email        │ POST /api/ventas/:id/email
│ (Opcional)          │ Adjuntos: PDF, CDR
└─────┬───────────────┘
      │
      ▼
┌──────────┐
│   Fin    │
└──────────┘
```

---

## Flujo de Emisión de Boleta

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMISIÓN DE BOLETA (Tipo 03)                      │
└─────────────────────────────────────────────────────────────────────┘

Usuario en POS
     │
     ▼
Agregar productos al carrito
     │
     ▼
┌─────────────────────┐
│ Seleccionar Cliente │
│ - DNI (opcional)    │  Boleta puede ser:
│ - Sin documento     │  - Con DNI
│ - Nombre            │  - Sin documento (hasta S/700)
└─────┬───────────────┘  - Con CE/Pasaporte
      │
      ▼
┌─────────────────────┐
│ Calcular Totales    │
│ - Por cada item:    │
│   * Gravado IGV 18% │  Precio incluye IGV
│   * Exonerado       │  Precio = Valor + IGV
│ - Descuentos        │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ POST /api/ventas    │
│ Estado: PENDIENTE   │
└─────┬───────────────┘
      │
      ▼
┌──────────────────────────┐
│ POST /ventas/:id/facturar│
│ tipo_comprobante: "03"   │
│ serie: "B001" (opcional) │
└─────┬────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Validar restricción │  - Boleta con DNI: cualquier monto
│ de monto            │  - Boleta sin doc: máx S/ 700
└─────┬───────────────┘
      │
      ▼
Backend: Reservar correlativo B001-152
      │
      ▼
Construir XML Invoice (tipo 03)
      │
      ▼
Firmar y Enviar a SUNAT (Sync)
      │
      ├───[ACEPTADO]──────────────────┐
      │                               │
      │                               ▼
      │                   ┌─────────────────────┐
      │                   │ Guardar XML/CDR     │
      │                   │ Hash, Estado SUNAT  │
      │                   └─────┬───────────────┘
      │                         │
      │                         ▼
      │                   ┌─────────────────────┐
      │                   │ Crear comprobante   │
      │                   │ Venta: FACTURADO    │
      │                   └─────┬───────────────┘
      │                         │
      │                         ▼
      │                   ┌─────────────────────┐
      │                   │ Retornar JSON       │
      │                   │ {comprobante, hash, │
      │                   │  pdf_url, cdr_url}  │
      │                   └─────┬───────────────┘
      │                         │
      │                         ▼
      │                   Frontend: Mostrar éxito
      │                         │
      │                         ▼
      │                   Abrir PDF en nueva pestaña
      │                         │
      │                         ▼
      │                   ¿Enviar por email?
      │                         │
      │                    ┌────┴─────┐
      │                    │ SÍ       │ NO
      │                    ▼          ▼
      │         POST /ventas/:id/email  [Fin]
      │
      └───[RECHAZADO]──────────────────┐
                                       │
                                       ▼
                          ┌──────────────────────┐
                          │ Retornar error 500   │
                          │ Código SUNAT + msg   │
                          └──────┬───────────────┘
                                 │
                                 ▼
                          Frontend: Mostrar error
                                 │
                                 ▼
                          Usuario decide: ¿Reintentar?

┌────────────────────────────────────────────────────────────────────┐
│ IMPORTANTE: Boletas se envían INMEDIATAMENTE (sync)                │
│ Luego se incluyen en Resumen Diario al cierre del día              │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Emisión de Factura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMISIÓN DE FACTURA (Tipo 01)                     │
└─────────────────────────────────────────────────────────────────────┘

Usuario crea venta
     │
     ▼
┌─────────────────────┐
│ Seleccionar Cliente │
│ - RUC OBLIGATORIO   │  Factura SOLO con RUC
│ - Razón Social      │  11 dígitos
│ - Dirección fiscal  │  Debe existir en SUNAT
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Validar RUC         │
│ - Formato 11 dígitos│  Opcional: consultar API
│ - Inicia con 10/20  │  RUC SUNAT para validar
└─────┬───────────────┘
      │
      ├──[RUC INVÁLIDO]───────────────┐
      │                               │
      │ [RUC VÁLIDO]                  ▼
      │                    ┌────────────────────┐
      │                    │ Mostrar error      │
      │                    │ "RUC inválido"     │
      │                    └────────────────────┘
      │
      ▼
POST /api/ventas
     │
     ▼
POST /ventas/:id/facturar
  tipo_comprobante: "01"
  serie: "F001"
  fecha_vencimiento: "2025-11-13" (opcional, para crédito)
     │
     ▼
Backend: Reservar correlativo F001-88
     │
     ▼
Construir XML Invoice (tipo 01)
  - Company (emisor)
  - Client (RUC obligatorio)
  - Details (items)
  - Totales
  - FormaPago (contado/crédito)
     │
     ▼
Firmar con certificado digital
     │
     ▼
Enviar a SUNAT (Sync)
     │
     ├───[ACEPTADO]──────────┐
     │                       │
     │                       ▼
     │           Guardar XML/CDR/Hash
     │                       │
     │                       ▼
     │           Crear comprobante en BD
     │           Estado SUNAT: ACEPTADO
     │                       │
     │                       ▼
     │           Retornar JSON con datos
     │                       │
     │                       ▼
     │           Frontend: Mostrar éxito
     │           "Factura F001-88 emitida"
     │                       │
     │                       ▼
     │           Descargar PDF (con QR y hash)
     │                       │
     │                       ▼
     │           Enviar por email (opcional)
     │
     └───[RECHAZADO]────────┐
                            │
                            ▼
              ┌──────────────────────────┐
              │ Analizar código error    │
              └──────┬───────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    [2324]      [2017]      [2119]
    RUC emisor  RUC cliente  Totales
    no existe   no existe    incorrectos
         │           │           │
         └───────────┴───────────┘
                     │
                     ▼
         Retornar error específico
                     │
                     ▼
         Frontend: Mostrar error
         Permitir corrección

┌────────────────────────────────────────────────────────────────────┐
│ NOTAS:                                                              │
│ - Facturas NO van a Resumen Diario                                 │
│ - Se envían inmediatamente (sync)                                  │
│ - Para anular: Comunicación de Baja o Nota de Crédito              │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Nota de Crédito

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOTA DE CRÉDITO (Tipo 07)                        │
│              (Anulación, Devolución, Descuento)                     │
└─────────────────────────────────────────────────────────────────────┘

Usuario busca comprobante a anular/corregir
     │
     ▼
┌─────────────────────┐
│ Seleccionar CPE     │
│ Referencia:         │  Puede ser:
│ - F001-88 (Factura) │  - Factura
│ - B001-150 (Boleta) │  - Boleta
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Validar estado CPE  │
│ Estado debe ser:    │  Solo se puede hacer NC
│ ACEPTADO            │  de CPE aceptados
└─────┬───────────────┘
      │
      ├──[NO ACEPTADO]────────────────┐
      │                               │
      │ [ACEPTADO]                    ▼
      │                    ┌────────────────────┐
      │                    │ Mostrar error      │
      │                    │ "CPE no válido"    │
      │                    └────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ Seleccionar motivo NC   │  Catálogo 09:
│                         │  01 = Anulación total
│ 01: Anulación operación │  06 = Devolución total
│ 06: Devolución total    │  07 = Devolución parcial
│ 07: Devolución parcial  │  04 = Descuento global
│ 04: Descuento global    │  etc.
└─────┬───────────────────┘
      │
      ▼
┌─────────────────────┐
│ Definir items NC    │
│                     │  Según motivo:
│ Anulación:          │  - Total: copiar todos items
│   Todos los items   │  - Parcial: seleccionar items
│                     │  - Descuento: item descuento
│ Devolución parcial: │
│   Seleccionar items │
└─────┬───────────────┘
      │
      ▼
POST /api/facturacion/notas-credito
{
  comprobante_referencia: {
    tipo: "01",
    serie: "F001",
    numero: 88
  },
  tipo_nota_credito: "01",
  motivo: "ANULACION DE LA OPERACION",
  items: [...],
  serie: "FC01"
}
     │
     ▼
Backend: Validaciones
  - CPE referencia existe
  - CPE está ACEPTADO
  - Items válidos
     │
     ▼
Reservar correlativo NC
  - Factura → Serie FC## (FC01)
  - Boleta → Serie BC## (BC01)
     │
     ▼
Construir XML Note (tipo 07)
  - TipDocAfectado: "01" o "03"
  - NumDocfectado: "F001-88"
  - CodMotivo: "01"
  - DesMotivo: "ANULACION..."
  - Details: items de la NC
     │
     ▼
Firmar con certificado
     │
     ▼
Enviar a SUNAT (Sync)
     │
     ├───[ACEPTADO]──────────┐
     │                       │
     │                       ▼
     │           Guardar XML/CDR
     │                       │
     │                       ▼
     │           Crear comprobante NC
     │           - tipo: "07"
     │           - comprobante_ref_id
     │                       │
     │                       ▼
     │           Actualizar CPE original
     │           Estado: BAJA (anulado)
     │                       │
     │                       ▼
     │           Retornar JSON
     │           {nc, hash, pdf_url}
     │                       │
     │                       ▼
     │           Frontend: Mostrar éxito
     │           "NC FC01-12 emitida"
     │                       │
     │                       ▼
     │           Descargar PDF NC
     │
     └───[RECHAZADO]────────┐
                            │
                            ▼
              Retornar error SUNAT
                            │
                            ▼
              Frontend: Mostrar error

┌────────────────────────────────────────────────────────────────────┐
│ IMPORTANTE:                                                         │
│ - NC de Boleta: puede ir a Resumen Diario del día                  │
│ - NC de Factura: envío inmediato                                   │
│ - La NC NO elimina el CPE original, lo marca como BAJA             │
│ - Para fines contables: CPE original queda anulado                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Resumen Diario

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESUMEN DIARIO (RC)                              │
│       Envío diferido de Boletas y Notas asociadas                   │
└─────────────────────────────────────────────────────────────────────┘

Cierre del día (23:00 - 23:59)
     │
     ▼
┌─────────────────────┐
│ Job/Cron automático │  Ejecutar diariamente
│ o Manual            │  o bajo demanda
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Buscar boletas del  │  SELECT * FROM comprobantes
│ día pendientes      │  WHERE fecha_emision = CURDATE()
│                     │  AND tipo_comprobante = '03'
│ - Tipo 03 (Boletas) │  AND estado_sunat = 'ACEPTADO'
│ - Fecha emisión hoy │
│ - Estado ACEPTADO   │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ ¿Hay boletas?       │
└─────┬───────────────┘
      │
      ├──[NO HAY]─────────────────────┐
      │                               │
      │ [SÍ HAY]                      ▼
      │                    ┌────────────────────┐
      │                    │ No generar RC      │
      │                    │ Terminar proceso   │
      │                    └────────────────────┘
      │
      ▼
POST /api/facturacion/resumenes
{
  fecha: "2025-10-13",
  comprobantes: [
    {id: 315, serie: "B001", numero: 150, ...},
    {id: 316, serie: "B001", numero: 151, ...}
  ]
}
     │
     ▼
Backend: Construir XML Summary
  - Identificador: RC-20251013-001
  - FechaEmision: hoy
  - FechaGeneracion: hoy
  - Items (resumen por boleta):
    * Serie-Número
    * Totales (gravado, exonerado, IGV)
    * Estado: 1 (adicionar)
     │
     ▼
Firmar con certificado
     │
     ▼
Enviar a SUNAT (Async)
  Endpoint: sendSummary
     │
     ▼
Recibir TICKET (no CDR aún)
  Ejemplo: "1698754321-ABC123XYZ"
     │
     ▼
Guardar resumen en BD
  - ticket
  - estado: PENDIENTE
  - xml_path
     │
     ▼
Retornar JSON
{
  success: true,
  ticket: "1698754321-ABC123XYZ",
  estado: "PENDIENTE"
}
     │
     ▼
Frontend: Mostrar ticket
"Resumen enviado, consultar estado"
     │
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONSULTAR ESTADO DEL TICKET                      │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
Job cada 30 segundos (o manual)
GET /api/facturacion/resumenes/:ticket
     │
     ▼
Backend: Consultar a SUNAT
  Endpoint: getStatus(ticket)
     │
     ▼
┌─────────────────────┐
│ Estado SUNAT        │
└─────┬───────────────┘
      │
      ├──[EN PROCESO]─────────────────┐
      │                               │
      │                               ▼
      │                    Retornar: PENDIENTE
      │                    Seguir consultando cada 30s
      │
      ├──[ACEPTADO]───────────────────┐
      │                               │
      │                               ▼
      │                    Descargar CDR
      │                               │
      │                               ▼
      │                    Guardar CDR en storage
      │                               │
      │                               ▼
      │                    Actualizar resumen
      │                    - estado: ACEPTADO
      │                    - cdr_path
      │                    - fecha_procesamiento
      │                               │
      │                               ▼
      │                    Retornar: ACEPTADO
      │                    Mostrar "RC aprobado"
      │
      └──[RECHAZADO]─────────────────┐
                                     │
                                     ▼
                      Actualizar resumen
                      - estado: RECHAZADO
                      - codigo_sunat
                      - mensaje_sunat
                                     │
                                     ▼
                      Retornar: RECHAZADO
                      Mostrar error
                                     │
                                     ▼
                      Analizar error y corregir
                      Volver a generar RC

┌────────────────────────────────────────────────────────────────────┐
│ FRECUENCIA:                                                         │
│ - Generar RC: Una vez al día (23:30)                                │
│ - Consultar estado: Cada 30 segundos hasta obtener respuesta       │
│ - SUNAT procesa en 1-10 minutos normalmente                        │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Comunicación de Baja

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMUNICACIÓN DE BAJA (RA)                        │
│              Anular comprobantes ya emitidos                        │
└─────────────────────────────────────────────────────────────────────┘

Usuario necesita anular CPE
     │
     ▼
┌─────────────────────┐
│ Buscar comprobante  │
│ a anular            │
│ - F001-85 (Factura) │
│ - B001-148 (Boleta) │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Validaciones        │
│                     │
│ - Estado: ACEPTADO  │  Solo CPE aceptados
│ - Boleta: máx 7 días│  Restricción SUNAT
│ - Factura: sin límite│
└─────┬───────────────┘
      │
      ├──[NO VÁLIDO]──────────────────┐
      │                               │
      │ [VÁLIDO]                      ▼
      │                    ┌────────────────────┐
      │                    │ Mostrar error      │
      │                    │ "Fuera de plazo" o │
      │                    │ "Estado inválido"  │
      │                    └────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Ingresar motivo     │
│ de baja             │  Ejemplos:
│                     │  - "Error en emisión"
│ Texto libre         │  - "Operación no realizada"
│ (obligatorio)       │  - "Cliente solicitó anulación"
└─────┬───────────────┘
      │
      ▼
POST /api/facturacion/bajas
{
  comprobantes: [
    {
      tipo: "01",
      serie: "F001",
      numero: 85,
      motivo: "ERROR EN LA EMISION"
    },
    {
      tipo: "03",
      serie: "B001",
      numero: 148,
      motivo: "OPERACION NO REALIZADA"
    }
  ],
  fecha_baja: "2025-10-13"
}
     │
     ▼
Backend: Validar todos los CPE
  - Existen en BD
  - Estado ACEPTADO
  - Dentro de plazo (si boleta)
     │
     ▼
Generar identificador
  RA-YYYYMMDD-NNN
  Ejemplo: RA-20251013-001
     │
     ▼
Construir XML VoidedDocuments
  - FechaEmision: hoy
  - FechaGeneracion: hoy
  - Items (por cada CPE):
    * TipoDocumento
    * Serie-Numero
    * Motivo
     │
     ▼
Firmar con certificado
     │
     ▼
Enviar a SUNAT (Async)
  Endpoint: sendSummary (mismo que RC)
     │
     ▼
Recibir TICKET
  Ejemplo: "1698754987-XYZ456ABC"
     │
     ▼
Guardar baja en BD
  - identificador: RA-20251013-001
  - ticket
  - estado: PENDIENTE
  - xml_path
     │
     ▼
Guardar detalle (cada CPE)
  - baja_id
  - comprobante_id
  - motivo
     │
     ▼
Retornar JSON
{
  success: true,
  ticket: "1698754987-XYZ456ABC",
  identificador: "RA-20251013-001",
  estado: "PENDIENTE"
}
     │
     ▼
Frontend: Mostrar ticket
"Baja enviada, consultar estado"
     │
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONSULTAR ESTADO DEL TICKET                      │
└─────────────────────────────────────────────────────────────────────┘
     │
     ▼
Job cada 30 segundos (o manual)
GET /api/facturacion/bajas/:ticket
     │
     ▼
Backend: Consultar a SUNAT
  Endpoint: getStatus(ticket)
     │
     ▼
┌─────────────────────┐
│ Estado SUNAT        │
└─────┬───────────────┘
      │
      ├──[EN PROCESO]─────────────────┐
      │                               │
      │                               ▼
      │                    Retornar: PENDIENTE
      │                    Seguir consultando
      │
      ├──[ACEPTADO]───────────────────┐
      │                               │
      │                               ▼
      │                    Descargar CDR
      │                               │
      │                               ▼
      │                    Actualizar baja
      │                    - estado: ACEPTADO
      │                    - cdr_path
      │                               │
      │                               ▼
      │                    Actualizar cada CPE
      │                    - estado_sunat: BAJA
      │                               │
      │                               ▼
      │                    Retornar: ACEPTADO
      │                    "Baja aprobada"
      │
      └──[RECHAZADO]─────────────────┐
                                     │
                                     ▼
                      Actualizar baja
                      - estado: RECHAZADO
                      - mensaje_sunat
                                     │
                                     ▼
                      Retornar: RECHAZADO
                      Mostrar error

┌────────────────────────────────────────────────────────────────────┐
│ RESTRICCIONES IMPORTANTES:                                          │
│ - Boletas: máximo 7 días después de emisión                        │
│ - Facturas: sin límite de tiempo                                   │
│ - Una RA puede incluir múltiples CPE (batch)                       │
│ - Alternativa: Nota de Crédito (anulación contable, sin límite)    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Reintentos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE REINTENTOS                            │
│         Para errores de red o timeouts a SUNAT                      │
└─────────────────────────────────────────────────────────────────────┘

Emisión de comprobante
     │
     ▼
Enviar a SUNAT
     │
     ├──[TIMEOUT/ERROR RED]──────────┐
     │                               │
     │                               ▼
     │                    ┌────────────────────┐
     │                    │ Guardar en         │
     │                    │ cola_reintentos    │
     │                    │                    │
     │                    │ - entidad_tipo     │
     │                    │ - entidad_id       │
     │                    │ - intentos: 0      │
     │                    │ - max_intentos: 3  │
     │                    │ - estado: PENDIENTE│
     │                    └────┬───────────────┘
     │                         │
     │                         ▼
     │              Retornar al usuario
     │              "Error temporal, se reintentará"
     │
     ▼
[Proceso normal continúa]

┌─────────────────────────────────────────────────────────────────────┐
│                    JOB DE REINTENTOS                                │
│         php artisan facturacion:procesar-reintentos                 │
│         Ejecutar cada 5 minutos (cron)                              │
└─────────────────────────────────────────────────────────────────────┘

Job ejecuta (cada 5 min)
     │
     ▼
┌─────────────────────┐
│ Buscar reintentos   │  SELECT * FROM cola_reintentos
│ pendientes          │  WHERE estado = 'PENDIENTE'
│                     │  AND intentos < max_intentos
│ - Estado: PENDIENTE │  AND proximo_reintento_at <= NOW()
│ - Dentro de ventana │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ ¿Hay reintentos?    │
└─────┬───────────────┘
      │
      ├──[NO]────────────────────────[Terminar]
      │
      │ [SÍ]
      │
      ▼
Para cada reintento:
     │
     ▼
UPDATE estado = 'PROCESANDO'
     │
     ▼
┌─────────────────────┐
│ Obtener entidad     │
│                     │  Según entidad_tipo:
│ - comprobante       │  - Comprobante
│ - resumen           │  - Resumen (consultar ticket)
│ - baja              │  - Baja (consultar ticket)
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Reintentar envío    │
│ a SUNAT             │
└─────┬───────────────┘
      │
      ├──[ÉXITO]──────────────────────┐
      │                               │
      │                               ▼
      │                    Actualizar entidad
      │                    (guardar XML/CDR)
      │                               │
      │                               ▼
      │                    UPDATE cola_reintentos
      │                    SET estado = 'COMPLETADO'
      │                               │
      │                               ▼
      │                    Notificar usuario (opcional)
      │                    "Comprobante procesado"
      │
      └──[ERROR]─────────────────────┐
                                     │
                                     ▼
                      Incrementar intentos++
                                     │
                                     ▼
                      ¿intentos >= max_intentos?
                                     │
                          ┌──────────┴──────────┐
                          │ SÍ                  │ NO
                          ▼                     ▼
                   ┌─────────────┐      ┌─────────────┐
                   │ estado:     │      │ estado:     │
                   │ FALLIDO     │      │ PENDIENTE   │
                   └─────┬───────┘      └─────┬───────┘
                         │                    │
                         ▼                    ▼
                   Notificar admin     Calcular próximo reintento
                   "Reintento fallido" - Backoff exponencial:
                         │               * Intento 1: 5 min
                         │               * Intento 2: 15 min
                         │               * Intento 3: 30 min
                         │                    │
                         │                    ▼
                         │             UPDATE proximo_reintento_at
                         │             = NOW() + delay
                         │
                         ▼
                   Requiere intervención manual
                   - Revisar error
                   - Corregir datos
                   - Reenviar manualmente

┌────────────────────────────────────────────────────────────────────┐
│ ESTRATEGIA DE BACKOFF:                                              │
│ - Intento 1: inmediato → 5 minutos después                         │
│ - Intento 2: 15 minutos después del intento 1                      │
│ - Intento 3: 30 minutos después del intento 2                      │
│ - Total: 3 intentos en ~50 minutos                                 │
│ - Después: FALLIDO → requiere acción manual                        │
└────────────────────────────────────────────────────────────────────┘
```

---

## Flujo POS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO POS                               │
│            (Punto de Venta con Facturación)                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Abrir Caja   │
│ (Inicio día) │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│ Cargar configuración│  - Series activas
│ - Sede/Caja         │  - Productos
│ - Series disponibles│  - Tipos de pago
└─────┬───────────────┘
      │
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LOOP: ATENDER CLIENTES                           │
└─────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Cliente llega       │
│                     │
│ Escanear productos  │
│ o buscar manual     │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Agregar al carrito  │
│                     │  Por cada producto:
│ - Código/Descripción│  - Buscar precio
│ - Cantidad          │  - Calcular subtotal
│ - Precio unitario   │  - Aplicar descuento (opcional)
│ - Descuento línea   │  - Calcular IGV
└─────┬───────────────┘
      │
      │ Puede agregar más productos
      │ o modificar cantidades
      │
      ▼
┌─────────────────────┐
│ Calcular totales    │
│ automáticamente     │
│                     │  - Subtotal
│ - Gravado IGV 18%   │  - IGV
│ - Total             │  - Total
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ ¿Cliente desea      │
│  comprobante?       │
└─────┬───────────────┘
      │
      ├──[NO]────────────────────────┐
      │                              │
      │                              ▼
      │                   Registrar como "nota de venta"
      │                   (sin envío a SUNAT)
      │                              │
      │                              ▼
      │                   Imprimir ticket simple
      │                              │
      │                              ▼
      │                   [Siguiente cliente]
      │
      │ [SÍ]
      │
      ▼
┌─────────────────────┐
│ Solicitar datos     │
│ del cliente         │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────────┐
│ ¿Qué tipo comprobante?  │
│                         │
│ [Boleta]    [Factura]   │
└─────┬───────────────────┘
      │
      ├──[BOLETA]──────────────────┐
      │                            │
      │                            ▼
      │             ┌────────────────────────┐
      │             │ Ingresar:              │
      │             │ - DNI (opcional)       │
      │             │ - Nombre               │
      │             │ - Email (opcional)     │
      │             └────────┬───────────────┘
      │                      │
      │                      ▼
      │             ¿Total > S/ 700 sin DNI?
      │                      │
      │             ┌────────┴────────┐
      │             │ SÍ              │ NO
      │             ▼                 ▼
      │      Requerir DNI        Continuar
      │
      └──[FACTURA]─────────────────┐
                                   │
                                   ▼
                    ┌────────────────────────┐
                    │ Ingresar:              │
                    │ - RUC (obligatorio)    │
                    │ - Razón Social         │
                    │ - Dirección fiscal     │
                    │ - Email                │
                    └────────┬───────────────┘
                             │
                             ▼
                    Validar RUC (formato)
                             │
      ┌──────────────────────┴──────────────────────┐
      │                                             │
      ▼                                             ▼
[VÁLIDO]                                      [INVÁLIDO]
      │                                             │
      │                                      Mostrar error
      │                                      "RUC inválido"
      │                                             │
      │                                      [Reingresar]
      │
      ▼
┌─────────────────────┐
│ Seleccionar método  │
│ de pago             │  - Efectivo
│                     │  - Tarjeta
│ - Efectivo          │  - Transferencia
│ - Tarjeta           │  - Crédito (solo facturas)
│ - Otro              │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ Confirmar datos     │
│                     │  Mostrar resumen:
│ Pantalla resumen:   │  - Cliente
│ - Cliente           │  - Items
│ - Items             │  - Totales
│ - Total             │  - Tipo comprobante
│ - Tipo comprobante  │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│ ¿Confirmar venta?   │
└─────┬───────────────┘
      │
      ├──[NO]──────────────[Volver a modificar]
      │
      │ [SÍ]
      │
      ▼
POST /api/ventas
{cliente, items, totales}
      │
      ▼
Venta creada (PENDIENTE)
venta_id: 450
      │
      ▼
POST /api/ventas/450/facturar
{tipo_comprobante, serie}
      │
      ▼
[Proceso de facturación en backend]
- Reservar correlativo
- Construir XML
- Firmar
- Enviar SUNAT
- Guardar XML/CDR
      │
      ▼
┌─────────────────────┐
│ Respuesta SUNAT     │
└─────┬───────────────┘
      │
      ├──[ACEPTADO]────────────────┐
      │                            │
      │                            ▼
      │             ┌────────────────────────┐
      │             │ Mostrar éxito          │
      │             │ "Comprobante emitido"  │
      │             │ B001-152 o F001-88     │
      │             └────────┬───────────────┘
      │                      │
      │                      ▼
      │             ┌────────────────────────┐
      │             │ Imprimir ticket        │
      │             │ (Representación PDF)   │
      │             │                        │
      │             │ Incluye:               │
      │             │ - QR con hash          │
      │             │ - Serie-Número         │
      │             │ - Detalle items        │
      │             │ - Totales              │
      │             └────────┬───────────────┘
      │                      │
      │                      ▼
      │             ¿Cliente tiene email?
      │                      │
      │             ┌────────┴────────┐
      │             │ SÍ              │ NO
      │             ▼                 ▼
      │    POST /ventas/:id/email   [Terminar]
      │    Enviar PDF + CDR
      │             │
      │             ▼
      │    Email enviado
      │             │
      │             ▼
      │    [Siguiente cliente]
      │
      └──[RECHAZADO]──────────────┐
                                  │
                                  ▼
                   ┌────────────────────────┐
                   │ Mostrar error          │
                   │ Código SUNAT + mensaje │
                   └────────┬───────────────┘
                            │
                            ▼
                   ┌────────────────────────┐
                   │ Opciones:              │
                   │ [Reintentar]           │
                   │ [Corregir datos]       │
                   │ [Cancelar]             │
                   └────────┬───────────────┘
                            │
                   Usuario decide acción

┌─────────────────────────────────────────────────────────────────────┐
│                    CIERRE DE CAJA                                   │
└─────────────────────────────────────────────────────────────────────┘

Fin del día (23:00)
      │
      ▼
┌─────────────────────┐
│ Generar reporte     │  - Total ventas
│ de ventas del día   │  - Cantidad CPE emitidos
│                     │  - Desglose por tipo
└─────┬───────────────┘  - Métodos de pago
      │
      ▼
┌─────────────────────┐
│ Generar Resumen     │  POST /api/facturacion/resumenes
│ Diario (RC)         │  {fecha, comprobantes: [...]}
│ para boletas        │
└─────┬───────────────┘
      │
      ▼
Enviar RC a SUNAT
      │
      ▼
Consultar estado hasta ACEPTADO
      │
      ▼
┌─────────────────────┐
│ Cerrar Caja         │
│                     │
│ Arqueo de efectivo  │
└─────┬───────────────┘
      │
      ▼
[Fin del día]

┌────────────────────────────────────────────────────────────────────┐
│ CONSIDERACIONES POS:                                                │
│ - Interfaz rápida y simple                                          │
│ - Validaciones en tiempo real                                       │
│ - Manejo de errores claro para cajero                               │
│ - Impresión automática                                              │
│ - Email opcional pero recomendado                                   │
│ - RC automático al cierre                                           │
└────────────────────────────────────────────────────────────────────┘
```

---

## Resumen de Tiempos

| Operación | Tipo de Envío | Tiempo Respuesta SUNAT |
|-----------|---------------|------------------------|
| Boleta | Síncrono | Inmediato (2-10 seg) |
| Factura | Síncrono | Inmediato (2-10 seg) |
| Nota Crédito | Síncrono | Inmediato (2-10 seg) |
| Nota Débito | Síncrono | Inmediato (2-10 seg) |
| Resumen Diario | Asíncrono (ticket) | 1-10 minutos |
| Comunicación Baja | Asíncrono (ticket) | 1-10 minutos |

---

## Estados Posibles de Comprobantes

```
Estado en BD          Estado SUNAT         Descripción
─────────────────────────────────────────────────────────────────
PENDIENTE             -                    Aún no enviado
ACEPTADO              0                    Aceptado por SUNAT
ACEPTADO_OBS          0001-0099            Aceptado con observaciones
RECHAZADO             2000+                Rechazado (error emisor/contenido)
BAJA                  -                    Anulado por RA o NC
```

---

**Versión:** 1.0
**Fecha:** 2025-10-13
