import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-motorizado-rutas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rutas-container">
      <div class="page-header">
        <h1>
          <i class="fas fa-map-marked-alt"></i>
          Rutas de Entrega
        </h1>
        <p>Optimiza tus rutas de delivery</p>
      </div>

      <div class="map-placeholder">
        <i class="fas fa-map"></i>
        <h3>Mapa de Rutas</h3>
        <p>Aquí se mostraría el mapa interactivo con las rutas optimizadas</p>
        <button class="btn btn-primary">
          <i class="fas fa-route"></i>
          Optimizar Ruta
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rutas-container {
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

    .map-placeholder {
      background: white;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 2px dashed #e9ecef;
    }

    .map-placeholder i {
      font-size: 48px;
      color: #6c757d;
      margin-bottom: 16px;
    }

    .map-placeholder h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .map-placeholder p {
      margin: 0 0 24px 0;
      color: #6c757d;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn i {
      margin-right: 8px;
    }
  `]
})
export class MotorizadoRutasComponent implements OnInit {
  ngOnInit(): void {
    // Implementar lógica de rutas
  }
}