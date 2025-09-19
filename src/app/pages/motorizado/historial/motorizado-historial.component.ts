import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-motorizado-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="historial-container">
      <div class="page-header">
        <h1>
          <i class="fas fa-history"></i>
          Historial de Entregas
        </h1>
        <p>Revisa tus entregas anteriores</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>125</h3>
            <p>Entregas Exitosas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rating">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>4.8</h3>
            <p>Calificación Promedio</p>
          </div>
        </div>
      </div>

      <div class="historial-list">
        <div class="entrega-card" *ngFor="let entrega of entregas">
          <div class="entrega-header">
            <div class="entrega-info">
              <h3>Pedido #{{entrega.numero}}</h3>
              <span class="fecha">{{entrega.fecha | date:'dd/MM/yyyy HH:mm'}}</span>
            </div>
            <div class="entrega-monto">
              <span class="monto">S/ {{entrega.total}}</span>
              <span class="estado-badge success">
                <i class="fas fa-check"></i>
                Entregado
              </span>
            </div>
          </div>
          <div class="entrega-details">
            <p><strong>Cliente:</strong> {{entrega.cliente}}</p>
            <p><strong>Dirección:</strong> {{entrega.direccion}}</p>
            <div class="rating" *ngIf="entrega.calificacion">
              <span>Calificación:</span>
              <div class="stars">
                <i class="fas fa-star" *ngFor="let star of getStars(entrega.calificacion)"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .historial-container {
      padding: 20px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .page-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }

    .page-header h1 i {
      margin-right: 12px;
      color: #007bff;
    }

    .page-header p {
      margin: 0;
      color: #6c757d;
    }

    .stats-row {
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
      background: linear-gradient(135deg, #28a745, #1e7e34);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .stat-icon.rating {
      background: linear-gradient(135deg, #fd7e14, #e55a00);
    }

    .stat-content h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 4px 0 0 0;
      color: #6c757d;
      font-size: 14px;
    }

    .historial-list {
      display: grid;
      gap: 16px;
    }

    .entrega-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .entrega-header {
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .entrega-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .fecha {
      font-size: 12px;
      opacity: 0.9;
    }

    .entrega-monto {
      text-align: right;
    }

    .monto {
      display: block;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .estado-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .entrega-details {
      padding: 20px;
    }

    .entrega-details p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #333;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ffc107;
      font-size: 12px;
    }
  `]
})
export class MotorizadoHistorialComponent implements OnInit {
  entregas = [
    {
      numero: 'PED-001',
      fecha: new Date(),
      cliente: 'Juan Pérez',
      direccion: 'Av. Arequipa 1234, Miraflores',
      total: 45.50,
      calificacion: 5
    },
    {
      numero: 'PED-002',
      fecha: new Date(Date.now() - 86400000),
      cliente: 'María García',
      direccion: 'Jr. de la Unión 500, Lima Centro',
      total: 32.00,
      calificacion: 4
    }
  ];

  ngOnInit(): void {
    // Cargar historial del backend
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}