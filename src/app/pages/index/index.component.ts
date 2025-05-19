import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import this
import { NgFor } from '@angular/common'; // (Optional: For tree-shaking optimization)
// Import your library
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-index',
  imports: [CommonModule, SlickCarouselModule, RouterLink],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {

  slides = [
    { img: "http://placehold.it/350x150/000000" },
    { img: "http://placehold.it/350x150/111111" },
    { img: "http://placehold.it/350x150/333333" },
    { img: "http://placehold.it/350x150/666666" }
  ];
  slideConfig = {
    "slidesToShow": 1, "slidesToScroll": 1, arrows: true,
    prevArrow: '#banner-prev',
    nextArrow: '#banner-next',
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



  banners = [
    {
      subtitle: 'Save up to 50% off on your first order',
      title: 'Daily Grocery Order and Get <span class="text-main-600">Express</span> Delivery',
      price: '$60.99',
      img: 'assets/images/thumbs/banner-img3.png',
      alt: 'Banner Image 1'
    },
    {
      subtitle: 'Save up to 50% off on your first order',
      title: 'Daily Grocery Order and Get <span class="text-main-600">Express</span> Delivery',
      price: '$60.99',
      img: 'assets/images/thumbs/banner-img1.png',
      alt: 'Banner Image 2'
    }
  ];

  featureItems = [
    { img: 'assets/images/thumbs/feature-img1.png', title: 'Vegetables' },
    { img: 'assets/images/thumbs/feature-img2.png', title: 'Fish & Meats' },
    { img: 'assets/images/thumbs/feature-img3.png', title: 'Desserts' },
    { img: 'assets/images/thumbs/feature-img4.png', title: 'Drinks & Juice' },
    { img: 'assets/images/thumbs/feature-img5.png', title: 'Animals Food' },
    { img: 'assets/images/thumbs/feature-img6.png', title: 'Fresh Fruits' },
    { img: 'assets/images/thumbs/feature-img7.png', title: 'Yummy Candy' },
    { img: 'assets/images/thumbs/feature-img2.png', title: 'Fish & Meats' },
    { img: 'assets/images/thumbs/feature-img8.png', title: 'Dairy & Eggs' },
    { img: 'assets/images/thumbs/feature-img9.png', title: 'Snacks' },
    { img: 'assets/images/thumbs/feature-img10.png', title: 'Frozen Foods' }
  ];
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

  promotionalBanners = [
    {
      title: "Everyday Fresh Meat",
      price: "$60.99",
      image: "assets/images/thumbs/promotional-banner-img1.png",
      link: "shop",
      animationDelay: 400
    },
    {
      title: "Daily Fresh Vegetables",
      price: "$60.99",
      image: "assets/images/thumbs/promotional-banner-img2.png",
      link: "shop",
      animationDelay: 600
    },
    {
      title: "Everyday Fresh Milk",
      price: "$60.99",
      image: "assets/images/thumbs/promotional-banner-img3.png",
      link: "shop",
      animationDelay: 800
    },
    {
      title: "Everyday Fresh Fruits",
      price: null,
      image: "assets/images/thumbs/promotional-banner-img4.png",
      link: "shop",
      animationDelay: 1000
    }
  ];

  products = [
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img26.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img27.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img28.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img29.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img30.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img13.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
    },
    {
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'assets/images/thumbs/product-img3.png',
      price: 14.99,
      oldPrice: 28.99,
      rating: 4.8,
      reviews: '17k',
      sold: 18,
      fadeDuration: 200,
      total: 35
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
      title: 'C-500 Antioxidant Protect Dietary Supplement',
      store: 'Lucky Supermarket',
      image: 'assets/images/thumbs/product-img7.png',
      price: '$14.99',
      originalPrice: '$28.99',
      rating: 4.8,
      badge: null,
      badgeClass: '',
      reviewCount: 17,
    },
    {
      title: "Marcel's Modern Pantry Almond Unsweetened",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img8.png",
      price: "$14.99",
      originalPrice: "$28.99",
      rating: 4.8,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600 px-8 py-4 text-sm text-white",
      reviewCount: 17
    },
    {
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
    },
    {
      title: "Whole Grains and Seeds Organic Bread",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img10.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "Best Sale",
      badgeClass: "bg-info-600 px-8 py-4 text-sm text-white",
    },
    {
      title: "Lucerne Yogurt, Lowfat, Strawberry",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img11.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "",
      badgeClass: ""
    },
    {
      title: "Nature Valley Whole Grain Oats and Honey Protein",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img12.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600"
    },
    {
      title: "C-500 Antioxidant Protect Dietary Supplement",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img13.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "",
      badgeClass: ""
    },
    {
      title: "C-500 Antioxidant Protect Dietary Supplement",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img14.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600 px-8 py-4 text-sm text-white"
    },
    {
      title: "C-500 Antioxidant Protect Dietary Supplement",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img15.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "New",
      badgeClass: "bg-warning-600 px-8 py-4 text-sm text-white"
    },
    {
      title: 'Good & Gather Farmed Atlantic Salmon',
      store: 'Lucky Supermarket',
      image: 'assets/images/thumbs/product-img16.png',
      price: '$14.99',
      originalPrice: '$28.99',
      rating: 4.8,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600",
      reviewCount: 17,
    },
    {
      title: 'Market Pantry 41/50 Raw Tail-Off Large Raw Shrimp',
      store: 'Lucky Supermarket',
      image: 'assets/images/thumbs/product-img17.png',
      price: '$14.99',
      originalPrice: '$28.99',
      rating: 4.8,
      reviewCount: 17,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600"
    },
    {
      title: "Tropicana 100% Juice, Orange, No Pulp",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-img18.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      rating: 4.8,
      reviewCount: 17,
      badge: "New",
      badgeClass: "bg-warning-600 px-8 py-4 text-sm text-white"
    }

  ];

  constructor() { }

  ngOnInit(): void {
  }

  // flashsale
  flashSales = [
    {
      title: 'X-Connect Smart Television',
      description: 'Time remaining until the end of the offer.',
      backgroundImage: 'assets/images/bg/flash-sale-bg1.png',
      buttonClass: 'btn btn-main d-inline-flex align-items-center rounded-pill gap-8 mt-24',
      countdownId: 'countdown1',
      aosDuration: 600,
      routerLink: ['shop'],
      contentClass: 'ms-sm-auto',
      countdownStyleClass: ''
    },
    {
      title: 'Vegetables Combo Box',
      description: 'Time remaining until the end of the offer.',
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
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img2.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img3.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img4.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    }
  ];
  topProductSlides = [
    {
      imgSrc: "assets/images/thumbs/short-product-img5.png",
      alt: "Product 1",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img6.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img7.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img8.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    }
  ];
  onProductSlides = [
    {
      imgSrc: "assets/images/thumbs/short-product-img5.png",
      alt: "Product 1",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img6.png",
      alt: "Product 2",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img7.png",
      alt: "Product 3",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    },
    {
      imgSrc: "assets/images/thumbs/short-product-img8.png",
      alt: "Product 4",
      rating: 4.8,
      ratingCount: "17k",
      title: "Taylor Farms Broccoli Florets Vegetables",
      price: "$1500.00"
    }
  ];
  // best  deal product
  bestProduct = [
    {
      id: 1,
      name: 'Taylor Farms Broccoli Florets Vegetables',
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
      name: 'Taylor Farms Broccoli Florets Vegetables',
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
      name: 'Taylor Farms Broccoli Florets Vegetables',
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
      name: 'Taylor Farms Broccoli Florets Vegetables',
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
    // Add more products here...
  ];

  // hot product
  hotPoducts = [
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
      name: "Taylor Farms Broccoli Florets Vegetables",
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
