# 💰 Módulo de Utilidades y Rentabilidad

## 🎯 ¿Qué es la Utilidad?

La **utilidad** es la ganancia real que obtienes después de restar todos los costos y gastos de tus ventas. Es el indicador más importante para saber si tu negocio es rentable.

---

## 📊 Tipos de Utilidad

### 1. **Utilidad Bruta**
```
Utilidad Bruta = Ventas - Costo de Ventas
```
- Es la ganancia antes de gastos operativos
- Solo considera el costo de los productos vendidos
- **Ejemplo:** Vendes una laptop en S/ 3,000, te costó S/ 2,000 → Utilidad Bruta = S/ 1,000

### 2. **Utilidad Operativa**
```
Utilidad Operativa = Utilidad Bruta - Gastos Operativos
```
- Considera los gastos del día a día (alquiler, sueldos, servicios)
- Muestra la rentabilidad de la operación del negocio
- **Ejemplo:** Utilidad Bruta S/ 1,000 - Gastos S/ 300 = Utilidad Operativa S/ 700

### 3. **Utilidad Neta**
```
Utilidad Neta = Utilidad Operativa - Otros Gastos + Otros Ingresos
```
- Es la ganancia final después de TODO
- Lo que realmente te queda en el bolsillo
- **Ejemplo:** Utilidad Operativa S/ 700 - Impuestos S/ 100 = Utilidad Neta S/ 600

---

## 📈 Márgenes de Utilidad

### Margen Bruto
```
Margen Bruto % = (Utilidad Bruta / Ventas) × 100
```
- **Ejemplo:** (S/ 1,000 / S/ 3,000) × 100 = 33.33%
- **Interpretación:** Por cada S/ 100 que vendes, ganas S/ 33.33 antes de gastos

### Margen Operativo
```
Margen Operativo % = (Utilidad Operativa / Ventas) × 100
```
- **Ejemplo:** (S/ 700 / S/ 3,000) × 100 = 23.33%
- **Interpretación:** Por cada S/ 100 que vendes, ganas S/ 23.33 después de gastos

### Margen Neto
```
Margen Neto % = (Utilidad Neta / Ventas) × 100
```
- **Ejemplo:** (S/ 600 / S/ 3,000) × 100 = 20%
- **Interpretación:** Por cada S/ 100 que vendes, te quedan S/ 20 limpios

---

## 🔧 Funcionalidades Implementadas

### ✅ 1. Calcular Utilidad por Venta
Calcula automáticamente la utilidad de cada venta individual.

**Endpoint:**
```bash
GET /api/contabilidad/utilidades/venta/{ventaId}
```

**Respuesta:**
```json
{
  "venta_id": 123,
  "fecha": "2025-10-19",
  "total_venta": 3000.00,
  "costo_total": 2000.00,
  "utilidad_bruta": 1000.00,
  "margen_porcentaje": 33.33,
  "detalles": [
    {
      "producto": "Laptop HP Pavilion",
      "cantidad": 1,
      "precio_venta": 3000.00,
      "costo_unitario": 2000.00,
      "utilidad": 1000.00,
      "margen": 33.33
    }
  ]
}
```

### ✅ 2. Reporte de Utilidades por Período
Analiza la rentabilidad de un período completo.

**Endpoint:**
```bash
GET /api/contabilidad/utilidades/reporte?fecha_inicio=2025-10-01&fecha_fin=2025-10-31
```

**Respuesta:**
```json
{
  "periodo": {
    "fecha_inicio": "2025-10-01",
    "fecha_fin": "2025-10-31"
  },
  "ventas": {
    "total": 125000.00,
    "cantidad": 45
  },
  "costos": {
    "costo_ventas": 85000.00,
    "gastos_operativos": 15000.00,
    "total_costos": 100000.00
  },
  "utilidad": {
    "utilidad_bruta": 40000.00,
    "margen_bruto": 32.00,
    "utilidad_operativa": 25000.00,
    "margen_operativo": 20.00,
    "utilidad_neta": 25000.00,
    "margen_neto": 20.00
  }
}
```

### ✅ 3. Utilidad por Producto
Identifica qué productos son más rentables.

**Endpoint:**
```bash
GET /api/contabilidad/utilidades/por-producto?fecha_inicio=2025-10-01&fecha_fin=2025-10-31
```

**Respuesta:**
```json
{
  "productos": [
    {
      "producto_id": 15,
      "codigo": "LAP-HP-001",
      "nombre": "Laptop HP Pavilion",
      "cantidad_vendida": 25,
      "precio_promedio": 2500.00,
      "costo_promedio": 1800.00,
      "total_ventas": 62500.00,
      "total_costos": 45000.00,
      "utilidad": 17500.00,
      "margen_porcentaje": 28.00
    }
  ],
  "resumen": {
    "total_ventas": 125000.00,
    "total_costos": 85000.00,
    "utilidad_total": 40000.00
  }
}
```

### ✅ 4. Gastos Operativos
Registra y controla todos los gastos del negocio.

**Categorías de Gastos:**
- ALQUILER
- SERVICIOS (luz, agua, internet)
- SUELDOS
- MARKETING
- TRANSPORTE
- MANTENIMIENTO
- IMPUESTOS
- OTROS

**Registrar Gasto:**
```bash
POST /api/contabilidad/utilidades/gastos
{
  "fecha": "2025-10-19",
  "categoria": "ALQUILER",
  "concepto": "Alquiler local octubre",
  "monto": 3000.00,
  "es_fijo": true,
  "es_recurrente": true,
  "comprobante_tipo": "recibo",
  "comprobante_numero": "001-123"
}
```

**Listar Gastos:**
```bash
GET /api/contabilidad/utilidades/gastos?fecha_inicio=2025-10-01&fecha_fin=2025-10-31
```

**Gastos por Categoría:**
```bash
GET /api/contabilidad/utilidades/gastos/por-categoria?fecha_inicio=2025-10-01
```

**Respuesta:**
```json
{
  "periodo": {
    "fecha_inicio": "2025-10-01",
    "fecha_fin": "2025-10-31"
  },
  "gastos_por_categoria": [
    { "categoria": "ALQUILER", "total": 3000.00 },
    { "categoria": "SUELDOS", "total": 8000.00 },
    { "categoria": "SERVICIOS", "total": 1500.00 },
    { "categoria": "MARKETING", "total": 2500.00 }
  ],
  "total_gastos": 15000.00
}
```

### ✅ 5. Utilidad Mensual
Calcula y guarda el resumen de utilidades de cada mes.

**Calcular Mes:**
```bash
POST /api/contabilidad/utilidades/mensual/{mes}/{anio}
# Ejemplo: POST /api/contabilidad/utilidades/mensual/10/2025
```

**Comparativa Anual:**
```bash
GET /api/contabilidad/utilidades/comparativa/2025
```

**Respuesta:**
```json
{
  "anio": 2025,
  "meses": [
    {
      "mes": 1,
      "total_ventas": 95000.00,
      "utilidad_bruta": 28500.00,
      "margen_bruto_porcentaje": 30.00,
      "gastos_operativos": 12000.00,
      "utilidad_neta": 16500.00,
      "margen_neto_porcentaje": 17.37
    },
    {
      "mes": 2,
      "total_ventas": 110000.00,
      "utilidad_bruta": 35200.00,
      "margen_bruto_porcentaje": 32.00,
      "gastos_operativos": 13000.00,
      "utilidad_neta": 22200.00,
      "margen_neto_porcentaje": 20.18
    }
  ],
  "totales": {
    "total_ventas": 205000.00,
    "total_costos": 143300.00,
    "utilidad_bruta": 63700.00,
    "gastos_operativos": 25000.00,
    "utilidad_neta": 38700.00
  }
}
```

### ✅ 6. Punto de Equilibrio
Calcula cuánto necesitas vender para cubrir tus gastos.

**Endpoint:**
```bash
GET /api/contabilidad/utilidades/punto-equilibrio?mes=10&anio=2025
```

**Respuesta:**
```json
{
  "mes": 10,
  "anio": 2025,
  "gastos_fijos": 12000.00,
  "margen_contribucion_porcentaje": 32.00,
  "punto_equilibrio_ventas": 37500.00,
  "ventas_actuales": 125000.00,
  "diferencia": 87500.00,
  "alcanzado": true
}
```

**Interpretación:**
- Necesitas vender S/ 37,500 para cubrir tus gastos fijos
- Actualmente vendes S/ 125,000
- Estás S/ 87,500 por encima del punto de equilibrio ✅

---

## 📊 Casos de Uso Reales

### Caso 1: Análisis Diario
```bash
# Ver utilidad del día
GET /api/contabilidad/utilidades/reporte?fecha_inicio=2025-10-19&fecha_fin=2025-10-19

# Resultado: Vendiste S/ 5,000, ganaste S/ 1,500 (30% de margen)
```

### Caso 2: Identificar Productos Rentables
```bash
# Ver qué productos dan más utilidad
GET /api/contabilidad/utilidades/por-producto?fecha_inicio=2025-10-01&fecha_fin=2025-10-31

# Resultado: 
# - Laptops: 28% de margen
# - Teclados: 45% de margen ← ¡Vender más de estos!
# - Monitores: 15% de margen ← Revisar precios
```

### Caso 3: Control de Gastos
```bash
# Registrar todos los gastos del mes
POST /api/contabilidad/utilidades/gastos
{
  "fecha": "2025-10-01",
  "categoria": "ALQUILER",
  "monto": 3000.00
}

# Ver en qué gastas más
GET /api/contabilidad/utilidades/gastos/por-categoria

# Resultado: Sueldos 53%, Alquiler 20%, Servicios 10%
```

### Caso 4: Proyección Mensual
```bash
# Calcular utilidad del mes
POST /api/contabilidad/utilidades/mensual/10/2025

# Comparar con meses anteriores
GET /api/contabilidad/utilidades/comparativa/2025

# Resultado: Octubre fue 15% mejor que Septiembre
```

---

## 🎯 Indicadores Clave (KPIs)

### 1. Margen Bruto Saludable
- **Retail tecnología:** 25% - 35%
- **Si tienes menos de 20%:** Revisar precios o costos
- **Si tienes más de 40%:** ¡Excelente!

### 2. Margen Neto Saludable
- **Retail:** 10% - 20%
- **Si tienes menos de 5%:** Reducir gastos
- **Si tienes más de 20%:** ¡Muy rentable!

### 3. Punto de Equilibrio
- **Ideal:** Alcanzarlo en la primera semana del mes
- **Crítico:** Si no lo alcanzas en 2 semanas

---

## 💡 Consejos para Mejorar Utilidad

### Aumentar Margen Bruto
1. ✅ Negociar mejores precios con proveedores
2. ✅ Vender más productos de alto margen
3. ✅ Ajustar precios de venta
4. ✅ Reducir mermas y pérdidas

### Reducir Gastos Operativos
1. ✅ Renegociar alquiler
2. ✅ Optimizar personal
3. ✅ Reducir servicios innecesarios
4. ✅ Automatizar procesos

### Aumentar Ventas
1. ✅ Marketing efectivo
2. ✅ Promociones estratégicas
3. ✅ Mejorar atención al cliente
4. ✅ Ampliar canales de venta

---

## 🗄️ Tablas Creadas

1. **utilidad_ventas** - Utilidad de cada venta
2. **utilidad_productos** - Utilidad por producto
3. **gastos_operativos** - Todos los gastos del negocio
4. **utilidad_mensual** - Resumen mensual de utilidades

---

## ✅ Checklist de Uso

### Diario
- [ ] Registrar gastos del día
- [ ] Revisar utilidad de ventas importantes

### Semanal
- [ ] Ver reporte de utilidades de la semana
- [ ] Identificar productos más rentables

### Mensual
- [ ] Calcular utilidad mensual
- [ ] Analizar gastos por categoría
- [ ] Comparar con mes anterior
- [ ] Calcular punto de equilibrio

---

**Implementado:** 19 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ COMPLETADO
