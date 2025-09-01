// src/app/pages/dashboard/cupones/cupones-list/cupones-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfertasAdminService, CuponAdmin } from '../../../../services/ofertas-admin.service';
import { CuponModalComponent } from '../cupon-modal/cupon-modal.component';
import Swal from 'sweetalert2';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-cupones-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CuponModalComponent, NgxDatatableModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Cupones</h4>
          <p class="text-gray-500 mb-0">Administra los cupones de descuento</p>
        </div>
        <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearCupon">
          <i class="ph ph-plus me-8"></i>
          Nuevo Cupón
        </button>
      </div>

      <!-- Tabla con ngx-datatable -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando cupones...</p>
          </div>

          <!-- Datatable -->
          <ngx-datatable
            *ngIf="!isLoading"
            class="bootstrap cupones-table"
            [columns]="columns"
            [rows]="cupones"
            [columnMode]="ColumnMode.flex"
            [headerHeight]="50"
            [footerHeight]="50"
            [rowHeight]="80"
            [limit]="10"
            [scrollbarV]="true"
            [scrollbarH]="false"
            [loadingIndicator]="isLoading"
            [trackByProp]="'id'"
            [sortType]="SortType.single"
            [selectionType]="SelectionType.single"
          >
            <!-- Columna Código -->
            <ngx-datatable-column
              name="Código"
              prop="codigo"
              [flexGrow]="2.5"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="d-flex align-items-center gap-12">
                  <div class="cupon-info">
                    <h6 class="cupon-title" [title]="row.codigo">{{ row.codigo }}</h6>
                    <p class="cupon-subtitle">{{ row.titulo }}</p>
                    <div *ngIf="row.solo_primera_compra" class="mt-4">
                      <span class="badge bg-info-50 text-info-600 config-badge">
                        <i class="ph ph-user me-4"></i>Solo primera compra
                      </span>
                    </div>
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Descuento -->
            <ngx-datatable-column
              name="Descuento"
              prop="valor_descuento"
              [flexGrow]="1"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <span class="badge bg-success-50 text-success-600 descuento-badge">
                    {{ row.tipo_descuento === 'porcentaje' ? row.valor_descuento + '%' : 'S/ ' + row.valor_descuento }}
                  </span>
                  <div class="descuento-tipo">
                    {{ row.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Cantidad fija' }}
                  </div>
                  <div *ngIf="row.compra_minima" class="descuento-tipo">
                    Mín: S/ {{ row.compra_minima }}
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Fechas -->
            <ngx-datatable-column
              name="Vigencia"
              prop="fecha_inicio"
              [flexGrow]="1.5"
              [sortable]="true"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="fechas-info">
                  <div class="fecha-item">
                    <strong>Inicio:</strong> {{ formatDate(row.fecha_inicio) }}
                  </div>
                  <div class="fecha-item">
                    <strong>Fin:</strong> {{ formatDate(row.fecha_fin) }}
                  </div>
                  <span class="badge fecha-estado-badge"
                        [class]="getEstadoFecha(row).class">
                    {{ getEstadoFecha(row).texto }}
                  </span>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Usos -->
            <ngx-datatable-column
              name="Usos"
              [flexGrow]="1"
              [sortable]="false"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="text-center">
                  <div class="uso-info">
                    <strong>{{ row.usos_actuales || 0 }}</strong>
                    <span *ngIf="row.limite_uso">/ {{ row.limite_uso }}</span>
                    <span *ngIf="!row.limite_uso">/ ∞</span>
                  </div>
                  <div class="uso-tipo">
                    {{ row.limite_uso ? 'Limitado' : 'Ilimitado' }}
                  </div>
                  <div *ngIf="row.limite_uso" class="progress-container">
                    <div class="progress" style="height: 4px;">
                      <div class="progress-bar bg-main-600" 
                           [style.width.%]="((row.usos_actuales || 0) / row.limite_uso) * 100">
                      </div>
                    </div>
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
                  <!-- Copiar código -->
                  <button class="btn action-btn copy-btn"
                          title="Copiar código"
                          (click)="copiarCodigo(row.codigo)">
                    <i class="ph ph-copy"></i>
                  </button>

                  <!-- Editar -->
                  <button class="btn action-btn edit-btn"
                          title="Editar"
                          (click)="editarCupon(row)">
                    <i class="ph ph-pencil"></i>
                  </button>

                  <!-- Eliminar -->
                  <button class="btn action-btn delete-btn"
                          title="Eliminar"
                          (click)="eliminarCupon(row.id!)">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </ng-template>
            </ngx-datatable-column>
          </ngx-datatable>

          <!-- Empty state -->
          <div *ngIf="!isLoading && cupones.length === 0" class="text-center py-40">
            <i class="ph ph-ticket text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay cupones</h6>
            <p class="text-gray-500 mb-16">Aún no has creado ningún cupón</p>
            <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearCupon">
              <i class="ph ph-plus me-8"></i>
              Crear primer cupón
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar cupón -->
      <app-cupon-modal 
        [cupon]="cuponSeleccionado"
        (cuponGuardado)="onCuponGuardado()"
        (modalCerrado)="onModalCerrado()">
      </app-cupon-modal>
    </div>
  `,
  styles: [`
    /* Configuración base del datatable */
    ::ng-deep .cupones-table {
      box-shadow: none !important;
      border: none !important;
      font-size: 13px;
      width: 100% !important;
    }

    /* Header de la tabla */
    ::ng-deep .cupones-table .datatable-header {
      background-color: #f8f9fa !important;
      border-bottom: 1px solid #dee2e6 !important;
      height: 50px !important;
    }

    ::ng-deep .cupones-table .datatable-header-cell {
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

    ::ng-deep .cupones-table .datatable-header-cell:last-child {
      border-right: none !important;
    }

    /* Celdas del cuerpo */
    ::ng-deep .cupones-table .datatable-body-cell {
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

    ::ng-deep .cupones-table .datatable-body-cell:last-child {
      border-right: none !important;
    }

    /* Filas alternadas */
    ::ng-deep .cupones-table .datatable-row-even {
      background-color: #ffffff !important;
    }

    ::ng-deep .cupones-table .datatable-row-odd {
      background-color: #fafbfc !important;
    }

    /* Hover en filas */
    ::ng-deep .cupones-table .datatable-body-row:hover {
      background-color: #f5f5f5 !important;
    }

    /* Estilos específicos para cupones */
    .cupon-info {
      text-align: left;
      width: 100%;
      padding-left: 8px;
    }

    .cupon-title {
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

    .cupon-subtitle {
      font-size: 11px !important;
      color: #6c757d !important;
      margin-bottom: 0 !important;
    }

    .config-badge {
      font-size: 9px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      white-space: nowrap;
    }

    .descuento-badge {
      font-size: 12px !important;
      padding: 6px 10px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      white-space: nowrap;
    }

    .descuento-tipo {
      font-size: 10px !important;
      color: #6c757d !important;
      margin-top: 4px;
    }

    .fechas-info {
      text-align: left;
      width: 100%;
    }

    .fecha-item {
      font-size: 11px !important;
      color: #6c757d !important;
      margin-bottom: 2px;
    }

    .fecha-estado-badge {
      font-size: 9px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      margin-top: 4px;
    }

    .uso-info {
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #212529 !important;
      margin-bottom: 4px;
    }

    .uso-tipo {
      font-size: 10px !important;
      color: #6c757d !important;
      margin-bottom: 4px;
    }

    .progress-container {
      margin-top: 4px;
    }

    .progress {
      background-color: #e9ecef !important;
      border-radius: 2px !important;
      overflow: hidden !important;
      height: 4px !important;
    }

    .progress-bar {
      transition: width 0.3s ease !important;
      height: 100% !important;
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

    .copy-btn {
      background-color: #cfe2ff !important;
      color: #084298 !important;
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

    .copy-btn:hover,
    .edit-btn:hover {
      background-color: #9ec5fe !important;
      color: #052c65 !important;
    }

    .delete-btn:hover {
      background-color: #f1aeb5 !important;
      color: #721c24 !important;
    }

    /* Footer */
    ::ng-deep .cupones-table .datatable-footer {
      background-color: #f8f9fa !important;
      border-top: 1px solid #dee2e6 !important;
      padding: 8px 16px !important;
      font-size: 12px !important;
      height: 50px !important;
    }

    ::ng-deep .cupones-table .datatable-pager {
      margin: 0 !important;
    }

    ::ng-deep .cupones-table .datatable-pager .pager .pages .page {
      padding: 4px 8px !important;
      margin: 0 1px !important;
      border-radius: 4px !important;
      font-size: 11px !important;
    }

    ::ng-deep .cupones-table .datatable-pager .pager .pages .page.active {
      background-color: #0d6efd !important;
      color: white !important;
    }

    /* Eliminar espacios innecesarios */
    ::ng-deep .cupones-table .datatable-body {
      width: 100% !important;
    }

    ::ng-deep .cupones-table .datatable-row-wrapper {
      width: 100% !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      ::ng-deep .cupones-table .datatable-header-cell,
      ::ng-deep .cupones-table .datatable-body-cell {
        font-size: 11px !important;
        padding: 6px 4px !important;
      }
      
      .cupon-title {
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

      .config-badge {
        font-size: 8px !important;
        padding: 1px 4px !important;
      }
    }
  `]
})
export class CuponesListComponent implements OnInit {
  
  cupones: CuponAdmin[] = [];
  isLoading = true;
  cuponSeleccionado: CuponAdmin | null = null;

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Código', prop: 'codigo', flexGrow: 2.5 },
    { name: 'Descuento', prop: 'valor_descuento', flexGrow: 1 },
    { name: 'Vigencia', prop: 'fecha_inicio', flexGrow: 1.5 },
    { name: 'Usos', prop: 'usos', flexGrow: 1 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.2 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(
    private ofertasAdminService: OfertasAdminService
  ) {}

  ngOnInit(): void {
    this.cargarCupones();
  }

  cargarCupones(): void {
    this.isLoading = true;
    this.ofertasAdminService.obtenerCupones().subscribe({
      next: (cupones) => {
        this.cupones = cupones.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cupones:', error);
        this.isLoading = false;
      }
    });
  }

  editarCupon(cupon: CuponAdmin): void {
    this.cuponSeleccionado = cupon;
    const modal = document.getElementById('modalCrearCupon');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarCupon(id: number): void {
    Swal.fire({
      title: '¿Eliminar cupón?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ofertasAdminService.eliminarCupon(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El cupón ha sido eliminado.', 'success');
            this.cargarCupones();
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar el cupón.', 'error');
            console.error('Error al eliminar cupón:', error);
          }
        });
      }
    });
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      Swal.fire({
        title: '¡Copiado!',
        text: `Código "${codigo}" copiado al portapapeles`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    });
  }

  onCuponGuardado(): void {
    this.cargarCupones();
    this.cuponSeleccionado = null;
  }

  onModalCerrado(): void {
    this.cuponSeleccionado = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getEstadoFecha(cupon: CuponAdmin): {texto: string, class: string} {
    const ahora = new Date();
    const inicio = new Date(cupon.fecha_inicio);
    const fin = new Date(cupon.fecha_fin);

    if (ahora < inicio) {
      return { texto: 'Programado', class: 'bg-info-50 text-info-600' };
    } else if (ahora >= inicio && ahora <= fin) {
      return { texto: 'Vigente', class: 'bg-success-50 text-success-600' };
    } else {
      return { texto: 'Expirado', class: 'bg-danger-50 text-danger-600' };
    }
  }
}