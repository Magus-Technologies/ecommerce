# 💰 MÓDULO DE UTILIDADES - Guía Rápida

## 🎯 ¿Qué es?

El módulo de **UTILIDADES** te dice **cuánto GANAS realmente** en tu negocio.

---

## 💡 Conceptos Simples

### Utilidad = Lo que te queda después de pagar todo

```
Vendes una laptop en S/ 3,000
Te costó S/ 2,000
Gastos del mes S/ 300

Utilidad Bruta = S/ 3,000 - S/ 2,000 = S/ 1,000
Utilidad Neta = S/ 1,000 - S/ 300 = S/ 700 ← Esto es lo que GANAS
```

---

## 🚀 Funciones Principales

### 1. Ver utilidad de una venta
```bash
GET /api/contabilidad/utilidades/venta/123

# Te dice: Vendiste S/ 3,000, ganaste S/ 700 (23% de margen)
```

### 2. Ver utilidad del mes
```bash
GET /api/contabilidad/utilidades/reporte?fecha_inicio=2025-10-01&fecha_fin=2025-10-31

# Te dice: Vendiste S/ 125,000, ganaste S/ 25,000 (20% de margen)
```

### 3. Ver qué productos dan más ganancia
```bash
GET /api/contabilidad/utilidades/por-producto

# Te dice: 
# - Laptops: 28% de margen
# - Teclados: 45% de margen ← ¡Vender más!
# - Monitores: 15% de margen ← Revisar precios
```

### 4. Registrar gastos
```bash
POST /api/contabilidad/utilidades/gastos
{
  "fecha": "2025-10-19",
  "categoria": "ALQUILER",
  "concepto": "Alquiler octubre",
  "monto": 3000.00
}
```

### 5. Ver en qué gastas
```bash
GET /api/contabilidad/utilidades/gastos/por-categoria

# Te dice:
# - Sueldos: S/ 8,000 (53%)
# - Alquiler: S/ 3,000 (20%)
# - Servicios: S/ 1,500 (10%)
```

### 6. Punto de equilibrio
```bash
GET /api/contabilidad/utilidades/punto-equilibrio

# Te dice: Necesitas vender S/ 37,500 para cubrir gastos
# Actualmente vendes S/ 125,000 ✅
```

---

## 📊 Categorías de Gastos

Cuando registres gastos, usa estas categorías:

- **ALQUILER** - Renta del local
- **SERVICIOS** - Luz, agua, internet
- **SUELDOS** - Planilla
- **MARKETING** - Publicidad, redes sociales
- **TRANSPORTE** - Delivery, movilidad
- **MANTENIMIENTO** - Reparaciones
- **IMPUESTOS** - Tributos
- **OTROS** - Otros gastos

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Análisis Diario
```bash
# ¿Cuánto gané hoy?
GET /api/contabilidad/utilidades/reporte?fecha_inicio=2025-10-19&fecha_fin=2025-10-19

Respuesta:
- Ventas: S/ 5,000
- Costos: S/ 3,500
- Utilidad: S/ 1,500 (30% de margen) ✅
```

### Ejemplo 2: Identificar Productos Rentables
```bash
# ¿Qué productos me dan más ganancia?
GET /api/contabilidad/utilidades/por-producto

Respuesta:
1. Teclados mecánicos: 45% de margen ← ¡Vender más!
2. Laptops: 28% de margen
3. Monitores: 15% de margen ← Subir precio o cambiar proveedor
```

### Ejemplo 3: Control de Gastos
```bash
# ¿En qué estoy gastando más?
GET /api/contabilidad/utilidades/gastos/por-categoria

Respuesta:
- Sueldos: S/ 8,000 (53%) ← Mayor gasto
- Alquiler: S/ 3,000 (20%)
- Marketing: S/ 2,500 (17%)
- Servicios: S/ 1,500 (10%)

Acción: Revisar si puedes optimizar sueldos o renegociar alquiler
```

### Ejemplo 4: Proyección Mensual
```bash
# ¿Cómo va el mes?
POST /api/contabilidad/utilidades/mensual/10/2025

Respuesta:
- Ventas: S/ 125,000
- Costos: S/ 85,000
- Gastos: S/ 15,000
- Utilidad Neta: S/ 25,000 (20% de margen)

Comparado con mes anterior: +15% ✅
```

---

## 🎯 Márgenes Saludables

### Para Retail de Tecnología:

**Margen Bruto:**
- ❌ Menos de 20% - Muy bajo, revisar precios
- ⚠️ 20% - 25% - Bajo, mejorar
- ✅ 25% - 35% - Saludable
- 🎉 Más de 35% - Excelente

**Margen Neto:**
- ❌ Menos de 5% - Crítico
- ⚠️ 5% - 10% - Bajo
- ✅ 10% - 20% - Saludable
- 🎉 Más de 20% - Excelente

---

## 📅 Rutina Recomendada

### Diario
- ✅ Registrar gastos del día
- ✅ Ver utilidad de ventas grandes

### Semanal
- ✅ Ver reporte de utilidades
- ✅ Identificar productos rentables

### Mensual
- ✅ Calcular utilidad mensual
- ✅ Analizar gastos por categoría
- ✅ Comparar con mes anterior
- ✅ Calcular punto de equilibrio
- ✅ Tomar decisiones

---

## 🔥 Consejos para Aumentar Utilidad

### 1. Aumentar Margen
- Negociar mejores precios con proveedores
- Vender más productos de alto margen
- Ajustar precios de venta

### 2. Reducir Gastos
- Renegociar alquiler
- Optimizar personal
- Reducir servicios innecesarios

### 3. Vender Más
- Marketing efectivo
- Promociones estratégicas
- Mejorar atención al cliente

---

## ✅ Checklist Rápido

### Configuración Inicial
- [ ] Registrar gastos fijos (alquiler, sueldos)
- [ ] Marcar gastos recurrentes
- [ ] Categorizar todos los gastos

### Uso Diario
- [ ] Registrar gastos del día
- [ ] Revisar ventas importantes

### Análisis Mensual
- [ ] Calcular utilidad del mes
- [ ] Ver productos más rentables
- [ ] Analizar gastos
- [ ] Comparar con mes anterior

---

## 📞 Documentación Completa

Para más detalles, lee:
- `docs/MODULO-UTILIDADES.md` - Documentación técnica completa
- `docs/RESUMEN-FINAL-COMPLETO.md` - Resumen de todo el sistema

---

**Implementado:** 19 de Octubre, 2025  
**Estado:** ✅ LISTO PARA USAR

🎉 **¡Ahora puedes saber cuánto GANAS realmente!** 🎉
