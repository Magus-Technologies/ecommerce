import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, HostListener, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MotorizadosService, Motorizado } from '../../../../services/motorizados.service';
import { PermissionsService } from '../../../../services/permissions.service';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
  DatatableComponent
} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-motorizados-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxDatatableModule],
  templateUrl: './motorizados-list.component.html',
  styleUrls: ['./motorizados-list.component.scss']
})
export class MotorizadosListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  motorizados: Motorizado[] = [];
  motorizadosFiltrados: Motorizado[] = [];
  filtroTexto = '';
  isLoading = false;
  estadisticas = { total: 0, activos: 0, inactivos: 0 };

  private resizeTimeout: any;
  private resizeObserver!: ResizeObserver;
  private cleanupListener?: () => void;

  // Datatable properties
  pageSize = 10;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;
  selected: Motorizado[] = [];

  // Mensajes en español para NGX-Datatable
  messages = {
    emptyMessage: 'No se encontraron motorizados',
    totalMessage: 'total',
    selectedMessage: 'seleccionados'
  };

  constructor(
    private motorizadosService: MotorizadosService,
    public permissionsService: PermissionsService,
    private toastr: ToastrService,
    private router: Router,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarMotorizados();

    // Escuchar cambios del sidebar para recalcular la tabla
    const sidebarListener = () => {
      // Múltiples recálculos inmediatos para Angular 19 + ngx-datatable
      this.recalcularTabla();

      // Recálculos adicionales para eliminar completamente el lag
      setTimeout(() => this.recalcularTabla(), 1);
      setTimeout(() => this.recalcularTabla(), 10);
      setTimeout(() => this.recalcularTabla(), 50);
      setTimeout(() => this.recalcularTabla(), 100);
    };

    window.addEventListener('sidebarChanged', sidebarListener);

    // Limpiar el listener cuando se destruya el componente
    this.cleanupListener = () => {
      window.removeEventListener('sidebarChanged', sidebarListener);
    };
  }

  cargarMotorizados(): void {
    this.isLoading = true;
    this.motorizadosService.getMotorizados().subscribe({
      next: (motorizados) => {
        this.motorizados = motorizados;
        this.motorizadosFiltrados = motorizados;
        this.calcularEstadisticas();
        this.isLoading = false;
        // Force table resize after data is loaded
        setTimeout(() => {
          this.forceTableResize();
        }, 50);
      },
      error: (error: any) => {
        this.toastr.error('Error al cargar motorizados');
        this.isLoading = false;
      }
    });
  }

  filtrarMotorizados(): void {
    if (!this.filtroTexto) {
      this.motorizadosFiltrados = this.motorizados;
      return;
    }

    const filtro = this.filtroTexto.toLowerCase();
    this.motorizadosFiltrados = this.motorizados.filter(motorizado =>
      motorizado.nombre_completo.toLowerCase().includes(filtro) ||
      motorizado.numero_documento.includes(filtro) ||
      motorizado.vehiculo_placa.toLowerCase().includes(filtro) ||
      motorizado.numero_unidad.toLowerCase().includes(filtro) ||
      motorizado.telefono.includes(filtro)
    );
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.motorizados.length;
    this.estadisticas.activos = this.motorizados.filter(m => m.estado).length;
    this.estadisticas.inactivos = this.motorizados.filter(m => !m.estado).length;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/dashboard/motorizados/ver', id]);
  }

  editarMotorizado(id: number): void {
    this.router.navigate(['/dashboard/motorizados/editar', id]);
  }

  toggleEstado(motorizado: Motorizado): void {
    const accion = motorizado.estado ? 'desactivar' : 'activar';

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${accion} al motorizado ${motorizado.nombre_completo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: motorizado.estado ? '#dc2626' : '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.motorizadosService.toggleEstado(motorizado.id!).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Actualizado!',
              text: `El motorizado ha sido ${motorizado.estado ? 'desactivado' : 'activado'} correctamente`,
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.cargarMotorizados();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al cambiar el estado del motorizado',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  eliminarMotorizado(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al motorizado ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.motorizadosService.eliminarMotorizado(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El motorizado ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.cargarMotorizados();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el motorizado',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  crearUsuario(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Crear usuario?',
      text: `¿Deseas crear un usuario para ${nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.motorizadosService.crearUsuario(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Usuario creado!',
              text: 'El usuario ha sido creado correctamente. Se han enviado las credenciales por correo.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.cargarMotorizados();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al crear el usuario',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  toggleUsuario(id: number, username: string, estadoActual: boolean): void {
    const accion = estadoActual ? 'desactivar' : 'activar';

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${accion} el usuario ${username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: estadoActual ? '#dc2626' : '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.motorizadosService.toggleUsuario(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Actualizado!',
              text: `El usuario ha sido ${estadoActual ? 'desactivado' : 'activado'} correctamente`,
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.cargarMotorizados();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al cambiar el estado del usuario',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  resetearPassword(id: number, username: string): void {
    Swal.fire({
      title: '¿Resetear contraseña?',
      text: `¿Deseas resetear la contraseña del usuario ${username}? Se enviará una nueva contraseña por correo.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.motorizadosService.resetearPassword(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Contraseña reseteada!',
              text: 'Se ha enviado la nueva contraseña por correo electrónico',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al resetear la contraseña',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  // Datatable methods
  get selectionText(): string {
    const count = this.selected.length;
    if (count === 0) {
      return `Mostrando ${this.motorizadosFiltrados.length} motorizados`;
    }
    return `${count} motorizado${count === 1 ? '' : 's'} seleccionado${count === 1 ? '' : 's'} de ${this.motorizadosFiltrados.length}`;
  }

  onSelect({ selected }: any): void {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onPageChange(event: any): void {
    console.log('Page change:', event);
  }

  onPageSizeChange(): void {
    this.selected = [];
  }

  displayCheck = (row: any, column?: any, value?: any) => {
    return true;
  };

  // Helper methods para avatares y badges
  getAvatarDisplay(motorizado: Motorizado): { type: 'image' | 'initial', value: string, color?: string } {
    if (motorizado.foto_perfil) {
      return {
        type: 'image',
        value: motorizado.foto_perfil
      };
    }

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = motorizado.nombre_completo.charCodeAt(0) % colors.length;

    return {
      type: 'initial',
      value: motorizado.nombre_completo.substring(0, 2).toUpperCase(),
      color: colors[index]
    };
  }

  getEstadoClass(estado: boolean): string {
    return estado ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600';
  }

  canChangeStatus(): boolean {
    return this.permissionsService.canEditMotorizados();
  }

  trackByMotorizadoId(index: number, motorizado: Motorizado): number {
    return motorizado.id!;
  }

  ngAfterViewInit(): void {
    // Force initial table resize after view initialization
    setTimeout(() => {
      this.forceTableResize();
      this.setupResizeObserver();

      // Configuración especial para Angular 19 + ngx-datatable
      if (this.table) {
        this.table.trackByProp = 'id';
        this.cdr.detectChanges();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.cleanupListener) {
      this.cleanupListener();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    this.debounceTableResize();
  }

  private debounceTableResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.forceTableResize();
    }, 250);
  }

  private forceTableResize(): void {
    if (this.table) {
      // Force datatable to recalculate columns
      this.table.recalculateColumns();
      this.table.recalculateDims();
    }
  }

  // Method to be called when sidebar state changes
  onSidebarToggle(): void {
    setTimeout(() => {
      this.forceTableResize();
    }, 300); // Wait for sidebar animation to complete
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          this.debounceTableResize();
        }
      });

      // Observe the main container
      const container = this.elementRef.nativeElement.querySelector('.border.border-gray-100.rounded-16');
      if (container) {
        this.resizeObserver.observe(container);
      }

      // Also observe the table container
      const tableContainer = this.elementRef.nativeElement.querySelector('.table-container');
      if (tableContainer) {
        this.resizeObserver.observe(tableContainer);
      }

      // Observe the card container
      const cardContainer = this.elementRef.nativeElement.querySelector('.card.mx-16');
      if (cardContainer) {
        this.resizeObserver.observe(cardContainer);
      }
    }
  }

  // Método para recalcular columnas cuando cambia el layout
  private recalcularTabla(): void {
    this.ngZone.run(() => {
      if (this.table) {
        // Forzar detección de cambios inmediata
        this.cdr.detectChanges();

        // Recálculos múltiples para ngx-datatable con Angular 19
        this.table.recalculate();
        this.table.recalculateColumns();
        this.table.recalculateDims();

        // Segundo pase después de que Angular procese
        setTimeout(() => {
          if (this.table) {
            this.table.recalculate();
            this.table.recalculateColumns();
            this.cdr.detectChanges();
          }
        }, 0);

        // Tercer pase para asegurar compatibilidad con Angular 19
        setTimeout(() => {
          if (this.table) {
            this.table.recalculateDims();
            this.cdr.markForCheck();
          }
        }, 10);
      }
    });
  }
}