import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../../services/compras.service';
import { Compra } from '../../../services/compras.service';
import { NgxDatatableModule, ColumnMode, SelectionType, SortType } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxDatatableModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Compras</h4>
          <p class="text-gray-500 mb-0">Administra todas las compras del ecommerce</p>
        </div>
      </div>

      <!-- Tabla de compras -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">

          <!-- Loading state -->
          <div *ngIf="loading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando compras...</p>
          </div>

          <!-- Datatable -->
          <ngx-datatable
            *ngIf="!loading"
            class="bootstrap compras-table"
            [columns]="columns"
            [rows]="compras"
            [columnMode]="ColumnMode.flex"
            [headerHeight]="50"
            [footerHeight]="50"
            [rowHeight]="60"
            [limit]="10"
            [scrollbarV]="true"
            [scrollbarH]="false"
            [loadingIndicator]="loading"
            [trackByProp]="'id'"
            [sortType]="SortType.single"
            [selectionType]="SelectionType.single"
          >
            <!-- Columna Código -->
            <ngx-datatable-column
              name="Código"
              prop="codigo_compra"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="d-flex align-items-center">
                  <i *ngIf="necesitaAtencion(row)" class="ph ph-bell text-warning me-2" title="Requiere atención"></i>
                  <strong>{{ row.codigo_compra }}</strong>
                </div>
                <small class="text-muted" *ngIf="row.codigo_cotizacion">
                  Cotización: {{ row.codigo_cotizacion }}
                </small>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Cliente -->
            <ngx-datatable-column
              name="Cliente"
              prop="cliente_nombre"
              [flexGrow]="2"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-2">
                    <div class="avatar-title bg-primary rounded-circle">
                      {{ getInitials(row.cliente_nombre) }}
                    </div>
                  </div>
                  <div>
                    <div class="fw-bold">{{ row.cliente_nombre }}</div>
                    <small class="text-muted">{{ row.cliente_email }}</small>
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Fecha -->
            <ngx-datatable-column
              name="Fecha"
              prop="fecha_compra"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                {{ formatearFecha(row.fecha_compra) }}
                <div *ngIf="row.fecha_aprobacion">
                  <small class="text-muted">Aprobada: {{ formatearFecha(row.fecha_aprobacion) }}</small>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Total -->
            <ngx-datatable-column
              name="Total"
              prop="total"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <span class="fw-bold text-success-600">S/ {{ formatearPrecio(row.total) }}</span>
                <div class="mt-1">
                  <small class="text-muted">{{ row.metodo_pago || 'Sin especificar' }}</small>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Estado -->
            <ngx-datatable-column
              name="Estado"
              prop="estado_actual.nombre"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <span class="badge px-12 py-6 rounded-pill fw-medium"
                      [class]="getEstadoClass(row.estado_actual)">
                  <i [class]="getEstadoIcon(row.estado_actual)" class="me-1"></i>
                  {{ row.estado_actual?.nombre || 'Sin estado' }}
                </span>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Acciones -->
            <ngx-datatable-column
              name="Acciones"
              [flexGrow]="1"
              [sortable]="false"
              [canAutoResize]="false"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <div class="d-flex justify-content-center gap-8">
                  <!-- Ver detalle -->
                  <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Ver detalle"
                          (click)="verDetalle(row)">
                    <i class="ph ph-eye text-sm"></i>
                  </button>

                  <!-- Aprobar -->
                  <button *ngIf="row.estado_actual?.nombre === 'Pendiente Aprobación'"
                          class="btn bg-success-50 hover-bg-success-100 text-success-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Aprobar compra"
                          (click)="aprobarCompra(row)">
                    <i class="ph ph-check text-sm"></i>
                  </button>

                  <!-- Rechazar -->
                  <button *ngIf="row.estado_actual?.nombre === 'Pendiente Aprobación' || row.estado_actual?.nombre === 'Aprobada'"
                          class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Rechazar compra"
                          (click)="rechazarCompra(row)">
                    <i class="ph ph-x text-sm"></i>
                  </button>
                </div>
              </ng-template>
            </ngx-datatable-column>
          </ngx-datatable>

          <!-- Empty state -->
          <div *ngIf="!loading && compras.length === 0" class="text-center py-40">
            <i class="ph ph-shopping-bag text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay compras</h6>
            <p class="text-gray-500 mb-16">Aún no se han registrado compras en el sistema</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table td {
      vertical-align: middle;
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .avatar-title {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
  `]
})
export class ComprasListComponent implements OnInit {
  compras: Compra[] = [];
  compraSeleccionada: Compra | null = null;
  loading = false;

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Código', prop: 'codigo_compra', flexGrow: 1 },
    { name: 'Cliente', prop: 'cliente_nombre', flexGrow: 2 },
    { name: 'Fecha', prop: 'fecha_compra', flexGrow: 1 },
    { name: 'Total', prop: 'total', flexGrow: 1 },
    { name: 'Estado', prop: 'estado_actual.nombre', flexGrow: 1 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(private comprasService: ComprasService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.loading = true;
    this.comprasService.obtenerTodasLasCompras().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.compras = response.compras || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando compras:', error);
        this.loading = false;
      }
    });
  }

  verDetalle(compra: Compra): void {
    this.compraSeleccionada = compra;
    console.log('Ver detalle de compra:', compra.codigo_compra);
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  aprobarCompra(compra: Compra): void {
    if (confirm('¿Está seguro de aprobar esta compra?')) {
      this.comprasService.aprobarCompra(compra.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.cargarCompras();
          }
        },
        error: (error) => {
          console.error('Error aprobando compra:', error);
          alert('Error al aprobar la compra');
        }
      });
    }
  }

  rechazarCompra(compra: Compra): void {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      this.comprasService.rechazarCompra(compra.id, motivo).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.cargarCompras();
          }
        },
        error: (error) => {
          console.error('Error rechazando compra:', error);
          alert('Error al rechazar la compra');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return this.comprasService.formatearFecha(fecha);
  }

  formatearPrecio(precio: number): string {
    return this.comprasService.formatearPrecio(precio);
  }

  getEstadoClass(estado: any): string {
    return this.comprasService.getEstadoClass(estado);
  }

  getEstadoIcon(estado: any): string {
    return this.comprasService.getEstadoIcon(estado);
  }

  necesitaAtencion(compra: Compra): boolean {
    return this.comprasService.necesitaAtencion(compra);
  }
}