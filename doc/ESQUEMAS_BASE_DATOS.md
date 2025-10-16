# Esquemas de Base de Datos - Facturación Electrónica

## Índice
1. [Diagrama Entidad-Relación](#diagrama-entidad-relación)
2. [Tablas del Sistema](#tablas-del-sistema)
3. [Relaciones](#relaciones)
4. [Índices y Optimizaciones](#índices-y-optimizaciones)

---

## Diagrama Entidad-Relación

```
┌─────────────────┐
│    empresas     │
│  (emisor CPE)   │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│  certificados   │
│  (.pfx digital) │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     series      │───┐   │    clientes     │
│ (correlativos)  │   │   │                 │
└─────────────────┘   │   └────────┬────────┘
                      │            │
                      │            │ 1:N
                      │            │
                      │   ┌────────▼────────┐
                      └──►│     ventas      │
                          │                 │
                          └────┬────────┬───┘
                               │        │
                          ┌────┘        └────┐
                          │                  │
                          │ 1:N              │ 1:1
                          │                  │
                  ┌───────▼───────┐   ┌──────▼──────┐
                  │ ventas_items  │   │ comprobantes│
                  │               │   │  (CPE XML)  │
                  └───────────────┘   └──────┬──────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                        ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼────┐
                        │ resumenes │  │   bajas   │  │  notas  │
                        │   (RC)    │  │   (RA)    │  │ (NC/ND) │
                        └───────────┘  └───────────┘  └─────────┘

                        ┌──────────────────────────┐
                        │   auditoria_sunat        │
                        │ (logs de envíos)         │
                        └──────────────────────────┘
```

---

## Tablas del Sistema

### 1. empresas
Almacena la configuración del emisor (empresa).

```sql
CREATE TABLE empresas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),

    -- Domicilio fiscal
    domicilio_fiscal VARCHAR(255) NOT NULL,
    ubigeo VARCHAR(6) NOT NULL,
    departamento VARCHAR(50),
    provincia VARCHAR(50),
    distrito VARCHAR(50),
    urbanizacion VARCHAR(100),
    codigo_local VARCHAR(4) DEFAULT '0000',

    -- Contacto
    email VARCHAR(100),
    telefono VARCHAR(20),
    web VARCHAR(100),

    -- Logo
    logo_path VARCHAR(255),

    -- Configuración SOL SUNAT
    sol_usuario VARCHAR(50),
    sol_clave VARCHAR(255), -- Cifrada
    sol_endpoint ENUM('beta', 'prod') DEFAULT 'beta',

    -- Estado
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_ruc (ruc),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. certificados
Almacena los certificados digitales para firma electrónica.

```sql
CREATE TABLE certificados (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Archivo certificado
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL, -- Ruta cifrada en storage
    password_cifrado TEXT NOT NULL, -- Contraseña cifrada del .pfx

    -- Información del certificado
    propietario VARCHAR(255),
    emisor VARCHAR(255),
    numero_serie VARCHAR(100),
    fecha_emision DATE,
    fecha_vencimiento DATE NOT NULL,

    -- Metadatos
    tamanio_bytes INT UNSIGNED,
    hash_sha256 VARCHAR(64),

    -- Estado
    estado ENUM('activo', 'vencido', 'revocado') DEFAULT 'activo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_empresa (empresa_id),
    INDEX idx_estado (estado),
    INDEX idx_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. series
Gestión de series y correlativos para cada tipo de comprobante.

```sql
CREATE TABLE series (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Tipo de comprobante
    tipo_comprobante ENUM('01', '03', '07', '08') NOT NULL COMMENT '01=Factura, 03=Boleta, 07=NC, 08=ND',
    serie VARCHAR(4) NOT NULL,

    -- Correlativo
    correlativo_actual INT UNSIGNED NOT NULL DEFAULT 0,
    correlativo_minimo INT UNSIGNED DEFAULT 1,
    correlativo_maximo INT UNSIGNED DEFAULT 99999999,

    -- Asociación a sede/caja
    sede_id BIGINT UNSIGNED,
    caja_id BIGINT UNSIGNED,

    -- Estado
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',

    -- Observaciones
    descripcion VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_serie_empresa (empresa_id, tipo_comprobante, serie),
    INDEX idx_tipo_estado (tipo_comprobante, estado),
    INDEX idx_sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. clientes
Registro de clientes (receptores de comprobantes).

```sql
CREATE TABLE clientes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Identificación
    tipo_documento ENUM('1', '6', '4', '7', '-') NOT NULL COMMENT '1=DNI, 6=RUC, 4=CE, 7=PASS, -=SIN DOC',
    numero_documento VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),

    -- Domicilio
    direccion VARCHAR(255),
    ubigeo VARCHAR(6),
    departamento VARCHAR(50),
    provincia VARCHAR(50),
    distrito VARCHAR(50),

    -- Contacto
    email VARCHAR(100),
    telefono VARCHAR(20),
    celular VARCHAR(20),

    -- Clasificación
    tipo_cliente ENUM('natural', 'juridico') DEFAULT 'natural',
    categoria VARCHAR(50),

    -- Estado
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_documento (tipo_documento, numero_documento),
    INDEX idx_numero_documento (numero_documento),
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. ventas
Registro de ventas (previo a la emisión de CPE).

```sql
CREATE TABLE ventas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo_venta VARCHAR(50) NOT NULL UNIQUE,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Cliente
    cliente_id BIGINT UNSIGNED NOT NULL,
    cliente_tipo_documento VARCHAR(2),
    cliente_numero_documento VARCHAR(20),
    cliente_nombre VARCHAR(255),
    cliente_direccion VARCHAR(255),
    cliente_email VARCHAR(100),

    -- Fecha y hora
    fecha_venta DATE NOT NULL,
    hora_venta TIME NOT NULL,

    -- Totales
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_items DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_global DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal_neto DECIMAL(12,2) NOT NULL DEFAULT 0,
    igv DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    moneda VARCHAR(3) DEFAULT 'PEN',

    -- Pago
    metodo_pago VARCHAR(50),
    monto_pagado DECIMAL(12,2),
    monto_cambio DECIMAL(12,2),

    -- Observaciones
    observaciones TEXT,

    -- Relación con comprobante
    comprobante_id BIGINT UNSIGNED NULL,

    -- Estado
    estado ENUM('PENDIENTE', 'FACTURADO', 'ANULADO') DEFAULT 'PENDIENTE',
    motivo_anulacion TEXT,

    -- Sede/Caja/Usuario
    sede_id BIGINT UNSIGNED,
    caja_id BIGINT UNSIGNED,
    usuario_id BIGINT UNSIGNED,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    INDEX idx_fecha_venta (fecha_venta),
    INDEX idx_estado (estado),
    INDEX idx_cliente (cliente_id),
    INDEX idx_codigo_venta (codigo_venta),
    INDEX idx_comprobante (comprobante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. ventas_items
Detalle de items de cada venta.

```sql
CREATE TABLE ventas_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    venta_id BIGINT UNSIGNED NOT NULL,

    -- Producto
    producto_id BIGINT UNSIGNED,
    codigo_producto VARCHAR(50),
    descripcion VARCHAR(500) NOT NULL,

    -- Cantidad y unidad
    unidad_medida VARCHAR(10) NOT NULL DEFAULT 'NIU',
    cantidad DECIMAL(12,3) NOT NULL,

    -- Precios
    precio_unitario DECIMAL(12,2) NOT NULL,
    precio_unitario_sin_igv DECIMAL(12,2),

    -- Afectación IGV
    tipo_afectacion_igv VARCHAR(2) DEFAULT '10' COMMENT '10=Gravado, 20=Exonerado, 30=Inafecto',
    porcentaje_igv DECIMAL(5,2) DEFAULT 18.00,

    -- Descuentos
    descuento DECIMAL(12,2) DEFAULT 0,

    -- Cálculos
    subtotal DECIMAL(12,2) NOT NULL,
    igv DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,

    -- Orden
    orden SMALLINT UNSIGNED,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    INDEX idx_venta (venta_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. comprobantes
Registro de comprobantes electrónicos emitidos.

```sql
CREATE TABLE comprobantes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,
    venta_id BIGINT UNSIGNED,

    -- Tipo de comprobante
    tipo_comprobante ENUM('01', '03', '07', '08') NOT NULL,
    serie VARCHAR(4) NOT NULL,
    numero INT UNSIGNED NOT NULL,
    numero_completo VARCHAR(20) GENERATED ALWAYS AS (CONCAT(serie, '-', numero)) STORED,

    -- Fechas
    fecha_emision DATE NOT NULL,
    hora_emision TIME NOT NULL,
    fecha_vencimiento DATE,

    -- Cliente (desnormalizado para histórico)
    cliente_tipo_documento VARCHAR(2),
    cliente_numero_documento VARCHAR(20),
    cliente_nombre VARCHAR(255),
    cliente_direccion VARCHAR(255),

    -- Moneda y totales
    moneda VARCHAR(3) DEFAULT 'PEN',
    subtotal DECIMAL(12,2) NOT NULL,
    descuentos DECIMAL(12,2) DEFAULT 0,
    igv DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,

    -- Firma digital
    hash VARCHAR(100),
    qr_path VARCHAR(255),

    -- Archivos
    xml_path VARCHAR(500),
    xml_firmado_path VARCHAR(500),
    cdr_path VARCHAR(500),

    -- SUNAT
    estado_sunat ENUM('PENDIENTE', 'ACEPTADO', 'ACEPTADO_OBS', 'RECHAZADO', 'BAJA') DEFAULT 'PENDIENTE',
    codigo_sunat VARCHAR(10),
    mensaje_sunat TEXT,
    fecha_envio_sunat TIMESTAMP NULL,
    fecha_respuesta_sunat TIMESTAMP NULL,

    -- Comprobante de referencia (para NC/ND)
    comprobante_ref_id BIGINT UNSIGNED,
    tipo_comprobante_ref VARCHAR(2),
    serie_ref VARCHAR(4),
    numero_ref INT UNSIGNED,
    motivo_nota VARCHAR(255),
    tipo_nota_credito VARCHAR(2),
    tipo_nota_debito VARCHAR(2),

    -- Observaciones
    observaciones TEXT,
    leyendas JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (comprobante_ref_id) REFERENCES comprobantes(id),
    UNIQUE KEY unique_comprobante (empresa_id, tipo_comprobante, serie, numero),
    INDEX idx_numero_completo (numero_completo),
    INDEX idx_fecha_emision (fecha_emision),
    INDEX idx_estado_sunat (estado_sunat),
    INDEX idx_hash (hash),
    INDEX idx_cliente (cliente_numero_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. comprobantes_items
Detalle de items de cada comprobante (espejo de ventas_items).

```sql
CREATE TABLE comprobantes_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comprobante_id BIGINT UNSIGNED NOT NULL,

    -- Descripción
    codigo VARCHAR(50),
    descripcion VARCHAR(500) NOT NULL,
    unidad_medida VARCHAR(10) NOT NULL,
    cantidad DECIMAL(12,3) NOT NULL,

    -- Precios
    precio_unitario DECIMAL(12,2) NOT NULL,
    tipo_afectacion_igv VARCHAR(2),
    porcentaje_igv DECIMAL(5,2),

    -- Totales
    descuento DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    igv DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,

    orden SMALLINT UNSIGNED,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id) ON DELETE CASCADE,
    INDEX idx_comprobante (comprobante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9. resumenes
Resúmenes Diarios (RC) para envío diferido de boletas.

```sql
CREATE TABLE resumenes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Identificación
    fecha_resumen DATE NOT NULL,
    fecha_generacion DATE NOT NULL,
    correlativo INT UNSIGNED NOT NULL,
    identificador VARCHAR(30) NOT NULL UNIQUE COMMENT 'RC-YYYYMMDD-NNN',

    -- Ticket SUNAT
    ticket VARCHAR(50),

    -- Comprobantes incluidos
    cantidad_comprobantes INT UNSIGNED,
    total_gravado DECIMAL(12,2) DEFAULT 0,
    total_exonerado DECIMAL(12,2) DEFAULT 0,
    total_inafecto DECIMAL(12,2) DEFAULT 0,
    total_igv DECIMAL(12,2) DEFAULT 0,
    total_general DECIMAL(12,2) DEFAULT 0,

    -- Archivos
    xml_path VARCHAR(500),
    cdr_path VARCHAR(500),

    -- Estado SUNAT
    estado ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    codigo_sunat VARCHAR(10),
    mensaje_sunat TEXT,
    fecha_envio TIMESTAMP NULL,
    fecha_procesamiento TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_fecha_resumen (fecha_resumen),
    INDEX idx_ticket (ticket),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10. resumenes_detalle
Detalle de comprobantes incluidos en cada resumen.

```sql
CREATE TABLE resumenes_detalle (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resumen_id BIGINT UNSIGNED NOT NULL,
    comprobante_id BIGINT UNSIGNED NOT NULL,

    -- Datos del comprobante
    tipo_comprobante VARCHAR(2),
    serie VARCHAR(4),
    numero INT UNSIGNED,
    estado_item ENUM('1', '2', '3') DEFAULT '1' COMMENT '1=Adicionar, 2=Modificar, 3=Anular',

    -- Totales
    total DECIMAL(12,2),
    igv DECIMAL(12,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (resumen_id) REFERENCES resumenes(id) ON DELETE CASCADE,
    FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id),
    INDEX idx_resumen (resumen_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11. bajas
Comunicaciones de Baja (RA) para anular comprobantes.

```sql
CREATE TABLE bajas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Identificación
    fecha_baja DATE NOT NULL,
    fecha_generacion DATE NOT NULL,
    correlativo INT UNSIGNED NOT NULL,
    identificador VARCHAR(30) NOT NULL UNIQUE COMMENT 'RA-YYYYMMDD-NNN',

    -- Ticket SUNAT
    ticket VARCHAR(50),

    -- Comprobantes incluidos
    cantidad_comprobantes INT UNSIGNED,

    -- Archivos
    xml_path VARCHAR(500),
    cdr_path VARCHAR(500),

    -- Estado SUNAT
    estado ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    codigo_sunat VARCHAR(10),
    mensaje_sunat TEXT,
    fecha_envio TIMESTAMP NULL,
    fecha_procesamiento TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_fecha_baja (fecha_baja),
    INDEX idx_ticket (ticket),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12. bajas_detalle
Detalle de comprobantes incluidos en cada comunicación de baja.

```sql
CREATE TABLE bajas_detalle (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    baja_id BIGINT UNSIGNED NOT NULL,
    comprobante_id BIGINT UNSIGNED NOT NULL,

    -- Datos del comprobante
    tipo_comprobante VARCHAR(2),
    serie VARCHAR(4),
    numero INT UNSIGNED,
    motivo VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (baja_id) REFERENCES bajas(id) ON DELETE CASCADE,
    FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id),
    INDEX idx_baja (baja_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13. auditoria_sunat
Registro de auditoría de todas las comunicaciones con SUNAT.

```sql
CREATE TABLE auditoria_sunat (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT UNSIGNED NOT NULL,

    -- Tipo de operación
    tipo_operacion ENUM('EMISION', 'CONSULTA', 'RESUMEN', 'BAJA') NOT NULL,

    -- Entidad relacionada
    entidad_tipo VARCHAR(50) COMMENT 'comprobante, resumen, baja',
    entidad_id BIGINT UNSIGNED,
    entidad_referencia VARCHAR(100) COMMENT 'Serie-Numero o identificador',

    -- Request
    endpoint_url VARCHAR(500),
    request_headers JSON,
    request_body LONGTEXT,

    -- Response
    response_status INT,
    response_headers JSON,
    response_body LONGTEXT,
    response_time_ms INT UNSIGNED,

    -- Resultado
    exitoso BOOLEAN DEFAULT FALSE,
    codigo_sunat VARCHAR(10),
    mensaje_sunat TEXT,

    -- Reintentos
    intento TINYINT UNSIGNED DEFAULT 1,

    -- IP y usuario
    ip_address VARCHAR(45),
    usuario_id BIGINT UNSIGNED,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_tipo_operacion (tipo_operacion),
    INDEX idx_entidad (entidad_tipo, entidad_id),
    INDEX idx_exitoso (exitoso),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14. cola_reintentos
Cola de reintentos para envíos fallidos a SUNAT.

```sql
CREATE TABLE cola_reintentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Entidad a reintentar
    entidad_tipo ENUM('comprobante', 'resumen', 'baja') NOT NULL,
    entidad_id BIGINT UNSIGNED NOT NULL,

    -- Control de reintentos
    intentos INT UNSIGNED DEFAULT 0,
    max_intentos INT UNSIGNED DEFAULT 3,

    -- Último error
    ultimo_error TEXT,
    ultimo_intento_at TIMESTAMP NULL,

    -- Próximo reintento
    proximo_reintento_at TIMESTAMP NULL,
    delay_segundos INT UNSIGNED DEFAULT 300 COMMENT 'Delay entre reintentos',

    -- Estado
    estado ENUM('PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'FALLIDO') DEFAULT 'PENDIENTE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_estado_proximo (estado, proximo_reintento_at),
    INDEX idx_entidad (entidad_tipo, entidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Relaciones

### Relaciones principales:

1. **empresas → certificados** (1:N)
   - Una empresa puede tener múltiples certificados (histórico)
   - Solo uno activo a la vez

2. **empresas → series** (1:N)
   - Una empresa tiene múltiples series por tipo de comprobante

3. **ventas → ventas_items** (1:N)
   - Una venta tiene múltiples items

4. **ventas → comprobantes** (1:1)
   - Una venta genera un comprobante

5. **comprobantes → comprobantes_items** (1:N)
   - Un comprobante tiene múltiples items

6. **comprobantes → comprobantes** (1:N para NC/ND)
   - Una NC/ND referencia a un comprobante padre

7. **resumenes → resumenes_detalle** (1:N)
   - Un resumen incluye múltiples comprobantes

8. **bajas → bajas_detalle** (1:N)
   - Una baja incluye múltiples comprobantes

---

## Índices y Optimizaciones

### Índices críticos para rendimiento:

```sql
-- Búsqueda rápida de comprobantes por número
CREATE INDEX idx_comprobante_lookup ON comprobantes(empresa_id, tipo_comprobante, serie, numero);

-- Búsqueda de ventas por fecha y estado
CREATE INDEX idx_ventas_fecha_estado ON ventas(fecha_venta, estado);

-- Búsqueda de clientes por documento
CREATE INDEX idx_clientes_documento ON clientes(numero_documento, tipo_documento);

-- Auditoría por fecha
CREATE INDEX idx_auditoria_fecha ON auditoria_sunat(created_at DESC);

-- Cola de reintentos pendientes
CREATE INDEX idx_cola_pendientes ON cola_reintentos(estado, proximo_reintento_at);
```

### Optimizaciones:

1. **Particionamiento por fecha**
   ```sql
   -- Para tablas grandes como comprobantes y ventas
   ALTER TABLE comprobantes PARTITION BY RANGE (YEAR(fecha_emision)) (
       PARTITION p2024 VALUES LESS THAN (2025),
       PARTITION p2025 VALUES LESS THAN (2026),
       PARTITION p_future VALUES LESS THAN MAXVALUE
   );
   ```

2. **Campos calculados**
   ```sql
   -- numero_completo en comprobantes es GENERATED
   -- Evita concatenaciones en queries
   ```

3. **Desnormalización estratégica**
   - Datos del cliente copiados en `comprobantes` para histórico
   - Totales calculados almacenados en `ventas` y `comprobantes`

4. **Índices compuestos**
   ```sql
   -- Para queries frecuentes
   CREATE INDEX idx_comprobantes_estado_fecha
   ON comprobantes(estado_sunat, fecha_emision);
   ```

---

## Notas de Implementación

### Transacciones críticas:

1. **Reserva de correlativo** (debe ser atómica)
   ```sql
   START TRANSACTION;
   SELECT correlativo_actual FROM series WHERE id = ? FOR UPDATE;
   UPDATE series SET correlativo_actual = correlativo_actual + 1 WHERE id = ?;
   COMMIT;
   ```

2. **Creación de venta + items**
   ```sql
   START TRANSACTION;
   INSERT INTO ventas (...);
   INSERT INTO ventas_items (...);
   COMMIT;
   ```

3. **Emisión de comprobante**
   ```sql
   START TRANSACTION;
   -- Reservar correlativo
   -- Crear comprobante
   -- Actualizar venta
   -- Copiar items
   COMMIT;
   ```

### Campos cifrados:
- `empresas.sol_clave`
- `certificados.password_cifrado`
- `certificados.ruta_archivo`

Usar Laravel encryption o equivalente.

### Soft deletes:
Considerar agregar `deleted_at` a tablas críticas:
- `comprobantes`
- `ventas`
- `clientes`

### Backups:
- Backup diario de tablas de configuración
- Backup en tiempo real de `comprobantes` y `ventas`
- Retención de `auditoria_sunat` mínimo 5 años

---

**Versión:** 1.0
**Fecha:** 2025-10-13
