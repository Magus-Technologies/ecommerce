import { Component , OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgModule } from '@angular/core';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { FormsModule } from '@angular/forms'; 
import { ShippingComponent } from '../../component/shipping/shipping.component';



@Component({
  selector: 'app-cart',
  imports: [CommonModule,RouterLink,FormsModule,BreadcrumbComponent,ShippingComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  products = [
    {
      id: 1,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img1.png",
      rating: 4.8,
      reviews: 128,
      price: "$125.00",
      quantity: 1,
      buttons: [
        { label: "Camera", link: "cart" },
        { label: "Videos", link: "cart" }
      ]
    },
    {
      id: 2,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img2.png",
      rating: 4.8,
      reviews: 128,
      price: "$125.00",
      quantity: 1,
      buttons: [
        { label: "Camera", link: "cart" },
        { label: "Videos", link: "cart" }
      ]
    },
    {
      id: 3,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img3.png",
      rating: 4.8,
      reviews: 128,
      price: "$125.00",
      quantity: 1,
      buttons: [
        { label: "Camera", link: "cart" },
        { label: "Videos", link: "cart" }
      ]
    },
    {
      id: 4,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img4.png",
      rating: 4.8,
      reviews: 128,
      price: "$125.00",
      quantity: 1,
      buttons: [
        { label: "Camera", link: "cart" },
        { label: "Videos", link: "cart" }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  removeProduct(productId: number): void {
    this.products = this.products.filter(product => product.id !== productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    const product = this.products.find(product => product.id === productId);
    if (product) {
      product.quantity = quantity;
    }
  }

}
