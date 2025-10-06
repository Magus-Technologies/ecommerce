import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PopupsService } from '../../../../services/popups.service';
import { RecompensasService } from '../../../../services/recompensas.service';
import {
  RecompensaConPopups,
  PopupFilters,
  Popup,
  PopupCreateRequest,
  PopupUpdateRequest
} from '../../../../models/popup.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-recompensas-popups-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recompensas-popups-list.component.html',
  styleUrls: ['./recompensas-popups-list.component.scss']
})
export class RecompensasPopupsListComponent implements OnInit, OnDestroy {
  // Datos principales
  popups: Popup[] = [];
  loading = false;
  error: string | null = null;

  // Filtros de búsqueda
  filtros: any = {
    nombre: '',
    tipo: 'todos',
    estado: 'todos',
    vigente: false,
    page: 1,
    per_page: 12
  };

  // Opciones de filtros
  tiposRecompensa = [
    { value: 'todos', label: 'Todos' },
    { value: 'puntos', label: 'Puntos' },
    { value: 'descuento', label: 'Descuento' },
    { value: 'envio_gratis', label: 'Envío Gratis' },
    { value: 'regalo', label: 'Regalo' },
    { value: 'nivel_cliente', label: 'Nivel Cliente' }
  ];

  estadosRecompensa = [
    { value: 'todos', label: 'Todos' },
    { value: 'activa', label: 'Activa' },
    { value: 'programada', label: 'Programada' },
    { value: 'pausada', label: 'Pausada' }
  ];

  // Paginación
  totalPopups = 0;
  currentPage = 1;
  lastPage = 1;
  perPage = 12;

  // Modal de detalles
  showPopupDetailModal = false;
  selectedPopup: Popup | null = null;
  loadingPopupDetail = false;

  constructor(
    public router: Router,
    private http: HttpClient,
    private popupsService: PopupsService,
    private recompensasService: RecompensasService
  ) {}

  ngOnInit(): void {
    this.cargarPopups();
  }

  ngOnDestroy(): void {
    // Limpiar URLs blob para evitar memory leaks
    this.imagePreviewCache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.imagePreviewCache.clear();
  }

  // ===== MÉTODOS PRINCIPALES =====

  cargarPopups(): void {
    this.loading = true;
    this.error = null;
    this.popups = [];

    console.log('🔍 Cargando todos los popups con filtros:', this.filtros);

    // Primero obtener todas las recompensas
    this.obtenerRecompensasConPopups();
  }

  obtenerRecompensasConPopups(): void {
    // Construir parámetros según la documentación del endpoint
    let params = new HttpParams();
    
    if (this.filtros.nombre && this.filtros.nombre.trim() !== '') {
      params = params.set('nombre', this.filtros.nombre.trim());
    }
    
    if (this.filtros.tipo && this.filtros.tipo !== 'todos') {
      params = params.set('tipo', this.filtros.tipo);
    }
    
    if (this.filtros.vigente !== undefined && this.filtros.vigente !== false) {
      params = params.set('vigente', this.filtros.vigente.toString());
    }
    
    if (this.filtros.page && this.filtros.page > 1) {
      params = params.set('page', this.filtros.page.toString());
    }
    
    if (this.filtros.per_page && this.filtros.per_page !== 12) {
      params = params.set('per_page', this.filtros.per_page.toString());
    }

    console.log('Parámetros enviados al endpoint:', params.toString());

    this.http.get(`${environment.apiUrl}/admin/recompensas/popups`, {
      params: params
    }).subscribe({
      next: (response: any) => {
        console.log('Respuesta del endpoint de recompensas:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Obtener popups de cada recompensa
          this.obtenerPopupsDeRecompensas(response.data);
        } else {
          this.popups = [];
          this.error = 'No se encontraron recompensas';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error cargando recompensas:', error);
        this.error = 'Error al cargar recompensas';
        this.popups = [];
        this.loading = false;
      }
    });
  }

  obtenerPopupsDeRecompensas(recompensas: any[]): void {
    const promises = recompensas.map(recompensa => {
      return new Promise<Popup[]>((resolve) => {
        this.http.get(`${environment.apiUrl}/admin/recompensas/${recompensa.id}/popups`).subscribe({
          next: (response: any) => {
            if (response.success && response.data && response.data.popups) {
              // Agregar información de la recompensa a cada popup
              const popups = response.data.popups.map((popup: any) => ({
                ...popup,
                recompensa_info: {
                  id: recompensa.id,
                  nombre: recompensa.nombre,
                  tipo: recompensa.tipo,
                  estado: recompensa.estado
                }
              }));
              resolve(popups);
            } else {
              resolve([]);
            }
          },
          error: (error) => {
            console.error(`Error cargando popups de recompensa ${recompensa.id}:`, error);
            resolve([]);
          }
        });
      });
    });

    Promise.all(promises).then((popupsArrays) => {
      // Combinar todos los popups en un solo array
      this.popups = popupsArrays.flat();
      this.totalPopups = this.popups.length;
      this.currentPage = this.filtros.page;
      this.loading = false;
      
      console.log('✅ Todos los popups cargados:', this.popups);
    });
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTROS =====

  buscar(): void {
    console.log('🔍 Aplicando filtros:', this.filtros);
    this.filtros.page = 1;
    this.cargarPopups();
  }

  limpiarFiltros(): void {
    this.filtros = {
      nombre: '',
      tipo: 'todos',
      estado: 'todos',
      vigente: false,
      page: 1,
      per_page: 12
    };
    this.cargarPopups();
  }

  // ===== MÉTODOS DE PAGINACIÓN =====

  cambiarPagina(pagina: number): void {
    this.filtros.page = pagina;
    this.cargarPopups();
  }

  // ===== MÉTODOS DE POPUP =====

  verDetallePopup(popup: Popup): void {
    this.selectedPopup = popup;
    this.showPopupDetailModal = true;
  }

  cerrarModalDetalle(): void {
    this.showPopupDetailModal = false;
    this.selectedPopup = null;
  }

  togglePopup(popup: Popup): void {
    const recompensaId = popup.recompensa_id || popup.recompensa_info?.id || popup.recompensa?.id;
    if (!recompensaId) {
      return;
    }
    this.popupsService.togglePopup(recompensaId as number, popup.id).subscribe({
      next: (response) => {
        const index = this.popups.findIndex(p => p.id === popup.id);
        if (index === -1) return;
        // Si el backend devuelve el estado actualizado, úsalo; si no, invierte
        const nuevoActivo = (response as any)?.data?.popup_activo ?? !this.popups[index].popup_activo;
        const nuevoEstaActivo = (response as any)?.data?.esta_activo ?? nuevoActivo;
        this.popups[index].popup_activo = nuevoActivo as boolean;
        (this.popups[index] as any).esta_activo = nuevoEstaActivo as boolean;
      },
      error: (error) => {
        console.error('Error cambiando estado del popup:', error);
      }
    });
  }

  // ===== MÉTODOS DE UTILIDAD =====

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposRecompensa.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estadosRecompensa.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'activa': return 'badge-success';
      case 'programada': return 'badge-info';
      case 'pausada': return 'badge-warning';
      case 'cancelada': return 'badge-danger';
      case 'expirada': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  esVigente(fechaInicio: string, fechaFin: string): boolean {
    const ahora = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return ahora >= inicio && ahora <= fin;
  }

  obtenerUrlImagen(imagenPath: string): string {
    if (!imagenPath) return '';
    return this.popupsService.obtenerUrlImagen(imagenPath);
  }

  private imagePreviewCache = new Map<File, string>();

  obtenerPreviewImagen(file: File): string {
    if (!file) return '';
    
    if (this.imagePreviewCache.has(file)) {
      return this.imagePreviewCache.get(file)!;
    }
    
    const blobUrl = URL.createObjectURL(file);
    this.imagePreviewCache.set(file, blobUrl);
    return blobUrl;
  }

  onImageError(event: any): void {
    console.error('Error cargando imagen:', event);
  }

  onImageLoad(event: any): void {
    console.log('Imagen cargada correctamente:', event.target.src);
  }
}
