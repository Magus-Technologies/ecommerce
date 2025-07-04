// src/app/pages/index/index.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgFor } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink } from '@angular/router';
import { CategoriaPublica, CategoriasPublicasService } from '../../services/categorias-publicas.service';
import { BannersService, Banner, BannerPromocional } from '../../services/banner.service';
import { AlmacenService, MarcaProducto } from '../../services/almacen.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';
import { OfertasService, Oferta, ProductoOferta, Cupon } from '../../services/ofertas.service';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';

interface CategoriaConImagen extends CategoriaPublica {
  img: string;
  title: string;
}

@Component({
  selector: 'app-index',
  imports: [CommonModule, SlickCarouselModule, RouterLink, ChatbotComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements OnInit, OnDestroy, AfterViewInit {

  // ✅ PROPIEDADES PARA MANEJAR INTERVALOS
  private countdownIntervals: { [key: string]: any } = {};
  private isBrowser: boolean;

  slides = [
    { img: "http://placehold.it/350x150/000000" },
    { img: "http://placehold.it/350x150/111111" },
    { img: "http://placehold.it/350x150/333333" },
    { img: "http://placehold.it/350x150/666666" }
  ];

  slideConfig = {
    slidesToShow: 1, 
    slidesToScroll: 1, 
    arrows: true,
    autoplay: true,          
    autoplaySpeed: 4000,      
    speed: 800,           
    dots: false,
    infinite: true,           
    pauseOnHover: true, 
    fade: false, 
    cssEase:'ease-in-out',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: true,
          autoplay: true,
        }
      }
    ]
  };

  breakpoint(e: any) {
    console.log('breakpoint');
  }

  afterChange(e: any) {
    console.log('afterChange');
  }

  beforeChange(e: any) {
    console.log('beforeChange');
  }

  slickInit(e: any) {
    console.log('slick initialized');
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
        }
      },
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 8,
        }
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 6,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 359,
        settings: {
          slidesToShow: 1,
        }
      },
    ]
  };

  promotionalBanners: BannerPromocional[] = [];
  isLoadingPromotionalBanners = false;

  // ✅ PROPIEDADES PARA OFERTAS DINÁMICAS
  ofertasActivas: Oferta[] = [];
  flashSalesActivas: Oferta[] = [];
  productosEnOferta: ProductoOferta[] = [];
  cuponesActivos: Cupon[] = [];
  isLoadingOfertas = false;

  cargarBannersPromocionales(): void {
    this.isLoadingPromotionalBanners = true;
    this.bannersService.obtenerBannersPromocionalesPublicos().subscribe({
      next: (banners) => {
        this.promotionalBanners = banners;
        this.isLoadingPromotionalBanners = false;
      },
      error: (error) => {
        console.error('Error al cargar banners promocionales:', error);
        this.isLoadingPromotionalBanners = false;
        this.promotionalBanners = [];
      }
    });
  }
  
  products = [
    {
      id: 1,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img26.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 50
    },
    {
      id: 2,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img27.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 30
    },
    {
      id: 3,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img28.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 20
    },
    {
      id: 4,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img29.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 40
    },
    {
      id: 5,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img30.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 25
    },
    {
      id: 6,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img13.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 35
    },
    {
      id: 7,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/product-img3.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35,
      stock: 15
    },

  ];

  productSlideConfig = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#product-one-next',
    prevArrow: '#product-one-prev',
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          arrows: false,
        }
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 5,
          arrows: false,
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 4,
          arrows: false,
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          arrows: false,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
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
    ]
  };

  recomandedProducts = [
    {
      id: 8,
      title: 'C-500 Antioxidant Protect Dietary Supplement',
      store: 'Lucky Supermarket',
      image: 'assets/images/thumbs/product-img7.png',
      price: '$14.99',
      originalPrice: '$28.99',
      rating: 4.8,
      badge: null,
      badgeClass: '',
      reviewCount: 17,
      stock: 45
    },
    {
      id: 9,
      title: "Marcel's Modern Pantry Almond Unsweetened",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img8.png",
      price: "$14.99",
      originalPrice: "$28.99",
      rating: 4.8,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600 px-8 py-4 text-sm text-white",
      reviewCount: 17,
      stock: 22
    },
    {
      id: 10,
      title: "O Organics Milk, Whole, Vitamin D",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img9.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600 px-8 py-4 text-sm text-white",
      stock: 60
    },
    // ... más productos con stock
  ];

  // ✅ CONSTRUCTOR ACTUALIZADO CON PLATFORM_ID Y ChangeDetectorRef
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoriasPublicasService: CategoriasPublicasService,
    private bannersService: BannersService,
    private almacenService: AlmacenService,
    private cartService: CartService,
    private ofertasService: OfertasService,
    private cdr: ChangeDetectorRef
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

  // ✅ NUEVO: Limpiar intervalos al destruir el componente
  ngOnDestroy(): void {
    if (this.isBrowser) {
      Object.values(this.countdownIntervals).forEach(interval => {
        if (interval) {
          clearInterval(interval);
        }
      });
    }
  }

  cargarCategoriasPublicas(): void {
    this.isLoadingCategorias = true;
    this.categoriasPublicasService.obtenerCategoriasPublicas().subscribe({
      next: (categorias) => {
        this.featureItems = categorias.map(cat => ({
          ...cat,
          img: cat.imagen_url || 'assets/images/thumbs/feature-img10.png',
          title: cat.nombre
        })) as CategoriaConImagen[];
        this.isLoadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías públicas:', error);
        this.isLoadingCategorias = false;
      }
    });
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
      }
    });
  }
  
  cargarMarcasDinamicas(): void {
    this.isLoadingMarcas = true;
    this.almacenService.obtenerMarcasPublicas().subscribe({
      next: (marcas) => {
        this.brandSlides[0].slides = marcas.map((marca, index) => ({
          class: "brand-item",
          dataAos: "zoom-in",
          dataAosDuration: 200 + (index * 200),
          imgSrc: marca.imagen_url || 'assets/images/thumbs/brand-default.png',
          imgAlt: marca.nombre
        }));
        this.isLoadingMarcas = false;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.isLoadingMarcas = false;
      }
    });
  }

  addToCart(product: any): void {
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const success = this.cartService.addToCart(product, 1);
    
    if (success) {
      Swal.fire({
        title: '¡Producto agregado!',
        text: `${product.name || product.title || product.nombre} ha sido agregado a tu carrito`,
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

  cargarOfertasActivas(): void {
    this.isLoadingOfertas = true;
    this.ofertasService.obtenerOfertasPublicas().subscribe({
      next: (ofertas) => {
        console.log('✅ Ofertas cargadas:', ofertas);
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
      }
    });
  }

  cargarFlashSales(): void {
    this.ofertasService.obtenerFlashSales().subscribe({
      next: (flashSales) => {
        console.log('✅ Flash Sales cargadas:', flashSales);
        this.flashSalesActivas = flashSales;
        this.cdr.detectChanges();
        
        // ✅ INICIALIZAR COUNTDOWNS DESPUÉS DE CARGAR DATOS
        if (this.isBrowser) {
          setTimeout(() => this.inicializarCountdowns(), 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar flash sales:', error);
      }
    });
  }

  cargarProductosEnOferta(): void {
    this.ofertasService.obtenerProductosEnOferta().subscribe({
      next: (productos) => {
        console.log('✅ Productos en oferta cargados:', productos);
        this.productosEnOferta = productos;
        this.cdr.detectChanges();
        
        // ✅ INICIALIZAR COUNTDOWNS DESPUÉS DE CARGAR DATOS
        if (this.isBrowser) {
          setTimeout(() => this.inicializarCountdowns(), 1000);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos en oferta:', error);
      }
    });
  }

  cargarCuponesActivos(): void {
    this.cuponesActivos = [
      {
        id: 1,
        codigo: 'BIENVENIDO20',
        titulo: 'Bienvenido - 20% de descuento',
        tipo_descuento: 'porcentaje',
        valor_descuento: 20,
        compra_minima: 100
      },
      {
        id: 2,
        codigo: 'ENVIOGRATIS',
        titulo: 'Envío gratis',
        tipo_descuento: 'cantidad_fija',
        valor_descuento: 15,
        compra_minima: 50
      }
    ];
  }

  // ✅ MEJORADA: Inicializar todos los countdowns
  inicializarCountdowns(): void {
    if (!this.isBrowser) {
      console.log('🚫 No estamos en el navegador, saltando countdowns');
      return;
    }

    console.log('🕒 Inicializando countdowns...');
    console.log('Flash Sales:', this.flashSalesActivas);
    console.log('Productos en oferta:', this.productosEnOferta);
    
    // ✅ LIMPIAR INTERVALOS ANTERIORES
    Object.values(this.countdownIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    this.countdownIntervals = {};
    
    // Countdown para Flash Sales
    this.flashSalesActivas.forEach(sale => {
      if (sale.fecha_fin) {
        const countdownId = `countdown-flash-${sale.id}`;
        console.log(`🔄 Inicializando countdown para flash sale ${sale.id}:`, sale.fecha_fin);
        this.inicializarCountdown(countdownId, sale.fecha_fin);
      }
    });

    // Countdown para productos en oferta que son flash sales
    this.productosEnOferta.forEach(producto => {
      if (producto.es_flash_sale && producto.fecha_fin_oferta) {
        const countdownId = `countdown-producto-${producto.id}`;
        console.log(`🔄 Inicializando countdown para producto ${producto.id}:`, producto.fecha_fin_oferta);
        this.inicializarCountdown(countdownId, producto.fecha_fin_oferta);
      }
    });

    // ✅ COUNTDOWN ESTÁTICOS CON FECHAS FUTURAS VÁLIDAS
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 30); // 30 días en el futuro
    
    this.inicializarCountdown('countdown4', fechaFutura.toISOString());
    this.inicializarCountdown('countdown26', fechaFutura.toISOString());
  }

  // ✅ MEJORADA: Inicializar countdown individual
  inicializarCountdown(elementId: string, fechaFin: string): void {
    if (!this.isBrowser) {
      return;
    }

    // ✅ ESPERAR A QUE EL ELEMENTO ESTÉ EN EL DOM
    const waitForElement = (selector: string, maxAttempts: number = 10): Promise<HTMLElement | null> => {
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
        console.warn(`⚠️ Elemento countdown no encontrado después de esperar: ${elementId}`);
        return;
      }

      console.log(`🕒 Inicializando countdown para ${elementId} hasta ${fechaFin}`);

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
          console.warn(`⚠️ La fecha de fin ya pasó para ${elementId}: ${fechaFin}`);
          // Establecer una fecha futura por defecto
          endDate = now + (24 * 60 * 60 * 1000); // 24 horas en el futuro
        }
        
      } catch (error) {
        console.error(`❌ Error al parsear fecha para countdown ${elementId}: ${fechaFin}`, error);
        // Fecha por defecto: 24 horas en el futuro
        endDate = new Date().getTime() + (24 * 60 * 60 * 1000);
      }

      const updateCountdown = () => {
        const now = new Date().getTime();
        const timeLeft = endDate - now;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          // ✅ BUSCAR ELEMENTOS CON MÚLTIPLES SELECTORES
          const daysElement = element.querySelector('.days') || element.querySelector('[class*="days"]');
          const hoursElement = element.querySelector('.hours') || element.querySelector('[class*="hours"]');
          const minutesElement = element.querySelector('.minutes') || element.querySelector('[class*="minutes"]');
          const secondsElement = element.querySelector('.seconds') || element.querySelector('[class*="seconds"]');

          if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
          if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
          if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
          if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');

          console.log(`⏰ ${elementId}: ${days}d ${hours}h ${minutes}m ${seconds}s`);
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
          }

          console.log(`⏰ ${elementId}: EXPIRADO`);
        }
      };

      // Ejecutar inmediatamente
      updateCountdown();

      // Configurar intervalo para actualizar cada segundo
      this.countdownIntervals[elementId] = setInterval(updateCountdown, 1000);
    });
  }

  copiarCupon(codigo: string): void {
    if (!this.isBrowser) return;

    navigator.clipboard.writeText(codigo).then(() => {
      Swal.fire({
        title: '¡Cupón copiado!',
        text: `El código "${codigo}" ha sido copiado al portapapeles`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }).catch(() => {
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
        position: 'top-end'
      });
    });
  }

  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/thumbs/feature-img10.png';
  }

  // venta flash
  flashSales = [
    {
      title: 'Televisión inteligente X-Connect',
      description: 'Tiempo restante hasta el final de la oferta.',
      backgroundImage: 'assets/images/bg/flash-sale-bg1.png',
      buttonClass: 'btn btn-main d-inline-flex align-items-center rounded-pill gap-8 mt-24',
      countdownId: 'countdown1',
      aosDuration: 600,
      routerLink: ['shop'],
      contentClass: 'ms-sm-auto',
      countdownStyleClass: ''
    },
    {
      title: 'Caja combinada de verduras',
      description: 'Tiempo restante hasta el final de la oferta.',
      backgroundImage: 'assets/images/bg/flash-sale-bg2.png',
      buttonClass: 'btn bg-success-600 hover-bg-success-700 d-inline-flex align-items-center rounded-pill gap-8 mt-24',
      countdownId: 'countdown2',
      aosDuration: 1000,
      routerLink: ['shop'],
      contentClass: '',
      countdownStyleClass: 'bg-main-600 text-white'
    }
  ];

  // offers
  offers = [
    {
      bgImage: 'assets/images/bg/offer-bg-img1.png',
      logo: 'assets/images/thumbs/offer-logo.png',
      title: '$5 off your first order',
      delivery: 'Delivery by 6:15am',
      expire: 'Expire Aug 5',
      expireClass: 'text-xs text-heading',
      aosDuration: 600,
      btnClass: 'mt-16 btn bg-success-600 hover-text-white hover-bg-success-700 text-white fw-medium d-inline-flex align-items-center rounded-pill gap-8'
    },
    {
      bgImage: 'assets/images/bg/offer-bg-img2.png',
      logo: 'assets/images/thumbs/offer-logo.png',
      title: '$5 off your first order',
      delivery: 'Delivery by 6:15am',
      expire: 'Expire Aug 5',
      expireClass: 'text-sm text-success-600',
      aosDuration: 800,
      btnClass: 'mt-16 btn bg-white hover-text-white hover-bg-main-800 text-heading fw-medium d-inline-flex align-items-center rounded-pill gap-8'
    }
  ];

  productSlides = [
    {
      imgSrc: "assets/images/thumbs/short-product-img1.png",
      alt: "Product 1",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img2.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img3.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img4.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    }
  ];

  topProductSlides = [
    {
      imgSrc: "assets/images/thumbs/short-product-img5.png",
      alt: "Product 1",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img6.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img7.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img8.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    }
  ];

  onProductSlides = [
    {
      imgSrc: "assets/images/thumbs/short-product-img5.png",
      alt: "Product 1",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img6.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img7.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img8.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Hortalizas en floretes de brócoli de Taylor Farms",
      price: "$1500.00"
    }
  ];

  // best  deal product
  bestProduct = [
    {
      id: 1,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/best-sell1.png',
      originalPrice: 28.99,
      discountedPrice: 14.99,
      rating: 4.8,
      reviewsCount: 17,
      storeName: 'Lucky Supermarket',
      soldCount: 18,
      totalStock: 35,
      soldPercentage: 35,
      duration: 200
    },
    {
      id: 2,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/best-sell2.png',
      originalPrice: 28.99,
      discountedPrice: 14.99,
      rating: 4.8,
      reviewsCount: 17,
      storeName: 'Lucky Supermarket',
      soldCount: 18,
      totalStock: 35,
      soldPercentage: 35,
      duration: 400
    },
    {
      id: 3,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/best-sell3.png',
      originalPrice: 28.99,
      discountedPrice: 14.99,
      rating: 4.8,
      reviewsCount: 17,
      storeName: 'Lucky Supermarket',
      soldCount: 18,
      totalStock: 35,
      soldPercentage: 35,
      duration: 400
    },
    {
      id: 4,
      name: 'Hortalizas en floretes de brócoli de Taylor Farms',
      image: 'assets/images/thumbs/best-sell4.png',
      originalPrice: 28.99,
      discountedPrice: 14.99,
      rating: 4.8,
      reviewsCount: 17,
      storeName: 'Lucky Supermarket',
      soldCount: 18,
      totalStock: 35,
      soldPercentage: 35,
      duration: 400
    },

  ];

  // hot product
  hotPoducts = [
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img26.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img27.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 400,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img28.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 600,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img29.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 800,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img30.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 800,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img13.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 800,
      total: 35
    },
    {
      name: "Hortalizas en floretes de brócoli de Taylor Farms",
      image: "assets/images/thumbs/product-img3.png",
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: "17k",
      sold: 18,
      fadeDuration: 800,
      total: 35
    }

  ]

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
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          arrows: false,
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          arrows: false,
        }
      },
    ]
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

  // brand slider
  brandSlides = [{
    "carouselConfig": {
      "class": "brand-slider arrow-style-two",
      "configBinding": "BrandSlideConfig"
    },
    "slides": [
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 200,
        "imgSrc": "assets/images/thumbs/brand-img1.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 400,
        "imgSrc": "assets/images/thumbs/brand-img2.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 600,
        "imgSrc": "assets/images/thumbs/brand-img3.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 800,
        "imgSrc": "assets/images/thumbs/brand-img4.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 1000,
        "imgSrc": "assets/images/thumbs/brand-img5.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 1200,
        "imgSrc": "assets/images/thumbs/brand-img6.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 1400,
        "imgSrc": "assets/images/thumbs/brand-img7.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 1600,
        "imgSrc": "assets/images/thumbs/brand-img8.png",
        "imgAlt": ""
      },
      {
        "class": "brand-item",
        "dataAos": "zoom-in",
        "dataAosDuration": 1800,
        "imgSrc": "assets/images/thumbs/brand-img3.png",
        "imgAlt": ""
      }
    ]
  }];

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
        }
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 6,
          arrows: false,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
          arrows: false,
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 4,
          arrows: false,
        }
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 3,
          arrows: false,
        }
      },
      {
        breakpoint: 359,
        settings: {
          slidesToShow: 2,
          arrows: false,
        }
      },
    ]
  };

}