// src\app\layouts\main-layouts\footer\footer.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  footerSections = [
    {
      title: 'Information',
      links: [
        { label: 'Become a Vendor', route: ['shop'] },
        { label: 'Affiliate Program', route: ['shop'] },
        { label: 'Privacy Policy', route: ['privacy-policy'] },
        { label: 'Our Suppliers', route: ['suppliers'] },
        { label: 'Extended Plan', route: ['plans'] },
        { label: 'Community', route: ['community'] }
      ]
    },
    {
      title: 'Customer Support',
      links: [
        { label: 'Help Center', route: ['help'] },
        { label: 'Contact Us', route: ['contact'] },
        { label: 'Report Abuse', route: ['report-abuse'] },
        { label: 'Submit and Dispute', route: ['dispute'] },
        { label: 'Policies & Rules', route: ['policies'] },
        { label: 'Online Shopping', route: ['shop'] }
      ]
    },
    {
      title: 'My Account',
      links: [
        { label: 'My Account', route: ['account'] },
        { label: 'Order History', route: ['orders'] },
        { label: 'Shopping Cart', route: ['cart'] },
        { label: 'Compare', route: ['compare'] },
        { label: 'Help Ticket', route: ['help-ticket'] },
        { label: 'Wishlist', route: ['wishlist'] }
      ]
    },
    {
      title: 'Daily Groceries',
      links: [
        { label: 'Dairy & Eggs', route: ['groceries/dairy'] },
        { label: 'Meat & Seafood', route: ['groceries/meat'] },
        { label: 'Breakfast Food', route: ['groceries/breakfast'] },
        { label: 'Household Supplies', route: ['groceries/household'] },
        { label: 'Bread & Bakery', route: ['groceries/bakery'] },
        { label: 'Pantry Staples', route: ['groceries/pantry'] }
      ]
    }
  ];
}
