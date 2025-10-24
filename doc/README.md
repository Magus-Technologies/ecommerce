# 📚 Documentación de APIs - Sistema E-commerce

## 📋 Índice de Documentación

Esta carpeta contiene la documentación completa de todas las APIs y endpoints del sistema.

### 📄 Documentos Disponibles

1. **[API-COMPLETA.md](./API-COMPLETA.md)** - Documentación completa de todos los endpoints
2. **[FACTURACION-API.md](./FACTURACION-API.md)** - API de Facturación Electrónica SUNAT
3. **[ALMACEN-API.md](./ALMACEN-API.md)** - API de Gestión de Almacén y Productos
4. **[VENTAS-API.md](./VENTAS-API.md)** - API de Ventas y POS
5. **[NOTIFICACIONES-API.md](./NOTIFICACIONES-API.md)** - API de Notificaciones (Email, WhatsApp, SMS)
6. **[EMPRESA-API.md](./EMPRESA-API.md)** - API de Información de Empresa
7. **[CLIENTES-API.md](./CLIENTES-API.md)** - API de Gestión de Clientes
8. **[COMPROBANTES-API.md](./COMPROBANTES-API.md)** - API de Comprobantes Electrónicos
9. **[UTILIDADES-API.md](./UTILIDADES-API.md)** - APIs de Utilidades (Validación RUC, etc.)
10. **[AUTENTICACION-API.md](./AUTENTICACION-API.md)** - API de Autenticación y Seguridad

---

## 🌐 Información General

### Base URL
```
Desarrollo:  http://localhost:8000/api
Producción:  https://api.tudominio.com/api
```

### Autenticación
Todos los endpoints requieren autenticación mediante token Bearer (excepto endpoints públicos):
```
Authorization: Bearer {token}
```

### Formato de Respuesta
Todas las respuestas están en formato JSON:

**Éxito:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "errors": {...}
}
```

---

## 🚀 Inicio Rápido

### 1. Autenticación
```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "user": {...}
}
```

### 2. Usar el Token
```bash
GET /api/productos
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📊 Endpoints Principales por Módulo

### 🧾 Facturación
- `POST /api/ventas` - Crear venta y generar comprobante
- `POST /api/comprobantes/{id}/reenviar` - Reenviar a SUNAT
- `GET /api/ventas/{id}/pdf` - Descargar PDF

### 📦 Almacén
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/categorias` - Listar categorías

### 👥 Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/buscar-por-documento` - Buscar por documento

### 📧 Notificaciones
- `POST /api/notificaciones/enviar` - Enviar notificación
- `POST /api/comprobantes/{id}/enviar-email` - Enviar comprobante por email

---

## 🛠 Herramientas de Desarrollo

### Testing con Postman
Importa la colección de Postman desde:
```
docs/postman/E-commerce-API.postman_collection.json
```

### Testing con cURL
Ejemplos de pruebas con cURL en cada documentación específica.

### Logs y Debug
Los logs del sistema se encuentran en:
```
storage/logs/laravel.log
```

---

## 📖 Convenciones

### Códigos de Estado HTTP
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

### Parámetros de Paginación
```
?page=1
?per_page=15
```

### Parámetros de Filtrado
```
?estado=activo
?fecha_inicio=2025-01-01
?fecha_fin=2025-12-31
?search=termino
```

### Parámetros de Ordenamiento
```
?sort_by=created_at
?sort_order=desc
```

---

## 🔐 Seguridad

### Rate Limiting
- **API Pública:** 60 requests/minuto
- **API Autenticada:** 120 requests/minuto

### CORS
Configurado en `config/cors.php`

### Validación de Datos
Todos los endpoints validan datos de entrada usando Form Requests de Laravel.

---

## 🐛 Manejo de Errores

### Errores de Validación (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["El campo email es obligatorio."],
    "password": ["La contraseña debe tener al menos 8 caracteres."]
  }
}
```

### Errores SUNAT
```json
{
  "success": false,
  "error": "Error SUNAT: 3127",
  "codigo_error": "3127",
  "descripcion": "El código de detracción es requerido",
  "solucion": "Agregar el código de detracción según catálogo SUNAT"
}
```

---

## 📞 Soporte

Para dudas o problemas:
- **Email:** soporte@tudominio.com
- **GitHub Issues:** https://github.com/tu-repo/issues
- **Documentación SUNAT:** https://cpe.sunat.gob.pe/

---

## 🔄 Changelog

### Versión 2.0.0 (2025-10-23)
- ✅ Integración completa con SUNAT (Facturación Electrónica)
- ✅ Sistema de firma digital con certificados
- ✅ Generación de XML firmado según estándar UBL 2.1
- ✅ Generación de PDF con código QR
- ✅ Sistema de notificaciones (Email, WhatsApp, SMS)
- ✅ API de validación de RUC con SUNAT
- ✅ Sistema de reintentos automáticos
- ✅ Auditoría completa de operaciones

### Versión 1.0.0
- ✅ API de Productos y Categorías
- ✅ API de Ventas básica
- ✅ API de Clientes
- ✅ Sistema de autenticación

---

**Última actualización:** 2025-10-23
**Versión de la API:** 2.0.0
**Laravel:** 10.x
**PHP:** 8.2+
