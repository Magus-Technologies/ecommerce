import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-motorizado-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="perfil-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-user"></i>
            Mi Perfil
          </h1>
          <button class="btn btn-back" routerLink="/motorizado/dashboard">
            <i class="fas fa-arrow-left"></i>
            Volver al Dashboard
          </button>
        </div>
      </div>

      <!-- Perfil Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            <i class="fas fa-motorcycle"></i>
          </div>
          <div class="profile-info">
            <h2>{{currentUser?.name}}</h2>
            <p class="unit-badge">{{currentUser?.numero_unidad}}</p>
            <p class="email">{{currentUser?.email}}</p>
          </div>
          <div class="profile-status">
            <span class="status-badge online">
              <i class="fas fa-circle"></i>
              En línea
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.total_entregas || 0}}</h3>
            <p>Total Entregas</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rating">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.calificacion || '4.8'}}</h3>
            <p>Calificación</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon time">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.tiempo_promedio || '25'}} min</h3>
            <p>Tiempo Promedio</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon money">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-content">
            <h3>S/ {{estadisticas.ganancias_mes || '1,250'}}</h3>
            <p>Este Mes</p>
          </div>
        </div>
      </div>

      <!-- Información Detallada -->
      <div class="details-section">
        <div class="detail-card">
          <h3>
            <i class="fas fa-user-circle"></i>
            Información Personal
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Nombre Completo:</span>
              <span class="value">{{motorizadoData?.nombre_completo || currentUser?.name}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Correo Electrónico:</span>
              <span class="value">{{currentUser?.email}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Teléfono:</span>
              <span class="value">{{motorizadoData?.telefono || 'No registrado'}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Número de Unidad:</span>
              <span class="value">{{currentUser?.numero_unidad}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Documento:</span>
              <span class="value">{{motorizadoData?.tipo_documento}} - {{motorizadoData?.numero_documento}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Usuario de Sistema:</span>
              <span class="value">{{currentUser?.username}}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3>
            <i class="fas fa-motorcycle"></i>
            Información del Vehículo
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Marca y Modelo:</span>
              <span class="value">{{motorizadoData?.vehiculo_marca}} {{motorizadoData?.vehiculo_modelo}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Año:</span>
              <span class="value">{{motorizadoData?.vehiculo_ano}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Placa:</span>
              <span class="value">{{motorizadoData?.vehiculo_placa}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Cilindraje:</span>
              <span class="value">{{motorizadoData?.vehiculo_cilindraje}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Color:</span>
              <span class="value">{{motorizadoData?.vehiculo_color_principal}} {{motorizadoData?.vehiculo_color_secundario ? '/ ' + motorizadoData?.vehiculo_color_secundario : ''}}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3>
            <i class="fas fa-id-card"></i>
            Licencia de Conducir
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Número de Licencia:</span>
              <span class="value">{{motorizadoData?.licencia_numero}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Categoría:</span>
              <span class="value">{{motorizadoData?.licencia_categoria}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial Reciente -->
      <div class="history-section">
        <h3>
          <i class="fas fa-history"></i>
          Entregas Recientes
        </h3>
        <div class="history-list">
          <div class="history-item" *ngFor="let entrega of historialReciente">
            <div class="history-info">
              <div class="history-header">
                <span class="pedido-number">Pedido #{{entrega.numero}}</span>
                <span class="history-date">{{entrega.fecha | date:'dd/MM/yyyy HH:mm'}}</span>
              </div>
              <div class="history-details">
                <span class="cliente">{{entrega.cliente}}</span>
                <span class="direccion">{{entrega.direccion}}</span>
              </div>
            </div>
            <div class="history-status">
              <span class="status-badge success">
                <i class="fas fa-check"></i>
                Entregado
              </span>
              <span class="amount">S/ {{entrega.total}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 20px;
    }

    .page-header {
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

    .header-content h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }

    .header-content h1 i {
      margin-right: 12px;
      color: #007bff;
    }

    .btn-back {
      padding: 8px 16px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: #5a6268;
      text-decoration: none;
      color: white;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
    }

    .profile-info {
      flex: 1;
    }

    .profile-info h2 {
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
      margin: 8px 0 4px 0;
      display: inline-block;
    }

    .email {
      margin: 4px 0 0 0;
      color: #6c757d;
      font-size: 14px;
    }

    .profile-status .status-badge {
      background: #28a745;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
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

    .stat-icon.total { background: linear-gradient(135deg, #007bff, #0056b3); }
    .stat-icon.rating { background: linear-gradient(135deg, #fd7e14, #e55a00); }
    .stat-icon.time { background: linear-gradient(135deg, #6f42c1, #59339d); }
    .stat-icon.money { background: linear-gradient(135deg, #28a745, #1e7e34); }

    .stat-content h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 4px 0 0 0;
      color: #6c757d;
      font-size: 14px;
    }

    .details-section {
      display: grid;
      gap: 20px;
      margin-bottom: 24px;
    }

    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .detail-card h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-card h3 i {
      color: #007bff;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item .label {
      color: #6c757d;
      font-weight: 500;
    }

    .detail-item .value {
      color: #333;
      font-weight: 500;
    }

    .history-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .history-section h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .history-section h3 i {
      color: #007bff;
    }

    .history-list {
      display: grid;
      gap: 12px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .history-info {
      flex: 1;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .pedido-number {
      font-weight: 600;
      color: #333;
    }

    .history-date {
      color: #6c757d;
      font-size: 12px;
    }

    .history-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cliente {
      font-size: 14px;
      color: #333;
    }

    .direccion {
      font-size: 12px;
      color: #6c757d;
    }

    .history-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .status-badge.success {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .amount {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .perfil-container {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .history-status {
        align-self: stretch;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `]
})
export class MotorizadoPerfilComponent implements OnInit {
  currentUser: User | null = null;
  motorizadoData: any = {};
  estadisticas: any = {};

  historialReciente = [
    {
      numero: 'PED-001',
      fecha: new Date(),
      cliente: 'Juan Pérez',
      direccion: 'Av. Arequipa 1234, Miraflores',
      total: 45.50
    },
    {
      numero: 'PED-002',
      fecha: new Date(Date.now() - 86400000), // Ayer
      cliente: 'María García',
      direccion: 'Jr. de la Unión 500, Lima Centro',
      total: 32.00
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.estadisticas = this.currentUser?.estadisticas || {};
    this.cargarDatosMotorizado();
  }

  cargarDatosMotorizado(): void {
    // Aquí se haría la llamada al backend para obtener datos completos del motorizado
    // Por ahora usamos datos de ejemplo
    this.motorizadoData = {
      nombre_completo: this.currentUser?.name,
      telefono: '987654321',
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      vehiculo_marca: 'Honda',
      vehiculo_modelo: 'CB 150',
      vehiculo_ano: 2022,
      vehiculo_placa: 'ABC-123',
      vehiculo_cilindraje: '150cc',
      vehiculo_color_principal: 'Rojo',
      vehiculo_color_secundario: 'Negro',
      licencia_numero: 'L12345678',
      licencia_categoria: 'A2a'
    };
  }
}