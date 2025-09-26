// src\app\pages\dashboard\almacen\productos\productos-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../../../../services/almacen.service';
import { Producto } from '../../../../types/almacen.types';
import { ProductoModalComponent } from './producto-modal.component';
import { ProductoDetallesModalComponent } from './producto-detalles-modal.component';
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import { PermissionsService } from '../../../../services/permissions.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  SortType,
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
 selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductoModalComponent,
    ProductoDetallesModalComponent,
    NgxDatatableModule,
  ],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Productos</h5>
        <p class="text-gray-500 mb-0">Administra el inventario de productos</p>
      </div>
      <button
        class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
        *ngIf="permissionsService.canCreateProductos()"
        (click)="nuevoProducto()"
        data-bs-toggle="modal"
        data-bs-target="#modalCrearProducto"
      >
        <i class="ph ph-plus me-8"></i>
        Nuevo Producto
      </button>
    </div>

    <!-- Tabla con NGX-Datatable -->
    <div class="card border-0 shadow-sm rounded-12">
      <!-- Header de información -->
      <div class="card-header bg-white border-bottom px-24 py-16" *ngIf="!isLoading && productos.length > 0">
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
          <p class="text-gray-500 mt-12 mb-0">Cargando productos...</p>
        </div>

        <!-- Datatable -->
        <div class="table-container">
          <ngx-datatable
            #table
            *ngIf="!isLoading"
            class="bootstrap productos-table"
            [columns]="columns"
            [rows]="productos"
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
            [flexGrow]="0.3"
            [minWidth]="70"
            [maxWidth]="90"
            [sortable]="false"
            [canAutoResize]="false"
            [resizeable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="image-container">
                <img
                  *ngIf="row.imagen_url"
                  [src]="row.imagen_url"
                  [alt]="row.nombre"
                  class="product-image"
                  (error)="onImageError($event)"
                />
                <i
                  *ngIf="!row.imagen_url"
                  class="ph ph-package text-gray-400"
                ></i>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Producto -->
          <ngx-datatable-column name="Producto" prop="nombre" [flexGrow]="3" [minWidth]="180" [resizeable]="false">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="product-info">
                <h6 class="product-name" [title]="row.nombre">
                  {{ row.nombre }}
                </h6>
                <p class="product-code">
                  {{ row.codigo_producto }}
                </p>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Categoría -->
          <ngx-datatable-column
            name="Categoría"
            prop="categoria.nombre"
            [flexGrow]="1.2"
            [minWidth]="110"
            [resizeable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <span class="badge bg-main-50 text-main-600 category-badge">
                {{ row.categoria?.nombre || 'Sin categoría' }}
              </span>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Marca -->
          <ngx-datatable-column name="Marca" prop="marca.nombre" [flexGrow]="1" [minWidth]="90" [resizeable]="false">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <span
                *ngIf="row.marca"
                class="badge bg-secondary-50 text-main-600 brand-badge"
              >
                {{ row.marca.nombre }}
              </span>
              <span *ngIf="!row.marca" class="text-gray-400 no-brand">Sin marca</span>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Precios -->
          <ngx-datatable-column
            name="Precio Venta"
            prop="precio_venta"
            [flexGrow]="1.3"
            [minWidth]="110"
            [resizeable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="price-info">
                <div class="sale-price">
                Venta:  S/ {{ row.precio_venta }}
                </div>
                <div class="buy-price">
                  Compra: S/ {{ row.precio_compra }}
                </div>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Stock -->
          <ngx-datatable-column name="Stock" prop="stock" [flexGrow]="1" [minWidth]="90" [resizeable]="false">
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="stock-info">
                <div
                  class="stock-current"
                  [class.stock-low]="row.stock <= row.stock_minimo"
                >
                  {{ row.stock }} unidades
                </div>
                <div class="stock-min">
                  Mín: {{ row.stock_minimo }}
                </div>
              </div>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Estado -->
          <ngx-datatable-column
            name="Estado"
            prop="activo"
            [flexGrow]="0.8"
            [minWidth]="70"
            [sortable]="false"
            [resizeable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <span
                class="badge status-badge"
                [class.status-active]="row.activo"
                [class.status-inactive]="!row.activo"
              >
                {{ row.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </ng-template>
          </ngx-datatable-column>

          <!-- Columna Acciones -->
          <ngx-datatable-column
            name="Acciones"
            [flexGrow]="1.8"
            [minWidth]="150"
            [sortable]="false"
            [canAutoResize]="false"
            [resizeable]="false"
          >
            <ng-template let-row="row" ngx-datatable-cell-template>
              <div class="action-buttons">
                <!-- Toggle Estado -->
                <button
                  class="btn action-btn toggle-btn"
                  *ngIf="permissionsService.canEditProductos()"
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
                <button
  class="btn action-btn star-btn"
  *ngIf="permissionsService.canEditProductos()"
  [class.star-active]="row.destacado"
  [class.star-inactive]="!row.destacado"
  [title]="row.destacado ? 'Quitar destacado' : 'Marcar como destacado'"
  (click)="toggleDestacado(row)"
>
  <i class="ph ph-star" [class.ph-fill]="row.destacado"></i>
</button>

                <!-- Gestionar Detalles -->
                <button
                  class="btn action-btn details-btn"
                  *ngIf="permissionsService.canEditProductos()"
                  title="Gestionar Detalles"
                  (click)="gestionarDetalles(row)"
                >
                  <i class="ph ph-list-dashes"></i>
                </button>

                <!-- Editar -->
                <button
                  class="btn action-btn edit-btn"
                  *ngIf="permissionsService.canEditProductos()"
                  title="Editar"
                  (click)="editarProducto(row)"
                >
                  <i class="ph ph-pencil"></i>
                </button>

                <!-- Eliminar -->
                <button
                  class="btn action-btn delete-btn"
                  *ngIf="permissionsService.canDeleteProductos()"
                  title="Eliminar"
                  (click)="eliminarProducto(row)"
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
          *ngIf="!isLoading && productos.length === 0"
          class="text-center py-40"
        >
          <i class="ph ph-package text-gray-300 text-6xl mb-16"></i>
          <h6 class="text-heading fw-semibold mb-8">No hay productos</h6>
          <p class="text-gray-500 mb-16">Aún no has agregado ningún producto</p>
          <button
            class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
            *ngIf="permissionsService.canCreateProductos()"
            (click)="nuevoProducto()"
            data-bs-toggle="modal"
            data-bs-target="#modalCrearProducto"
          >
            <i class="ph ph-plus me-8"></i>
            Agregar primer producto
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar producto -->
    <app-producto-modal
      [producto]="productoSeleccionado"
      (productoGuardado)="onProductoGuardado()"
      (modalCerrado)="onModalCerrado()"
    >
    </app-producto-modal>

    <!-- Modal para gestionar detalles del producto -->
    <app-producto-detalles-modal
      [producto]="productoSeleccionado"
      (detallesGuardados)="onDetallesGuardados()"
      (modalCerrado)="onModalCerrado()"
    >
    </app-producto-detalles-modal>
  `,
  styles: [
    `
      /* Container de la tabla */
      .table-container {
        width: 100%;
        overflow-x: auto;
        overflow-y: visible;
        min-width: 0; /* Permite que el contenedor se contraiga */
      }

      /* Configuración base del datatable */
      ::ng-deep .productos-table {
        box-shadow: none !important;
        border: none !important;
        font-size: 13px;
        width: 100% !important;
        min-width: 900px !important; /* Reducido para pantallas más pequeñas */
        overflow: visible !important;
      }

      /* Eliminar scrollbars del datatable completamente */
      ::ng-deep .productos-table .datatable-scroll,
      ::ng-deep .productos-table .datatable-body-wrapper,
      ::ng-deep .productos-table .datatable-body {
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
      }

      /* Forzar ancho de la tabla responsive */
      ::ng-deep .productos-table .datatable-header,
      ::ng-deep .productos-table .datatable-body,
      ::ng-deep .productos-table .datatable-footer {
        width: 100% !important;
        min-width: 900px !important;
      }

      /* Header de la tabla */
      ::ng-deep .productos-table .datatable-header {
        background-color: #f8f9fa !important;
        border-bottom: 1px solid #dee2e6 !important;
        height: 50px !important;
      }

      ::ng-deep .productos-table .datatable-header-cell {
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

      ::ng-deep .productos-table .datatable-header-cell:last-child {
        border-right: none !important;
      }

      /* Celdas del cuerpo */
      ::ng-deep .productos-table .datatable-body-cell {
        padding: 8px !important;
        border-bottom: 1px solid #f1f3f4 !important;
        border-right: 1px solid #f8f9fa !important;
        font-size: 13px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 60px !important;
        vertical-align: middle !important;
      }

      ::ng-deep .productos-table .datatable-body-cell:last-child {
        border-right: none !important;
      }

      /* Filas alternadas */
      ::ng-deep .productos-table .datatable-row-even {
        background-color: #ffffff !important;
      }

      ::ng-deep .productos-table .datatable-row-odd {
        background-color: #fafbfc !important;
      }

      /* Hover en filas */
      ::ng-deep .productos-table .datatable-body-row:hover {
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

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .product-info {
        text-align: left;
        width: 100%;
        padding-left: 8px;
      }

      .product-name {
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

      .product-code {
        font-size: 11px !important;
        color: #6c757d !important;
        margin-bottom: 0 !important;
      }

      .category-badge,
      .brand-badge {
        font-size: 10px !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
        font-weight: 500 !important;
        white-space: nowrap;
      }

      .no-brand {
        font-size: 11px !important;
        font-style: italic;
      }

      .price-info {
        text-align: right;
        width: 100%;
        padding-right: 8px;
      }

      .sale-price {
        font-size: 13px !important;
        font-weight: 600 !important;
        color: #198754 !important;
        margin-bottom: 2px;
      }

      .buy-price {
        font-size: 10px !important;
        color: #6c757d !important;
      }

      .stock-info {
        text-align: center;
        width: 100%;
      }

      .stock-current {
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #212529 !important;
        margin-bottom: 2px;
      }

      .stock-current.stock-low {
        color: #dc3545 !important;
      }

      .stock-min {
        font-size: 10px !important;
        color: #6c757d !important;
      }

      .status-badge {
        font-size: 10px !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
        font-weight: 500 !important;
      }

      .status-active {
        background-color: #d1e7dd !important;
        color: #0f5132 !important;
      }

      .status-inactive {
        background-color: #f8d7da !important;
        color: #842029 !important;
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

      .details-btn {
        background-color: #cff4fc !important;
        color: #087990 !important;
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
        /* Estilos para el botón de estrella */
.star-btn.star-active {
  background-color: #fff3cd !important;
  color: #856404 !important;
}

.star-btn.star-inactive {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
}

.star-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.star-btn.star-active:hover {
  background-color: #ffecb5 !important;
  color: #664d03 !important;
}

.star-btn.star-inactive:hover {
  background-color: #e9ecef !important;
  color: #495057 !important;
}


      /* Footer */
      ::ng-deep .productos-table .datatable-footer {
        background-color: #f8f9fa !important;
        border-top: 1px solid #dee2e6 !important;
        padding: 8px 16px !important;
        font-size: 12px !important;
        height: 50px !important;
      }

      ::ng-deep .productos-table .datatable-pager {
        margin: 0 !important;
      }

      ::ng-deep .productos-table .datatable-pager .pager .pages .page {
        padding: 4px 8px !important;
        margin: 0 1px !important;
        border-radius: 4px !important;
        font-size: 11px !important;
      }

      ::ng-deep .productos-table .datatable-pager .pager .pages .page.active {
        background-color: #0d6efd !important;
        color: white !important;
      }

      /* Eliminar espacios innecesarios */
      ::ng-deep .productos-table .datatable-body {
        width: 100% !important;
      }

      ::ng-deep .productos-table .datatable-row-wrapper {
        width: 100% !important;
      }

      /* Responsive y layout mejorado */
      .card {
        overflow: hidden;
      }

      .gap-16 {
        gap: 16px;
      }

      .gap-8 {
        gap: 8px;
      }

      /* Header mejorado */
      .card-header {
        font-size: 13px;
      }

      /* Footer personalizado - ELIMINAR SCROLL COMPLETAMENTE */
      ::ng-deep .productos-table .datatable-footer {
        background-color: #f8f9fa !important;
        border-top: 1px solid #dee2e6 !important;
        padding: 12px 24px !important;
        font-size: 12px !important;
        height: 60px !important;
        overflow: visible !important;
        width: 100% !important;
        min-width: 1140px !important;
      }

      ::ng-deep .productos-table .datatable-footer .datatable-pager {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
        width: 100% !important;
      }

      ::ng-deep .productos-table .datatable-footer .datatable-pager .pager {
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        overflow: visible !important;
      }

      ::ng-deep .productos-table .datatable-footer .datatable-pager .pager .pages {
        display: flex !important;
        gap: 4px !important;
        align-items: center !important;
        overflow: visible !important;
      }

      /* Eliminar cualquier scroll residual */
      ::ng-deep .productos-table .datatable-footer * {
        overflow: visible !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        ::ng-deep .productos-table .datatable-header-cell,
        ::ng-deep .productos-table .datatable-body-cell {
          font-size: 11px !important;
          padding: 6px 4px !important;
        }

        .product-name {
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

      /* Media queries para diferentes tamaños de pantalla */
      @media (max-width: 1199px) {
        /* Pantallas medianas y laptops - permitir scroll horizontal */
        .table-container {
          overflow-x: auto;
        }

        ::ng-deep .productos-table {
          min-width: 900px !important;
        }

        ::ng-deep .productos-table .datatable-header,
        ::ng-deep .productos-table .datatable-body,
        ::ng-deep .productos-table .datatable-footer {
          min-width: 900px !important;
        }
      }

      @media (min-width: 1200px) and (max-width: 1599px) {
        /* Pantallas grandes estándar */
        ::ng-deep .productos-table {
          min-width: 100% !important;
        }

        .table-container {
          overflow-x: visible;
        }

        ::ng-deep .productos-table .datatable-header,
        ::ng-deep .productos-table .datatable-body,
        ::ng-deep .productos-table .datatable-footer {
          min-width: 100% !important;
        }
      }

      @media (min-width: 1600px) {
        /* Monitores muy grandes - usar todo el espacio disponible */
        ::ng-deep .productos-table {
          min-width: 100% !important;
          width: 100% !important;
        }

        .table-container {
          overflow-x: visible;
        }

        ::ng-deep .productos-table .datatable-header,
        ::ng-deep .productos-table .datatable-body,
        ::ng-deep .productos-table .datatable-footer {
          min-width: 100% !important;
          width: 100% !important;
        }

        /* En monitores grandes, dar más espacio a las columnas principales */
        ::ng-deep .productos-table .datatable-header-cell,
        ::ng-deep .productos-table .datatable-body-cell {
          padding: 12px 16px !important;
        }
      }
    `,
  ],
})
export class ProductosListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  productos: Producto[] = [];
  isLoading = true;
  productoSeleccionado: Producto | null = null;

  private resizeSubscription?: Subscription;

  // Paginación
  pageSize = 10;
  selected: any[] = [];

  // Configuración para NGX-Datatable con flexGrow inteligente
  columns = [
    { name: 'Imagen', prop: 'imagen_url', flexGrow: 0.3, minWidth: 70, maxWidth: 90 },
    { name: 'Producto', prop: 'nombre', flexGrow: 3, minWidth: 180 },
    { name: 'Categoría', prop: 'categoria.nombre', flexGrow: 1.2, minWidth: 110 },
    { name: 'Marca', prop: 'marca.nombre', flexGrow: 1, minWidth: 90 },
    { name: 'Precio Venta', prop: 'precio_venta', flexGrow: 1.3, minWidth: 110 },
    { name: 'Stock', prop: 'stock', flexGrow: 1, minWidth: 90 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8, minWidth: 70 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.8, minWidth: 150 }
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
    this.cargarProductos();

    this.seccionFilterService.seccionSeleccionada$.subscribe((seccionId) => {
      this.cargarProductos();
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

  cargarProductos(): void {
    this.isLoading = true;
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();

    this.almacenService.obtenerProductos(seccionId || undefined).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoading = false;
      },
    });
  }

  nuevoProducto(): void {
    this.productoSeleccionado = null;
  }

  editarProducto(producto: Producto): void {
    this.productoSeleccionado = producto;
    const modal = document.getElementById('modalCrearProducto');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  gestionarDetalles(producto: Producto): void {
    this.productoSeleccionado = producto;
    const modal = document.getElementById('modalDetallesProducto');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarProducto(producto: Producto): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `Estás a punto de eliminar el producto <strong>"${producto.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
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
        this.almacenService.eliminarProducto(producto.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El producto ha sido eliminado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#198754',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            this.cargarProductos();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el producto. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonColor: '#dc3545',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al eliminar producto:', error);
          },
        });
      }
    });
  }

  toggleEstado(producto: Producto): void {
    this.almacenService
      .toggleEstadoProducto(producto.id, !producto.activo)
      .subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar estado del producto:', error);
        },
      });
  }

  onProductoGuardado(): void {
    this.cargarProductos();
    this.productoSeleccionado = null;
  }

  onDetallesGuardados(): void {
    this.cargarProductos();
    this.productoSeleccionado = null;
  }

  onModalCerrado(): void {
    this.productoSeleccionado = null;
  }

  onImageError(event: any): void {
    console.error('Error al cargar imagen del producto:', event);
    event.target.style.display = 'none';
    event.target.classList.add('image-error');

    const container = event.target.closest('.image-container');
    if (container) {
      let placeholder = container.querySelector('.ph-package');
      if (!placeholder) {
        placeholder = document.createElement('i');
        placeholder.className = 'ph ph-package text-gray-400';
        placeholder.style.fontSize = '16px';
        container.appendChild(placeholder);
      }
      placeholder.style.display = 'block';
    }
  }
  toggleDestacado(producto: Producto): void {
    this.almacenService
      .toggleDestacadoProducto(producto.id, !producto.destacado)
      .subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar estado destacado:', error);
        },
      });
  }

  // Métodos para manejar selección y paginación
  onSelect(event: any): void {
    this.selected = event.selected;
  }

  onPageChange(event: any): void {
    // Manejo de cambio de página si es necesario
    console.log('Página cambiada:', event);
  }

  displayCheck(row: any): boolean {
    // Mostrar checkbox solo si el usuario tiene permisos para gestionar productos
    return this.permissionsService.canEditProductos();
  }

  // Obtener el texto del contador de selecciones
  get selectionText(): string {
    const total = this.productos.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} productos en total`;
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