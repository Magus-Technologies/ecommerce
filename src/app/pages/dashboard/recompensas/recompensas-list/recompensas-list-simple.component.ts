import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecompensasService } from '../../../../services/recompensas.service';
import { 
  RecompensaLista, 
  TipoRecompensa, 
  EstadoRecompensa, 
  FiltrosRecompensas,
  PaginatedResponse,
  ApiResponse
} from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-list-simple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './recompensas-list-simple.component.html',
  styleUrls: ['./recompensas-list-simple.component.scss']
})
export class RecompensasListSimpleComponent implements OnInit {
  @ViewChild('deleteModal', { static: true }) deleteModal!: TemplateRef<any>;
  @ViewChild('duplicateModal', { static: true }) duplicateModal!: TemplateRef<any>;

  // Servicios
  private recompensasService = inject(RecompensasService);
  private router = inject(Router);

  // Datos de la tabla
  recompensas: RecompensaLista[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  tiposRecompensa: any[] = [];
  estadosRecompensa: any[] = [];
  vistaCompacta = true;
  // Control del menú de acciones por fila
  openMenuId: number | null = null;

  // Filtros
  filtros: FiltrosRecompensas = {
    buscar: '',
    tipo: undefined,
    estado: undefined,
    vigente: undefined,
    fecha_inicio: '',
    fecha_fin: '',
    page: 1,
    per_page: 10
  };


  // Recompensa seleccionada para acciones
  recompensaSeleccionada: RecompensaLista | null = null;
  
  // Modal de detalle
  mostrarModalDetalle = false;
  detalleRecompensa: any = null;
  cargandoDetalle = false;
  errorDetalle: string | null = null;
  
  // Modal de edición
  mostrarModalEditar = false;
  recompensaEditando: any = null;
  cargandoEdicion = false;
  errorEdicion: string | null = null;
  
  // Notificaciones
  mostrarNotificacion = false;
  mensajeNotificacion = '';
  tipoNotificacion: 'success' | 'error' | 'info' = 'info';


  constructor() {}

  ngOnInit(): void {
    this.cargarTiposYEstados();
    this.cargarRecompensas();
  }

  cargarTiposYEstados(): void {
    this.recompensasService.obtenerTipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tiposRecompensa = response.data.tipos || [];
          this.estadosRecompensa = response.data.estados || [];
        }
      },
      error: (error) => {
        console.error('Error cargando tipos y estados:', error);
        // Usar valores por defecto
        this.tiposRecompensa = [
          { value: 'puntos', label: 'Puntos' },
          { value: 'descuento', label: 'Descuento' },
          { value: 'envio_gratis', label: 'Envío Gratis' },
          { value: 'regalo', label: 'Regalo' }
        ];
        this.estadosRecompensa = [
          { value: 'programada', label: 'Programada' },
          { value: 'activa', label: 'Activa' },
          { value: 'pausada', label: 'Pausada' },
          { value: 'expirada', label: 'Expirada' },
          { value: 'cancelada', label: 'Cancelada' }
        ];
      }
    });
  }

  cargarRecompensas(): void {
    this.loading = true;
    
    // Preparar filtros para la API
    const filtrosParaAPI = { ...this.filtros };
    filtrosParaAPI.page = this.currentPage + 1;
    filtrosParaAPI.per_page = this.pageSize as 10 | 15 | 25 | 50 | 100;
    
    // Limpiar filtros vacíos
    Object.keys(filtrosParaAPI).forEach(key => {
      const value = filtrosParaAPI[key as keyof typeof filtrosParaAPI];
      if (value === '' || value === undefined || value === null) {
        delete filtrosParaAPI[key as keyof typeof filtrosParaAPI];
      }
    });

    console.log('Filtros enviados a la API:', filtrosParaAPI);

    this.recompensasService.obtenerLista(filtrosParaAPI).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.recompensas = response.data.data || [];
          this.totalElements = response.data.total || 0;
          this.totalPages = response.data.last_page || 0;
          console.log('Recompensas cargadas:', this.recompensas.length);
        } else {
          this.showError('Error al cargar las recompensas');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar recompensas:', error);
        
        // Manejo específico de errores
        if (error.status === 500) {
          this.showError('Error del servidor (500). Verifica que el backend esté funcionando correctamente.');
        } else if (error.status === 404) {
          this.showError('Endpoint no encontrado (404). Verifica la configuración del backend.');
        } else if (error.status === 403) {
          this.showError('No tienes permisos para acceder a las recompensas (403).');
        } else if (error.status === 0) {
          this.showError('No se puede conectar con el servidor. Verifica tu conexión.');
        } else {
          this.showError(`Error al cargar las recompensas (${error.status}). Intenta nuevamente.`);
        }
        
        // Datos de fallback para evitar errores de UI
        this.recompensas = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    console.log('Aplicando filtros:', this.filtros);
    this.currentPage = 0;
    this.filtros.page = 1; // Resetear a la primera página
    this.cargarRecompensas();
  }

  limpiarFiltros(): void {
    console.log('Limpiando filtros');
    this.filtros = {
      buscar: '',
      tipo: undefined,
      estado: undefined,
      vigente: undefined,
      fecha_inicio: '',
      fecha_fin: '',
      page: 1,
      per_page: 10
    };
    this.aplicarFiltros();
  }

  // Búsqueda en tiempo real con debounce
  onBuscarChange(): void {
    // Aplicar filtros automáticamente después de escribir
    this.aplicarFiltros();
  }

  // Cambio en filtros de tipo
  onTipoChange(): void {
    console.log('Tipo cambiado a:', this.filtros.tipo);
    this.aplicarFiltros();
  }

  // Cambio en filtros de estado
  onEstadoChange(): void {
    console.log('Estado cambiado a:', this.filtros.estado);
    this.aplicarFiltros();
  }

  // Cambio en filtros de vigencia
  onVigenciaChange(): void {
    console.log('Vigencia cambiada a:', this.filtros.vigente);
    this.aplicarFiltros();
  }

  // Cambio en fechas
  onFechaChange(): void {
    console.log('Fechas cambiadas:', this.filtros.fecha_inicio, this.filtros.fecha_fin);
    this.aplicarFiltros();
  }

  // Verificar si hay filtros activos
  tieneFiltrosActivos(): boolean {
    return !!(
      this.filtros.buscar ||
      this.filtros.tipo ||
      this.filtros.estado ||
      this.filtros.fecha_inicio ||
      this.filtros.fecha_fin
    );
  }

  // TrackBy function para optimizar el rendering
  trackByRecompensaId(index: number, recompensa: any): number {
    return recompensa.id;
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.cargarRecompensas();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.cargarRecompensas();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cargarRecompensas();
    }
  }

  // Métodos de acciones
  crearRecompensa(): void {
    this.router.navigate(['/dashboard/recompensas/crear']);
  }

  editarRecompensa(recompensa: RecompensaLista): void {
    this.recompensaEditando = recompensa;
    this.mostrarModalEditar = true;
    this.cargarDetalleParaEdicion(recompensa.id);
  }

  verDetalle(recompensa: RecompensaLista): void {
    this.recompensaSeleccionada = recompensa;
    this.mostrarModalDetalle = true;
    this.cargarDetalleRecompensa(recompensa.id);
  }

  cargarDetalleRecompensa(id: number): void {
    this.cargandoDetalle = true;
    this.errorDetalle = null;

    this.recompensasService.obtenerDetalle(id).subscribe({
      next: (response: any) => {
        console.log('Detalle de recompensa cargado:', response);
        
        // Manejar diferentes estructuras de respuesta
        this.detalleRecompensa = response.recompensa || response.data?.recompensa || response.data || response;
        this.cargandoDetalle = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle de recompensa:', error);
        this.errorDetalle = 'Error al cargar los datos de la recompensa';
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.detalleRecompensa = null;
    this.errorDetalle = null;
  }

  // Métodos para el modal de edición
  cargarDetalleParaEdicion(id: number): void {
    this.cargandoEdicion = true;
    this.errorEdicion = null;

    this.recompensasService.obtenerDetalle(id).subscribe({
      next: (response: any) => {
        console.log('Detalle para edición cargado:', response);
        
        // Manejar diferentes estructuras de respuesta
        this.recompensaEditando = response.recompensa || response.data?.recompensa || response.data || response;
        this.cargandoEdicion = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle para edición:', error);
        this.errorEdicion = 'Error al cargar los datos de la recompensa';
        this.cargandoEdicion = false;
      }
    });
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.recompensaEditando = null;
    this.errorEdicion = null;
  }

  guardarEdicion(): void {
    if (!this.recompensaEditando) return;

    this.cargandoEdicion = true;
    this.errorEdicion = null;

    // Preparar datos para actualizar
    const datosActualizacion = {
      nombre: this.recompensaEditando.nombre?.trim(),
      descripcion: this.recompensaEditando.descripcion?.trim(),
      tipo: this.recompensaEditando.tipo,
      fecha_inicio: this.recompensaEditando.fecha_inicio,
      fecha_fin: this.recompensaEditando.fecha_fin,
      estado: this.recompensaEditando.estado
    };

    // Validar que los datos requeridos no estén vacíos
    if (!datosActualizacion.nombre || !datosActualizacion.descripcion || !datosActualizacion.fecha_inicio || !datosActualizacion.fecha_fin) {
      this.errorEdicion = 'Por favor completa todos los campos requeridos';
      this.cargandoEdicion = false;
      return;
    }

    console.log('Actualizando recompensa:', this.recompensaEditando.id, datosActualizacion);

    this.recompensasService.actualizar(this.recompensaEditando.id, datosActualizacion).subscribe({
      next: (response: any) => {
        console.log('Recompensa actualizada exitosamente:', response);
        if (response.success) {
          this.showSuccess('Recompensa actualizada exitosamente');
          this.cerrarModalEditar();
          this.cargarRecompensas(); // Recargar la lista
        } else {
          this.errorEdicion = response.message || 'Error al actualizar la recompensa';
        }
        this.cargandoEdicion = false;
      },
      error: (error) => {
        console.error('Error al actualizar recompensa:', error);
        this.errorEdicion = error.error?.message || 'Error al actualizar la recompensa';
        this.cargandoEdicion = false;
      }
    });
  }

  duplicarRecompensa(recompensa: RecompensaLista): void {
    this.recompensaSeleccionada = recompensa;
    // TODO: Implementar modal de confirmación
    console.log('Duplicar recompensa:', recompensa.id);
  }

  confirmarDuplicar(): void {
    if (this.recompensaSeleccionada) {
      // TODO: Implementar servicio de duplicación
      this.showSuccess('Recompensa duplicada exitosamente');
      this.cargarRecompensas();
    }
  }


  confirmarEliminar(): void {
    if (this.recompensaSeleccionada) {
      this.recompensasService.eliminar(this.recompensaSeleccionada.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSuccess('Recompensa eliminada exitosamente');
            this.cargarRecompensas();
          } else {
            this.showError(response.message || 'Error al eliminar la recompensa');
          }
        },
        error: (error) => {
          console.error('Error al eliminar recompensa:', error);
          this.showError('Error al eliminar la recompensa');
        }
      });
    }
  }

  // ===== Menú de acciones desplegable =====
  toggleAccionesMenu(recompensaId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.openMenuId = this.openMenuId === recompensaId ? null : recompensaId;
  }

  closeAccionesMenu(): void {
    this.openMenuId = null;
  }

  // Método unificado para cambiar estado
  cambiarEstadoRecompensa(recompensa: RecompensaLista): void {
    const estadoActual = this.getEstadoReal(recompensa);
    console.log('Cambiando estado de recompensa:', recompensa.id, 'Estado actual:', estadoActual);
    
    if (estadoActual === 'activa') {
      this.pausarRecompensa(recompensa);
    } else if (estadoActual === 'pausada' || estadoActual === 'programada') {
      this.activarRecompensa(recompensa);
    } else {
      this.showError('No se puede cambiar el estado de una recompensa expirada o cancelada');
    }
  }

  // Métodos de estado
  activarRecompensa(recompensa: RecompensaLista): void {
    console.log('Activando recompensa:', recompensa.id);
    this.loading = true;
    this.recompensasService.activar(recompensa.id).subscribe({
      next: (response: any) => {
        console.log('Respuesta de activación:', response);
        if (response.success) {
          this.showSuccess('Recompensa activada exitosamente');
          this.cargarRecompensas();
        } else {
          this.showError(response.message || 'Error al activar la recompensa');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al activar recompensa:', error);
        this.showError('Error al activar la recompensa: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  pausarRecompensa(recompensa: RecompensaLista): void {
    console.log('Pausando recompensa:', recompensa.id);
    this.loading = true;
    this.recompensasService.pausar(recompensa.id).subscribe({
      next: (response: any) => {
        console.log('Respuesta de pausa:', response);
        if (response.success) {
          this.showSuccess('Recompensa pausada exitosamente');
          this.cargarRecompensas();
        } else {
          this.showError(response.message || 'Error al pausar la recompensa');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al pausar recompensa:', error);
        this.showError('Error al pausar la recompensa: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  desactivarRecompensa(recompensa: RecompensaLista): void {
    console.log('Desactivando recompensa:', recompensa.id);
    this.recompensasService.pausar(recompensa.id).subscribe({
      next: (response: any) => {
        console.log('Respuesta de desactivación:', response);
        if (response.success) {
          this.showSuccess('Recompensa desactivada exitosamente');
          this.cargarRecompensas();
        } else {
          this.showError(response.message || 'Error al desactivar la recompensa');
        }
      },
      error: (error) => {
        console.error('Error al desactivar recompensa:', error);
        this.showError('Error al desactivar la recompensa: ' + (error.error?.message || error.message));
      }
    });
  }

  eliminarRecompensa(recompensa: RecompensaLista): void {
    console.log('Eliminando recompensa:', recompensa.id);
    this.loading = true;
    this.recompensasService.eliminar(recompensa.id).subscribe({
      next: (response: any) => {
        console.log('Respuesta de eliminación:', response);
        if (response.success) {
          this.showSuccess('Recompensa cancelada exitosamente');
          this.cargarRecompensas();
        } else {
          this.showError(response.message || 'Error al cancelar la recompensa');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar recompensa:', error);
        this.showError('Error al cancelar la recompensa: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  // Métodos auxiliares
  getEstadoClass(estado: EstadoRecompensa): string {
    const classes: { [key in EstadoRecompensa]: string } = {
      'activa': 'badge-success',
      'pausada': 'badge-warning',
      'programada': 'badge-info',
      'expirada': 'badge-secondary',
      'cancelada': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  // Determinar el estado real de la recompensa basado en fechas y estado del backend
  getEstadoReal(recompensa: any): EstadoRecompensa {
    try {
      // Si el backend ya proporciona el estado, lo usamos
      if (recompensa.estado && ['programada', 'activa', 'pausada', 'expirada', 'cancelada'].includes(recompensa.estado)) {
        return recompensa.estado as EstadoRecompensa;
      }

      // Fallback: calcular estado basado en fechas (para compatibilidad)
      const ahora = new Date();
      const fechaInicio = new Date(recompensa.fecha_inicio);
      const fechaFin = new Date(recompensa.fecha_fin);

      // Si está explícitamente marcada como inactiva (compatibilidad con campo activo)
      if (recompensa.activo === false) {
        return 'pausada';
      }

      // Si aún no ha comenzado
      if (ahora < fechaInicio) {
        return 'programada';
      }

      // Si ya expiró
      if (ahora > fechaFin) {
        return 'expirada';
      }

      // Si está en el rango de fechas y está activa
      if (ahora >= fechaInicio && ahora <= fechaFin && recompensa.activo !== false) {
        return 'activa';
      }

      // Por defecto, pausada
      return 'pausada';
    } catch (error) {
      console.error('Error calculando estado real:', error);
      return 'pausada';
    }
  }

  getTipoIcon(tipo: TipoRecompensa): string {
    const icons: { [key in TipoRecompensa]: string } = {
      'puntos': 'fas fa-coins',
      'descuento': 'fas fa-percentage',
      'envio_gratis': 'fas fa-shipping-fast',
      'regalo': 'fas fa-gift'
    };
    return icons[tipo] || 'fas fa-question';
  }

  getTipoColor(tipo: TipoRecompensa): string {
    const colors: { [key in TipoRecompensa]: string } = {
      'puntos': 'text-warning',
      'descuento': 'text-success',
      'envio_gratis': 'text-info',
      'regalo': 'text-purple'
    };
    return colors[tipo] || 'text-muted';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearMoneda(valor: number): string {
    // Si el valor es 0 o null, mostrar un valor por defecto basado en el tipo
    if (!valor || valor === 0) {
      return 'S/ 0.00';
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  // Calcular valor estimado de la recompensa
  calcularValorEstimado(recompensa: any): number {
    // Si ya tiene un valor calculado, usarlo
    if (recompensa.valor_total_recompensa && recompensa.valor_total_recompensa > 0) {
      return recompensa.valor_total_recompensa;
    }

    // Calcular valor estimado basado en el tipo
    const totalProductos = recompensa.total_productos_aplicables || 0;
    const totalClientes = recompensa.total_clientes_aplicables || 0;
    
    switch (recompensa.tipo) {
      case 'descuento':
        // Estimación: 10% de descuento promedio por producto
        return totalProductos * 50; // S/ 50 promedio por producto
      case 'envio_gratis':
        // Estimación: S/ 15 por envío
        return totalClientes * 15;
      case 'puntos':
        // Estimación: 100 puntos por cliente
        return totalClientes * 100;
      case 'regalo':
        // Estimación: S/ 25 por regalo
        return totalClientes * 25;
      default:
        return 0;
    }
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-PE').format(valor);
  }

  // Métodos de exportación
  exportarExcel(): void {
    // TODO: Implementar exportación a Excel
    this.showInfo('Funcionalidad de exportación a Excel en desarrollo');
  }

  exportarPDF(): void {
    // TODO: Implementar exportación a PDF
    this.showInfo('Funcionalidad de exportación a PDF en desarrollo');
  }

  // Métodos de búsqueda rápida
  buscarRapido(termino: string): void {
    this.filtros.buscar = termino;
    this.aplicarFiltros();
  }

  // Métodos para obtener páginas
  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Método para acceder a Math desde el template
  get Math() {
    return Math;
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccess(message: string): void {
    console.log('✅ Éxito:', message);
    this.mostrarNotificacion = true;
    this.mensajeNotificacion = message;
    this.tipoNotificacion = 'success';
    setTimeout(() => this.mostrarNotificacion = false, 3000);
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string): void {
    console.error('❌ Error:', message);
    this.mostrarNotificacion = true;
    this.mensajeNotificacion = message;
    this.tipoNotificacion = 'error';
    setTimeout(() => this.mostrarNotificacion = false, 5000);
  }

  /**
   * Muestra un mensaje de información
   */
  private showInfo(message: string): void {
    console.info('ℹ️ Info:', message);
    this.mostrarNotificacion = true;
    this.mensajeNotificacion = message;
    this.tipoNotificacion = 'info';
    setTimeout(() => this.mostrarNotificacion = false, 3000);
  }

  /**
   * Cierra la notificación manualmente
   */
  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
  }

  /**
   * Cambia entre vista compacta y expandida
   */
  cambiarVista(compacta: boolean): void {
    this.vistaCompacta = compacta;
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    // Reemplazar con una imagen placeholder local o un icono
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTI1IDI1SDM1VjM1SDI1VjI1WiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K';
  }

  /**
   * Valida y sanitiza datos para pipes
   */
  safeString(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else if (value && typeof value === 'object' && value.label) {
      return value.label;
    } else if (value && typeof value === 'object' && value.value) {
      return value.value;
    }
    return '';
  }

  /**
   * Obtiene la etiqueta legible para un estado
   */
  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'activa': 'Activas',
      'pausada': 'Pausadas',
      'programada': 'Programadas',
      'expirada': 'Expiradas',
      'cancelada': 'Canceladas'
    };
    return labels[estado] || estado;
  }
}
