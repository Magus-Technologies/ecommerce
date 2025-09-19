import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedidos-asignados',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="pedidos-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-box"></i>
            Mis Pedidos
          </h1>
          <div class="header-actions">
            <select [(ngModel)]="filtroEstado" (change)="filtrarPedidos()" class="form-select">
              <option value="">Todos los estados</option>
              <option value="asignado">Asignados</option>
              <option value="aceptado">Aceptados</option>
              <option value="en_camino">En camino</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon asignado">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{contadores.asignado}}</h3>
            <p>Asignados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon aceptado">
            <i class="fas fa-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{contadores.aceptado}}</h3>
            <p>Aceptados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon en_camino">
            <i class="fas fa-shipping-fast"></i>
          </div>
          <div class="stat-content">
            <h3>{{contadores.en_camino}}</h3>
            <p>En camino</p>
          </div>
        </div>
      </div>

      <!-- Lista de Pedidos -->
      <div class="pedidos-list">
        <div class="pedido-card" *ngFor="let pedido of pedidosFiltrados">
          <div class="pedido-header">
            <div class="pedido-info">
              <h3>Pedido #{{pedido.numero}}</h3>
              <span class="estado-badge" [class]="pedido.estado">
                {{getEstadoLabel(pedido.estado)}}
              </span>
            </div>
            <div class="pedido-hora">
              <i class="fas fa-clock"></i>
              {{pedido.fecha_asignacion | date:'HH:mm'}}
            </div>
          </div>

          <div class="pedido-content">
            <div class="cliente-info">
              <div class="info-row">
                <i class="fas fa-user"></i>
                <span>{{pedido.cliente.nombre}}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-phone"></i>
                <a [href]="'tel:' + pedido.cliente.telefono">{{pedido.cliente.telefono}}</a>
              </div>
              <div class="info-row">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{pedido.direccion}}</span>
              </div>
            </div>

            <div class="pedido-details">
              <div class="detail-item">
                <span class="label">Total:</span>
                <span class="value">S/ {{pedido.total}}</span>
              </div>
              <div class="detail-item">
                <span class="label">Productos:</span>
                <span class="value">{{pedido.productos.length}} items</span>
              </div>
              <div class="detail-item" *ngIf="pedido.metodo_pago">
                <span class="label">Pago:</span>
                <span class="value">{{pedido.metodo_pago}}</span>
              </div>
            </div>
          </div>

          <div class="pedido-actions">
            <!-- Acciones según el estado -->
            <ng-container [ngSwitch]="pedido.estado">
              <!-- Pedido asignado -->
              <div *ngSwitchCase="'asignado'" class="action-buttons">
                <button class="btn btn-success" (click)="aceptarPedido(pedido.id)">
                  <i class="fas fa-check"></i>
                  Aceptar
                </button>
                <button class="btn btn-danger" (click)="rechazarPedido(pedido.id)">
                  <i class="fas fa-times"></i>
                  Rechazar
                </button>
              </div>

              <!-- Pedido aceptado -->
              <div *ngSwitchCase="'aceptado'" class="action-buttons">
                <button class="btn btn-primary" (click)="iniciarRuta(pedido.id)">
                  <i class="fas fa-route"></i>
                  Iniciar Ruta
                </button>
                <button class="btn btn-outline" (click)="verDetalles(pedido.id)">
                  <i class="fas fa-eye"></i>
                  Ver Detalles
                </button>
              </div>

              <!-- En camino -->
              <div *ngSwitchCase="'en_camino'" class="action-buttons">
                <button class="btn btn-success" (click)="completarEntrega(pedido.id)">
                  <i class="fas fa-check-circle"></i>
                  Completar Entrega
                </button>
                <button class="btn btn-info" (click)="llamarCliente(pedido.cliente.telefono)">
                  <i class="fas fa-phone"></i>
                  Llamar
                </button>
              </div>
            </ng-container>

            <!-- Botón de navegación siempre disponible -->
            <button class="btn btn-outline" (click)="abrirMapa(pedido.latitud, pedido.longitud)">
              <i class="fas fa-map"></i>
              Navegar
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="pedidosFiltrados.length === 0">
          <i class="fas fa-box-open"></i>
          <h3>No hay pedidos {{filtroEstado ? 'con ese estado' : 'asignados'}}</h3>
          <p>Los nuevos pedidos aparecerán aquí automáticamente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pedidos-container {
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

    .form-select {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      background: white;
      min-width: 150px;
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
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .stat-icon.asignado { background: linear-gradient(135deg, #ffc107, #e0a800); }
    .stat-icon.aceptado { background: linear-gradient(135deg, #28a745, #1e7e34); }
    .stat-icon.en_camino { background: linear-gradient(135deg, #007bff, #0056b3); }

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

    .pedidos-list {
      display: grid;
      gap: 20px;
    }

    .pedido-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .pedido-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pedido-info h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .estado-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 4px;
      display: inline-block;
    }

    .estado-badge.asignado { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
    .estado-badge.aceptado { background: rgba(40, 167, 69, 0.2); color: #28a745; }
    .estado-badge.en_camino { background: rgba(0, 123, 255, 0.2); color: #007bff; }

    .pedido-hora {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .pedido-content {
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .cliente-info .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .cliente-info .info-row i {
      width: 16px;
      color: #6c757d;
    }

    .cliente-info .info-row a {
      color: #007bff;
      text-decoration: none;
    }

    .pedido-details .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .detail-item .label {
      color: #6c757d;
    }

    .detail-item .value {
      font-weight: 500;
      color: #333;
    }

    .pedido-actions {
      padding: 16px 20px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
    }

    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-primary { background: #007bff; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-outline { background: white; color: #6c757d; border: 1px solid #6c757d; }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .pedidos-container {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .pedido-content {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        justify-content: center;
      }
    }
  `]
})
export class PedidosAsignadosComponent implements OnInit {
  filtroEstado = '';
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  contadores = { asignado: 0, aceptado: 0, en_camino: 0 };

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    // Datos de ejemplo - aquí se haría la llamada al backend
    this.pedidos = [
      {
        id: 1,
        numero: 'PED-001',
        estado: 'asignado',
        fecha_asignacion: new Date(),
        cliente: {
          nombre: 'Juan Pérez',
          telefono: '987654321'
        },
        direccion: 'Av. Arequipa 1234, Miraflores',
        total: 45.50,
        productos: [
          { nombre: 'Producto 1', cantidad: 2 },
          { nombre: 'Producto 2', cantidad: 1 }
        ],
        metodo_pago: 'Efectivo',
        latitud: -12.0464,
        longitud: -77.0428
      },
      {
        id: 2,
        numero: 'PED-002',
        estado: 'aceptado',
        fecha_asignacion: new Date(),
        cliente: {
          nombre: 'María García',
          telefono: '987654322'
        },
        direccion: 'Jr. de la Unión 500, Lima Centro',
        total: 32.00,
        productos: [
          { nombre: 'Producto A', cantidad: 1 }
        ],
        metodo_pago: 'Tarjeta',
        latitud: -12.0464,
        longitud: -77.0428
      }
    ];

    this.calcularContadores();
    this.filtrarPedidos();
  }

  calcularContadores(): void {
    this.contadores = {
      asignado: this.pedidos.filter(p => p.estado === 'asignado').length,
      aceptado: this.pedidos.filter(p => p.estado === 'aceptado').length,
      en_camino: this.pedidos.filter(p => p.estado === 'en_camino').length
    };
  }

  filtrarPedidos(): void {
    if (this.filtroEstado) {
      this.pedidosFiltrados = this.pedidos.filter(p => p.estado === this.filtroEstado);
    } else {
      this.pedidosFiltrados = [...this.pedidos];
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: any = {
      'asignado': 'Asignado',
      'aceptado': 'Aceptado',
      'en_camino': 'En camino',
      'entregado': 'Entregado'
    };
    return labels[estado] || estado;
  }

  aceptarPedido(id: number): void {
    // Implementar llamada al backend
    console.log('Aceptar pedido:', id);
  }

  rechazarPedido(id: number): void {
    // Implementar llamada al backend
    console.log('Rechazar pedido:', id);
  }

  iniciarRuta(id: number): void {
    // Implementar llamada al backend
    console.log('Iniciar ruta:', id);
  }

  completarEntrega(id: number): void {
    // Implementar llamada al backend
    console.log('Completar entrega:', id);
  }

  verDetalles(id: number): void {
    // Implementar navegación a detalles
    console.log('Ver detalles:', id);
  }

  llamarCliente(telefono: string): void {
    window.open(`tel:${telefono}`, '_self');
  }

  abrirMapa(lat: number, lng: number): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }
}