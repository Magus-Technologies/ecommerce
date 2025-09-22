// src\app\pages\dashboard\almacen\categorias\categorias-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from '@angular/forms';
import { AlmacenService } from "../../../../services/almacen.service"
import { Categoria } from "../../../../types/almacen.types"
import { CategoriaModalComponent } from "./categoria-modal.component"
import { MigrarCategoriaModalComponent } from "../migrar-categoria-modal/migrar-categoria-modal.component"
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import { PermissionsService } from '../../../../services/permissions.service';
import Swal from "sweetalert2"
import { Subscription } from 'rxjs';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
  selector: "app-categorias-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CategoriaModalComponent,
    MigrarCategoriaModalComponent,
    NgxDatatableModule
  ],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Categorías</h5>
        <p class="text-gray-500 mb-0">Administra las categorías de productos</p>
      </div>
      <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
        *ngIf="permissionsService.canCreateCategorias()"
        data-bs-toggle="modal" 
        data-bs-target="#modalCrearCategoria">
        <i class="ph ph-plus me-8"></i>
        Nueva Categoría
      </button>
    </div>

    <!-- Tabla con NGX-Datatable -->
    <div class="card border-0 shadow-sm rounded-12">
      <!-- Header de información -->
      <div class="card-header bg-white border-bottom px-24 py-16" *ngIf="!isLoading && categorias.length > 0">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-16">
            <span class="text-sm text-gray-600">{{ selectionText }}</span>
            <div class="d-flex align-items-center gap-8" *ngIf="selected.length > 0">
              <button class="btn btn-sm btn-outline-danger px-12 py-6">
                <i class="ph ph-trash me-4"></i>
                Eliminar seleccionadas
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
          <p class="text-gray-500 mt-12 mb-0">Cargando categorías...</p>
        </div>

        <!-- Datatable -->
        <div class="table-container">
          <ngx-datatable
            #table
            *ngIf="!isLoading"
            class="bootstrap categorias-table"
            [columns]="columns"
            [rows]="categorias"
            [columnMode]="ColumnMode.flex"
            [headerHeight]="50"
            [footerHeight]="60"
            [rowHeight]="60"
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
                  class="category-image"
                  (error)="onImageError($event)"
                />
                <i
                  *ngIf="!row.imagen_url"
                  class="ph ph-image text-gray-400"
                ></i>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Nombre -->
          <ngx-datatable-column name="Nombre" prop="nombre" [flexGrow]="1.5">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="category-info">
                <h6 class="category-name" [title]="row.nombre">
                  {{ row.nombre }}
                </h6>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Descripción -->
          <ngx-datatable-column name="Descripción" prop="descripcion" [flexGrow]="2">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <p class="category-description" [title]="row.descripcion">
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
            [flexGrow]="1.5"
            [sortable]="false"
            [canAutoResize]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="action-buttons">
                <!-- Toggle Estado -->
                <button
                  class="btn action-btn toggle-btn"
                  *ngIf="permissionsService.canEditCategorias()"
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
                  *ngIf="permissionsService.canEditCategorias()"
                  title="Editar"
                  (click)="editarCategoria(row)"
                >
                  <i class="ph ph-pencil"></i>
                </button>

                <!-- Migrar Sección -->
                <button
                  class="btn action-btn migrate-btn"
                  *ngIf="permissionsService.canEditCategorias()"
                  title="Cambiar de Sección"
                  (click)="migrarCategoria(row)"
                >
                  <i class="ph ph-arrows-clockwise"></i>
                </button>

                <!-- Eliminar -->
                <button
                  class="btn action-btn delete-btn"
                  *ngIf="permissionsService.canDeleteCategorias()"
                  title="Eliminar"
                  (click)="eliminarCategoria(row)"
                >
                  <i class="ph ph-trash"></i>
                </button>
              </div>
            </ng-template>
          </ngx-datatable-column>
          </ngx-datatable>
        </div>

        <!-- Empty state -->
        <div
          *ngIf="!isLoading && categorias.length === 0"
          class="text-center py-40"
        >
          <i class="ph ph-folder-open text-gray-300 text-6xl mb-16"></i>
          <h6 class="text-heading fw-semibold mb-8">No hay categorías</h6>
          <p class="text-gray-500 mb-16">Aún no has creado ninguna categoría</p>
          <button
            class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
            *ngIf="permissionsService.canCreateCategorias()"       
            data-bs-toggle="modal" 
            data-bs-target="#modalCrearCategoria"
          >
            <i class="ph ph-plus me-8"></i>
            Crear primera categoría
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar categoría -->
    <app-categoria-modal 
      [categoria]="categoriaSeleccionada"
      (categoriaGuardada)="onCategoriaGuardada()"
      (modalCerrado)="onModalCerrado()">
    </app-categoria-modal>

    <!-- Modal para migrar categoría -->
    <app-migrar-categoria-modal 
      [categoria]="categoriaMigracion"
      (categoriaMigrada)="onCategoriaMigrada()"
      (modalCerrado)="onModalMigracionCerrado()">
    </app-migrar-categoria-modal>
  `,
  styles: [
    `
      /* Container de la tabla */
      .table-container {
        width: 100%;
        overflow-x: auto;
        overflow-y: visible;
        min-width: 0;
      }

      /* Configuración base del datatable */
      ::ng-deep .categorias-table {
        box-shadow: none !important;
        border: none !important;
        font-size: 13px;
        width: 100% !important;
        min-width: 800px !important;
        overflow: visible !important;
      }

      /* Eliminar scrollbars del datatable completamente */
      ::ng-deep .categorias-table .datatable-scroll,
      ::ng-deep .categorias-table .datatable-body-wrapper,
      ::ng-deep .categorias-table .datatable-body {
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
      }

      /* Forzar ancho de la tabla responsive */
      ::ng-deep .categorias-table .datatable-header,
      ::ng-deep .categorias-table .datatable-body,
      ::ng-deep .categorias-table .datatable-footer {
        width: 100% !important;
        min-width: 800px !important;
      }

      /* Header de la tabla */
      ::ng-deep .categorias-table .datatable-header {
        background-color: #f8f9fa !important;
        border-bottom: 1px solid #dee2e6 !important;
        height: 45px !important;
      }

      ::ng-deep .categorias-table .datatable-header-cell {
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

      ::ng-deep .categorias-table .datatable-header-cell:last-child {
        border-right: none !important;
      }

      /* Celdas del cuerpo */
      ::ng-deep .categorias-table .datatable-body-cell {
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

      ::ng-deep .categorias-table .datatable-body-cell:last-child {
        border-right: none !important;
      }

      /* Filas alternadas */
      ::ng-deep .categorias-table .datatable-row-even {
        background-color: #ffffff !important;
      }

      ::ng-deep .categorias-table .datatable-row-odd {
        background-color: #fafbfc !important;
      }

      /* Hover en filas */
      ::ng-deep .categorias-table .datatable-body-row:hover {
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

      .category-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .category-info {
        text-align: left;
        width: 100%;
        padding-left: 8px;
      }

      .category-name {
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

      .category-description {
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

      .migrate-btn {
        background-color: #fff3cd !important;
        color: #856404 !important;
      }

      .delete-btn {
        background-color: #f8d7da !important;
        color: #842029 !important;
      }

      .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      /* Header mejorado */
      .card-header {
        font-size: 13px;
      }

      .gap-16 {
        gap: 16px;
      }

      .gap-8 {
        gap: 8px;
      }

      /* Footer personalizado - ELIMINAR SCROLL COMPLETAMENTE */
      ::ng-deep .categorias-table .datatable-footer {
        background-color: #f8f9fa !important;
        border-top: 1px solid #dee2e6 !important;
        padding: 12px 24px !important;
        font-size: 12px !important;
        height: 60px !important;
        overflow: visible !important;
        width: 100% !important;
        min-width: 800px !important;
      }

      ::ng-deep .categorias-table .datatable-footer .datatable-pager {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
        width: 100% !important;
      }

      ::ng-deep .categorias-table .datatable-footer .datatable-pager .pager {
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        overflow: visible !important;
      }

      ::ng-deep .categorias-table .datatable-footer .datatable-pager .pager .pages {
        display: flex !important;
        gap: 4px !important;
        align-items: center !important;
        overflow: visible !important;
      }

      /* Eliminar cualquier scroll residual */
      ::ng-deep .categorias-table .datatable-footer * {
        overflow: visible !important;
      }

      /* Media queries para diferentes tamaños de pantalla */
      @media (max-width: 1199px) {
        .table-container {
          overflow-x: auto;
        }

        ::ng-deep .categorias-table {
          min-width: 800px !important;
        }

        ::ng-deep .categorias-table .datatable-header,
        ::ng-deep .categorias-table .datatable-body,
        ::ng-deep .categorias-table .datatable-footer {
          min-width: 800px !important;
        }
      }

      @media (min-width: 1200px) and (max-width: 1599px) {
        ::ng-deep .categorias-table {
          min-width: 100% !important;
        }

        .table-container {
          overflow-x: visible;
        }

        ::ng-deep .categorias-table .datatable-header,
        ::ng-deep .categorias-table .datatable-body,
        ::ng-deep .categorias-table .datatable-footer {
          min-width: 100% !important;
        }
      }

      @media (min-width: 1600px) {
        ::ng-deep .categorias-table {
          min-width: 100% !important;
          width: 100% !important;
        }

        .table-container {
          overflow-x: visible;
        }

        ::ng-deep .categorias-table .datatable-header,
        ::ng-deep .categorias-table .datatable-body,
        ::ng-deep .categorias-table .datatable-footer {
          min-width: 100% !important;
          width: 100% !important;
        }

        ::ng-deep .categorias-table .datatable-header-cell,
        ::ng-deep .categorias-table .datatable-body-cell {
          padding: 12px 16px !important;
        }
      }

      /* Responsive móvil */
      @media (max-width: 768px) {
        ::ng-deep .categorias-table .datatable-header-cell,
        ::ng-deep .categorias-table .datatable-body-cell {
          font-size: 11px !important;
          padding: 6px 4px !important;
        }

        .category-name {
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

        .card-header {
          padding: 12px !important;
        }

        .card-header .d-flex {
          flex-direction: column !important;
          gap: 12px !important;
          align-items: stretch !important;
        }
      }
    `,
  ],
})
export class CategoriasListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  categorias: Categoria[] = []
  isLoading = true
  categoriaSeleccionada: Categoria | null = null
  categoriaMigracion: Categoria | null = null

  private resizeSubscription?: Subscription;

  // Paginación
  pageSize = 10;
  selected: any[] = [];

  // Configuración para NGX-Datatable con flexGrow inteligente
  columns = [
    { name: 'Imagen', prop: 'imagen_url', flexGrow: 0.3, minWidth: 70, maxWidth: 90 },
    { name: 'Nombre', prop: 'nombre', flexGrow: 2, minWidth: 150 },
    { name: 'Descripción', prop: 'descripcion', flexGrow: 3, minWidth: 200 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8, minWidth: 70 },
    { name: 'Fecha Creación', prop: 'created_at', flexGrow: 1.2, minWidth: 120 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.5, minWidth: 150 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService,
    public permissionsService: PermissionsService
  ) {
    // Escuchar cambios de resize del window
    this.resizeSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.cargarCategorias()

    // Suscribirse a cambios de sección
    this.seccionFilterService.seccionSeleccionada$.subscribe(seccionId => {
      this.cargarCategorias();
    });

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

  cargarCategorias(): void {
    this.isLoading = true
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
    
    console.log('Cargando categorías con sección:', seccionId);
    
    this.almacenService.obtenerCategorias(seccionId || undefined).subscribe({
      next: (categorias) => {
        this.categorias = categorias
        this.isLoading = false
        console.log('Categorías cargadas:', categorias.length);
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
        this.isLoading = false
      },
    })
  }

  editarCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria
    const modal = document.getElementById("modalCrearCategoria")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    Swal.fire({
      title: "¿Eliminar categoría?",
      html: `Estás a punto de eliminar la categoría <strong>"${categoria.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
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
        this.almacenService.eliminarCategoria(categoria.id).subscribe({
          next: () => {
            Swal.fire({
              title: "¡Eliminada!",
              text: "La categoría ha sido eliminada exitosamente.",
              icon: "success",
              confirmButtonColor: "#198754",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            this.cargarCategorias()
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la categoría. Inténtalo de nuevo.",
              icon: "error",
              confirmButtonColor: "#dc3545",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            console.error("Error al eliminar categoría:", error)
          },
        })
      }
    })
  }

  toggleEstado(categoria: Categoria): void {
    this.almacenService
      .toggleEstadoCategoria(categoria.id, !categoria.activo)
      .subscribe({
        next: () => {
          this.cargarCategorias()
        },
        error: (error) => {
          console.error("Error al actualizar estado de la categoría:", error)
        },
      })
  }

  onCategoriaGuardada(): void {
    this.cargarCategorias()
    this.categoriaSeleccionada = null

    // Actualizar totales en el componente padre
    const almacenComponent = document.querySelector('app-almacen') as any
    if (almacenComponent && almacenComponent.onDatosActualizados) {
      almacenComponent.onDatosActualizados()
    }
  }

  onModalCerrado(): void {
    this.categoriaSeleccionada = null
  }

  onImageError(event: any): void {
    console.error("Error al cargar imagen:", event)

    event.target.style.display = "none"
    event.target.classList.add("image-error")

    const container = event.target.closest(".image-container")
    if (container) {
      let placeholder = container.querySelector(".ph-image")
      if (!placeholder) {
        placeholder = document.createElement("i")
        placeholder.className = "ph ph-image text-gray-400"
        placeholder.style.fontSize = "16px"
        container.appendChild(placeholder)
      }
      placeholder.style.display = "block"
    }
  }

  migrarCategoria(categoria: Categoria): void {
    this.categoriaMigracion = categoria
    const modal = document.getElementById("modalMigrarCategoria")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  onCategoriaMigrada(): void {
    this.cargarCategorias()
    this.categoriaMigracion = null
  }

  onModalMigracionCerrado(): void {
    this.categoriaMigracion = null
  }

  // Métodos para manejar selección y paginación
  onSelect(event: any): void {
    this.selected = event.selected;
  }

  onPageChange(event: any): void {
    console.log('Página cambiada:', event);
  }

  displayCheck(row: any): boolean {
    return this.permissionsService.canEditCategorias();
  }

  get selectionText(): string {
    const total = this.categorias.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} categorías en total`;
    }
    return `${selected} seleccionada${selected > 1 ? 's' : ''} de ${total}`;
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