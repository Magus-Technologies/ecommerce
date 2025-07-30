// src/app/pages/index/index.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink } from '@angular/router';
import {
  CategoriaPublica,
  CategoriasPublicasService,
} from '../../services/categorias-publicas.service';
import {
  BannersService,
  Banner,
  BannerPromocional,
} from '../../services/banner.service';
import { AlmacenService } from '../../services/almacen.service';
import { MarcaProducto, ProductoPublico } from '../../types/almacen.types';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';
import {
  OfertasService,
  Oferta,
  ProductoOferta,
  Cupon,
  OfertaPrincipalResponse,
  OfertaSemanaResponse
} from '../../services/ofertas.service';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';
import { WhatsappFloatComponent } from '../../components/whatsapp-float/whatsapp-float.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface CategoriaConImagen extends CategoriaPublica {
  img: string;
  title: string;
}

// ✅ NUEVA INTERFAZ PARA LAS MARCAS EN EL SLIDER
interface BrandSlide {
  class: string;
  dataAos: string;
  dataAosDuration: number;
  imgSrc: string;
  imgAlt: string;
}

interface BrandSlideGroup {
  carouselConfig: {
    class: string;
    configBinding: string;
  };
  slides: BrandSlide[];
}

@Component({
  selector: 'app-index',
  imports: [
    CommonModule,
    SlickCarouselModule,
    RouterLink,
    ChatbotComponent,
    WhatsappFloatComponent,
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit, OnDestroy, AfterViewInit {
  // ✅ REFERENCIA AL SLIDER
  @ViewChild('slickModal', { static: false })
  slickModal!: SlickCarouselComponent;

  // ✅ CONFIGURACIÓN DE DEBUG - CAMBIAR A false PARA PRODUCCIÓN
  private readonly debugMode = false; // Cambiar a true solo para debugging

  // ✅ PROPIEDADES PARA MANEJAR INTERVALOS OPTIMIZADAS
  private countdownIntervals: { [key: string]: any } = {};
  private isBrowser: boolean;
  private lastUpdateTimes: { [key: string]: number } = {}; // Para throttling
  private cuponesRefreshInterval: any;

  // ✅ NUEVAS PROPIEDADES PARA EL SISTEMA DE FILTRADO DINÁMICO
  categoriasParaFiltro: CategoriaPublica[] = [];
  categoriaSeleccionada: number | null = null;
  productosFiltrados: ProductoPublico[] = [];
  isLoadingProductosFiltrados = false;
  todosLosProductos: ProductoPublico[] = []; // Cache de todos los productos
  // ✅ NUEVA VARIABLE ESPECÍFICA PARA CUPONES
  isLoadingCupones = false;
  productosDestacados: ProductoPublico[] = [];
  isLoadingProductosDestacados = false;

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // ✅ CAMBIO: false en lugar de true
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    dots: false,
    infinite: true,
    pauseOnHover: true,
    fade: false,
    cssEase: 'ease-in-out',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false, // ✅ CAMBIO: false en lugar de true
          autoplay: true,
          autoplaySpeed: 4000,
        },
      },
    ],
  };

  breakpoint(e: any) {
    if (this.debugMode) console.log('breakpoint');
  }

  afterChange(e: any) {
    if (this.debugMode) console.log('afterChange');
  }

  beforeChange(e: any) {
    if (this.debugMode) console.log('beforeChange');
  }

  slickInit(e: any) {
    if (this.debugMode) console.log('slick initialized');
  }

  bannersDinamicos: Banner[] = [];
  isLoadingBanners = false;

  featureItems: CategoriaConImagen[] = [];
  isLoadingCategorias = false;

  marcasDinamicas: MarcaProducto[] = [];
  isLoadingMarcas = false;

  featureSlideConfig = {
    slidesToShow: 10,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#feature-item-wrapper-next',
    prevArrow: '#feature-item-wrapper-prev',
    responsive: [
      {
        breakpoint: 1699,
        settings: {
          slidesToShow: 9,
        },
      },
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 8,
        },
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 359,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  promotionalBanners: BannerPromocional[] = [];
  isLoadingPromotionalBanners = false;

  // ✅ PROPIEDADES PARA OFERTAS DINÁMICAS
  ofertasActivas: Oferta[] = [];
  flashSalesActivas: Oferta[] = [];
  productosEnOferta: ProductoOferta[] = [];
  cuponesActivos: Cupon[] = [];
  isLoadingOfertas = false;

  // ✅ NUEVA PROPIEDAD: Oferta principal del día
  ofertaPrincipalDelDia: OfertaPrincipalResponse | null = null;
  isLoadingOfertaPrincipal = false;

  ofertaSemanaActiva: OfertaSemanaResponse | null = null;
  isLoadingOfertaSemana = false;

  cargarBannersPromocionales(): void {
    this.isLoadingPromotionalBanners = true;
    this.bannersService.obtenerBannersPromocionalesPublicos().subscribe({
      next: (banners) => {
        console.log('Debug: Banners Promocionales recibidos:', banners); // <-- DEBUG
        this.promotionalBanners = banners;
        this.isLoadingPromotionalBanners = false;
      },
      error: (error) => {
        console.error('Error al cargar banners promocionales:', error);
        this.isLoadingPromotionalBanners = false;
        this.promotionalBanners = [];
      },
    });
  }

  // ✅ CONSTRUCTOR ACTUALIZADO CON PLATFORM_ID Y ChangeDetectorRef
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoriasPublicasService: CategoriasPublicasService,
    private bannersService: BannersService,
    private almacenService: AlmacenService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private ofertasService: OfertasService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cargarCategoriasPublicas();
    this.cargarBannersDinamicos();
    this.cargarBannersPromocionales();
    this.cargarMarcasDinamicas();
    this.cargarOfertasActivas();
    this.cargarFlashSales();
    this.cargarProductosEnOferta();
    this.cargarCuponesActivos();
    this.cargarOfertaPrincipalDelDia(); // ✅ NUEVA FUNCIÓN
    this.cargarCategoriasParaFiltro(); // ✅ NUEVA FUNCIÓN
    this.cargarTodosLosProductos(); // ✅ NUEVA FUNCIÓN
    this.cargarProductosDestacados();
    this.cargarOfertaSemanaActiva();

    // NUEVA LÍNEA: Actualizar cupones cada 5 minutos
    if (this.isBrowser) {
      this.cuponesRefreshInterval = setInterval(() => {
        this.cargarCuponesActivos();
      }, 5 * 60 * 1000); // 5 minutos
    }
  }

  // ✅ MEJORADO: Inicializar countdowns después de que la vista se cargue
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // ✅ AUMENTAR EL DELAY PARA ASEGURAR QUE TODO ESTÉ CARGADO
      setTimeout(() => {
        this.inicializarCountdowns();
      }, 2000);
    }
  }

  // ✅ MÉTODOS PARA CONTROLAR EL SLIDER - VERSIÓN DEFINITIVA
  anteriorSlide(): void {
    if (this.isBrowser && this.slickModal) {
      try {
        this.slickModal.slickPrev();
      } catch (error) {
        console.warn('Error al ir al slide anterior:', error);
      }
    }
  }

  siguienteSlide(): void {
    if (this.isBrowser && this.slickModal) {
      try {
        this.slickModal.slickNext();
      } catch (error) {
        console.warn('Error al ir al siguiente slide:', error);
      }
    }
  }

  // ✅ MÉTODO AUXILIAR PARA CONTROLAR EL SLIDER
  private controlSlider(direction: 'prev' | 'next'): void {
    const waitForSlider = (attempts: number = 0): void => {
      if (attempts > 10) {
        console.warn('Slider no se pudo inicializar después de 10 intentos');
        return;
      }

      const slickElement = document.querySelector(
        'ngx-slick-carousel.carousel .slick-slider'
      ) as any;

      if (slickElement && slickElement.slick) {
        if (direction === 'prev') {
          slickElement.slick('slickPrev');
        } else {
          slickElement.slick('slickNext');
        }
      } else {
        // Esperar 200ms y volver a intentar
        setTimeout(() => waitForSlider(attempts + 1), 200);
      }
    };

    waitForSlider();
  }

  // ✅ MEJORADO: Limpiar intervalos al destruir el componente
  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.limpiarTodosLosIntervalos();

      // NUEVAS LÍNEAS: Limpiar interval de cupones
      if (this.cuponesRefreshInterval) {
        clearInterval(this.cuponesRefreshInterval);
      }
    }
  }

  // ✅ NUEVO: Método para limpiar todos los intervalos
  private limpiarTodosLosIntervalos(): void {
    Object.values(this.countdownIntervals).forEach((interval) => {
      if (interval) {
        clearInterval(interval);
      }
    });
    this.countdownIntervals = {};
    this.lastUpdateTimes = {};

    if (this.debugMode) {
      console.log('🧹 Todos los intervalos de countdown limpiados');
    }
  }

  cargarCategoriasPublicas(): void {
    this.isLoadingCategorias = true;
    this.categoriasPublicasService.obtenerCategoriasPublicas().subscribe({
      next: (categorias) => {
        this.featureItems = categorias.map((cat) => ({
          ...cat,
          img: cat.imagen_url || 'assets/images/thumbs/feature-img10.png',
          title: cat.nombre,
        })) as CategoriaConImagen[];
        this.isLoadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías públicas:', error);
        this.isLoadingCategorias = false;
      },
    });
  }

  // ✅ NUEVA FUNCIÓN: Cargar categorías para el filtro
  cargarCategoriasParaFiltro(): void {
    this.categoriasPublicasService.obtenerCategoriasPublicas().subscribe({
      next: (categorias) => {
        // Filtrar solo las categorías que tienen productos
        this.categoriasParaFiltro = categorias.filter(
          (cat) => cat.productos_count && cat.productos_count > 0
        );

        if (this.debugMode) {
          console.log(
            '✅ Categorías para filtro cargadas:',
            this.categoriasParaFiltro
          );
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías para filtro:', error);
        this.categoriasParaFiltro = [];
      },
    });
  }

  // ✅ NUEVA FUNCIÓN: Cargar todos los productos
  cargarTodosLosProductos(): void {
    this.isLoadingProductosFiltrados = true;
    this.almacenService.obtenerProductosPublicos().subscribe({
      next: (response) => {
        this.todosLosProductos = response.productos;
        this.productosFiltrados = [...this.todosLosProductos]; // Mostrar todos inicialmente
        this.isLoadingProductosFiltrados = false;

        if (this.debugMode) {
          console.log(
            '✅ Todos los productos cargados:',
            this.todosLosProductos
          );
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoadingProductosFiltrados = false;
        this.todosLosProductos = [];
        this.productosFiltrados = [];
      },
    });
  }

  // ✅ NUEVA FUNCIÓN: Filtrar productos por categoría
  filtrarPorCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    this.isLoadingProductosFiltrados = true;

    if (this.debugMode) {
      console.log('🔍 Filtrando por categoría:', categoriaId);
    }

    // Simular un pequeño delay para mostrar el loading
    setTimeout(() => {
      if (categoriaId === null) {
        // Mostrar todos los productos
        this.productosFiltrados = [...this.todosLosProductos];
      } else {
        // Filtrar por categoría específica
        this.productosFiltrados = this.todosLosProductos.filter(
          (producto) => producto.categoria_id === categoriaId
        );
      }

      this.isLoadingProductosFiltrados = false;
      this.cdr.detectChanges();

      if (this.debugMode) {
        console.log('✅ Productos filtrados:', this.productosFiltrados.length);
      }
    }, 300);
  }

  cargarBannersDinamicos(): void {
    this.isLoadingBanners = true;
    this.bannersService.obtenerBannersPublicos().subscribe({
      next: (banners) => {
        this.bannersDinamicos = banners;
        this.isLoadingBanners = false;
      },
      error: (error) => {
        console.error('Error al cargar banners:', error);
        this.isLoadingBanners = false;
        this.bannersDinamicos = [];
      },
    });
  }

  cargarMarcasDinamicas(): void {
    this.isLoadingMarcas = true;
    this.almacenService.obtenerMarcasPublicas().subscribe({
      next: (marcas) => {
        this.brandSlides[0].slides = marcas.map((marca, index) => ({
          class: 'brand-item',
          dataAos: 'zoom-in',
          dataAosDuration: 200 + index * 200,
          imgSrc: marca.imagen_url || 'assets/images/thumbs/brand-default.png',
          imgAlt: marca.nombre,
        }));
        this.isLoadingMarcas = false;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.isLoadingMarcas = false;
      },
    });
  }

  addToCart(product: any): void {
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        icon: 'warning',
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    const success = this.cartService.addToCart(product, 1);

    if (success) {
      Swal.fire({
        title: '¡Producto agregado!',
        text: `${
          product.name || product.title || product.nombre
        } ha sido agregado a tu carrito`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#f8f9fa',
        color: '#333',
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito. Revisa el stock disponible.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
      });
    }
  }
  // ✅ NUEVO MÉTODO: Agregar a wishlist con verificación de autenticación
  agregarAWishlist(product: any): void {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Inicia sesión requerido',
        text: 'Debes iniciar sesión para agregar productos a tu lista de deseos',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Registrarse',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirigir a la página de registro
          window.location.href = '/register';
        }
      });
      return;
    }

    // Usuario logueado: proceder con la wishlist
    const isToggled = this.wishlistService.toggleWishlist(product);

    if (isToggled) {
      // Producto agregado
      Swal.fire({
        title: '¡Agregado a favoritos!',
        text: `${
          product.nombre || product.name || product.title
        } ha sido agregado a tu lista de deseos`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#f8f9fa',
        color: '#333',
      });
    } else {
      // Producto removido
      Swal.fire({
        title: 'Removido de favoritos',
        text: `${
          product.nombre || product.name || product.title
        } ha sido removido de tu lista de deseos`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#f8f9fa',
        color: '#333',
      });
    }
  }

  // ✅ NUEVO MÉTODO: Verificar si un producto está en wishlist
  isInWishlist(productoId: number): boolean {
    return this.wishlistService.isInWishlist(productoId);
  }

  cargarOfertasActivas(): void {
    this.isLoadingOfertas = true;
    this.ofertasService.obtenerOfertasPublicas().subscribe({
      next: (ofertas) => {
        if (this.debugMode) {
          console.log('✅ Ofertas cargadas:', ofertas);
        }
        this.ofertasActivas = ofertas;
        this.isLoadingOfertas = false;
        this.cdr.detectChanges();

        // ✅ INICIALIZAR COUNTDOWNS DESPUÉS DE CARGAR DATOS
        if (this.isBrowser) {
          setTimeout(() => this.inicializarCountdowns(), 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar ofertas:', error);
        this.isLoadingOfertas = false;
      },
    });
  }

  cargarFlashSales(): void {
    this.ofertasService.obtenerFlashSales().subscribe({
      next: (flashSales) => {
        if (this.debugMode) {
          console.log('✅ Flash Sales cargadas:', flashSales);
        }
        this.flashSalesActivas = flashSales;
        this.cdr.detectChanges();

        // ✅ INICIALIZAR COUNTDOWNS DESPUÉS DE CARGAR DATOS
        if (this.isBrowser) {
          setTimeout(() => this.inicializarCountdowns(), 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar flash sales:', error);
      },
    });
  }

  cargarProductosEnOferta(): void {
    this.ofertasService.obtenerProductosEnOferta().subscribe({
      next: (productos) => {
        if (this.debugMode) {
          console.log('✅ Productos en oferta cargados:', productos);
        }
        this.productosEnOferta = productos;
        this.cdr.detectChanges();

        // ✅ INICIALIZAR COUNTDOWNS DESPUÉS DE CARGAR DATOS
        if (this.isBrowser) {
          setTimeout(() => this.inicializarCountdowns(), 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos en oferta:', error);
      },
    });
  }

  // ✅ NUEVA FUNCIÓN: Cargar oferta principal del día
  cargarOfertaPrincipalDelDia(): void {
    this.isLoadingOfertaPrincipal = true;
    this.ofertasService.obtenerOfertaPrincipalDelDia().subscribe({
      next: (response) => {
        if (this.debugMode) {
          console.log('✅ Oferta principal del día cargada:', response);
        }
        this.ofertaPrincipalDelDia = response;
        this.isLoadingOfertaPrincipal = false;
        this.cdr.detectChanges();

        // ✅ INICIALIZAR COUNTDOWN PARA LA OFERTA PRINCIPAL
        if (this.isBrowser && response.oferta_principal?.fecha_fin) {
          setTimeout(() => {
            this.inicializarCountdown(
              'countdown-oferta-principal',
              response.oferta_principal!.fecha_fin
            );
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar oferta principal del día:', error);
        this.isLoadingOfertaPrincipal = false;
      },
    });
  }
  // ✅ NUEVA FUNCIÓN: Cargar oferta de la semana
  cargarOfertaSemanaActiva(): void {
    this.isLoadingOfertaSemana = true;
    this.ofertasService.obtenerOfertaSemanaActiva().subscribe({
      next: (response) => {
        if (this.debugMode) {
          console.log('✅ Oferta de la semana cargada:', response);
        }
        this.ofertaSemanaActiva = response;
        this.isLoadingOfertaSemana = false;
        this.cdr.detectChanges();

        // ✅ INICIALIZAR COUNTDOWN PARA LA OFERTA DE LA SEMANA
        if (this.isBrowser && response.oferta_semana?.fecha_fin) {
          setTimeout(() => {
            this.inicializarCountdown(
              'countdown-oferta-semana',
              response.oferta_semana!.fecha_fin
            );
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar oferta de la semana:', error);
        this.isLoadingOfertaSemana = false;
      },
    });
  }

  cargarCuponesActivos(): void {
    this.isLoadingCupones = true;
    this.ofertasService.obtenerCuponesActivos().subscribe({
      next: (cupones) => {
        console.log('✅ Cupones activos cargados desde backend:', cupones);
        this.cuponesActivos = cupones;
        this.isLoadingCupones = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar cupones activos:', error);
        this.isLoadingCupones = false;
        // Fallback: usar cupones estáticos si hay error
        this.cuponesActivos = [
          {
            id: 1,
            codigo: 'BIENVENIDO20',
            titulo: 'Bienvenido - 20% de descuento',
            tipo_descuento: 'porcentaje',
            valor_descuento: 20,
            compra_minima: 100,
          },
          {
            id: 2,
            codigo: 'ENVIOGRATIS',
            titulo: 'Envío gratis',
            tipo_descuento: 'cantidad_fija',
            valor_descuento: 15,
            compra_minima: 50,
          },
        ];
        this.cdr.detectChanges();
      },
    });
  }

  // ✅ MEJORADA: Inicializar todos los countdowns con optimizaciones
  inicializarCountdowns(): void {
    if (!this.isBrowser) {
      if (this.debugMode) {
        console.log('🚫 No estamos en el navegador, saltando countdowns');
      }
      return;
    }

    if (this.debugMode) {
      console.log('🕒 Inicializando countdowns...');
      console.log('Flash Sales:', this.flashSalesActivas);
      console.log('Productos en oferta:', this.productosEnOferta);
      console.log('Oferta principal:', this.ofertaPrincipalDelDia);
    }

    // ✅ LIMPIAR INTERVALOS ANTERIORES
    this.limpiarTodosLosIntervalos();

    // Countdown para Flash Sales
    this.flashSalesActivas.forEach((sale) => {
      if (sale.fecha_fin) {
        const countdownId = `countdown-flash-${sale.id}`;
        if (this.debugMode) {
          console.log(
            `🔄 Inicializando countdown para flash sale ${sale.id}:`,
            sale.fecha_fin
          );
        }
        this.inicializarCountdown(countdownId, sale.fecha_fin);
      }
    });

    // Countdown para productos en oferta que son flash sales
    this.productosEnOferta.forEach((producto) => {
      if (producto.es_flash_sale && producto.fecha_fin_oferta) {
        const countdownId = `countdown-producto-${producto.id}`;
        if (this.debugMode) {
          console.log(
            `🔄 Inicializando countdown para producto ${producto.id}:`,
            producto.fecha_fin_oferta
          );
        }
        this.inicializarCountdown(countdownId, producto.fecha_fin_oferta);
      }
    });

    // ✅ COUNTDOWN PARA OFERTA PRINCIPAL DEL DÍA
    if (this.ofertaPrincipalDelDia?.oferta_principal?.fecha_fin) {
      this.inicializarCountdown(
        'countdown-oferta-principal',
        this.ofertaPrincipalDelDia.oferta_principal.fecha_fin
      );
    }
    // ✅ COUNTDOWN PARA OFERTA DE LA SEMANA
    if (this.ofertaSemanaActiva?.oferta_semana?.fecha_fin) {
      this.inicializarCountdown(
        'countdown-oferta-semana',
        this.ofertaSemanaActiva.oferta_semana.fecha_fin
      );
    }

    // ✅ COUNTDOWN ESTÁTICOS CON FECHAS FUTURAS VÁLIDAS
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 30); // 30 días en el futuro

    this.inicializarCountdown('countdown4', fechaFutura.toISOString());
    this.inicializarCountdown('countdown26', fechaFutura.toISOString());
  }

  // ✅ MEJORADA: Inicializar countdown individual con optimizaciones
  inicializarCountdown(elementId: string, fechaFin: string): void {
    if (!this.isBrowser) {
      return;
    }

    // ✅ ESPERAR A QUE EL ELEMENTO ESTÉ EN EL DOM
    const waitForElement = (
      selector: string,
      maxAttempts: number = 10
    ): Promise<HTMLElement | null> => {
      return new Promise((resolve) => {
        let attempts = 0;
        const checkElement = () => {
          const element = document.getElementById(selector);
          if (element || attempts >= maxAttempts) {
            resolve(element);
          } else {
            attempts++;
            setTimeout(checkElement, 200);
          }
        };
        checkElement();
      });
    };

    waitForElement(elementId).then((element) => {
      if (!element) {
        if (this.debugMode) {
          console.warn(
            `⚠️ Elemento countdown no encontrado después de esperar: ${elementId}`
          );
        }
        return;
      }

      if (this.debugMode) {
        console.log(
          `🕒 Inicializando countdown para ${elementId} hasta ${fechaFin}`
        );
      }

      // Limpiar intervalo anterior si existe
      if (this.countdownIntervals[elementId]) {
        clearInterval(this.countdownIntervals[elementId]);
      }

      // ✅ MEJORAR PARSING DE FECHA
      let endDate: number;
      try {
        endDate = new Date(fechaFin).getTime();

        // Verificar si la fecha es válida
        if (isNaN(endDate)) {
          throw new Error('Fecha inválida');
        }

        // ✅ VERIFICAR QUE LA FECHA SEA FUTURA
        const now = new Date().getTime();
        if (endDate <= now) {
          if (this.debugMode) {
            console.warn(
              `⚠️ La fecha de fin ya pasó para ${elementId}: ${fechaFin}`
            );
          }
          // Establecer una fecha futura por defecto
          endDate = now + 24 * 60 * 60 * 1000; // 24 horas en el futuro
        }
      } catch (error) {
        if (this.debugMode) {
          console.error(
            `❌ Error al parsear fecha para countdown ${elementId}: ${fechaFin}`,
            error
          );
        }
        // Fecha por defecto: 24 horas en el futuro
        endDate = new Date().getTime() + 24 * 60 * 60 * 1000;
      }

      // ✅ INICIALIZAR TIEMPO DE ÚLTIMA ACTUALIZACIÓN PARA THROTTLING
      this.lastUpdateTimes[elementId] = 0;

      const updateCountdown = () => {
        const now = new Date().getTime();

        // ✅ THROTTLING: Solo actualizar cada 1000ms para evitar spam
        if (now - this.lastUpdateTimes[elementId] < 950) {
          return;
        }
        this.lastUpdateTimes[elementId] = now;

        const timeLeft = endDate - now;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          // ✅ BUSCAR ELEMENTOS CON MÚLTIPLES SELECTORES
          const daysElement =
            element.querySelector('.days') ||
            element.querySelector('[class*="days"]');
          const hoursElement =
            element.querySelector('.hours') ||
            element.querySelector('[class*="hours"]');
          const minutesElement =
            element.querySelector('.minutes') ||
            element.querySelector('[class*="minutes"]');
          const secondsElement =
            element.querySelector('.seconds') ||
            element.querySelector('[class*="seconds"]');

          if (daysElement)
            daysElement.textContent = days.toString().padStart(2, '0');
          if (hoursElement)
            hoursElement.textContent = hours.toString().padStart(2, '0');
          if (minutesElement)
            minutesElement.textContent = minutes.toString().padStart(2, '0');
          if (secondsElement)
            secondsElement.textContent = seconds.toString().padStart(2, '0');

          // ✅ SOLO MOSTRAR LOGS EN MODO DEBUG
          if (this.debugMode) {
            console.log(
              `⏰ ${elementId}: ${days}d ${hours}h ${minutes}m ${seconds}s`
            );
          }
        } else {
          // Tiempo expirado
          const daysElement = element.querySelector('.days');
          const hoursElement = element.querySelector('.hours');
          const minutesElement = element.querySelector('.minutes');
          const secondsElement = element.querySelector('.seconds');

          if (daysElement) daysElement.textContent = '00';
          if (hoursElement) hoursElement.textContent = '00';
          if (minutesElement) minutesElement.textContent = '00';
          if (secondsElement) secondsElement.textContent = '00';

          // Limpiar intervalo
          if (this.countdownIntervals[elementId]) {
            clearInterval(this.countdownIntervals[elementId]);
            delete this.countdownIntervals[elementId];
            delete this.lastUpdateTimes[elementId];
          }

          if (this.debugMode) {
            console.log(`⏰ ${elementId}: EXPIRADO`);
          }
        }
      };

      // Ejecutar inmediatamente
      updateCountdown();

      // ✅ CONFIGURAR INTERVALO OPTIMIZADO (cada 1000ms en lugar de menos)
      this.countdownIntervals[elementId] = setInterval(updateCountdown, 1000);
    });
  }

  copiarCupon(codigo: string): void {
    if (!this.isBrowser) return;

    navigator.clipboard
      .writeText(codigo)
      .then(() => {
        Swal.fire({
          title: '¡Cupón copiado!',
          text: `El código "${codigo}" ha sido copiado al portapapeles`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      })
      .catch(() => {
        // Fallback para navegadores que no soportan clipboard
        const textArea = document.createElement('textarea');
        textArea.value = codigo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        Swal.fire({
          title: '¡Cupón copiado!',
          text: `El código "${codigo}" ha sido copiado`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      });
  }

  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/thumbs/feature-img10.png';
  }

  topProductSlides = [
    {
      imgSrc: 'assets/images/thumbs/short-product-img5.png',
      alt: 'Product 1',
      rating: 4.8,
      ratingCount: '17k',
      title: 'Hortalizas en floretes de brócoli de Taylor Farms',
      price: '$1500.00',
    },
    {
      imgSrc: 'assets/images/thumbs/short-product-img6.png',
      alt: 'Product 2',
      rating: 4.8,
      ratingCount: '17k',
      title: 'Hortalizas en floretes de brócoli de Taylor Farms',
      price: '$1500.00',
    },
    {
      imgSrc: 'assets/images/thumbs/short-product-img7.png',
      alt: 'Product 3',
      rating: 4.8,
      ratingCount: '17k',
      title: 'Hortalizas en floretes de brócoli de Taylor Farms',
      price: '$1500.00',
    },
    {
      imgSrc: 'assets/images/thumbs/short-product-img8.png',
      alt: 'Product 4',
      rating: 4.8,
      ratingCount: '17k',
      title: 'Hortalizas en floretes de brócoli de Taylor Farms',
      price: '$1500.00',
    },
  ];

  hotDealsSlideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#hot-deals-next',
    prevArrow: '#hot-deals-prev',
    responsive: [
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  sortProductSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
  };

  // ✅ BRAND SLIDER CON TIPADO CORRECTO
  brandSlides: BrandSlideGroup[] = [
    {
      carouselConfig: {
        class: 'brand-slider arrow-style-two',
        configBinding: 'BrandSlideConfig',
      },
      slides: [] as BrandSlide[], // ✅ INICIALIZAR VACÍO CON TIPADO CORRECTO
    },
  ];

  BrandSlideConfig = {
    slidesToShow: 8,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#brand-next',
    prevArrow: '#brand-prev',
    responsive: [
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 7,
          arrows: false,
        },
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 6,
          arrows: false,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
          arrows: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 4,
          arrows: false,
        },
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 359,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
    ],
  };
  cargarProductosDestacados(): void {
    this.isLoadingProductosDestacados = true;
    this.almacenService.obtenerProductosDestacados().subscribe({
      next: (productos) => {
        this.productosDestacados = productos.map((producto: any) => ({
          ...producto,
          precio: producto.precio_venta ?? 0,
          imagen_principal: producto.imagen_url ?? '',
          rating: producto.rating ?? 0,
          total_reviews: producto.total_reviews ?? 0,
          descripcion: producto.descripcion ?? '',
          categoria_id: producto.categoria_id ?? null,
          stock: producto.stock ?? 0,
          nombre: producto.nombre ?? '',
          marca_id: producto.marca_id ?? null,
        })) as ProductoPublico[];

        this.isLoadingProductosDestacados = false;

        if (this.debugMode) {
          console.log('✅ Productos destacados cargados:', productos);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos destacados:', error);
        this.isLoadingProductosDestacados = false;
        this.productosDestacados = [];
      },
    });
  }

  getSafeUrl(url: string): SafeUrl {
    if (!url) {
      return this.sanitizer.bypassSecurityTrustUrl('javascript:void(0);');
    }
    let finalUrl = url;
    if (
      !finalUrl.startsWith('http://') &&
      !finalUrl.startsWith('https://') &&
      !finalUrl.startsWith('/')
    ) {
      finalUrl = 'http://' + finalUrl;
    }
    return this.sanitizer.bypassSecurityTrustUrl(finalUrl);
  }
  calcularPorcentajeProgreso(producto: any): number {
  if (!producto?.vendidos_oferta || !producto?.stock_oferta) {
    return 0;
  }
  return (producto.vendidos_oferta / producto.stock_oferta) * 100;
}
}
