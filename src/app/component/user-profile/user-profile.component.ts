// src/app/component/user-profile/user-profile.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Usuario logueado -->
    <div *ngIf="isLoggedIn" class="user-profile position-relative">
      <button 
        type="button" 
        class="flex-align gap-4  item-hover-white btn border-0 bg-transparent p-0"
        (click)="toggleUserDropdown($event)"
      >
        <span class="text-xl text-white d-flex position-relative item-hover__text">
          <i class="ph ph-user"></i>
        </span>
        <span class="text-md text-white item-hover__text d-none d-lg-flex">
          {{ user?.name || 'Mi Perfil' }}
        </span>
        <span class="text-sm d-none d-lg-flex">
          <i class="ph ph-caret-down"></i>
        </span>
      </button>
      
      <!-- Dropdown para usuario logueado -->
      <div 
        *ngIf="showUserDropdown" 
        class="user-dropdown position-absolute top-100 end-0 mt-8 bg-white border border-gray-100 rounded-12 shadow-lg py-8 min-w-200 z-99"
        (click)="$event.stopPropagation()"
      >
        <a 
          routerLink="/dashboard" 
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-white hover-text-main-600 transition-1"
          (click)="closeUserDropdown()"
        >
          <i class="ph ph-user text-lg"></i>
          <span>Mi Perfil</span>
        </a>
        <a 
          routerLink="/wishlist" 
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-main-50 hover-text-main-600 transition-1"
          (click)="closeUserDropdown()"
        >
          <i class="ph ph-heart text-lg"></i>
          <span>Mis Favoritos</span>
        </a>
        <a 
          routerLink="/cart" 
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-main-50 hover-text-main-600 transition-1"
          (click)="closeUserDropdown()"
        >
          <i class="ph ph-shopping-cart text-lg"></i>
          <span>Mi Carrito</span>
        </a>
        <hr class="my-8 border-gray-100">
        <button 
          type="button"
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-main-50 hover-text-main-600 transition-1 w-100 border-0 bg-transparent text-start"
          (click)="logout()"
        >
          <i class="ph ph-sign-out text-lg"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
    
    <!-- Usuario no logueado -->
    <div *ngIf="!isLoggedIn" class="position-relative">
      <button 
        type="button" 
        class="flex-align gap-4 item-hover-white btn border-0 bg-transparent p-0"
        (click)="toggleAuthDropdown($event)"
      >
        <span class="text-xl text-white d-flex position-relative item-hover__text">
          <i class="ph ph-user"></i>
        </span>
        <span class="text-md text-white item-hover__text d-none d-lg-flex">Mi Cuenta</span>
        <span class="text-sm d-none d-lg-flex">
          <i class="ph ph-caret-down"></i>
        </span>
      </button>
      
      <!-- Dropdown de autenticación -->
      <div 
        *ngIf="showAuthDropdown" 
        class="auth-dropdown position-absolute top-100 end-0 mt-8 bg-white border border-gray-100 rounded-12 shadow-lg py-8 min-w-200 z-99"
        (click)="$event.stopPropagation()"
      >
        <a 
          routerLink="/account" 
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-main-50 hover-text-main-600 transition-1"
          (click)="closeAuthDropdown()"
        >
          <i class="ph ph-sign-in text-lg"></i>
          <span>Iniciar Sesión</span>
        </a>
        <a 
          routerLink="/register" 
          class="dropdown-item d-flex align-items-center gap-8 px-16 py-12 text-gray-700 hover-bg-main-50 hover-text-main-600 transition-1"
          (click)="closeAuthDropdown()"
        >
          <i class="ph ph-user-plus text-lg"></i>
          <span>Registrarse</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .auth-dropdown,
    .user-dropdown {
      min-width: 180px;
      z-index: 1050;
    }
    
    .dropdown-item {
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    
    .dropdown-item:hover {
      text-decoration: none;
    }
    
    .dropdown-item:focus {
      outline: none;
      box-shadow: none;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  esSuperadmin = false;
  showAuthDropdown = false;
  showUserDropdown = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;

      // Evaluar si tiene el rol 'superadmin'
      if (user && user.roles) {
        this.esSuperadmin = user.roles.includes('superadmin');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar dropdowns al hacer click fuera
    this.showAuthDropdown = false;
    this.showUserDropdown = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeUserDropdown();
    });
  }

  toggleAuthDropdown(event: Event): void {
    event.stopPropagation();
    this.showAuthDropdown = !this.showAuthDropdown;
    this.showUserDropdown = false; // Cerrar el otro dropdown
  }

  closeAuthDropdown(): void {
    this.showAuthDropdown = false;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showAuthDropdown = false; // Cerrar el otro dropdown
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }
}