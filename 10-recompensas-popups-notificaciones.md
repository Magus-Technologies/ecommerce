# 🎉 Sistema de Popups y Notificaciones de Recompensas

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Flujo del Sistema](#flujo-del-sistema)
- [APIs y Endpoints Completos](#apis-y-endpoints-completos)
- [Lógica y Flujo de Trabajo](#lógica-y-flujo-de-trabajo)
- [Permisos Necesarios](#permisos-necesarios)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

El sistema de popups y notificaciones permite crear experiencias visuales atractivas para mostrar recompensas a los clientes de forma automática e intuitiva. Los popups se muestran dinámicamente según el segmento del cliente y redirigen automáticamente a la recompensa correspondiente.

### Características Principales:
- ✅ **Creación de popups por recompensa** con contenido personalizado
- ✅ **Detección automática** de recompensas aplicables al cliente
- ✅ **URLs automáticas** que redirigen a la recompensa específica
- ✅ **Auto-cierre configurable** con temporizador
- ✅ **Tracking completo** de visualizaciones y cierres
- ✅ **Estadísticas detalladas** de interacciones
- ✅ **Notificaciones segmentadas** por tipo de cliente
- ✅ **Gestión completa de imágenes** con almacenamiento optimizado
- ✅ **Estados de popup independientes** de la recompensa

---

## 📋 APIs y Endpoints Completos

### 🎯 **ENDPOINTS ADMINISTRATIVOS DE POPUPS**

#### **1. LISTAR POPUPS DE UNA RECOMPENSA**
```
GET /api/admin/recompensas/{recompensaId}/popups
```
- **Función:** `index`
- **Permiso:** `recompensas.popups`
- **Descripción:** Lista todos los popups de una recompensa específica
- **Headers:** `Authorization: Bearer {token}`, `Accept: application/json`

#### **2. CREAR POPUP**
```
POST /api/admin/recompensas/{recompensaId}/popups
```
- **Función:** `store`
- **Permiso:** `recompensas.popups`
- **Content-Type:** `multipart/form-data`
- **Descripción:** Crea un nuevo popup para una recompensa

**Campos requeridos:**
- `titulo` (string, max:255) - **OBLIGATORIO**

**Campos opcionales:**
- `descripcion` (string)
- `imagen_popup` (file: jpeg,png,jpg,gif,webp, max:2MB)
- `texto_boton` (string, max:100, default: "Ver más")
- `url_destino` (string, max:500, default: "/recompensas/{recompensaId}")
- `mostrar_cerrar` (boolean, default: true)
- `auto_cerrar_segundos` (numeric, min:1, max:300)
- `popup_activo` (boolean, default: false)

#### **3. VER DETALLE DE POPUP**
```
GET /api/admin/recompensas/{recompensaId}/popups/{popupId}
```
- **Función:** `show`
- **Permiso:** `recompensas.popups`
- **Descripción:** Muestra el detalle completo de un popup específico

#### **4. ACTUALIZAR POPUP**
```
PUT /api/admin/recompensas/{recompensaId}/popups/{popupId}
```
- **Función:** `update`
- **Permiso:** `recompensas.popups`
- **Content-Type:** `multipart/form-data`
- **Descripción:** Actualiza un popup existente

#### **5. ELIMINAR POPUP**
```
DELETE /api/admin/recompensas/{recompensaId}/popups/{popupId}
```
- **Función:** `destroy`
- **Permiso:** `recompensas.popups`
- **Descripción:** Elimina un popup

#### **6. ACTIVAR/DESACTIVAR POPUP**
```
PATCH /api/admin/recompensas/{recompensaId}/popups/{popupId}/toggle
```
- **Función:** `toggleActivo`
- **Permiso:** `recompensas.popups`
- **Descripción:** Activa o desactiva un popup

#### **7. ESTADÍSTICAS DE POPUPS**
```
GET /api/admin/recompensas/{recompensaId}/popups/estadisticas-popups
```
- **Función:** `estadisticas`
- **Permiso:** `recompensas.popups`
- **Descripción:** Obtiene estadísticas de popups de una recompensa

### 👤 **ENDPOINTS PARA CLIENTES - POPUPS**

#### **8. VER POPUPS ACTIVOS**
```
GET /api/cliente/recompensas/popups-activos
```
- **Función:** `popupsActivos`
- **Autenticación:** Bearer {jwt_token}
- **Descripción:** Muestra popups activos para el cliente autenticado

#### **9. MARCAR POPUP COMO VISTO**
```
PATCH /api/cliente/recompensas/popups/{popupId}/marcar-visto
```
- **Función:** `marcarVisto`
- **Autenticación:** Bearer {jwt_token}
- **Descripción:** Marca un popup como visto por el cliente

#### **10. CERRAR POPUP**
```
PATCH /api/cliente/recompensas/popups/{popupId}/cerrar
```
- **Función:** `cerrarPopup`
- **Autenticación:** Bearer {jwt_token}
- **Descripción:** Cierra un popup

### 🔧 **ENDPOINTS ADMINISTRATIVOS DE NOTIFICACIONES**

#### **11. ENVIAR NOTIFICACIÓN**
```
POST /api/admin/recompensas/{recompensaId}/notificaciones/enviar
```
- **Función:** `enviarNotificacion`
- **Permiso:** `recompensas.notificaciones`
- **Descripción:** Envía notificaciones de popups a clientes específicos

**Body:**
```json
{
  "cliente_ids": [1, 2, 3, 4, 5]
}
```

#### **12. ESTADÍSTICAS DE NOTIFICACIONES**
```
GET /api/admin/recompensas/{recompensaId}/notificaciones/estadisticas
```
- **Función:** `estadisticasNotificaciones`
- **Permiso:** `recompensas.notificaciones`
- **Descripción:** Obtiene estadísticas de notificaciones enviadas

---

## 🔄 Lógica y Flujo de Trabajo

### 🎯 **FLUJO PRINCIPAL DE GESTIÓN DE POPUPS**

#### **1. CREACIÓN DE POPUPS (Admin)**

**Paso 1: Acceso a la gestión**
- El administrador accede a `/admin/recompensas/1/popups`
- El frontend hace petición `GET /api/admin/recompensas/1/popups`
- El backend verifica permisos `recompensas.popups`
- Si no hay popups, muestra "No hay popups"

**Paso 2: Crear nuevo popup**
- Admin hace clic en "Crear Popup"
- Se abre formulario con campos:
  - `titulo` (obligatorio)
  - `descripcion` (opcional)
  - `imagen_popup` (archivo, opcional)
  - `texto_boton` (opcional, default: "Ver más")
  - `url_destino` (opcional, default: "/recompensas/{id}")
  - `mostrar_cerrar` (boolean, default: true)
  - `auto_cerrar_segundos` (opcional, 1-300)
  - `popup_activo` (boolean, default: false)

**Paso 3: Envío del formulario**
- Frontend envía `POST /api/admin/recompensas/1/popups`
- Content-Type: `multipart/form-data`
- Backend valida campos requeridos
- Si hay imagen, se guarda en `public/storage/popups/`
- Se crea registro en tabla `recompensas_popups`
- Se devuelve respuesta con datos del popup creado

**Paso 4: Actualización de la lista**
- Frontend refresca la lista con `GET /api/admin/recompensas/1/popups`
- Se muestra el nuevo popup en la lista

#### **2. ACTIVACIÓN DE POPUPS**

**Paso 1: Activar popup**
- Admin hace clic en el botón de activar/desactivar
- Frontend envía `PATCH /api/admin/recompensas/1/popups/1/toggle`
- Backend cambia el estado `popup_activo`
- Se devuelve nuevo estado

**Paso 2: Verificación de estado**
- El popup solo se muestra a clientes si:
  - `popup_activo = true`
  - La recompensa está activa
  - La recompensa está vigente (fecha_inicio <= hoy <= fecha_fin)

#### **3. VISUALIZACIÓN POR CLIENTES**

**Paso 1: Cliente accede al sitio**
- Cliente autenticado hace petición `GET /api/cliente/recompensas/popups-activos`
- Backend verifica:
  - Cliente autenticado
  - Recompensas que aplican al cliente
  - Popups activos de esas recompensas

**Paso 2: Filtrado de popups**
- Se obtienen recompensas aplicables al cliente
- Se filtran popups activos
- Se devuelven solo popups que el cliente puede ver

**Paso 3: Interacción del cliente**
- Cliente ve el popup
- Puede marcar como visto: `PATCH /api/cliente/recompensas/popups/1/marcar-visto`
- Puede cerrar: `PATCH /api/cliente/recompensas/popups/1/cerrar`
- Si tiene auto-cierre, se cierra automáticamente

#### **4. GESTIÓN DE NOTIFICACIONES**

**Paso 1: Envío de notificaciones**
- Admin selecciona clientes para notificar
- Envía `POST /api/admin/recompensas/1/notificaciones/enviar`
- Body: `{"cliente_ids": [1, 2, 3]}`
- Se crean registros en `recompensas_notificaciones_clientes`

**Paso 2: Seguimiento de notificaciones**
- Se registra fecha de envío
- Se puede marcar como vista
- Se puede marcar como cerrada
- Se generan estadísticas

### 🔄 **FLUJO DE ESTADOS DE UN POPUP**

#### **Estados del Popup:**
1. **Creado** → `popup_activo = false`
2. **Activado** → `popup_activo = true`
3. **Desactivado** → `popup_activo = false`
4. **Eliminado** → Soft delete

#### **Estados de Notificación:**
1. **Enviada** → Cliente recibe notificación
2. **Vista** → Cliente abre el popup
3. **Cerrada** → Cliente cierra el popup
4. **Expirada** → Popup expira por tiempo

### 📊 **LÓGICA DE NEGOCIO**

#### **Validaciones:**
- **Título obligatorio** (máximo 255 caracteres)
- **Imagen opcional** (jpeg, png, jpg, gif, webp, máximo 2MB)
- **Auto-cierre opcional** (1-300 segundos)
- **URL destino** (máximo 500 caracteres)
- **Texto botón** (máximo 100 caracteres)

#### **Reglas de Aplicación:**
- Popup solo se muestra si la recompensa está activa
- Popup solo se muestra si la recompensa está vigente
- Popup solo se muestra si está activo
- Cliente debe estar en el segmento de la recompensa

#### **Gestión de Imágenes:**
- Se almacenan en `public/storage/popups/`
- Nombre único: `timestamp_uniqid.extension`
- URL generada automáticamente
- Se elimina imagen anterior al actualizar

### 🎯 **FLUJO DE DATOS**

#### **Creación:**
1. Frontend → Formulario
2. Frontend → POST /api/admin/recompensas/1/popups
3. Backend → Validación
4. Backend → Guardar en BD
5. Backend → Respuesta JSON
6. Frontend → Actualizar lista

#### **Visualización:**
1. Cliente → GET /api/cliente/recompensas/popups-activos
2. Backend → Filtrar recompensas aplicables
3. Backend → Filtrar popups activos
4. Backend → Respuesta JSON
5. Frontend → Mostrar popups

#### **Interacción:**
1. Cliente → Ver popup
2. Cliente → PATCH /api/cliente/recompensas/popups/1/marcar-visto
3. Backend → Actualizar estado
4. Cliente → PATCH /api/cliente/recompensas/popups/1/cerrar
5. Backend → Marcar como cerrada

### 📝 **CONSIDERACIONES TÉCNICAS**

#### **Seguridad:**
- Autenticación requerida para todos los endpoints
- Permisos específicos para administradores
- Validación de entrada en todos los campos
- Sanitización de archivos subidos

#### **Rendimiento:**
- Consultas optimizadas con `with()`
- Imágenes servidas desde storage público
- Caché de URLs de imágenes
- Paginación para listas grandes

#### **Mantenimiento:**
- Logs de todas las acciones
- Estadísticas de uso
- Limpieza de imágenes huérfanas
- Backup de configuraciones

---

## 🔄 Flujo del Sistema

### 1️⃣ Configuración del Popup (Admin)
```
1. Admin crea una recompensa
2. Admin configura un popup para esa recompensa
   - Título atractivo
   - Descripción clara
   - Imagen llamativa
   - Texto del botón personalizado
   - URL automática: /recompensas/{id}
   - Auto-cierre opcional
3. Admin activa el popup
```

### 2️⃣ Visualización del Popup (Cliente)
```
1. Cliente inicia sesión
2. Sistema detecta recompensas aplicables al cliente
3. Sistema filtra popups activos de esas recompensas
4. Frontend muestra popups automáticamente
5. Cliente hace click en el botón
6. Sistema redirige a /recompensas/{id}
7. Sistema registra la interacción
```

### 3️⃣ Tracking de Interacciones
```
- Estado: enviada → Cliente recibe el popup
- Estado: vista → Cliente visualiza el popup
- Estado: cerrada → Cliente cierra el popup
- Estado: expirada → Popup ya no es válido
```

---

## 🔐 Endpoints para Administradores

### 📌 **1. Crear Popup para una Recompensa**

**Endpoint:** `POST /api/admin/recompensas/{recompensaId}/popups`

**Permiso requerido:** `recompensas.popups`

**Request Body:**
```json
{
  "titulo": "🎁 ¡Gana Puntos por tus Compras!",
  "descripcion": "Acumula puntos en cada compra y canjéalos por descuentos exclusivos",
  "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
  "texto_boton": "Ver Recompensa",
  "url_destino": null,
  "mostrar_cerrar": true,
  "auto_cerrar_segundos": 30,
  "popup_activo": true
}
```

**Response Exitosa (201):**
```json
{
  "success": true,
  "message": "Popup creado exitosamente",
  "data": {
    "id": 1,
    "titulo": "🎁 ¡Gana Puntos por tus Compras!",
    "descripcion": "Acumula puntos en cada compra y canjéalos por descuentos exclusivos",
    "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
    "texto_boton": "Ver Recompensa",
    "url_destino": "/recompensas/5",
    "mostrar_cerrar": true,
    "auto_cerrar_segundos": 30,
    "popup_activo": true,
    "esta_activo": true,
    "tiene_auto_cierre": true,
    "recompensa": {
      "id": 5,
      "nombre": "Acumulación de Puntos",
      "tipo": "puntos",
      "estado": "activa"
    },
    "created_at": "2025-09-30T10:00:00.000000Z",
    "updated_at": "2025-09-30T10:00:00.000000Z"
  }
}
```

**Validaciones:**
- `titulo`: Requerido, máximo 255 caracteres
- `descripcion`: Opcional, texto
- `imagen_popup`: Opcional, máximo 255 caracteres
- `texto_boton`: Opcional, máximo 100 caracteres (default: "Ver más")
- `url_destino`: Opcional, máximo 500 caracteres (default: "/recompensas/{id}")
- `mostrar_cerrar`: Opcional, boolean (default: true)
- `auto_cerrar_segundos`: Opcional, entero entre 1 y 300 segundos
- `popup_activo`: Opcional, boolean (default: false)

---

### 📌 **2. Listar Popups de una Recompensa**

**Endpoint:** `GET /api/admin/recompensas/{recompensaId}/popups`

**Permiso requerido:** `recompensas.popups`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popups obtenidos exitosamente",
  "data": {
    "recompensa": {
      "id": 5,
      "nombre": "Acumulación de Puntos",
      "tipo": "puntos",
      "estado": "activa"
    },
    "popups": [
      {
        "id": 1,
        "titulo": "🎁 ¡Gana Puntos por tus Compras!",
        "descripcion": "Acumula puntos en cada compra",
        "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
        "texto_boton": "Ver Recompensa",
        "url_destino": "/recompensas/5",
        "mostrar_cerrar": true,
        "auto_cerrar_segundos": 30,
        "popup_activo": true,
        "esta_activo": true,
        "tiene_auto_cierre": true,
        "recompensa": {
          "id": 5,
          "nombre": "Acumulación de Puntos",
          "tipo": "puntos",
          "estado": "activa"
        },
        "created_at": "2025-09-30T10:00:00.000000Z",
        "updated_at": "2025-09-30T10:00:00.000000Z"
      }
    ],
    "total_popups": 1
  }
}
```

---

### 📌 **3. Ver Detalle de un Popup**

**Endpoint:** `GET /api/admin/recompensas/{recompensaId}/popups/{popupId}`

**Permiso requerido:** `recompensas.popups`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup obtenido exitosamente",
  "data": {
    "id": 1,
    "recompensa_id": 5,
    "titulo": "🎁 ¡Gana Puntos por tus Compras!",
    "descripcion": "Acumula puntos en cada compra",
    "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
    "texto_boton": "Ver Recompensa",
    "url_destino": "/recompensas/5",
    "mostrar_cerrar": true,
    "auto_cerrar_segundos": 30,
    "popup_activo": true,
    "recompensa": {
      "id": 5,
      "nombre": "Acumulación de Puntos",
      "tipo": "puntos",
      "tipo_nombre": "Puntos",
      "fecha_inicio": "2025-09-30T00:00:00.000000Z",
      "fecha_fin": "2025-12-31T23:59:59.000000Z"
    }
  }
}
```

---

### 📌 **4. Actualizar Popup**

**Endpoint:** `PUT /api/admin/recompensas/{recompensaId}/popups/{popupId}`

**Permiso requerido:** `recompensas.popups`

**Request Body:**
```json
{
  "titulo": "🎉 ¡ACTUALIZADO! Gana Más Puntos",
  "descripcion": "Nueva descripción actualizada",
  "auto_cerrar_segundos": 45
}
```

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup actualizado exitosamente",
  "data": {
    "id": 1,
    "recompensa_id": 5,
    "titulo": "🎉 ¡ACTUALIZADO! Gana Más Puntos",
    "descripcion": "Nueva descripción actualizada",
    "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
    "texto_boton": "Ver Recompensa",
    "url_destino": "/recompensas/5",
    "mostrar_cerrar": true,
    "auto_cerrar_segundos": 45,
    "popup_activo": true,
    "recompensa": {
      "id": 5,
      "nombre": "Acumulación de Puntos",
      "tipo": "puntos",
      "tipo_nombre": "Puntos",
      "fecha_inicio": "2025-09-30T00:00:00.000000Z",
      "fecha_fin": "2025-12-31T23:59:59.000000Z"
    }
  }
}
```

---

### 📌 **5. Activar/Desactivar Popup**

**Endpoint:** `PATCH /api/admin/recompensas/{recompensaId}/popups/{popupId}/toggle`

**Permiso requerido:** `recompensas.popups`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup activado",
  "data": {
    "id": 1,
    "popup_activo": true,
    "esta_activo": true
  }
}
```

---

### 📌 **6. Eliminar Popup**

**Endpoint:** `DELETE /api/admin/recompensas/{recompensaId}/popups/{popupId}`

**Permiso requerido:** `recompensas.popups`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup eliminado exitosamente"
}
```

---

### 📌 **7. Estadísticas de Popups**

**Endpoint:** `GET /api/admin/recompensas/{recompensaId}/popups/estadisticas-popups`

**Permiso requerido:** `recompensas.popups`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas de popups obtenidas exitosamente",
  "data": {
    "total_popups": 5,
    "popups_activos": 3,
    "popups_inactivos": 2,
    "popups_con_auto_cierre": 4,
    "popups_sin_auto_cierre": 1,
    "distribucion_por_estado": {
      "activos": 3,
      "inactivos": 2
    },
    "configuraciones_comunes": {
      "con_imagen": 4,
      "sin_imagen": 1,
      "con_auto_cierre": 4,
      "sin_auto_cierre": 1
    }
  }
}
```

---

### 📌 **8. Enviar Notificación a Clientes**

**Endpoint:** `POST /api/admin/recompensas/{recompensaId}/notificaciones/enviar`

**Permiso requerido:** `recompensas.notificaciones`

**Request Body:**
```json
{
  "cliente_ids": [10, 25, 47, 89, 123]
}
```

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Notificaciones enviadas exitosamente",
  "data": {
    "total_enviadas": 5,
    "total_solicitadas": 5,
    "notificaciones_duplicadas": 0
  }
}
```

**Validaciones:**
- `cliente_ids`: Requerido, array de IDs de clientes
- Verifica que exista un popup configurado para la recompensa
- No envía duplicados a clientes que ya tienen una notificación activa

---

### 📌 **9. Estadísticas de Notificaciones**

**Endpoint:** `GET /api/admin/recompensas/{recompensaId}/notificaciones/estadisticas`

**Permiso requerido:** `recompensas.notificaciones`

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas de notificaciones obtenidas exitosamente",
  "data": {
    "total_notificaciones": 150,
    "por_estado": {
      "enviadas": 20,
      "vistas": 80,
      "cerradas": 45,
      "expiradas": 5
    },
    "tasa_apertura": 86.67,
    "tasa_cierre": 30.0,
    "clientes_unicos": 120,
    "distribucion_temporal": [
      {
        "fecha": "2025-09-30",
        "total": 50,
        "vistas": 45
      },
      {
        "fecha": "2025-10-01",
        "total": 60,
        "vistas": 52
      },
      {
        "fecha": "2025-10-02",
        "total": 40,
        "vistas": 35
      }
    ]
  }
}
```

---

## 👥 Endpoints para Clientes

### 📌 **1. Obtener Popups Activos**

**Endpoint:** `GET /api/cliente/recompensas/popups-activos`

**Autenticación:** JWT del cliente

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popups activos obtenidos exitosamente",
  "data": {
    "cliente": {
      "id": 25,
      "nombre": "Juan Pérez García",
      "segmento_actual": "vip"
    },
    "popups_activos": [
      {
        "id": 1,
        "recompensa_id": 5,
        "titulo": "🎁 ¡Gana Puntos por tus Compras!",
        "descripcion": "Acumula puntos en cada compra",
        "imagen_popup": "https://mitienda.com/images/popup-puntos.jpg",
        "texto_boton": "Ver Recompensa",
        "url_destino": "/recompensas/5",
        "mostrar_cerrar": true,
        "auto_cerrar_segundos": 30,
        "popup_activo": true,
        "recompensa": {
          "id": 5,
          "nombre": "Acumulación de Puntos",
          "tipo": "puntos",
          "tipo_nombre": "Puntos",
          "fecha_inicio": "2025-09-30T00:00:00.000000Z",
          "fecha_fin": "2025-12-31T23:59:59.000000Z"
        }
      },
      {
        "id": 3,
        "recompensa_id": 8,
        "titulo": "🚚 Envío Gratis para Clientes VIP",
        "descripcion": "Obtén envío gratis en todas tus compras",
        "imagen_popup": "https://mitienda.com/images/popup-envio.jpg",
        "texto_boton": "¡Aprovecha Ahora!",
        "url_destino": "/recompensas/8",
        "mostrar_cerrar": true,
        "auto_cerrar_segundos": null,
        "popup_activo": true,
        "recompensa": {
          "id": 8,
          "nombre": "Envío Gratis VIP",
          "tipo": "envio_gratis",
          "tipo_nombre": "Envío Gratis",
          "fecha_inicio": "2025-09-30T00:00:00.000000Z",
          "fecha_fin": "2025-12-31T23:59:59.000000Z"
        }
      }
    ],
    "total_popups": 2
  }
}
```

**Lógica del Sistema:**
1. Detecta el segmento del cliente (nuevo, recurrente, vip, todos)
2. Filtra recompensas activas y vigentes
3. Verifica que el cliente califique para cada recompensa
4. Retorna solo los popups activos de recompensas aplicables

---

### 📌 **2. Marcar Popup como Visto**

**Endpoint:** `PATCH /api/cliente/recompensas/popups/{popupId}/marcar-visto`

**Autenticación:** JWT del cliente

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup marcado como visto",
  "data": {
    "estado": "vista",
    "estado_nombre": "Vista",
    "fecha_notificacion": "2025-09-30T10:00:00.000000Z",
    "fecha_visualizacion": "2025-09-30T10:05:00.000000Z",
    "fecha_cierre": null,
    "tiempo_transcurrido": "hace 5 minutos",
    "tiempo_visualizacion": "5 minutos",
    "tiempo_cierre": null,
    "fue_vista": true,
    "fue_cerrada": false,
    "esta_activa": true
  }
}
```

---

### 📌 **3. Cerrar Popup**

**Endpoint:** `PATCH /api/cliente/recompensas/popups/{popupId}/cerrar`

**Autenticación:** JWT del cliente

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Popup cerrado exitosamente",
  "data": {
    "estado": "cerrada",
    "estado_nombre": "Cerrada",
    "fecha_notificacion": "2025-09-30T10:00:00.000000Z",
    "fecha_visualizacion": "2025-09-30T10:05:00.000000Z",
    "fecha_cierre": "2025-09-30T10:10:00.000000Z",
    "tiempo_transcurrido": "hace 10 minutos",
    "tiempo_visualizacion": "5 minutos",
    "tiempo_cierre": "5 minutos",
    "fue_vista": true,
    "fue_cerrada": true,
    "esta_activa": false
  }
}
```

---

## 🔧 Troubleshooting

### ❌ **PROBLEMAS COMUNES Y SOLUCIONES**

#### **1. Error 404 - Recompensa no encontrada**
```json
{
  "success": false,
  "message": "Recompensa no encontrada"
}
```
**Solución:** Verificar que el ID de la recompensa existe y es válido.

#### **2. Error 404 - Popup no encontrado**
```json
{
  "success": false,
  "message": "Popup no encontrado"
}
```
**Solución:** Verificar que el ID del popup existe y pertenece a la recompensa.

#### **3. Error 401 - No autorizado**
```json
{
  "message": "Unauthenticated"
}
```
**Solución:** Verificar que el token de autenticación es válido y no ha expirado.

#### **4. Error 403 - Sin permisos**
```json
{
  "message": "This action is unauthorized"
}
```
**Solución:** Verificar que el usuario tiene los permisos `recompensas.popups` o `recompensas.notificaciones`.

#### **5. Error 422 - Validación fallida**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": {
    "titulo": ["El título es obligatorio"]
  }
}
```
**Solución:** Revisar los campos requeridos y sus formatos.

#### **6. Error 500 - Error del servidor**
```json
{
  "success": false,
  "message": "Error al obtener los popups",
  "error": "Mensaje de error específico"
}
```
**Solución:** Revisar logs del servidor y verificar configuración de base de datos.

### 🔍 **VERIFICACIONES IMPORTANTES**

#### **1. Permisos en Base de Datos**
```sql
-- Verificar que existen los permisos
SELECT * FROM permissions WHERE name IN ('recompensas.popups', 'recompensas.notificaciones');

-- Verificar que el usuario tiene los permisos
SELECT p.name FROM permissions p
JOIN model_has_permissions mhp ON p.id = mhp.permission_id
WHERE mhp.model_id = {user_id} AND p.name LIKE 'recompensas.%';
```

#### **2. Estructura de Tablas**
```sql
-- Verificar tabla de popups
DESCRIBE recompensas_popups;

-- Verificar tabla de notificaciones
DESCRIBE recompensas_notificaciones_clientes;
```

#### **3. Configuración de Storage**
```bash
# Verificar que existe el directorio
ls -la public/storage/popups/

# Verificar permisos de escritura
chmod 755 public/storage/popups/
```

### 📝 **CHECKLIST DE VERIFICACIÓN**

#### **Para Administradores:**
- [ ] Usuario autenticado con token válido
- [ ] Permisos `recompensas.popups` asignados
- [ ] Recompensa existe y es accesible
- [ ] Formulario con Content-Type correcto
- [ ] Campos requeridos completados

#### **Para Clientes:**
- [ ] JWT token válido en header
- [ ] Cliente autenticado correctamente
- [ ] Recompensas aplicables al cliente
- [ ] Popups activos disponibles

#### **Para Desarrollo:**
- [ ] Rutas registradas correctamente
- [ ] Controladores implementados
- [ ] Modelos con relaciones definidas
- [ ] Middleware de permisos configurado
- [ ] Storage configurado para imágenes

### 🚀 **COMANDOS ÚTILES**

#### **Verificar rutas:**
```bash
php artisan route:list | grep popups
```

#### **Ejecutar seeder de permisos:**
```bash
php artisan db:seed --class=RecompensasPermisosSeeder
```

#### **Limpiar caché:**
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

#### **Verificar logs:**
```bash
tail -f storage/logs/laravel.log
```

---

### 📌 **4. Historial de Notificaciones**

**Endpoint:** `GET /api/cliente/recompensas/notificaciones/historial`

**Autenticación:** JWT del cliente

**Query Parameters:**
- `estado` (opcional): filtrar por estado (enviada, vista, cerrada, expirada)
- `recompensa_id` (opcional): filtrar por recompensa
- `per_page` (opcional): elementos por página (default: 15)

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Historial de notificaciones obtenido exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 45,
        "recompensa": {
          "id": 5,
          "nombre": "Acumulación de Puntos",
          "tipo": "puntos"
        },
        "popup": {
          "id": 1,
          "titulo": "🎁 ¡Gana Puntos por tus Compras!"
        },
        "estado": "cerrada",
        "fecha_notificacion": "2025-09-30T10:00:00.000000Z",
        "fecha_visualizacion": "2025-09-30T10:05:00.000000Z",
        "fecha_cierre": "2025-09-30T10:10:00.000000Z",
        "tiempo_transcurrido": "hace 2 horas",
        "fue_vista": true,
        "fue_cerrada": true,
        "esta_activa": false
      },
      {
        "id": 52,
        "recompensa": {
          "id": 8,
          "nombre": "Envío Gratis VIP",
          "tipo": "envio_gratis"
        },
        "popup": {
          "id": 3,
          "titulo": "🚚 Envío Gratis para Clientes VIP"
        },
        "estado": "vista",
        "fecha_notificacion": "2025-09-29T15:00:00.000000Z",
        "fecha_visualizacion": "2025-09-29T15:02:00.000000Z",
        "fecha_cierre": null,
        "tiempo_transcurrido": "hace 1 día",
        "fue_vista": true,
        "fue_cerrada": false,
        "esta_activa": true
      }
    ],
    "per_page": 15,
    "total": 35,
    "last_page": 3
  }
}
```

---

## 🔒 Permisos Necesarios

Los siguientes permisos deben ser agregados al sistema:

### Permisos de Popups:
```php
[
    'name' => 'recompensas.popups',
    'description' => 'Gestionar popups de recompensas',
    'modulo' => 'Recompensas'
]
```

### Permisos de Notificaciones:
```php
[
    'name' => 'recompensas.notificaciones',
    'description' => 'Gestionar notificaciones de recompensas',
    'modulo' => 'Recompensas'
]
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Popup con Auto-cierre
```javascript
// Frontend - Crear popup
const crearPopup = async (recompensaId) => {
  const response = await axios.post(
    `/api/admin/recompensas/${recompensaId}/popups`,
    {
      titulo: "🎉 ¡Descuento Especial!",
      descripcion: "Obtén 20% de descuento en tu próxima compra",
      imagen_popup: "https://mitienda.com/images/descuento.jpg",
      texto_boton: "Quiero mi Descuento",
      auto_cerrar_segundos: 45,
      popup_activo: true
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  
  console.log('Popup creado:', response.data);
};
```

### Ejemplo 2: Mostrar Popups al Cliente
```javascript
// Frontend - Obtener y mostrar popups
const mostrarPopupsActivos = async () => {
  const response = await axios.get(
    '/api/cliente/recompensas/popups-activos',
    {
      headers: {
        Authorization: `Bearer ${tokenCliente}`,
      }
    }
  );
  
  const popups = response.data.data.popups_activos;
  
  popups.forEach(popup => {
    mostrarPopup({
      titulo: popup.titulo,
      descripcion: popup.descripcion,
      imagen: popup.imagen_popup,
      textoBoton: popup.texto_boton,
      urlDestino: popup.url_destino,
      autoCerrar: popup.auto_cerrar_segundos,
      onView: () => marcarComoVisto(popup.id),
      onClose: () => cerrarPopup(popup.id),
      onClick: () => {
        marcarComoVisto(popup.id);
        window.location.href = popup.url_destino;
      }
    });
  });
};

const marcarComoVisto = async (popupId) => {
  await axios.patch(
    `/api/cliente/recompensas/popups/${popupId}/marcar-visto`,
    {},
    {
      headers: {
        Authorization: `Bearer ${tokenCliente}`,
      }
    }
  );
};

const cerrarPopup = async (popupId) => {
  await axios.patch(
    `/api/cliente/recompensas/popups/${popupId}/cerrar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${tokenCliente}`,
      }
    }
  );
};
```

### Ejemplo 3: Enviar Notificaciones Masivas
```javascript
// Frontend - Enviar notificaciones a clientes VIP
const enviarNotificacionesVIP = async (recompensaId) => {
  // Primero obtenemos los clientes VIP
  const clientesVIP = await obtenerClientesVIP();
  
  // Enviamos notificaciones
  const response = await axios.post(
    `/api/admin/recompensas/${recompensaId}/notificaciones/enviar`,
    {
      cliente_ids: clientesVIP.map(c => c.id)
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  
  console.log('Notificaciones enviadas:', response.data);
};
```

---

## 📊 Estados del Popup

| Estado | Descripción | Transición |
|--------|-------------|------------|
| `enviada` | Popup enviado al cliente | → `vista` cuando el cliente lo visualiza |
| `vista` | Cliente visualizó el popup | → `cerrada` cuando el cliente lo cierra |
| `cerrada` | Cliente cerró el popup | Estado final |
| `expirada` | Popup ya no es válido | Estado final |

---

## 🎨 Buenas Prácticas

### Para Administradores:
1. **Títulos Atractivos:** Usar emojis y lenguaje llamativo
2. **Descripciones Claras:** Explicar el beneficio en 1-2 líneas
3. **Imágenes de Calidad:** Usar imágenes optimizadas y atractivas
4. **Auto-cierre:** Entre 20-60 segundos para no molestar al usuario
5. **Botones Claros:** Texto de botón debe indicar la acción (ej: "Ver Recompensa", "¡Quiero mi Descuento!")

### Para Desarrolladores Frontend:
1. **Mostrar al Cargar:** Detectar y mostrar popups al iniciar sesión
2. **Tracking Automático:** Marcar como visto automáticamente
3. **Registro de Cierres:** Siempre registrar cuando el usuario cierra
4. **UX Intuitiva:** No mostrar más de 2-3 popups a la vez
5. **Responsive:** Adaptar el popup a todos los tamaños de pantalla

---

## ⚠️ Errores Comunes

### Error 404 - Recompensa no encontrada
```json
{
  "success": false,
  "message": "Recompensa no encontrada"
}
```

### Error 422 - Popup no configurado
```json
{
  "success": false,
  "message": "No hay popup configurado para esta recompensa"
}
```

### Error 401 - No autenticado
```json
{
  "success": false,
  "message": "Cliente no autenticado"
}
```

---

## 📝 Notas Importantes

1. **URL Automática:** Si no se especifica `url_destino`, se genera automáticamente como `/recompensas/{id}`
2. **Texto del Botón:** Si no se especifica `texto_boton`, se usa "Ver más" por defecto
3. **Auto-cierre:** Si se configura, el popup se cierra automáticamente después del tiempo especificado
4. **Popups Activos:** Solo se muestran popups activos de recompensas activas y vigentes
5. **Segmentación Automática:** El sistema detecta automáticamente el segmento del cliente
6. **No Duplicados:** No se envían notificaciones duplicadas a un mismo cliente

---

**Documentación creada:** 30 de Septiembre, 2025  
**Versión:** 1.0  
**Módulo:** Sistema de Recompensas - Popups y Notificaciones
