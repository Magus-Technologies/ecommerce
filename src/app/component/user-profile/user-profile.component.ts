// src/app/component/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="isLoggedIn" class="user-profile">
      <div class="dropdown">
        <button class="btn dropdown-toggle flex-align gap-4 item-hover" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <span class="text-xl text-gray-700 d-flex position-relative item-hover__text">
            <i class="ph ph-user"></i>
          </span>
          <span class="text-md text-heading-three item-hover__text d-none d-lg-flex">{{ user?.name || 'Mi Perfil' }}</span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" routerLink="/dashboard">Mi Perfil</a></li>
          <li><a class="dropdown-item" routerLink="/wishlist">Mis Favoritos</a></li>
          <li><a class="dropdown-item" routerLink="/cart">Mi Carrito</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="javascript:void(0)" (click)="logout()">Cerrar Sesión</a></li>
        </ul>
      </div>
    </div>
    
    <div *ngIf="!isLoggedIn">
      <a routerLink="/account" class="flex-align gap-4 item-hover">
        <span class="text-xl text-gray-700 d-flex position-relative item-hover__text">
          <i class="ph ph-user"></i>
        </span>
        <span class="text-md text-heading-three item-hover__text d-none d-lg-flex">Iniciar Sesión</span>
      </a>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  esSuperadmin = false;

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;

      // ✅ Aquí evaluamos si tiene el rol 'superadmin'
      if (user && user.roles) {
        this.esSuperadmin = user.roles.includes('superadmin');
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}