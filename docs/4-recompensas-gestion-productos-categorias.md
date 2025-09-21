# 📦 SUBMÓDULO: Gestión de Productos y Categorías

## 📋 Información General

**Ruta Frontend:** `/admin/recompensas/{recompensaId}/productos`  
**Prefijo API:** `/api/admin/recompensas/{recompensaId}/productos`  
**Permisos Requeridos:** `recompensas.ver`, `recompensas.edit`

Este submódulo permite la gestión de productos y categorías aplicables a recompensas específicas, incluyendo la asignación de productos individuales, categorías completas, validación de aplicabilidad y análisis de cobertura.

---

## 🔗 Endpoints Disponibles

### 1. **GET** `/api/admin/recompensas/{recompensaId}/productos` - Listar Productos/Categorías Asignados

**Descripción:** Obtiene todos los productos y categorías asignados a una recompensa específica.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/productos
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Productos/categorías obtenidos exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024"
    },
    "productos": [
      {
        "id": 1,
        "tipo_elemento": "producto",
        "nombre_elemento": "Laptop Gaming ASUS ROG",
        "producto": {
          "id": 15,
          "nombre": "Laptop Gaming ASUS ROG",
          "codigo_producto": "LAP-ASUS-001",
          "precio_venta": 2500.00,
          "stock": 25,
          "activo": true
        },
        "categoria": null,
        "productos_aplicables_count": 1
      },
      {
        "id": 2,
        "tipo_elemento": "categoria",
        "nombre_elemento": "Electrónicos",
        "producto": null,
        "categoria": {
          "id": 5,
          "nombre": "Electrónicos",
          "activo": true,
          "productos_count": 150
        },
        "productos_aplicables_count": 150
      }
    ]
  }
}
```

---

### 2. **POST** `/api/admin/recompensas/{recompensaId}/productos` - Asignar Producto/Categoría

**Descripción:** Asigna un producto específico o una categoría completa a una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "tipo": "producto|categoria (required)",
  "producto_id": "integer (required if tipo=producto)",
  "categoria_id": "integer (required if tipo=categoria)"
}
```

**Ejemplo de Request (Producto Específico):**
```bash
POST /api/admin/recompensas/1/productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo": "producto",
  "producto_id": 25
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Producto asignado exitosamente",
  "data": {
    "id": 3,
    "tipo_elemento": "producto",
    "nombre_elemento": "Mouse Gaming Logitech G502",
    "producto": {
      "id": 25,
      "nombre": "Mouse Gaming Logitech G502",
      "codigo_producto": "MOU-LOG-502",
      "precio_venta": 89.99,
      "stock": 50,
      "activo": true
    },
    "categoria": null,
    "productos_aplicables_count": 1
  }
}
```

**Ejemplo de Request (Categoría Completa):**
```bash
POST /api/admin/recompensas/1/productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo": "categoria",
  "categoria_id": 8
}
```

**Ejemplo de Response (201):**
```json
{
  "success": true,
  "message": "Categoría asignada exitosamente",
  "data": {
    "id": 4,
    "tipo_elemento": "categoria",
    "nombre_elemento": "Accesorios Gaming",
    "producto": null,
    "categoria": {
      "id": 8,
      "nombre": "Accesorios Gaming",
      "activo": true,
      "productos_count": 75
    },
    "productos_aplicables_count": 75
  }
}
```

**Ejemplo de Response (422 - Asignación Duplicada):**
```json
{
  "success": false,
  "message": "Este producto ya está asignado a la recompensa"
}
```

**Ejemplo de Response (422 - Producto Inactivo):**
```json
{
  "success": false,
  "message": "No se puede asignar un producto inactivo"
}
```

---

### 3. **DELETE** `/api/admin/recompensas/{recompensaId}/productos/{asignacionId}` - Eliminar Asignación

**Descripción:** Elimina una asignación de producto o categoría de una recompensa.

**Permisos:** `recompensas.edit`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa
- `asignacionId` (integer, required): ID de la asignación a eliminar

**Ejemplo de Request:**
```bash
DELETE /api/admin/recompensas/1/productos/3
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "producto eliminado exitosamente de la recompensa"
}
```

---

### 4. **GET** `/api/admin/recompensas/productos/buscar` - Buscar Productos

**Descripción:** Busca productos disponibles para asignar a recompensas.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "buscar": "string (required, min:2)",
  "limite": "integer (optional, min:1, max:50, default:20)",
  "categoria_id": "integer (optional)",
  "solo_activos": "boolean (optional, default:true)"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/productos/buscar?buscar=Laptop&limite=10&solo_activos=true
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Productos encontrados exitosamente",
  "data": [
    {
      "id": 15,
      "nombre": "Laptop Gaming ASUS ROG",
      "codigo_producto": "LAP-ASUS-001",
      "precio_venta": 2500.00,
      "stock": 25,
      "activo": true,
      "categoria": {
        "id": 5,
        "nombre": "Electrónicos"
      }
    },
    {
      "id": 28,
      "nombre": "Laptop Dell Inspiron 15",
      "codigo_producto": "LAP-DELL-015",
      "precio_venta": 1800.00,
      "stock": 15,
      "activo": true,
      "categoria": {
        "id": 5,
        "nombre": "Electrónicos"
      }
    }
  ]
}
```

---

### 5. **GET** `/api/admin/recompensas/categorias/buscar` - Buscar Categorías

**Descripción:** Busca categorías disponibles para asignar a recompensas.

**Permisos:** `recompensas.ver`

**Parámetros de Query:**
```json
{
  "buscar": "string (optional, min:2)",
  "limite": "integer (optional, min:1, max:50, default:20)",
  "solo_activas": "boolean (optional, default:true)"
}
```

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/categorias/buscar?buscar=Gaming&limite=15
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Categorías encontradas exitosamente",
  "data": [
    {
      "id": 8,
      "nombre": "Accesorios Gaming",
      "descripcion": "Accesorios para gaming y entretenimiento",
      "activo": true,
      "productos_count": 75
    },
    {
      "id": 12,
      "nombre": "Laptops Gaming",
      "descripcion": "Laptops especializadas para gaming",
      "activo": true,
      "productos_count": 25
    }
  ]
}
```

---

### 6. **GET** `/api/admin/recompensas/{recompensaId}/productos/aplicables` - Productos Aplicables

**Descripción:** Obtiene todos los productos que aplican para una recompensa (incluyendo productos de categorías asignadas).

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/productos/aplicables
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Productos aplicables obtenidos exitosamente",
  "data": {
    "recompensa": {
      "id": 1,
      "nombre": "Programa de Fidelidad Q1 2024"
    },
    "total_productos": 226,
    "productos": [
      {
        "id": 15,
        "nombre": "Laptop Gaming ASUS ROG",
        "codigo_producto": "LAP-ASUS-001",
        "precio_venta": 2500.00,
        "stock": 25,
        "activo": true,
        "categoria": {
          "id": 5,
          "nombre": "Electrónicos"
        }
      },
      {
        "id": 25,
        "nombre": "Mouse Gaming Logitech G502",
        "codigo_producto": "MOU-LOG-502",
        "precio_venta": 89.99,
        "stock": 50,
        "activo": true,
        "categoria": {
          "id": 8,
          "nombre": "Accesorios Gaming"
        }
      }
    ]
  }
}
```

---

### 7. **POST** `/api/admin/recompensas/{recompensaId}/productos/validar-producto` - Validar Producto

**Descripción:** Valida si un producto específico aplica para una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Body Request:**
```json
{
  "producto_id": "integer (required)"
}
```

**Ejemplo de Request:**
```bash
POST /api/admin/recompensas/1/productos/validar-producto
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 30
}
```

**Ejemplo de Response (Producto Aplica):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "producto": {
      "id": 30,
      "nombre": "Teclado Mecánico Corsair K95",
      "codigo_producto": "TEC-COR-K95",
      "categoria": {
        "id": 8,
        "nombre": "Accesorios Gaming"
      }
    },
    "aplica_recompensa": true,
    "asignaciones_aplicables": [
      {
        "id": 2,
        "tipo_elemento": "categoria",
        "nombre_elemento": "Accesorios Gaming"
      }
    ],
    "total_asignaciones_configuradas": 2
  }
}
```

**Ejemplo of Response (Producto No Aplica):**
```json
{
  "success": true,
  "message": "Validación completada exitosamente",
  "data": {
    "producto": {
      "id": 30,
      "nombre": "Libro de Programación",
      "codigo_producto": "LIB-PROG-001",
      "categoria": {
        "id": 20,
        "nombre": "Libros"
      }
    },
    "aplica_recompensa": false,
    "asignaciones_aplicables": [],
    "total_asignaciones_configuradas": 2
  }
}
```

---

### 8. **GET** `/api/admin/recompensas/{recompensaId}/productos/estadisticas` - Estadísticas de Productos

**Descripción:** Obtiene estadísticas detalladas de productos y categorías asignadas a una recompensa.

**Permisos:** `recompensas.ver`

**Parámetros de Ruta:**
- `recompensaId` (integer, required): ID de la recompensa

**Ejemplo de Request:**
```bash
GET /api/admin/recompensas/1/productos/estadisticas
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total_asignaciones": 3,
    "productos_especificos": 2,
    "categorias_completas": 1,
    "productos_aplicables_total": 226,
    "valor_total_productos": 125000.50,
    "por_categoria": [
      {
        "nombre": "Electrónicos",
        "productos_count": 150,
        "valor_total": 75000.00
      },
      {
        "nombre": "Accesorios Gaming",
        "productos_count": 75,
        "valor_total": 50000.50
      }
    ]
  }
}
```

---

## 🎨 Componentes del Frontend

### 1. **Lista de Productos/Categorías Asignados**

```typescript
interface ProductosListaProps {
  recompensa: Recompensa;
  productos: ProductoAsignado[];
  onAgregarProducto: () => void;
  onAgregarCategoria: () => void;
  onEliminarAsignacion: (asignacionId: number) => void;
  onVerProductosAplicables: () => void;
}

interface ProductoAsignado {
  id: number;
  tipo_elemento: 'producto' | 'categoria';
  nombre_elemento: string;
  producto?: ProductoInfo;
  categoria?: CategoriaInfo;
  productos_aplicables_count: number;
}

interface ProductoInfo {
  id: number;
  nombre: string;
  codigo_producto: string;
  precio_venta: number;
  stock: number;
  activo: boolean;
}

interface CategoriaInfo {
  id: number;
  nombre: string;
  activo: boolean;
  productos_count: number;
}
```

**Características:**
- Lista diferenciada entre productos específicos y categorías
- Indicadores visuales del tipo de asignación
- Contador de productos aplicables por asignación
- Botones de acción para agregar y eliminar
- Información detallada de cada elemento

### 2. **Formulario de Asignación de Productos**

```typescript
interface FormularioProductoProps {
  recompensaId: number;
  tipo: 'producto' | 'categoria';
  onProductoAsignado: (asignacion: ProductoAsignado) => void;
  onCancelar: () => void;
}

interface FormularioProductoData {
  tipo: 'producto' | 'categoria';
  producto_id?: number;
  categoria_id?: number;
}
```

**Características:**
- Toggle entre producto específico y categoría
- Búsqueda integrada de productos/categorías
- Validación en tiempo real
- Preview de la asignación
- Información del elemento seleccionado

### 3. **Buscador de Productos**

```typescript
interface BuscadorProductosProps {
  onProductoSeleccionado: (producto: ProductoInfo) => void;
  onBuscar: (termino: string, filtros: FiltrosProducto) => void;
  productos: ProductoInfo[];
  isLoading: boolean;
  filtros: FiltrosProducto;
}

interface FiltrosProducto {
  categoria_id?: number;
  solo_activos: boolean;
  limite: number;
}
```

**Características:**
- Búsqueda en tiempo real por nombre o código
- Filtros por categoría y estado
- Lista de resultados con información completa
- Selección con un click
- Límite configurable de resultados

### 4. **Buscador de Categorías**

```typescript
interface BuscadorCategoriasProps {
  onCategoriaSeleccionada: (categoria: CategoriaInfo) => void;
  onBuscar: (termino: string, filtros: FiltrosCategoria) => void;
  categorias: CategoriaInfo[];
  isLoading: boolean;
  filtros: FiltrosCategoria;
}

interface FiltrosCategoria {
  solo_activas: boolean;
  limite: number;
}

interface CategoriaInfo {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  productos_count: number;
}
```

**Características:**
- Búsqueda por nombre de categoría
- Filtro por estado activo/inactivo
- Contador de productos por categoría
- Descripción de la categoría
- Selección con un click

### 5. **Vista de Productos Aplicables**

```typescript
interface ProductosAplicablesProps {
  recompensa: Recompensa;
  productos: ProductoInfo[];
  totalProductos: number;
  onValidarProducto: (productoId: number) => void;
  onExportar: () => void;
}

interface ProductoInfo {
  id: number;
  nombre: string;
  codigo_producto: string;
  precio_venta: number;
  stock: number;
  activo: boolean;
  categoria: {
    id: number;
    nombre: string;
  };
}
```

**Características:**
- Lista completa de productos aplicables
- Filtros por categoría y estado
- Búsqueda en la lista
- Validación individual de productos
- Exportación a Excel/PDF
- Paginación para grandes listas

### 6. **Validador de Productos**

```typescript
interface ValidadorProductoProps {
  recompensaId: number;
  onProductoValidado: (resultado: ValidacionProducto) => void;
}

interface ValidacionProducto {
  producto: ProductoInfo;
  aplica_recompensa: boolean;
  asignaciones_aplicables: AsignacionAplicable[];
  total_asignaciones_configuradas: number;
}

interface AsignacionAplicable {
  id: number;
  tipo_elemento: 'producto' | 'categoria';
  nombre_elemento: string;
}
```

**Características:**
- Búsqueda de producto por ID o datos
- Resultado visual de aplicabilidad
- Lista de asignaciones que aplican
- Información detallada del producto
- Indicadores de estado (aplica/no aplica)

### 7. **Dashboard de Estadísticas**

```typescript
interface EstadisticasProductosProps {
  estadisticas: EstadisticasProductos;
  recompensaId: number;
}

interface EstadisticasProductos {
  total_asignaciones: number;
  productos_especificos: number;
  categorias_completas: number;
  productos_aplicables_total: number;
  valor_total_productos: number;
  por_categoria: CategoriaEstadistica[];
}

interface CategoriaEstadistica {
  nombre: string;
  productos_count: number;
  valor_total: number;
}
```

**Características:**
- Tarjetas con métricas principales
- Gráfico de distribución por categoría
- Valor total de productos aplicables
- Comparativas entre asignaciones
- Exportación de reportes

---

## 🔧 Implementación Técnica

### Modelo de Asignación de Productos

```php
class RecompensaProducto extends Model
{
    protected $fillable = [
        'recompensa_id', 'producto_id', 'categoria_id'
    ];

    // Relaciones
    public function recompensa(): BelongsTo
    {
        return $this->belongsTo(Recompensa::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    // Accessors
    public function getTipoElementoAttribute(): string
    {
        return $this->producto_id ? 'producto' : 'categoria';
    }

    public function getNombreElementoAttribute(): string
    {
        if ($this->producto_id) {
            return $this->producto->nombre ?? 'Producto no encontrado';
        }
        
        return $this->categoria->nombre ?? 'Categoría no encontrada';
    }

    // Métodos de validación
    public function productoAplica(Producto $producto): bool
    {
        // Si es un producto específico
        if ($this->producto_id) {
            return $this->producto_id === $producto->id;
        }

        // Si es una categoría
        if ($this->categoria_id) {
            return $producto->categoria_id === $this->categoria_id;
        }

        return false;
    }

    public function getProductosAplicables()
    {
        if ($this->producto_id) {
            // Producto específico
            return collect([$this->producto])->filter();
        }

        if ($this->categoria_id) {
            // Todos los productos de la categoría
            return Producto::where('categoria_id', $this->categoria_id)
                          ->where('activo', true)
                          ->get();
        }

        return collect();
    }
}
```

### Lógica de Búsqueda Optimizada

```php
// Búsqueda de productos con filtros
public function buscarProductos(Request $request): JsonResponse
{
    $query = Producto::with('categoria:id,nombre')
        ->where(function($q) use ($request) {
            $q->where('nombre', 'like', "%{$request->buscar}%")
              ->orWhere('codigo_producto', 'like', "%{$request->buscar}%");
        });

    if ($request->get('solo_activos', true)) {
        $query->where('activo', true);
    }

    if ($request->categoria_id) {
        $query->where('categoria_id', $request->categoria_id);
    }

    return $query->limit($request->get('limite', 20))
                 ->get(['id', 'nombre', 'codigo_producto', 'precio_venta', 'stock', 'activo', 'categoria_id']);
}
```

### Cálculo de Productos Aplicables

```php
public function productosAplicables($recompensaId): JsonResponse
{
    $asignaciones = RecompensaProducto::where('recompensa_id', $recompensaId)->get();
    $productosAplicables = collect();

    foreach ($asignaciones as $asignacion) {
        $productos = $asignacion->getProductosAplicables();
        $productosAplicables = $productosAplicables->merge($productos);
    }

    // Eliminar duplicados
    $productosUnicos = $productosAplicables->unique('id');

    return response()->json([
        'success' => true,
        'data' => [
            'total_productos' => $productosUnicos->count(),
            'productos' => $productosUnicos->values()
        ]
    ]);
}
```

---

## 📊 Métricas y KPIs

### Métricas de Asignación
- **Total de Asignaciones:** Número de productos/categorías asignados
- **Productos Específicos:** Número de productos individuales asignados
- **Categorías Completas:** Número de categorías asignadas
- **Productos Aplicables Total:** Número único de productos que aplican

### Métricas de Valor
- **Valor Total de Productos:** Suma del valor de todos los productos aplicables
- **Valor Promedio por Producto:** Valor promedio de productos aplicables
- **Distribución por Categoría:** Valor y cantidad por categoría

### Métricas de Cobertura
- **Cobertura de Productos:** % de productos del catálogo cubiertos
- **Cobertura por Categoría:** % de categorías con productos asignados
- **Densidad de Asignación:** Productos aplicables por asignación

---

## 🔐 Consideraciones de Seguridad

1. **Validación de Estado:** Solo productos/categorías activos pueden ser asignados
2. **Prevención de Duplicados:** Validación para evitar asignaciones duplicadas
3. **Límites de Búsqueda:** Límites en búsquedas para evitar sobrecarga
4. **Permisos Granulares:** Verificación de permisos en cada operación
5. **Auditoría:** Registro de cambios en asignaciones

---

## 📝 Notas de Implementación

- **Asignación Dual:** Soporte para productos específicos y categorías completas
- **Validación Automática:** El sistema valida automáticamente si un producto aplica
- **Optimización de Consultas:** Consultas eficientes para grandes catálogos
- **Eliminación de Duplicados:** Manejo automático de productos duplicados
- **Escalabilidad:** Diseño preparado para manejar grandes volúmenes de productos

---

## 🚨 Manejo de Errores

### Errores Comunes

1. **Recompensa No Encontrada:**
   ```json
   {
     "success": false,
     "message": "Recompensa no encontrada"
   }
   ```

2. **Tipo Inválido:**
   ```json
   {
     "success": false,
     "message": "Errores de validación",
     "errors": {
       "tipo": ["El tipo debe ser producto o categoría"]
     }
   }
   ```

3. **Asignación Duplicada:**
   ```json
   {
     "success": false,
     "message": "Este producto ya está asignado a la recompensa"
   }
   ```

4. **Elemento Inactivo:**
   ```json
   {
     "success": false,
     "message": "No se puede asignar un producto inactivo"
   }
   ```

5. **Producto No Encontrado:**
   ```json
   {
     "success": false,
     "message": "El producto seleccionado no existe"
   }
   ```

### Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, DELETE) |
| 201 | Created | Producto/categoría asignado exitosamente |
| 400 | Bad Request | Parámetros malformados |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Recompensa, producto o categoría no encontrado |
| 422 | Unprocessable Entity | Errores de validación o asignación duplicada |
| 500 | Internal Server Error | Error interno del servidor |
