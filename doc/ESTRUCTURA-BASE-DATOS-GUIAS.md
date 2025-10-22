# 🗄️ Estructura de Base de Datos - Guías de Remisión

## 📋 Información General

Este documento describe la estructura completa de las tablas de base de datos para el módulo de guías de remisión, incluyendo relaciones, índices, constraints y ejemplos de datos.

## 🏗️ Tablas Implementadas

### **1. Tabla: `guias_remision`**

**Descripción:** Tabla principal que almacena la información de las guías de remisión electrónicas.

#### **Estructura de Campos**

| **Campo** | **Tipo** | **Restricciones** | **Descripción** |
|-----------|----------|-------------------|-----------------|
| `id` | `bigint` | PK, AUTO_INCREMENT | Identificador único |
| `tipo_comprobante` | `varchar(2)` | NOT NULL, DEFAULT '09' | Tipo de comprobante (09 = Guía) |
| `serie` | `varchar(4)` | NOT NULL | Serie de la guía (ej: T001) |
| `correlativo` | `int` | NOT NULL | Número correlativo |
| `fecha_emision` | `date` | NOT NULL | Fecha de emisión |
| `fecha_inicio_traslado` | `date` | NOT NULL | Fecha inicio del traslado |
| `cliente_id` | `bigint` | FK, NOT NULL | ID del cliente (remitente) |
| `cliente_tipo_documento` | `varchar(1)` | NOT NULL | Tipo doc cliente (1=DNI, 6=RUC) |
| `cliente_numero_documento` | `varchar(20)` | NOT NULL | Número de documento cliente |
| `cliente_razon_social` | `varchar(200)` | NOT NULL | Razón social del cliente |
| `cliente_direccion` | `varchar(200)` | NOT NULL | Dirección del cliente |
| `destinatario_tipo_documento` | `varchar(1)` | NOT NULL | Tipo doc destinatario |
| `destinatario_numero_documento` | `varchar(20)` | NOT NULL | Número documento destinatario |
| `destinatario_razon_social` | `varchar(200)` | NOT NULL | Razón social destinatario |
| `destinatario_direccion` | `varchar(200)` | NOT NULL | Dirección destinatario |
| `destinatario_ubigeo` | `varchar(6)` | NOT NULL | Ubigeo destinatario |
| `motivo_traslado` | `varchar(2)` | NOT NULL | Motivo del traslado |
| `modalidad_traslado` | `varchar(2)` | NOT NULL | Modalidad del traslado |
| `peso_total` | `decimal(10,2)` | DEFAULT 0 | Peso total en kg |
| `numero_bultos` | `int` | DEFAULT 1 | Número de bultos |
| `modo_transporte` | `varchar(2)` | DEFAULT '01' | Modo de transporte |
| `numero_placa` | `varchar(20)` | NULL | Número de placa del vehículo |
| `numero_licencia` | `varchar(20)` | NULL | Número de licencia |
| `conductor_dni` | `varchar(8)` | NULL | DNI del conductor |
| `conductor_nombres` | `varchar(200)` | NULL | Nombres del conductor |
| `punto_partida_ubigeo` | `varchar(6)` | NOT NULL | Ubigeo punto de partida |
| `punto_partida_direccion` | `varchar(200)` | NOT NULL | Dirección punto de partida |
| `punto_llegada_ubigeo` | `varchar(6)` | NOT NULL | Ubigeo punto de llegada |
| `punto_llegada_direccion` | `varchar(200)` | NOT NULL | Dirección punto de llegada |
| `observaciones` | `text` | NULL | Observaciones adicionales |
| `estado` | `varchar(20)` | DEFAULT 'PENDIENTE' | Estado de la guía |
| `xml_firmado` | `longtext` | NULL | XML firmado |
| `xml_respuesta_sunat` | `longtext` | NULL | XML respuesta de SUNAT |
| `mensaje_sunat` | `text` | NULL | Mensaje de SUNAT |
| `codigo_hash` | `varchar(100)` | NULL | Código hash del documento |
| `numero_ticket` | `varchar(50)` | NULL | Número de ticket SUNAT |
| `fecha_aceptacion` | `timestamp` | NULL | Fecha de aceptación |
| `errores_sunat` | `text` | NULL | Errores de SUNAT |
| `user_id` | `bigint` | FK, NOT NULL | ID del usuario que creó |
| `created_at` | `timestamp` | NULL | Fecha de creación |
| `updated_at` | `timestamp` | NULL | Fecha de actualización |

#### **Índices y Constraints**

```sql
-- Clave primaria
PRIMARY KEY (`id`)

-- Clave foránea a clientes
FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE

-- Clave foránea a usuarios
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

-- Índices para optimización
INDEX `idx_guias_serie_correlativo` (`serie`, `correlativo`)
INDEX `idx_guias_fecha_emision` (`fecha_emision`)
INDEX `idx_guias_estado` (`estado`)
INDEX `idx_guias_cliente` (`cliente_id`)

-- Constraint único para serie-correlativo
UNIQUE KEY `unique_serie_correlativo_guia` (`serie`, `correlativo`)
```

---

### **2. Tabla: `guias_remision_detalle`**

**Descripción:** Tabla que almacena los detalles de productos en cada guía de remisión.

#### **Estructura de Campos**

| **Campo** | **Tipo** | **Restricciones** | **Descripción** |
|-----------|----------|-------------------|-----------------|
| `id` | `bigint` | PK, AUTO_INCREMENT | Identificador único |
| `guia_remision_id` | `bigint` | FK, NOT NULL | ID de la guía de remisión |
| `item` | `int` | NOT NULL | Número de item |
| `producto_id` | `bigint` | FK, NOT NULL | ID del producto |
| `codigo_producto` | `varchar(50)` | NOT NULL | Código del producto |
| `descripcion` | `varchar(200)` | NOT NULL | Descripción del producto |
| `unidad_medida` | `varchar(3)` | DEFAULT 'KGM' | Unidad de medida |
| `cantidad` | `decimal(10,2)` | NOT NULL | Cantidad del producto |
| `peso_unitario` | `decimal(10,2)` | NOT NULL | Peso unitario en kg |
| `peso_total` | `decimal(10,2)` | NOT NULL | Peso total del item |
| `observaciones` | `text` | NULL | Observaciones del item |
| `created_at` | `timestamp` | NULL | Fecha de creación |
| `updated_at` | `timestamp` | NULL | Fecha de actualización |

#### **Índices y Constraints**

```sql
-- Clave primaria
PRIMARY KEY (`id`)

-- Clave foránea a guías de remisión
FOREIGN KEY (`guia_remision_id`) REFERENCES `guias_remision` (`id`) ON DELETE CASCADE

-- Clave foránea a productos
FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE

-- Índices para optimización
INDEX `idx_detalle_guia` (`guia_remision_id`)
INDEX `idx_detalle_producto` (`producto_id`)
INDEX `idx_detalle_item` (`item`)
```

---

## 📊 Códigos y Valores Permitidos

### **Tipos de Documento**
| **Código** | **Descripción** |
|------------|-----------------|
| `1` | DNI |
| `4` | Carnet de Extranjería |
| `6` | RUC |
| `7` | Pasaporte |
| `A` | Cédula Diplomática |

### **Motivos de Traslado**
| **Código** | **Descripción** |
|------------|-----------------|
| `01` | Venta |
| `02` | Compra |
| `04` | Traslado entre establecimientos |
| `08` | Importación |
| `09` | Exportación |
| `13` | Otros |

### **Modalidades de Traslado**
| **Código** | **Descripción** |
|------------|-----------------|
| `01` | Venta |
| `02` | Compra |
| `04` | Traslado entre establecimientos |
| `08` | Importación |
| `09` | Exportación |
| `13` | Otros |

### **Modos de Transporte**
| **Código** | **Descripción** |
|------------|-----------------|
| `01` | Transporte público |
| `02` | Transporte privado |

### **Unidades de Medida**
| **Código** | **Descripción** |
|------------|-----------------|
| `KGM` | Kilogramo |
| `GRM` | Gramo |
| `LTR` | Litro |
| `MTK` | Metro cuadrado |
| `MTR` | Metro |
| `NIU` | Unidad |
| `PK` | Paquete |
| `BX` | Caja |
| `BG` | Bolsa |
| `SET` | Juego |

### **Estados de Guía**
| **Estado** | **Descripción** |
|------------|-----------------|
| `PENDIENTE` | Creada, no enviada |
| `ENVIADO` | Enviada a SUNAT |
| `ACEPTADO` | Aceptada por SUNAT |
| `RECHAZADO` | Rechazada por SUNAT |
| `ANULADO` | Anulada |

---

## 🔗 Relaciones de Base de Datos

### **Diagrama de Relaciones**

```
clientes (1) -----> (N) guias_remision
    |
    +-- id (PK)
    +-- razon_social
    +-- numero_documento

guias_remision (1) -----> (N) guias_remision_detalle
    |
    +-- id (PK)
    +-- serie
    +-- correlativo
    +-- estado

productos (1) -----> (N) guias_remision_detalle
    |
    +-- id (PK)
    +-- nombre
    +-- codigo_producto

users (1) -----> (N) guias_remision
    |
    +-- id (PK)
    +-- name
    +-- email

series_comprobantes (1) -----> (N) guias_remision
    |
    +-- tipo_comprobante = '09'
    +-- serie
    +-- correlativo
```

### **Relaciones en Eloquent**

```php
// Modelo GuiaRemision
class GuiaRemision extends Model
{
    // Relación con cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    // Relación con detalles
    public function detalles()
    {
        return $this->hasMany(GuiaRemisionDetalle::class);
    }

    // Relación con usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

// Modelo GuiaRemisionDetalle
class GuiaRemisionDetalle extends Model
{
    // Relación con guía de remisión
    public function guiaRemision()
    {
        return $this->belongsTo(GuiaRemision::class);
    }

    // Relación con producto
    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
```

---

## 📝 Ejemplos de Datos

### **Inserción de Guía de Remisión**

```sql
INSERT INTO guias_remision (
    tipo_comprobante, serie, correlativo, fecha_emision, fecha_inicio_traslado,
    cliente_id, cliente_tipo_documento, cliente_numero_documento, cliente_razon_social, cliente_direccion,
    destinatario_tipo_documento, destinatario_numero_documento, destinatario_razon_social, destinatario_direccion, destinatario_ubigeo,
    motivo_traslado, modalidad_traslado, peso_total, numero_bultos, modo_transporte,
    numero_placa, conductor_dni, conductor_nombres,
    punto_partida_ubigeo, punto_partida_direccion, punto_llegada_ubigeo, punto_llegada_direccion,
    observaciones, estado, user_id, created_at, updated_at
) VALUES (
    '09', 'T001', 1, '2024-01-15', '2024-01-15',
    1, '6', '20000000001', 'EMPRESA DE PRUEBAS S.A.C.', 'AV. FICTICIA 123, LIMA',
    '1', '12345678', 'DESTINATARIO S.A.C.', 'AV. PRINCIPAL 456, LIMA', '150101',
    '01', '01', 10.00, 1, '01',
    'ABC-123', '87654321', 'JUAN PEREZ GARCIA',
    '150101', 'AV. ORIGEN 789, LIMA', '150101', 'AV. DESTINO 012, LIMA',
    'Mercadería frágil', 'PENDIENTE', 1, NOW(), NOW()
);
```

### **Inserción de Detalle de Guía**

```sql
INSERT INTO guias_remision_detalle (
    guia_remision_id, item, producto_id, codigo_producto, descripcion,
    unidad_medida, cantidad, peso_unitario, peso_total, observaciones,
    created_at, updated_at
) VALUES (
    1, 1, 1, 'PROD-001', 'PRODUCTO DE PRUEBA',
    'KGM', 5.00, 2.00, 10.00, 'Producto frágil',
    NOW(), NOW()
);
```

---

## 🔍 Consultas Útiles

### **Consultas de Reporte**

```sql
-- Guías por estado
SELECT estado, COUNT(*) as total
FROM guias_remision
GROUP BY estado;

-- Guías por cliente
SELECT 
    c.razon_social,
    COUNT(g.id) as total_guias,
    SUM(g.peso_total) as peso_total
FROM guias_remision g
JOIN clientes c ON g.cliente_id = c.id
GROUP BY c.id, c.razon_social
ORDER BY total_guias DESC;

-- Guías por mes
SELECT 
    DATE_FORMAT(fecha_emision, '%Y-%m') as mes,
    COUNT(*) as total_guias,
    SUM(peso_total) as peso_total
FROM guias_remision
WHERE fecha_emision >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha_emision, '%Y-%m')
ORDER BY mes DESC;

-- Top productos transportados
SELECT 
    p.nombre,
    p.codigo_producto,
    COUNT(d.id) as veces_transportado,
    SUM(d.cantidad) as cantidad_total,
    SUM(d.peso_total) as peso_total
FROM guias_remision_detalle d
JOIN productos p ON d.producto_id = p.id
JOIN guias_remision g ON d.guia_remision_id = g.id
WHERE g.estado = 'ACEPTADO'
GROUP BY p.id, p.nombre, p.codigo_producto
ORDER BY veces_transportado DESC
LIMIT 10;
```

### **Consultas de Validación**

```sql
-- Guías sin detalles
SELECT g.id, g.serie, g.correlativo
FROM guias_remision g
LEFT JOIN guias_remision_detalle d ON g.id = d.guia_remision_id
WHERE d.id IS NULL;

-- Guías con peso total incorrecto
SELECT 
    g.id, g.serie, g.correlativo, g.peso_total as peso_guia,
    SUM(d.peso_total) as peso_calculado
FROM guias_remision g
JOIN guias_remision_detalle d ON g.id = d.guia_remision_id
GROUP BY g.id, g.serie, g.correlativo, g.peso_total
HAVING peso_guia != peso_calculado;

-- Guías pendientes por más de 24 horas
SELECT id, serie, correlativo, created_at
FROM guias_remision
WHERE estado = 'PENDIENTE'
AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

---

## 🛠️ Mantenimiento de Base de Datos

### **Limpieza de Datos**

```sql
-- Eliminar guías de prueba antiguas
DELETE FROM guias_remision_detalle 
WHERE guia_remision_id IN (
    SELECT id FROM guias_remision 
    WHERE serie = 'T001' 
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
);

DELETE FROM guias_remision 
WHERE serie = 'T001' 
AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Limpiar XMLs antiguos (mantener solo los últimos 6 meses)
UPDATE guias_remision 
SET xml_firmado = NULL, xml_respuesta_sunat = NULL
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
AND estado IN ('RECHAZADO', 'ANULADO');
```

### **Optimización de Índices**

```sql
-- Analizar uso de índices
SHOW INDEX FROM guias_remision;
SHOW INDEX FROM guias_remision_detalle;

-- Estadísticas de tablas
ANALYZE TABLE guias_remision;
ANALYZE TABLE guias_remision_detalle;

-- Optimizar tablas
OPTIMIZE TABLE guias_remision;
OPTIMIZE TABLE guias_remision_detalle;
```

### **Backup y Restauración**

```bash
# Backup de tablas de guías
mysqldump -u usuario -p database_name guias_remision guias_remision_detalle > guias_backup.sql

# Restaurar desde backup
mysql -u usuario -p database_name < guias_backup.sql

# Backup solo de estructura
mysqldump -u usuario -p --no-data database_name guias_remision guias_remision_detalle > guias_structure.sql
```

---

## 📊 Métricas y Monitoreo

### **Consultas de Monitoreo**

```sql
-- Tamaño de las tablas
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name IN ('guias_remision', 'guias_remision_detalle');

-- Crecimiento mensual
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as mes,
    COUNT(*) as nuevas_guias,
    SUM(peso_total) as peso_total_mes
FROM guias_remision
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY mes DESC;

-- Eficiencia de envíos a SUNAT
SELECT 
    estado,
    COUNT(*) as total,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM guias_remision)), 2) as porcentaje
FROM guias_remision
GROUP BY estado;
```

---

## ✅ Checklist de Implementación

### **Verificación de Estructura**
- [ ] Tabla `guias_remision` creada correctamente
- [ ] Tabla `guias_remision_detalle` creada correctamente
- [ ] Todas las foreign keys configuradas
- [ ] Índices creados para optimización
- [ ] Constraints únicos aplicados
- [ ] Valores por defecto configurados

### **Verificación de Datos**
- [ ] Serie T001 creada en `series_comprobantes`
- [ ] Datos de prueba insertados correctamente
- [ ] Relaciones funcionando correctamente
- [ ] Validaciones de integridad funcionando

### **Verificación de Rendimiento**
- [ ] Índices optimizando consultas
- [ ] Consultas complejas ejecutándose eficientemente
- [ ] No hay locks o deadlocks
- [ ] Tamaño de tablas dentro de límites esperados

---

*Documentación de base de datos actualizada el: 17 de Enero, 2025*
*Versión: 1.0*
