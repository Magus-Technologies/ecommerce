// src\app\layouts\main-layouts\footer\footer.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  emailSuscripcion = '';

  contactInfo = {
    description: 'Escríbenos a: info@magustechnology.com',
    email: 'info@magustechnology.com',
    schedule: 'Llámanos de Lunes a Viernes de 9:00 am a 6:00 p.m'
  };

  socialLinks = [
    { icon: 'ph-fill ph-tiktok-logo', url: 'https://www.tiktok.com' },
    { icon: 'ph-fill ph-instagram-logo', url: 'https://www.instagram.com' },
    { icon: 'ph-fill ph-facebook-logo', url: 'https://www.facebook.com' },
    { icon: 'ph-fill ph-youtube-logo', url: 'https://www.youtube.com' }
  ];

  footerSections = [
    {
      title: 'Contáctanos',
      links: [
        { label: 'Productos de Amazon', route: ['shop'] },
        { label: 'Productos de China', route: ['shop'] },
        { label: 'Productos para cocina', route: ['shop'] },
        { label: 'Productos rankeados', route: ['shop'] }
      ]
    },
    {
      title: 'Populares',
      links: [
        { label: 'Productos de Amazon', route: ['shop'] },
        { label: 'Productos de China', route: ['shop'] },
        { label: 'Productos para cocina', route: ['shop'] },
        { label: 'Productos rankeados', route: ['shop'] }
      ]
    },
    {
      title: 'Área legal',
      links: [
        { label: 'Política de privacidad y cookies', route: ['privacy-policy'] },
        { label: 'Términos y condiciones', route: ['terms'] },
        { label: 'Política de devoluciones y rembolsos', route: ['returns'] },
        { label: 'Preguntas frecuentes', route: ['faq'] }
      ]
    }
  ];

  paymentMethods = [
    { name: 'Visa', image: '/assets/images/payment/visa.png' },
    { name: 'Mastercard', image: '/assets/images/payment/mastercard.png' },
    { name: 'American Express', image: '/assets/images/payment/amex.png' },
    { name: 'Yape', image: '/assets/images/payment/yape.png' },
    { name: 'Plin', image: '/assets/images/payment/plin.png' }
  ];

  suscribirse(): void {
    if (this.emailSuscripcion.trim()) {
      console.log('Suscribiendo email:', this.emailSuscripcion);
      // Aquí implementarías la lógica de suscripción
      this.emailSuscripcion = '';
      // Mostrar mensaje de éxito
    }
  }
}