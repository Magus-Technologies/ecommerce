import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PedidosService, Pedido, EstadoPedido } from '../../../services/pedidos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Gestión de Pedidos</h5>
        <p class="text-gray-500 mb-0">Administra todos los pedidos del e-commerce</p>
      </div>
      <div class="d-flex gap-12">
        <button 
          class="btn bg-success-600 hover-bg-success-700 text-white px-16 py-8 rounded-8"
          (click)="cargarPedidos()">
          <i class="ph ph-arrow-clockwise me-8"></i>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card border-0 shadow-sm rounded-12 mb-24">
      <div class="card-body p-24">
        <form [formGroup]="filtrosForm" (ngSubmit)="aplicarFiltros()">
          <div class="row">
            <div class="col-md-3 mb-16">
              <label class="form-label text-heading fw-medium mb-8">Estado</label>
              <select class="form-select px-16 py-12 border rounded-8" formControlName="estado_pedido_id">
                <option value="">Todos los estados</option>
                <option *ngFor="let estado of estados" [value]="estado.id">
                  {{ estado.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-3 mb-16">
              <label class="form-label text-heading fw-medium mb-8">Fecha Inicio</label>
              <input 
                type="date" 
                class="form-control px-16 py-12 border rounded-8"
                formControlName="fecha_inicio">
            </div>
            <div class="col-md-3 mb-16">
              <label class="form-label text-heading fw-medium mb-8">Fecha Fin</label>
              <input 
                type="date" 
                class="form-control px-16 py-12 border rounded-8"
                formControlName="fecha_fin">
            </div>
            <div class="col-md-3 mb-16">
              <label class="form-label text-heading fw-medium mb-8">Buscar</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control px-16 py-12 border rounded-start-8"
                  formControlName="search"
                  placeholder="Código, cliente...">
                <button 
                  type="submit" 
                  class="btn bg-main-600 text-white px-16 rounded-end-8">
                  <i class="ph ph-magnifying-glass"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="row mb-24">
      <div class="col-md-3 mb-16">
        <div class="card border-0 shadow-sm rounded-12 p-20">
          <div class="d-flex align-items-center gap-16">
            <div class="w-48 h-48 bg-warning-50 rounded-12 flex-center">
              <i class="ph ph-clock text-warning-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-heading fw-bold mb-4">{{ estadisticas.pendientes || 0 }}</h6>
              <p class="text-sm text-gray-500 mb-0">Pendientes</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-16">
        <div class="card border-0 shadow-sm rounded-12 p-20">
          <div class="d-flex align-items-center gap-16">
            <div class="w-48 h-48 bg-info-50 rounded-12 flex-center">
              <i class="ph ph-package text-info-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-heading fw-bold mb-4">{{ estadisticas.preparacion || 0 }}</h6>
              <p class="text-sm text-gray-500 mb-0">En Preparación</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-16">
        <div class="card border-0 shadow-sm rounded-12 p-20">
          <div class="d-flex align-items-center gap-16">
            <div class="w-48 h-48 bg-primary-50 rounded-12 flex-center">
              <i class="ph ph-truck text-primary-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-heading fw-bold mb-4">{{ estadisticas.enviados || 0 }}</h6>
              <p class="text-sm text-gray-500 mb-0">Enviados</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-16">
        <div class="card border-0 shadow-sm rounded-12 p-20">
          <div class="d-flex align-items-center gap-16">
            <div class="w-48 h-48 bg-success-50 rounded-12 flex-center">
              <i class="ph ph-check-circle text-success-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-heading fw-bold mb-4">{{ estadisticas.entregados || 0 }}</h6>
              <p class="text-sm text-gray-500 mb-0">Entregados</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de pedidos -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando pedidos...</p>
        </div>

        <!-- Tabla -->
        <div *ngIf="!isLoading" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Código</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Cliente</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Fecha</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Total</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Método Pago</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pedido of pedidos" class="border-bottom border-gray-100">
                <!-- Código -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">{{ pedido.codigo_pedido }}</span>
                </td>

                <!-- Cliente -->
                <td class="px-24 py-16">
                  <div>
                    <h6 class="text-heading fw-medium mb-4">
                      {{ getClienteNombre(pedido) }}
                    </h6>
                    <p class="text-gray-500 text-sm mb-0">
                      {{ getClienteDocumento(pedido) }}
                    </p>
                  </div>
                </td>

                <!-- Fecha -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ formatearFecha(pedido.fecha_pedido) }}</span>
                </td>

                <!-- Total -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">S/ {{ formatPrice(pedido.total) }}</span>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <div class="dropdown">
                    <button 
                      class="btn badge px-12 py-6 rounded-pill fw-medium dropdown-toggle border-0"
                      [ngClass]="getEstadoBadgeClass(pedido.estadoPedido?.nombre)"
                      type="button" 
                      [id]="'dropdown-estado-' + pedido.id"
                      data-bs-toggle="dropdown">
                      {{ pedido.estadoPedido?.nombre || 'Sin estado' }}
                    </button>
                    <ul class="dropdown-menu" [attr.aria-labelledby]="'dropdown-estado-' + pedido.id">
                      <li *ngFor="let estado of estados">
                        <button 
                          class="dropdown-item"
                          (click)="cambiarEstado(pedido, estado.id)"
                          [class.active]="estado.id === pedido.estado_pedido_id">
                          <span class="badge me-8 px-8 py-4 rounded-pill fw-medium"
                                [ngClass]="getEstadoBadgeClass(estado.nombre)">
                            {{ estado.nombre }}
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>

                <!-- Método Pago -->
                <td class="px-24 py-16">
                  <span class="badge bg-info-50 text-info-600 px-12 py-6 rounded-pill fw-medium">
                    {{ pedido.metodo_pago || 'No especificado' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Ver detalle -->
                    <button 
                      class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Ver detalle"
                      (click)="verDetalle(pedido)">
                      <i class="ph ph-eye text-sm"></i>
                    </button>

                    <!-- Editar -->
                    <button 
                      class="btn bg-warning-50 hover-bg-warning-100 text-warning-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Editar estado"
                      (click)="editarPedido(pedido)">
                      <i class="ph ph-pencil text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="pedidos.length === 0" class="text-center py-40">
            <i class="ph ph-package text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay pedidos</h6>
            <p class="text-gray-500 mb-16">No se encontraron pedidos con los filtros aplicados</p>
          </div>
        </div>

        <!-- Paginación -->
        <div *ngIf="paginacion && paginacion.last_page > 1" class="p-24 border-top border-gray-100">
          <nav>
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" [class.disabled]="paginacion.current_page === 1">
                <button class="page-link" (click)="cambiarPagina(paginacion.current_page - 1)">
                  Anterior
                </button>
              </li>
              <li 
                *ngFor="let page of getPaginas()" 
                class="page-item" 
                [class.active]="page === paginacion.current_page">
                <button class="page-link" (click)="cambiarPagina(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" [class.disabled]="paginacion.current_page === paginacion.last_page">
                <button class="page-link" (click)="cambiarPagina(paginacion.current_page + 1)">
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Pedido -->
    <div class="modal fade" id="modalDetallePedido" tabindex="-1" *ngIf="pedidoSeleccionado">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header border-bottom border-gray-200">
            <h5 class="modal-title text-heading fw-semibold">
              <i class="ph ph-package me-8"></i>
              Detalle del Pedido {{ pedidoSeleccionado.codigo_pedido }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-24">
            <div class="row mb-24">
              <!-- Información del cliente -->
              <div class="col-md-6">
                <h6 class="text-heading fw-semibold mb-16">
                  <i class="ph ph-user me-8"></i>Información del Cliente
                </h6>
                <div class="bg-gray-50 rounded-8 p-16 mb-16">
                  <p class="mb-8"><strong>Nombre:</strong> {{ getClienteNombre(pedidoSeleccionado) }}</p>
                  <p class="mb-8"><strong>Documento:</strong> {{ getClienteDocumento(pedidoSeleccionado) }}</p>
                  <p class="mb-8"><strong>Teléfono:</strong> {{ pedidoSeleccionado.telefono_contacto || 'No especificado' }}</p>
                  <p class="mb-0"><strong>Dirección:</strong> {{ pedidoSeleccionado.direccion_envio || 'No especificada' }}</p>
                </div>
              </div>

              <!-- Información del pedido -->
              <div class="col-md-6">
                <h6 class="text-heading fw-semibold mb-16">
                  <i class="ph ph-info me-8"></i>Información del Pedido
                </h6>
                <div class="bg-gray-50 rounded-8 p-16 mb-16">
                  <p class="mb-8"><strong>Fecha:</strong> {{ formatearFecha(pedidoSeleccionado.fecha_pedido) }}</p>
                  <p class="mb-8"><strong>Estado:</strong> 
                    <span class="badge px-8 py-4 rounded-pill fw-medium ms-8"
                          [ngClass]="getEstadoBadgeClass(pedidoSeleccionado.estadoPedido?.nombre)">
                      {{ pedidoSeleccionado.estadoPedido?.nombre }}
                    </span>
                  </p>
                  <p class="mb-8"><strong>Método de Pago:</strong> {{ pedidoSeleccionado.metodo_pago }}</p>
                  <p class="mb-0"><strong>Observaciones:</strong> {{ pedidoSeleccionado.observaciones || 'Ninguna' }}</p>
                </div>
              </div>
            </div>

            <!-- Productos -->
            <h6 class="text-heading fw-semibold mb-16">
              <i class="ph ph-shopping-bag me-8"></i>Productos del Pedido
            </h6>
            <div class="table-responsive mb-24">
              <table class="table table-bordered">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-16 py-12 text-heading fw-semibold">Producto</th>
                    <th class="px-16 py-12 text-heading fw-semibold text-center">Cantidad</th>
                    <th class="px-16 py-12 text-heading fw-semibold text-end">Precio Unit.</th>
                    <th class="px-16 py-12 text-heading fw-semibold text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let detalle of pedidoSeleccionado.detalles">
                    <td class="px-16 py-12">
                      <div class="d-flex align-items-center gap-12">
                        <img 
                          [src]="detalle.producto?.imagen_url || '/placeholder.svg?height=40&width=40'" 
                          [alt]="detalle.nombre_producto"
                          class="w-40 h-40 object-fit-cover rounded-6">
                        <div>
                          <h6 class="text-heading fw-medium mb-4">{{ detalle.nombre_producto }}</h6>
                          <p class="text-gray-500 text-sm mb-0">{{ detalle.codigo_producto }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-16 py-12 text-center">
                      <span class="badge bg-secondary-50 text-secondary-600 px-12 py-6 rounded-pill">
                        {{ detalle.cantidad }}
                      </span>
                    </td>
                    <td class="px-16 py-12 text-end">
                      <span class="text-heading fw-medium">S/ {{ formatPrice(detalle.precio_unitario) }}</span>
                    </td>
                    <td class="px-16 py-12 text-end">
                      <span class="text-heading fw-semibold">S/ {{ formatPrice(detalle.subtotal_linea) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Resumen totales -->
            <div class="row justify-content-end">
              <div class="col-md-4">
                <div class="bg-gray-50 rounded-8 p-16">
                  <div class="d-flex justify-content-between align-items-center mb-8">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="text-heading fw-medium">S/ {{ formatPrice(pedidoSeleccionado.subtotal) }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-8">
                    <span class="text-gray-600">IGV (18%):</span>
                    <span class="text-heading fw-medium">S/ {{ formatPrice(pedidoSeleccionado.igv) }}</span>
                  </div>
                  <div *ngIf="pedidoSeleccionado.descuento_total > 0" class="d-flex justify-content-between align-items-center mb-8">
                    <span class="text-success-600">Descuento:</span>
                    <span class="text-success-600 fw-medium">-S/ {{ formatPrice(pedidoSeleccionado.descuento_total) }}</span>
                  </div>
                  <hr class="border-gray-300 my-12">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-heading fw-bold">Total:</span>
                    <span class="text-heading fw-bold text-xl">S/ {{ formatPrice(pedidoSeleccionado.total) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top border-gray-200">
            <button type="button" class="btn bg-gray-100 text-gray-600 px-16 py-8 rounded-8" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button type="button" class="btn bg-main-600 text-white px-16 py-8 rounded-8" (click)="editarPedido(pedidoSeleccionado)">
              <i class="ph ph-pencil me-8"></i>
              Cambiar Estado
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
    
    .dropdown-toggle::after {
      display: none;
    }
    
    .badge.dropdown-toggle {
      cursor: pointer;
      border: 1px solid transparent;
    }
    
    .badge.dropdown-toggle:hover {
      opacity: 0.8;
    }
  `]
})
export class PedidosListComponent implements OnInit {
  pedidos: Pedido[] = [];
  estados: EstadoPedido[] = [];
  isLoading = true;
  filtrosForm: FormGroup;
  paginacion: any = null;
  pedidoSeleccionado: Pedido | null = null;
  estadisticas: any = {
    pendientes: 0,
    preparacion: 0,
    enviados: 0,
    entregados: 0
  };

  constructor(
    private pedidosService: PedidosService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      estado_pedido_id: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.cargarEstados();
    this.cargarPedidos();
    this.cargarEstadisticas();
  }

  cargarEstados(): void {
    this.pedidosService.obtenerEstados().subscribe({
      next: (estados) => {
        this.estados = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
      }
    });
  }

  cargarPedidos(page: number = 1): void {
    this.isLoading = true;
    const filtros = {
      ...this.filtrosForm.value,
      page
    };

    this.pedidosService.obtenerPedidos(filtros).subscribe({
      next: (response) => {
        this.pedidos = response.data || response;
        this.paginacion = response.meta || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.isLoading = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.pedidosService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarPedidos(1);
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.paginacion.last_page) {
      this.cargarPedidos(page);
    }
  }

  getPaginas(): number[] {
    if (!this.paginacion) return [];
    
    const current = this.paginacion.current_page;
    const last = this.paginacion.last_page;
    const pages: number[] = [];
    
    for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
      pages.push(i);
    }
    
    return pages;
  }

  verDetalle(pedido: Pedido): void {
    this.pedidosService.obtenerPedido(pedido.id).subscribe({
      next: (pedidoDetallado) => {
        this.pedidoSeleccionado = pedidoDetallado;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('modalDetallePedido'));
        modal.show();
      },
      error: (error) => {
        console.error('Error al cargar detalle del pedido:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el detalle del pedido',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  editarPedido(pedido: Pedido): void {
    // Implementar modal para cambiar estado
    console.log('Editar pedido:', pedido);
  }

  cambiarEstado(pedido: Pedido, nuevoEstadoId: number): void {
    if (pedido.estado_pedido_id === nuevoEstadoId) {
      return; // No cambiar si es el mismo estado
    }

    const estado = this.estados.find(e => e.id === nuevoEstadoId);
    
    Swal.fire({
      title: '¿Cambiar estado del pedido?',
      html: `Se cambiará el estado del pedido <strong>${pedido.codigo_pedido}</strong> a <strong>${estado?.nombre}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidosService.actualizarEstado(pedido.id, nuevoEstadoId).subscribe({
          next: (response) => {
            // Actualizar el pedido en la lista
            const index = this.pedidos.findIndex(p => p.id === pedido.id);
            if (index >= 0) {
              this.pedidos[index].estado_pedido_id = nuevoEstadoId;
              this.pedidos[index].estadoPedido = { id: nuevoEstadoId, nombre: estado?.nombre || '' };
            }

            Swal.fire({
              title: '¡Estado actualizado!',
              text: `El pedido ahora está en estado: ${estado?.nombre}`,
              icon: 'success',
              confirmButtonColor: '#198754',
              timer: 2000,
              showConfirmButton: false
            });

            // Recargar estadísticas
            this.cargarEstadisticas();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el estado del pedido',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
            console.error('Error al actualizar estado:', error);
          }
        });
      }
    });
  }

  getClienteNombre(pedido: Pedido): string {
    if (pedido.userCliente) {
      return `${pedido.userCliente.nombres} ${pedido.userCliente.apellidos}`;
    }
    if (pedido.cliente) {
      return pedido.cliente.razon_social || pedido.cliente.nombre_comercial;
    }
    return 'Cliente no especificado';
  }

  getClienteDocumento(pedido: Pedido): string {
    if (pedido.userCliente) {
      return pedido.userCliente.numero_documento;
    }
    if (pedido.cliente) {
      return pedido.cliente.numero_documento;
    }
    return 'Sin documento';
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-gray-100 text-gray-600';
    
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-warning-100 text-warning-700';
      case 'confirmado':
        return 'bg-info-100 text-info-700';
      case 'en preparación':
      case 'preparando':
        return 'bg-primary-100 text-primary-700';
      case 'enviado':
      case 'en camino':
        return 'bg-secondary-100 text-secondary-700';
      case 'entregado':
        return 'bg-success-100 text-success-700';
      case 'cancelado':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  }
}