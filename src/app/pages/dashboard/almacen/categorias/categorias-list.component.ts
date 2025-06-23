// src\app\pages\dashboard\almacen\categorias\categorias-list.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AlmacenService, Categoria } from "../../../../services/almacen.service"
import { CategoriaModalComponent } from "./categoria-modal.component"
import { MigrarCategoriaModalComponent } from "../migrar-categoria-modal/migrar-categoria-modal.component"
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import Swal from "sweetalert2"

@Component({
  selector: "app-categorias-list",
  standalone: true,
  imports: [CommonModule, RouterModule, CategoriaModalComponent, MigrarCategoriaModalComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Categorías</h5>
        <p class="text-gray-500 mb-0">Administra las categorías de productos</p>
      </div>
      <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              data-bs-toggle="modal" 
              data-bs-target="#modalCrearCategoria">
        <i class="ph ph-plus me-8"></i>
        Nueva Categoría
      </button>
    </div>

    <!-- Tabla de categorías -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando categorías...</p>
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
              <tr *ngFor="let categoria of categorias" class="border-bottom border-gray-100">
                <!-- Imagen -->
                <td class="px-24 py-16">
                  <div class="w-48 h-48 bg-gray-100 rounded-8 flex-center overflow-hidden position-relative">
                    <img *ngIf="categoria.imagen_url" 
                         [src]="categoria.imagen_url" 
                         [alt]="categoria.nombre"
                         class="w-100 h-100 object-fit-cover"
                         (error)="onImageError($event)">
                    <i *ngIf="!categoria.imagen_url" 
                       class="ph ph-image text-gray-400 text-xl"></i>
                  </div>
                </td>

                <!-- Nombre -->
                <td class="px-24 py-16">
                  <h6 class="text-heading fw-semibold mb-4">{{ categoria.nombre }}</h6>
                </td>

                <!-- Descripción -->
                <td class="px-24 py-16">
                  <p class="text-gray-600 mb-0" 
                     [title]="categoria.descripcion">
                    {{ categoria.descripcion ? (categoria.descripcion.length > 50 ? categoria.descripcion.substring(0, 50) + '...' : categoria.descripcion) : 'Sin descripción' }}
                  </p>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [class]="categoria.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                    {{ categoria.activo ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>

                <!-- Fecha -->
                <td class="px-24 py-16">
                  <span class="text-gray-500 text-sm">
                    {{ categoria.created_at | date:'dd/MM/yyyy' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Toggle Estado -->
                    <button class="btn w-32 h-32 rounded-6 flex-center transition-2"
                            [class]="categoria.activo ? 'bg-warning-50 hover-bg-warning-100 text-warning-600' : 'bg-success-50 hover-bg-success-100 text-success-600'"
                            [title]="categoria.activo ? 'Desactivar' : 'Activar'"
                            (click)="toggleEstado(categoria)">
                      <i class="ph text-sm" 
                         [class]="categoria.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                    </button>

                    <!-- Editar -->
                    <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                            title="Editar"
                            (click)="editarCategoria(categoria)">
                      <i class="ph ph-pencil text-sm"></i>
                    </button>

                    <!-- Migrar Sección -->
                    <button class="btn bg-warning-50 hover-bg-warning-100 text-warning-600 w-32 h-32 rounded-6 flex-center transition-2"
                            title="Cambiar de Sección"
                            (click)="migrarCategoria(categoria)">
                      <i class="ph ph-arrows-clockwise text-sm"></i>
                    </button>

                    <!-- Eliminar -->
                    <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                            title="Eliminar"
                            (click)="eliminarCategoria(categoria)">
                      <i class="ph ph-trash text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="categorias.length === 0" class="text-center py-40">
            <i class="ph ph-folder-open text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay categorías</h6>
            <p class="text-gray-500 mb-16">Aún no has creado ninguna categoría</p>
            <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearCategoria">
              <i class="ph ph-plus me-8"></i>
              Crear primera categoría
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar categoría -->
    <app-categoria-modal 
      [categoria]="categoriaSeleccionada"
      (categoriaGuardada)="onCategoriaGuardada()"
      (modalCerrado)="onModalCerrado()">
    </app-categoria-modal>

    <!-- Modal para migrar categoría --> <!-- ← AGREGAR ESTE BLOQUE COMPLETO -->
    <app-migrar-categoria-modal 
      [categoria]="categoriaMigracion"
      (categoriaMigrada)="onCategoriaMigrada()"
      (modalCerrado)="onModalMigracionCerrado()">
    </app-migrar-categoria-modal>
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
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = []
  isLoading = true
  categoriaSeleccionada: Categoria | null = null
  categoriaMigracion: Categoria | null = null

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias()
    // Suscribirse a cambios de sección
    this.seccionFilterService.seccionSeleccionada$.subscribe(seccionId => {
      this.cargarCategorias();
    });
  }

  cargarCategorias(): void {
    this.isLoading = true
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
    
    this.almacenService.obtenerCategorias(seccionId || undefined).subscribe({
      next: (categorias) => {
        this.categorias = categorias
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
        this.isLoading = false
      },
    })
  }

  editarCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria
    const modal = document.getElementById("modalCrearCategoria")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    Swal.fire({
      title: "¿Eliminar categoría?",
      html: `Estás a punto de eliminar la categoría <strong>"${categoria.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
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
        this.almacenService.eliminarCategoria(categoria.id).subscribe({
          next: () => {
            Swal.fire({
              title: "¡Eliminada!",
              text: "La categoría ha sido eliminada exitosamente.",
              icon: "success",
              confirmButtonColor: "#198754",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            this.cargarCategorias()
          },
          error: (error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la categoría. Inténtalo de nuevo.",
              icon: "error",
              confirmButtonColor: "#dc3545",
              customClass: {
                popup: "rounded-12",
                confirmButton: "rounded-8",
              },
            })
            console.error("Error al eliminar categoría:", error)
          },
        })
      }
    })
  }

  toggleEstado(categoria: Categoria): void {
    // USAR EL NUEVO MÉTODO ESPECÍFICO PARA CAMBIAR ESTADO
    this.almacenService
      .toggleEstadoCategoria(categoria.id, !categoria.activo)
      .subscribe({
        next: () => {
          this.cargarCategorias()
        },
        error: (error) => {
          console.error("Error al actualizar estado de la categoría:", error)
        },
      })
  }

  onCategoriaGuardada(): void {
    this.cargarCategorias()
    this.categoriaSeleccionada = null
  }

  onModalCerrado(): void {
    this.categoriaSeleccionada = null
  }

  onImageError(event: any): void {
    console.error("Error al cargar imagen:", event)

    event.target.style.display = "none"
    event.target.classList.add("image-error")

    const container = event.target.closest(".w-48.h-48")
    if (container) {
      let placeholder = container.querySelector(".ph-image")
      if (!placeholder) {
        placeholder = document.createElement("i")
        placeholder.className = "ph ph-image text-gray-400 text-xl"
        container.appendChild(placeholder)
      }
      placeholder.style.display = "block"
    }
  }

  migrarCategoria(categoria: Categoria): void {
    this.categoriaMigracion = categoria
    const modal = document.getElementById("modalMigrarCategoria")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  onCategoriaMigrada(): void {
    this.cargarCategorias()
    this.categoriaMigracion = null
  }

  onModalMigracionCerrado(): void {
    this.categoriaMigracion = null
  }
}