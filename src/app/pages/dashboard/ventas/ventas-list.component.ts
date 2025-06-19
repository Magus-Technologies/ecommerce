// src/app/pages/dashboard/ventas/ventas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { VentasService, Venta } from '../../../services/ventas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Lista de Ventas</h5>
        <p class="text-gray-500 mb-0">Administra todas las ventas del sistema</p>
      </div>
      <button 
        class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
        routerLink="/dashboard/ventas/nueva">
        <i class="ph ph-plus me-8"></i>
        Nueva Venta
      </button>
    </div>

    <!-- Filtros -->
    <div class="card border-0 shadow-sm rounded-12 mb-24">
      <div class="card-body p-24">
        <form [formGroup]="filtrosForm" (ngSubmit)="aplicarFiltros()">
          <div class="row">
            <div class="col-md-3 mb-16">
              <label class="form-label text-heading fw-medium mb-8">Estado</label>
              <select class="form-select px-16 py-12 border rounded-8" formControlName="estado">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="FACTURADO">Facturado</option>
                <option value="ANULADO">Anulado</option>
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

    <!-- Tabla de ventas -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando ventas...</p>
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
                <th class="px-24 py-16 text-heading fw-semibold border-0">Tipo</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let venta of ventas" class="border-bottom border-gray-100">
                <!-- Código -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">{{ venta.codigo_venta }}</span>
                </td>

                <!-- Cliente -->
                <td class="px-24 py-16">
                  <div>
                    <h6 class="text-heading fw-medium mb-4">
                      {{ getClienteNombre(venta) }}
                    </h6>
                    <p class="text-gray-500 text-sm mb-0">
                      {{ getClienteDocumento(venta) }}
                    </p>
                  </div>
                </td>

                <!-- Fecha -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ formatearFecha(venta.fecha_venta) }}</span>
                </td>

                <!-- Total -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">S/ {{ venta.total }}</span>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [ngClass]="getEstadoClase(venta.estado)">
                    {{ venta.estado }}
                  </span>
                </td>

                <!-- Tipo -->
                <td class="px-24 py-16">
                  <span class="badge bg-info-50 text-info-600 px-12 py-6 rounded-pill fw-medium">
                    {{ getTipoVenta(venta) }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Ver detalle -->
                    <button 
                      class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Ver detalle"
                      (click)="verDetalle(venta)">
                      <i class="ph ph-eye text-sm"></i>
                    </button>

                    <!-- Facturar -->
                    <button 
                      *ngIf="venta.estado === 'PENDIENTE' && !venta.comprobante_id"
                      class="btn bg-success-50 hover-bg-success-100 text-success-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Facturar"
                      (click)="facturarVenta(venta)">
                      <i class="ph ph-receipt text-sm"></i>
                    </button>

                    <!-- Anular -->
                    <button 
                      *ngIf="venta.estado !== 'ANULADO'"
                      class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Anular"
                      (click)="anularVenta(venta)">
                      <i class="ph ph-x text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="ventas.length === 0" class="text-center py-40">
            <i class="ph ph-shopping-cart text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay ventas</h6>
            <p class="text-gray-500 mb-16">No se encontraron ventas con los filtros aplicados</p>
            <button 
              class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              routerLink="/dashboard/ventas/nueva">
              <i class="ph ph-plus me-8"></i>
              Crear primera venta
            </button>
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
  `,
  styles: [
    `
    .table td {
      vertical-align: middle;
    }
  `,
  ],
})
export class VentasListComponent implements OnInit {
  ventas: Venta[] = [];
  isLoading = true;
  filtrosForm: FormGroup;
  paginacion: any = null;

  constructor(
    private ventasService: VentasService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      estado: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(page: number = 1): void {
    this.isLoading = true;
    const filtros = {
      ...this.filtrosForm.value,
      page
    };

    this.ventasService.obtenerVentas(filtros).subscribe({
      next: (response) => {
        this.ventas = response.data || response;
        this.paginacion = response.meta || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.isLoading = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.cargarVentas(1);
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.paginacion.last_page) {
      this.cargarVentas(page);
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

  verDetalle(venta: Venta): void {
    // Implementar modal o navegación a detalle
    console.log('Ver detalle de venta:', venta);
  }

  facturarVenta(venta: Venta): void {
    Swal.fire({
      title: '¿Facturar venta?',
      text: `Se generará el comprobante para la venta ${venta.codigo_venta}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, facturar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ventasService.facturarVenta(venta.id).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Facturado!',
              text: 'La venta ha sido facturada exitosamente.',
              icon: 'success',
              confirmButtonColor: '#198754'
            });
            this.cargarVentas();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo facturar la venta. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
            console.error('Error al facturar venta:', error);
          }
        });
      }
    });
  }

  anularVenta(venta: Venta): void {
    Swal.fire({
      title: '¿Anular venta?',
      html: `Estás a punto de anular la venta <strong>${venta.codigo_venta}</strong>.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ventasService.anularVenta(venta.id).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Anulada!',
              text: 'La venta ha sido anulada exitosamente.',
              icon: 'success',
              confirmButtonColor: '#198754'
            });
            this.cargarVentas();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo anular la venta. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
            console.error('Error al anular venta:', error);
          }
        });
      }
    });
  }

  getClienteNombre(venta: Venta): string {
    if (venta.userCliente) {
      return `${venta.userCliente.nombres} ${venta.userCliente.apellidos}`;
    }
    if (venta.cliente) {
      return venta.cliente.razon_social || venta.cliente.nombre_comercial;
    }
    return 'Cliente no especificado';
  }

  getClienteDocumento(venta: Venta): string {
    if (venta.userCliente) {
      return venta.userCliente.numero_documento;
    }
    if (venta.cliente) {
      return venta.cliente.numero_documento;
    }
    return 'Sin documento';
  }

  getTipoVenta(venta: Venta): string {
    return venta.user_cliente_id ? 'E-commerce' : 'Tradicional';
  }

  getEstadoClase(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-warning-50 text-warning-600';
      case 'FACTURADO':
        return 'bg-success-50 text-success-600';
      case 'ANULADO':
        return 'bg-danger-50 text-danger-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}