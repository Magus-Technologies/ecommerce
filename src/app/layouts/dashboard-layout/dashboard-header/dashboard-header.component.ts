// src/app/layouts/dashboard-layout/dashboard-header/dashboard-header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="dashboard-header">
      <div class="logo">
        <h1>Panel de Administración</h1>
      </div>
      <div class="user-menu">
        <span *ngIf="authService.getCurrentUser()">{{ authService.getCurrentUser()?.name }}</span>
        <button class="logout-btn" (click)="logout()">Cerrar sesión</button>
      </div>
    </header>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      height: 60px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo h1 {
      font-size: 1.2rem;
      margin: 0;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logout-btn {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class DashboardHeaderComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout().subscribe();
  }
}