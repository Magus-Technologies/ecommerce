// src\app\pages\dashboard\almacen\productos\productos-list.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AlmacenService, Producto } from "../../../../services/almacen.service"
import { ProductoModalComponent } from "./producto-modal.component"
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import Swal from "sweetalert2"


@Component({
  selector: "app-productos-list",
  standalone: true,
  imports: [CommonModule, RouterModule, ProductoModalComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Listado de Productos</h5>
        <p class="text-gray-500 mb-0">Administra el inventario de productos</p>
      </div>
      <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              data-bs-toggle="modal" 
              data-bs-target="#modalCrearProducto">
        <i class="ph ph-plus me-8"></i>
        Nuevo Producto
      </button>
    </div>

    <!-- Tabla de productos -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando productos...</p>
        </div>

        <!-- Tabla -->
        <div *ngIf="!isLoading" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Imagen</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Producto</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Categoría</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Marca</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Precios</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Stock</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let producto of productos" class="border-bottom border-gray-100">
                <!-- Imagen -->
                <td class="px-24 py-16">
                  <div class="w-48 h-48 bg-gray-100 rounded-8 flex-center overflow-hidden position-relative">
                    <img *ngIf="producto.imagen_url" 
                         [src]="producto.imagen_url" 
                         [alt]="producto.nombre"
                         class="w-100 h-100 object-fit-cover"
                         (error)="onImageError($event)">
                    <i *ngIf="!producto.imagen_url" 
                       class="ph ph-package text-gray-400 text-xl"></i>
                  </div>
                </td>

                <!-- Producto -->
                <td class="px-24 py-16">
                  <h6 class="text-heading fw-semibold mb-4">{{ producto.nombre }}</h6>
                  <p class="text-gray-500 text-sm mb-0">{{ producto.codigo_producto }}</p>
                </td>

                <!-- Categoría -->
                <td class="px-24 py-16">
                  <span class="badge bg-main-50 text-main-600 px-12 py-6 rounded-pill fw-medium">
                    {{ producto.categoria?.nombre || 'Sin categoría' }}
                  </span>
                </td>

                <!-- Marca -->
                <td class="px-24 py-16">
                  <span *ngIf="producto.marca" class="badge bg-secondary-50 text-secondary-600 px-12 py-6 rounded-pill fw-medium">
                    {{ producto.marca.nombre }}
                  </span>
                  <span *ngIf="!producto.marca" class="text-gray-400 text-sm">Sin marca</span>
                </td>

                <!-- Precios -->
                <td class="px-24 py-16">
                  <div class="text-sm">
                    <div class="text-success-600 fw-semibold">Venta: S/ {{ producto.precio_venta }}</div>
                    <div class="text-gray-500">Compra: S/ {{ producto.precio_compra }}</div>
                  </div>
                </td>

                <!-- Stock -->
                <td class="px-24 py-16">
                  <div class="text-sm">
                    <div class="fw-semibold" 
                         [class]="producto.stock <= producto.stock_minimo ? 'text-danger-600' : 'text-heading'">
                      {{ producto.stock }} unidades
                    </div>
                    <div class="text-gray-500">Mín: {{ producto.stock_minimo }}</div>
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [class]="producto.activo ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'">
                    {{ producto.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Toggle Estado -->
                    <button class="btn w-32 h-32 rounded-6 flex-center transition-2"
                            [class]="producto.activo ? 'bg-warning-50 hover-bg-warning-100 text-warning-600' : 'bg-success-50 hover-bg-success-100 text-success-600'"
                            [title]="producto.activo ? 'Desactivar' : 'Activar'"
                            (click)="toggleEstado(producto)">
                      <i class="ph text-sm" 
                         [class]="producto.activo ? 'ph-eye-slash' : 'ph-eye'"></i>
                    </button>

                    <!-- Editar -->
                    <button class="btn bg-main-50 hover-bg-main-100 text-main-600 w-32 h-32 rounded-6 flex-center transition-2"
                            title="Editar"
                            (click)="editarProducto(producto)">
                      <i class="ph ph-pencil text-sm"></i>
                    </button>

                    <!-- Eliminar -->
                    <button class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                            title="Eliminar"
                            (click)="eliminarProducto(producto)">
                      <i class="ph ph-trash text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="productos.length === 0" class="text-center py-40">
            <i class="ph ph-package text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay productos</h6>
            <p class="text-gray-500 mb-16">Aún no has agregado ningún producto</p>
            <button class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCrearProducto">
              <i class="ph ph-plus me-8"></i>
              Agregar primer producto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar producto -->
    <app-producto-modal 
      [producto]="productoSeleccionado"
      (productoGuardado)="onProductoGuardado()"
      (modalCerrado)="onModalCerrado()">
    </app-producto-modal>
  `,
  styles: [
    `
    .table td {
      vertical-align: middle;
    }
    .image-error {
      display: none !important;
    }
  `,
  ],
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = []
  isLoading = true
  productoSeleccionado: Producto | null = null

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService
  ) {}

  ngOnInit(): void {
    this.cargarProductos()

    this.seccionFilterService.seccionSeleccionada$.subscribe(seccionId => {
      this.cargarProductos();
    });
  }

  cargarProductos(): void {
    this.isLoading = true
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
    
    this.almacenService.obtenerProductos(seccionId || undefined).subscribe({
      next: (productos) => {
        this.productos = productos
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error al cargar productos:", error)
        this.isLoading = false
      },
    })
  }

  editarProducto(producto: Producto): void {
    this.productoSeleccionado = producto
    const modal = document.getElementById("modalCrearProducto")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  eliminarProducto(producto: Producto): void {
    Swal.fire({
        title: "¿Eliminar producto?",
        html: `Estás a punto de eliminar el producto <strong>"${producto.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
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
            this.almacenService.eliminarProducto(producto.id).subscribe({
                next: () => {
                    Swal.fire({
                        title: "¡Eliminado!",
                        text: "El producto ha sido eliminado exitosamente.",
                        icon: "success",
                        confirmButtonColor: "#198754",
                        customClass: {
                            popup: "rounded-12",
                            confirmButton: "rounded-8",
                        },
                    });
                    this.cargarProductos();
                },
                error: (error) => {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el producto. Inténtalo de nuevo.",
                        icon: "error",
                        confirmButtonColor: "#dc3545",
                        customClass: {
                            popup: "rounded-12",
                            confirmButton: "rounded-8",
                        },
                    });
                    console.error("Error al eliminar producto:", error);
                },
            });
        }
    });
  }

  toggleEstado(producto: Producto): void {
    this.almacenService
      .toggleEstadoProducto(producto.id, !producto.activo)
      .subscribe({
        next: () => {
          this.cargarProductos()
        },
        error: (error) => {
          console.error("Error al actualizar estado del producto:", error)
        },
      })
  }

  onProductoGuardado(): void {
    this.cargarProductos()
    this.productoSeleccionado = null
  }

  onModalCerrado(): void {
    this.productoSeleccionado = null
  }

  onImageError(event: any): void {
    console.error("Error al cargar imagen del producto:", event)

    event.target.style.display = "none"
    event.target.classList.add("image-error")

    const container = event.target.closest(".w-48.h-48")
    if (container) {
      let placeholder = container.querySelector(".ph-package")
      if (!placeholder) {
        placeholder = document.createElement("i")
        placeholder.className = "ph ph-package text-gray-400 text-xl"
        container.appendChild(placeholder)
      }
      placeholder.style.display = "block"
    }
  }
}