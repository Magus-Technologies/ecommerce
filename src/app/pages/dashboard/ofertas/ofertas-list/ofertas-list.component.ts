// src/app/pages/dashboard/ofertas/ofertas-list/ofertas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfertasAdminService, OfertaAdmin } from '../../../../services/ofertas-admin.service';
import { OfertaModalComponent } from '../oferta-modal/oferta-modal.component';
import { ProductosOfertaComponent } from '../productos-oferta/productos-oferta.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ofertas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, OfertaModalComponent, ProductosOfertaComponent],
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
        <!-- Tabla de ofertas -->
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-0">
            
            <!-- Loading state -->
            <div *ngIf="isLoading" class="text-center py-40">
              <div class="spinner-border text-main-600" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-gray-500 mt-12 mb-0">Cargando ofertas...</p>
            </div>

            <!-- Tabla -->
            <div *ngIf="!isLoading" class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Oferta</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Descuento</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Fechas</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Productos</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Configuración</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                    <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let oferta of ofertas" class="border-bottom border-gray-100">
                    <!-- Oferta -->
                    <td class="px-24 py-16">
                      <div class="d-flex align-items-center gap-12">
                        <div class="w-48 h-48 bg-gray-100 rounded-8 flex-center overflow-hidden">
                          <img *ngIf="oferta.imagen_url" 
                               [src]="oferta.imagen_url" 
                               [alt]="oferta.titulo"
                               class="w-100 h-100 object-fit-cover">
                          <i *ngIf="!oferta.imagen_url" class="ph ph-tag text-gray-400 text-xl"></i>
                        </div>
                        <div>
                          <h6 class="text-heading fw-semibold mb-4">{{ oferta.titulo }}</h6>
                          <p class="text-gray-500 text-sm mb-0">{{ oferta.subtitulo || 'Sin subtítulo' }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Descuento -->
                    <td class="px-24 py-16">
                      <div class="text-center">
                        <span class="badge bg-success-50 text-success-600 px-12 py-6 rounded-pill fw-semibold">
                          {{ oferta.tipo_descuento === 'porcentaje' ? oferta.valor_descuento + '%' : 'S/ ' + oferta.valor_descuento }}
                        </span>
                        <div class="text-xs text-gray-500 mt-4">
                          {{ oferta.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Cantidad fija' }}
                        </div>
                      </div>
                    </td>

                    <!-- Fechas -->
                    <td class="px-24 py-16">
                      <div class="text-sm">
                        <div class="text-gray-600">
                          <strong>Inicio:</strong> {{ formatDate(oferta.fecha_inicio) }}
                        </div>
                        <div class="text-gray-600 mt-4">
                          <strong>Fin:</strong> {{ formatDate(oferta.fecha_fin) }}
                        </div>
                        <div class="mt-4">
                          <span class="badge px-8 py-4 rounded-pill text-xs"
                                [class]="getEstadoFecha(oferta).class">
                            {{ getEstadoFecha(oferta).texto }}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- Productos -->
                    <td class="px-24 py-16">
                      <div class="text-center">
                        <button class="btn bg-info-50 hover-bg-info-100 text-info-600 px-12 py-6 rounded-pill text-sm fw-medium"
                                (click)="gestionarProductos(oferta)">
                          <i class="ph ph-package me-6"></i>
                          Gestionar
                        </button>
                        <div class="text-xs text-gray-500 mt-4">
                          {{ contarProductos(oferta) }} productos
                        </div>
                      </div>
                    </td>

                    <!-- Configuración -->
                    <td class="px-24 py-16">
                      <div class="d-flex flex-column gap-4">
                        <span *ngIf="oferta.mostrar_countdown" 
                              class="badge bg-warning-50 text-warning-600 px-8 py-4 rounded-pill text-xs">
                          <i class="ph ph-timer me-4"></i>Countdown
                        </span>
                        <span *ngIf="oferta.mostrar_en_slider" 
                              class="badge bg-info-50 text-info-600 px-8 py-4 rounded-pill text-xs">
                          <i class="ph ph-slides me-4"></i>Slider
                        </span>
                        <span *ngIf="oferta.mostrar_en_banner" 
                              class="badge bg-purple-50 text-purple-600 px-8 py-4 rounded-pill text-xs">
                          <i class="ph ph-image me-4"></i>Banner
                        </span>
                        <div class="text-xs text-gray-500">
                          <strong>Prioridad:</strong> {{ oferta.prioridad }}
                        </div>
                      </div>
                    </td>

                    <!-- Estado -->
                    <td class="px-24 py-16">
                      <span class="badge px-12 py-6 rounded-pill fw-medium"
                            [class]="oferta.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                        {{ oferta.activo ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>

                    <!-- Acciones -->
                    <td class="px-24 py-16 text-center">
                      <div class="d-flex justify-content-center gap-8">
                        <!-- Editar -->
                        <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                                title="Editar"
                                (click)="editarOferta(oferta)">
                          <i class="ph ph-pencil text-sm"></i>
                        </button>

                        <!-- Eliminar -->
                        <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                                title="Eliminar"
                                (click)="eliminarOferta(oferta.id!)">
                          <i class="ph ph-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty state -->
              <div *ngIf="ofertas.length === 0" class="text-center py-40">
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
    .table td {
      vertical-align: middle;
    }
    .vr {
      width: 1px;
      height: 24px;
      background-color: #dee2e6;
    }
  `]
})
export class OfertasListComponent implements OnInit {
  
  ofertas: OfertaAdmin[] = [];
  isLoading = true;
  ofertaParaEditar: OfertaAdmin | null = null;
  
  // ✅ NUEVAS PROPIEDADES PARA GESTIÓN DE PRODUCTOS
  mostrarProductos = false;
  ofertaSeleccionada: OfertaAdmin | null = null;

  constructor(
    private ofertasAdminService: OfertasAdminService
  ) {}

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.isLoading = true;
    this.ofertasAdminService.obtenerOfertas().subscribe({
      next: (ofertas) => {
        // ✅ ORDENAR POR PRIORIDAD DESCENDENTE (mayor prioridad primero)
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

  // ✅ NUEVA FUNCIÓN: Gestionar productos de una oferta
  gestionarProductos(oferta: OfertaAdmin): void {
    this.ofertaSeleccionada = oferta;
    this.mostrarProductos = true;
  }

  // ✅ NUEVA FUNCIÓN: Volver a la vista de ofertas
  volverAOfertas(): void {
    this.mostrarProductos = false;
    this.ofertaSeleccionada = null;
  }

  // ✅ NUEVA FUNCIÓN: Contar productos en una oferta
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
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ofertasAdminService.eliminarOferta(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminada!', 'La oferta ha sido eliminada.', 'success');
            this.cargarOfertas();
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar la oferta.', 'error');
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
}