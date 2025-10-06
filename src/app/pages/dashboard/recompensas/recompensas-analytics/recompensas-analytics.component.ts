import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RecompensasService } from '../../../../services/recompensas.service';
import { RecompensaAnalytics } from '../../../../models/recompensa-analytics.model';
import { TipoRecompensa } from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './recompensas-analytics.component.html',
  styleUrls: ['./recompensas-analytics.component.scss']
})
export class RecompensasAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('exportModal', { static: true }) exportModal!: TemplateRef<any>;
  @ViewChild('filterModal', { static: true }) filterModal!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  // Datos de analytics
  analytics: RecompensaAnalytics | null = null;
  loading = false;
  loadingCharts = false;
  periodoSeleccionado = 'Últimos 30 días';

  // Filtros
  filtros = {
    fecha_desde: '',
    fecha_hasta: '',
    tipo_recompensa: '',
    segmento: '',
    producto: ''
  };

  // Opciones para filtros
  tiposRecompensa: TipoRecompensa[] = ['puntos', 'descuento', 'envio_gratis', 'regalo'];
  segmentos: string[] = ['todos', 'nuevos', 'recurrentes', 'vip'];
  productos: string[] = ['todos', 'electronica', 'hogar', 'deportes'];

  // Referencias a los gráficos
  private charts: { [key: string]: any } = {};

  // Configuración de gráficos
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  private recompensasService = inject(RecompensasService);

  constructor() {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private loadAnalytics(): void {
    this.loading = true;
    
    // Para esta vista, cargaremos datos falsos (mock) para visualización
    setTimeout(() => {
      this.analytics = this.getFakeAnalytics();
      this.loading = false;
      this.updateCharts();
    }, 250);
  }

  private initializeCharts(): void {
    // Inicializar gráficos después de que se cargue el DOM
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  private createCharts(): void {
    this.createEvolucionTemporalChart();
    this.createDistribucionTipoChart();
    this.createConversionSegmentoChart();
    this.createTendenciaValoresChart();
  }

  private createEvolucionTemporalChart(): void {
    const ctx = document.getElementById('evolucionTemporalChart') as HTMLCanvasElement;
    if (!ctx) return;

    const data: any = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Aplicaciones',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Conversiones',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.charts['evolucionTemporal'] = new (window as any).Chart(ctx, {
      type: 'line',
      data,
      options: this.chartOptions
    });
  }

  private createDistribucionTipoChart(): void {
    const ctx = document.getElementById('distribucionTipoChart') as HTMLCanvasElement;
    if (!ctx) return;

    const data: any = {
      labels: ['Puntos', 'Descuentos', 'Envío Gratis', 'Regalos'],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: [
            '#ffc107',
            '#28a745',
            '#17a2b8',
            '#6f42c1'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };

    this.charts['distribucionTipo'] = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  private createConversionSegmentoChart(): void {
    const ctx = document.getElementById('conversionSegmentoChart') as HTMLCanvasElement;
    if (!ctx) return;

    const data: any = {
      labels: ['Nuevos', 'Regulares', 'VIP', 'Premium'],
      datasets: [
        {
          label: 'Tasa de Conversión (%)',
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgba(255, 193, 7, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(23, 162, 184, 0.8)',
            'rgba(111, 66, 193, 0.8)'
          ],
          borderColor: [
            '#ffc107',
            '#28a745',
            '#17a2b8',
            '#6f42c1'
          ],
          borderWidth: 2
        }
      ]
    };

    this.charts['conversionSegmento'] = new (window as any).Chart(ctx, {
      type: 'bar',
      data,
      options: this.chartOptions
    });
  }

  private createTendenciaValoresChart(): void {
    const ctx = document.getElementById('tendenciaValoresChart') as HTMLCanvasElement;
    if (!ctx) return;

    const data: any = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Valor Total (S/)',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'ROI (%)',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#fd7e14',
          backgroundColor: 'rgba(253, 126, 20, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };

    this.charts['tendenciaValores'] = new (window as any).Chart(ctx, {
      type: 'line',
      data,
      options: {
        ...this.chartOptions,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
  }

  private updateCharts(): void {
    // Actualizar datos de los gráficos con los datos reales
    if (this.analytics) {
      // Actualizar gráfico de evolución temporal
      if (this.charts['evolucionTemporal']) {
        const evolucionData = this.analytics.dashboard.graficos_principales.evolucion_temporal;
        this.charts['evolucionTemporal'].data.labels = evolucionData.map(d => d.label);
        this.charts['evolucionTemporal'].data.datasets[0].data = evolucionData.map(d => d.y);
        this.charts['evolucionTemporal'].update();
      }

      // Actualizar gráfico de distribución por tipo
      if (this.charts['distribucionTipo']) {
        const distribucionData = this.analytics.dashboard.graficos_principales.distribucion_por_tipo;
        this.charts['distribucionTipo'].data.labels = distribucionData.map(d => d.label);
        this.charts['distribucionTipo'].data.datasets[0].data = distribucionData.map(d => d.y);
        this.charts['distribucionTipo'].update();
      }

      // Actualizar gráfico de conversión por segmento
      if (this.charts['conversionSegmento']) {
        const conversionData = this.analytics.dashboard.graficos_principales.conversion_por_segmento;
        this.charts['conversionSegmento'].data.labels = conversionData.map(d => d.label);
        this.charts['conversionSegmento'].data.datasets[0].data = conversionData.map(d => d.y);
        this.charts['conversionSegmento'].update();
      }

      // Actualizar gráfico de tendencia de valores
      if (this.charts['tendenciaValores']) {
        const tendenciaData = this.analytics.dashboard.graficos_principales.tendencia_valores;
        this.charts['tendenciaValores'].data.labels = tendenciaData.map(d => d.label);
        this.charts['tendenciaValores'].data.datasets[0].data = tendenciaData.map(d => d.y);
        this.charts['tendenciaValores'].update();
      }
    }
  }

  private destroyCharts(): void {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  // Métodos para filtros
  aplicarFiltros(): void {
    this.loadAnalytics();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fecha_desde: '',
      fecha_hasta: '',
      tipo_recompensa: '',
      segmento: '',
      producto: ''
    };
    this.aplicarFiltros();
  }

  // Métodos para exportación
  exportarExcel(): void {
    this.showSuccess('Exportando datos a Excel...');
  }

  exportarPDF(): void {
    this.showSuccess('Exportando datos a PDF...');
  }

  exportarCSV(): void {
    this.showSuccess('Exportando datos a CSV...');
  }

  // Métodos para modales
  openExportModal(): void {
    // Implementar con sistema de modales
  }

  openFilterModal(): void {
    // Implementar con sistema de modales
  }

  // Métodos auxiliares
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  formatearPorcentaje(valor: number): string {
    return `${valor.toFixed(1)}%`;
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-PE').format(valor);
  }

  getTendenciaClass(tendencia: string): string {
    const classes: { [key: string]: string } = {
      'creciente': 'text-success',
      'decreciente': 'text-danger',
      'estable': 'text-warning'
    };
    return classes[tendencia] || 'text-muted';
  }

  getTendenciaIcon(tendencia: string): string {
    const icons: { [key: string]: string } = {
      'creciente': 'fas fa-arrow-up',
      'decreciente': 'fas fa-arrow-down',
      'estable': 'fas fa-minus'
    };
    return icons[tendencia] || 'fas fa-question';
  }

  private showError(message: string): void {
    console.error(message);
    // Implementar sistema de notificaciones
  }

  private showSuccess(message: string): void {
    console.log(message);
    // Implementar sistema de notificaciones
  }

  // ====== MOCK DATA PARA DEMO ======
  private getFakeAnalytics(): RecompensaAnalytics {
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const evol = meses.slice(0, 8).map((m, i) => ({ x: m, y: Math.round(150 + Math.sin(i/2)*40 + i*10), label: m }));
    const conv = ['Nuevos','Regulares','VIP','Premium'].map((s, i) => ({ x: s, y: [8.5, 12.3, 18.9, 15.1][i], label: s }));
    const dist = [
      { tipo: 'puntos', tipo_nombre: 'Puntos', cantidad: 350, porcentaje: 35, valor_total: 24000, conversion_rate: 10.2 },
      { tipo: 'descuento', tipo_nombre: 'Descuentos', cantidad: 420, porcentaje: 42, valor_total: 43000, conversion_rate: 14.1 },
      { tipo: 'envio_gratis', tipo_nombre: 'Envío Gratis', cantidad: 120, porcentaje: 12, valor_total: 9000, conversion_rate: 8.3 },
      { tipo: 'regalo', tipo_nombre: 'Regalos', cantidad: 110, porcentaje: 11, valor_total: 9600, conversion_rate: 9.5 }
    ];
    const distGraph = [
      { x: 'Puntos', y: 35 },
      { x: 'Descuentos', y: 42 },
      { x: 'Envío Gratis', y: 12 },
      { x: 'Regalos', y: 11 }
    ];
    const trend = meses.slice(0, 8).map((m, i) => ({ x: m, y: Math.round(20000 + i*3500 + (i%3)*1200), label: m }));

    const base = this.getEmptyAnalytics();
    const fake: RecompensaAnalytics = {
      dashboard: {
        resumen_general: {
          total_recompensas_activas: 12,
          total_recompensas_este_mes: 5,
          total_clientes_beneficiados: 1348,
          valor_total_beneficios: 85640,
          conversion_rate_promedio: 12.7,
          crecimiento_mensual: 7.4
        },
        metricas_principales: {
          recompensas_por_tipo: dist,
          top_recompensas: [
            { id: 1, nombre: 'Bienvenida 10%', tipo: 'descuento', aplicaciones: 420, clientes_beneficiados: 330, valor_beneficios: 18560, conversion_rate: 18.4, efectividad: 92 },
            { id: 2, nombre: 'Puntos Doble', tipo: 'puntos', aplicaciones: 360, clientes_beneficiados: 290, valor_beneficios: 15340, conversion_rate: 14.2, efectividad: 86 },
            { id: 3, nombre: 'Envío Gratis Finde', tipo: 'envio_gratis', aplicaciones: 210, clientes_beneficiados: 180, valor_beneficios: 9600, conversion_rate: 9.8, efectividad: 74 }
          ],
          clientes_mas_activos: [
            { id: 101, nombre: 'Juan Pérez', email: 'juan@example.com', total_recompensas: 18, valor_beneficios: 540, ultima_actividad: '2025-09-28', segmento: 'VIP' },
            { id: 102, nombre: 'María García', email: 'maria@example.com', total_recompensas: 15, valor_beneficios: 420, ultima_actividad: '2025-09-26', segmento: 'Recurrentes' },
            { id: 103, nombre: 'Carlos Díaz', email: 'carlos@example.com', total_recompensas: 12, valor_beneficios: 380, ultima_actividad: '2025-09-25', segmento: 'Recurrentes' }
          ],
          productos_mas_recompensados: [
            { id: 501, nombre: 'Mouse Inalámbrico', codigo: 'MS-100', veces_recompensado: 140, valor_total_recompensado: 3500, categoria: 'Accesorios' },
            { id: 502, nombre: 'Teclado Mecánico', codigo: 'KB-200', veces_recompensado: 120, valor_total_recompensado: 4800, categoria: 'Accesorios' }
          ],
          zonas_mas_activas: [
            { codigo: 'LIM', nombre: 'Lima', total_aplicaciones: 2200, valor_beneficios: 42000, porcentaje_participacion: 46 },
            { codigo: 'ARE', nombre: 'Arequipa', total_aplicaciones: 680, valor_beneficios: 12800, porcentaje_participacion: 14 }
          ]
        },
        graficos_principales: {
          evolucion_temporal: evol,
          distribucion_por_tipo: distGraph,
          conversion_por_segmento: conv,
          tendencia_valores: trend
        },
        alertas: [
          { id: 'a1', tipo: 'info', titulo: 'Tendencia positiva', mensaje: 'La conversión subió 2.1% vs mes anterior', fecha: new Date().toISOString(), accion_requerida: false },
          { id: 'a2', tipo: 'warning', titulo: 'Segmento Premium bajo', mensaje: 'Baja participación en segmento Premium', fecha: new Date().toISOString(), accion_requerida: false }
        ],
        recomendaciones: [
          { id: 'r1', categoria: 'optimizacion', titulo: 'Probar A/B en CTA', descripcion: 'Testear variantes del texto del botón del descuento', impacto_estimado: 'medio', facilidad_implementacion: 'alta', accion_sugerida: 'Crear experimento A/B' },
          { id: 'r2', categoria: 'nuevas_campanas', titulo: 'Visibilidad Envío Gratis', descripcion: 'Resaltar campaña de envío gratis en home', impacto_estimado: 'alto', facilidad_implementacion: 'media', accion_sugerida: 'Añadir banner promocional' }
        ]
      },
      rendimiento: {
        metricas_rendimiento: {
          conversion_rate: 13.8,
          valor_promedio_beneficio: 42.5,
          tiempo_promedio_aplicacion: 2.4,
          tasa_abandono: 5.2,
          retorno_inversion: 165,
          costo_por_adquisicion: 7.8
        },
        analisis_efectividad: {
          recompensas_mas_efectivas: [
            { id: 1, nombre: 'Bienvenida 10%', tipo: 'descuento', efectividad: 92, conversion_rate: 18.4, valor_beneficios: 18560, razones_exito: ['Fácil de entender','Alta visibilidad'] },
            { id: 2, nombre: 'Puntos Doble', tipo: 'puntos', efectividad: 86, conversion_rate: 14.2, valor_beneficios: 15340, razones_exito: ['Recompensa acumulativa','Clientes fieles'] }
          ],
          recompensas_menos_efectivas: [
            { id: 3, nombre: 'Regalo Misterioso', tipo: 'regalo', efectividad: 61, conversion_rate: 8.1, valor_beneficios: 6240, razones_exito: ['Segmentación amplia'] }
          ],
          factores_exito: [
            { factor: 'Mensaje claro', impacto: 0.8, descripcion: 'CTA directo incrementa la conversión', recomendaciones: ['Usar verbos de acción','Mantener corto el texto'] },
            { factor: 'Segmentación', impacto: 0.7, descripcion: 'Segmentos VIP responden mejor a puntos', recomendaciones: ['Ofrecer multiplicadores a VIP'] }
          ],
          areas_mejora: [
            { area: 'Timing de envío', problema: 'Baja apertura en mañanas', impacto: 0.6, solucion_sugerida: 'Enviar 6-9pm', prioridad: 'media' }
          ]
        },
        comparacion_periodos: {
          periodo_actual: {
            fecha_inicio: '2025-09-01',
            fecha_fin: '2025-09-30',
            total_recompensas: 12,
            total_aplicaciones: 4210,
            conversion_rate: 12.7,
            valor_beneficios: 85640
          },
          periodo_anterior: {
            fecha_inicio: '2025-08-01',
            fecha_fin: '2025-08-31',
            total_recompensas: 11,
            total_aplicaciones: 3920,
            conversion_rate: 11.5,
            valor_beneficios: 80210
          },
          cambios: [
            { metrica: 'aplicaciones', valor_actual: 4210, valor_anterior: 3920, cambio_absoluto: 290, cambio_porcentual: 7.4, tendencia: 'creciente' },
            { metrica: 'conversion_rate', valor_actual: 12.7, valor_anterior: 11.5, cambio_absoluto: 1.2, cambio_porcentual: 10.4, tendencia: 'creciente' }
          ]
        },
        insights: [
          { id: 'i1', tipo: 'oportunidad', titulo: 'Alta respuesta a descuentos', descripcion: 'Los descuentos superan al resto en 7 pts.', datos_soporte: {}, accion_recomendada: 'Incrementar presupuesto en descuentos', urgencia: 'media' }
        ]
      },
      tendencias: {
        tendencias_temporales: [
          { metrica: 'aplicaciones', periodo: 'mensual', datos: evol, tendencia: 'creciente', fuerza_tendencia: 0.78, significancia: 0.9 }
        ],
        patrones_estacionales: [
          { patron: 'fin_de_semana', descripcion: 'Mayor uso sábados', frecuencia: 'semanal', impacto: 0.6, recomendaciones: ['Focalizar campañas viernes-sábado'] }
        ],
        proyecciones: {
          proyeccion_conversion: { metrica: 'conversion', valores_historicos: evol, valores_proyectados: evol.map(p=>({ ...p, y: Math.round((p.y as number)*1.05) })), confianza: 0.82, intervalo_confianza: { inferior: evol.map(p=>({ ...p, y: (p.y as number)*0.98 })), superior: evol.map(p=>({ ...p, y: (p.y as number)*1.12 })) } },
          proyeccion_valores: { metrica: 'valor', valores_historicos: trend, valores_proyectados: trend.map(p=>({ ...p, y: Math.round((p.y as number)*1.08) })), confianza: 0.79, intervalo_confianza: { inferior: trend.map(p=>({ ...p, y: (p.y as number)*0.95 })), superior: trend.map(p=>({ ...p, y: (p.y as number)*1.15 })) } },
          proyeccion_clientes: { metrica: 'clientes', valores_historicos: evol, valores_proyectados: evol.map(p=>({ ...p, y: (p.y as number)*1.03 })), confianza: 0.77, intervalo_confianza: { inferior: evol.map(p=>({ ...p, y: (p.y as number)*0.96 })), superior: evol.map(p=>({ ...p, y: (p.y as number)*1.1 })) } },
          escenarios: [
            { nombre: 'conservador', descripcion: 'Crecimiento leve', probabilidad: 0.4, valores_proyectados: trend.map(p=>({ ...p, y: (p.y as number)*1.03 })), factores_clave: ['estacionalidad'] },
            { nombre: 'optimista', descripcion: 'Campañas exitosas', probabilidad: 0.35, valores_proyectados: trend.map(p=>({ ...p, y: (p.y as number)*1.15 })), factores_clave: ['segmentación','promos'] }
          ]
        },
        ciclos_vida: [
          { fase: 'lanzamiento', duracion_promedio: 15, caracteristicas: ['alto interés inicial'], metricas_tipicas: {}, recomendaciones: ['reforzar awareness'] },
          { fase: 'madurez', duracion_promedio: 45, caracteristicas: ['rendimiento estable'], metricas_tipicas: {}, recomendaciones: ['optimizaciones menores'] }
        ]
      },
      comparativa: {
        comparacion_tipos: [
          { tipo: 'descuento', tipo_nombre: 'Descuentos', metricas: { aplicaciones: 2100, conversion_rate: 15.2, valor_beneficios: 43000, costo_implementacion: 9000, roi: 378 }, ranking: 1, fortalezas: ['rápida adopción'], debilidades: ['sensibilidad a margen'] },
          { tipo: 'puntos', tipo_nombre: 'Puntos', metricas: { aplicaciones: 1600, conversion_rate: 12.1, valor_beneficios: 24000, costo_implementacion: 6000, roi: 300 }, ranking: 2, fortalezas: ['fidelización'], debilidades: ['resultado más lento'] }
        ],
        comparacion_segmentos: [
          { segmento: 'Nuevos', metricas: { clientes: 520, aplicaciones: 980, conversion_rate: 9.2, valor_promedio_beneficio: 25, frecuencia_uso: 1.3 }, ranking: 3, caracteristicas: ['sensible a descuentos'] },
          { segmento: 'VIP', metricas: { clientes: 120, aplicaciones: 480, conversion_rate: 19.1, valor_promedio_beneficio: 68, frecuencia_uso: 2.1 }, ranking: 1, caracteristicas: ['alto ticket'] }
        ],
        comparacion_productos: [
          { producto: 'Laptop A', categoria: 'Electrónica', metricas: { veces_recompensado: 120, valor_total_recompensado: 22000, conversion_rate: 13.4, popularidad: 78 }, ranking: 1, tendencia: 'creciente' },
          { producto: 'Silla Gamer', categoria: 'Hogar', metricas: { veces_recompensado: 80, valor_total_recompensado: 9600, conversion_rate: 10.2, popularidad: 66 }, ranking: 2, tendencia: 'estable' }
        ],
        benchmarking: {
          metricas_industria: { conversion_rate_promedio: 11.2, valor_beneficio_promedio: 38, frecuencia_uso_promedio: 1.6 },
          posicion_actual: { conversion_rate: 12.7, valor_beneficio: 42.5, frecuencia_uso: 1.8 },
          gaps: [ { metrica: 'conversion_rate', gap_actual: 1.5, gap_objetivo: 2.3, accion_requerida: 'Optimizar mensajes' } ]
        }
      },
      segmentos: {
        analisis_segmentos: [
          { segmento: 'Nuevos', caracteristicas: ['precio'], metricas: { total_clientes: 800, clientes_activos: 520, aplicaciones: 980, conversion_rate: 9.2, valor_beneficios: 20000, frecuencia_uso: 1.3 }, comportamiento: { patrones_compra: ['fin de semana'], preferencias_recompensas: ['descuento'], horarios_actividad: ['19-22h'], canales_preferidos: ['web'] }, potencial: { crecimiento_estimado: 0.12, oportunidades_expansion: ['email onboarding'], riesgos: ['deserción'] } },
          { segmento: 'VIP', caracteristicas: ['alta lealtad'], metricas: { total_clientes: 150, clientes_activos: 120, aplicaciones: 480, conversion_rate: 19.1, valor_beneficios: 32000, frecuencia_uso: 2.1 }, comportamiento: { patrones_compra: ['tickets altos'], preferencias_recompensas: ['puntos','regalos'], horarios_actividad: ['18-21h'], canales_preferidos: ['app'] }, potencial: { crecimiento_estimado: 0.08, oportunidades_expansion: ['club VIP'], riesgos: ['canibalización de margen'] } }
        ],
        segmentacion_efectiva: { segmentos_mas_efectivos: ['VIP','Recurrentes'], segmentos_menos_efectivos: ['Nuevos'], factores_diferenciacion: ['ticket','frecuencia'], recomendaciones_optimizacion: ['incentivos escalonados'] },
        oportunidades_segmentacion: [ { oportunidad: 'Bundle gaming', descripcion: 'Armar combos con envío gratis', segmento_objetivo: 'Recurrentes', potencial_impacto: 0.6, facilidad_implementacion: 'media', accion_sugerida: 'Crear campaña bundle' } ]
      },
      productos: {
        analisis_productos: [ { producto: 'Laptop A', categoria: 'Electrónica', metricas: { veces_recompensado: 120, valor_total_recompensado: 22000, conversion_rate: 13.4, popularidad: 78, rentabilidad: 0.22 }, comportamiento: { estacionalidad: ['back to school'], tendencias: ['alto interés'], correlaciones: ['accesorios'] }, potencial: { crecimiento_estimado: 0.15, oportunidades_expansion: ['packs'], limitaciones: ['stock'] } } ],
        categorias_mas_efectivas: [ { categoria: 'Electrónica', efectividad: 81, metricas: { productos_incluidos: 35, aplicaciones: 1600, conversion_rate: 13.2, valor_beneficios: 42000 }, fortalezas: ['ticket'], areas_mejora: ['logística'] } ],
        oportunidades_productos: [ { oportunidad: 'Accesorios 2x1', descripcion: 'Impulsar ventas cruzadas', productos_afectados: ['Mouse','Teclados'], potencial_impacto: 0.5, facilidad_implementacion: 'alta', accion_sugerida: 'Crear cupones 2x1' } ]
      }
    };

    return fake;
  }

  private getEmptyAnalytics(): RecompensaAnalytics {
    return {
      dashboard: {
        resumen_general: {
          total_recompensas_activas: 0,
          total_recompensas_este_mes: 0,
          total_clientes_beneficiados: 0,
          valor_total_beneficios: 0,
          conversion_rate_promedio: 0,
          crecimiento_mensual: 0
        },
        metricas_principales: {
          recompensas_por_tipo: [],
          top_recompensas: [],
          clientes_mas_activos: [],
          productos_mas_recompensados: [],
          zonas_mas_activas: []
        },
        graficos_principales: {
          evolucion_temporal: [],
          distribucion_por_tipo: [],
          conversion_por_segmento: [],
          tendencia_valores: []
        },
        alertas: [],
        recomendaciones: []
      },
      rendimiento: {
        metricas_rendimiento: {
          conversion_rate: 0,
          valor_promedio_beneficio: 0,
          tiempo_promedio_aplicacion: 0,
          tasa_abandono: 0,
          retorno_inversion: 0,
          costo_por_adquisicion: 0
        },
        analisis_efectividad: {
          recompensas_mas_efectivas: [],
          recompensas_menos_efectivas: [],
          factores_exito: [],
          areas_mejora: []
        },
        comparacion_periodos: {
          periodo_actual: {
            fecha_inicio: '',
            fecha_fin: '',
            total_recompensas: 0,
            total_aplicaciones: 0,
            conversion_rate: 0,
            valor_beneficios: 0
          },
          periodo_anterior: {
            fecha_inicio: '',
            fecha_fin: '',
            total_recompensas: 0,
            total_aplicaciones: 0,
            conversion_rate: 0,
            valor_beneficios: 0
          },
          cambios: []
        },
        insights: []
      },
      tendencias: {
        tendencias_temporales: [],
        patrones_estacionales: [],
        proyecciones: {
          proyeccion_conversion: {
            metrica: '',
            valores_historicos: [],
            valores_proyectados: [],
            confianza: 0,
            intervalo_confianza: { inferior: [], superior: [] }
          },
          proyeccion_valores: {
            metrica: '',
            valores_historicos: [],
            valores_proyectados: [],
            confianza: 0,
            intervalo_confianza: { inferior: [], superior: [] }
          },
          proyeccion_clientes: {
            metrica: '',
            valores_historicos: [],
            valores_proyectados: [],
            confianza: 0,
            intervalo_confianza: { inferior: [], superior: [] }
          },
          escenarios: []
        },
        ciclos_vida: []
      },
      comparativa: {
        comparacion_tipos: [],
        comparacion_segmentos: [],
        comparacion_productos: [],
        benchmarking: {
          metricas_industria: {
            conversion_rate_promedio: 0,
            valor_beneficio_promedio: 0,
            frecuencia_uso_promedio: 0
          },
          posicion_actual: {
            conversion_rate: 0,
            valor_beneficio: 0,
            frecuencia_uso: 0
          },
          gaps: []
        }
      },
      segmentos: {
        analisis_segmentos: [],
        segmentacion_efectiva: {
          segmentos_mas_efectivos: [],
          segmentos_menos_efectivos: [],
          factores_diferenciacion: [],
          recomendaciones_optimizacion: []
        },
        oportunidades_segmentacion: []
      },
      productos: {
        analisis_productos: [],
        categorias_mas_efectivas: [],
        oportunidades_productos: []
      }
    };
  }

  // Métodos faltantes para el template
  cambiarPeriodo(periodo: string): void {
    console.log('Cambiando período a:', periodo);
    // Implementar lógica de cambio de período
  }

  exportarReporte(): void {
    console.log('Exportando reporte...');
    // Implementar lógica de exportación
  }

  actualizarDatos(): void {
    console.log('Actualizando datos...');
    this.loadAnalytics();
  }
}