import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { 
  DashboardAnalytics, 
  FiltrosAnalytics, 
  AnalisisTendencias,
  AnalisisSegmentacion,
  AnalisisClientes 
} from '../../../models/analytics.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-analytics.component.html',
  styleUrls: ['./recompensas-analytics.component.scss']
})
export class RecompensasAnalyticsComponent implements OnInit, OnDestroy {
  // Estados
  loading = false;
  activeTab = 'dashboard';
  
  // Datos
  dashboardData: DashboardAnalytics | null = null;
  tendenciasData: AnalisisTendencias | null = null;
  segmentacionData: AnalisisSegmentacion | null = null;
  clientesData: AnalisisClientes | null = null;
  
  // Filtros
  filtrosForm: FormGroup;
  
  // Permisos
  puedeVer = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.filtrosForm = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
      tipo_recompensa: [''],
      segmento_cliente: [''],
      limite_clientes: [50]
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.setupDefaultDates();
    this.loadDashboardData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkPermissions(): void {
    this.puedeVer = this.permissionsService.hasPermission('recompensas.ver');
  }
  
  private setupDefaultDates(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.filtrosForm.patchValue({
      fecha_inicio: hace30Dias.toISOString().split('T')[0],
      fecha_fin: hoy.toISOString().split('T')[0]
    });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'tendencias':
        this.loadTendenciasData();
        break;
      case 'segmentacion':
        this.loadSegmentacionData();
        break;
      case 'clientes':
        this.loadClientesData();
        break;
    }
  }
  
  onFiltrosChange(): void {
    // Recargar datos con nuevos filtros
    switch (this.activeTab) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'tendencias':
        this.loadTendenciasData();
        break;
      case 'segmentacion':
        this.loadSegmentacionData();
        break;
      case 'clientes':
        this.loadClientesData();
        break;
    }
  }
  
  getTendenciaClass(direccion: string): string {
    switch (direccion) {
      case 'subida': return 'text-success';
      case 'bajada': return 'text-danger';
      default: return 'text-muted';
    }
  }
  
  getTendenciaIcon(direccion: string): string {
    switch (direccion) {
      case 'subida': return 'ph-trend-up';
      case 'bajada': return 'ph-trend-down';
      default: return 'ph-minus';
    }
  }
  
  private loadDashboardData(): void {
    this.loading = true;
    
    const filtros = this.filtrosForm.value;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getAnalyticsDashboard(filtros).subscribe({
    //   next: (data) => {
    //     this.dashboardData = data;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando analytics:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.dashboardData = {
        resumen_ejecutivo: {
          aplicaciones_mes: 0,
          clientes_activos_mes: 0,
          puntos_otorgados_mes: 0,
          crecimiento: {
            aplicaciones: { porcentaje: 0, direccion: 'estable', diferencia: 0 },
            clientes: { porcentaje: 0, direccion: 'estable', diferencia: 0 },
            puntos: { porcentaje: 0, direccion: 'estable', diferencia: 0 }
          }
        },
        top_recompensas: [],
        tendencias_semanales: [],
        distribucion_por_tipo: [],
        clientes_mas_activos: [],
        metadata: {
          generado_en: new Date().toISOString(),
          periodo_analisis: 'Sin datos disponibles',
          cache_valido_hasta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      };
      this.loading = false;
    }, 500);
  }
  
  private loadTendenciasData(): void {
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getAnalyticsTendencias().subscribe({
    //   next: (data) => {
    //     this.tendenciasData = data;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando tendencias:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.tendenciasData = {
        tendencias_diarias: [],
        comparativa_periodos: {
          periodo_actual: {
            aplicaciones: 0,
            clientes_unicos: 0,
            puntos_otorgados: 0,
            promedio_puntos_por_aplicacion: 0
          },
          periodo_anterior: {
            aplicaciones: 0,
            clientes_unicos: 0,
            puntos_otorgados: 0,
            promedio_puntos_por_aplicacion: 0
          },
          comparativa: {
            aplicaciones: { porcentaje: 0, direccion: 'estable', diferencia: 0 },
            clientes: { porcentaje: 0, direccion: 'estable', diferencia: 0 },
            puntos: { porcentaje: 0, direccion: 'estable', diferencia: 0 },
            promedio_puntos: { porcentaje: 0, direccion: 'estable', diferencia: 0 }
          }
        },
        patrones_identificados: {
          dia_semana_mas_activo: 'Sin datos',
          hora_pico: 'Sin datos',
          tendencia_crecimiento: 'estable',
          estacionalidad: []
        },
        metadata: {
          generado_en: new Date().toISOString(),
          periodo_analisis: {
            inicio: this.filtrosForm.get('fecha_inicio')?.value,
            fin: this.filtrosForm.get('fecha_fin')?.value
          },
          cache_valido_hasta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      };
      this.loading = false;
    }, 500);
  }
  
  private loadSegmentacionData(): void {
    this.loading = true;
    
    // Simular carga de datos de segmentación
    setTimeout(() => {
      this.segmentacionData = {
        resumen_general: {
          total_segmentos: 4,
          segmentos_activos: 3,
          clientes_activos: 890,
          aplicaciones_totales: 1250
        },
        por_segmento: [
          {
            segmento: 'vip',
            segmento_nombre: 'Clientes VIP',
            clientes_totales: 150,
            clientes_activos: 120,
            aplicaciones_totales: 450,
            puntos_otorgados: 22500,
            efectividad: 85.5,
            crecimiento_mensual: { porcentaje: 15.2, direccion: 'subida', diferencia: 20 }
          }
        ],
        comparativa_segmentos: {
          mejor_segmento: {
            segmento: 'vip',
            efectividad: 85.5
          },
          segmento_mas_creciente: {
            segmento: 'nuevos',
            crecimiento: 25.8
          }
        },
        metadata: {
          generado_en: new Date().toISOString(),
          periodo_analisis: 'Últimos 30 días',
          cache_valido_hasta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      };
      this.loading = false;
    }, 1000);
  }
  
  private loadClientesData(): void {
    this.loading = true;
    
    // Simular carga de datos de clientes
    setTimeout(() => {
      this.clientesData = {
        resumen: {
          total_clientes: 2500,
          clientes_activos: 890,
          clientes_nuevos_mes: 120,
          clientes_reactivados: 45
        },
        top_clientes: [],
        segmentacion_comportamiento: {
          clientes_frecuentes: 320,
          clientes_ocasionales: 450,
          clientes_inactivos: 120
        },
        patrones_identificados: {
          cliente_tipo_promedio: 'Ocasional',
          frecuencia_media: 2.3,
          puntos_promedio_por_cliente: 70.2
        },
        metadata: {
          generado_en: new Date().toISOString(),
          periodo_analisis: 'Últimos 30 días',
          cache_valido_hasta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      };
      this.loading = false;
    }, 1000);
  }
}
