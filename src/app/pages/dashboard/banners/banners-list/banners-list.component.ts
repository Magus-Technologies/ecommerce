// src/app/pages/dashboard/banners/banners-list/banners-list.component.ts


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannersService, Banner } from '../../../../services/banner.service';
import { BannerModalComponent } from '../../../../component/banner-modal/banner-modal.component';

@Component({
  selector: 'app-banners-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BannerModalComponent],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8"> Banners</h4>
          <p class="text-gray-500 mb-0">Administra los banners del sitio web</p>
        </div>
        <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearBanner">
          <i class="ph ph-plus me-8"></i>
          Nuevo Banner
        </button>
      </div>

      <!-- Tabla de banners -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando banners...</p>
          </div>

          <!-- Tabla -->
          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Imagen</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Título</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Subtítulo</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Precio</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Orden</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let banner of banners" class="border-bottom border-gray-100">
                  <!-- Imagen -->
                  <td class="px-24 py-16">
                    <div class="w-80 h-48 bg-gray-100 rounded-8 flex-center overflow-hidden">
                      <img *ngIf="banner.imagen_url" 
                           [src]="banner.imagen_url" 
                           [alt]="banner.titulo"
                           class="w-100 h-100 object-fit-cover">
                      <i *ngIf="!banner.imagen_url" class="ph ph-image text-gray-400 text-xl"></i>
                    </div>
                  </td>

                  <!-- Título -->
                  <td class="px-24 py-16">
                    <h6 class="text-heading fw-semibold mb-4">{{ banner.titulo }}</h6>
                    <span class="text-gray-500 text-sm">{{ banner.texto_boton }}</span>
                  </td>

                  <!-- Subtítulo -->
                  <td class="px-24 py-16">
                    <p class="text-gray-600 mb-0" [title]="banner.subtitulo">
                      {{ banner.subtitulo ? (banner.subtitulo.length > 40 ? banner.subtitulo.substring(0, 40) + '...' : banner.subtitulo) : 'Sin subtítulo' }}
                    </p>
                  </td>

                  <!-- Precio -->
                  <td class="px-24 py-16">
                    <span class="text-success-600 fw-semibold" *ngIf="banner.precio_desde">
                      S/ {{ banner.precio_desde }}
                    </span>
                    <span class="text-gray-400" *ngIf="!banner.precio_desde">-</span>
                  </td>

                  <!-- Orden -->
                  <td class="px-24 py-16">
                    <span class="badge bg-main-50 text-main-600 px-12 py-6 rounded-pill fw-medium">
                      {{ banner.orden }}
                    </span>
                  </td>

                  <!-- Estado -->
                  <td class="px-24 py-16">
                    <span class="badge px-12 py-6 rounded-pill fw-medium"
                          [class]="banner.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                      {{ banner.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td class="px-24 py-16 text-center">
                    <div class="d-flex justify-content-center gap-8">
                      <!-- Toggle Estado -->
                      <button class="btn w-32 h-32 rounded-6 flex-center transition-2"
                              [class]="banner.activo ? 'bg-warning-50 hover-bg-warning-100 text-warning-600' : 'bg-success-50 hover-bg-success-100 text-success-600'"
                              [title]="banner.activo ? 'Desactivar' : 'Activar'"
                              (click)="toggleEstado(banner)">
                        <i class="ph text-sm" 
                           [class]="banner.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                      </button>

                      <!-- Editar -->
                      <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Editar"
                              (click)="editarBanner(banner)">
                        <i class="ph ph-pencil text-sm"></i>
                      </button>

                      <!-- Eliminar -->
                      <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Eliminar"
                              (click)="eliminarBanner(banner.id)">
                        <i class="ph ph-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty state -->
            <div *ngIf="banners.length === 0" class="text-center py-40">
              <i class="ph ph-image text-gray-300 text-6xl mb-16"></i>
              <h6 class="text-heading fw-semibold mb-8">No hay banners</h6>
              <p class="text-gray-500 mb-16">Aún no has creado ningún banner</p>
              <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                      data-bs-toggle="modal" 
                      data-bs-target="#modalCrearBanner">
                <i class="ph ph-plus me-8"></i>
                Crear primer banner
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar banner -->
      <app-banner-modal 
        [banner]="bannerSeleccionado"
        (bannerGuardado)="onBannerGuardado()"
        (modalCerrado)="onModalCerrado()">
      </app-banner-modal>
    </div>
  `,
  styles: [`
    .table td {
      vertical-align: middle;
    }
  `]
})
export class BannersListComponent implements OnInit {
  
  banners: Banner[] = [];
  isLoading = true;
  bannerSeleccionado: Banner | null = null;

  constructor(private bannersService: BannersService) {}

  ngOnInit(): void {
    this.cargarBanners();
  }

  cargarBanners(): void {
    this.isLoading = true;
    this.bannersService.obtenerBanners().subscribe({
      next: (banners) => {
        this.banners = banners.sort((a, b) => a.orden - b.orden);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar banners:', error);
        this.isLoading = false;
      }
    });
  }

  editarBanner(banner: Banner): void {
    this.bannerSeleccionado = banner;
    const modal = document.getElementById('modalCrearBanner');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarBanner(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      this.bannersService.eliminarBanner(id).subscribe({
        next: () => {
          this.cargarBanners();
        },
        error: (error) => {
          console.error('Error al eliminar banner:', error);
        }
      });
    }
  }

  toggleEstado(banner: Banner): void {
    this.bannersService.actualizarBanner(banner.id, { 
      activo: !banner.activo 
    }).subscribe({
      next: () => {
        this.cargarBanners();
      },
      error: (error) => {
        console.error('Error al actualizar banner:', error);
      }
    });
  }

  onBannerGuardado(): void {
    this.cargarBanners();
    this.bannerSeleccionado = null;
  }

  onModalCerrado(): void {
    this.bannerSeleccionado = null;
  }
}