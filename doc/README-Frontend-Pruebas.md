# README Frontend - Pruebas con API de Ventas y Facturación

## 1) Autenticación (JWT)

- Endpoint de login
  - POST `/api/login`
  - Body ejemplo:
```json
{
  "email": "admin@demo.com",
  "password": "secret123"
}
```
- Respuesta esperada:
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": 1, "name": "Admin" }
}
```
- Header en todas las peticiones protegidas:
```
Authorization: Bearer <JWT>
Content-Type: application/json
Accept: application/json
```

Notas:
- El token expira según configuración del backend; renovar con login o refresh (si aplica).

## 2) CORS (Frontend local)

- Base recomendada de desarrollo:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:5173` (Vite) o `http://localhost:3000`
- Si encuentras errores CORS:
  - Verificar `config/cors.php` (origins permitidos)
  - Enviar cabeceras estándar y evitar credenciales salvo que sea necesario

## 3) Formato de errores estándar

- Respuesta de error sugerida (HTTP 4xx/5xx):
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Datos inválidos",
  "errors": {
    "campo": ["El campo es requerido"]
  }
}
```
- Autenticación inválida (401): redirigir a login.

## 4) Paginación y filtros (convención)

- Query params comunes: `page`, `per_page`, `search`, `fecha_inicio`, `fecha_fin`.
- Ejemplo: `GET /api/comprobantes?page=1&per_page=20&search=F001`
- Respuesta paginada típica de Laravel:
```json
{
  "data": [],
  "current_page": 1,
  "per_page": 20,
  "total": 120
}
```

## 5) Ejemplos con axios

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export function setAuthToken(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// Login y guardado de token
export async function login(email: string, password: string) {
  const { data } = await api.post('/login', { email, password });
  if (data?.token) setAuthToken(data.token);
  return data;
}

// Verificar configuración de facturación (BETA)
export async function verificarConfiguracion() {
  const { data } = await api.get('/facturacion/test/verificar-configuracion');
  return data;
}

// Estado SUNAT (BETA)
export async function estadoSunat() {
  const { data } = await api.get('/facturacion/test/estado-sunat');
  return data;
}

// Generar factura de prueba (BETA)
export async function generarFacturaPrueba() {
  const { data } = await api.get('/facturacion/test/generar-factura-prueba');
  return data;
}

// Descargar PDF/XML de comprobante
export async function descargarPdf(id: number) {
  const res = await api.get(`/comprobantes/${id}/pdf`, { responseType: 'blob' });
  return res.data;
}

export async function descargarXml(id: number) {
  const res = await api.get(`/comprobantes/${id}/xml`, { responseType: 'blob' });
  return res.data;
}
```

## 6) Ejemplos con fetch

```js
const BASE = 'http://localhost:8000/api';
let TOKEN = '';

export const setToken = t => (TOKEN = t);

const authHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data?.token) setToken(data.token);
  return data;
}

export async function verificarConfiguracion() {
  const res = await fetch(`${BASE}/facturacion/test/verificar-configuracion`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function estadoSunat() {
  const res = await fetch(`${BASE}/facturacion/test/estado-sunat`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function generarFacturaPrueba() {
  const res = await fetch(`${BASE}/facturacion/test/generar-factura-prueba`, {
    headers: authHeaders(),
  });
  return res.json();
}
```

## 7) Flujo sugerido de pruebas E2E (BETA)

1. Login y almacenar token JWT
2. GET `/facturacion/test/verificar-configuracion`
3. GET `/facturacion/test/estado-sunat`
4. GET `/facturacion/test/generar-factura-prueba`
5. Descargar PDF/XML del comprobante devuelto

## 8) Troubleshooting rápido

- 401: Token inválido/expirado → relogin
- 403: Falta de permisos → validar roles/permisos
- 422: Validación → revisar payloads y tipos
- 429: Rate limiting → reintentar con backoff
- 500: Revisar `storage/logs/laravel.log`

## 9) Referencias internas

- `doc/PRUEBAS_FACTURACION_BETA.md`
- `doc/GUIA-APIS-VENTAS-FACTURACION.md`
- `doc/README-API-FACTURACION-ENDPOINTS.md`
- `doc/API_FACTURACION_ELECTRONICA.md`
