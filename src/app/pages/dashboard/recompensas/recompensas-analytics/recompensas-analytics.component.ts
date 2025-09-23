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
    
    // Usar el servicio de recompensas para obtener analytics
    this.recompensasService.obtenerDashboardAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.analytics = response.data || this.getEmptyAnalytics();
          } else {
            this.analytics = this.getEmptyAnalytics();
          }
          this.loading = false;
          this.updateCharts();
        },
        error: (error: any) => {
          console.error('Error al cargar analytics:', error);
          this.showError('Error al cargar los datos de analytics');
          this.analytics = this.getEmptyAnalytics();
          this.loading = false;
          this.updateCharts();
        }
      });
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