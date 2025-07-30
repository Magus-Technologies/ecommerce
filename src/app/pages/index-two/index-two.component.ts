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
interface ProductoSeleccionado {
  categoria_id: number;
  categoria_nombre: string;
  producto: ProductoPublico;
  cantidad: number;
}

@Component({
  selector: 'app-index-two',
  imports: [CommonModule, SlickCarouselModule, RouterLink],
  templateUrl: './index-two.component.html',
  styleUrl: './index-two.component.scss',
})
export class IndexTwoComponent implements OnInit {
  // ✅ CAMBIO: Usar la nueva interfaz compatible
  categories: CategoriaTemplate[] = [];

  // ✅ NUEVO: Loading state para mostrar indicador de carga
  categoriesLoading = true;
  // ✅ NUEVO: Propiedades para productos
  productos: ProductoPublico[] = [];
  productosLoading = false;
  categoriaSeleccionada?: number;
  marcaSeleccionada?: number;
  // ✅ NUEVAS PROPIEDADES para el modo "Arma tu PC"
  modoArmadoPC = false; // Controla si estamos en modo armado de PC
  categoriaArmadoSeleccionada?: number; // Categoría seleccionada en modo armado
  productosArmado: ProductoPublico[] = []; // Productos para armado de PC
  productosArmadoLoading = false;
  productosSeleccionados: ProductoSeleccionado[] = []; // Productos seleccionados para la cotización
  totalCotizacion = 0; // Total de la cotización
  // ✅ NUEVO: Propiedades para paginación
  currentPage = 1;
  totalPages = 1;
  totalProductos = 0;

  // ✅ NUEVO: Propiedad para vista de lista/grid (opcional, si quieres el toggle)
  listview: 'list' | 'grid' = 'grid';

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
      if (!this.modoArmadoPC) {
        this.categoriaSeleccionada = params['categoria']
          ? +params['categoria']
          : undefined;
        this.marcaSeleccionada = params['marca'] ? +params['marca'] : undefined;
        this.currentPage = params['page'] ? +params['page'] : 1;
        this.cargarProductos();
      }
    });
    // ✅ NUEVO: Suscribirse al evento del header
  this.indexTwoService.activarModoArmado$.subscribe(() => {
    this.activarModoArmadoPC();
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

  addToCart(producto: ProductoPublico): void {
    if (producto.stock <= 0) {
      // Swal.fire (o tu sistema de notificaciones)
      console.warn('Este producto no tiene stock disponible');
      return;
    }

    const success = this.cartService.addToCart(producto, 1); // Asumiendo que CartService está inyectado

    if (success) {
      console.log(`${producto.nombre} ha sido agregado a tu carrito`);
      // Notificación de éxito
    } else {
      console.error(
        'No se pudo agregar el producto al carrito. Revisa el stock disponible.'
      );
      // Notificación de error
    }
  }
  // ✅ NUEVO MÉTODO: Activar modo armado de PC
activarModoArmadoPC(): void {
  this.modoArmadoPC = true;
  this.productosSeleccionados = [];
  this.totalCotizacion = 0;
  this.categoriaArmadoSeleccionada = undefined;
  this.productosArmado = [];
}

// ✅ NUEVO MÉTODO: Desactivar modo armado de PC
desactivarModoArmadoPC(): void {
  this.modoArmadoPC = false;
  this.categoriaArmadoSeleccionada = undefined;
  this.productosArmado = [];
  this.productosSeleccionados = [];
  this.totalCotizacion = 0;
  // Recargar productos normales
  this.cargarProductos();
}

// ✅ NUEVO MÉTODO: Seleccionar categoría en modo armado
seleccionarCategoriaArmado(categoriaId: number): void {
  this.categoriaArmadoSeleccionada = categoriaId;
  this.cargarProductosParaArmado(categoriaId);
}

// ✅ NUEVO MÉTODO: Cargar productos para armado de PC
cargarProductosParaArmado(categoriaId: number): void {
  this.productosArmadoLoading = true;

  const filtros = {
    categoria: categoriaId,
    page: 1
  };

  this.productosService.obtenerProductosPublicos(filtros).subscribe({
    next: (response) => {
      this.productosArmado = response.productos;
      this.productosArmadoLoading = false;
    },
    error: (error) => {
      console.error('Error al cargar productos para armado:', error);
      this.productosArmadoLoading = false;
      this.productosArmado = [];
    },
  });
}

// ✅ NUEVO MÉTODO: Seleccionar/deseleccionar producto para armado
toggleProductoArmado(producto: ProductoPublico, event: any): void {
  const isChecked = event.target.checked;
  const categoriaInfo = this.categories.find(cat => cat.id === this.categoriaArmadoSeleccionada);

  if (isChecked) {
    // Verificar si ya hay un producto de esta categoría seleccionado
    const existeEnCategoria = this.productosSeleccionados.find(
      p => p.categoria_id === this.categoriaArmadoSeleccionada
    );

    if (existeEnCategoria) {
      // Reemplazar el producto existente de esta categoría
      const index = this.productosSeleccionados.findIndex(
        p => p.categoria_id === this.categoriaArmadoSeleccionada
      );
      this.productosSeleccionados[index] = {
        categoria_id: this.categoriaArmadoSeleccionada!,
        categoria_nombre: categoriaInfo?.nombre || '',
        producto: producto,
        cantidad: 1
      };
    } else {
      // Agregar nuevo producto
      this.productosSeleccionados.push({
        categoria_id: this.categoriaArmadoSeleccionada!,
        categoria_nombre: categoriaInfo?.nombre || '',
        producto: producto,
        cantidad: 1
      });
    }
  } else {
    // Remover producto
    this.productosSeleccionados = this.productosSeleccionados.filter(
      p => p.producto.id !== producto.id
    );
  }

  this.calcularTotalCotizacion();
}

// ✅ NUEVO MÉTODO: Verificar si un producto está seleccionado
isProductoSeleccionado(producto: ProductoPublico): boolean {
  return this.productosSeleccionados.some(p => p.producto.id === producto.id);
}

// ✅ NUEVO MÉTODO: Calcular total de cotización
calcularTotalCotizacion(): void {
  this.totalCotizacion = this.productosSeleccionados.reduce((total, item) => {
    const precio = item.producto.precio_oferta || item.producto.precio;
    return total + (precio * item.cantidad);
  }, 0);
}

// ✅ NUEVO MÉTODO: Contar productos seleccionados por categoría
getProductosSeleccionadosPorCategoria(categoriaId: number): number {
  return this.productosSeleccionados.filter(p => p.categoria_id === categoriaId).length;
}

// ✅ NUEVO MÉTODO: Cambiar cantidad de producto seleccionado
cambiarCantidadProducto(productoId: number, nuevaCantidad: number): void {
  const producto = this.productosSeleccionados.find(p => p.producto.id === productoId);
  if (producto && nuevaCantidad > 0) {
    producto.cantidad = nuevaCantidad;
    this.calcularTotalCotizacion();
  }
}

// ✅ NUEVO MÉTODO: Remover producto de la selección
removerProductoSeleccionado(productoId: number): void {
  this.productosSeleccionados = this.productosSeleccionados.filter(
    p => p.producto.id !== productoId
  );
  this.calcularTotalCotizacion();
}

// ✅ NUEVO MÉTODO: Agregar todos los productos seleccionados al carrito
agregarTodoAlCarrito(): void {
  if (this.productosSeleccionados.length === 0) {
    console.warn('No hay productos seleccionados');
    return;
  }

  let productosAgregados = 0;
  this.productosSeleccionados.forEach(item => {
    const success = this.cartService.addToCart(item.producto, item.cantidad);
    if (success) {
      productosAgregados++;
    }
  });

  if (productosAgregados > 0) {
    console.log(`${productosAgregados} productos agregados al carrito`);
  }
}

// ✅ NUEVO MÉTODO: Enviar cotización
enviarCotizacion(): void {
  if (this.productosSeleccionados.length === 0) {
    console.warn('No hay productos seleccionados para cotizar');
    return;
  }

  console.log('Enviando cotización:', {
    productos: this.productosSeleccionados,
    total: this.totalCotizacion
  });
  
  alert(`Cotización generada por S/ ${this.totalCotizacion.toFixed(2)}`);
}
}
