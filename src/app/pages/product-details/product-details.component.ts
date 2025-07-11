// src\app\pages\product-details\product-details.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { AlmacenService } from '../../services/almacen.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SlickCarouselModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  // ✅ DATOS DINÁMICOS
  producto: any = null;
  detalles: any = null;
  productosRelacionados: any[] = [];
  isLoading = true;
  error: string | null = null;
  
  // ✅ CONTROL DE CANTIDAD
  cantidad = 1;
  
  // ✅ IMÁGENES DINÁMICAS
  imagenesProducto: string[] = [];
  imagenPrincipal = '';
  
  private isBrowser: boolean;

  // ✅ CONFIGURACIÓN DE SLIDERS
  productThumbSlider = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.product-details__images-slider'
  };

  productImageSlider = {
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.product-details__thumb-slider',
    dots: false,
    arrows: false,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  arrivalSlider = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#new-arrival-next',
    prevArrow: '#new-arrival-prev',
    responsive: [
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 6,
          arrows: false,
        }
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 4,
          arrows: false,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          arrows: false,
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
          arrows: false,
        }
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 1,
          arrows: false,
        }
      },
    ]
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private almacenService: AlmacenService,
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // ✅ OBTENER ID DEL PRODUCTO DESDE LA RUTA
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarProducto(id);
      } else {
        this.error = 'ID de producto inválido';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar recursos si es necesario
  }

  // ✅ CARGAR PRODUCTO DINÁMICAMENTE
  cargarProducto(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.almacenService.obtenerProductoPublico(id).subscribe({
      next: (response) => {
        this.producto = response.producto;
        this.detalles = response.detalles;
        this.productosRelacionados = response.productos_relacionados;
        
        // ✅ CONFIGURAR IMÁGENES
        this.configurarImagenes();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.error = 'No se pudo cargar el producto';
        this.isLoading = false;
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    });
  }

  // ✅ CONFIGURAR IMÁGENES DEL PRODUCTO
  configurarImagenes(): void {
    if (!this.producto) return;

    // Imagen principal del producto
    const baseUrl = environment.apiUrl.replace('/api', '');
    this.imagenesProducto = [this.producto.imagen ? `${baseUrl}/storage/productos/${this.producto.imagen}` : 'assets/images/thumbs/product-default.png'];
    
    // Agregar imágenes adicionales de detalles si existen
    if (this.detalles?.imagenes) {
      try {
        const imagenesDetalles = JSON.parse(this.detalles.imagenes);
        if (Array.isArray(imagenesDetalles)) {
          const imagenesUrls = imagenesDetalles.map((img: string) => `${baseUrl}/storage/productos/detalles/${img}`);
          this.imagenesProducto = [...this.imagenesProducto, ...imagenesUrls];
        }
      } catch (e) {
        console.warn('Error al parsear imágenes de detalles:', e);
      }
    }
    
    // Imagen principal por defecto
    this.imagenPrincipal = this.imagenesProducto[0];
  }

  // ✅ CONTROL DE CANTIDAD
  aumentarCantidad(): void {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  // ✅ AGREGAR AL CARRITO
  agregarAlCarrito(): void {
    if (!this.producto) return;

    if (this.producto.stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (this.cantidad > this.producto.stock) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${this.producto.stock} unidades disponibles`,
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const success = this.cartService.addToCart(this.producto, this.cantidad);
    
    if (success) {
      Swal.fire({
        title: '¡Producto agregado!',
        text: `${this.cantidad} ${this.cantidad === 1 ? 'unidad' : 'unidades'} de "${this.producto.nombre}" agregadas al carrito`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  // ✅ COMPRAR AHORA
  comprarAhora(): void {
    this.agregarAlCarrito();
    // Redirigir al carrito después de agregar
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }

  // ✅ AGREGAR PRODUCTO RELACIONADO AL CARRITO
  agregarProductoRelacionado(producto: any): void {
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
        text: `"${producto.nombre}" agregado al carrito`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  // ✅ MANEJAR ERROR DE IMAGEN
  onImageError(event: any): void {
    event.target.src = 'assets/images/thumbs/product-default.png';
  }

  // ✅ OBTENER PORCENTAJE DE DESCUENTO
  getPorcentajeDescuento(): number {
    if (!this.producto || !this.producto.precio_oferta) return 0;
    return Math.round(((this.producto.precio_venta - this.producto.precio_oferta) / this.producto.precio_venta) * 100);
  }

  // ✅ OBTENER ESTRELLAS DE RATING
  getEstrellas(): number[] {
    const rating = 4.8; // Por defecto
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  // ✅ FORMATEAR ESPECIFICACIONES
  getEspecificaciones(): any[] {
    if (!this.detalles?.especificaciones) return [];
    
    try {
      const specs = typeof this.detalles.especificaciones === 'string' 
        ? JSON.parse(this.detalles.especificaciones) 
        : this.detalles.especificaciones;
      
      return Array.isArray(specs) ? specs : [];
    } catch {
      return [];
    }
  }

  // ✅ FORMATEAR CARACTERÍSTICAS TÉCNICAS
  getCaracteristicasTecnicas(): any[] {
    if (!this.detalles?.caracteristicas_tecnicas) return [];
    
    try {
      const caracteristicas = typeof this.detalles.caracteristicas_tecnicas === 'string' 
        ? JSON.parse(this.detalles.caracteristicas_tecnicas) 
        : this.detalles.caracteristicas_tecnicas;
      
      return Array.isArray(caracteristicas) ? caracteristicas : [];
    } catch {
      return [];
    }
  }

  // ✅ OBTENER PRECIO ACTUAL
  getPrecioActual(): number {
    if (!this.producto) return 0;
    return this.producto.precio_oferta || this.producto.precio_venta;
  }

  // ✅ OBTENER PRECIO ORIGINAL
  getPrecioOriginal(): number {
    if (!this.producto) return 0;
    return this.producto.precio_venta;
  }

  // ✅ VERIFICAR SI TIENE OFERTA
  tieneOferta(): boolean {
    return this.producto?.precio_oferta && this.producto.precio_oferta < this.producto.precio_venta;
  }
}