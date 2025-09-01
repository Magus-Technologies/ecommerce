import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasPublicasService } from '../../services/categorias-publicas.service';
import { MarcaProducto, ProductoPublico } from '../../types/almacen.types';
import { ProductosService } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

interface CategoriaTemplate {
  id: number;
  name: string;
  nombre: string;
  subcategories: string[];
  marcas: MarcaProducto[];
  marcasLoading: boolean;
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
  selector: 'app-arma-pc-publico',
  imports: [CommonModule],
  templateUrl: './arma-pc-publico.component.html',
  styleUrl: './arma-pc-publico.component.scss'
})
export class ArmaPcPublicoComponent implements OnInit {
  categories: CategoriaTemplate[] = [];
  categoriaArmadoSeleccionada?: number;
  productosArmado: ProductoPublico[] = [];
  productosArmadoLoading = false;
  productosSeleccionados: ProductoSeleccionado[] = [];
  totalCotizacion = 0;

  constructor(
    private categoriasService: CategoriasPublicasService,
    private productosService: ProductosService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.cargarCategoriasArmaPc();
  }

  // Cargar categorías configuradas por el admin para Arma tu PC
  cargarCategoriasArmaPc(): void {
    this.categoriasService.obtenerCategoriasArmaPc().subscribe({
      next: (categorias) => {
        this.categories = categorias.map(categoria => ({
          id: categoria.id,
          name: categoria.nombre,
          nombre: categoria.nombre,
          subcategories: [],
          marcas: [],
          marcasLoading: false,
          badge: `${categoria.productos_count || 0} productos`,
          badgeClass: 'bg-gray-100 text-gray-600',
          productos_count: categoria.productos_count
        }));
        console.log('Categorías Arma PC cargadas:', this.categories);
      },
      error: (error) => {
        console.error('Error al cargar categorías Arma PC:', error);
        this.categories = [];
      },
    });
  }

  // Seleccionar categoría para armado
  seleccionarCategoriaArmado(categoriaId: number): void {
    this.categoriaArmadoSeleccionada = categoriaId;
    this.cargarProductosParaArmado(categoriaId);
  }

  // Cargar productos para armado de PC
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

  // Seleccionar/deseleccionar producto para armado
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

  // Verificar si producto está seleccionado
  isProductoSeleccionado(producto: ProductoPublico): boolean {
    return this.productosSeleccionados.some(p => p.producto.id === producto.id);
  }

  // Calcular total de cotización
  calcularTotalCotizacion(): void {
    this.totalCotizacion = this.productosSeleccionados.reduce((total, item) => {
      const precio = this.getPrecioNumerico(item.producto.precio_oferta || item.producto.precio);
      return total + (precio * item.cantidad);
    }, 0);
  }

  // Convertir precio a número para mostrar
  getPrecioNumerico(precio: string | number | undefined): number {
    if (precio === undefined || precio === null) return 0;
    return typeof precio === 'number' ? precio : parseFloat(precio.toString()) || 0;
  }

  // Contar productos seleccionados por categoría
  getProductosSeleccionadosPorCategoria(categoriaId: number): number {
    return this.productosSeleccionados.filter(p => p.categoria_id === categoriaId).length;
  }

  // Cambiar cantidad de producto seleccionado
  cambiarCantidadProducto(productoId: number, nuevaCantidad: number): void {
    const producto = this.productosSeleccionados.find(p => p.producto.id === productoId);
    if (producto && nuevaCantidad > 0) {
      producto.cantidad = nuevaCantidad;
      this.calcularTotalCotizacion();
    }
  }

  // Remover producto seleccionado
  removerProductoSeleccionado(productoId: number): void {
    this.productosSeleccionados = this.productosSeleccionados.filter(
      p => p.producto.id !== productoId
    );
    this.calcularTotalCotizacion();
  }

  // Agregar todos los productos al carrito
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
      alert(`${productosAgregados} productos agregados al carrito`);
    }
  }

  // Descargar cotización como PDF
  descargarCotizacion(): void {
    if (this.productosSeleccionados.length === 0) {
      console.warn('No hay productos seleccionados para cotizar');
      return;
    }

    // Solicitar datos del cliente
    Swal.fire({
      title: 'Datos para la cotización',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input type="text" id="cliente" class="form-control" placeholder="Ingresa tu nombre completo" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" id="email" class="form-control" placeholder="tu@email.com" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono (opcional)</label>
            <input type="tel" id="telefono" class="form-control" placeholder="999 999 999">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Generar cotización',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const cliente = (document.getElementById('cliente') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
        
        if (!cliente || !email) {
          Swal.showValidationMessage('Por favor completa los campos obligatorios');
          return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingresa un email válido');
          return false;
        }
        
        return { cliente, email, telefono };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.procesarDescargaCotizacion(result.value);
      }
    });
  }

  private procesarDescargaCotizacion(datosCliente: any): void {
    const datosCotizacion = {
      cliente: datosCliente.cliente,
      email: datosCliente.email,
      telefono: datosCliente.telefono || '',
      items: this.productosSeleccionados.map(item => ({
        producto_id: item.producto.id,
        nombre: item.producto.nombre,
        descripcion: item.producto.descripcion,
        precio: this.getPrecioNumerico(item.producto.precio_oferta || item.producto.precio),
        cantidad: item.cantidad,
        subtotal: this.getPrecioNumerico(item.producto.precio_oferta || item.producto.precio) * item.cantidad,
        imagen: item.producto.imagen_principal
      })),
      total: this.totalCotizacion,
      tipo: 'arma_pc'
    };

    // Llamar al servicio para generar PDF
    this.cartService.generarCotizacionPDF(datosCotizacion).subscribe({
      next: (response) => {
        // Crear blob y descargar
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cotizacion-arma-pc-${Date.now()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        Swal.fire({
          title: '¡PDF Descargado!',
          text: 'Tu cotización se ha descargado correctamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
      },
      error: (error) => {
        console.error('Error generando PDF:', error);
        Swal.fire({
          title: 'Error al generar PDF',
          text: 'Ocurrió un error al generar tu cotización. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Error de imagen
  onImageError(event: any) {
    event.target.src = 'assets/images/default-product.png';
  }
}
