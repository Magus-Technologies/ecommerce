// src\app\pages\dashboard\almacen\productos\productos-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../../../../services/almacen.service';
import { Producto } from '../../../../types/almacen.types';
import { ProductoModalComponent } from './producto-modal.component';
import { ProductoDetallesModalComponent } from './producto-detalles-modal.component';
import { SeccionFilterService } from '../../../../services/seccion-filter.service';
import { PermissionsService } from '../../../../services/permissions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductoModalComponent,
    ProductoDetallesModalComponent
  ],
  templateUrl: "./productos-list.component.html",
  styleUrl: "./productos-list.component.scss"
})
export class ProductosListComponent implements OnInit, OnDestroy {
  // Datos
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  isLoading = true;
  productoSeleccionado: Producto | null = null;

  // Paginación simple
  pageSize = 10;
  currentPage = 1;
  selected: Producto[] = [];

  // Método para acceder a Math.min en el template
  Math = Math;

  constructor(
    private almacenService: AlmacenService,
    private seccionFilterService: SeccionFilterService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();

    // Suscribirse a cambios de sección
    this.seccionFilterService.seccionSeleccionada$.subscribe((seccionId) => {
      this.cargarProductos();
    });
  }

  cargarProductos(): void {
    this.isLoading = true;
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();

    console.log('Cargando productos con sección:', seccionId);

    this.almacenService.obtenerProductos(seccionId || undefined).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = [...this.productos];
        this.isLoading = false;
        console.log('Productos cargados:', productos.length);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoading = false;
      },
    });
  }

  nuevoProducto(): void {
    this.productoSeleccionado = null;
  }

  editarProducto(producto: Producto): void {
    console.log('Editando producto:', producto);
    this.productoSeleccionado = { ...producto }; // Crear copia para evitar problemas de referencia

    // Esperar un tick antes de abrir el modal para asegurar que los datos se carguen
    setTimeout(() => {
      const modal = document.getElementById('modalCrearProducto');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }, 10);
  }

  gestionarDetalles(producto: Producto): void {
    console.log('Gestionando detalles de producto:', producto);
    this.productoSeleccionado = { ...producto }; // Crear copia para evitar problemas de referencia

    // Esperar un tick antes de abrir el modal para asegurar que los datos se carguen
    setTimeout(() => {
      const modal = document.getElementById('modalDetallesProducto');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }, 10);
  }

  eliminarProducto(producto: Producto): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `Estás a punto de eliminar el producto <strong>"${producto.nombre}"</strong>.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-12',
        confirmButton: 'rounded-8',
        cancelButton: 'rounded-8',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.almacenService.eliminarProducto(producto.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El producto ha sido eliminado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#198754',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            this.cargarProductos();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el producto. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonColor: '#dc3545',
              customClass: {
                popup: 'rounded-12',
                confirmButton: 'rounded-8',
              },
            });
            console.error('Error al eliminar producto:', error);
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
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar estado del producto:', error);
        },
      });
  }

  onProductoGuardado(): void {
    this.cargarProductos();
    this.productoSeleccionado = null;
  }

  onDetallesGuardados(): void {
    this.cargarProductos();
    this.productoSeleccionado = null;
  }

  onModalCerrado(): void {
    console.log('Modal cerrado - limpiando producto seleccionado');
    this.productoSeleccionado = null;
  }

  onImageError(event: any): void {
    console.error('Error al cargar imagen del producto:', event);
    event.target.style.display = 'none';
    event.target.classList.add('image-error');

    const container = event.target.closest('.image-container');
    if (container) {
      let placeholder = container.querySelector('.ph-package');
      if (!placeholder) {
        placeholder = document.createElement('i');
        placeholder.className = 'ph ph-package text-gray-400';
        placeholder.style.fontSize = '16px';
        container.appendChild(placeholder);
      }
      placeholder.style.display = 'block';
    }
  }
  toggleDestacado(producto: Producto): void {
    this.almacenService
      .toggleDestacadoProducto(producto.id, !producto.destacado)
      .subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar estado destacado:', error);
        },
      });
  }

  // Métodos de paginación simple
  getPaginatedProductos(): Producto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.productosFiltrados.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.productosFiltrados.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Texto de selección
  get selectionText(): string {
    const total = this.productos.length;
    const selected = this.selected.length;
    if (selected === 0) {
      return `${total} productos en total`;
    }
    return `${selected} seleccionado${selected > 1 ? 's' : ''} de ${total}`;
  }

  // Métodos de estadísticas
  getProductosActivos(): number {
    return this.productos.filter(p => p.activo).length;
  }

  getProductosInactivos(): number {
    return this.productos.filter(p => !p.activo).length;
  }

  getProductosStockBajo(): number {
    return this.productos.filter(p => p.stock <= p.stock_minimo).length;
  }

  // Método para obtener tiempo relativo
  getTimeAgo(fecha: string): string {
    const now = new Date();
    const date = new Date(fecha);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }

  // Método trackBy para optimizar renderizado
  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }
}