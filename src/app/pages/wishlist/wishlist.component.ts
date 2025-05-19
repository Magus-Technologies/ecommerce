import { Component ,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';



@Component({
  selector: 'app-wishlist',
  imports: [CommonModule,RouterLink,BreadcrumbComponent,ShippingComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  products = [
    {
      image: 'assets/images/thumbs/product-two-img1.png',
      productLink: 'product-details',
      productName: 'Taylor Farms Broccoli Florets Vegetables',
      rating: 4.8,
      reviews: 128,
      price: '$125.00',
      stockStatus: 'In Stock',
      cartLink: 'cart'
    },
    {
      image: 'assets/images/thumbs/product-two-img3.png',
      productLink: 'product-details',
      productName: 'Smart Phone With Intel Celeron',
      rating: 4.8,
      reviews: 128,
      price: '$125.00',
      stockStatus: 'In Stock',
      cartLink: 'cart'
    },
    {
      image: 'assets/images/thumbs/product-two-img14.png',
      productLink: 'product-details',
      productName: 'HP Chromebook With Intel Celeron',
      rating: 4.8,
      reviews: 128,
      price: '$125.00',
      stockStatus: 'In Stock',
      cartLink: 'cart'
    },
    {
      image: 'assets/images/thumbs/product-two-img2.png',
      productLink: 'product-details',
      productName: 'Smart Watch With Intel Celeron',
      rating: 4.8,
      reviews: 128,
      price: '$125.00',
      stockStatus: 'In Stock',
      cartLink: 'cart'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
