import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidosService, Pedido, PedidoDetalle, PedidosResponse, CrearPedidoRequest } from '../../../services/pedidos.service';
import { NgxDatatableModule, ColumnMode, SelectionType, SortType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxDatatableModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Pedidos</h4>
          <p class="text-gray-500 mb-0">Administra todos los pedidos del sistema</p>
        </div>
      </div>

      <!-- Tabla de pedidos -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="loading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando pedidos...</p>
          </div>

          <!-- Datatable -->
          <ngx-datatable
            *ngIf="!loading"
            class="bootstrap pedidos-table"
            [columns]="columns"
            [rows]="pedidos"
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
              prop="codigo_pedido"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <strong>{{ row.codigo_pedido }}</strong>
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
                    <small class="text-muted">{{ row.tipo_pedido }}</small>
                  </div>
                </div>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Fecha -->
            <ngx-datatable-column
              name="Fecha"
              prop="fecha_pedido"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                {{ row.fecha_pedido | date:'dd/MM/yyyy HH:mm' }}
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Total -->
            <ngx-datatable-column
              name="Total"
              prop="total"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <span class="fw-bold text-success-600">S/ {{ row.total }}</span>
              </ng-template>
            </ngx-datatable-column>

            <!-- Columna Estado -->
            <ngx-datatable-column
              name="Estado"
              prop="estado_pedido.nombre"
              [flexGrow]="1"
            >
              <ng-template let-row="row" ngx-datatable-cell-template>
                <span class="badge px-12 py-6 rounded-pill fw-medium"
                      [class]="getEstadoBadgeClass(row.estado_pedido?.nombre)">
                  {{ row.estado_pedido?.nombre || 'PENDIENTE' }}
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
                  <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Ver detalle"
                          (click)="verDetalle(row)">
                    <i class="ph ph-eye text-sm"></i>
                  </button>
                  <button class="btn bg-warning-50 hover-bg-warning-100 text-warning-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Cambiar estado"
                          (click)="cambiarEstado(row)">
                    <i class="ph ph-gear text-sm"></i>
                  </button>
                  <button class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                          title="Imprimir"
                          (click)="imprimirPedido()">
                    <i class="ph ph-printer text-sm"></i>
                  </button>
                </div>
              </ng-template>
            </ngx-datatable-column>
          </ngx-datatable>

          <!-- Empty state -->
          <div *ngIf="!loading && pedidos.length === 0" class="text-center py-40">
            <i class="ph ph-package text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay pedidos</h6>
            <p class="text-gray-500 mb-16">Aún no se han registrado pedidos en el sistema</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle del Pedido -->
    <div class="modal fade" id="detallePedidoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalle del Pedido {{ pedidoSeleccionado?.codigo_pedido }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Información del Cliente -->
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">Información del Cliente</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Nombre:</strong> {{ pedidoSeleccionado?.cliente_nombre }}</p>
                    <p><strong>Documento:</strong> {{ pedidoSeleccionado?.user_cliente?.numero_documento }}</p>
                    <p><strong>Teléfono:</strong> {{ pedidoSeleccionado?.telefono_contacto }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Dirección:</strong> {{ pedidoSeleccionado?.direccion_envio }}</p>
                    <p><strong>Email:</strong> {{ pedidoSeleccionado?.user_cliente?.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del Pedido -->
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">Información del Pedido</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Fecha:</strong> {{ pedidoSeleccionado?.fecha_pedido | date:'dd/MM/yyyy HH:mm' }}</p>
                    <p><strong>Estado:</strong> 
                      <span class="badge px-12 py-6 rounded-pill fw-medium"
                            [class]="getEstadoBadgeClass(pedidoSeleccionado?.estado_pedido?.nombre)">
                        {{ pedidoSeleccionado?.estado_pedido?.nombre || 'PENDIENTE' }}
                      </span>
                    </p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Método Pago:</strong> {{ pedidoSeleccionado?.metodo_pago }}</p>
                    <p><strong>Observaciones:</strong> {{ pedidoSeleccionado?.observaciones || 'Sin observaciones' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Productos del Pedido -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Productos del Pedido</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Imagen</th>
                        <th>Producto</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of pedidoSeleccionado?.detalles">
                        <td>
                          <img [src]="detalle.imagen_url" 
                               [alt]="detalle.nombre_producto"
                               class="img-thumbnail"
                               style="width: 50px; height: 50px; object-fit: cover;">
                        </td>
                        <td>
                          <div class="fw-bold">{{ detalle.nombre_producto }}</div>
                          <small class="text-muted">{{ detalle.producto?.descripcion }}</small>
                        </td>
                        <td>{{ detalle.codigo_producto }}</td>
                        <td>
                          <span class="badge bg-primary rounded-circle">{{ detalle.cantidad }}</span>
                        </td>
                        <td>S/ {{ detalle.precio_unitario }}</td>
                        <td class="text-success-600 fw-bold">S/ {{ detalle.subtotal_linea }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4"></td>
                        <td><strong>Total:</strong></td>
                        <td class="text-success-600 fw-bold">S/ {{ pedidoSeleccionado?.total }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" (click)="imprimirPedido()">
              <i class="ph ph-printer me-2"></i>Imprimir
            </button>
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
export class PedidosListComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  loading = false;

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Código', prop: 'codigo_pedido', flexGrow: 1 },
    { name: 'Cliente', prop: 'cliente_nombre', flexGrow: 2 },
    { name: 'Fecha', prop: 'fecha_pedido', flexGrow: 1 },
    { name: 'Total', prop: 'total', flexGrow: 1 },
    { name: 'Estado', prop: 'estado_pedido.nombre', flexGrow: 1 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 1 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.pedidosService.getPedidos().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.pedidos = response.pedidos;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
        this.loading = false;
      }
    });
  }

  verDetalle(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
    const modal = document.getElementById('detallePedidoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  cambiarEstado(pedido: Pedido): void {
    console.log('Cambiar estado del pedido:', pedido.id);
  }

  imprimirPedido(): void {
    console.log('Imprimir pedido:', this.pedidoSeleccionado?.codigo_pedido);
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-secondary-50 text-secondary-600';
    
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-warning-50 text-warning-600';
      case 'procesando':
        return 'bg-info-50 text-info-600';
      case 'enviado':
        return 'bg-primary-50 text-primary-600';
      case 'entregado':
        return 'bg-success-50 text-success-600';
      case 'cancelado':
        return 'bg-danger-50 text-danger-600';
      default:
        return 'bg-secondary-50 text-secondary-600';
    }
  }
}