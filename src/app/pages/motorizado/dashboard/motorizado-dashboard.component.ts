import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-motorizado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="motorizado-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="user-info">
            <div class="avatar">
              <i class="fas fa-motorcycle"></i>
            </div>
            <div class="user-details">
              <h1>¡Hola, {{currentUser?.name}}!</h1>
              <p class="unit-badge">{{currentUser?.numero_unidad}}</p>
            </div>
          </div>
          <div class="quick-actions">
            <button class="btn-status" [class.online]="isOnline" (click)="toggleStatus()">
              <i [class]="isOnline ? 'fas fa-circle' : 'fas fa-circle'"></i>
              {{isOnline ? 'En línea' : 'Desconectado'}}
            </button>
            <button class="btn-logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas?.pedidos_pendientes || 0}}</h3>
            <p>Pedidos Pendientes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon assigned">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas?.pedidos_asignados || 0}}</h3>
            <p>Asignados Hoy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas?.pedidos_entregados || 0}}</h3>
            <p>Entregados Hoy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rating">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>4.8</h3>
            <p>Calificación</p>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="quick-actions-grid">
        <div class="action-card" routerLink="/motorizado/pedidos">
          <div class="action-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="action-content">
            <h3>Mis Pedidos</h3>
            <p>Ver pedidos asignados</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="action-card" routerLink="/motorizado/rutas">
          <div class="action-icon">
            <i class="fas fa-map-marked-alt"></i>
          </div>
          <div class="action-content">
            <h3>Rutas</h3>
            <p>Ver rutas optimizadas</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="action-card" routerLink="/motorizado/perfil">
          <div class="action-icon">
            <i class="fas fa-user"></i>
          </div>
          <div class="action-content">
            <h3>Mi Perfil</h3>
            <p>Información personal</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="action-card" routerLink="/motorizado/historial">
          <div class="action-icon">
            <i class="fas fa-history"></i>
          </div>
          <div class="action-content">
            <h3>Historial</h3>
            <p>Entregas anteriores</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- Notificaciones/Alertas -->
      <div class="notifications-section" *ngIf="notificaciones.length > 0">
        <h2>Notificaciones</h2>
        <div class="notification-card" *ngFor="let notif of notificaciones">
          <div class="notification-icon" [class]="notif.tipo">
            <i [class]="getNotificationIcon(notif.tipo)"></i>
          </div>
          <div class="notification-content">
            <h4>{{notif.titulo}}</h4>
            <p>{{notif.mensaje}}</p>
            <small>{{notif.fecha | date:'short'}}</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .motorizado-dashboard {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 20px;
    }

    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .user-details h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }

    .unit-badge {
      background: #e9ecef;
      color: #495057;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin: 4px 0 0 0;
      display: inline-block;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
    }

    .btn-status {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      background: #dc3545;
      color: white;
    }

    .btn-status.online {
      background: #28a745;
    }

    .btn-logout {
      padding: 8px 16px;
      border: 1px solid #6c757d;
      background: white;
      color: #6c757d;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background: #6c757d;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .stat-icon.pending { background: linear-gradient(135deg, #ffc107, #e0a800); }
    .stat-icon.assigned { background: linear-gradient(135deg, #007bff, #0056b3); }
    .stat-icon.completed { background: linear-gradient(135deg, #28a745, #1e7e34); }
    .stat-icon.rating { background: linear-gradient(135deg, #fd7e14, #e55a00); }

    .stat-content h3 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 4px 0 0 0;
      color: #6c757d;
      font-size: 14px;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      text-decoration: none;
      color: inherit;
    }

    .action-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .action-content {
      flex: 1;
    }

    .action-content h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .action-content p {
      margin: 4px 0 0 0;
      color: #6c757d;
      font-size: 14px;
    }

    .action-arrow {
      color: #6c757d;
      font-size: 14px;
    }

    .notifications-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .notifications-section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .notification-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .notification-icon.info { background: #17a2b8; }
    .notification-icon.warning { background: #ffc107; }
    .notification-icon.success { background: #28a745; }

    .notification-content h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .notification-content p {
      margin: 4px 0;
      font-size: 13px;
      color: #6c757d;
    }

    .notification-content small {
      color: #999;
      font-size: 11px;
    }

    @media (max-width: 768px) {
      .motorizado-dashboard {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MotorizadoDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isOnline = false;
  estadisticas: any = {};

  notificaciones = [
    {
      tipo: 'info',
      titulo: 'Nuevo pedido asignado',
      mensaje: 'Se te ha asignado un pedido en Lima Centro',
      fecha: new Date()
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.estadisticas = this.currentUser?.estadisticas || {};
  }

  toggleStatus(): void {
    this.isOnline = !this.isOnline;
    // Aquí se haría la llamada al backend para actualizar el estado
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      // El AuthService ya maneja la redirección
    });
  }

  getNotificationIcon(tipo: string): string {
    switch(tipo) {
      case 'info': return 'fas fa-info';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'success': return 'fas fa-check';
      default: return 'fas fa-bell';
    }
  }
}