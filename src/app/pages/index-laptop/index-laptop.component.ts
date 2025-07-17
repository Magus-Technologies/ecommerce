import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import this
import { NgFor } from '@angular/common'; // (Optional: For tree-shaking optimization)
// Import your library
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-index-laptop',
  imports: [CommonModule, SlickCarouselModule, RouterLink],
  templateUrl: './index-laptop.component.html',
  styleUrl: './index-laptop.component.scss'
})
export class IndexLaptopComponent {

  // category 
  categories = [
    {
      name: 'Computers & Laptop',
      icon: 'assets/images/icon/category-icon1.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Smartphones & Gadget',
      icon: 'assets/images/icon/category-icon2.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Gaming & Television',
      icon: 'assets/images/icon/category-icon3.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Office Equipment',
      icon: 'assets/images/icon/category-icon4.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'SmartWatches',
      icon: 'assets/images/icon/category-icon5.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Headphone & Music',
      icon: 'assets/images/icon/category-icon6.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Camera & Video',
      icon: 'assets/images/icon/category-icon7.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Accessiories & Gadget',
      icon: 'assets/images/icon/category-icon8.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "New",
      badgeClass: "bg-paste",
    },
    {
      name: 'VR Technology',
      icon: 'assets/images/icon/category-icon9.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Studio Equipment',
      icon: 'assets/images/icon/category-icon10.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    },
    {
      name: 'Trending Products',
      icon: 'assets/images/icon/category-icon11.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "New",
      badgeClass: "bg-danger-600",
    },
    {
      name: 'Top Offer Products',
      icon: 'assets/images/icon/category-icon12.png',
      subcategories: ['Samsung', 'Iphone', 'Vivo', 'Oppo', 'Itel', 'Realme'],
      badge: "",
      badgeClass: "",
    }
  ];


  // banner slider 
  banners = [
    {
      subtitle: 'Starting at only',
      price: '$250',
      title: 'Get The Sound You Love For Less',
      buttonText: 'Shop Now',
      buttonIcon: 'ph-shopping-cart-simple',
      image: 'assets/images/thumbs/banner-two-img.png'
    },
    {
      subtitle: 'Hot Deal Starts',
      price: '$199',
      title: 'Experience Premium Quality Audio',
      buttonText: 'Buy Now',
      buttonIcon: 'ph-shopping-cart-simple',
      image: 'assets/images/thumbs/banner-two-img.png'
    },
    {
      subtitle: 'Limited Time Offer',
      price: '$149',
      title: 'Unbeatable Prices On Headphones',
      buttonText: 'Check Deals',
      buttonIcon: 'ph-shopping-cart-simple',
      image: 'assets/images/thumbs/banner-two-img.png'
    }
  ];
  banneSlider = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1500,
    dots: true,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    fade: true,
    cssEase: 'linear',
    nextArrow: '#banner-next',
    prevArrow: '#banner-prev',
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }
  // deals week slider
  dealsProduct = [
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img1.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 200,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35,
      badge: "",
      badgeClass: "",
      progress: 75
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img2.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 400,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "Best Sale",
      badgeClass: "product-card__badge bg-success-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0"
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img3.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 600,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "",
      badgeClass: ""
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img4.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 800,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "Sale 50%",
      badgeClass: "product-card__badge bg-danger-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0"
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img5.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 1000,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "Best Sale",
      badgeClass: "product-card__badge bg-success-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0"
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img6.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 1200,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "",
      badgeClass: ""
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img9.png",
      price: 14.99,
      originalPrice: 28.99,
      unit: "/Qty",
      fadeDuration: 1400,
      rating: 4.8,
      reviewCount: "17k",
      sold: 18,
      total: 35,
      badge: "New",
      badgeClass: "product-card__badge bg-warning-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0"
    },
  ]

  dealsWeekSlider = {
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
    nextArrow: '#deal-week-next',
    prevArrow: '#deal-week-prev',
    responsive: [
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 5,
          arrows: false,
        }
      },
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
  }

  // brand slider 
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

  // top selling product
  topSellingProduct = [
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img7.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      fadeDuration: 200,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img8.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      fadeDuration: 400,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600 px-8 py-4 text-sm text-white"
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img9.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      fadeDuration: 600,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img10.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      fadeDuration: 800,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35
    },
    {
      name: "Taylor Farms Broccoli Florets Vegetables",
      store: "Lucky Supermarket",
      image: "assets/images/thumbs/product-two-img8.png",
      price: "$14.99",
      originalPrice: "$28.99",
      unit: "/Qty",
      fadeDuration: 1000,
      rating: 4.8,
      reviewCount: "17K",
      sold: 18,
      total: 35,
      badge: "Best Sale",
      badgeClass: "bg-main-600 px-8 py-4 text-sm text-white"
    }
  ]
  topSellingSliderConfig = {

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
    nextArrow: '#top-selling-next',
    prevArrow: '#top-selling-prev',
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
  }

  // feature product 

  featureSlider = {
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: '#featured-products-next',
    prevArrow: '#featured-products-prev',
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
          arrows: false,
        }
      }
    ]
  }

  // recomanded slider 
  recomandedProduct = [

    {
      badge: "Best Seller",
      badgeColor: "bg-tertiary-600",
      image: "assets/images/thumbs/product-two-img1.png",
      discount: "19%OFF",
      title: "Instax Mini 12 Instant Film Camera - Green",
      rating: 4.8,
      reviews: "12K",
      fulfilledBy: "Marketpro",
      oldPrice: "$28.99",
      newPrice: "$14.99",
      unit: "/Qty",
      deliveryDate: "Aug 02",
      fadeDuration: 400
    },
    {
      badge: "New",
      badgeColor: "bg-warning-600",
      image: "assets/images/thumbs/product-two-img2.png",
      discount: "19%OFF",
      title: "Instax Mini 12 Instant Film Camera - Green",
      rating: 4.8,
      reviews: "12K",
      fulfilledBy: "Marketpro",
      oldPrice: "$28.99",
      newPrice: "$14.99",
      unit: "/Qty",
      deliveryDate: "Aug 02",
      fadeDuration: 600
    },
    {
      badge: "Sale 50%",
      badgeColor: "bg-danger-600",
      image: "assets/images/thumbs/product-two-img3.png",
      discount: "19%OFF",
      title: "Instax Mini 12 Instant Film Camera - Green",
      rating: 4.8,
      reviews: "12K",
      fulfilledBy: "Marketpro",
      oldPrice: "$28.99",
      newPrice: "$14.99",
      unit: "/Qty",
      deliveryDate: "Aug 02",
      fadeDuration: 800
    },
    {
      badge: "Sold",
      badgeColor: "bg-success-600",
      image: "assets/images/thumbs/product-two-img4.png",
      discount: "19%OFF",
      title: "Instax Mini 12 Instant Film Camera - Green",
      rating: 4.8,
      reviews: "12K",
      fulfilledBy: "Marketpro",
      oldPrice: "$28.99",
      newPrice: "$14.99",
      unit: "/Qty",
      deliveryDate: "Aug 02",
      fadeDuration: 1000
    },
    {
      badge: "New",
      badgeColor: "bg-warning-600",
      image: "assets/images/thumbs/product-two-img2.png",
      discount: "19%OFF",
      title: "Instax Mini 12 Instant Film Camera - Green",
      rating: 4.8,
      reviews: "12K",
      fulfilledBy: "Marketpro",
      oldPrice: "$28.99",
      newPrice: "$14.99",
      unit: "/Qty",
      deliveryDate: "Aug 02",
      fadeDuration: 1200
    }


  ]
  recomanderSlider = {
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
    nextArrow: '#recommended-next',
    prevArrow: '#recommended-prev',
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
  }

  // topBrandImages
  topBrandImages: string[] = [
    'assets/images/thumbs/top-brand-img1.png',
    'assets/images/thumbs/top-brand-img2.png',
    'assets/images/thumbs/top-brand-img3.png',
    'assets/images/thumbs/top-brand-img4.png',
    'assets/images/thumbs/top-brand-img5.png',
    'assets/images/thumbs/top-brand-img6.png',
    'assets/images/thumbs/top-brand-img7.png',
    'assets/images/thumbs/top-brand-img8.png',
    'assets/images/thumbs/top-brand-img5.png'
  ];

  // Popular product
  popularProducts = [
    {
      image: 'assets/images/thumbs/popular-img1.png',
      title: 'Headphone & Earphone',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img2.png',
      title: 'TV & Smart Home',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img3.png',
      title: 'Video Games',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img4.png',
      title: 'Computer & Tablets',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img5.png',
      title: 'Car & GPS',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img6.png',
      title: 'Camera & Video',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img7.png',
      title: 'Kitchen Appliance',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    },
    {
      image: 'assets/images/thumbs/popular-img8.png',
      title: 'Phone & Accessories',
      tags: ['Wired Headphones', 'Over-Ear Headphone', 'Sports Headphone', 'Earbud Headphone'],
      route: 'product-details'
    }
  ];


}
