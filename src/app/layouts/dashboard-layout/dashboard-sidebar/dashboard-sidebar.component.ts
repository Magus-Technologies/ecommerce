// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="dashboard-sidebar">
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <i class="fas fa-home"></i> Inicio
            </a>
          </li>
          <li>
            <a routerLink="/dashboard/pedidos" routerLinkActive="active">
              <i class="fas fa-shopping-cart"></i> Pedidos
            </a>
          </li>
          <li>
            <a routerLink="/dashboard/perfil" routerLinkActive="active">
              <i class="fas fa-user"></i> Perfil
            </a>
          </li>
          <li>
            <a routerLink="/dashboard/configuracion" routerLinkActive="active">
              <i class="fas fa-cog"></i> Configuración
            </a>
          </li>
          <li>
            <a routerLink="/" class="back-to-site">
              <i class="fas fa-arrow-left"></i> Volver al sitio
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .dashboard-sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      height: 100%;
      overflow-y: auto;
    }
    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar-nav li {
      margin: 0;
    }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      color: #ecf0f1;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    .sidebar-nav a:hover, .sidebar-nav a.active {
      background-color: #34495e;
    }
    .sidebar-nav i {
      margin-right: 10px;
      width: 20px;
      text-align: center;
    }
    .back-to-site {
      margin-top: 20px;
      border-top: 1px solid #34495e;
    }
  `]
})
export class DashboardSidebarComponent {}