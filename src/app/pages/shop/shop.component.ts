import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { identifierName } from '@angular/compiler';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, RouterLink,BreadcrumbComponent,ShippingComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  listview: 'list' | 'grid' = 'grid';

  togglelistview(): void {
    this.listview = this.listview === 'grid' ? 'list' : 'grid';

  }

  // category
  categories = [
    { name: "Mobile & Accessories", count: 12, routerLink: "product-details-two" },
    { name: "Laptop", count: 12, routerLink: "product-details-two" },
    { name: "Electronics", count: 12, routerLink: "product-details-two" },
    { name: "Smart Watch", count: 12, routerLink: "product-details-two" },
    { name: "Storage", count: 12, routerLink: "product-details-two" },
    { name: "Portable Devices", count: 12, routerLink: "product-details-two" },
    { name: "Action Camera", count: 12, routerLink: "product-details-two" },
    { name: "Smart Gadget", count: 12, routerLink: "product-details-two" },
    { name: "Monitor", count: 12, routerLink: "product-details-two" },
    { name: "Smart TV", count: 12, routerLink: "product-details-two" },
    { name: "Camera", count: 12, routerLink: "product-details-two" },
    { name: "Monitor Stand", count: 12, routerLink: "product-details-two" },
    { name: "Headphone", count: 12, routerLink: "product-details-two" }
  ];
  // rating 
  ratings = [
    { rating: 5, progress: 70, total: 124 },
    { rating: 4, progress: 50, total: 52 },
    { rating: 3, progress: 35, total: 12 },
    { rating: 2, progress: 20, total: 5 },
    { rating: 1, progress: 5, total: 2 },
  ];
  // color
  colors = [
    { id: 'color1', name: 'Black', count: 12, class: 'checked-black' },
    { id: 'color2', name: 'Blue', count: 12, class: 'checked-primary' },
    { id: 'color3', name: 'Gray', count: 12, class: 'checked-gray' },
    { id: 'color4', name: 'Green', count: 12, class: 'checked-success' },
    { id: 'color5', name: 'Red', count: 12, class: 'checked-danger' },
    { id: 'color6', name: 'White', count: 12, class: 'checked-white' },
    { id: 'color7', name: 'Purple', count: 12, class: 'checked-purple' }
  ];
  // brands
  brands = [
    { id: 'brand1', name: 'Apple' },
    { id: 'brand2', name: 'Samsung' },
    { id: 'brand3', name: 'Microsoft' },
    { id: 'brand4', name: 'Apple' },
    { id: 'brand5', name: 'HP' },
    { id: 'DELL', name: 'DELL' },
    { id: 'Redmi', name: 'Redmi' }
  ];

  // product 
  products = [
    {
      id: 1,
      image: 'assets/images/thumbs/product-two-img1.png',
      badge: 'Best Sale',
      title: 'Taylor Farms Broccoli Florets Vegetables',
      rating: 4.8,
      reviews: '17k',
      sold: '18/35',
      progress: 35,
      oldPrice: '$28.99',
      newPrice: '$14.99',
      badgeClass: 'bg-primary-600',
      unit: '/Qty'
    },
    {
      id: 2,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img2.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: null,
      badgeClass: '',
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 3,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img3.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: null,
      badgeClass: '',
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 4,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img4.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: "Sale 50%",
      badgeClass: "bg-danger-600",
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 5,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img5.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: null,               // No badge for this product
      badgeClass: null,
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 6,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img6.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: null,
      badgeClass: null,
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 7,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img7.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      badge: null,
      badgeClass: null,
      routerLink: "product-details",
      unit: '/Qty'
    },
    {
      id: 8,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img8.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: null,
      badgeClass: null,
      unit: '/Qty'
    },
    {
      id: 9,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img9.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "Sale 50%",
      badgeClass: "bg-danger-600",
      unit: '/Qty'
    },
    {
      id: 10,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img10.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "Sale 50%",
      badgeClass: "bg-danger-600",
      unit: '/Qty'
    },
    {
      id: 11,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img11.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "",
      badgeClass: "",
      unit: '/Qty'
    },
    {
      id: 12,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img12.png",
      rating: 4.8,
      reviews: "17k",
      sold: '18/35',
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "New",
      badgeClass: "bg-warning-600",
      unit: '/Qty'
    },
    {
      id: 13,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img13.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "",
      badgeClass: "",
      unit: "/Qty"
    },
    {
      id: 14,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img14.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: null,
      badgeClass: null,
      unit: "/Qty"
    },
    {
      id: 15,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img15.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "Best Sale",
      badgeClass: "bg-primary-600",
      unit: "/Qty"
    },
    {
      id: 16,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img15.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "New",
      badgeClass: "bg-warning-600",
      unit: "/Qty"
    },
    {
      id: 17,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img1.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "Best Sale",
      badgeClass: "bg-primary-600",
      unit: "/Qty"
    },
    {
      id: 18,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img2.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      unit: "/Qty"
    },
    {
      id: 19,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img3.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      unit: "/Qty"
    },
    {
      id: 20,
      title: "Taylor Farms Broccoli Florets Vegetables",
      image: "assets/images/thumbs/product-two-img4.png",
      rating: 4.8,
      reviews: "17k",
      sold: "18/35",
      progress: 35,
      oldPrice: 28.99,
      newPrice: 14.99,
      routerLink: "product-details",
      cartLink: "cart",
      badge: "Sale 50%",
      badgeClass: "bg-danger-600",
      unit: "/Qty"
    }
  ];

  // pagination 
  totalPages = 7; // Total number of pages
  currentPage = 1; // The currently active page

  // Method to generate page numbers based on totalPages
  getPages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Method to handle page change
  onPageChange(page: number) {
    this.currentPage = page;
  }

}
