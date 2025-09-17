// src\app\pages\index-two\index-two.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CategoriasPublicasService } from '../../services/categorias-publicas.service';
import { MarcaProducto, ProductoPublico } from '../../types/almacen.types';
import { AlmacenService } from '../../services/almacen.service';
import { ProductosService } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';
import { IndexTwoService } from '../../services/index-two.service';
import { ProductFilterComponent } from '../../component/product-filter/product-filter.component'; 
import Swal from 'sweetalert2';

interface CategoriaTemplate {
  id: number;
  name: string;
  nombre: string;
  subcategories: string[];
  marcas: MarcaProducto[]; // ✅ NUEVO: Array de marcas reales
  marcasLoading: boolean; // ✅ NUEVO: Estado de carga de marcas
  badge: string;
  badgeClass: string;
  productos_count?: number;
}

@Component({
  selector: 'app-index-two',
  imports: [CommonModule, SlickCarouselModule, RouterLink, ProductFilterComponent],
  templateUrl: './index-two.component.html',
  styleUrl: './index-two.component.scss',
})
export class IndexTwoComponent implements OnInit {
  // ✅ CAMBIO: Usar la nueva interfaz compatible
  categories: CategoriaTemplate[] = [];
  marcas: MarcaProducto[] = [];

  // ✅ NUEVO: Loading state para mostrar indicador de carga
  categoriesLoading = true;
  // ✅ NUEVO: Propiedades para productos
  productos: ProductoPublico[] = [];
  productosLoading = false;
  categoriaSeleccionada?: number;
  marcaSeleccionada?: number;
  // ✅ NUEVO: Propiedades para paginación
  currentPage = 1;
  totalPages = 1;
  totalProductos = 0;

  // ✅ NUEVO: Propiedad para vista de lista/grid (opcional, si quieres el toggle)
  listview: 'list' | 'grid' = 'grid';

  filters: any = {}; // Para almacenar filtros aplicados

  constructor(
    private categoriasService: CategoriasPublicasService,
    private almacenService: AlmacenService,
    private productosService: ProductosService, // ✅ NUEVO
    private route: ActivatedRoute, // ✅ NUEVO
    private router: Router, // ✅ NUEVO
    private cartService: CartService,
    private indexTwoService: IndexTwoService,
  ) {}

  ngOnInit(): void {
    this.cargarCategoriasSeccion1();

    // ✅ NUEVO: Suscribirse a cambios en los query parameters
    this.route.queryParams.subscribe((params) => {
      // ✅ MODIFICADO: Solo cargar productos si no estamos en modo armado
      this.categoriaSeleccionada = params['categoria']
        ? +params['categoria']
        : undefined;
      this.marcaSeleccionada = params['marca'] ? +params['marca'] : undefined;
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.cargarProductos();
    });
  }

  // ✅ NUEVO MÉTODO: Cargar categorías de la sección 1
  private cargarCategoriasSeccion1() {
    this.categoriesLoading = true;

    this.categoriasService.obtenerCategoriasSeccion1().subscribe({
      next: (categorias) => {
        // ✅ CORREGIDO: Transformar los datos para que coincidan con CategoriaTemplate
        this.categories = categorias.map((categoria) => ({
          id: categoria.id,
          name: categoria.nombre,
          nombre: categoria.nombre,
          subcategories: [], // ✅ CAMBIO: Array vacío inicialmente
          marcas: [], // ✅ NUEVO: Array de marcas vacío inicialmente
          marcasLoading: false, // ✅ NUEVO: Estado de carga inicial
          badge: '',
          badgeClass: '',
          productos_count: categoria.productos_count,
        }));

        this.categoriesLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.categoriesLoading = false;
        this.categories = [];
      },
    });
  }
  cargarMarcasPorCategoria(categoriaId: number): void {
    // Buscar la categoría en el array
    const categoria = this.categories.find((cat) => cat.id === categoriaId);
    if (!categoria) return;

    // Si ya tiene marcas cargadas, no volver a cargar
    if (categoria.marcas.length > 0) return;

    // Activar estado de carga
    categoria.marcasLoading = true;

    this.almacenService.obtenerMarcasPorCategoria(categoriaId).subscribe({
      next: (marcas) => {
        categoria.marcas = marcas;
        categoria.marcasLoading = false;

        // ✅ ACTUALIZADO: Actualizar subcategories para compatibilidad con el template
        categoria.subcategories = marcas.map((marca) => marca.nombre);
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        categoria.marcasLoading = false;

        // ✅ Fallback: marcas por defecto en caso de error
        categoria.subcategories = ['Samsung', 'iPhone', 'Vivo', 'Oppo'];
      },
    });
  }
  // ✅ NUEVO: Método para cargar productos
  cargarProductos(): void {
    this.productosLoading = true;

    const filtros = {
      categoria: this.categoriaSeleccionada,
      seccion: 1,
      ...this.filters,
      marca: this.marcaSeleccionada,
      page: this.currentPage,
    };

    this.productosService.obtenerProductosPublicos(filtros).subscribe({
      next: (response) => {
        this.productos = response.productos;
        this.currentPage = response.pagination.current_page;
        this.totalPages = response.pagination.last_page;
        this.totalProductos = response.pagination.total;
        this.productosLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productosLoading = false;
        this.productos = []; // Vaciar productos en caso de error
      },
    });
  }

  // ✅ NUEVO: Método para seleccionar categoría y actualizar URL
  seleccionarCategoria(categoriaId: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoriaId, marca: null, page: 1 }, // Limpiar marca y resetear página
      queryParamsHandling: 'merge', // Mantener otros parámetros si existen
    });
  }

  // ✅ NUEVO: Método para seleccionar marca y actualizar URL
  seleccionarMarca(categoriaId: number, marcaId: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoriaId, marca: marcaId, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  // ✅ NUEVO: Método para limpiar todos los filtros
  limpiarFiltros(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: null, marca: null, page: null }, // Limpiar todos los filtros
      queryParamsHandling: 'merge',
    });
  }

  // ✅ NUEVO: Método para manejar el cambio de página
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge',
      });
    }
  }

  // ✅ NUEVO: Método para generar números de página
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ✅ NUEVO: Método para manejar errores de imagen (copiado de shop.component.ts)
  onImageError(event: any): void {
    event.target.src =
      '/placeholder.svg?height=200&width=200&text=Imagen+no+disponible';
  }

  // ✅ NUEVO: Método para agregar al carrito (copiado de shop.component.ts, requiere CartService)
  // Si no tienes CartService en este componente, puedes omitir o adaptarlo.
  // Para que funcione, necesitarías importar CartService y añadirlo al constructor.
  // Por simplicidad, lo dejo comentado si no lo tienes configurado aquí.

 // Código antes:
  // addToCart(producto: ProductoPublico): void {
  //   if (producto.stock <= 0) {

  // Reemplazar el método addToCart completo por:
  addToCart(producto: ProductoPublico): void {
    if (producto.stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const success = this.cartService.addToCart(producto, 1);
    
    if (success) {
      Swal.fire({
        title: '¡Producto agregado!',
        text: `${producto.nombre} ha sido agregado a tu carrito`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#f8f9fa',
        color: '#333'
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito. Revisa el stock disponible.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  onFiltersApplied(filters: any) {
    this.filters = filters;
    this.currentPage = 1; // Resetear página al filtrar
    this.cargarProductos();
  }

}
