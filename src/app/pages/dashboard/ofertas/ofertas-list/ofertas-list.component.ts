// src/app/pages/dashboard/ofertas/ofertas-list/ofertas-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfertasAdminService, OfertaAdmin } from '../../../../services/ofertas-admin.service';
import { OfertaModalComponent } from '../oferta-modal/oferta-modal.component';
import { ProductosOfertaComponent } from '../productos-oferta/productos-oferta.component';
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
  selector: 'app-ofertas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    OfertaModalComponent,
    ProductosOfertaComponent,
    NgxDatatableModule
  ],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Ofertas</h4>
          <p class="text-gray-500 mb-0">Administra las ofertas y promociones</p>
        </div>
        <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearOferta">
          <i class="ph ph-plus me-8"></i>
          Nueva Oferta
        </button>
      </div>

      <!-- Vista de gestión de productos (cuando se selecciona una oferta) -->
      <div *ngIf="mostrarProductos">
        <div class="d-flex align-items-center gap-12 mb-24">
          <button class="btn bg-gray-100 hover-bg-gray-200 text-gray-600 px-12 py-8 rounded-6"
                  (click)="volverAOfertas()">
            <i class="ph ph-arrow-left me-8"></i>
            Volver a Ofertas
          </button>
          <div class="vr"></div>
          <h5 class="text-heading fw-semibold mb-0">Gestionar Productos</h5>
        </div>
        
        <app-productos-oferta 
          [ofertaId]="ofertaSeleccionada!.id!" 
          [ofertaTitulo]="ofertaSeleccionada!.titulo">
        </app-productos-oferta>
      </div>

      <!-- Vista principal de ofertas -->
      <div *ngIf="!mostrarProductos">
        <!-- Tabla con NGX-Datatable -->
        <div class="card border-0 shadow-sm rounded-12">
          <!-- Header de información -->
          <div class="card-header bg-white border-bottom px-24 py-16" *ngIf="!isLoading && ofertas.length > 0">
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
              <p class="text-gray-500 mt-12 mb-0">Cargando ofertas...</p>
            </div>

            <!-- Datatable -->
            <ngx-datatable
              #table
              *ngIf="!isLoading"
              class="bootstrap ofertas-table"
              [columns]="columns"
              [rows]="ofertas"
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
              <!-- Columna Oferta -->
              <ngx-datatable-column
                name="Oferta"
                prop="titulo"
                [flexGrow]="2.5"
                [minWidth]="180"
                [sortable]="true"
              >
                <ng-template let-row="row" ngx-datatable-cell-template>
                  <div class="d-flex align-items-center gap-12">
                    <div class="oferta-image-container">
                      <img *ngIf="row.imagen_url" 
                           [src]="row.imagen_url" 
                           [alt]="row.titulo"
                           class="oferta-image">
                      <i *ngIf="!row.imagen_url" class="ph ph-tag text-gray-400"></i>
                    </div>
                    <div class="oferta-info">
                      <div class="d-flex align-items-center gap-8">
                        <h6 class="oferta-title" [title]="row.titulo">{{ row.titulo }}</h6>
                        <span *ngIf="row.es_oferta_principal" 
                              class="badge bg-warning-50 text-warning-600 principal-badge"
                              title="Esta es la oferta principal del día">
                          <i class="ph ph-star me-4"></i>PRINCIPAL
                        </span>
                      </div>
                      <p class="oferta-subtitle">{{ row.subtitulo || 'Sin subtítulo' }}</p>
                    </div>
                  </div>
                </ng-template>
              </ngx-datatable-column>

              <!-- Columna Descuento -->
              <ngx-datatable-column
                name="Descuento"
                prop="valor_descuento"
                [flexGrow]="1"
                [minWidth]="90"
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
                  </div>
                </ng-template>
              </ngx-datatable-column>

              <!-- Columna Fechas -->
              <ngx-datatable-column
                name="Fechas"
                prop="fecha_inicio"
                [flexGrow]="1.5"
                [minWidth]="120"
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

              <!-- Columna Productos -->
              <ngx-datatable-column
                name="Productos"
                [flexGrow]="1"
                [minWidth]="80"
                [sortable]="false"
              >
                <ng-template let-row="row" ngx-datatable-cell-template>
                  <div class="text-center">
                    <button class="btn bg-info-50 hover-bg-info-100 text-info-600 productos-btn"
                            (click)="gestionarProductos(row)">
                      <i class="ph ph-package me-6"></i>
                      Gestionar
                    </button>
                    <div class="productos-count">
                      {{ contarProductos(row) }} productos
                    </div>
                  </div>
                </ng-template>
              </ngx-datatable-column>

              <!-- Columna Configuración -->
              <ngx-datatable-column
                name="Configuración"
                [flexGrow]="1.2"
                [minWidth]="100"
                [sortable]="false"
              >
                <ng-template let-row="row" ngx-datatable-cell-template>
                  <div class="config-info">
                    <div class="config-badges">
                      <span *ngIf="row.mostrar_countdown" 
                            class="badge bg-warning-50 text-warning-600 config-badge">
                        <i class="ph ph-timer me-4"></i>Countdown
                      </span>
                      <span *ngIf="row.mostrar_en_slider" 
                            class="badge bg-info-50 text-info-600 config-badge">
                        <i class="ph ph-slides me-4"></i>Slider
                      </span>
                      <span *ngIf="row.mostrar_en_banner" 
                            class="badge bg-purple-50 text-purple-600 config-badge">
                        <i class="ph ph-image me-4"></i>Banner
                      </span>
                    </div>
                    <div class="prioridad-info">
                      <strong>Prioridad:</strong> {{ row.prioridad }}
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
                [sortable]="true"
              >
                <ng-template let-row="row" ngx-datatable-cell-template>
                  <span class="badge estado-badge"
                        [class]="row.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                    {{ row.activo ? 'Activa' : 'Inactiva' }}
                  </span>
                </ng-template>
              </ngx-datatable-column>

              <!-- Columna Acciones -->
              <ngx-datatable-column
                name="Acciones"
                [flexGrow]="1.2"
                [minWidth]="150"
                [sortable]="false"
                [canAutoResize]="false"
              >
                <ng-template let-row="row" ngx-datatable-cell-template>
                  <div class="action-buttons">
                    <!-- Toggle Oferta Principal -->
                    <button class="btn action-btn principal-btn"
                            [class.principal-active]="row.es_oferta_principal"
                            [class.principal-inactive]="!row.es_oferta_principal"
                            [title]="row.es_oferta_principal ? 'Quitar como oferta principal' : 'Marcar como oferta principal'"
                            (click)="toggleOfertaPrincipal(row)">
                      <i class="ph ph-star" [class.ph-fill]="row.es_oferta_principal"></i>
                    </button>
                    <!-- Toggle Oferta de la Semana -->
<button class="btn action-btn semana-btn"
        [class.semana-active]="row.es_oferta_semana"
        [class.semana-inactive]="!row.es_oferta_semana"
        [title]="row.es_oferta_semana ? 'Quitar como oferta de la semana' : 'Marcar como oferta de la semana'"
        (click)="toggleOfertaSemana(row)">
  <i class="ph ph-calendar-star" [class.ph-fill]="row.es_oferta_semana"></i>
</button>

                    <!-- Editar -->
                    <button class="btn action-btn edit-btn"
                            title="Editar"
                            (click)="editarOferta(row)">
                      <i class="ph ph-pencil"></i>
                    </button>

                    <!-- Eliminar -->
                    <button class="btn action-btn delete-btn"
                            title="Eliminar"
                            (click)="eliminarOferta(row.id!)">
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </ng-template>
              </ngx-datatable-column>
            </ngx-datatable>

            <!-- Empty state -->
            <div *ngIf="!isLoading && ofertas.length === 0" class="text-center py-40">
              <i class="ph ph-tag text-gray-300 text-6xl mb-16"></i>
              <h6 class="text-heading fw-semibold mb-8">No hay ofertas</h6>
              <p class="text-gray-500 mb-16">Aún no has creado ninguna oferta</p>
              <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                      data-bs-toggle="modal" 
                      data-bs-target="#modalCrearOferta">
                <i class="ph ph-plus me-8"></i>
                Crear primera oferta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar oferta -->
      <app-oferta-modal 
        [oferta]="ofertaParaEditar"
        (ofertaGuardada)="onOfertaGuardada()"
        (modalCerrado)="onModalCerrado()">
      </app-oferta-modal>
    </div>
  `,
  styles: [`
    .vr {
      width: 1px;
      height: 24px;
      background-color: #dee2e6;
    }

    /* Configuración base del datatable */
    ::ng-deep .ofertas-table {
      box-shadow: none !important;
      border: none !important;
      font-size: 13px;
      width: 100% !important;
    }

    /* Header de la tabla */
    ::ng-deep .ofertas-table .datatable-header {
      background-color: #f8f9fa !important;
      border-bottom: 1px solid #dee2e6 !important;
      height: 50px !important;
    }

    ::ng-deep .ofertas-table .datatable-header-cell {
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

    ::ng-deep .ofertas-table .datatable-header-cell:last-child {
      border-right: none !important;
    }

    /* Celdas del cuerpo */
    ::ng-deep .ofertas-table .datatable-body-cell {
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

    ::ng-deep .ofertas-table .datatable-body-cell:last-child {
      border-right: none !important;
    }

    /* Filas alternadas */
    ::ng-deep .ofertas-table .datatable-row-even {
      background-color: #ffffff !important;
    }

    ::ng-deep .ofertas-table .datatable-row-odd {
      background-color: #fafbfc !important;
    }

    /* Hover en filas */
    ::ng-deep .ofertas-table .datatable-body-row:hover {
      background-color: #f5f5f5 !important;
    }

    /* Estilos específicos para ofertas */
    .oferta-image-container {
      width: 48px;
      height: 48px;
      background-color: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .oferta-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .oferta-info {
      text-align: left;
      width: 100%;
      padding-left: 8px;
    }

    .oferta-title {
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

    .oferta-subtitle {
      font-size: 11px !important;
      color: #6c757d !important;
      margin-bottom: 0 !important;
    }

    .principal-badge {
      font-size: 9px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
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

    .productos-btn {
      font-size: 11px !important;
      padding: 4px 8px !important;
      border-radius: 12px !important;
      font-weight: 500 !important;
      border: none !important;
    }

    .productos-count {
      font-size: 10px !important;
      color: #6c757d !important;
      margin-top: 4px;
    }

    .config-info {
      text-align: left;
      width: 100%;
    }

    .config-badges {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 4px;
    }

    .config-badge {
      font-size: 9px !important;
      padding: 2px 6px !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      white-space: nowrap;
      align-self: flex-start;
    }

    .prioridad-info {
      font-size: 10px !important;
      color: #6c757d !important;
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

    .principal-btn.principal-active {
      background-color: #fff3cd !important;
      color: #856404 !important;
    }

    .principal-btn.principal-inactive {
      background-color: #f8f9fa !important;
      color: #6c757d !important;
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

    .principal-btn.principal-active:hover {
      background-color: #ffecb5 !important;
      color: #664d03 !important;
    }

    .principal-btn.principal-inactive:hover {
      background-color: #e9ecef !important;
      color: #495057 !important;
    }

    /* Estilos para el botón de oferta de la semana */
    .semana-btn.semana-active {
      background-color: #f8d7da !important;
      color: #842029 !important;
    }

    .semana-btn.semana-inactive {
      background-color: #f8f9fa !important;
      color: #6c757d !important;
    }

    .semana-btn:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }

    .semana-btn.semana-active:hover {
      background-color: #f1aeb5 !important;
      color: #721c24 !important;
    }

    .semana-btn.semana-inactive:hover {
      background-color: #e9ecef !important;
      color: #495057 !important;
    }

    /* Footer */
    ::ng-deep .ofertas-table .datatable-footer {
      background-color: #f8f9fa !important;
      border-top: 1px solid #dee2e6 !important;
      padding: 8px 16px !important;
      font-size: 12px !important;
      height: 50px !important;
    }

    ::ng-deep .ofertas-table .datatable-pager {
      margin: 0 !important;
    }

    ::ng-deep .ofertas-table .datatable-pager .pager .pages .page {
      padding: 4px 8px !important;
      margin: 0 1px !important;
      border-radius: 4px !important;
      font-size: 11px !important;
    }

    ::ng-deep .ofertas-table .datatable-pager .pager .pages .page.active {
      background-color: #0d6efd !important;
      color: white !important;
    }

    /* Eliminar espacios innecesarios */
    ::ng-deep .ofertas-table .datatable-body {
      width: 100% !important;
    }

    ::ng-deep .ofertas-table .datatable-row-wrapper {
      width: 100% !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      ::ng-deep .ofertas-table .datatable-header-cell,
      ::ng-deep .ofertas-table .datatable-body-cell {
        font-size: 11px !important;
        padding: 6px 4px !important;
      }
      
      .oferta-title {
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

      .config-badges {
        gap: 1px;
      }

      .config-badge {
        font-size: 8px !important;
        padding: 1px 4px !important;
      }
    }
  `]
})
export class OfertasListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  
  ofertas: OfertaAdmin[] = [];
  isLoading = true;
  ofertaParaEditar: OfertaAdmin | null = null;

  // Propiedades para gestión de productos
  mostrarProductos = false;
  ofertaSeleccionada: OfertaAdmin | null = null;

  private resizeSubscription?: Subscription;

  // Paginación
  pageSize = 10;
  selected: any[] = [];

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Oferta', prop: 'titulo', flexGrow: 2.5, minWidth: 180 },
    { name: 'Descuento', prop: 'valor_descuento', flexGrow: 1, minWidth: 90 },
    { name: 'Fechas', prop: 'fecha_inicio', flexGrow: 1.5, minWidth: 120 },
    { name: 'Productos', prop: 'productos', flexGrow: 1, minWidth: 80 },
    { name: 'Configuración', prop: 'configuracion', flexGrow: 1.2, minWidth: 100 },
    { name: 'Estado', prop: 'activo', flexGrow: 0.8, minWidth: 70 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1.2, minWidth: 150 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(
    private ofertasAdminService: OfertasAdminService
  ) {
    // Escuchar cambios de resize del window
    this.resizeSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.cargarOfertas();

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

  cargarOfertas(): void {
    this.isLoading = true;
    this.ofertasAdminService.obtenerOfertas().subscribe({
      next: (ofertas) => {
        // Ordenar por prioridad descendente (mayor prioridad primero)
        this.ofertas = ofertas.sort((a, b) => b.prioridad - a.prioridad);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar ofertas:', error);
        this.isLoading = false;
      }
    });
  }

  editarOferta(oferta: OfertaAdmin): void {
    this.ofertaParaEditar = oferta;
    const modal = document.getElementById('modalCrearOferta');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  toggleOfertaPrincipal(oferta: OfertaAdmin): void {
    const accion = oferta.es_oferta_principal ? 'quitar' : 'marcar';
    const mensaje = oferta.es_oferta_principal 
      ? '¿Quitar como oferta principal?' 
      : '¿Marcar como oferta principal del día?';
    
    const textoConfirmacion = oferta.es_oferta_principal
      ? 'Esta oferta ya no será la principal'
      : 'Esta oferta se mostrará en la sección "Ofertas del día" y cualquier otra oferta principal será desmarcada automáticamente';

    Swal.fire({
      title: mensaje,
      text: textoConfirmacion,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: oferta.es_oferta_principal ? '#dc3545' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: oferta.es_oferta_principal ? 'Sí, quitar' : 'Sí, marcar como principal',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-12',
        confirmButton: 'rounded-8',
        cancelButton: 'rounded-8',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.ofertasAdminService.toggleOfertaPrincipal(oferta.id!).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Actualizado!',
              text: response.message,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'rounded-12',
              },
            });
            this.cargarOfertas(); // Recargar para actualizar el estado
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar la oferta principal.',
              icon: 'error',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al toggle oferta principal:', error);
          }
        });
      }
    });
  }
  toggleOfertaSemana(oferta: OfertaAdmin): void {
  const accion = oferta.es_oferta_semana ? 'quitar' : 'marcar';
  const mensaje = oferta.es_oferta_semana 
    ? '¿Quitar como oferta de la semana?' 
    : '¿Marcar como oferta de la semana?';
  
  const textoConfirmacion = oferta.es_oferta_semana
    ? 'Esta oferta ya no será la oferta de la semana'
    : 'Esta oferta se mostrará en la sección "Ofertas de la semana" y cualquier otra oferta de la semana será desmarcada automáticamente';

  Swal.fire({
    title: mensaje,
    text: textoConfirmacion,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: oferta.es_oferta_semana ? '#dc3545' : '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: oferta.es_oferta_semana ? 'Sí, quitar' : 'Sí, marcar como oferta de la semana',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'rounded-12',
      confirmButton: 'rounded-8',
      cancelButton: 'rounded-8',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.ofertasAdminService.toggleOfertaSemana(oferta.id!).subscribe({
        next: (response) => {
          Swal.fire({
            title: '¡Actualizado!',
            text: response.message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-12',
            },
          });
          this.cargarOfertas(); // Recargar para actualizar el estado
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la oferta de la semana.',
            icon: 'error',
            customClass: {
              popup: 'rounded-12',
              confirmButton: 'rounded-8',
            },
          });
          console.error('Error al toggle oferta de la semana:', error);
        }
      });
    }
  });
}

  gestionarProductos(oferta: OfertaAdmin): void {
    this.ofertaSeleccionada = oferta;
    this.mostrarProductos = true;
  }

  volverAOfertas(): void {
    this.mostrarProductos = false;
    this.ofertaSeleccionada = null;
  }

  contarProductos(oferta: OfertaAdmin): number {
    return (oferta as any).productos?.length || 0;
  }

  eliminarOferta(id: number): void {
    Swal.fire({
      title: '¿Eliminar oferta?',
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
        this.ofertasAdminService.eliminarOferta(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminada!',
              text: 'La oferta ha sido eliminada.',
              icon: 'success',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            this.cargarOfertas();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la oferta.',
              icon: 'error',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al eliminar oferta:', error);
          }
        });
      }
    });
  }

  onOfertaGuardada(): void {
    this.cargarOfertas();
    this.ofertaParaEditar = null;
  }

  onModalCerrado(): void {
    this.ofertaParaEditar = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getEstadoFecha(oferta: OfertaAdmin): {texto: string, class: string} {
    const ahora = new Date();
    const inicio = new Date(oferta.fecha_inicio);
    const fin = new Date(oferta.fecha_fin);

    if (ahora < inicio) {
      return { texto: 'Programada', class: 'bg-info-50 text-info-600' };
    } else if (ahora >= inicio && ahora <= fin) {
      return { texto: 'Activa', class: 'bg-success-50 text-success-600' };
    } else {
      return { texto: 'Expirada', class: 'bg-danger-50 text-danger-600' };
    }
  }

  // Métodos para manejar selección y paginación
  onSelect(event: any): void {
    this.selected = event.selected;
  }

  onPageChange(event: any): void {
    console.log('Página cambiada:', event);
  }

  displayCheck(row: any): boolean {
    return true; // Ajustar según permisos si es necesario
  }

  get selectionText(): string {
    const total = this.ofertas.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} ofertas en total`;
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