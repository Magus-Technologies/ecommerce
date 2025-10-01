// src/app/pages/shop/shop.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, ActivatedRoute, Router } from "@angular/router"
import { BreadcrumbComponent } from "../../component/breadcrumb/breadcrumb.component"
import { ShippingComponent } from "../../component/shipping/shipping.component"
import { ProductosService, ProductoPublico, type CategoriaParaSidebar } from "../../services/productos.service"
import { CartService } from "../../services/cart.service"
import { CartNotificationService } from '../../services/cart-notification.service';
import { SlugHelper } from '../../helpers/slug.helper'; // ✅ NUEVO
import Swal from 'sweetalert2'

@Component({
  selector: "app-shop",
  imports: [CommonModule, RouterLink, BreadcrumbComponent, ShippingComponent],
  templateUrl: "./shop.component.html",
  styleUrl: "./shop.component.scss",
})
export class ShopComponent implements OnInit {
  listview: "list" | "grid" = "grid"

  productos: ProductoPublico[] = []
  categorias: CategoriaParaSidebar[] = []
  isLoading = false
  categoriaSeleccionada?: number
  searchTerm: string = ''; 

  // pagination
  currentPage = 1
  totalPages = 1
  totalProductos = 0

  // rating
  ratings = [
    { rating: 5, progress: 70, total: 124 },
    { rating: 4, progress: 50, total: 52 },
    { rating: 3, progress: 35, total: 12 },
    { rating: 2, progress: 20, total: 5 },
    { rating: 1, progress: 5, total: 2 },
  ]

  // color
  colors = [
    { id: "color1", name: "Black", count: 12, class: "checked-black" },
    { id: "color2", name: "Blue", count: 12, class: "checked-primary" },
    { id: "color3", name: "Gray", count: 12, class: "checked-gray" },
    { id: "color4", name: "Green", count: 12, class: "checked-success" },
    { id: "color5", name: "Red", count: 12, class: "checked-danger" },
    { id: "color6", name: "White", count: 12, class: "checked-white" },
    { id: "color7", name: "Purple", count: 12, class: "checked-purple" },
  ]

  // brands
  brands = [
    { id: "brand1", name: "Apple" },
    { id: "brand2", name: "Samsung" },
    { id: "brand3", name: "Microsoft" },
    { id: "brand4", name: "Apple" },
    { id: "brand5", name: "HP" },
    { id: "DELL", name: "DELL" },
    { id: "Redmi", name: "Redmi" },
  ]

  constructor(
    private productosService: ProductosService,
    private cartService: CartService,
    private cartNotificationService: CartNotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Cargar categorías para el sidebar
    this.cargarCategorias();

    // ✅ NUEVO: Escuchar cambios en los parámetros de ruta (para slug)
    this.route.params.subscribe(async (params) => {
      const slug = params['slug'];

      if (slug) {
        // Si hay slug en la URL, buscar la categoría por slug
        await this.buscarCategoriaPorSlug(slug);
      }

      this.cargarProductos();
    });

    // Escuchar cambios en los query parameters (mantener compatibilidad)
    this.route.queryParams.subscribe((params) => {
      // Si viene categoria por query param (compatibilidad con URLs antiguas)
      if (params['categoria']) {
        this.categoriaSeleccionada = +params['categoria'];
      }

      this.searchTerm = params['search'] || '';
      this.currentPage = 1;

      // Solo recargar si no hay slug en la ruta (evitar doble carga)
      if (!this.route.snapshot.params['slug']) {
        this.cargarProductos();
      }
    });
  }

  // ✅ NUEVO: Buscar categoría por slug
  private buscarCategoriaPorSlug(slug: string): Promise<void> {
    return new Promise((resolve) => {
      // Esperar a que las categorías se carguen
      const checkCategorias = () => {
        if (this.categorias.length > 0) {
          // Buscar la categoría por slug normalizado
          const categoria = this.categorias.find(cat => {
            const catSlug = SlugHelper.getSlugFromCategoria({
              nombre: cat.nombre,
              slug: (cat as any).slug
            });
            return catSlug === SlugHelper.normalizeSlug(slug);
          });

          if (categoria) {
            this.categoriaSeleccionada = categoria.id;
          } else {
            console.warn(`Categoría no encontrada para slug: ${slug}`);
            this.categoriaSeleccionada = undefined;
          }
          resolve();
        } else {
          // Reintentar después de 100ms
          setTimeout(checkCategorias, 100);
        }
      };
      checkCategorias();
    });
  }

  cargarCategorias(): void {
    this.productosService.obtenerCategoriasParaSidebar().subscribe({
      next: (categorias) => {
        this.categorias = categorias
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
      },
    })
  }

  // Modifica el método existente cargarProductos():
  cargarProductos(): void {
    this.isLoading = true;

    const filtros: any = {
      categoria: this.categoriaSeleccionada,
      page: this.currentPage
    };

    // ✅ NUEVO: Agregar término de búsqueda si existe
    if (this.searchTerm) {
      filtros.search = this.searchTerm;
    }

    // ✅ NUEVO: Agregar sección si se especifica en query params
    this.route.queryParams.subscribe(params => {
      if (params['seccion']) {
        filtros.seccion = +params['seccion'];
      }
    });

    this.productosService.obtenerProductosPublicos(filtros).subscribe({
      next: (response) => {
        this.productos = response.productos;
        this.currentPage = response.pagination.current_page;
        this.totalPages = response.pagination.last_page;
        this.totalProductos = response.pagination.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoading = false;
      }
    });
  }

  seleccionarCategoria(categoriaId: number): void {
    // ✅ MEJORADO: Navegar con slug en lugar de query parameter
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    if (categoria) {
      const slug = SlugHelper.getSlugFromCategoria({
        nombre: categoria.nombre,
        slug: (categoria as any).slug
      });
      this.router.navigate(['/shop/categoria', slug]);
    } else {
      // Fallback: usar query parameter si no se encuentra la categoría
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: categoriaId },
        queryParamsHandling: "merge",
      });
    }
  }

  limpiarFiltros(): void {
    // ✅ MEJORADO: Navegar a shop sin parámetros ni slugs
    this.router.navigate(['/shop']);
  }

  togglelistview(): void {
    this.listview = this.listview === "grid" ? "list" : "grid"
  }

  // ✅ MÉTODO MEJORADO PARA AGREGAR AL CARRITO
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

    this.cartService.addToCart(producto, 1).subscribe({
      next: () => {
        // Preparar imagen del producto
        let productImage = producto.imagen_principal || 'assets/images/thumbs/product-default.png';

        // Obtener productos sugeridos (primeros 3 productos diferentes al actual)
        const suggestedProducts = this.productos
          .filter(p => p.id !== producto.id)
          .slice(0, 3);

        // Mostrar notificación llamativa estilo Coolbox
        this.cartNotificationService.showProductAddedNotification(
          producto.nombre,
          Number(producto.precio || 0),
          productImage,
          1,
          suggestedProducts
        );
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo agregar el producto al carrito',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // ✅ MÉTODO PARA MANEJAR ERRORES DE IMAGEN
  onImageError(event: any): void {
    event.target.src = "/placeholder.svg?height=200&width=200&text=Imagen+no+disponible"
  }

  // Method to generate page numbers based on totalPages
  getPages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.cargarProductos()
    }
  }
}