# 🛠️ Comandos Artisan - Guías de Remisión

## 📋 Información General

Los comandos Artisan para guías de remisión permiten gestionar el flujo completo desde la línea de comandos, facilitando las pruebas, mantenimiento y automatización del sistema.

## 🚀 Comandos Disponibles

### **1. Generar Guía de Prueba**

```bash
php artisan guia:generar-prueba
```

**Descripción:** Crea una guía de remisión de prueba completa y la envía a SUNAT BETA.

**Funcionalidad:**
- ✅ Crea cliente de prueba si no existe
- ✅ Crea producto de prueba si no existe
- ✅ Crea categoría de prueba si no existe
- ✅ Genera serie T001 para guías
- ✅ Crea guía de remisión con datos completos
- ✅ Envía automáticamente a SUNAT BETA
- ✅ Muestra resultado detallado

**Datos de Prueba Creados:**
```php
// Cliente
'numero_documento' => '20000000001'
'razon_social' => 'EMPRESA DE PRUEBAS S.A.C.'
'direccion' => 'AV. FICTICIA 123, LIMA'

// Producto
'codigo_producto' => 'PROD-GUIA-001'
'nombre' => 'PRODUCTO DE PRUEBA - GUÍA'
'precio_compra' => 50.00
'precio_venta' => 100.00

// Guía
'serie' => 'T001'
'destinatario' => 'DESTINATARIO DE PRUEBA'
'peso_total' => 10.00
'cantidad_productos' => 5.00
```

**Salida Exitosa:**
```
Guía de remisión de prueba creada: T001-00000001
¡Guía de remisión enviada a SUNAT BETA exitosamente!
ID: 1
Número: T001-00000001
Estado: ACEPTADO
SUNAT: La guía ha sido aceptada
```

**Salida con Error:**
```
Guía de remisión de prueba creada: T001-00000002
Guía creada pero hubo error al enviar a SUNAT
Error: El nombre del archivo ZIP es incorrecto - Detalle: xxx.xxx.xxx value='ticket: error: Error de nombre archivo "20000000001-09-T001-3.zip codigo cpe: 09" no es un cpe valido'
```

---

### **2. Enviar Guía Existente**

```bash
php artisan guia:enviar {id}
```

**Descripción:** Envía una guía de remisión existente a SUNAT.

**Parámetros:**
- `id` (integer, requerido): ID de la guía de remisión

**Ejemplo de Uso:**
```bash
# Enviar guía con ID 1
php artisan guia:enviar 1

# Enviar guía con ID 5
php artisan guia:enviar 5
```

**Validaciones:**
- ✅ La guía debe existir
- ✅ La guía debe estar en estado PENDIENTE
- ✅ Debe tener certificado válido
- ✅ Debe tener credenciales SUNAT configuradas

**Salida Exitosa:**
```
Enviada correctamente.
Número: T001-00000001
Estado: ACEPTADO
SUNAT: La guía ha sido aceptada
```

**Salida con Error:**
```
Error al enviar: El nombre del archivo ZIP es incorrecto
Código: 400
```

**Errores Comunes:**
```
# Guía no encontrada
Guía de remisión no encontrada: ID 999

# Estado incorrecto
Error al enviar: La guía de remisión no puede ser enviada en su estado actual

# Error de certificado
Error al enviar: La ruta del certificado no está configurada
```

---

## 🔧 Configuración Requerida

### **Variables de Entorno**
```env
# Configuración Greenter
GREENTER_AMBIENTE=beta
GREENTER_FE_USER=tu_usuario_sol
GREENTER_FE_PASSWORD=tu_password_sol
GREENTER_CERT_PATH=storage/certificates/certificado.pem

# Configuración Empresa
COMPANY_RUC=20123456789
COMPANY_NAME=TU EMPRESA S.A.C.
COMPANY_ADDRESS=AV. PRINCIPAL 123
COMPANY_DISTRICT=LIMA
COMPANY_PROVINCE=LIMA
COMPANY_DEPARTMENT=LIMA
COMPANY_UBIGEO=150101
```

### **Base de Datos**
```sql
-- Verificar que existe la serie T001
SELECT * FROM series_comprobantes WHERE tipo_comprobante = '09';

-- Si no existe, crearla
INSERT INTO series_comprobantes (tipo_comprobante, serie, correlativo, activo, descripcion)
VALUES ('09', 'T001', 0, true, 'Serie por defecto Guía de Remisión');
```

### **Certificado Digital**
```bash
# Verificar que el certificado existe
ls -la storage/certificates/certificado.pem

# Verificar permisos de lectura
chmod 644 storage/certificates/certificado.pem
```

---

## 📊 Ejemplos de Uso

### **Flujo Completo de Prueba**

```bash
# 1. Generar guía de prueba
php artisan guia:generar-prueba

# 2. Verificar en base de datos
php artisan tinker --execute="
\$guia = \App\Models\GuiaRemision::latest()->first();
echo 'ID: ' . \$guia->id . PHP_EOL;
echo 'Número: ' . \$guia->numero_completo . PHP_EOL;
echo 'Estado: ' . \$guia->estado . PHP_EOL;
echo 'Cliente: ' . \$guia->cliente_razon_social . PHP_EOL;
"

# 3. Ver detalles de la guía
php artisan tinker --execute="
\$detalles = \App\Models\GuiaRemisionDetalle::where('guia_remision_id', 1)->get();
foreach(\$detalles as \$detalle) {
    echo 'Producto: ' . \$detalle->descripcion . PHP_EOL;
    echo 'Cantidad: ' . \$detalle->cantidad . PHP_EOL;
    echo 'Peso: ' . \$detalle->peso_total . ' kg' . PHP_EOL;
}
"
```

### **Reenvío de Guías Rechazadas**

```bash
# 1. Listar guías rechazadas
php artisan tinker --execute="
\$guias = \App\Models\GuiaRemision::where('estado', 'RECHAZADO')->get();
foreach(\$guias as \$guia) {
    echo 'ID: ' . \$guia->id . ' - ' . \$guia->numero_completo . ' - Error: ' . \$guia->errores_sunat . PHP_EOL;
}
"

# 2. Reenviar guía específica
php artisan guia:enviar 1
```

### **Verificación de Configuración**

```bash
# 1. Verificar configuración Greenter
php artisan tinker --execute="
echo 'Ambiente: ' . config('services.greenter.ambiente') . PHP_EOL;
echo 'Usuario: ' . config('services.greenter.fe_user') . PHP_EOL;
echo 'Certificado: ' . config('services.greenter.cert_path') . PHP_EOL;
echo 'Certificado existe: ' . (file_exists(config('services.greenter.cert_path')) ? 'SÍ' : 'NO') . PHP_EOL;
"

# 2. Verificar configuración empresa
php artisan tinker --execute="
echo 'RUC: ' . config('services.company.ruc') . PHP_EOL;
echo 'Razón Social: ' . config('services.company.name') . PHP_EOL;
echo 'Dirección: ' . config('services.company.address') . PHP_EOL;
"
```

---

## 🚨 Solución de Problemas

### **Error: "Guía de remisión no encontrada"**
```bash
# Verificar que la guía existe
php artisan tinker --execute="
echo 'Total guías: ' . \App\Models\GuiaRemision::count() . PHP_EOL;
\App\Models\GuiaRemision::all()->each(function(\$guia) {
    echo 'ID: ' . \$guia->id . ' - ' . \$guia->numero_completo . PHP_EOL;
});
"
```

### **Error: "No hay series activas para guías de remisión"**
```bash
# Crear serie T001
php artisan tinker --execute="
\App\Models\SerieComprobante::create([
    'tipo_comprobante' => '09',
    'serie' => 'T001',
    'correlativo' => 0,
    'activo' => true,
    'descripcion' => 'Serie por defecto Guía de Remisión'
]);
echo 'Serie T001 creada exitosamente';
"
```

### **Error: "La ruta del certificado no está configurada"**
```bash
# Verificar configuración
php artisan config:show services.greenter

# Verificar archivo
ls -la storage/certificates/

# Crear directorio si no existe
mkdir -p storage/certificates
```

### **Error: "Las credenciales SOL no están configuradas"**
```bash
# Verificar variables de entorno
php artisan config:show services.greenter

# Verificar archivo .env
grep GREENTER .env
```

### **Error de SUNAT: "El nombre del archivo ZIP es incorrecto"**
```bash
# Este es un error esperado en SUNAT BETA
# La guía se crea correctamente pero SUNAT rechaza por estructura
# Verificar que la guía se creó:
php artisan tinker --execute="
\$guia = \App\Models\GuiaRemision::latest()->first();
echo 'Guía creada: ' . \$guia->numero_completo . PHP_EOL;
echo 'Estado: ' . \$guia->estado . PHP_EOL;
echo 'XML generado: ' . (!empty(\$guia->xml_firmado) ? 'SÍ' : 'NO') . PHP_EOL;
"
```

---

## 📈 Monitoreo y Logs

### **Ver Logs de Guías**
```bash
# Logs generales
tail -f storage/logs/laravel.log | grep -i "guia"

# Logs específicos de SUNAT
tail -f storage/logs/laravel.log | grep -i "sunat"

# Logs de errores
tail -f storage/logs/laravel.log | grep -i "error"
```

### **Estadísticas de Guías**
```bash
# Contar por estado
php artisan tinker --execute="
\$estados = \App\Models\GuiaRemision::selectRaw('estado, count(*) as total')
    ->groupBy('estado')
    ->get();
foreach(\$estados as \$estado) {
    echo \$estado->estado . ': ' . \$estado->total . PHP_EOL;
}
"

# Peso total transportado
php artisan tinker --execute="
echo 'Peso total: ' . \App\Models\GuiaRemision::sum('peso_total') . ' kg' . PHP_EOL;
echo 'Total guías: ' . \App\Models\GuiaRemision::count() . PHP_EOL;
"
```

---

## 🔄 Automatización

### **Script de Prueba Diaria**
```bash
#!/bin/bash
# test-guias-daily.sh

echo "=== Prueba Diaria de Guías de Remisión ==="
echo "Fecha: $(date)"

# Generar guía de prueba
echo "Generando guía de prueba..."
php artisan guia:generar-prueba

# Verificar resultado
if [ $? -eq 0 ]; then
    echo "✅ Prueba exitosa"
else
    echo "❌ Prueba falló"
    exit 1
fi

echo "=== Fin de Prueba ==="
```

### **Cron Job para Reenvío Automático**
```bash
# Agregar al crontab
# Reenviar guías rechazadas cada hora
0 * * * * cd /path/to/project && php artisan tinker --execute="
\$guias = \App\Models\GuiaRemision::where('estado', 'RECHAZADO')
    ->where('created_at', '>', now()->subHours(24))
    ->get();
foreach(\$guias as \$guia) {
    try {
        \$service = app(\App\Services\GuiaRemisionService::class);
        \$result = \$service->enviarGuiaRemision(\$guia);
        if(\$result['success']) {
            echo 'Reenviada: ' . \$guia->numero_completo . PHP_EOL;
        }
    } catch(\Exception \$e) {
        echo 'Error reenviando ' . \$guia->numero_completo . ': ' . \$e->getMessage() . PHP_EOL;
    }
}
" >> /var/log/guias-renvio.log 2>&1
```

---

## 📚 Comandos Relacionados

### **Comandos de Facturación General**
```bash
# Verificar configuración general
php artisan facturacion:verificar

# Generar factura de prueba
php artisan facturacion:generar-factura-prueba

# Enviar comprobante existente
php artisan facturacion:enviar {id}

# Descargar archivos
php artisan facturacion:descargar {id} {tipo}
```

### **Comandos de Base de Datos**
```bash
# Migrar tablas de guías
php artisan migrate --path=database/migrations/2025_10_17_131831_create_guias_remision_table.php
php artisan migrate --path=database/migrations/2025_10_17_131845_create_guias_remision_detalle_table.php

# Ejecutar seeders
php artisan db:seed --class=FacturacionPermisosSeeder
```

---

## ✅ Checklist de Verificación

### **Antes de Usar los Comandos**
- [ ] Variables de entorno configuradas
- [ ] Certificado digital en su lugar
- [ ] Base de datos migrada
- [ ] Serie T001 creada
- [ ] Permisos configurados

### **Después de Ejecutar**
- [ ] Guía creada en base de datos
- [ ] XML generado correctamente
- [ ] Estado actualizado
- [ ] Logs sin errores críticos
- [ ] Archivos descargables disponibles

---

*Documentación de comandos actualizada el: 17 de Enero, 2025*
*Versión: 1.0*
