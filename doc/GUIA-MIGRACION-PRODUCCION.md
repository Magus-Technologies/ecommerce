# 🚀 GUÍA PASO A PASO: MIGRACIÓN A PRODUCCIÓN SUNAT

**Objetivo:** Migrar el sistema de facturación electrónica del entorno BETA a PRODUCCIÓN

---

## 📋 PREREQUISITOS

Antes de comenzar, asegúrate de tener:

- [ ] Certificado digital real (.pfx o .p12)
- [ ] Credenciales SOL de tu empresa
- [ ] RUC de la empresa
- [ ] Datos fiscales completos (dirección, ubigeo, etc.)
- [ ] Backup de la base de datos actual
- [ ] Acceso al servidor de producción

---

## 🔐 PASO 1: OBTENER CERTIFICADO DIGITAL

### Opción A: Certificado de Entidad Certificadora

1. **Solicitar certificado a una entidad autorizada:**
   - eCert Perú: https://www.ecert.pe/
   - Reniec: https://www.reniec.gob.pe/
   - Otras entidades autorizadas por SUNAT

2. **Requisitos comunes:**
   - RUC de la empresa
   - DNI del representante legal
   - Poder vigente (si aplica)
   - Pago del certificado (varía según entidad)

3. **Tiempo de emisión:** 1-3 días hábiles

### Opción B: Certificado Autofirmado (Solo para pruebas internas)

⚠️ **NO VÁLIDO PARA PRODUCCIÓN SUNAT**

```bash
# Generar certificado autofirmado (solo desarrollo)
openssl req -x509 -newkey rsa:2048 -keyout private.key -out certificate.crt -days 365 -nodes
```

### Convertir Certificado a Formato PEM

Si tu certificado está en formato .pfx:

```bash
# Extraer certificado
openssl pkcs12 -in certificado.pfx -clcerts -nokeys -out certificate.crt

# Extraer clave privada
openssl pkcs12 -in certificado.pfx -nocerts -nodes -out private.key

# Combinar en un solo archivo PEM
type certificate.crt private.key > certificate.pem
```

### Colocar Certificado en el Servidor

```bash
# Copiar a la ubicación correcta
copy certificate.pem storage\app\certificates\certificate.pem

# Verificar permisos (solo lectura para la aplicación)
icacls storage\app\certificates\certificate.pem /grant "IIS_IUSRS:(R)"
```

---

## 🔑 PASO 2: OBTENER CREDENCIALES SOL

### Solicitar Clave SOL

1. Ingresar a: https://www.sunat.gob.pe/
2. Ir a "SUNAT Operaciones en Línea"
3. Seleccionar "Solicitar Clave SOL"
4. Seguir el proceso de validación

### Crear Usuario Secundario (Recomendado)


1. Ingresar con Clave SOL principal
2. Ir a "Usuarios y Accesos"
3. Crear nuevo usuario secundario
4. Asignar permisos de "Facturación Electrónica"
5. Anotar usuario y contraseña

**Formato del usuario:** `RUC + NOMBRE_USUARIO`  
**Ejemplo:** `20123456789FACTURA01`

---

## ⚙️ PASO 3: ACTUALIZAR CONFIGURACIÓN

### Editar archivo .env

```env
# ========================================
# FACTURACIÓN ELECTRÓNICA - PRODUCCIÓN
# ========================================

# CAMBIAR A PRODUCCIÓN
GREENTER_MODE=PRODUCCION

# Credenciales SOL REALES
GREENTER_FE_USER=20123456789FACTURA01
GREENTER_FE_PASSWORD=tu_clave_sol_segura

# Certificado REAL
GREENTER_CERT_PATH=certificates/certificate.pem

# ========================================
# DATOS DE LA EMPRESA REALES
# ========================================
COMPANY_RUC=20123456789
COMPANY_NAME="TU EMPRESA S.A.C."
COMPANY_ADDRESS="Jr. Los Olivos 123, Oficina 501"
COMPANY_DISTRICT=MIRAFLORES
COMPANY_PROVINCE=LIMA
COMPANY_DEPARTMENT=LIMA
COMPANY_UBIGEO=150122

# Logo para PDFs
COMPANY_LOGO_PATH=logo-empresa.png
```

### Verificar config/services.php

El archivo ya debe estar configurado correctamente:

```php
'greenter' => [
    'ambiente' => env('GREENTER_MODE', 'beta'),
    'fe_user' => env('GREENTER_FE_USER'),
    'fe_password' => env('GREENTER_FE_PASSWORD'),
    'cert_path' => storage_path('app/' . env('GREENTER_CERT_PATH')),
],

'company' => [
    'ruc' => env('COMPANY_RUC'),
    'name' => env('COMPANY_NAME'),
    'address' => env('COMPANY_ADDRESS'),
    'district' => env('COMPANY_DISTRICT'),
    'province' => env('COMPANY_PROVINCE'),
    'department' => env('COMPANY_DEPARTMENT'),
],
```

---

## ✅ PASO 4: VERIFICAR CONFIGURACIÓN

### Ejecutar comando de verificación

```bash
php artisan facturacion:verificar
```

**Salida esperada:**
```
✅ Configuración de Facturación Electrónica
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modo: PRODUCCION
Usuario SUNAT: 20123456789FACTURA01
Certificado: ✅ Existe y es válido
RUC Empresa: 20123456789
Nombre Empresa: TU EMPRESA S.A.C.

✅ Sistema listo para PRODUCCIÓN
```

### Verificar certificado manualmente

```bash
# Ver información del certificado
openssl x509 -in storage\app\certificates\certificate.pem -text -noout

# Verificar fechas de validez
openssl x509 -in storage\app\certificates\certificate.pem -noout -dates
```

---

## 🎯 PASO 5: CONFIGURAR SERIES DE COMPROBANTES

### Crear series para producción

```sql
-- Facturas
INSERT INTO serie_comprobantes (tipo_comprobante, serie, correlativo_actual, activo)
VALUES ('01', 'F001', 0, 1);

-- Boletas
INSERT INTO serie_comprobantes (tipo_comprobante, serie, correlativo_actual, activo)
VALUES ('03', 'B001', 0, 1);

-- Notas de Crédito
INSERT INTO serie_comprobantes (tipo_comprobante, serie, correlativo_actual, activo)
VALUES ('07', 'FC01', 0, 1);

-- Notas de Débito
INSERT INTO serie_comprobantes (tipo_comprobante, serie, correlativo_actual, activo)
VALUES ('08', 'FD01', 0, 1);
```

O usar el seeder:

```bash
php artisan db:seed --class=SeriesComprobanteSeeder
```

---

## 🧪 PASO 6: PRUEBA DE EMISIÓN

### Emitir primer comprobante de prueba


**Opción 1: Desde la API**

```bash
POST /api/ventas/{venta_id}/facturar
Content-Type: application/json
Authorization: Bearer {token}

{
  "cliente": {
    "tipo_documento": "6",
    "numero_documento": "20123456789",
    "razon_social": "CLIENTE PRUEBA S.A.C.",
    "direccion": "Av. Test 123",
    "email": "cliente@test.com"
  }
}
```

**Opción 2: Comando Artisan**

```bash
php artisan facturacion:test --produccion
```

### Verificar respuesta

**Respuesta exitosa:**
```json
{
  "success": true,
  "mensaje": "Comprobante enviado a SUNAT exitosamente",
  "data": {
    "comprobante": {
      "id": 1,
      "tipo_comprobante": "01",
      "serie": "F001",
      "correlativo": "00000001",
      "estado": "ACEPTADO",
      "codigo_hash": "abc123...",
      "mensaje_sunat": "La Factura numero F001-00000001, ha sido aceptada"
    }
  }
}
```

### Verificar en SUNAT

1. Ingresar a SUNAT Operaciones en Línea
2. Ir a "Consulta de Comprobantes"
3. Buscar por serie y número
4. Verificar estado: "ACEPTADO"

---

## 📊 PASO 7: MONITOREO POST-MIGRACIÓN

### Revisar logs de SUNAT

```bash
# Ver logs recientes
php artisan sunat:logs --recientes

# Ver logs de hoy
php artisan sunat:logs --fecha=2025-10-20

# Ver solo errores
php artisan sunat:logs --estado=RECHAZADO
```

### Consultar en base de datos

```sql
-- Comprobantes emitidos hoy
SELECT * FROM comprobantes 
WHERE DATE(created_at) = CURDATE()
ORDER BY created_at DESC;

-- Logs de SUNAT
SELECT * FROM sunat_logs 
WHERE DATE(created_at) = CURDATE()
ORDER BY created_at DESC;

-- Comprobantes rechazados
SELECT * FROM comprobantes 
WHERE estado = 'RECHAZADO'
ORDER BY created_at DESC;
```

### Configurar alertas

```php
// En app/Listeners/ProcessVentaCreated.php o similar
if ($result['success'] === false) {
    // Enviar alerta por email
    Mail::to('admin@empresa.com')->send(
        new ComprobanteRechazadoMail($comprobante, $result['error'])
    );
    
    // Log crítico
    Log::critical('Comprobante rechazado por SUNAT', [
        'comprobante_id' => $comprobante->id,
        'error' => $result['error']
    ]);
}
```

---

## 🔄 PASO 8: ROLLBACK (Si es necesario)

### Volver a BETA

Si encuentras problemas, puedes volver rápidamente a BETA:

```env
# En .env
GREENTER_MODE=BETA
GREENTER_FE_USER=20000000001MODDATOS
GREENTER_FE_PASSWORD=MODDATOS
GREENTER_CERT_PATH=certificates/certificate.pem
```

```bash
# Limpiar cache
php artisan config:clear
php artisan cache:clear

# Verificar
php artisan facturacion:verificar
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Certificado no válido"

**Causa:** Certificado expirado o formato incorrecto  
**Solución:**
```bash
# Verificar fechas
openssl x509 -in certificate.pem -noout -dates

# Verificar formato
openssl x509 -in certificate.pem -text -noout
```

### Error: "Usuario SOL inválido"

**Causa:** Credenciales incorrectas  
**Solución:**
1. Verificar usuario en SUNAT
2. Resetear contraseña si es necesario
3. Verificar formato: `RUC + USUARIO`

### Error: "RUC no autorizado para emitir"

**Causa:** Empresa no está inscrita en facturación electrónica  
**Solución:**
1. Ingresar a SUNAT
2. Solicitar adhesión a facturación electrónica
3. Esperar aprobación (1-2 días)

### Error: "Serie no válida"

**Causa:** Serie no registrada en SUNAT  
**Solución:**
1. Verificar series en SUNAT
2. Registrar nuevas series si es necesario
3. Actualizar en base de datos

### Error: "Timeout de conexión"

**Causa:** Problemas de red o SUNAT en mantenimiento  
**Solución:**
1. Verificar conectividad
2. Consultar estado de servicios SUNAT
3. Reintentar después de unos minutos

---

## 📝 CHECKLIST FINAL

### Pre-Migración
- [ ] Backup de base de datos realizado
- [ ] Certificado digital obtenido y validado
- [ ] Credenciales SOL verificadas
- [ ] Variables de entorno actualizadas
- [ ] Series de comprobantes configuradas

### Durante Migración
- [ ] Modo cambiado a PRODUCCION
- [ ] Configuración verificada con comando
- [ ] Primer comprobante emitido exitosamente
- [ ] CDR recibido de SUNAT
- [ ] PDF generado correctamente

### Post-Migración
- [ ] Logs monitoreados
- [ ] Alertas configuradas
- [ ] Equipo capacitado
- [ ] Documentación actualizada
- [ ] Plan de rollback documentado

---

## 📞 CONTACTOS DE SOPORTE

### SUNAT
- **Mesa de ayuda:** 0-801-12-100
- **Email:** consultassunat@sunat.gob.pe
- **Horario:** Lunes a Viernes 8:00 - 20:00

### Greenter (Librería)
- **GitHub Issues:** https://github.com/thegreenter/greenter/issues
- **Documentación:** https://greenter.dev/

### Entidades Certificadoras
- **eCert:** (01) 700-5000
- **Reniec:** (01) 315-2700

---

## ✨ CONCLUSIÓN

Siguiendo esta guía paso a paso, la migración a producción debería completarse sin problemas. El sistema está diseñado para facilitar este proceso y minimizar el tiempo de inactividad.

**Tiempo estimado total:** 2-4 horas (con certificado y credenciales listas)

**¡Éxito en tu migración a producción!** 🚀

---

**Última actualización:** 20 de octubre de 2025  
**Versión:** 1.0
