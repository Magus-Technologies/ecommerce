# Guía UI/UX Frontend - Módulos e Interfaces

## Principios de diseño
- Claridad primero: acciones principales visibles y consistentes
- Estados claros: cargando, éxito, error, vacío
- Feedback inmediato: toasts/inline errors; confirmaciones para acciones críticas
- Accesibilidad: contraste suficiente, foco visible, navegación con teclado
- Responsive: layouts fluidos para desktop/tablet/móvil

## Arquitectura de navegación
- Barra lateral con módulos principales
- Barra superior con búsqueda global, notificaciones y perfil
- Breadcrumbs por módulo para contexto

## Módulos y submódulos

### 1) Catálogo (público)
- Listado de productos
  - Filtros: categoría, búsqueda, precio
  - Cards con imagen, nombre, precio, CTA "Agregar"
- Detalle de producto
  - Galería, descripción, stock, botones de cantidad
- Endpoints
  - GET `/api/productos-publicos` | GET `/api/productos-publicos/{id}`

### 2) Carrito
- Drawer/ página carrito
  - Tabla de items: producto, precio, cantidad, subtotal, eliminar
  - Resumen: subtotal, IGV, total, CTA "Continuar"
- Persistencia localStorage + sync backend
- Endpoints
  - GET/POST/PUT/DELETE `/api/cart/*`

### 3) Ventas
- Listado de ventas (admin)
  - Tabla con filtros (estado, cliente, fecha)
  - Acciones por fila: ver, facturar, anular
- Crear venta manual (wizard)
  - Paso 1: cliente
  - Paso 2: productos (buscador + tabla de selección)
  - Paso 3: totales y confirmación
- Ventas ecommerce (cliente)
  - Historial de compras
- Endpoints
  - `/api/ventas` (listar/crear/detalle/facturar/anular)

### 4) Facturación
- Listado de comprobantes
  - Filtros: tipo, estado, fechas, búsqueda
  - Acciones: ver, reenviar, consultar estado, descargar PDF/XML
- Detalle de comprobante
  - Metadatos, items, totales, timeline de auditoría
- Acciones rápidas
  - Botón "Enviar a SUNAT" desde venta
- Endpoints
  - `/api/comprobantes/*`, `/api/facturas/*`

### 5) Facturación electrónica avanzada
- Certificados digitales
  - Subir .pfx/.pem, validar, activar
- Resúmenes diarios (RC)
  - Crear, enviar, consultar ticket, descargar CDR
- Bajas (RA)
  - Crear, enviar, consultar ticket, descargar CDR
- Catálogos SUNAT
  - Listado por catálogo, búsqueda
- Auditoría y reintentos
  - Lista de envíos SUNAT con filtros y reintento
- Estado del sistema
  - Widget con certificado activo, conexión SUNAT, cola pendientes
- Endpoints
  - `/api/facturacion/certificados|resumenes|bajas|catalogos|auditoria|reintentos|status`

### 6) Configuración de empresa
- Datos del emisor
  - RUC, razón social, dirección, SOL user/pass (enmascarado)
  - Logo (preview y tamaño sugerido)
- Endpoints
  - GET/PUT `/api/facturacion/empresa`

### 7) Recompensas (si aplica)
- Gestión principal
  - Reglas, niveles, puntos y canjes
- Segmentos de clientes
  - Criterios y vistas previas de audiencia
- Productos elegibles
  - Marcar categorías y productos
- Notificaciones
  - Plantillas y disparadores
- Endpoints
  - Según docs `docs/` (mapeo posterior si se expone API)

## Patrones de componentes
- Tabla estándar
  - Búsqueda, filtros, columnas configurables, paginación, exportar CSV
- Formularios
  - Validación inline, máscaras, tooltips de ayuda
- Empty states
  - Mensaje claro + CTA relevante
- Loaders y skeletons
  - Listas y tarjetas
- Modales de confirmación
  - Acciones destructivas (anular, eliminar)

## Estados y feedback
- Toasts para éxito/errores
- Badges de estado: PENDIENTE, ENVIADO, ACEPTADO, OBSERVADO, RECHAZADO
- Timeline de auditoría en detalle de comprobante

## Accesibilidad y responsive
- Tamaño mínimo de hit 44px, foco visible
- Breakpoints: móvil (≤640), tablet (641-1024), desktop (≥1025)

## Seguridad UX
- Enmascarar credenciales SOL
- Roles/Permisos: ocultar acciones no permitidas
- Confirmaciones dobles para acciones críticas

## Mapeo rápido UI ↔ Endpoints
- Comprobantes (listado): GET `/api/comprobantes?estado=&fecha_inicio=&fecha_fin=&search=`
- Comprobante (detalle): GET `/api/comprobantes/{id}`
- Reenviar: POST `/api/comprobantes/{id}/reenviar`
- Consultar: POST `/api/comprobantes/{id}/consultar`
- PDF/XML/QR: GET `/api/comprobantes/{id}/pdf|xml|qr`
- Ventas facturar: POST `/api/ventas/{id}/facturar`
- RC/RA: `/api/facturacion/resumenes|bajas`
- Certificados: `/api/facturacion/certificados`
- Estado: GET `/api/facturacion/status`

## Roadmap UI
- Dashboard inicial con KPIs (ventas, ACEPTADOS/OBSERVADOS, pendientes)
- Buscador global (cliente, comprobante, producto)
- Preferencias de usuario (columnas, tema, densidad)
