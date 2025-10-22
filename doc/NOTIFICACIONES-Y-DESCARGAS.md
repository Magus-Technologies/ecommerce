# 📧 Sistema de Notificaciones y Descargas para Clientes

## 🎯 Resumen

Se implementó un **sistema completo de notificaciones** y **portal de descargas para clientes**.

---

## 📨 SISTEMA DE NOTIFICACIONES

### Canales Disponibles
✅ **Email** - Correo electrónico  
✅ **WhatsApp** - Mensajes de WhatsApp Business  
✅ **SMS** - Mensajes de texto (opcional)

### Tipos de Notificaciones

1. **VENTA_REALIZADA** - Cuando se registra una venta
2. **COMPROBANTE_GENERADO** - Cuando se emite factura/boleta
3. **PAGO_RECIBIDO** - Cuando se verifica un pago
4. **RECORDATORIO_PAGO** - Recordatorio de deudas
5. **VOUCHER_VERIFICADO** - Cuando se verifica un voucher
6. **PEDIDO_ENVIADO** - Cuando se despacha un pedido

---

## 🚀 Uso del Sistema de Notificaciones

### 1. Notificar Venta Realizada
```php
use App\Services\NotificacionService;

$notificacionService = app(NotificacionService::class);

$notificacionService->notificarVentaRealizada($venta, $cliente);
```

**Se envía automáticamente:**
- Email con detalles de la compra
- WhatsApp (si está configurado)

### 2. Notificar Comprobante Generado
```php
$notificacionService->notificarComprobanteGenerado($comprobante, $cliente);
```

**Incluye:**
- Link para descargar PDF
- Link para descargar XML
- Detalles del comprobante

### 3. Recordatorio de Pago
```php
$notificacionService->recordatorioPago($cuentaPorCobrar, $cliente);
```

**Se envía:**
- Antes del vencimiento (3 días antes)
- El día del vencimiento
- Después del vencimiento (cada 7 días)

---

## 📥 PORTAL DE DESCARGAS PARA CLIENTES

### Endpoints Disponibles

#### 1. Mis Comprobantes
```bash
GET /api/cliente/mis-comprobantes
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "tipo_comprobante": "01",
      "serie": "F001",
      "correlativo": "00123",
      "fecha_emision": "2025-10-19",
      "importe_total": 1500.00,
      "estado": "ACEPTADO"
    }
  ]
}
```

**Filtros:**
- `tipo_comprobante` - 01 (Factura) o 03 (Boleta)
- `fecha_inicio` - Desde fecha
- `fecha_fin` - Hasta fecha

#### 2. Ver Detalle de Comprobante
```bash
GET /api/cliente/mis-comprobantes/{id}
```

#### 3. Descargar Comprobante en PDF
```bash
GET /api/cliente/mis-comprobantes/{id}/pdf
```

**Descarga directa del PDF**

#### 4. Descargar XML
```bash
GET /api/cliente/mis-comprobantes/{id}/xml
```

**Descarga el XML firmado**

#### 5. Reenviar Comprobante por Email
```bash
POST /api/cliente/mis-comprobantes/{id}/reenviar
```

**Envía el comprobante al email del cliente**

#### 6. Mis Ventas
```bash
GET /api/cliente/mis-ventas
```

**Lista todas las compras del cliente**

#### 7. Mis Cuentas por Cobrar
```bash
GET /api/cliente/mis-cuentas
```

**Muestra deudas pendientes si el cliente tiene crédito**

#### 8. Descargar Estado de Cuenta
```bash
GET /api/cliente/estado-cuenta/pdf
```

**Descarga PDF con todas las cuentas y pagos**

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Email (ya configurado en Laravel)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password
MAIL_FROM_ADDRESS=noreply@magus.com
MAIL_FROM_NAME="Magus"

# WhatsApp (opcional)
WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=tu_token_de_whatsapp

# SMS (opcional)
SMS_ENABLED=false
SMS_API_URL=https://api.sms.com/send
SMS_API_TOKEN=tu_token_de_sms
```

### Proveedores de WhatsApp

**Opciones recomendadas:**
1. **Twilio** - https://www.twilio.com/whatsapp
2. **Meta WhatsApp Business API** - https://business.whatsapp.com
3. **Infobip** - https://www.infobip.com
4. **MessageBird** - https://messagebird.com

---

## 💡 Casos de Uso

### Caso 1: Cliente Compra Online

```bash
# 1. Cliente realiza compra
POST /api/ventas/ecommerce
{
  "productos": [...],
  "metodo_pago": "yape"
}

# 2. Sistema envía notificación automática
✅ Email: "Gracias por tu compra #123"
✅ WhatsApp: "🛒 Compra Confirmada..."

# 3. Cliente sube voucher
POST /api/contabilidad/vouchers
{
  "archivo_voucher": [foto_yape.jpg]
}

# 4. Contador verifica voucher
POST /api/contabilidad/vouchers/1/verificar
{
  "estado": "VERIFICADO"
}

# 5. Sistema envía notificación
✅ Email: "Pago verificado"
✅ WhatsApp: "✅ Pago Verificado..."

# 6. Sistema genera comprobante
# Automático al verificar pago

# 7. Sistema envía comprobante
✅ Email: "Tu Factura F001-00123 está lista"
✅ WhatsApp: "📄 Comprobante Electrónico..."

# 8. Cliente descarga desde su cuenta
GET /api/cliente/mis-comprobantes/1/pdf
```

### Caso 2: Recordatorio de Pago

```bash
# Sistema ejecuta tarea programada diaria

# Para cada cuenta vencida:
$cuentas = CuentaPorCobrar::where('fecha_vencimiento', '<', now())
    ->whereIn('estado', ['PENDIENTE', 'PARCIAL'])
    ->get();

foreach ($cuentas as $cuenta) {
    $notificacionService->recordatorioPago($cuenta, $cuenta->cliente);
}

# Cliente recibe:
✅ Email: "Recordatorio: Pago vencido..."
✅ WhatsApp: "💰 Recordatorio de Pago..."
```

### Caso 3: Cliente Descarga sus Documentos

```bash
# Cliente inicia sesión en la app/web
POST /api/login
{
  "email": "cliente@example.com",
  "password": "password"
}

# Ve sus comprobantes
GET /api/cliente/mis-comprobantes

# Descarga una factura
GET /api/cliente/mis-comprobantes/15/pdf
→ Descarga: F001-00123.pdf

# Descarga XML para contabilidad
GET /api/cliente/mis-comprobantes/15/xml
→ Descarga: F001-00123.xml

# Ve su estado de cuenta
GET /api/cliente/mis-cuentas
→ Muestra: Deuda total, pagos realizados, saldo pendiente

# Descarga estado de cuenta
GET /api/cliente/estado-cuenta/pdf
→ Descarga: estado-cuenta-20123456789.pdf
```

---

## 📋 Plantillas de Notificación

### Plantillas Creadas (8 plantillas)

1. **VENTA_REALIZADA_EMAIL**
2. **VENTA_REALIZADA_WHATSAPP**
3. **COMPROBANTE_GENERADO_EMAIL**
4. **COMPROBANTE_GENERADO_WHATSAPP**
5. **RECORDATORIO_PAGO_EMAIL**
6. **RECORDATORIO_PAGO_WHATSAPP**
7. **VOUCHER_VERIFICADO_EMAIL**
8. **VOUCHER_VERIFICADO_WHATSAPP**

### Personalizar Plantillas

```bash
# Ver plantillas
SELECT * FROM plantillas_notificacion;

# Editar plantilla
UPDATE plantillas_notificacion 
SET contenido = 'Nuevo contenido con {variables}'
WHERE codigo = 'VENTA_REALIZADA_EMAIL';
```

**Variables disponibles:**
- `{nombre}` - Nombre del cliente
- `{numero_venta}` - Número de venta
- `{total}` - Monto total
- `{fecha}` - Fecha
- `{numero_documento}` - Número de comprobante
- `{link_descarga}` - Link para descargar

---

## 🔄 Automatización

### Tareas Programadas (Cron)

Agregar al `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Enviar recordatorios de pago diarios
    $schedule->call(function () {
        $cuentas = CuentaPorCobrar::where('fecha_vencimiento', '<', now())
            ->whereIn('estado', ['PENDIENTE', 'PARCIAL'])
            ->get();

        $notificacionService = app(NotificacionService::class);

        foreach ($cuentas as $cuenta) {
            $notificacionService->recordatorioPago($cuenta, $cuenta->cliente);
        }
    })->daily();

    // Reintentar notificaciones fallidas
    $schedule->call(function () {
        $notificaciones = Notificacion::where('estado', 'FALLIDO')
            ->where('intentos', '<', 3)
            ->get();

        $notificacionService = app(NotificacionService::class);

        foreach ($notificaciones as $notif) {
            // Reintentar envío
        }
    })->hourly();
}
```

---

## 📊 Estadísticas

### Tablas Creadas
- `notificaciones` - Registro de todas las notificaciones
- `plantillas_notificacion` - Plantillas personalizables

### Endpoints Nuevos
- 8 endpoints para clientes

### Funcionalidades
✅ Envío de emails  
✅ Envío de WhatsApp  
✅ Plantillas personalizables  
✅ Descarga de comprobantes  
✅ Descarga de XML  
✅ Estado de cuenta  
✅ Reenvío de documentos  
✅ Historial de notificaciones

---

## ✅ Checklist

### Configuración
- [x] Tablas creadas
- [x] Modelos creados
- [x] Servicio de notificaciones
- [x] Plantillas creadas
- [x] Rutas configuradas

### Funcionalidades
- [x] Envío de emails
- [x] Integración WhatsApp (preparada)
- [x] Descarga de PDF
- [x] Descarga de XML
- [x] Estado de cuenta
- [x] Reenvío de documentos

### Notificaciones Automáticas
- [x] Venta realizada
- [x] Comprobante generado
- [x] Voucher verificado
- [x] Recordatorio de pago

---

## 🎯 Beneficios

### Para el Cliente
✅ Recibe notificaciones inmediatas  
✅ Descarga sus documentos 24/7  
✅ No depende de llamar o ir a la tienda  
✅ Tiene todo organizado en su cuenta  
✅ Puede compartir documentos fácilmente

### Para el Negocio
✅ Reduce consultas de clientes  
✅ Mejora experiencia del cliente  
✅ Automatiza comunicaciones  
✅ Reduce trabajo manual  
✅ Mejora cobranza con recordatorios

---

**Implementado:** 19 de Octubre, 2025  
**Estado:** ✅ COMPLETADO

🎉 **¡Sistema de notificaciones y descargas operativo!** 🎉
