import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { 
  SegmentoAsignado, 
  SegmentoDisponible, 
  SegmentoFormData,
  EstadisticasSegmentacion,
  ValidacionCliente 
} from '../../../models/segmento.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-segmentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-segmentos.component.html',
  styleUrls: ['./recompensas-segmentos.component.scss']
})
export class RecompensasSegmentosComponent implements OnInit, OnDestroy {
  // Estados
  loading = false;
  loadingEstadisticas = false;
  activeTab = 'segmentos';
  
  // Datos
  segmentosAsignados: SegmentoAsignado[] = [];
  segmentosDisponibles: SegmentoDisponible[] = [];
  estadisticas: EstadisticasSegmentacion | null = null;
  
  // Formularios
  segmentoForm: FormGroup;
  validacionForm: FormGroup;
  
  // Modales
  showAgregarModal = false;
  showValidacionModal = false;
  validacionResultado: ValidacionCliente | null = null;
  
  // Permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;
  puedeVer = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.segmentoForm = this.fb.group({
      segmento: ['', Validators.required],
      cliente_id: ['']
    });
    
    this.validacionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      numero_documento: ['']
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.loadSegmentosDisponibles();
    this.loadSegmentosAsignados();
    this.loadEstadisticas();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkPermissions(): void {
    this.puedeCrear = this.permissionsService.hasPermission('recompensas.create');
    this.puedeEditar = this.permissionsService.hasPermission('recompensas.edit');
    this.puedeEliminar = this.permissionsService.hasPermission('recompensas.delete');
    this.puedeVer = this.permissionsService.hasPermission('recompensas.ver');
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    if (tab === 'estadisticas') {
      this.loadEstadisticas();
    }
  }
  
  onAgregarSegmento(): void {
    this.showAgregarModal = true;
  }
  
  onValidarCliente(): void {
    this.showValidacionModal = true;
  }
  
  onSubmitSegmento(): void {
    if (this.segmentoForm.invalid) return;
    
    this.loading = true;
    const formData: SegmentoFormData = this.segmentoForm.value;
    
    // Simular llamada a la API
    setTimeout(() => {
      this.loadSegmentosAsignados();
      this.loadEstadisticas();
      this.showAgregarModal = false;
      this.segmentoForm.reset();
      this.loading = false;
    }, 1000);
  }
  
  onSubmitValidacion(): void {
    if (this.validacionForm.invalid) return;
    
    this.loading = true;
    const formData = this.validacionForm.value;
    
    // Simular validación
    setTimeout(() => {
      this.validacionResultado = {
        cliente: {
          id: 1,
          nombre_completo: 'Juan Pérez',
          email: formData.email,
          numero_documento: formData.numero_documento,
          segmento_actual: 'regular'
        },
        cumple_recompensa: true,
        segmentos_cumplidos: [
          { segmento: 'regular', segmento_nombre: 'Cliente Regular' }
        ],
        total_segmentos_configurados: 3
      };
      this.loading = false;
    }, 1000);
  }
  
  onEliminarSegmento(segmento: SegmentoAsignado): void {
    if (!this.puedeEliminar) return;
    
    this.loading = true;
    
    // Simular eliminación
    setTimeout(() => {
      this.loadSegmentosAsignados();
      this.loadEstadisticas();
      this.loading = false;
    }, 1000);
  }
  
  onModalClosed(): void {
    this.showAgregarModal = false;
    this.showValidacionModal = false;
    this.validacionResultado = null;
    this.segmentoForm.reset();
    this.validacionForm.reset();
  }
  
  getSegmentoIcon(segmento: string): string {
    const icons: Record<string, string> = {
      'nuevos': 'ph-user-plus',
      'regulares': 'ph-user',
      'vip': 'ph-crown',
      'inactivos': 'ph-user-minus'
    };
    return icons[segmento] || 'ph-user';
  }
  
  getSegmentoColor(segmento: string): string {
    const colors: Record<string, string> = {
      'nuevos': 'bg-info',
      'regulares': 'bg-primary',
      'vip': 'bg-warning',
      'inactivos': 'bg-secondary'
    };
    return colors[segmento] || 'bg-light';
  }
  
  getSegmentoDescription(segmento: string): string {
    const segmentoData = this.segmentosDisponibles.find(s => s.value === segmento);
    return segmentoData ? segmentoData.descripcion : '';
  }
  
  private loadSegmentosDisponibles(): void {
    // Simular carga de segmentos disponibles
    this.segmentosDisponibles = [
      {
        value: 'nuevos',
        label: 'Clientes Nuevos',
        descripcion: 'Clientes que se registraron en los últimos 30 días'
      },
      {
        value: 'regulares',
        label: 'Clientes Regulares',
        descripcion: 'Clientes con actividad regular en los últimos 3 meses'
      },
      {
        value: 'vip',
        label: 'Clientes VIP',
        descripcion: 'Clientes con alto valor y frecuencia de compra'
      },
      {
        value: 'inactivos',
        label: 'Clientes Inactivos',
        descripcion: 'Clientes sin actividad en los últimos 6 meses'
      }
    ];
  }
  
  private loadSegmentosAsignados(): void {
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getSegmentosAsignados().subscribe({
    //   next: (data) => {
    //     this.segmentosAsignados = data;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando segmentos:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.segmentosAsignados = [];
      this.loading = false;
    }, 500);
  }
  
  private loadEstadisticas(): void {
    this.loadingEstadisticas = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getEstadisticasSegmentos().subscribe({
    //   next: (data) => {
    //     this.estadisticas = data;
    //     this.loadingEstadisticas = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando estadísticas:', error);
    //     this.loadingEstadisticas = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.estadisticas = {
        total_segmentos_configurados: 0,
        clientes_especificos: 0,
        segmentos_generales: 0,
        por_segmento: [],
        clientes_potenciales: {
          todos: 0,
          nuevos: 0,
          regulares: 0,
          vip: 0,
          inactivos: 0,
          distribuciones: {
            nuevos_porcentaje: 0,
            regulares_porcentaje: 0,
            vip_porcentaje: 0,
            inactivos_porcentaje: 0
          }
        },
        distribucion_por_segmento: [],
        efectividad_segmentos: []
      };
      this.loadingEstadisticas = false;
    }, 500);
  }
}
