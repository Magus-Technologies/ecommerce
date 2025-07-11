// src\app\component\shipping\shipping.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-shipping',
  imports: [CommonModule],
  templateUrl: './shipping.component.html',
  styleUrl: './shipping.component.scss'
})
export class ShippingComponent {
shippingItems = [
    {
      icon: 'ph-car-profile',
      title: 'Free Shipping',
      description: 'Free shipping all over the US',
      duration: '400'
    },
    {
      icon: 'ph-hand-heart',
      title: '100% Satisfaction',
      description: 'Free shipping all over the US',
      duration: '600'
    },
    {
      icon: 'ph-credit-card',
      title: 'Secure Payments',
      description: 'Free shipping all over the US',
      duration: '800'
    },
    {
      icon: 'ph-chats',
      title: '24/7 Support',
      description: 'Free shipping all over the US',
      duration: '1000'
    }
  ];
}
