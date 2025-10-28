# Flujo Completo de Creación de Recompensas

## Implementación en el Frontend

El componente `recompensas-crear-modal` ahora sigue exactamente el flujo de 5 pasos documentado en el backend.

### 🎯 Estrategia de Creación

Para garantizar que el flujo de 5 pasos funcione correctamente, se implementa la siguiente estrategia:

1. **PASO 1**: Siempre crear la recompensa con estado `'pausada'` (temporalmente)
2. **PASOS 2-4**: Configurar segmentos, productos y beneficios
3. **PASO 5**: Si el usuario eligió estado `'activa'`, activar la recompensa

**Razón**: Si creamos la recompensa directamente con estado `'activa'`, el backend rechaza el PASO 5 con error: "No se puede activar la recompensa desde el estado actual: Activa"

### PASO 1: Crear la Recompensa Base ✅

**Endpoint:** `POST /api/admin/recompensas`

**Datos enviados:**
```typescript
{
  nombre: string,
  descripcion: string,
  tipo: 'puntos' | 'descuento' | 'envio_gratis' | 'regalo',
  fecha_inicio: string (YYYY-MM-DD),
  fecha_fin: string (YYYY-MM-DD),
  estado: 'pausada'  // ⚠️ Siempre 'pausada' en el frontend para poder activar después
}
```

**Nota**: Aunque el usuario elija `'activa'` en el formulario, el frontend siempre envía `'pausada'` en este paso. Luego, en el PASO 5, se activa si corresponde.

**Respuesta esperada:**
```typescript
{
  success: true,
  data: {
    recompensa: {
      id: number,
      nombre: string,
      tipo: string,
      estado: string
    }
  }
}
```

---

### PASO 2: Asignar Segmentos de Clientes 👥

**Endpoint:** `POST /api/admin/recompensas/{id}/segmentos`

**Método:** `ejecutarPaso2Segmentos(recompensaId)`

**Opciones:**

#### Opción A - Por segmento predefinido:
```typescript
{
  segmento: 'vip' | 'nuevos' | 'recurrentes' | 'todos',
  cliente_id: null
}
```

#### Opción B - Cliente específico:
```typescript
{
  segmento: 'especifico',
  cliente_id: number
}
```

#### Opción C - Todos los clientes (por defecto):
```typescript
{
  segmento: 'todos',
  cliente_id: null
}
```

**Implementación:**
- Se envía un POST por cada segmento seleccionado
- Se envía un POST por cada cliente específico seleccionado
- Si no hay selección, se asigna automáticamente a "todos"

---

### PASO 3: Asignar Productos/Categorías 🛍️

**Endpoint:** `POST /api/admin/recompensas/{id}/productos`

**Método:** `ejecutarPaso3Productos(recompensaId)`

**Opciones:**

#### Opción A - Producto específico:
```typescript
{
  tipo: 'producto',
  producto_id: number
  // NO incluir categoria_id
}
```

#### Opción B - Categoría completa:
```typescript
{
  tipo: 'categoria',
  categoria_id: number
  // NO incluir producto_id
}
```

#### Opción C - Todos los productos (por defecto):
Si no se envía ningún producto ni categoría, el backend asume que aplica a todos los productos.

**Implementación:**
- Se envía un POST por cada producto seleccionado
- Se envía un POST por cada categoría seleccionada
- Si no hay selección, se asigna automáticamente a "todos"

---

### PASO 4: Configurar el Beneficio 🎁

**Método:** `ejecutarPaso4Configuracion(recompensaId, valores)`

Según el tipo de recompensa, se llama al endpoint correspondiente:

#### 4A. Si tipo = "puntos":
**Endpoint:** `POST /api/admin/recompensas/{id}/puntos`

```typescript
{
  tipo_calculo: 'porcentaje',
  puntos_por_compra: number,
  compra_minima: number,
  maximo_puntos: number | null,
  multiplicador_nivel: number,
  otorga_puntos_por_registro: boolean
}
```

#### 4B. Si tipo = "descuento":
**Endpoint:** `POST /api/admin/recompensas/{id}/descuentos`

```typescript
{
  tipo_descuento: 'porcentaje' | 'monto_fijo',
  valor_descuento: number,
  compra_minima: number,
  descuento_maximo: number | null
}
```

#### 4C. Si tipo = "envio_gratis":
**Endpoint:** `POST /api/admin/recompensas/{id}/envios`

```typescript
{
  compra_minima: number,
  zonas_aplicables: string[],
  aplica_todo_peru: boolean
}
```

#### 4D. Si tipo = "regalo":
**Endpoint:** `POST /api/admin/recompensas/{id}/regalos`

```typescript
{
  producto_id: number,
  cantidad: number,
  compra_minima: number
}
```

---

### PASO 5: Activar la Recompensa 🚀

**Endpoint:** `PATCH /api/admin/recompensas/{id}/activate`

**Método:** `ejecutarPaso5Activar(recompensaId)`

**Condición:** Se ejecuta si el usuario eligió estado `'activa'` en el formulario

**Flujo:**
1. En el PASO 1, la recompensa se crea con estado `'pausada'` (siempre)
2. Se configuran segmentos, productos y beneficios (PASOS 2-4)
3. Si el usuario eligió `'activa'`, se ejecuta este paso para activarla
4. Si el usuario eligió `'pausada'` o `'programada'`, se omite este paso

**⚠️ IMPORTANTE:** El backend valida que no se puede activar una recompensa que ya está activa. Por eso creamos siempre en estado `'pausada'` primero.

**Respuesta esperada:**
```typescript
{
  success: true,
  message: "Recompensa activada exitosamente",
  data: {
    id: number,
    nombre: string,
    estado: 'activa',
    tiene_clientes: boolean,
    tiene_productos: boolean,
    tiene_configuracion: boolean
  }
}
```

---

## Validaciones Importantes ⚠️

### No se puede activar una recompensa sin:
- ✅ Al menos 1 segmento de clientes
- ✅ Al menos 1 producto/categoría
- ✅ La configuración del beneficio (puntos, descuento, envío o regalo)

### Estados automáticos:
- **Fecha futura** → `programada`
- **Fecha hoy** → `activa` o `pausada`
- **Fecha pasada** → `expirada`

---

## Flujo en el Código

```typescript
async crearRecompensa() {
  const estadoDeseado = this.formulario.value.estado; // 'activa', 'pausada', etc.
  
  // PASO 1: Crear recompensa base (siempre como 'pausada')
  const datosRecompensa = {
    ...this.formulario.value,
    estado: 'pausada' // Siempre pausada primero
  };
  const response = await this.recompensasService.crear(datosRecompensa);
  const recompensaId = response.data.recompensa.id;
  
  // PASOS 2-5: Configurar y activar si corresponde
  await this.guardarDatosAdicionales(recompensaId, estadoDeseado);
}

private async guardarDatosAdicionales(recompensaId: number, estadoDeseado: string) {
  // PASO 2: Asignar Segmentos
  await this.ejecutarPaso2Segmentos(recompensaId);
  
  // PASO 3: Asignar Productos
  await this.ejecutarPaso3Productos(recompensaId);
  
  // PASO 4: Configurar Beneficio
  await this.ejecutarPaso4Configuracion(recompensaId, valores);
  
  // PASO 5: Activar si el usuario eligió 'activa'
  if (estadoDeseado === 'activa') {
    await this.ejecutarPaso5Activar(recompensaId);
  }
}
```

---

## Logs de Consola

El flujo genera logs claros para debugging:

```
📋 PASO 2: Asignando segmentos...
  ✓ Segmento asignado: Clientes VIP
  ✓ Cliente específico asignado: Juan Pérez

🛍️ PASO 3: Asignando productos/categorías...
  ✓ Producto asignado: Laptop HP
  ✓ Categoría asignada: Electrónica

🎁 PASO 4: Configurando beneficio...
  ✓ Configuración de descuentos creada

🚀 PASO 5: Activando recompensa...
  ✓ Recompensa activada exitosamente
  Validaciones: {
    tiene_clientes: true,
    tiene_productos: true,
    tiene_configuracion: true
  }

✅ Flujo completo de 5 pasos ejecutado correctamente
```

---

## Manejo de Errores

Si algún paso falla:
- Se captura el error específico
- Se muestra un mensaje claro al usuario
- Se detiene el flujo para evitar inconsistencias
- Los logs indican exactamente dónde falló

```typescript
try {
  await this.guardarDatosAdicionales(recompensaId);
} catch (error) {
  console.error('❌ Error en el flujo de creación:', error);
  this.error = error.message || 'Error al crear la recompensa';
}
```
