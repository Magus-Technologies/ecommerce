# API de Exportaciones TXT - Documentación Completa

## 📋 Índice
- [Descripción General](#descripción-general)
- [Endpoints Disponibles](#endpoints-disponibles)
- [PLE SUNAT - Registro de Ventas](#ple-sunat---registro-de-ventas)
- [PLE SUNAT - Registro de Compras](#ple-sunat---registro-de-compras)
- [Reportes Simples](#reportes-simples)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Formatos de Archivo](#formatos-de-archivo)

---

## Descripción General

El sistema de exportación TXT permite generar archivos en formato texto plano compatibles con:
- **PLE (Programa de Libros Electrónicos)** de SUNAT
- **Reportes personalizados** para análisis y control interno

### Características

✅ Cumple con normativa SUNAT
✅ Formato 14.1 (Registro de Ventas e Ingresos)
✅ Formato 8.1 (Registro de Compras)
✅ Nomenclatura oficial de archivos
✅ Validación de datos
✅ Exportación de Kardex

---

## Endpoints Disponibles

### Base URL
```
/api/contabilidad/exportar/
```

### Autenticación
Todas las rutas requieren autenticación mediante token Bearer (Sanctum).

```http
Authorization: Bearer {token}
```

### Permisos Requeridos
- `contabilidad.reportes.ver`

---

## PLE SUNAT - Registro de Ventas

### Endpoint
```http
POST /api/contabilidad/exportar/ple/registro-ventas
```

### Descripción
Genera archivo TXT en formato PLE 14.1 para el Registro de Ventas e Ingresos según especificaciones de SUNAT.

### Request Body
```json
{
  "periodo": "202501",        // YYYYMM (Requerido)
  "ruc": "20123456789"        // RUC de 11 dígitos (Requerido)
}
```

### Validaciones
- `periodo`: String de 6 caracteres (YYYYMM)
- `ruc`: String de 11 dígitos numéricos

### Response
**Success (200)**
```
Content-Type: text/plain; charset=UTF-8
Content-Disposition: attachment; filename="LE20123456789202501000140100001111.txt"

[Contenido del archivo TXT]
```

**Error (422)**
```json
{
  "success": false,
  "message": "Datos de validación incorrectos",
  "errors": {
    "periodo": ["El campo periodo debe tener 6 caracteres."],
    "ruc": ["El campo ruc debe tener 11 caracteres."]
  }
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "Error al exportar registro de ventas",
  "error": "Mensaje de error detallado"
}
```

### Formato del Archivo

**Nombre del archivo:**
```
LE{RUC}{PERIODO}00{LIBRO}{CODIGO_OPORTUNIDAD}{INDICADOR_OPERACION}{CONTENIDO}{MONEDA}{INDICADOR_LIBRO}.txt
```

**Ejemplo:**
```
LE20123456789202501000140100001111.txt
```

Donde:
- `LE`: Libros Electrónicos
- `20123456789`: RUC del contribuyente
- `202501`: Período (Enero 2025)
- `00`: Código de oportunidad
- `1401`: Libro 14 (Registro de Ventas), versión 01
- `00`: Sin operaciones
- `001`: Indicador de operación
- `1`: Moneda nacional (PEN)
- `1`: Indicador estado
- `1`: Indicador contenido

**Estructura de cada línea (41 campos separados por |):**

```
Campo 1|Campo 2|...|Campo 41|
```

#### Campos del Formato 14.1

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| 1 | Período + 00 | 20250100 |
| 2 | Correlativo único (CUO) | 0000000001 |
| 3 | Correlativo asiento (M+9 dígitos) | M000000001 |
| 4 | Fecha emisión (DD/MM/YYYY) | 15/01/2025 |
| 5 | Fecha vencimiento (DD/MM/YYYY) | 15/01/2025 |
| 6 | Tipo comprobante (01,03,07,08) | 03 |
| 7 | Serie | B001 |
| 8 | Número del comprobante | 00000123 |
| 9 | Número final (si es rango) | |
| 10 | Tipo documento cliente | 6 |
| 11 | Número documento cliente | 20123456789 |
| 12 | Apellidos y nombres/Razón social | EMPRESA EJEMPLO SAC |
| 13 | Valor facturado exportación | 0.00 |
| 14 | Base imponible operaciones gravadas | 1000.00 |
| 15 | Descuento base imponible | 0.00 |
| 16 | IGV | 180.00 |
| 17 | Descuento IGV | 0.00 |
| 18 | Importe exonerado | 0.00 |
| 19 | Importe inafecto | 0.00 |
| 20 | ISC | 0.00 |
| 21 | Base imponible arroz pilado | 0.00 |
| 22 | Impuesto arroz pilado | 0.00 |
| 23 | ICBPER (Impuesto bolsas plásticas) | 0.00 |
| 24 | Otros cargos | 0.00 |
| 25 | Importe total | 1180.00 |
| 26 | Código de moneda (PEN/USD) | PEN |
| 27 | Tipo de cambio | 1.000 |
| 28 | Fecha emisión doc. modificado | |
| 29 | Tipo doc. modificado | |
| 30 | Serie doc. modificado | |
| 31 | Número doc. modificado | |
| 32 | Identificación contrato | |
| 33 | Error tipo 1 | |
| 34 | Indicador comprobante cancelación | 1 |
| 35 | Estado (0=Activo, 1=Anulado) | 0 |
| 36-41 | Campos adicionales | |

### Ejemplo de Línea
```
20250100|0000000001|M000000001|15/01/2025|15/01/2025|03|B001|00000123||6|20123456789|EMPRESA EJEMPLO SAC|0.00|1000.00|0.00|180.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|1180.00|PEN|1.000||||||||1|0|||||||
```

---

## PLE SUNAT - Registro de Compras

### Endpoint
```http
POST /api/contabilidad/exportar/ple/registro-compras
```

### Descripción
Genera archivo TXT en formato PLE 8.1 para el Registro de Compras según especificaciones de SUNAT.

### Request Body
```json
{
  "periodo": "202501",        // YYYYMM (Requerido)
  "ruc": "20123456789"        // RUC de 11 dígitos (Requerido)
}
```

### Response
**Success (200)**
```
Content-Type: text/plain; charset=UTF-8
Content-Disposition: attachment; filename="LE20123456789202501000080100001111.txt"

[Contenido del archivo TXT]
```

### Formato del Archivo

**Nombre:**
```
LE20123456789202501000080100001111.txt
```

**Estructura:** 40+ campos separados por `|`

---

## Reportes Simples

### 1. Reporte de Ventas en TXT

#### Endpoint
```http
GET /api/contabilidad/exportar/ventas/txt?fecha_inicio={fecha}&fecha_fin={fecha}
```

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| fecha_inicio | date | No | Fecha inicio (YYYY-MM-DD). Default: Primer día del mes actual |
| fecha_fin | date | No | Fecha fin (YYYY-MM-DD). Default: Fecha actual |

#### Ejemplo Request
```http
GET /api/contabilidad/exportar/ventas/txt?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
```

#### Response
```
Content-Type: text/plain; charset=UTF-8
Content-Disposition: attachment; filename="reporte-ventas-2025-01-01-2025-01-31.txt"
```

#### Formato del Archivo
```
REPORTE DE VENTAS
Período: 2025-01-01 al 2025-01-31
========================================================================================================================

FECHA        NÚMERO               CLIENTE                                  SUBTOTAL        TOTAL
------------------------------------------------------------------------------------------------------------------------
15/01/2025   V-00001              EMPRESA EJEMPLO SAC                      S/ 1,000.00     S/ 1,180.00
16/01/2025   V-00002              CLIENTE NATURAL                          S/ 500.00       S/ 590.00
------------------------------------------------------------------------------------------------------------------------
                                   TOTAL GENERAL:                                          S/ 1,770.00

Total de ventas: 2
Generado: 15/01/2025 14:30:00
```

---

### 2. Kardex en TXT

#### Endpoint
```http
GET /api/contabilidad/exportar/kardex/{productoId}/txt?fecha_inicio={fecha}&fecha_fin={fecha}
```

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| productoId | integer | ID del producto |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| fecha_inicio | date | No | Fecha inicio filtro |
| fecha_fin | date | No | Fecha fin filtro |

#### Ejemplo Request
```http
GET /api/contabilidad/exportar/kardex/15/txt?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
```

#### Response
```
Content-Type: text/plain; charset=UTF-8
Content-Disposition: attachment; filename="kardex-PROD001.txt"
```

#### Formato del Archivo
```
KARDEX DE PRODUCTO
Producto: LAPTOP HP PAVILION
Código: PROD001
======================================================================================================================================================

FECHA        TIPO MOV        TIPO OPER            DOCUMENTO             CANTIDAD  COSTO UNIT  COSTO TOTAL   STOCK ANT   STOCK ACT  COSTO PROM
------------------------------------------------------------------------------------------------------------------------------------------------------
01/01/2025   ENTRADA         COMPRA               C001-00001                10.00     1500.00    15000.00         0.00       10.00     1500.00
05/01/2025   SALIDA          VENTA                B001-00123                -2.00     1500.00    -3000.00        10.00        8.00     1500.00
------------------------------------------------------------------------------------------------------------------------------------------------------
Total de movimientos: 2
Generado: 15/01/2025 14:30:00
```

---

## Ejemplos de Uso

### Ejemplo 1: Exportar Registro de Ventas con cURL

```bash
curl -X POST \
  'https://api.ejemplo.com/api/contabilidad/exportar/ple/registro-ventas' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "periodo": "202501",
    "ruc": "20123456789"
  }' \
  --output registro-ventas-202501.txt
```

### Ejemplo 2: Exportar Reporte de Ventas con JavaScript

```javascript
const exportarVentas = async () => {
  const response = await fetch(
    '/api/contabilidad/exportar/ventas/txt?fecha_inicio=2025-01-01&fecha_fin=2025-01-31',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-ventas.txt';
  a.click();
};
```

### Ejemplo 3: Exportar Kardex con PHP

```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.ejemplo.com/api/contabilidad/exportar/kardex/15/txt');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$content = curl_exec($ch);
file_put_contents('kardex-producto-15.txt', $content);
curl_close($ch);
```

---

## Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| 401 | No autenticado | Verificar token de autenticación |
| 403 | Sin permisos | Verificar permisos `contabilidad.reportes.ver` |
| 422 | Validación fallida | Revisar formato de período y RUC |
| 500 | Error del servidor | Revisar logs del servidor |

---

## Notas Importantes

### Formatos SUNAT

1. **Período**: Siempre en formato `YYYYMM` (6 dígitos)
2. **RUC**: Exactamente 11 dígitos numéricos
3. **Fechas**: Formato `DD/MM/YYYY` en el contenido del archivo
4. **Decimales**: Siempre 2 decimales con punto (.)
5. **Separador**: Pipe `|` entre campos
6. **Encoding**: UTF-8

### Recomendaciones

- ✅ Generar archivos mensualmente
- ✅ Validar datos antes de enviar a SUNAT
- ✅ Guardar copia de archivos generados
- ✅ Verificar estados de comprobantes (ACEPTADO/ANULADO)
- ✅ Revisar totales antes de presentar

### Limitaciones

- Máximo 10,000 registros por archivo (recomendado)
- Archivos mayores a 50MB deben dividirse
- Solo se incluyen comprobantes con estado ACEPTADO o ANULADO

---

## Soporte

Para consultas técnicas o reportar errores:
- Email: soporte@ejemplo.com
- Documentación SUNAT: https://www.sunat.gob.pe/legislacion/ple/

---

**Última actualización:** 2025-01-20
**Versión:** 1.0.0
