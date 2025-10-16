# 🧪 Guía de Pruebas - Facturación Electrónica BETA

## ✅ Configuración Completada

Tu sistema ya está configurado para hacer pruebas con SUNAT en ambiente BETA (pruebas).

### 📋 Checklist de Configuración

- ✅ Variables de entorno configuradas (.env)
- ✅ Certificado digital de pruebas creado
- ✅ Credenciales SUNAT BETA (usuario público)
- ✅ Endpoints de prueba creados
- ⚠️ **PENDIENTE**: Logo de empresa (opcional)

---

## 🔐 Credenciales de Prueba SUNAT

Las siguientes credenciales son **públicas** y proporcionadas por SUNAT para pruebas:

```
RUC: 20000000001
Usuario SOL: 20000000001MODDATOS
Contraseña SOL: MODDATOS
```

Estas credenciales ya están configuradas en tu archivo `.env`.

---

## 🚀 Endpoints de Prueba

### 1. Verificar Configuración
```
GET http://localhost:8000/api/facturacion/test/verificar-configuracion
```

**Respuesta esperada:**
```json
{
  "success": true,
  "configuracion": {
    "modo": "BETA",
    "usuario_sunat": "20000000001MODDATOS",
    "certificado_existe": true,
    "ruc_empresa": "20000000001",
    "logo_existe": false
  },
  "errores": [],
  "message": "Configuración correcta para facturación electrónica"
}
```

### 2. Verificar Estado de SUNAT
```
GET http://localhost:8000/api/facturacion/test/estado-sunat
```

**Respuesta esperada:**
```json
{
  "success": true,
  "modo": "BETA",
  "url_servicio": "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService",
  "message": "Configurado para ambiente de BETA",
  "nota": "Estás en BETA - Las facturas NO son reales"
}
```

### 3. Generar Factura de Prueba
```
GET http://localhost:8000/api/facturacion/test/generar-factura-prueba
```

Este endpoint:
1. Crea automáticamente un cliente de prueba
2. Crea un producto de prueba
3. Genera una factura
4. La envía a SUNAT BETA
5. Genera PDF y XML

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "¡Factura de prueba generada y enviada a SUNAT BETA exitosamente!",
  "data": {
    "comprobante_id": 1,
    "numero_completo": "F001-00000001",
    "cliente": "EMPRESA DE PRUEBAS S.A.C.",
    "total": "S/ 1,000.00",
    "estado": "ACEPTADO",
    "mensaje_sunat": "La Factura ... fue aceptada",
    "tiene_pdf": true,
    "tiene_xml": true,
    "tiene_cdr": true,
    "urls": {
      "ver_comprobante": "http://localhost:8000/api/comprobantes/1",
      "descargar_pdf": "http://localhost:8000/api/comprobantes/1/pdf",
      "descargar_xml": "http://localhost:8000/api/comprobantes/1/xml"
    }
  }
}
```

---

## 📝 Pruebas con Postman/Insomnia

### Paso 1: Verificar Configuración
1. Abre Postman o Insomnia
2. Crea una petición GET a: `http://localhost:8000/api/facturacion/test/verificar-configuracion`
3. Verifica que no haya errores

### Paso 2: Generar Factura de Prueba
1. Crea una petición GET a: `http://localhost:8000/api/facturacion/test/generar-factura-prueba`
2. Ejecuta la petición
3. Si todo está bien, recibirás una factura aceptada por SUNAT

### Paso 3: Descargar PDF/XML
1. Usa las URLs que te devolvió el paso anterior
2. Descarga el PDF: `GET http://localhost:8000/api/comprobantes/{id}/pdf`
3. Descarga el XML: `GET http://localhost:8000/api/comprobantes/{id}/xml`

---

## 🖼️ Logo de Empresa (Opcional)

Para que los PDFs tengan tu logo:

1. Coloca tu logo en: `public/logo-empresa.png`
2. El logo debe ser PNG con fondo transparente
3. Tamaño recomendado: 200x80 píxeles máximo

Si no agregas logo, el sistema funcionará igual pero el PDF no tendrá logo.

---

## 🐛 Solución de Problemas

### Error: "Certificado no encontrado"
**Solución:** Verifica que existe el archivo `certificates/certificate.pem`

### Error: "Usuario SOL inválido"
**Solución:** Verifica que en `.env` tengas:
```
GREENTER_FE_USER=20000000001MODDATOS
GREENTER_FE_PASSWORD=MODDATOS
```

### Error: "No se pudo conectar con SUNAT"
**Solución:**
1. Verifica tu conexión a Internet
2. SUNAT BETA a veces está fuera de línea, intenta más tarde

### Error al generar PDF: "Logo not found"
**Solución:** Este es solo un WARNING, el PDF se genera igual sin logo.

---

## 📊 Escenarios de Prueba

### Prueba 1: Factura Simple ✅
```
GET /api/facturacion/test/generar-factura-prueba
```
Genera una factura de S/ 1,000.00 con 1 producto

### Prueba 2: Factura Manual
```
POST /api/facturas
Content-Type: application/json

{
  "cliente_id": 1,
  "tipo_comprobante": "01",
  "serie_id": 1,
  "fecha_emision": "2025-10-15",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 500.00,
      "descuento": 0
    }
  ]
}
```

### Prueba 3: Facturación Automática de Compra Online
1. Crea una compra desde el e-commerce
2. Marca `requiere_factura: true`
3. Procesa el pago
4. El sistema automáticamente generará la factura

---

## 🔄 Cambiar a Producción

Cuando estés listo para usar SUNAT real:

1. Obtén tus credenciales SOL reales de SUNAT
2. Obtén tu certificado digital (.pfx)
3. Modifica `.env`:
   ```
   GREENTER_MODE=PRODUCCION
   GREENTER_FE_USER=tu_ruc_real_usuario
   GREENTER_FE_PASSWORD=tu_password_real
   GREENTER_CERT_PATH=certificates/tu_certificado_real.pem
   COMPANY_RUC=tu_ruc_real
   ```

⚠️ **ADVERTENCIA:** En producción, las facturas son REALES y tienen valor legal.

---

## 📞 Soporte

Si tienes problemas con las pruebas:
1. Revisa los logs: `storage/logs/laravel.log`
2. Verifica la tabla `error_logs` en la base de datos
3. Consulta la documentación de Greenter: https://greenter.dev

---

## ✅ Checklist de Pruebas

- [ ] Verificar configuración
- [ ] Verificar estado SUNAT
- [ ] Generar factura de prueba automática
- [ ] Descargar PDF
- [ ] Descargar XML
- [ ] Descargar CDR (Constancia de Recepción)
- [ ] Crear factura manual
- [ ] Facturación automática de compra online
- [ ] Enviar comprobante por email

---

**¡Listo para probar!** 🎉

Comienza con el endpoint de verificación de configuración y luego genera tu primera factura de prueba.
