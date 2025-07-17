// src\app\pages\dashboard\almacen\marcas\marcas-list.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AlmacenService } from "../../../../services/almacen.service"
import { MarcaProducto } from "../../../../types/almacen.types"
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import { PermissionsService } from '../../../../services/permissions.service';
import { MarcaModalComponent } from "./marca-modal.component"
import Swal from "sweetalert2"
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';

@Component({
  selector: "app-marcas-list",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MarcaModalComponent,
    NgxDatatableModule
  ],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Marcas</h5>
        <p class="text-gray-500 mb-0">Administra las marcas de productos</p>
      </div>
      <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              *ngIf="permissionsService.canCreateMarcas()"
              data-bs-toggle="modal" 
              data-bs-target="#modalCrearMarca">
        <i class="ph ph-plus me-8"></i>
        Nueva Marca
      </button>
    </div>

    <!-- Tabla con NGX-Datatable -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando marcas...</p>
        </div>

        <!-- Datatable -->
        <ngx-datatable
          *ngIf="!isLoading"
          class="bootstrap marcas-table"
          [columns]="columns"
          [rows]="marcas"
          [columnMode]="ColumnMode.flex"
          [headerHeight]="45"
          [footerHeight]="50"
          [rowHeight]="65"
          [limit]="10"
          [scrollbarV]="true"
          [scrollbarH]="false"
          [loadingIndicator]="isLoading"
          [trackByProp]="'id'"
          [sortType]="SortType.single"
          [selectionType]="SelectionType.single"
        >
          <!-- Columna Imagen -->
          <ngx-datatable-column
            name="Imagen"
            prop="imagen_url"
            [flexGrow]="0.5"
            [sortable]="false"
            [canAutoResize]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="image-container">
                <img
                  *ngIf="row.imagen_url"
                  [src]="row.imagen_url"
                  [alt]="row.nombre"
                  class="brand-image"
                  (error)="onImageError($event)"
                />
                <i
                  *ngIf="!row.imagen_url"
                  class="ph ph-tag text-gray-400"
                ></i>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Nombre -->
          <ngx-datatable-column name="Nombre" prop="nombre" [flexGrow]="1.5">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="brand-info">
                <h6 class="brand-name" [title]="row.nombre">
                  {{ row.nombre }}
                </h6>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Descripción -->
          <ngx-datatable-column name="Descripción" prop="descripcion" [flexGrow]="2">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <p class="brand-description" [title]="row.descripcion">
                {{ row.descripcion ? (row.descripcion.length > 50 ? row.descripcion.substring(0, 50) + '...' : row.descripcion) : 'Sin descripción' }}
              </p>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Estado -->
          <ngx-datatable-column
            name="Estado"
            prop="activo"
            [flexGrow]="0.8"
            [sortable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <span
                class="badge status-badge"
                [class]="row.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'"
              >
                {{ row.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Fecha -->
          <ngx-datatable-column name="Fecha Creación" prop="created_at" [flexGrow]="1">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <span class="date-text">
                {{ row.created_at | date:'dd/MM/yyyy' }}
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
                <button
                  class="btn action-btn toggle-btn"
                  *ngIf="permissionsService.canEditMarcas()"
                  [class.toggle-active]="row.activo"
                  [class.toggle-inactive]="!row.activo"
                  [title]="row.activo ? 'Desactivar' : 'Activar'"
                  (click)="toggleEstado(row)"
                >
                  <i
                    class="ph"
                    [class.ph-eye-slash]="row.activo"
                    [class.ph-eye]="!row.activo"
                  ></i>
                </button>

                <!-- Editar -->
                <button
                  class="btn action-btn edit-btn"
                  *ngIf="permissionsService.canEditMarcas()"
                  title="Editar"
                  (click)="editarMarca(row)"
                >
                  <i class="ph ph-pencil"></i>
                </button>

                <!-- Eliminar -->
                <button
                  class="btn action-btn delete-btn"
                  *ngIf="permissionsService.canDeleteMarcas()"
                  title="Eliminar"
                  (click)="eliminarMarca(row)"
                >
                  <i class="ph ph-trash"></i>
                </button>
              </div>
            </ng-template>
          </ngx-datatable-column>
        </ngx-datatable>

        <!-- Empty state -->
        <div
          *ngIf="!isLoading && marcas.length === 0"
          class="text-center py-40"
        >
          <i class="ph ph-tag text-gray-300 text-6xl mb-16"></i>
          <h6 class="text-heading fw-semibold mb-8">No hay marcas</h6>
          <p class="text-gray-500 mb-16">Aún no has creado ninguna marca</p>
          <button
            class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
            *ngIf="permissionsService.canCreateMarcas()"
            data-bs-toggle="modal" 
            data-bs-target="#modalCrearMarca"
          >
            <i class="ph ph-plus me-8"></i>
            Crear primera marca
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar marca -->
    <app-marca-modal 
      [marca]="marcaSeleccionada"
      (marcaGuardada)="onMarcaGuardada()"
      (modalCerrado)="onModalCerrado()">
    </app-marca-modal>
  `,
  styles: [
    `
      /* Configuración base del datatable */
      ::ng-deep .marcas-table {
        box-shadow: none !important;
        border: none !important;
        font-size: 13px;
        width: 100% !important;
      }

      /* Header de la tabla */
      ::ng-deep .marcas-table .datatable-header {
        background-color: #f8f9fa !important;
        border-bottom: 1px solid #dee2e6 !important;
        height: 45px !important;
      }

      ::ng-deep .marcas-table .datatable-header-cell {
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

      ::ng-deep .marcas-table .datatable-header-cell:last-child {
        border-right: none !important;
      }

      /* Celdas del cuerpo */
      ::ng-deep .marcas-table .datatable-body-cell {
        padding: 8px !important;
        border-bottom: 1px solid #f1f3f4 !important;
        border-right: 1px solid #f8f9fa !important;
        font-size: 13px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 65px !important;
        vertical-align: middle !important;
      }

      ::ng-deep .marcas-table .datatable-body-cell:last-child {
        border-right: none !important;
      }

      /* Filas alternadas */
      ::ng-deep .marcas-table .datatable-row-even {
        background-color: #ffffff !important;
      }

      ::ng-deep .marcas-table .datatable-row-odd {
        background-color: #fafbfc !important;
      }

      /* Hover en filas */
      ::ng-deep .marcas-table .datatable-body-row:hover {
        background-color: #f5f5f5 !important;
      }

      /* Contenido específico de cada columna */
      .image-container {
        width: 40px;
        height: 40px;
        background-color: #f8f9fa;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .brand-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .brand-info {
        text-align: left;
        width: 100%;
        padding-left: 8px;
      }

      .brand-name {
        font-size: 14px !important;
        font-weight: 600 !important;
        margin-bottom: 0 !important;
        color: #212529 !important;
        line-height: 1.3 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      .brand-description {
        font-size: 12px !important;
        color: #6c757d !important;
        margin-bottom: 0 !important;
        text-align: left;
        padding-left: 8px;
        line-height: 1.4;
      }

      .status-badge {
        font-size: 10px !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
        font-weight: 500 !important;
      }

      .date-text {
        font-size: 12px !important;
        color: #6c757d !important;
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
        background-color: #d1e7dd !important;
        color: #0f5132 !important;
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

      /* Footer */
      ::ng-deep .marcas-table .datatable-footer {
        background-color: #f8f9fa !important;
        border-top: 1px solid #dee2e6 !important;
        padding: 8px 16px !important;
        font-size: 12px !important;
        height: 50px !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        ::ng-deep .marcas-table .datatable-header-cell,
        ::ng-deep .marcas-table .datatable-body-cell {
          font-size: 11px !important;
          padding: 6px 4px !important;
        }
        
        .brand-name {
          font-size: 12px !important;
          max-width: 150px;
        }
        
        .action-btn {
          width: 20px !important;
          height: 20px !important;
        }

        .action-buttons {
          gap: 2px !important;
        }
      }
    `,
  ],
})
export class MarcasListComponent implements OnInit {
  marcas: MarcaProducto[] = []
  isLoading = true
  marcaSeleccionada: MarcaProducto | null = null

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Imagen', prop: 'imagen_url', flexGrow: 0.5 },
    { name: 'Nombre', prop: 'nombre', flexGrow: 1.5 },
    { name: 'Descripción', prop: 'descripcion', flexGrow: 2 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8 },
    { name: 'Fecha Creación', prop: 'created_at', flexGrow: 1 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.2 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas()
    
    // Suscribirse a cambios de sección
    this.seccionFilterService.seccionSeleccionada$.subscribe(seccionId => {
      this.cargarMarcas();
    });
  }

  cargarMarcas(): void {
    this.isLoading = true
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
    
    console.log('Cargando marcas con sección:', seccionId);
    
    this.almacenService.obtenerMarcas(seccionId || undefined).subscribe({
      next: (marcas) => {
        this.marcas = marcas
        this.isLoading = false
        console.log('Marcas cargadas:', marcas.length);
      },
      error: (error) => {
        console.error("Error al cargar marcas:", error)
        this.isLoading = false
      },
    })
  }

  editarMarca(marca: MarcaProducto): void {
    this.marcaSeleccionada = marca
    const modal = document.getElementById("modalCrearMarca")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  eliminarMarca(marca: MarcaProducto): void {
    Swal.fire({
      title: "¿Eliminar marca?",
      html: `Estás a punto de eliminar la marca <strong>"${marca.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-12",
        confirmButton: "rounded-8",
        cancelButton: "rounded-8",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.almacenService.eliminarMarca(marca.id).subscribe({
          next: () => {
            Swal.fire({
              title: "¡Eliminada!",
              text: "La marca ha sido eliminada exitosamente.",
              icon: "success",
              confirmButtonColor: "#198754",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            this.cargarMarcas()
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la marca. Inténtalo de nuevo.",
              icon: "error",
              confirmButtonColor: "#dc3545",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            console.error("Error al eliminar marca:", error)
          },
        })
      }
    })
  }

  toggleEstado(marca: MarcaProducto): void {
    this.almacenService
      .toggleEstadoMarca(marca.id, !marca.activo)
      .subscribe({
        next: () => {
          this.cargarMarcas()
        },
        error: (error) => {
          console.error("Error al actualizar estado de la marca:", error)
        },
      })
  }

  onMarcaGuardada(): void {
    this.cargarMarcas()
    this.marcaSeleccionada = null
    
    // Actualizar totales en el componente padre
    const almacenComponent = document.querySelector('app-almacen') as any
    if (almacenComponent && almacenComponent.onDatosActualizados) {
      almacenComponent.onDatosActualizados()
    }
  }

  onModalCerrado(): void {
    this.marcaSeleccionada = null
  }

  onImageError(event: any): void {
    console.error("Error al cargar imagen:", event)

    event.target.style.display = "none"
    event.target.classList.add("image-error")

    const container = event.target.closest(".image-container")
    if (container) {
      let placeholder = container.querySelector(".ph-tag")
      if (!placeholder) {
        placeholder = document.createElement("i")
        placeholder.className = "ph ph-tag text-gray-400"
        placeholder.style.fontSize = "16px"
        container.appendChild(placeholder)
      }
      placeholder.style.display = "block"
    }
  }
}