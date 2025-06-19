// src/app/pages/index/index.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink } from '@angular/router';
import { CategoriaPublica, CategoriasPublicasService } from '../../services/categorias-publicas.service';
import { BannersService, Banner, BannerPromocional } from '../../services/banner.service';
import { AlmacenService, MarcaProducto } from '../../services/almacen.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

interface CategoriaConImagen extends CategoriaPublica {
  img: string;
  title: string;
}

@Component({
  selector: 'app-index',
  imports: [CommonModule, SlickCarouselModule, RouterLink],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements OnInit {

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

  // ✅ ACTUALIZAR CONSTRUCTOR PARA INYECTAR EL SERVICIO DE BANNERS
  constructor(
    private categoriasPublicasService: CategoriasPublicasService,
    private bannersService: BannersService, // ✅ NUEVO SERVICIO
    private almacenService: AlmacenService,
    private cartService: CartService 
  ) { }

  ngOnInit(): void {
    this.cargarCategoriasPublicas();
    this.cargarBannersDinamicos(); // ✅ NUEVA LLAMADA
    this.cargarBannersPromocionales();
    this.cargarMarcasDinamicas(); // Cargar marcas dinámicas
  }

  cargarCategoriasPublicas(): void {
    this.isLoadingCategorias = true;
    this.categoriasPublicasService.obtenerCategoriasPublicas().subscribe({
      next: (categorias) => {
        // ✅ MAPEAR CON TIPO CORRECTO
        this.featureItems = categorias.map(cat => ({
          ...cat,
          img: cat.imagen_url || 'assets/images/thumbs/feature-img-default.png',
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

  // ✅ NUEVO MÉTODO PARA CARGAR BANNERS
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
        // En caso de error, usar banners estáticos como fallback
        this.bannersDinamicos = [];
      }
    });
  }
  
  cargarMarcasDinamicas(): void {
    this.isLoadingMarcas = true;
    this.almacenService.obtenerMarcasPublicas().subscribe({
      next: (marcas) => {
        // Mapear las marcas al formato que espera el slider
        this.brandSlides[0].slides = marcas.map((marca, index) => ({
          class: "brand-item",
          dataAos: "zoom-in",
          dataAosDuration: 200 + (index * 200), // Incrementar duración
          imgSrc: marca.imagen_url || 'assets/images/thumbs/brand-default.png',
          imgAlt: marca.nombre
        }));
        this.isLoadingMarcas = false;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.isLoadingMarcas = false;
        // Mantener marcas estáticas como fallback
      }
    });
  }

  // ✅ MÉTODO MEJORADO PARA AGREGAR AL CARRITO
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
        text: `${product.name || product.title} ha sido agregado a tu carrito`,
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

  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/thumbs/feature-img-default.png';
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