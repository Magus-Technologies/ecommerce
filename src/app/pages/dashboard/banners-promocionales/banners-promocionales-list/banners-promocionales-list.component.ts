// src\app\pages\dashboard\banners-promocionales\banners-promocionales-list\banners-promocionales-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannersService, BannerPromocional } from '../../../../services/banner.service';
import { BannerPromocionalModalComponent } from '../../../../component/banner-promocional-modal/banner-promocional-modal.component';
import { PermissionsService } from '../../../../services/permissions.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-banners-promocionales-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BannerPromocionalModalComponent],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Banners Promocionales</h4>
          <p class="text-gray-500 mb-0">Administra los banners promocionales de la sección principal</p>
        </div>
        <button *ngIf="canCreateBanner_promocionales" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                data-bs-toggle="modal" 
                data-bs-target="#modalCrearBannerPromocional">
          <i class="ph ph-plus me-8"></i>
          Nuevo Banner Promocional
        </button>
      </div>

      <!-- Información adicional -->
      <div class="alert alert-info border-0 bg-info-50 text-info-600 mb-24">
        <div class="d-flex align-items-start gap-12">
          <i class="ph ph-info text-xl"></i>
          <div>
            <h6 class="mb-8">Información importante</h6>
            <p class="mb-0 text-sm">
              Los banners promocionales aparecen en la página principal después del carousel principal. 
              Se muestran máximo 4 banners activos ordenados por el campo "Orden".
            </p>
          </div>
        </div>
      </div>

      <!-- Tabla de banners promocionales -->
      <div class="card border-0 shadow-sm rounded-12">
        <div class="card-body p-0">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="text-center py-40">
            <div class="spinner-border text-main-600" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-gray-500 mt-12 mb-0">Cargando banners promocionales...</p>
          </div>

          <!-- Tabla -->
          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Imagen</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Título</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Precio</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Texto Botón</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Enlace</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Orden</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Animación</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                  <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let banner of bannersPromocionales" class="border-bottom border-gray-100">
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
                    <h6 class="text-heading fw-semibold mb-0">{{ banner.titulo }}</h6>
                  </td>

                  <!-- Precio -->
                  <td class="px-24 py-16">
                    <span class="text-success-600 fw-semibold" *ngIf="banner.precio">
                      S/ {{ banner.precio | number:'1.2-2' }}
                    </span>
                    <span class="text-gray-400" *ngIf="!banner.precio">Sin precio</span>
                  </td>

                  <!-- Texto Botón -->
                  <td class="px-24 py-16">
                    <span class="badge bg-info-50 text-info-600 px-8 py-4 rounded-6 text-sm">
                      {{ banner.texto_boton }}
                    </span>
                  </td>

                  <!-- Enlace -->
                  <td class="px-24 py-16">
                    <code class="bg-gray-100 px-8 py-4 rounded-4 text-sm">{{ banner.enlace_url }}</code>
                  </td>

                  <!-- Orden -->
                  <td class="px-24 py-16">
                    <span class="badge bg-main-50 text-main-600 px-12 py-6 rounded-pill fw-medium">
                      {{ banner.orden }}
                    </span>
                  </td>

                  <!-- Animación -->
                  <td class="px-24 py-16">
                    <span class="text-gray-600 text-sm">{{ banner.animacion_delay }}ms</span>
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
                      <button *ngIf="canEdit" class="btn w-32 h-32 rounded-6 flex-center transition-2"
                              [class]="banner.activo ? 'bg-warning-50 hover-bg-warning-100 text-warning-600' : 'bg-success-50 hover-bg-success-100 text-success-600'"
                              [title]="banner.activo ? 'Desactivar' : 'Activar'"
                              (click)="toggleEstado(banner)">
                        <i class="ph text-sm" 
                           [class]="banner.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                      </button>

                      <!-- Editar -->
                      <button *ngIf="canEdit" class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                              title="Editar"
                              (click)="editarBanner(banner)">
                        <i class="ph ph-pencil text-sm"></i>
                      </button>

                      <!-- Eliminar -->
                      <button *ngIf="canDelete" class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
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
            <div *ngIf="bannersPromocionales.length === 0" class="text-center py-40">
              <i class="ph ph-image text-gray-300 text-6xl mb-16"></i>
              <h6 class="text-heading fw-semibold mb-8">No hay banners promocionales</h6>
              <p class="text-gray-500 mb-16">Aún no has creado ningún banner promocional</p>
              <button *ngIf="canCreateBanner_promocionales" class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                      data-bs-toggle="modal" 
                      data-bs-target="#modalCrearBannerPromocional">
                <i class="ph ph-plus me-8"></i>
                Crear primer banner promocional
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar banner promocional -->
      <app-banner-promocional-modal 
        [banner]="bannerSeleccionado"
        (bannerGuardado)="onBannerGuardado()"
        (modalCerrado)="onModalCerrado()">
      </app-banner-promocional-modal>
    </div>
  `,
  styles: [`
    .table td {
      vertical-align: middle;
    }
    
    code {
      font-size: 0.75rem;
    }
  `]
})
export class BannersPromocionalesListComponent implements OnInit {
  
  bannersPromocionales: BannerPromocional[] = [];
  isLoading = true;
  bannerSeleccionado: BannerPromocional | null = null;

  canCreateBanner_promocionales!: boolean;
  canEdit!: boolean;
  canDelete!: boolean;

    constructor(private bannersService: BannersService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.cargarBannersPromocionales(); 
    this.checkPermissions();
  }

  private checkPermissions(): void {
    this.canCreateBanner_promocionales = this.permissionsService.hasPermission('banners_promocionales.create');
    this.canEdit = this.permissionsService.hasPermission('banners_promocionales.edit');
    this.canDelete = this.permissionsService.hasPermission('banners_promocionales.delete');
  }

  // Método para recargar permisos (si cambian en tiempo real)
  refreshPermissions(): void {
    this.checkPermissions();
  }

  cargarBannersPromocionales(): void {
    this.isLoading = true;
    this.bannersService.obtenerBannersPromocionales().subscribe({
      next: (banners) => {
        this.bannersPromocionales = banners.sort((a, b) => a.orden - b.orden);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar banners promocionales:', error);
        this.isLoading = false;
      }
    });
  }

  editarBanner(banner: BannerPromocional): void {
    this.bannerSeleccionado = banner;
    const modal = document.getElementById('modalCrearBannerPromocional');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  eliminarBanner(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este banner promocional?')) {
      this.bannersService.eliminarBannerPromocional(id).subscribe({
        next: () => {
          this.cargarBannersPromocionales();
        },
        error: (error) => {
          console.error('Error al eliminar banner promocional:', error);
        }
      });
    }
  }

  toggleEstado(banner: BannerPromocional): void {
    this.bannersService.actualizarBannerPromocional(banner.id, { 
      activo: !banner.activo 
    }).subscribe({
      next: () => {
        this.cargarBannersPromocionales();
      },
      error: (error) => {
        console.error('Error al actualizar banner promocional:', error);
      }
    });
  }

  onBannerGuardado(): void {
    this.cargarBannersPromocionales();
    this.bannerSeleccionado = null;
  }

  onModalCerrado(): void {
    this.bannerSeleccionado = null;
  }
}