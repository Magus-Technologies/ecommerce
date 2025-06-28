// src\app\pages\dashboard\almacen\marcas\marcas-list.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AlmacenService, MarcaProducto } from "../../../../services/almacen.service"
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import { PermissionsService } from '../../../../services/permissions.service';
import { MarcaModalComponent } from "./marca-modal.component"
import Swal from "sweetalert2"

@Component({
  selector: "app-marcas-list",
  standalone: true,
  imports: [CommonModule, RouterModule, MarcaModalComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Marcas</h5>
        <p class="text-gray-500 mb-0">Administra las marcas de productos</p>
      </div>
      <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              *ngIf="permissionsService.canCreateMarcas()"
              data-bs-toggle="modal" 
              data-bs-target="#modalCrearMarca">
        <i class="ph ph-plus me-8"></i>
        Nueva Marca
      </button>
    </div>

    <!-- Tabla de marcas -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando marcas...</p>
        </div>

        <!-- Tabla -->
        <div *ngIf="!isLoading" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Imagen</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Nombre</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Descripción</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Fecha Creación</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let marca of marcas" class="border-bottom border-gray-100">
                <!-- Imagen -->
                <td class="px-24 py-16">
                  <div class="w-48 h-48 bg-gray-100 rounded-8 flex-center overflow-hidden position-relative">
                    <img *ngIf="marca.imagen_url" 
                         [src]="marca.imagen_url" 
                         [alt]="marca.nombre"
                         class="w-100 h-100 object-fit-cover"
                         (error)="onImageError($event)">
                    <i *ngIf="!marca.imagen_url" 
                       class="ph ph-tag text-gray-400 text-xl"></i>
                  </div>
                </td>

                <!-- Nombre -->
                <td class="px-24 py-16">
                  <h6 class="text-heading fw-semibold mb-4">{{ marca.nombre }}</h6>
                </td>

                <!-- Descripción -->
                <td class="px-24 py-16">
                  <p class="text-gray-600 mb-0" 
                     [title]="marca.descripcion">
                    {{ marca.descripcion ? (marca.descripcion.length > 50 ? marca.descripcion.substring(0, 50) + '...' : marca.descripcion) : 'Sin descripción' }}
                  </p>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [class]="marca.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                    {{ marca.activo ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>

                <!-- Fecha -->
                <td class="px-24 py-16">
                  <span class="text-gray-500 text-sm">
                    {{ marca.created_at | date:'dd/MM/yyyy' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Toggle Estado -->
                    <button class="btn w-32 h-32 rounded-6 flex-center transition-2"
                            [class]="marca.activo ? 'bg-warning-50 hover-bg-warning-100 text-warning-600' : 'bg-success-50 hover-bg-success-100 text-success-600'"
                            *ngIf="permissionsService.canEditMarcas()"
                            [title]="marca.activo ? 'Desactivar' : 'Activar'"
                            (click)="toggleEstado(marca)">
                      <i class="ph text-sm" 
                         [class]="marca.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                    </button>

                    <!-- Editar -->
                    <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                            *ngIf="permissionsService.canEditMarcas()"
                            title="Editar"
                            (click)="editarMarca(marca)">
                      <i class="ph ph-pencil text-sm"></i>
                    </button>

                    <!-- Eliminar -->
                    <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                            *ngIf="permissionsService.canDeleteMarcas()"
                            title="Eliminar"
                            (click)="eliminarMarca(marca)">
                      <i class="ph ph-trash text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="marcas.length === 0" class="text-center py-40">
            <i class="ph ph-tag text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay marcas</h6>
            <p class="text-gray-500 mb-16">Aún no has creado ninguna marca</p>
            <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    *ngIf="permissionsService.canCreateMarcas()"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearMarca">
              <i class="ph ph-plus me-8"></i>
              Crear primera marca
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar marca -->
    <app-marca-modal 
      [marca]="marcaSeleccionada"
      (marcaGuardada)="onMarcaGuardada()"
      (modalCerrado)="onModalCerrado()">
    </app-marca-modal>
  `,
  styles: [
    `
    .upload-area {
      transition: all 0.3s ease;
    }
    .upload-area:hover {
      border-color: var(--bs-main-600) !important;
    }
    .image-error {
      display: none !important;
    }
  `,
  ],
})
export class MarcasListComponent implements OnInit {
  marcas: MarcaProducto[] = []
  isLoading = true
  marcaSeleccionada: MarcaProducto | null = null

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas()
    
    // Suscribirse a cambios de sección
    this.seccionFilterService.seccionSeleccionada$.subscribe(seccionId => {
      this.cargarMarcas();
    });
  }

  // Busca este método y reemplázalo:
  cargarMarcas(): void {
    this.isLoading = true
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
    
    // ← MODIFICAR ESTA LÍNEA
    console.log('Cargando marcas con sección:', seccionId);
    
    this.almacenService.obtenerMarcas(seccionId || undefined).subscribe({
      next: (marcas) => {
        this.marcas = marcas
        this.isLoading = false
        // ← AGREGAR ESTA LÍNEA
        console.log('Marcas cargadas:', marcas.length);
      },
      error: (error) => {
        console.error("Error al cargar marcas:", error)
        this.isLoading = false
      },
    })
  }

  editarMarca(marca: MarcaProducto): void {
    this.marcaSeleccionada = marca
    const modal = document.getElementById("modalCrearMarca")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  eliminarMarca(marca: MarcaProducto): void {
    Swal.fire({
      title: "¿Eliminar marca?",
      html: `Estás a punto de eliminar la marca <strong>"${marca.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-12",
        confirmButton: "rounded-8",
        cancelButton: "rounded-8",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.almacenService.eliminarMarca(marca.id).subscribe({
          next: () => {
            Swal.fire({
              title: "¡Eliminada!",
              text: "La marca ha sido eliminada exitosamente.",
              icon: "success",
              confirmButtonColor: "#198754",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            this.cargarMarcas()
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la marca. Inténtalo de nuevo.",
              icon: "error",
              confirmButtonColor: "#dc3545",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            console.error("Error al eliminar marca:", error)
          },
        })
      }
    })
  }

  toggleEstado(marca: MarcaProducto): void {
    this.almacenService
      .toggleEstadoMarca(marca.id, !marca.activo)
      .subscribe({
        next: () => {
          this.cargarMarcas()
        },
        error: (error) => {
          console.error("Error al actualizar estado de la marca:", error)
        },
      })
  }

  // Busca este método y reemplázalo:
  onMarcaGuardada(): void {
    this.cargarMarcas()
    this.marcaSeleccionada = null
    
    // ← AGREGAR ESTAS LÍNEAS
    // Actualizar totales en el componente padre
    const almacenComponent = document.querySelector('app-almacen') as any
    if (almacenComponent && almacenComponent.onDatosActualizados) {
      almacenComponent.onDatosActualizados()
    }
  }

  onModalCerrado(): void {
    this.marcaSeleccionada = null
  }

  onImageError(event: any): void {
    console.error("Error al cargar imagen:", event)

    event.target.style.display = "none"
    event.target.classList.add("image-error")

    const container = event.target.closest(".w-48.h-48")
    if (container) {
      let placeholder = container.querySelector(".ph-tag")
      if (!placeholder) {
        placeholder = document.createElement("i")
        placeholder.className = "ph ph-tag text-gray-400 text-xl"
        container.appendChild(placeholder)
      }
      placeholder.style.display = "block"
    }
  }
}