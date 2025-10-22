# 🔐 Permisos de Contabilidad

## 📋 Lista Completa de Permisos

### 🏦 CAJAS (3 permisos)
```
contabilidad.cajas.ver       → Ver cajas y reportes
contabilidad.cajas.create    → Crear nuevas cajas
contabilidad.cajas.edit      → Aperturar, cerrar y registrar transacciones
```

### 📦 KARDEX (2 permisos)
```
contabilidad.kardex.ver      → Ver kardex e inventario valorizado
contabilidad.kardex.edit     → Hacer ajustes de inventario
```

### 💰 CUENTAS POR COBRAR (3 permisos)
```
contabilidad.cxc.ver         → Ver cuentas por cobrar
contabilidad.cxc.create      → Crear cuentas por cobrar
contabilidad.cxc.edit        → Registrar pagos de clientes
```

### 💳 CUENTAS POR PAGAR (3 permisos)
```
contabilidad.cxp.ver         → Ver cuentas por pagar
contabilidad.cxp.create      → Crear cuentas por pagar
contabilidad.cxp.edit        → Registrar pagos a proveedores
```

### 🏢 PROVEEDORES (3 permisos)
```
contabilidad.proveedores.ver     → Ver proveedores
contabilidad.proveedores.create  → Crear proveedores
contabilidad.proveedores.edit    → Editar proveedores
```

### 💵 CAJA CHICA (3 permisos)
```
contabilidad.caja_chica.ver      → Ver caja chica y rendiciones
contabilidad.caja_chica.create   → Crear caja chica
contabilidad.caja_chica.edit     → Registrar gastos y reposiciones
```

### 📊 FLUJO DE CAJA (3 permisos)
```
contabilidad.flujo_caja.ver      → Ver flujo de caja
contabilidad.flujo_caja.create   → Crear proyecciones
contabilidad.flujo_caja.edit     → Registrar montos reales
```

### 📈 REPORTES (1 permiso)
```
contabilidad.reportes.ver        → Ver todos los reportes
```

### 💎 UTILIDADES (3 permisos)
```
contabilidad.utilidades.ver      → Ver utilidades y rentabilidad
contabilidad.utilidades.create   → Registrar gastos operativos
contabilidad.utilidades.edit     → Calcular utilidades mensuales
```

---

## 👥 Permisos por Rol

### 🔴 Administrador
**Acceso:** TOTAL (todos los permisos)
```
✅ Todos los permisos de contabilidad
```

### 🟠 Gerente
**Acceso:** TOTAL (todos los permisos)
```
✅ Todos los permisos de contabilidad
```

### 🟡 Contador
**Acceso:** TOTAL (todos los permisos)
```
✅ Todos los permisos de contabilidad
```

### 🟢 Cajero
**Acceso:** Solo cajas
```
✅ contabilidad.cajas.ver
✅ contabilidad.cajas.edit
```
**Puede:**
- Aperturar caja
- Cerrar caja
- Registrar transacciones
- Ver reportes de caja

**NO puede:**
- Crear cajas nuevas
- Ver otros módulos

### 🔵 Vendedor
**Acceso:** CxC y reportes
```
✅ contabilidad.cxc.ver
✅ contabilidad.cxc.edit
✅ contabilidad.reportes.ver
```
**Puede:**
- Ver cuentas por cobrar
- Registrar pagos de clientes
- Ver reportes de ventas

**NO puede:**
- Crear cuentas por cobrar (lo hace el sistema)
- Acceder a otros módulos

### 🟣 Compras
**Acceso:** Proveedores, CxP y Kardex
```
✅ contabilidad.proveedores.ver
✅ contabilidad.proveedores.create
✅ contabilidad.proveedores.edit
✅ contabilidad.cxp.ver
✅ contabilidad.cxp.create
✅ contabilidad.cxp.edit
✅ contabilidad.kardex.ver
```
**Puede:**
- Gestionar proveedores
- Gestionar cuentas por pagar
- Ver kardex de productos

**NO puede:**
- Acceder a cajas
- Ver utilidades

---

## 🚀 Instalación de Permisos

### 1. Ejecutar el Seeder
```bash
php artisan db:seed --class=ContabilidadPermissionsSeeder
```

### 2. Verificar Permisos Creados
```bash
php artisan tinker
>>> \Spatie\Permission\Models\Permission::where('name', 'like', 'contabilidad.%')->count()
# Debe retornar: 24
```

### 3. Verificar Roles
```bash
php artisan tinker
>>> $admin = \Spatie\Permission\Models\Role::where('name', 'Administrador')->first()
>>> $admin->permissions->where('name', 'like', 'contabilidad.%')->count()
# Debe retornar: 24
```

---

## 🔧 Asignar Permisos Manualmente

### Asignar a un Usuario
```php
use App\Models\User;

$user = User::find(1);

// Asignar un permiso
$user->givePermissionTo('contabilidad.cajas.ver');

// Asignar múltiples permisos
$user->givePermissionTo([
    'contabilidad.cajas.ver',
    'contabilidad.cajas.edit'
]);
```

### Asignar a un Rol
```php
use Spatie\Permission\Models\Role;

$role = Role::where('name', 'Cajero')->first();

// Asignar permisos al rol
$role->givePermissionTo([
    'contabilidad.cajas.ver',
    'contabilidad.cajas.edit'
]);
```

### Verificar Permisos
```php
$user = User::find(1);

// Verificar si tiene un permiso
if ($user->can('contabilidad.cajas.ver')) {
    // Tiene permiso
}

// Verificar múltiples permisos
if ($user->hasAnyPermission(['contabilidad.cajas.ver', 'contabilidad.reportes.ver'])) {
    // Tiene al menos uno
}
```

---

## 📝 Crear Nuevos Roles

### Ejemplo: Rol "Asistente Contable"
```php
use Spatie\Permission\Models\Role;

$role = Role::create([
    'name' => 'Asistente Contable',
    'guard_name' => 'api'
]);

$role->givePermissionTo([
    'contabilidad.cajas.ver',
    'contabilidad.cxc.ver',
    'contabilidad.cxp.ver',
    'contabilidad.reportes.ver'
]);
```

---

## ⚠️ Importante

### Middleware en Rutas
Todas las rutas de contabilidad están protegidas con:
```php
Route::middleware(['auth:api'])->prefix('contabilidad')->group(function () {
    Route::middleware('permission:contabilidad.cajas.ver')->group(function () {
        // Rutas protegidas
    });
});
```

### Respuesta sin Permiso
Si un usuario intenta acceder sin permiso, recibirá:
```json
{
  "error": "No tienes permiso para realizar esta acción",
  "status": 403
}
```

---

## 🎯 Mejores Prácticas

### 1. Principio de Menor Privilegio
- Asigna solo los permisos necesarios
- No des acceso total a todos

### 2. Usar Roles en lugar de Permisos Directos
```php
// ❌ Malo
$user->givePermissionTo('contabilidad.cajas.ver');

// ✅ Bueno
$user->assignRole('Cajero');
```

### 3. Revisar Permisos Periódicamente
- Auditar quién tiene qué permisos
- Remover permisos innecesarios

### 4. Documentar Cambios
- Mantener registro de cambios de permisos
- Justificar asignaciones especiales

---

## 📊 Resumen

**Total de Permisos:** 24  
**Módulos:** 9  
**Roles Predefinidos:** 6

**Estructura:**
```
contabilidad.{modulo}.{accion}
```

**Acciones:**
- `ver` - Consultar información
- `create` - Crear nuevos registros
- `edit` - Modificar/actualizar registros

---

**Fecha:** 19 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ COMPLETADO
