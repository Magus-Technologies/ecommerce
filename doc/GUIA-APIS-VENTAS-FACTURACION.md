# Guía Completa de APIs - Sistema de Ventas y Facturación

## 📋 Resumen Ejecutivo

Este documento proporciona una guía completa de todas las APIs disponibles para el sistema de ventas (online y manuales) y facturación electrónica, organizadas por funcionalidad y flujo de trabajo.

## 🛒 1. SISTEMA DE CARRITO Y ECOMMERCE

### 1.1 Gestión del Carrito
**Base URL:** `/api/cart`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Obtener items del carrito | - |
| POST | `/add` | Agregar producto al carrito | `producto_id`, `cantidad` |
| PUT | `/update/{producto_id}` | Actualizar cantidad | `cantidad` |
| DELETE | `/remove/{producto_id}` | Eliminar producto | - |
| DELETE | `/clear` | Vaciar carrito | - |
| POST | `/sync` | Sincronizar con localStorage | `items[]` |

**Ejemplo de uso:**
```javascript
// Agregar producto al carrito
POST /api/cart/add
{
  "producto_id": 123,
  "cantidad": 2
}

// Sincronizar carrito
POST /api/cart/sync
{
  "items": [
    {"producto_id": 123, "cantidad": 2},
    {"producto_id": 456, "cantidad": 1}
  ]
}
```

### 1.2 Productos Públicos
**Base URL:** `/api/productos-publicos`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar productos públicos | `page`, `categoria_id`, `search` |
| GET | `/{id}` | Ver detalle de producto | - |
| GET | `/destacados` | Productos destacados | - |
| GET | `/buscar` | Buscar productos | `q`, `categoria_id` |

## 🛍️ 2. SISTEMA DE VENTAS

### 2.1 Ventas Manuales (Admin/Vendedor)
**Base URL:** `/api/ventas`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar ventas | `estado`, `cliente_id`, `fecha_inicio`, `fecha_fin`, `search` |
| POST | `/` | Crear venta manual | Ver estructura abajo |
| GET | `/estadisticas` | Estadísticas de ventas | `fecha_inicio`, `fecha_fin` |
| GET | `/{id}` | Ver detalle de venta | - |
| POST | `/{id}/facturar` | Facturar venta | `cliente_datos` (opcional) |
| PATCH | `/{id}/anular` | Anular venta | - |

**Estructura para crear venta:**
```json
{
  "cliente_id": 123,
  "user_cliente_id": 456,
  "productos": [
    {
      "producto_id": 789,
      "cantidad": 2,
      "precio_unitario": 100.00,
      "descuento_unitario": 5.00
    }
  ],
  "descuento_total": 10.00,
  "requiere_factura": true,
  "metodo_pago": "efectivo",
  "observaciones": "Venta con descuento especial"
}
```

### 2.2 Ventas Ecommerce (Cliente)
**Base URL:** `/api/ventas`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| POST | `/ecommerce` | Crear venta desde ecommerce | Ver estructura abajo |
| GET | `/mis-ventas` | Mis ventas (cliente) | `page`, `estado` |

**Estructura para venta ecommerce:**
```json
{
  "productos": [
    {
      "producto_id": 789,
      "cantidad": 2
    }
  ],
  "requiere_factura": true,
  "metodo_pago": "tarjeta",
  "observaciones": "Envío a domicilio"
}
```

## 🧾 3. SISTEMA DE FACTURACIÓN MANUAL

### 3.1 Facturación Manual (Admin)
**Base URL:** `/api/facturas`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar facturas manuales | `tipo_comprobante`, `estado`, `cliente_id` |
| POST | `/` | Crear factura/boleta manual | Ver estructura abajo |
| GET | `/{id}` | Ver detalle de factura | - |
| POST | `/{id}/enviar-sunat` | Enviar a SUNAT | - |
| GET | `/{id}/pdf` | Descargar PDF | - |
| GET | `/{id}/xml` | Descargar XML | - |
| GET | `/estadisticas` | Estadísticas de facturas | - |

**Utilidades:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/buscar-productos` | Buscar productos para facturación |
| GET | `/clientes` | Listar clientes |
| GET | `/series` | Listar series disponibles |

**Estructura para crear factura manual:**
```json
{
  "cliente_id": 123,
  "tipo_comprobante": "01",
  "serie_id": 1,
  "fecha_emision": "2024-01-15",
  "productos": [
    {
      "producto_id": 789,
      "cantidad": 2,
      "precio_unitario": 100.00,
      "descuento": 5.00
    }
  ]
}
```

## 📄 4. SISTEMA DE COMPROBANTES ELECTRÓNICOS

### 4.1 Gestión de Comprobantes
**Base URL:** `/api/comprobantes`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar comprobantes | `tipo_comprobante`, `estado`, `cliente_id`, `fecha_inicio`, `fecha_fin`, `search` |
| GET | `/estadisticas` | Estadísticas de comprobantes | `fecha_inicio`, `fecha_fin` |
| GET | `/{id}` | Ver detalle de comprobante | - |
| POST | `/{id}/reenviar` | Reenviar a SUNAT | - |
| POST | `/{id}/consultar` | Consultar estado en SUNAT | - |
| GET | `/{id}/pdf` | Descargar PDF | - |
| GET | `/{id}/xml` | Descargar XML | - |

## 🏢 5. SISTEMA DE FACTURACIÓN ELECTRÓNICA AVANZADO

### 5.1 Certificados Digitales
**Base URL:** `/api/facturacion/certificados`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar certificados | - |
| POST | `/` | Subir certificado | `archivo`, `password`, `descripcion` |
| GET | `/{id}` | Ver detalle de certificado | - |
| PUT | `/{id}` | Actualizar certificado | - |
| DELETE | `/{id}` | Eliminar certificado | - |
| POST | `/{id}/activar` | Activar certificado | - |
| GET | `/{id}/validar` | Validar certificado | - |

### 5.2 Resúmenes de Comprobantes (RC)
**Base URL:** `/api/facturacion/resumenes`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar resúmenes | `estado`, `fecha_inicio`, `fecha_fin` |
| POST | `/` | Crear resumen | `fecha_resumen`, `comprobantes[]` |
| GET | `/{id}` | Ver detalle de resumen | - |
| POST | `/{id}/enviar` | Enviar resumen a SUNAT | - |
| GET | `/{id}/ticket` | Consultar ticket | - |
| GET | `/{id}/xml` | Descargar XML | - |
| GET | `/{id}/cdr` | Descargar CDR | - |

### 5.3 Bajas de Comprobantes (RA)
**Base URL:** `/api/facturacion/bajas`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar bajas | `estado`, `fecha_inicio`, `fecha_fin` |
| POST | `/` | Crear baja | `fecha_baja`, `comprobantes[]` |
| GET | `/{id}` | Ver detalle de baja | - |
| POST | `/{id}/enviar` | Enviar baja a SUNAT | - |
| GET | `/{id}/ticket` | Consultar ticket | - |
| GET | `/{id}/xml` | Descargar XML | - |
| GET | `/{id}/cdr` | Descargar CDR | - |

### 5.4 Auditoría y Reintentos
**Base URL:** `/api/facturacion/auditoria` y `/api/facturacion/reintentos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/auditoria/` | Listar auditoría de SUNAT |
| GET | `/auditoria/{id}` | Ver detalle de auditoría |
| GET | `/reintentos/` | Listar cola de reintentos |
| POST | `/reintentos/{id}/reintentar` | Reintentar operación |
| POST | `/reintentos/reintentar-todo` | Reintentar todas las operaciones |
| PUT | `/reintentos/{id}/cancelar` | Cancelar reintento |

### 5.5 Catálogos SUNAT
**Base URL:** `/api/facturacion/catalogos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar catálogos disponibles |
| GET | `/{catalogo}` | Ver items del catálogo |
| GET | `/{catalogo}/{codigo}` | Ver detalle de item |

### 5.6 Empresa Emisora
**Base URL:** `/api/facturacion/empresa`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Ver información de empresa |
| PUT | `/` | Actualizar información de empresa |

### 5.7 Archivos de Comprobantes
**Base URL:** `/api/facturacion/comprobantes`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/{id}/xml` | Descargar XML firmado |
| GET | `/{id}/cdr` | Descargar CDR |
| GET | `/{id}/qr` | Descargar código QR |

### 5.8 Estado del Sistema
**Base URL:** `/api/facturacion/status`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Estado del sistema de facturación |

## 🔧 6. CÓDIGOS DE ERROR SUNAT

**Base URL:** `/api/sunat-errores`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/` | Listar todos los códigos | `page`, `categoria` |
| GET | `/categorias` | Listar categorías | - |
| GET | `/estadisticas` | Estadísticas de errores | - |
| GET | `/buscar` | Buscar por texto | `q` |
| POST | `/parsear` | Parsear mensaje SUNAT | `mensaje` |
| GET | `/categoria/{categoria}` | Por categoría | - |
| GET | `/{codigo}` | Ver código específico | - |

## 🔗 7. WEBHOOKS PARA INTEGRACIÓN

**Base URL:** `/api/webhook`

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| POST | `/pago` | Webhook genérico de pago | `compra_id`, `monto`, `metodo_pago`, `referencia_pago` |
| POST | `/culqi` | Webhook específico de Culqi | Datos de Culqi |

## 📊 8. FLUJOS DE TRABAJO PRINCIPALES

### 8.1 Flujo de Venta Online → Facturación
```
1. Cliente agrega productos al carrito (POST /api/cart/add)
2. Cliente crea venta (POST /api/ventas/ecommerce)
3. Sistema procesa pago (Webhook)
4. Admin factura venta (POST /api/ventas/{id}/facturar)
5. Sistema genera comprobante electrónico
6. Cliente descarga comprobante (GET /api/comprobantes/{id}/pdf)
```

### 8.2 Flujo de Facturación Manual
```
1. Admin crea factura manual (POST /api/facturas)
2. Admin envía a SUNAT (POST /api/facturas/{id}/enviar-sunat)
3. Sistema consulta estado (POST /api/comprobantes/{id}/consultar)
4. Admin descarga archivos (GET /api/comprobantes/{id}/pdf)
```

### 8.3 Flujo de Resúmenes y Bajas
```
1. Admin crea resumen/baja (POST /api/facturacion/resumenes o /bajas)
2. Sistema envía a SUNAT (POST /api/facturacion/resumenes/{id}/enviar)
3. Sistema consulta ticket (GET /api/facturacion/resumenes/{id}/ticket)
4. Admin descarga CDR (GET /api/facturacion/resumenes/{id}/cdr)
```

## 🧪 9. CASOS DE PRUEBA RECOMENDADOS

### 9.1 Pruebas de Carrito
- [ ] Agregar productos al carrito
- [ ] Actualizar cantidades
- [ ] Sincronizar carrito con localStorage
- [ ] Vaciar carrito
- [ ] Validar stock disponible

### 9.2 Pruebas de Ventas
- [ ] Crear venta manual con cliente existente
- [ ] Crear venta manual con datos de cliente nuevos
- [ ] Crear venta desde ecommerce
- [ ] Facturar venta existente
- [ ] Anular venta
- [ ] Verificar cálculos de IGV y totales

### 9.3 Pruebas de Facturación
- [ ] Crear factura manual
- [ ] Crear boleta manual
- [ ] Enviar comprobante a SUNAT
- [ ] Consultar estado de comprobante
- [ ] Reenviar comprobante
- [ ] Descargar PDF y XML

### 9.4 Pruebas de Facturación Electrónica
- [ ] Subir certificado digital
- [ ] Validar certificado
- [ ] Crear resumen de comprobantes
- [ ] Crear baja de comprobantes
- [ ] Consultar catálogos SUNAT
- [ ] Verificar auditoría de operaciones

### 9.5 Pruebas de Integración
- [ ] Webhook de pago exitoso
- [ ] Webhook de pago fallido
- [ ] Flujo completo ecommerce → facturación
- [ ] Manejo de errores SUNAT
- [ ] Reintentos automáticos

## 🔐 10. AUTENTICACIÓN Y PERMISOS

### 10.1 Tipos de Usuario
- **Admin/Vendedor**: Acceso completo a todas las funcionalidades
- **Cliente Ecommerce**: Acceso limitado a sus propias ventas y compras
- **Público**: Solo productos y catálogos públicos

### 10.2 Permisos Requeridos
- `ventas.ver`, `ventas.create`, `ventas.edit` - Gestión de ventas
- `comprobantes.ver`, `comprobantes.create` - Gestión de comprobantes
- `facturacion.ver`, `facturacion.create` - Facturación electrónica
- `clientes.ver`, `clientes.create` - Gestión de clientes

## 📝 11. NOTAS IMPORTANTES

1. **Autenticación**: Todas las rutas requieren token JWT excepto las marcadas como públicas
2. **Validación**: Todos los endpoints validan datos de entrada
3. **Transacciones**: Operaciones críticas usan transacciones de base de datos
4. **Logs**: Todas las operaciones se registran para auditoría
5. **Rate Limiting**: Endpoints públicos tienen límites de velocidad
6. **CORS**: Configurado para permitir requests desde el frontend

## 🚀 12. PRÓXIMOS PASOS

1. Implementar pruebas automatizadas para todos los endpoints
2. Agregar documentación de códigos de error específicos
3. Crear dashboard de monitoreo en tiempo real
4. Implementar notificaciones push para cambios de estado
5. Agregar métricas de rendimiento y uso

---

**Última actualización:** Enero 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo de Desarrollo
