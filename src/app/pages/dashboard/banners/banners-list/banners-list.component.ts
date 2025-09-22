// src/app/pages/dashboard/banners/banners-list/banners-list.component.ts


import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BannersService, Banner } from '../../../../services/banner.service';
import { BannerModalComponent } from '../../../../component/banner-modal/banner-modal.component';
import { PermissionsService } from '../../../../services/permissions.service';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
  DatatableComponent
} from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-banners-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BannerModalComponent, NgxDatatableModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8"> Banners</h4>
          <p class="text-gray-500 mb-0">Administra los banners del sitio web</p>
        </div>
        <button *ngIf="canCreate$" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearBanner">
          <i class="ph ph-plus me-8"></i>
          Nuevo Banner
        </button>
      </div>

      <!-- Tabla de banners -->
      <div class="card border-0 shadow-sm rounded-12">
        <!-- Header de información -->
        <div class="card-header bg-white border-bottom px-24 py-16" *ngIf="!isLoading && banners.length > 0">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-16">
              <span class="text-sm text-gray-600">{{ selectionText }}</span>
              <div class="d-flex align-items-center gap-8" *ngIf="selected.length > 0">
                <button class="btn btn-sm btn-outline-danger px-12 py-6">
                  <i class="ph ph-trash me-4"></i>
                  Eliminar seleccionados
                </button>
              </div>
            </div>
            <div class="d-flex align-items-center gap-8">
              <span class="text-sm fw-medium text-dark">Mostrando</span>
              <select class="form-select form-select-sm border-gray-300" style="width: auto; min-width: 60px; font-size: 0.875rem; padding: 4px 8px;" [(ngModel)]="pageSize">
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
              <span class="text-sm fw-medium text-dark">por página</span>
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando banners...</p>
          </div>

          <!-- Datatable -->
          <ngx-datatable
            #table
            *ngIf="!isLoading"
            class="bootstrap banners-table"
            [columns]="columns"
            [rows]="banners"
            [columnMode]="ColumnMode.flex"
            [headerHeight]="50"
            [footerHeight]="50"
            [rowHeight]="80"
            [limit]="pageSize"
            [scrollbarV]="false"
            [scrollbarH]="false"
            [loadingIndicator]="isLoading"
            [trackByProp]="'id'"
            [sortType]="SortType.single"
            [selectionType]="SelectionType.checkbox"
            [selected]="selected"
            [selectAllRowsOnPage]="false"
            [displayCheck]="displayCheck"
            [externalPaging]="false"
            (select)="onSelect($event)"
            (page)="onPageChange($event)"
          >
            <!-- Columna Imagen -->
            <ngx-datatable-column
              name="Imagen"
              [flexGrow]="1.2"
              [sortable]="false"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="banner-image-container">
                  <img *ngIf="row.imagen_url" 
                       [src]="row.imagen_url" 
                       [alt]="row.titulo"
                       class="banner-image">
                  <i *ngIf="!row.imagen_url" class="ph ph-image text-gray-400"></i>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Banner Info -->
            <ngx-datatable-column
              name="Banner"
              prop="titulo"
              [flexGrow]="2.5"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="d-flex align-items-center gap-12">
                  <div class="banner-info">
                    <h6 class="banner-title" [title]="row.titulo">{{ row.titulo }}</h6>
                    <p class="banner-subtitle" [title]="row.subtitulo">
                      {{ row.subtitulo ? (row.subtitulo.length > 30 ? row.subtitulo.substring(0, 30) + '...' : row.subtitulo) : 'Sin subtítulo' }}
                    </p>
                    <div *ngIf="row.texto_boton" class="banner-button-text">
                      <i class="ph ph-cursor-click me-4"></i>{{ row.texto_boton }}
                    </div>
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Precio -->
            <ngx-datatable-column
              name="Precio"
              prop="precio_desde"
              [flexGrow]="1"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <span class="badge bg-success-50 text-success-600 precio-badge" *ngIf="row.precio_desde">
                    S/ {{ row.precio_desde }}
                  </span>
                  <span class="text-gray-400" *ngIf="!row.precio_desde">-</span>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Orden -->
            <ngx-datatable-column
              name="Orden"
              prop="orden"
              [flexGrow]="0.8"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <span class="badge bg-main-50 text-main-600 orden-badge">
                    {{ row.orden }}
                  </span>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Estado -->
            <ngx-datatable-column
              name="Estado"
              prop="activo"
              [flexGrow]="0.8"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <span class="badge estado-badge"
                      [class]="row.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                  {{ row.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Acciones -->
            <ngx-datatable-column
              name="Acciones"
              [flexGrow]="1.2"
              [sortable]="false"
              [canAutoResize]="false"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="action-buttons">
                  <!-- Toggle Estado -->
                  <button *ngIf="canEdit$"
                          class="btn action-btn toggle-btn"
                          [class.toggle-active]="row.activo"
                          [class.toggle-inactive]="!row.activo"
                          [title]="row.activo ? 'Desactivar' : 'Activar'"
                          (click)="toggleEstado(row)">
                    <i class="ph" [class]="row.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                  </button>

                  <!-- Editar -->
                  <button *ngIf="canEdit$" class="btn action-btn edit-btn"
                          title="Editar"
                          (click)="editarBanner(row)">
                    <i class="ph ph-pencil"></i>
                  </button>

                  <!-- Eliminar -->
                  <button *ngIf="canDelete$" class="btn action-btn delete-btn"
                          title="Eliminar"
                          (click)="eliminarBanner(row.id)">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </ng-template>
            </ngx-datatable-column>
          </ngx-datatable>

          <!-- Empty state -->
          <div *ngIf="!isLoading && banners.length === 0" class="text-center py-40">
            <i class="ph ph-image text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay banners</h6>
            <p class="text-gray-500 mb-16">Aún no has creado ningún banner</p>
            <button *ngIf="canCreate$" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearBanner">
              <i class="ph ph-plus me-8"></i>
              Crear primer banner
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar banner -->
      <app-banner-modal 
        [banner]="bannerSeleccionado"
        (bannerGuardado)="onBannerGuardado()"
        (modalCerrado)="onModalCerrado()">
      </app-banner-modal>
    </div>
  `,
  styles: [`
    /* Configuración base del datatable */
    ::ng-deep .banners-table {
      box-shadow: none !important;
      border: none !important;
      font-size: 13px;
      width: 100% !important;
    }

    /* Header de la tabla */
    ::ng-deep .banners-table .datatable-header {
      background-color: #f8f9fa !important;
      border-bottom: 1px solid #dee2e6 !important;
      height: 50px !important;
    }

    ::ng-deep .banners-table .datatable-header-cell {
      font-weight: 600 !important;
      color: #495057 !important;
      font-size: 12px !important;
      padding: 12px 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      border-right: 1px solid #e9ecef !important;
    }

    ::ng-deep .banners-table .datatable-header-cell:last-child {
      border-right: none !important;
    }

    /* Celdas del cuerpo */
    ::ng-deep .banners-table .datatable-body-cell {
      padding: 8px !important;
      border-bottom: 1px solid #f1f3f4 !important;
      border-right: 1px solid #f8f9fa !important;
      font-size: 13px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 80px !important;
      vertical-align: middle !important;
    }

    ::ng-deep .banners-table .datatable-body-cell:last-child {
      border-right: none !important;
    }

    /* Filas alternadas */
    ::ng-deep .banners-table .datatable-row-even {
      background-color: #ffffff !important;
    }

    ::ng-deep .banners-table .datatable-row-odd {
      background-color: #fafbfc !important;
    }

    /* Hover en filas */
    ::ng-deep .banners-table .datatable-body-row:hover {
      background-color: #f5f5f5 !important;
    }

    /* Estilos específicos para banners */
    .banner-image-container {
      width: 60px;
      height: 48px;
      background-color: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .banner-info {
      text-align: left;
      width: 100%;
      padding-left: 8px;
    }

    .banner-title {
      font-size: 14px !important;
      font-weight: 600 !important;
      margin-bottom: 2px !important;
      color: #212529 !important;
      line-height: 1.3 !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .banner-subtitle {
      font-size: 11px !important;
      color: #6c757d !important;
      margin-bottom: 2px !important;
      line-height: 1.2 !important;
    }

    .banner-button-text {
      font-size: 9px !important;
      color: #0d6efd !important;
      display: flex;
      align-items: center;
      margin-top: 2px;
    }

    .precio-badge {
      font-size: 12px !important;
      padding: 6px 10px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      white-space: nowrap;
    }

    .orden-badge {
      font-size: 12px !important;
      padding: 6px 10px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      min-width: 32px;
    }

    .estado-badge {
      font-size: 10px !important;
      padding: 4px 8px !important;
      border-radius: 12px !important;
      font-weight: 500 !important;
    }

    .action-buttons {
      display: flex !important;
      gap: 4px !important;
      align-items: center !important;
      justify-content: center !important;
      flex-wrap: nowrap !important;
    }

    .action-btn {
      width: 24px !important;
      height: 24px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
      font-size: 10px !important;
      min-width: 24px !important;
    }

    .toggle-btn.toggle-active {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .toggle-btn.toggle-inactive {
      background-color: #d1ecf1 !important;
      color: #0c5460 !important;
    }

    .edit-btn {
      background-color: #cfe2ff !important;
      color: #084298 !important;
    }

    .delete-btn {
      background-color: #f8d7da !important;
      color: #842029 !important;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toggle-btn.toggle-active:hover {
      background-color: #ffecb5 !important;
      color: #664d03 !important;
    }

    .toggle-btn.toggle-inactive:hover {
      background-color: #b8daff !important;
      color: #041e42 !important;
    }

    .edit-btn:hover {
      background-color: #9ec5fe !important;
      color: #052c65 !important;
    }

    .delete-btn:hover {
      background-color: #f1aeb5 !important;
      color: #721c24 !important;
    }

    /* Footer */
    ::ng-deep .banners-table .datatable-footer {
      background-color: #f8f9fa !important;
      border-top: 1px solid #dee2e6 !important;
      padding: 8px 16px !important;
      font-size: 12px !important;
      height: 50px !important;
    }

    ::ng-deep .banners-table .datatable-pager {
      margin: 0 !important;
    }

    ::ng-deep .banners-table .datatable-pager .pager .pages .page {
      padding: 4px 8px !important;
      margin: 0 1px !important;
      border-radius: 4px !important;
      font-size: 11px !important;
    }

    ::ng-deep .banners-table .datatable-pager .pager .pages .page.active {
      background-color: #0d6efd !important;
      color: white !important;
    }

    /* Eliminar espacios innecesarios */
    ::ng-deep .banners-table .datatable-body {
      width: 100% !important;
    }

    ::ng-deep .banners-table .datatable-row-wrapper {
      width: 100% !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      ::ng-deep .banners-table .datatable-header-cell,
      ::ng-deep .banners-table .datatable-body-cell {
        font-size: 11px !important;
        padding: 6px 4px !important;
      }
      
      .banner-title {
        font-size: 12px !important;
        max-width: 120px;
      }
      
      .action-btn {
        width: 20px !important;
        height: 20px !important;
      }

      .action-buttons {
        gap: 2px !important;
      }

      .banner-image-container {
        width: 48px;
        height: 36px;
      }
    }
  `]
})
export class BannersListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  
  banners: Banner[] = [];
  isLoading = true;
  bannerSeleccionado: Banner | null = null;
  canCreate$!: boolean;
  canEdit$!: boolean;

  private resizeSubscription?: Subscription;

  // Paginación
  pageSize = 10;
  selected: any[] = [];
  canDelete$!: boolean;

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Imagen', flexGrow: 1.2 },
    { name: 'Banner', prop: 'titulo', flexGrow: 2.5 },
    { name: 'Precio', prop: 'precio_desde', flexGrow: 1 },
    { name: 'Orden', prop: 'orden', flexGrow: 0.8 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.2 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;


  constructor(
    private bannersService: BannersService,
    private permissionsService: PermissionsService
  ) {
    // Escuchar cambios de resize del window
    this.resizeSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.cargarBanners();
    // Verificar permisos al inicializar
    this.checkPermissions();

    // Escuchar cambios del sidebar para recalcular la tabla
    const sidebarListener = () => {
      // Recálculo inmediato sin setTimeout para respuesta más rápida
      this.recalcularTabla();

      // Recálculo adicional por si acaso
      setTimeout(() => {
        this.recalcularTabla();
      }, 10);
    };

    window.addEventListener('sidebarChanged', sidebarListener);

    // Limpiar el listener cuando se destruya el componente
    this.resizeSubscription?.add(() => {
      window.removeEventListener('sidebarChanged', sidebarListener);
    });
  }

  // Nuevo método para verificar permisos
  private checkPermissions(): void {
   this.canCreate$ = this.permissionsService.hasPermission('banners.create');
      this.canEdit$ = this.permissionsService.hasPermission('banners.edit');
      this.canDelete$ = this.permissionsService.hasPermission('banners.delete');

  }

  // Método para recargar permisos (si cambian en tiempo real)
  refreshPermissions(): void {
    this.checkPermissions();
  }

  cargarBanners(): void {
    this.isLoading = true;
    this.bannersService.obtenerBanners().subscribe({
      next: (banners) => {
        this.banners = banners.sort((a, b) => a.orden - b.orden);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar banners:', error);
        this.isLoading = false;
      }
    });
  }

  editarBanner(banner: Banner): void {
    this.bannerSeleccionado = banner;
    const modal = document.getElementById('modalCrearBanner');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarBanner(id: number): void {
    Swal.fire({
      title: '¿Eliminar banner?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-12',
        confirmButton: 'rounded-8',
        cancelButton: 'rounded-8',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.bannersService.eliminarBanner(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El banner ha sido eliminado.',
              icon: 'success',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            this.cargarBanners();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el banner.',
              icon: 'error',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al eliminar banner:', error);
          }
        });
      }
    });
  }

  toggleEstado(banner: Banner): void {
    this.bannersService.actualizarBanner(banner.id, { 
      activo: !banner.activo 
    }).subscribe({
      next: () => {
        this.cargarBanners();
      },
      error: (error) => {
        console.error('Error al actualizar banner:', error);
      }
    });
  }

  onBannerGuardado(): void {
    this.cargarBanners();
    this.bannerSeleccionado = null;
  }

  onModalCerrado(): void {
    this.bannerSeleccionado = null;
  }

  // Métodos para manejar selección y paginación
  onSelect(event: any): void {
    this.selected = event.selected;
  }

  onPageChange(event: any): void {
    console.log('Página cambiada:', event);
  }

  displayCheck(row: any): boolean {
    return this.permissionsService.hasPermission('banners.edit');
  }

  get selectionText(): string {
    const total = this.banners.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} banners en total`;
    }
    return `${selected} seleccionado${selected > 1 ? 's' : ''} de ${total}`;
  }

  ngAfterViewInit(): void {
    // Forzar recalculo después de que la vista esté completamente inicializada
    setTimeout(() => {
      if (this.table) {
        this.table.recalculateColumns();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  // Método para recalcular columnas cuando cambia el layout
  private recalcularTabla(): void {
    if (this.table) {
      // Forzar recalculo inmediato
      this.table.recalculate();
      this.table.recalculateColumns();

      // Forzar redibujado del DOM
      this.table.recalculateDims();

      // Detectar cambios para Angular
      setTimeout(() => {
        if (this.table) {
          this.table.recalculate();
        }
      }, 1);
    }
  }

}