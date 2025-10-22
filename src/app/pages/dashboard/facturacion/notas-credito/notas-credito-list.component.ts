import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturacionService } from '../../../../services/facturacion.service';
import { Comprobante, PaginatedResponse } from '../../../../models/facturacion.model';
import Swal from 'sweetalert2';

interface NotaCredito {
  id: number;
  numero_completo: string;
  tipo_comprobante: string;
  comprobante_referencia: {
    tipo: string;
    serie: string;
    numero: number;
    numero_completo: string;
  };
  tipo_nota_credito: string;
  motivo: string;
  cliente_nombre: string;
  fecha_emision: string;
  total: number;
  estado_sunat: string;
  created_at: string;
}

@Component({
  selector: 'app-notas-credito-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Notas de Crédito</h5>
        <p class="text-gray-500 mb-0">Administra las notas de crédito emitidas</p>
      </div>
      <button 
        class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
        (click)="abrirModalCrear()">
        <i class="ph ph-plus me-8"></i>
        Nueva Nota de Crédito
      </button>
    </div>

    <!-- Filtros -->
    <div class="card border-0 shadow-sm rounded-12 mb-24">
      <div class="card-body p-24">
        <div class="row">
          <div class="col-md-3 mb-16">
            <label class="form-label text-heading fw-medium mb-8">Estado SUNAT</label>
            <select class="form-select px-16 py-12 border rounded-8" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="ACEPTADO_OBS">Aceptado con observaciones</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div class="col-md-3 mb-16">
            <label class="form-label text-heading fw-medium mb-8">Tipo de Nota</label>
            <select class="form-select px-16 py-12 border rounded-8" [(ngModel)]="filtroTipo" (change)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="01">Anulación de la operación</option>
              <option value="02">Anulación por error en el RUC</option>
              <option value="03">Corrección por error en la descripción</option>
              <option value="04">Descuento global</option>
              <option value="05">Descuento por ítem</option>
              <option value="06">Devolución total</option>
              <option value="07">Devolución por ítem</option>
              <option value="08">Bonificación</option>
              <option value="09">Disminución en el valor</option>
              <option value="10">Otros conceptos</option>
            </select>
          </div>
          <div class="col-md-3 mb-16">
            <label class="form-label text-heading fw-medium mb-8">Fecha Inicio</label>
            <input 
              type="date" 
              class="form-control px-16 py-12 border rounded-8"
              [(ngModel)]="filtroFechaInicio" 
              (change)="aplicarFiltros()">
          </div>
          <div class="col-md-3 mb-16">
            <label class="form-label text-heading fw-medium mb-8">Acciones</label>
            <div class="d-grid">
              <button 
                class="btn bg-gray-100 hover-bg-gray-200 text-gray-600 px-16 py-8 rounded-8"
                (click)="limpiarFiltros()">
                <i class="ph ph-broom me-8"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="row g-4 mb-24">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-24">
            <div class="d-flex align-items-center gap-16">
              <div class="w-48 h-48 rounded-12 flex-center bg-info-50 text-info-600">
                <i class="ph ph-file-text text-2xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm mb-4">Total Notas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.total }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-24">
            <div class="d-flex align-items-center gap-16">
              <div class="w-48 h-48 rounded-12 flex-center bg-success-50 text-success-600">
                <i class="ph ph-check-circle text-2xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm mb-4">Aceptadas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.aceptadas }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-24">
            <div class="d-flex align-items-center gap-16">
              <div class="w-48 h-48 rounded-12 flex-center bg-warning-50 text-warning-600">
                <i class="ph ph-clock text-2xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm mb-4">Pendientes</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.pendientes }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-24">
            <div class="d-flex align-items-center gap-16">
              <div class="w-48 h-48 rounded-12 flex-center bg-danger-50 text-danger-600">
                <i class="ph ph-x-circle text-2xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm mb-4">Rechazadas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.rechazadas }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de notas de crédito -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="loading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando notas de crédito...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="alert alert-danger mx-24 mt-24" role="alert">
          <i class="ph ph-exclamation-triangle me-8"></i>
          {{ error }}
          <button 
            type="button" 
            class="btn btn-sm btn-outline-danger ms-16"
            (click)="cargarNotasCredito()">
            <i class="ph ph-arrow-clockwise me-4"></i>
            Reintentar
          </button>
        </div>

        <!-- Tabla -->
        <div *ngIf="!loading && !error" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Número</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Cliente</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Comprobante Ref.</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Tipo/Motivo</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Total</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let nota of notasCredito" class="border-bottom border-gray-100">
                <!-- Número -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">{{ nota.numero_completo }}</span>
                  <br>
                  <small class="text-gray-500">{{ nota.fecha_emision | date:'dd/MM/yyyy' }}</small>
                </td>

                <!-- Cliente -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ nota.cliente_nombre }}</span>
                </td>

                <!-- Comprobante Referencia -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ nota.comprobante_referencia?.numero_completo || '-' }}</span>
                </td>

                <!-- Tipo/Motivo -->
                <td class="px-24 py-16">
                  <div>
                    <span class="badge bg-info-50 text-info-600 px-12 py-6 rounded-pill fw-medium mb-4">
                      {{ getTipoNotaNombre(nota.tipo_nota_credito) }}
                    </span>
                    <br>
                    <small class="text-gray-500">{{ nota.motivo }}</small>
                  </div>
                </td>

                <!-- Total -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">S/ {{ nota.total | number:'1.2-2' }}</span>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [ngClass]="getEstadoClass(nota.estado_sunat)">
                    {{ nota.estado_sunat | titlecase }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Ver Detalle -->
                    <button 
                      class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Ver Detalle"
                      (click)="verDetalle(nota)">
                      <i class="ph ph-eye text-sm"></i>
                    </button>

                    <!-- Descargar PDF -->
                    <button 
                      class="btn bg-success-50 hover-bg-success-100 text-success-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Descargar PDF"
                      (click)="descargarPDF(nota)" 
                      [disabled]="descargando">
                      <i class="ph ph-file-pdf text-sm"></i>
                    </button>

                    <!-- Consultar Estado -->
                    <button 
                      class="btn bg-primary-50 hover-bg-primary-100 text-primary-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Consultar Estado"
                      (click)="consultarEstado(nota)" 
                      [disabled]="consultando">
                      <i class="ph ph-magnifying-glass text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="notasCredito.length === 0" class="text-center py-40">
            <i class="ph ph-file-text text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay notas de crédito</h6>
            <p class="text-gray-500 mb-16">No se encontraron notas de crédito con los filtros aplicados.</p>
            <button 
              class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              (click)="abrirModalCrear()">
              <i class="ph ph-plus me-8"></i>
              Crear Primera Nota de Crédito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table td {
        vertical-align: middle;
      }
      
      .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .transition-2 {
        transition: all 0.2s ease;
      }
    `,
  ],
})
export class NotasCreditoListComponent implements OnInit {
  notasCredito: NotaCredito[] = [];
  loading = false;
  error = '';
  consultando = false;
  descargando = false;
  
  // Filtros
  filtroEstado = '';
  filtroTipo = '';
  filtroFechaInicio = '';
  
  // Estadísticas
  estadisticas = {
    total: 0,
    aceptadas: 0,
    pendientes: 0,
    rechazadas: 0
  };

  constructor(private facturacionService: FacturacionService) {}

  ngOnInit(): void {
    this.cargarNotasCredito();
  }

  cargarNotasCredito(): void {
    this.loading = true;
    this.error = '';
    
    const filtros = {
      estado: this.filtroEstado,
      tipo: this.filtroTipo,
      fecha_inicio: this.filtroFechaInicio,
      page: 1
    };

    this.facturacionService.getNotasCredito(filtros).subscribe({
      next: (res: any) => {
        this.notasCredito = res.data || [];
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Error al cargar notas de crédito';
        this.loading = false;
        console.error('Error al cargar notas de crédito:', e);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarNotasCredito();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.filtroFechaInicio = '';
    this.cargarNotasCredito();
  }

  calcularEstadisticas(): void {
    const total = this.notasCredito.length;
    const aceptadas = this.notasCredito.filter(n => n.estado_sunat === 'ACEPTADO').length;
    const pendientes = this.notasCredito.filter(n => n.estado_sunat === 'PENDIENTE').length;
    const rechazadas = this.notasCredito.filter(n => n.estado_sunat === 'RECHAZADO').length;
    
    this.estadisticas = {
      total,
      aceptadas,
      pendientes,
      rechazadas
    };
  }

  getTipoNotaNombre(tipo: string): string {
    const tipos: { [key: string]: string } = {
      '01': 'Anulación de la operación',
      '02': 'Anulación por error en el RUC',
      '03': 'Corrección por error en la descripción',
      '04': 'Descuento global',
      '05': 'Descuento por ítem',
      '06': 'Devolución total',
      '07': 'Devolución por ítem',
      '08': 'Bonificación',
      '09': 'Disminución en el valor',
      '10': 'Otros conceptos'
    };
    return tipos[tipo] || 'Desconocido';
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADO':
        return 'bg-success-50 text-success-600';
      case 'ACEPTADO_OBS':
        return 'bg-warning-50 text-warning-600';
      case 'RECHAZADO':
        return 'bg-danger-50 text-danger-600';
      case 'PENDIENTE':
        return 'bg-info-50 text-info-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  abrirModalCrear(): void {
    Swal.fire('Info', 'Funcionalidad de creación de notas de crédito en desarrollo.', 'info');
  }

  verDetalle(nota: NotaCredito): void {
    Swal.fire({
      title: 'Detalle de la Nota de Crédito',
      html: `
        <div class="text-start">
          <p><strong>Número:</strong> ${nota.numero_completo}</p>
          <p><strong>Cliente:</strong> ${nota.cliente_nombre}</p>
          <p><strong>Comprobante Referencia:</strong> ${nota.comprobante_referencia?.numero_completo || 'N/A'}</p>
          <p><strong>Tipo:</strong> ${this.getTipoNotaNombre(nota.tipo_nota_credito)}</p>
          <p><strong>Motivo:</strong> ${nota.motivo}</p>
          <p><strong>Total:</strong> S/ ${nota.total}</p>
          <p><strong>Estado:</strong> ${nota.estado_sunat}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  descargarPDF(nota: NotaCredito): void {
    if (!nota.id) return;
    
    this.descargando = true;
    // Aquí deberías implementar la descarga del PDF
    setTimeout(() => {
      this.descargando = false;
      Swal.fire('Descarga', 'Funcionalidad de descarga en desarrollo.', 'info');
    }, 1000);
  }

  consultarEstado(nota: NotaCredito): void {
    if (!nota.id) return;
    
    this.consultando = true;
    // Aquí deberías implementar la consulta de estado
    setTimeout(() => {
      this.consultando = false;
      Swal.fire('Consulta', 'Funcionalidad de consulta en desarrollo.', 'info');
    }, 1000);
  }
}