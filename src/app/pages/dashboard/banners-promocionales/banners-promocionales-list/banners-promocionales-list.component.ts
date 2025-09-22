// src\app\pages\dashboard\banners-promocionales\banners-promocionales-list\banners-promocionales-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BannersService, BannerPromocional } from '../../../../services/banner.service';
import { BannerPromocionalModalComponent } from '../../../../component/banner-promocional-modal/banner-promocional-modal.component';
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
  selector: 'app-banners-promocionales-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BannerPromocionalModalComponent, NgxDatatableModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Banners Promocionales</h4>
          <p class="text-gray-500 mb-0">Administra los banners promocionales de la sección principal</p>
        </div>
        <button *ngIf="canCreateBanner_promocionales" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearBannerPromocional">
          <i class="ph ph-plus me-8"></i>
          Nuevo Banner Promocional
        </button>
      </div>

      <!-- Información adicional -->
      <div class="alert alert-info border-0 bg-info-50 text-info-600 mb-24">
        <div class="d-flex align-items-start gap-12">
          <i class="ph ph-info text-xl"></i>
          <div>
            <h6 class="mb-8">Información importante</h6>
            <p class="mb-0 text-sm">
              Los banners promocionales aparecen en la página principal después del carousel principal. 
              Se muestran máximo 4 banners activos ordenados por el campo "Orden".
            </p>
          </div>
        </div>
      </div>

      <!-- Tabla de banners promocionales -->
      <div class="card border-0 shadow-sm rounded-12">
        <!-- Header de información -->
        <div class="card-header bg-white border-bottom px-24 py-16" *ngIf="!isLoading && bannersPromocionales.length > 0">
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
            <p class="text-gray-500 mt-12 mb-0">Cargando banners promocionales...</p>
          </div>

          <!-- Datatable -->
          <ngx-datatable
            #table
            *ngIf="!isLoading"
            class="bootstrap banners-promocionales-table"
            [columns]="columns"
            [rows]="bannersPromocionales"
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
              [flexGrow]="1"
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
              [flexGrow]="2"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="banner-info">
                  <h6 class="banner-title" [title]="row.titulo">{{ row.titulo }}</h6>
                  <div *ngIf="row.texto_boton" class="banner-button-text">
                    <i class="ph ph-cursor-click me-4"></i>{{ row.texto_boton }}
                  </div>
                  <div *ngIf="row.enlace_url" class="banner-link">
                    <i class="ph ph-link me-4"></i>{{ row.enlace_url.length > 25 ? row.enlace_url.substring(0, 25) + '...' : row.enlace_url }}
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Precio -->
            <ngx-datatable-column
              name="Precio"
              prop="precio"
              [flexGrow]="1"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <span class="badge bg-success-50 text-success-600 precio-badge" *ngIf="row.precio">
                    S/ {{ row.precio | number:'1.2-2' }}
                  </span>
                  <span class="text-gray-400" *ngIf="!row.precio">Sin precio</span>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Orden & Animación -->
            <ngx-datatable-column
              name="Config"
              prop="orden"
              [flexGrow]="1"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <span class="badge bg-main-50 text-main-600 orden-badge">
                    #{{ row.orden }}
                  </span>
                  <div class="animacion-info">
                    <i class="ph ph-timer me-4"></i>{{ row.animacion_delay }}ms
                  </div>
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
                  <button *ngIf="canEdit"
                          class="btn action-btn toggle-btn"
                          [class.toggle-active]="row.activo"
                          [class.toggle-inactive]="!row.activo"
                          [title]="row.activo ? 'Desactivar' : 'Activar'"
                          (click)="toggleEstado(row)">
                    <i class="ph" [class]="row.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                  </button>

                  <!-- Editar -->
                  <button *ngIf="canEdit" class="btn action-btn edit-btn"
                          title="Editar"
                          (click)="editarBanner(row)">
                    <i class="ph ph-pencil"></i>
                  </button>

                  <!-- Eliminar -->
                  <button *ngIf="canDelete" class="btn action-btn delete-btn"
                          title="Eliminar"
                          (click)="eliminarBanner(row.id)">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </ng-template>
            </ngx-datatable-column>
          </ngx-datatable>

          <!-- Empty state -->
          <div *ngIf="!isLoading && bannersPromocionales.length === 0" class="text-center py-40">
            <i class="ph ph-image text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay banners promocionales</h6>
            <p class="text-gray-500 mb-16">Aún no has creado ningún banner promocional</p>
            <button *ngIf="canCreateBanner_promocionales" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearBannerPromocional">
              <i class="ph ph-plus me-8"></i>
              Crear primer banner promocional
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar banner promocional -->
      <app-banner-promocional-modal 
        [banner]="bannerSeleccionado"
        (bannerGuardado)="onBannerGuardado()"
        (modalCerrado)="onModalCerrado()">
      </app-banner-promocional-modal>
    </div>
  `,
  styles: [`
    /* Configuración base del datatable */
    ::ng-deep .banners-promocionales-table {
      box-shadow: none !important;
      border: none !important;
      font-size: 13px;
      width: 100% !important;
    }

    /* Header de la tabla */
    ::ng-deep .banners-promocionales-table .datatable-header {
      background-color: #f8f9fa !important;
      border-bottom: 1px solid #dee2e6 !important;
      height: 50px !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-header-cell {
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

    ::ng-deep .banners-promocionales-table .datatable-header-cell:last-child {
      border-right: none !important;
    }

    /* Celdas del cuerpo */
    ::ng-deep .banners-promocionales-table .datatable-body-cell {
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

    ::ng-deep .banners-promocionales-table .datatable-body-cell:last-child {
      border-right: none !important;
    }

    /* Filas alternadas */
    ::ng-deep .banners-promocionales-table .datatable-row-even {
      background-color: #ffffff !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-row-odd {
      background-color: #fafbfc !important;
    }

    /* Hover en filas */
    ::ng-deep .banners-promocionales-table .datatable-body-row:hover {
      background-color: #f5f5f5 !important;
    }

    /* Estilos específicos para banners promocionales */
    .banner-image-container {
      width: 50px;
      height: 40px;
      background-color: #f8f9fa;
      border-radius: 6px;
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
      border-radius: 4px;
    }

    .banner-info {
      text-align: left;
      width: 100%;
    }

    .banner-title {
      font-size: 14px !important;
      font-weight: 600 !important;
      margin-bottom: 3px !important;
      color: #212529 !important;
      line-height: 1.3 !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .banner-button-text {
      font-size: 10px !important;
      color: #0d6efd !important;
      display: flex;
      align-items: center;
      margin-bottom: 2px;
    }

    .banner-link {
      font-size: 9px !important;
      color: #6c757d !important;
      display: flex;
      align-items: center;
      font-family: monospace;
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
      min-width: 36px;
      margin-bottom: 4px;
    }

    .animacion-info {
      font-size: 9px !important;
      color: #6c757d !important;
      display: flex;
      align-items: center;
      justify-content: center;
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
    ::ng-deep .banners-promocionales-table .datatable-footer {
      background-color: #f8f9fa !important;
      border-top: 1px solid #dee2e6 !important;
      padding: 8px 16px !important;
      font-size: 12px !important;
      height: 50px !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-pager {
      margin: 0 !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-pager .pager .pages .page {
      padding: 4px 8px !important;
      margin: 0 1px !important;
      border-radius: 4px !important;
      font-size: 11px !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-pager .pager .pages .page.active {
      background-color: #0d6efd !important;
      color: white !important;
    }

    /* Eliminar espacios innecesarios */
    ::ng-deep .banners-promocionales-table .datatable-body {
      width: 100% !important;
    }

    ::ng-deep .banners-promocionales-table .datatable-row-wrapper {
      width: 100% !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      ::ng-deep .banners-promocionales-table .datatable-header-cell,
      ::ng-deep .banners-promocionales-table .datatable-body-cell {
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
        width: 40px;
        height: 32px;
      }
    }
  `]
})
export class BannersPromocionalesListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  
  bannersPromocionales: BannerPromocional[] = [];
  isLoading = true;
  bannerSeleccionado: BannerPromocional | null = null;

  canCreateBanner_promocionales!: boolean;
  canEdit!: boolean;
  canDelete!: boolean;

  private resizeSubscription?: Subscription;

  // Paginación
  pageSize = 10;
  selected: any[] = [];

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Imagen', flexGrow: 1 },
    { name: 'Banner', prop: 'titulo', flexGrow: 2 },
    { name: 'Precio', prop: 'precio', flexGrow: 1 },
    { name: 'Config', prop: 'orden', flexGrow: 1 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.2 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

    constructor(private bannersService: BannersService,
    private permissionsService: PermissionsService
  ) {
    // Escuchar cambios de resize del window
    this.resizeSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.cargarBannersPromocionales();
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

  private checkPermissions(): void {
    this.canCreateBanner_promocionales = this.permissionsService.hasPermission('banners_promocionales.create');
    this.canEdit = this.permissionsService.hasPermission('banners_promocionales.edit');
    this.canDelete = this.permissionsService.hasPermission('banners_promocionales.delete');
  }

  // Método para recargar permisos (si cambian en tiempo real)
  refreshPermissions(): void {
    this.checkPermissions();
  }

  cargarBannersPromocionales(): void {
    this.isLoading = true;
    this.bannersService.obtenerBannersPromocionales().subscribe({
      next: (banners) => {
        this.bannersPromocionales = banners.sort((a, b) => a.orden - b.orden);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar banners promocionales:', error);
        this.isLoading = false;
      }
    });
  }

  editarBanner(banner: BannerPromocional): void {
    this.bannerSeleccionado = banner;
    const modal = document.getElementById('modalCrearBannerPromocional');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarBanner(id: number): void {
    Swal.fire({
      title: '¿Eliminar banner promocional?',
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
        this.bannersService.eliminarBannerPromocional(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El banner promocional ha sido eliminado.',
              icon: 'success',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            this.cargarBannersPromocionales();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el banner promocional.',
              icon: 'error',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al eliminar banner promocional:', error);
          }
        });
      }
    });
  }

  toggleEstado(banner: BannerPromocional): void {
    this.bannersService.actualizarBannerPromocional(banner.id, { 
      activo: !banner.activo 
    }).subscribe({
      next: () => {
        this.cargarBannersPromocionales();
      },
      error: (error) => {
        console.error('Error al actualizar banner promocional:', error);
      }
    });
  }

  onBannerGuardado(): void {
    this.cargarBannersPromocionales();
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
    return this.permissionsService.hasPermission('banners_promocionales.edit');
  }

  get selectionText(): string {
    const total = this.bannersPromocionales.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} banners promocionales en total`;
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