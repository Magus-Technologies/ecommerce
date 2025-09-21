import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Modelos
import { 
  Recompensa, 
  FiltrosRecompensas, 
  Paginacion, 
  TipoRecompensa, 
  RecompensaFormData,
  EstadisticasRecompensas 
} from '../../../models/recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

// Componentes
import { RecompensaModalComponent } from '../recompensa-modal/recompensa-modal.component';
import { RecompensaEliminarModalComponent } from '../recompensa-eliminar-modal/recompensa-eliminar-modal.component';
import { RecompensaDetalleModalComponent } from '../recompensa-detalle-modal/recompensa-detalle-modal.component';

@Component({
  selector: 'app-recompensas-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RecompensaModalComponent,
    RecompensaEliminarModalComponent,
    RecompensaDetalleModalComponent
  ],
  templateUrl: './recompensas-gestion.component.html',
  styleUrls: ['./recompensas-gestion.component.scss']
})
export class RecompensasGestionComponent implements OnInit, OnDestroy {
  // Estados
  loading = false;
  loadingEstadisticas = false;
  
  // Datos
  recompensas: Recompensa[] = [];
  tiposRecompensas: TipoRecompensa[] = [];
  estadisticas: EstadisticasRecompensas | null = null;
  
  // Paginación
  paginacion: Paginacion | null = null;
  currentPage = 1;
  perPage = 25;
  
  // Filtros
  filtrosForm: FormGroup;
  filtros: FiltrosRecompensas = {};
  
  // Modales
  showCrearModal = false;
  showEditarModal = false;
  showEliminarModal = false;
  showDetalleModal = false;
  recompensaSeleccionada: Recompensa | null = null;
  
  // Permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;
  puedeVer = false;
  
  // Búsqueda
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      tipo: [''],
      activo: [''],
      vigente: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      buscar: [''],
      order_by: ['created_at'],
      order_direction: ['desc']
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.setupSearch();
    this.loadTiposRecompensas();
    this.loadRecompensas();
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
  
  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filtros.buscar = searchTerm;
        this.currentPage = 1;
        this.loadRecompensas();
      });
  }
  
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }
  
  onFiltrosChange(): void {
    this.filtros = { ...this.filtrosForm.value };
    this.currentPage = 1;
    this.loadRecompensas();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRecompensas();
  }
  
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.currentPage = 1;
    this.loadRecompensas();
  }
  
  onPerPageChangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const perPage = parseInt(target.value) || 25;
    this.onPerPageChange(perPage);
  }
  
  onCrearRecompensa(): void {
    this.recompensaSeleccionada = null;
    this.showCrearModal = true;
  }
  
  onEditarRecompensa(recompensa: Recompensa): void {
    this.recompensaSeleccionada = recompensa;
    this.showEditarModal = true;
  }
  
  onEliminarRecompensa(recompensa: Recompensa): void {
    this.recompensaSeleccionada = recompensa;
    this.showEliminarModal = true;
  }
  
  onVerDetalle(recompensa: Recompensa): void {
    this.recompensaSeleccionada = recompensa;
    this.showDetalleModal = true;
  }
  
  onRecompensaGuardada(): void {
    this.showCrearModal = false;
    this.showEditarModal = false;
    this.loadRecompensas();
    this.loadEstadisticas();
  }
  
  onRecompensaEliminada(): void {
    this.showEliminarModal = false;
    this.loadRecompensas();
    this.loadEstadisticas();
  }
  
  onModalClosed(): void {
    this.showCrearModal = false;
    this.showEditarModal = false;
    this.showEliminarModal = false;
    this.showDetalleModal = false;
    this.recompensaSeleccionada = null;
  }
  
  toggleActivarRecompensa(recompensa: Recompensa): void {
    if (!this.puedeEditar) return;
    
    this.loading = true;
    this.recompensasService.activarRecompensa(recompensa.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRecompensas();
            this.loadEstadisticas();
          }
        },
        error: (error) => {
          console.error('Error al activar/desactivar recompensa:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  getEstadoBadgeClass(activo: boolean, esVigente: boolean): string {
    if (!activo) return 'badge-secondary';
    if (esVigente) return 'badge-success';
    return 'badge-warning';
  }
  
  getEstadoText(activo: boolean, esVigente: boolean): string {
    if (!activo) return 'Inactiva';
    if (esVigente) return 'Vigente';
    return 'Expirada';
  }
  
  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'puntos': 'ph-coins',
      'descuento': 'ph-percent',
      'envio_gratis': 'ph-truck',
      'regalo': 'ph-gift'
    };
    return icons[tipo] || 'ph-question';
  }
  
  getPageNumbers(): number[] {
    if (!this.paginacion) return [];
    return this.recompensasService.getPageNumbers(this.currentPage, this.paginacion.last_page);
  }
  
  private loadRecompensas(): void {
    this.loading = true;
    
    const params = {
      ...this.filtros,
      page: this.currentPage,
      per_page: this.perPage
    };
    
    this.recompensasService.getRecompensas(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.recompensas = response.data.data;
            this.paginacion = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar recompensas:', error);
          // TODO: Mostrar mensaje de error al usuario
          // this.showError(this.recompensasService.getErrorMessage(error));
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  private loadTiposRecompensas(): void {
    this.recompensasService.getTiposRecompensas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tiposRecompensas = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar tipos de recompensas:', error);
          // TODO: Mostrar mensaje de error al usuario
          // this.showError(this.recompensasService.getErrorMessage(error));
        }
      });
  }
  
  private loadEstadisticas(): void {
    this.loadingEstadisticas = true;
    
    this.recompensasService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.estadisticas = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          // TODO: Mostrar mensaje de error al usuario
          // this.showError(this.recompensasService.getErrorMessage(error));
        },
        complete: () => {
          this.loadingEstadisticas = false;
        }
      });
  }
}
