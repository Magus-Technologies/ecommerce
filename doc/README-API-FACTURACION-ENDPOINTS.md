## API de Facturación Electrónica - Endpoints

Base: `/api/facturacion`

### Certificados
- POST `/certificados`
  - body: { archivo_pfx, password, empresa_id }
  - 201 { message }
- GET `/certificados`
  - 200 { data: [] }
- GET `/certificados/{id}`
  - 200 { id }
- PUT `/certificados/{id}`
  - body: { ... }
  - 200 { message }
- DELETE `/certificados/{id}`
  - 200 { message }
- POST `/certificados/{id}/activar`
  - 200 { message }
- GET `/certificados/{id}/validar`
  - 200 { id, valido }

### Resúmenes Diarios (RC)
- POST `/resumenes`
  - body: { fecha_resumen, comprobantes: [] }
  - 201 { message }
- POST `/resumenes/{id}/enviar`
  - 200 { id, ticket }
- GET `/resumenes/{id}/ticket`
  - 200 { id, estado }
- GET `/resumenes`
  - 200 { data: [] }
- GET `/resumenes/{id}`
  - 200 { id }
- GET `/resumenes/{id}/xml`
  - 200 { id, xml }
- GET `/resumenes/{id}/cdr`
  - 200 { id, cdr }

### Bajas (RA)
- POST `/bajas`
  - body: { fecha_baja, comprobantes: [{ id, motivo }] }
  - 201 { message }
- POST `/bajas/{id}/enviar`
  - 200 { id, ticket }
- GET `/bajas/{id}/ticket`
  - 200 { id, estado }
- GET `/bajas`
  - 200 { data: [] }
- GET `/bajas/{id}`
  - 200 { id }
- GET `/bajas/{id}/xml`
  - 200 { id, xml }
- GET `/bajas/{id}/cdr`
  - 200 { id, cdr }

### Auditoría SUNAT
- GET `/auditoria`
  - query: { tipo_operacion?, exitoso?, desde?, hasta? }
  - 200 { data: [] }
- GET `/auditoria/{id}`
  - 200 { id }

### Cola de Reintentos
- GET `/reintentos`
  - query: { estado?, proximo_reintento_desde? }
  - 200 { data: [] }
- POST `/reintentos/{id}/reintentar`
  - 200 { id, status }
- POST `/reintentos/reintentar-todo`
  - 200 { status }
- PUT `/reintentos/{id}/cancelar`
  - 200 { id, status }

### Catálogos SUNAT
- GET `/catalogos`
  - 200 { data: [catalogos] }
- GET `/catalogos/{catalogo}`
  - 200 { catalogo, items }
- GET `/catalogos/{catalogo}/{codigo}`
  - 200 { catalogo, codigo }

### Empresa emisora
- GET `/empresa`
  - 200 { empresa }
- PUT `/empresa`
  - body: { ruc?, razon_social?, sol_usuario?, sol_clave?, sol_endpoint?, domicilio? }
  - 200 { message }

### Archivos de Comprobantes
- GET `/comprobantes/{id}/xml`
  - 200 { id, xml }
- GET `/comprobantes/{id}/cdr`
  - 200 { id, cdr }
- GET `/comprobantes/{id}/qr`
  - 200 { id, qr }

### Salud del Servicio
- GET `/status`
  - 200 { certificado_activo, sunat_conexion, cola_pendientes }

Notas:
- Los controladores actuales devuelven respuestas mínimas (stubs). Sustituir por lógica con BD y Greenter.
- Autenticación: grupo protegido por `auth:sanctum`. Ajustar permisos según políticas.

---

## Matriz consolidada de endpoints (resumen por módulo)

| Módulo | Método | Ruta completa | Auth |
|---|---|---|---|
| Ventas | GET | `/api/ventas` | JWT |
| Ventas | POST | `/api/ventas` | JWT |
| Ventas | GET | `/api/ventas/estadisticas` | JWT |
| Ventas | GET | `/api/ventas/mis-ventas` | JWT |
| Ventas | POST | `/api/ventas/ecommerce` | JWT |
| Ventas | GET | `/api/ventas/{id}` | JWT |
| Ventas | POST | `/api/ventas/{id}/facturar` | JWT |
| Ventas | PATCH | `/api/ventas/{id}/anular` | JWT |
| Ventas | GET | `/api/ventas/{id}/pdf` | JWT |
| Ventas utilidades | GET | `/api/utilidades/clientes/buscar` | JWT |
| Ventas utilidades | POST | `/api/utilidades/validar-ruc/{ruc}` | JWT |
| Ventas utilidades | GET | `/api/utilidades/buscar-empresa/{ruc}` | JWT |
| Comprobantes | GET | `/api/comprobantes` | JWT |
| Comprobantes | GET | `/api/comprobantes/estadisticas` | JWT |
| Comprobantes | GET | `/api/comprobantes/{id}` | JWT |
| Comprobantes | POST | `/api/comprobantes/{id}/reenviar` | JWT |
| Comprobantes | POST | `/api/comprobantes/{id}/consultar` | JWT |
| Comprobantes | GET | `/api/comprobantes/{id}/pdf` | JWT |
| Comprobantes | GET | `/api/comprobantes/{id}/xml` | JWT |
| Comprobantes | GET | `/api/comprobantes/{id}/cdr` | JWT |
| Comprobantes | POST | `/api/comprobantes/{id}/email` | JWT |
| Comprobantes | PATCH | `/api/comprobantes/{id}/anular` | JWT |
| Series | GET | `/api/series` | JWT |
| Series | POST | `/api/series` | JWT |
| Series | PATCH | `/api/series/{id}` | JWT |
| Series | POST | `/api/series/reservar-correlativo` | JWT |
| Series | GET | `/api/series/estadisticas` | JWT |
| Facturas manuales | GET | `/api/facturas` | JWT |
| Facturas manuales | POST | `/api/facturas` | JWT |
| Facturas manuales | GET | `/api/facturas/{id}` | JWT |
| Facturas manuales | POST | `/api/facturas/{id}/enviar-sunat` | JWT |
| Facturas manuales | GET | `/api/facturas/{id}/pdf` | JWT |
| Facturas manuales | GET | `/api/facturas/{id}/xml` | JWT |
| Facturas manuales util. | GET | `/api/facturas/buscar-productos` | JWT |
| Facturas manuales util. | GET | `/api/facturas/clientes` | JWT |
| Facturas manuales util. | GET | `/api/facturas/series` | JWT |
| Facturas manuales util. | GET | `/api/facturas/estadisticas` | JWT |
| Facturación avanzada | POST | `/api/facturacion/certificados` | JWT |
| Facturación avanzada | GET | `/api/facturacion/certificados` | JWT |
| Facturación avanzada | GET | `/api/facturacion/certificados/{id}` | JWT |
| Facturación avanzada | PUT | `/api/facturacion/certificados/{id}` | JWT |
| Facturación avanzada | DELETE | `/api/facturacion/certificados/{id}` | JWT |
| Facturación avanzada | POST | `/api/facturacion/certificados/{id}/activar` | JWT |
| Facturación avanzada | GET | `/api/facturacion/certificados/{id}/validar` | JWT |
| RC | POST | `/api/facturacion/resumenes` | JWT |
| RC | POST | `/api/facturacion/resumenes/{id}/enviar` | JWT |
| RC | GET | `/api/facturacion/resumenes/{id}/ticket` | JWT |
| RC | GET | `/api/facturacion/resumenes` | JWT |
| RC | GET | `/api/facturacion/resumenes/{id}` | JWT |
| RC | GET | `/api/facturacion/resumenes/{id}/xml` | JWT |
| RC | GET | `/api/facturacion/resumenes/{id}/cdr` | JWT |
| RA | POST | `/api/facturacion/bajas` | JWT |
| RA | POST | `/api/facturacion/bajas/{id}/enviar` | JWT |
| RA | GET | `/api/facturacion/bajas/{id}/ticket` | JWT |
| RA | GET | `/api/facturacion/bajas` | JWT |
| RA | GET | `/api/facturacion/bajas/{id}` | JWT |
| RA | GET | `/api/facturacion/bajas/{id}/xml` | JWT |
| RA | GET | `/api/facturacion/bajas/{id}/cdr` | JWT |
| Catálogos | GET | `/api/facturacion/catalogos` | JWT |
| Catálogos | GET | `/api/facturacion/catalogos/{catalogo}` | JWT |
| Catálogos | GET | `/api/facturacion/catalogos/{catalogo}/{codigo}` | JWT |
| Auditoría | GET | `/api/facturacion/auditoria` | JWT |
| Auditoría | GET | `/api/facturacion/auditoria/{id}` | JWT |
| Reintentos | GET | `/api/facturacion/reintentos` | JWT |
| Reintentos | POST | `/api/facturacion/reintentos/{id}/reintentar` | JWT |
| Reintentos | POST | `/api/facturacion/reintentos/reintentar-todo` | JWT |
| Reintentos | PUT | `/api/facturacion/reintentos/{id}/cancelar` | JWT |
| Empresa | GET | `/api/facturacion/empresa` | JWT |
| Empresa | PUT | `/api/facturacion/empresa` | JWT |
| Status | GET | `/api/facturacion/status` | JWT |
| Webhook | POST | `/api/webhook/pago` | Pública |
| Webhook | POST | `/api/webhook/culqi` | Pública |
| Errores SUNAT | GET | `/api/sunat-errores` | JWT |
| Errores SUNAT | GET | `/api/sunat-errores/categorias` | JWT |
| Errores SUNAT | GET | `/api/sunat-errores/estadisticas` | JWT |
| Errores SUNAT | GET | `/api/sunat-errores/buscar` | JWT |
| Errores SUNAT | POST | `/api/sunat-errores/parsear` | JWT |
| Errores SUNAT | GET | `/api/sunat-errores/categoria/{categoria}` | JWT |
| Errores SUNAT | GET | `/api/sunat-errores/{codigo}` | JWT |
| Catálogo público | GET | `/api/productos-publicos` | Pública |
| Catálogo público | GET | `/api/productos-publicos/{id}` | Pública |
| Catálogo público | GET | `/api/productos/buscar` | Pública |
| Catálogo público | GET | `/api/categorias/publicas` | Pública |
| Catálogo público | GET | `/api/banners/publicos` | Pública |
| Catálogo público | GET | `/api/banners-promocionales/publicos` | Pública |
| Catálogo público | GET | `/api/marcas/publicas` | Pública |
| Catálogo público | GET | `/api/marcas/por-categoria` | Pública |
| Ofertas | GET | `/api/ofertas/publicas` | Pública |
| Ofertas | GET | `/api/ofertas/flash-sales` | Pública |
| Ofertas | GET | `/api/ofertas/productos` | Pública |
| Ofertas | GET | `/api/ofertas/principal-del-dia` | Pública |
| Arma tu PC | GET | `/api/arma-pc/categorias` | Pública |
| Compatibilidad | GET | `/api/categorias/{id}/compatibles` | Pública |
| Reclamos | POST | `/api/reclamos/crear` | Pública |
| Reclamos | GET | `/api/reclamos/buscar/{numeroReclamo}` | Pública |
| Empresa pública | GET | `/api/empresa-info/publica` | Pública |

Notas:
- Donde aplique, todas las rutas protegidas requieren `Authorization: Bearer <JWT>`.
- Para más detalles de payloads y respuestas, ver `doc/GUIA-APIS-VENTAS-FACTURACION.md` y `doc/README-Frontend-Pruebas.md`.
