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
import { CartNotificationService } from '../../services/cart-notification.service';

import Swal from 'sweetalert2';
import {
  OfertasService,
  Oferta,
  ProductoOferta,
  Cupon,
  OfertaPrincipalResponse,
  OfertaSemanaResponse
} from '../../services/ofertas.service';
import { BannerFlashSalesService, BannerFlashSale } from '../../services/banner-flash-sales.service';
import { BannerOfertaService, BannerOferta } from '../../services/banner-oferta.service';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';
import { WhatsappFloatComponent } from '../../components/whatsapp-float/whatsapp-float.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SlugHelper } from '../../helpers/slug.helper'; // ✅ NUEVO

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
  marcaId?: number; // ✅ ID de la marca para redirección
  marcaSlug?: string; // ✅ NUEVO: Slug de la marca para URLs SEO-friendly
  marcaNombre?: string; // ✅ NUEVO: Nombre de la marca para generar slug si no existe
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

  // ✅ REFERENCIA AL SLIDER DE CATEGORÍAS
  @ViewChild('categoriasCarousel', { static: false })
  categoriasCarousel!: SlickCarouselComponent;

  @ViewChild('ofertasCarousel', { static: false })
ofertasCarousel!: SlickCarouselComponent;


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
  productosVisibles: number = 12; // ✅ Mostrar inicialmente 12 productos (2 filas de 6)
  productosPorCarga: number = 12; // ✅ Cargar 12 productos más cada vez
  // ✅ NUEVA VARIABLE ESPECÍFICA PARA CUPONES
  isLoadingCupones = false;
  productosDestacados: ProductoPublico[] = [];
  isLoadingProductosDestacados = false;
  productosMasVendidos: ProductoPublico[] = [];
  isLoadingProductosMasVendidos = false;

  // ✅ NUEVA PROPIEDAD: Cache para el estado de wishlist
  private wishlistState = new Set<number>();

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    dots: true, // ✅ ACTIVAR DOTS
    infinite: true,
    pauseOnHover: true,
    fade: false,
    cssEase: 'ease-in-out',
    dotsClass: 'slick-dots custom-dots', // ✅ CLASE PERSONALIZADA
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          autoplay: true,
          autoplaySpeed: 4000,
          dots: true, // ✅ DOTS EN MÓVIL TAMBIÉN
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

  // ✅ NUEVO: Banners horizontales (solo para index)
  bannersHorizontales: {
    debajo_ofertas_especiales: Banner | null;
    debajo_categorias: Banner | null;
    debajo_ventas_flash: Banner | null;
  } = {
    debajo_ofertas_especiales: null,
    debajo_categorias: null,
    debajo_ventas_flash: null
  };
  isLoadingBannersHorizontales = false;

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
    arrows: false, // Deshabilitado porque usamos botones personalizados
    draggable: true,
    infinite: true,
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
  // ✅ CONFIGURACIÓN PARA CARRUSEL DE OFERTAS ESPECIALES
ofertasEspecialesSlideConfig: any = {
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: false, // Usaremos botones personalizados
  dots: false,
  infinite: true,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,
  draggable: true,
  responsive: [
    {
      breakpoint: 1400,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 576,
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
  flashSalesActivas: BannerFlashSale[] = [];
  flashSalesCurrentPage = 0;
  flashSalesPerPage = 2; // Mostrar 2 a la vez
  bannerOfertaActivo: BannerOferta | null = null;
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
        // console.log('Debug: Banners Promocionales recibidos:', banners); 
        
        // console.log('Debug: Primer banner completo:', JSON.stringify(banners[0], null, 2));
        this.promotionalBanners = banners;
        this.isLoadingPromotionalBanners = false;
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
    private bannerFlashSalesService: BannerFlashSalesService,
    private bannerOfertaService: BannerOfertaService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private cartNotificationService: CartNotificationService
  ) {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cargarCategoriasPublicas();
    this.cargarBannersDinamicos();
    this.cargarBannersPromocionales();
    this.cargarBannersHorizontales(); // ✅ NUEVO
    this.cargarMarcasDinamicas();
    this.cargarOfertasActivas();
    this.cargarFlashSales();
    this.cargarBannerOfertaActivo(); // ✅ Este ya trae los productos dentro
    // ❌ ELIMINADO: this.cargarProductosEnOferta() - Ya no se usa, los productos vienen en bannerOfertaActivo
    this.cargarCuponesActivos();
    this.cargarOfertaPrincipalDelDia(); // ✅ NUEVA FUNCIÓN
    this.cargarCategoriasParaFiltro(); // ✅ NUEVA FUNCIÓN
    this.cargarTodosLosProductos(); // ✅ NUEVA FUNCIÓN
    this.cargarProductosDestacados();
    this.cargarProductosMasVendidos(); // ✅ NUEVA FUNCIÓN
    this.cargarOfertaSemanaActiva();

    // ✅ NUEVA LÍNEA: Inicializar wishlist state
    this.inicializarWishlistState();

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
        this.reinicializarSliders();
      }, 2000);
    }
  }

  // ✅ NUEVO: Método para reinicializar sliders después de cargar datos
  private reinicializarSliders(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      try {
        // Método 1: Refrescar AOS (Animate On Scroll)
        if (typeof (window as any).AOS !== 'undefined') {
          (window as any).AOS.refresh();
        }

        // Método 2: Usando jQuery si está disponible
        if (typeof (window as any).$ !== 'undefined') {
          const $ = (window as any).$;
          $('.slick-slider').each(function(this: any) {
            if ($(this).hasClass('slick-initialized')) {
              $(this).slick('refresh');
              $(this).slick('setPosition');
            }
          });
        }

        // Método 3: Forzar reflow manualmente
        const sliders = document.querySelectorAll('.slick-slider');
        sliders.forEach((slider) => {
          if (slider instanceof HTMLElement) {
            // Forzar un reflow
            slider.style.display = 'none';
            void slider.offsetHeight; // Trigger reflow
            slider.style.display = '';
          }
        });

        // Método 4: Forzar detección de cambios
        this.cdr.detectChanges();

        // Método 5: Trigger window resize event (esto fuerza a los sliders a recalcular)
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.warn('Error al refrescar sliders:', error);
      }
    }, 100);
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

  // ✅ MÉTODOS PARA CONTROLAR EL SLIDER DE CATEGORÍAS
  anteriorCategoria(): void {
    if (this.isBrowser && this.categoriasCarousel) {
      try {
        this.categoriasCarousel.slickPrev();
      } catch (error) {
        console.warn('Error al ir a la categoría anterior:', error);
      }
    }
  }

  siguienteCategoria(): void {
    if (this.isBrowser && this.categoriasCarousel) {
      try {
        this.categoriasCarousel.slickNext();
      } catch (error) {
        console.warn('Error al ir a la siguiente categoría:', error);
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
          console.log('✅ Todos los productos cargados:', this.todosLosProductos.length);
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

  // ✅ FUNCIÓN: Ver más productos con scroll suave
  verMasProductos(): void {
    const productosAntesDeCargar = this.productosVisibles;
    this.productosVisibles += this.productosPorCarga; // ✅ Cargar 12 productos más

    // ✅ Scroll suave al primer producto nuevo después de cargar
    if (this.isBrowser) {
      setTimeout(() => {
        const productosContainer = document.querySelector('.recommended .row.g-12');
        if (productosContainer) {
          const nuevoProducto = productosContainer.children[productosAntesDeCargar] as HTMLElement;
          if (nuevoProducto) {
            nuevoProducto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 100);
    }
  }

  // ✅ NUEVA FUNCIÓN: Filtrar productos por categoría
  filtrarPorCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    this.isLoadingProductosFiltrados = true;
    this.productosVisibles = 12; // ✅ Resetear a 12 al filtrar

    if (this.debugMode) {
      console.log('🔍 Filtrando por categoría:', categoriaId);
    }

    // Simular un pequeño delay para mostrar el loading
    setTimeout(() => {
      if (categoriaId === null) {
        // Mostrar todos los productos
        this.productosFiltrados = [...this.todosLosProductos];
      } else {
        // Filtrar por categoría específica - CONVERTIR AMBOS A NÚMERO PARA COMPARAR
        this.productosFiltrados = this.todosLosProductos.filter(
          (producto) => Number(producto.categoria_id) === Number(categoriaId)
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

  // ✅ NUEVO: Cargar banners horizontales
  cargarBannersHorizontales(): void {
    this.isLoadingBannersHorizontales = true;
    this.bannersService.obtenerBannersHorizontalesPublicos().subscribe({
      next: (banners) => {
        // Organizar banners por posición (solo posiciones válidas para index)
        banners.forEach(banner => {
          if (banner.posicion_horizontal && banner.posicion_horizontal !== 'sidebar_shop') {
            const posicion = banner.posicion_horizontal as 'debajo_ofertas_especiales' | 'debajo_categorias' | 'debajo_ventas_flash';
            this.bannersHorizontales[posicion] = banner;
          }
        });
        this.isLoadingBannersHorizontales = false;

        if (this.debugMode) {
          console.log('✅ Banners horizontales cargados:', this.bannersHorizontales);
        }
      },
      error: (error) => {
        console.error('Error al cargar banners horizontales:', error);
        this.isLoadingBannersHorizontales = false;
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
          marcaId: marca.id, // ✅ ID de marca
          marcaSlug: marca.slug, // ✅ NUEVO: Slug de la marca para SEO
          marcaNombre: marca.nombre, // ✅ NUEVO: Nombre para generar slug si no existe
        }));
        this.isLoadingMarcas = false;

        // Forzar detección de cambios y reinicializar sliders
        this.cdr.detectChanges();
        if (this.isBrowser) {
          setTimeout(() => {
            this.cdr.detectChanges();
            setTimeout(() => this.reinicializarSliders(), 500);
          }, 200);
        }
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

    this.cartService.addToCart(product, 1).subscribe({
      next: () => {
        // Preparar imagen del producto
        let productImage = '';
        if (product.imagen_url) {
          productImage = product.imagen_url;
        } else if (product.imagen_principal) {
          productImage = product.imagen_principal;
        } else {
          productImage = 'assets/images/thumbs/product-default.png';
        }

        // Obtener productos sugeridos (primeros 3 productos diferentes al actual)
        const suggestedProducts = this.productosFiltrados
          .filter(p => p.id !== product.id)
          .slice(0, 3);

        // Mostrar notificación llamativa estilo Coolbox
        this.cartNotificationService.showProductAddedNotification(
          product.name || product.title || product.nombre,
          Number(product.precio_venta || product.precio || 0),
          productImage,
          1,
          suggestedProducts
        );
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo agregar el producto al carrito. Revisa el stock disponible.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
        });
      }
    });
  }

  agregarAlCarrito(producto: any): void {
    if (producto.stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        icon: 'warning',
        confirmButtonColor: '#dc3545',
      });
      return;
    }

    this.cartService.addToCart(producto, 1).subscribe({
      next: () => {
        // Preparar imagen del producto
        const productImage = producto.imagen_principal || 'assets/images/thumbs/product-default.png';

        // Obtener productos sugeridos (otros productos del banner)
        const suggestedProducts = (this.bannerOfertaActivo?.productos || [])
          .filter(p => p.id !== producto.id)
          .slice(0, 3);

        // Mostrar notificación
        this.cartNotificationService.showProductAddedNotification(
          producto.nombre,
          Number(producto.precio_con_descuento || producto.precio),
          productImage,
          1,
          suggestedProducts
        );
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo agregar el producto al carrito. Revisa el stock disponible.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
        });
      }
    });
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

    // ✅ ACTUALIZAR CACHE
    if (isToggled) {
      this.wishlistState.add(product.id);
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
      this.wishlistState.delete(product.id);
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

  // ✅ NUEVO MÉTODO: Inicializar estado de wishlist
  private inicializarWishlistState(): void {
    const wishlistItems = this.wishlistService.getCurrentItems();
    this.wishlistState.clear();
    wishlistItems.forEach(item => {
      this.wishlistState.add(item.producto_id);
    });
  }

  // ✅ NUEVO MÉTODO: Verificar si un producto está en wishlist (con cache)
  isInWishlist(productoId: number): boolean {
    return this.wishlistState.has(productoId);
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
    this.bannerFlashSalesService.getActivos().subscribe({
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

  cargarBannerOfertaActivo(): void {
    this.bannerOfertaService.getBannerActivo().subscribe({
      next: (banner) => {
        if (this.debugMode) {
          console.log('✅ Banner Oferta activo cargado:', banner);
        }
        this.bannerOfertaActivo = banner;
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error.status !== 404) {
          console.error('Error al cargar banner oferta:', error);
        }
        // Si es 404, simplemente no hay banner activo (normal)
        this.bannerOfertaActivo = null;
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

  // ✅ MÉTODO PARA HOVER EFFECT EN BANNERS
  onBannerHover(event: any, isHovering: boolean): void {
    const bannerLink = event.currentTarget as HTMLElement;
    const img = bannerLink.querySelector('img') as HTMLImageElement;
    const overlay = bannerLink.querySelector('.banner-overlay') as HTMLElement;

    if (isHovering) {
      // Hover IN
      bannerLink.style.transform = 'scale(1.02)';
      bannerLink.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      if (img) img.style.transform = 'scale(1.05)';
      if (overlay) overlay.style.background = 'rgba(0,0,0,0.1)';
    } else {
      // Hover OUT
      bannerLink.style.transform = 'scale(1)';
      bannerLink.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      if (img) img.style.transform = 'scale(1)';
      if (overlay) overlay.style.background = 'rgba(0,0,0,0)';
    }
  }

 

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
    arrows: false, // Sin flechas porque se mueve solo con autoplay
    draggable: true,
    infinite: true,
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

        // Forzar detección de cambios y reinicializar sliders
        this.cdr.detectChanges();
        if (this.isBrowser) {
          setTimeout(() => {
            this.cdr.detectChanges();
            setTimeout(() => this.reinicializarSliders(), 500);
          }, 200);
        }

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

  cargarProductosMasVendidos(): void {
    this.isLoadingProductosMasVendidos = true;
    this.almacenService.obtenerProductosDestacados().subscribe({
      next: (productos) => {
        this.productosMasVendidos = productos.map((producto: any) => ({
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

        this.isLoadingProductosMasVendidos = false;

        // Forzar detección de cambios y reinicializar sliders
        this.cdr.detectChanges();
        if (this.isBrowser) {
          setTimeout(() => {
            this.cdr.detectChanges();
            setTimeout(() => this.reinicializarSliders(), 500);
          }, 200);
        }

        if (this.debugMode) {
          console.log('✅ Productos más vendidos cargados:', productos);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos más vendidos:', error);
        this.isLoadingProductosMasVendidos = false;
        this.productosMasVendidos = [];
      },
    });
  }

  // ✅ MÉTODOS PARA CAROUSEL DE FLASH SALES
  getFlashSalesVisibles(): BannerFlashSale[] {
    const start = this.flashSalesCurrentPage * this.flashSalesPerPage;
    const end = start + this.flashSalesPerPage;
    return this.flashSalesActivas.slice(start, end);
  }

  anteriorFlashSale(): void {
    if (this.flashSalesCurrentPage > 0) {
      this.flashSalesCurrentPage--;
    }
  }

  siguienteFlashSale(): void {
    const maxPage = Math.ceil(this.flashSalesActivas.length / this.flashSalesPerPage) - 1;
    if (this.flashSalesCurrentPage < maxPage) {
      this.flashSalesCurrentPage++;
    }
  }
  // ✅ FUNCIONES PARA NAVEGAR EN OFERTAS ESPECIALES
anteriorOfertaEspecial(): void {
  if (this.ofertasCarousel) {
    this.ofertasCarousel.slickPrev();
  }
}

siguienteOfertaEspecial(): void {
  if (this.ofertasCarousel) {
    this.ofertasCarousel.slickNext();
  }
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

  // ✅ NUEVO: Método para obtener el link de categoría con slug
  getCategoriaLink(categoria: CategoriaConImagen): string[] {
    const slug = SlugHelper.getSlugFromCategoria({
      nombre: categoria.nombre,
      slug: categoria.slug
    });
    return ['/shop/categoria', slug];
  }

  // ✅ NUEVO: Método para obtener el link de producto con slug
  getProductLink(producto: any): string[] {
    // Generar slug desde el nombre del producto si no existe
    const slug = producto.slug || SlugHelper.generateSlug(producto.nombre);
    // Formato: /product/:id/:slug (el ID va primero para facilitar la búsqueda en el componente de detalles)
    return ['/product', producto.id.toString(), slug];
  }

  // ✅ NUEVO: Método para obtener el link de marca con slug para SEO
  getMarcaLink(slide: BrandSlide): string[] {
    // Usar el slug de la marca si existe, sino generar uno desde el nombre
    const slug = slide.marcaSlug || SlugHelper.generateSlug(slide.marcaNombre || 'marca');
    // Formato: /shop/marca/:slug (ej: /shop/marca/antryx)
    return ['/shop/marca', slug];
  }
}
