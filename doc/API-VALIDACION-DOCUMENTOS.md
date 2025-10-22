# API de Validación de Documentos - Documentación

## Descripción General

Sistema de validación en línea de RUC y DNI mediante consulta a SUNAT/RENIEC. Incluye cache para optimizar consultas.

---

## Endpoints Disponibles

### Base URL: `/api/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/validar-ruc` | Validar RUC en SUNAT |
| POST | `/validar-dni` | Validar DNI en RENIEC |
| POST | `/validar-documento` | Auto-detectar tipo |
| POST | `/validar-documentos-lote` | Validar múltiples |

---

## Validar RUC

### Endpoint
```http
POST /api/validar-ruc
```

### Request
```json
{
  "ruc": "20123456789"
}
```

### Response Success
```json
{
  "success": true,
  "ruc": "20123456789",
  "razon_social": "EMPRESA EJEMPLO SAC",
  "nombre_comercial": "EJEMPLO",
  "tipo": "SOCIEDAD ANONIMA CERRADA",
  "estado": "ACTIVO",
  "condicion": "HABIDO",
  "direccion": "AV. EJEMPLO 123",
  "departamento": "LIMA",
  "provincia": "LIMA",
  "distrito": "MIRAFLORES",
  "ubigeo": "150122"
}
```

---

## Validar DNI

### Endpoint
```http
POST /api/validar-dni
```

### Request
```json
{
  "dni": "12345678"
}
```

### Response
```json
{
  "success": true,
  "dni": "12345678",
  "nombres": "JUAN CARLOS",
  "apellido_paterno": "PEREZ",
  "apellido_materno": "GARCIA",
  "nombre_completo": "JUAN CARLOS PEREZ GARCIA"
}
```

---

## Validar Documento (Auto-Detect)

### Endpoint
```http
POST /api/validar-documento
```

### Request
```json
{
  "documento": "20123456789"  // RUC o DNI
}
```

Detecta automáticamente si es RUC (11 dígitos) o DNI (8 dígitos).

---

## Validar Lote

### Endpoint
```http
POST /api/validar-documentos-lote
```

### Request
```json
{
  "documentos": [
    {
      "tipo": "ruc",
      "numero": "20123456789"
    },
    {
      "tipo": "dni",
      "numero": "12345678"
    },
    {
      "tipo": "auto",
      "numero": "20987654321"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "resultados": [
    {
      "success": true,
      "ruc": "20123456789",
      "razon_social": "EMPRESA 1 SAC"
    },
    {
      "success": true,
      "dni": "12345678",
      "nombre_completo": "JUAN PEREZ"
    },
    {
      "success": false,
      "error": "RUC no encontrado"
    }
  ]
}
```

---

## Configuración

### Variables de Entorno (.env)

```env
# Opción 1: apis.net.pe (Recomendado)
APIS_NET_PE_TOKEN=your_token_here

# Opción 2: apisperu.com
APIS_PERU_TOKEN=your_token_here
```

### Proveedores Soportados

1. **apis.net.pe** (Recomendado)
   - RUC y DNI
   - Respuesta rápida
   - Cache incluido

2. **apisperu.com** (Alternativo)
   - RUC y DNI
   - Fallback automático

3. **SUNAT Directo** (Última opción)
   - Solo RUC
   - Scraping HTML
   - Menos confiable

---

## Cache

- **RUC**: 24 horas
- **DNI**: 7 días
- **Llave**: `{tipo}_{numero}`

### Limpiar Cache

Endpoint disponible en desarrollo:
```http
POST /api/validar-documentos/limpiar-cache
```

Request:
```json
{
  "tipo": "ruc",
  "numero": "20123456789"
}
```

---

## Ejemplos de Uso

### JavaScript/Axios
```javascript
const validarRuc = async (ruc) => {
  const response = await axios.post('/api/validar-ruc', { ruc });
  console.log(response.data.razon_social);
};
```

### PHP
```php
$response = Http::post('https://api.ejemplo.com/api/validar-dni', [
    'dni' => '12345678'
]);

$nombre = $response->json()['nombre_completo'];
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 422 | Formato inválido |
| 404 | Documento no encontrado |
| 500 | Error de API externa |

---

**Última actualización:** 2025-01-20
