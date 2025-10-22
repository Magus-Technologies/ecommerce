# Índice General de Documentación - APIs Backend Ecommerce

## 📚 Índice de Contenido

### 📄 Documentación Actualizada (2025-01-20)

1. [API de Exportaciones TXT](#api-de-exportaciones-txt)
2. [API de Guías de Remisión](#api-de-guías-de-remisión)
3. [API de Contingencia](#api-de-contingencia)
4. [API de Validación de Documentos](#api-de-validación-de-documentos)
5. [Documentación Existente](#documentación-existente)

---

## API de Exportaciones TXT

**Archivo:** `API-EXPORTACIONES-TXT.md`

### Contenido
- ✅ PLE SUNAT - Registro de Ventas (Formato 14.1)
- ✅ PLE SUNAT - Registro de Compras (Formato 8.1)
- ✅ Reportes de Ventas en TXT
- ✅ Kardex en TXT

### Endpoints
```
POST /api/contabilidad/exportar/ple/registro-ventas
POST /api/contabilidad/exportar/ple/registro-compras
GET  /api/contabilidad/exportar/ventas/txt
GET  /api/contabilidad/exportar/kardex/{productoId}/txt
```

### Características
- Cumple normativa SUNAT
- Nomenclatura oficial de archivos
- 41 campos formato 14.1
- Validaciones completas

---

## API de Guías de Remisión

**Archivo:** `API-GUIAS-REMISION-COMPLETA.md`

### Contenido
- ✅ Crear guía de remisión (Tipo 09)
- ✅ Listar con filtros
- ✅ Enviar a SUNAT
- ✅ Descargar XML firmado
- ✅ Estadísticas

### Endpoints
```
GET  /api/guias-remision
POST /api/guias-remision
GET  /api/guias-remision/{id}
POST /api/guias-remision/{id}/enviar-sunat
GET  /api/guias-remision/{id}/xml
GET  /api/guias-remision/estadisticas/resumen
```

### Características
- XML UBL 2.1 completo
- Firma digital
- Múltiples modalidades de traslado
- Control de estados

---

## API de Contingencia

**Archivo:** `API-CONTINGENCIA.md`

### Contenido
- ✅ Activar/Desactivar modo contingencia
- ✅ Emisión offline
- ✅ Regularización automática
- ✅ Verificación de disponibilidad SUNAT

### Endpoints
```
GET  /api/facturacion/contingencia/info
POST /api/facturacion/contingencia/activar
POST /api/facturacion/contingencia/desactivar
POST /api/facturacion/contingencia/regularizar
GET  /api/facturacion/contingencia/estadisticas
POST /api/facturacion/contingencia/verificar
```

### Características
- Emisión sin conexión a SUNAT
- Cache de 7 días
- Regularización en lotes
- Verificación automática

---

## API de Validación de Documentos

**Archivo:** `API-VALIDACION-DOCUMENTOS.md`

### Contenido
- ✅ Validar RUC en SUNAT
- ✅ Validar DNI en RENIEC
- ✅ Auto-detección de tipo
- ✅ Validación en lote

### Endpoints
```
POST /api/validar-ruc
POST /api/validar-dni
POST /api/validar-documento
POST /api/validar-documentos-lote
```

### Características
- Múltiples proveedores (apis.net.pe, apisperu.com)
- Cache optimizado (24h RUC, 7d DNI)
- Fallback automático

---

## Documentación Existente

### Facturación Electrónica

| Archivo | Descripción |
|---------|-------------|
| `API_FACTURACION_ELECTRONICA.md` | API principal de facturación |
| `README-API-FACTURACION-ENDPOINTS.md` | Endpoints detallados |
| `GUIA-APIS-VENTAS-FACTURACION.md` | Integración ventas-facturación |
| `README-facturacion-electronica.md` | Guía general |
| `guia-uso-facturacion.md` | Guía de uso |

### Guías de Remisión (Anterior)

| Archivo | Descripción |
|---------|-------------|
| `README-GUIAS-REMISION.md` | Documentación inicial |
| `API-GUIAS-REMISION-ENDPOINTS.md` | Endpoints anteriores |
| `COMANDOS-ARTISAN-GUIAS.md` | Comandos CLI |
| `INTEGRACION-FRONTEND-GUIAS.md` | Integración frontend |
| `ESTRUCTURA-BASE-DATOS-GUIAS.md` | Schema de BD |

### Contabilidad

| Archivo | Descripción |
|---------|-------------|
| `MODULOS-CONTABILIDAD.md` | Módulos contables |
| `MODULOS-CONTABILIDAD-README.md` | Guía general |
| `MODULO-UTILIDADES.md` | Utilidades y rentabilidad |
| `UTILIDADES-README.md` | Guía de utilidades |
| `EXPORTACIONES-Y-VOUCHERS.md` | Exportaciones |
| `EJEMPLOS-USO-CONTABILIDAD.md` | Ejemplos prácticos |
| `PERMISOS-CONTABILIDAD.md` | Sistema de permisos |
| `RESUMEN-RUTAS-Y-PERMISOS.md` | Rutas completas |

### Base de Datos

| Archivo | Descripción |
|---------|-------------|
| `ESQUEMAS_BASE_DATOS.md` | Schemas completos |
| `ESTRUCTURA-BASE-DATOS-GUIAS.md` | Guías de remisión |

### Implementación

| Archivo | Descripción |
|---------|-------------|
| `EJEMPLOS_IMPLEMENTACION.md` | Ejemplos de código |
| `FLUJOS_DE_TRABAJO.md` | Flujos de negocio |
| `CONFIGURACION_VARIABLES.md` | Variables de entorno |

### Pruebas y Producción

| Archivo | Descripción |
|---------|-------------|
| `PRUEBAS_FACTURACION_BETA.md` | Pruebas en beta |
| `ANALISIS-SUNAT-BETA-PRODUCCION.md` | Análisis de ambientes |
| `GUIA-MIGRACION-PRODUCCION.md` | Migración a producción |
| `CHECKLIST-SUNAT.md` | Checklist pre-producción |
| `ESTADO-SUNAT-VISUAL.md` | Estados visuales |

### Troubleshooting

| Archivo | Descripción |
|---------|-------------|
| `troubleshooting-facturacion.md` | Solución de problemas |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `README-Frontend-Pruebas.md` | Pruebas frontend |
| `README-Frontend-UIUX.md` | Guía UI/UX |
| `INTEGRACION-FRONTEND-GUIAS.md` | Integración guías |
| `NOTIFICACIONES-Y-DESCARGAS.md` | Sistema de notificaciones |

### Resúmenes

| Archivo | Descripción |
|---------|-------------|
| `RESUMEN-IMPLEMENTACION.md` | Resumen general |
| `RESUMEN-FINAL-COMPLETO.md` | Estado completo |
| `RESUMEN-FINAL-ACTUALIZADO.md` | Actualización |
| `RESUMEN-COMPLETO-FINAL.md` | Versión final |
| `INTEGRACION-COMPLETADA.md` | Integraciones |
| `RESUMEN-ESTADO-SUNAT.md` | Estado SUNAT |

### Integraciones

| Archivo | Descripción |
|---------|-------------|
| `ANALISIS-VENTAS-MANUALES.md` | Análisis ventas |
| `INTEGRACION-VENTAS-CONTABILIDAD.md` | Integración completa |

---

## Estructura de Navegación Recomendada

### 1. Nuevo en el Proyecto
```
README.md
  ↓
GUIA-APIS-VENTAS-FACTURACION.md
  ↓
API_FACTURACION_ELECTRONICA.md
```

### 2. Implementar Facturación
```
README-facturacion-electronica.md
  ↓
API-FACTURACION-ELECTRONICA.md
  ↓
guia-uso-facturacion.md
  ↓
EJEMPLOS_IMPLEMENTACION.md
```

### 3. Implementar Guías de Remisión
```
API-GUIAS-REMISION-COMPLETA.md (NUEVO)
  ↓
ESTRUCTURA-BASE-DATOS-GUIAS.md
  ↓
INTEGRACION-FRONTEND-GUIAS.md
```

### 4. Exportaciones y Reportes
```
API-EXPORTACIONES-TXT.md (NUEVO)
  ↓
EXPORTACIONES-Y-VOUCHERS.md
  ↓
MODULO-UTILIDADES.md
```

### 5. Sistema de Contingencia
```
API-CONTINGENCIA.md (NUEVO)
  ↓
troubleshooting-facturacion.md
```

### 6. Pasar a Producción
```
CHECKLIST-SUNAT.md
  ↓
GUIA-MIGRACION-PRODUCCION.md
  ↓
ANALISIS-SUNAT-BETA-PRODUCCION.md
```

---

## Endpoints por Módulo

### Facturación
- `/api/ventas/*` - Ventas
- `/api/comprobantes/*` - Comprobantes
- `/api/facturacion/*` - Facturación electrónica
- `/api/series/*` - Series de comprobantes
- `/api/notas-credito/*` - Notas de crédito
- `/api/notas-debito/*` - Notas de débito

### Guías de Remisión
- `/api/guias-remision/*` - Guías completas

### Contingencia
- `/api/facturacion/contingencia/*` - Sistema offline

### Validación
- `/api/validar-ruc` - RUC
- `/api/validar-dni` - DNI
- `/api/validar-documento` - Auto-detect

### Contabilidad
- `/api/contabilidad/cajas/*` - Cajas
- `/api/contabilidad/kardex/*` - Kardex
- `/api/contabilidad/cuentas-por-cobrar/*` - CxC
- `/api/contabilidad/cuentas-por-pagar/*` - CxP
- `/api/contabilidad/exportar/*` - Exportaciones

### Reportes
- `/api/reportes/*` - Reportes de facturación
- `/api/contabilidad/reportes/*` - Reportes contables

---

## Versiones de Documentación

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| 1.0.0 | 2025-01-20 | Documentación inicial completa |
| 1.1.0 | 2025-01-20 | Agregados: Exportaciones TXT, Contingencia, Validación |

---

## Notas Importantes

### Autenticación
Todos los endpoints requieren autenticación Bearer Token (Sanctum):
```http
Authorization: Bearer {token}
```

### Permisos
Cada módulo tiene permisos específicos:
- `facturacion.*`
- `contabilidad.*`
- `guias-remision.*`

### Ambientes
- **Beta**: `https://e-beta.sunat.gob.pe`
- **Producción**: `https://e-factura.sunat.gob.pe`

---

## Soporte

### Contacto
- Email: soporte@ejemplo.com
- Slack: #backend-api

### Links Útiles
- SUNAT: https://www.sunat.gob.pe
- Greenter: https://greenter.dev
- Laravel: https://laravel.com/docs

---

**Mantenido por:** Equipo de Desarrollo Backend
**Última actualización:** 2025-01-20
**Próxima revisión:** 2025-02-20
