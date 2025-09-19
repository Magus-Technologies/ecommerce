import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-motorizado-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="motorizado-layout">
      <!-- Header -->
      <header class="motorizado-header">
        <div class="header-container">
          <div class="logo-section">
            <div class="logo">
              <i class="fas fa-motorcycle"></i>
              <span>Delivery</span>
            </div>
            <div class="user-info" *ngIf="currentUser">
              <span class="unit-badge">{{currentUser.numero_unidad}}</span>
              <span class="user-name">{{currentUser.name}}</span>
            </div>
          </div>

          <div class="header-actions">
            <div class="status-indicator" [class.online]="isOnline">
              <i class="fas fa-circle"></i>
              <span>{{isOnline ? 'En línea' : 'Desconectado'}}</span>
            </div>
            <button class="btn-logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Navigation Sidebar -->
        <nav class="sidebar">
          <ul class="nav-menu">
            <li>
              <a routerLink="/motorizado/dashboard"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a routerLink="/motorizado/pedidos"
                 routerLinkActive="active"
                 class="nav-link">
                <i class="fas fa-box"></i>
                <span>Mis Pedidos</span>
                <span class="badge" *ngIf="pedidosPendientes > 0">{{pedidosPendientes}}</span>
              </a>
            </li>
            <li>
              <a routerLink="/motorizado/rutas"
                 routerLinkActive="active"
                 class="nav-link">
                <i class="fas fa-map-marked-alt"></i>
                <span>Rutas</span>
              </a>
            </li>
            <li>
              <a routerLink="/motorizado/perfil"
                 routerLinkActive="active"
                 class="nav-link">
                <i class="fas fa-user"></i>
                <span>Mi Perfil</span>
              </a>
            </li>
            <li>
              <a routerLink="/motorizado/historial"
                 routerLinkActive="active"
                 class="nav-link">
                <i class="fas fa-history"></i>
                <span>Historial</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Content Area -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-nav">
        <a routerLink="/motorizado/dashboard"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{exact: true}"
           class="mobile-nav-item">
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/motorizado/pedidos"
           routerLinkActive="active"
           class="mobile-nav-item">
          <i class="fas fa-box"></i>
          <span>Pedidos</span>
          <span class="mobile-badge" *ngIf="pedidosPendientes > 0">{{pedidosPendientes}}</span>
        </a>
        <a routerLink="/motorizado/rutas"
           routerLinkActive="active"
           class="mobile-nav-item">
          <i class="fas fa-map-marked-alt"></i>
          <span>Rutas</span>
        </a>
        <a routerLink="/motorizado/perfil"
           routerLinkActive="active"
           class="mobile-nav-item">
          <i class="fas fa-user"></i>
          <span>Perfil</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .motorizado-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
    }

    /* Header */
    .motorizado-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
    }

    .logo i {
      font-size: 24px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .unit-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(220, 53, 69, 0.2);
      font-size: 12px;
      font-weight: 500;
    }

    .status-indicator.online {
      background: rgba(40, 167, 69, 0.2);
    }

    .status-indicator i {
      font-size: 8px;
    }

    .btn-logout {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: rgba(255,255,255,0.2);
    }

    /* Main Content */
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background: white;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    .nav-menu {
      list-style: none;
      padding: 20px 0;
      margin: 0;
    }

    .nav-menu li {
      margin-bottom: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #6c757d;
      text-decoration: none;
      transition: all 0.3s;
      position: relative;
    }

    .nav-link:hover {
      background: #f8f9fa;
      color: #007bff;
      text-decoration: none;
    }

    .nav-link.active {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
    }

    .nav-link i {
      width: 20px;
      text-align: center;
    }

    .nav-link .badge {
      background: #dc3545;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
      margin-left: auto;
    }

    /* Content Area */
    .content-area {
      flex: 1;
      overflow-y: auto;
    }

    /* Mobile Navigation */
    .mobile-nav {
      display: none;
      background: white;
      border-top: 1px solid #e9ecef;
      padding: 8px 0;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
    }

    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px;
      color: #6c757d;
      text-decoration: none;
      font-size: 12px;
      flex: 1;
      position: relative;
    }

    .mobile-nav-item.active {
      color: #007bff;
    }

    .mobile-nav-item i {
      font-size: 18px;
    }

    .mobile-badge {
      position: absolute;
      top: 4px;
      right: 20%;
      background: #dc3545;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      min-width: 16px;
      text-align: center;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }

      .mobile-nav {
        display: flex;
      }

      .content-area {
        padding-bottom: 70px;
      }

      .header-container {
        padding: 0 10px;
      }

      .user-info {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .motorizado-header {
        padding: 0 12px;
      }

      .header-container {
        height: 56px;
      }

      .logo span {
        display: none;
      }

      .status-indicator span {
        display: none;
      }
    }
  `]
})
export class MotorizadoLayoutComponent implements OnInit {
  currentUser: User | null = null;
  isOnline = false;
  pedidosPendientes = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.pedidosPendientes = this.currentUser?.estadisticas?.pedidos_pendientes || 0;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      // El AuthService ya maneja la redirección
    });
  }
}