// src/app/pages/dashboard/cupones/cupones-list/cupones-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfertasAdminService, CuponAdmin } from '../../../../services/ofertas-admin.service';
import { CuponModalComponent } from '../cupon-modal/cupon-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cupones-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CuponModalComponent],
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

      <!-- Tabla de cupones -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando cupones...</p>
          </div>

          <!-- Tabla -->
          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Código</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Descuento</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Fechas</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Uso</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cupon of cupones" class="border-bottom border-gray-100">
                  <!-- Código -->
                  <td class="px-24 py-16">
                    <div>
                      <h6 class="text-heading fw-semibold mb-4">{{ cupon.codigo }}</h6>
                      <p class="text-gray-500 text-sm mb-0">{{ cupon.titulo }}</p>
                      <div *ngIf="cupon.solo_primera_compra" class="mt-4">
                        <span class="badge bg-info-50 text-info-600 px-8 py-4 rounded-pill text-xs">
                          Solo primera compra
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Descuento -->
                  <td class="px-24 py-16">
                    <div class="text-center">
                      <span class="badge bg-success-50 text-success-600 px-12 py-6 rounded-pill fw-semibold">
                        {{ cupon.tipo_descuento === 'porcentaje' ? cupon.valor_descuento + '%' : 'S/ ' + cupon.valor_descuento }}
                      </span>
                      <div class="text-xs text-gray-500 mt-4">
                        {{ cupon.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Cantidad fija' }}
                      </div>
                      <div *ngIf="cupon.compra_minima" class="text-xs text-gray-500 mt-4">
                        Mín: S/ {{ cupon.compra_minima }}
                      </div>
                    </div>
                  </td>

                  <!-- Fechas -->
                  <td class="px-24 py-16">
                    <div class="text-sm">
                      <div class="text-gray-600">
                        <strong>Inicio:</strong> {{ formatDate(cupon.fecha_inicio) }}
                      </div>
                      <div class="text-gray-600 mt-4">
                        <strong>Fin:</strong> {{ formatDate(cupon.fecha_fin) }}
                      </div>
                      <div class="mt-4">
                        <span class="badge px-8 py-4 rounded-pill text-xs"
                              [class]="getEstadoFecha(cupon).class">
                          {{ getEstadoFecha(cupon).texto }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Uso -->
                  <td class="px-24 py-16">
                    <div class="text-center">
                      <div class="text-sm fw-semibold text-heading">
                        {{ cupon.usos_actuales || 0 }}
                        <span *ngIf="cupon.limite_uso">/ {{ cupon.limite_uso }}</span>
                        <span *ngIf="!cupon.limite_uso">/ ∞</span>
                      </div>
                      <div class="text-xs text-gray-500 mt-4">
                        {{ cupon.limite_uso ? 'Limitado' : 'Ilimitado' }}
                      </div>
                      <div *ngIf="cupon.limite_uso" class="mt-8">
                        <div class="progress" style="height: 4px;">
                          <div class="progress-bar bg-main-600" 
                               [style.width.%]="((cupon.usos_actuales || 0) / cupon.limite_uso) * 100">
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Estado -->
                  <td class="px-24 py-16">
                    <span class="badge px-12 py-6 rounded-pill fw-medium"
                          [class]="cupon.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                      {{ cupon.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td class="px-24 py-16 text-center">
                    <div class="d-flex justify-content-center gap-8">
                      <!-- Copiar código -->
                      <button class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Copiar código"
                              (click)="copiarCodigo(cupon.codigo)">
                        <i class="ph ph-copy text-sm"></i>
                      </button>

                      <!-- Editar -->
                      <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Editar"
                              (click)="editarCupon(cupon)">
                        <i class="ph ph-pencil text-sm"></i>
                      </button>

                      <!-- Eliminar -->
                      <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Eliminar"
                              (click)="eliminarCupon(cupon.id!)">
                        <i class="ph ph-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty state -->
            <div *ngIf="cupones.length === 0" class="text-center py-40">
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
    .table td {
      vertical-align: middle;
    }
    .progress {
      background-color: #e9ecef;
    }
  `]
})
export class CuponesListComponent implements OnInit {
  
  cupones: CuponAdmin[] = [];
  isLoading = true;
  cuponSeleccionado: CuponAdmin | null = null;

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