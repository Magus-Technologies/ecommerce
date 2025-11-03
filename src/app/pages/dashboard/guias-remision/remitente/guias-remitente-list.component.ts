import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuiasRemisionService, GuiaRemision } from '../../../../services/guias-remision.service';
import { GuiaRemisionModalComponent } from '../../../../components/guia-remision-modal/guia-remision-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-guias-remitente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaRemisionModalComponent],
  styles: [`
    .table {
      color: #212529 !important;
    }
    .table td, .table th {
      color: #212529 !important;
    }
    .table td strong {
      color: #000 !important;
    }
    .table td small {
      color: #6c757d !important;
    }
    .text-muted {
      color: #6c757d !important;
    }
  `],
  template: `
    <div class="gre-container">
      <div class="gre-header">
        <div class="gre-title">
          <h5>GRE Remitente</h5>
          <p>Guías de remisión para ventas (transporte propio o contratado)</p>
        </div>
        <div class="gre-actions">
          <button class="gre-btn-primary" (click)="nuevaGuia()">
            <i class="ph ph-plus"></i>
            Nueva GRE Remitente
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="gre-stats">
        <div class="row g-4">
          <div class="col-md-3">
            <div class="stat-card stat-total">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-file-text"></i>
                  </div>
                  <div>
                    <p class="stat-label">Total</p>
                    <h6 class="stat-value">{{ totalGuias }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-pending">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-clock"></i>
                  </div>
                  <div>
                    <p class="stat-label">Pendientes</p>
                    <h6 class="stat-value">{{ guiasPendientes }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-accepted">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-check-circle"></i>
                  </div>
                  <div>
                    <p class="stat-label">Aceptadas</p>
                    <h6 class="stat-value">{{ guiasAceptadas }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-rejected">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-x-circle"></i>
                  </div>
                  <div>
                    <p class="stat-label">Rechazadas</p>
                    <h6 class="stat-value">{{ guiasRechazadas }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="gre-filters">
        <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-16">
            <label class="form-label">Estado</label>
            <select class="form-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div class="col-md-3 mb-16">
            <label class="form-label">Fecha Inicio</label>
            <input
              type="date"
              class="form-control"
              [(ngModel)]="filtroFechaInicio"
              (change)="aplicarFiltros()">
          </div>
          <div class="col-md-3 mb-16">
            <label class="form-label">Fecha Fin</label>
            <input
              type="date"
              class="form-control"
              [(ngModel)]="filtroFechaFin"
              (change)="aplicarFiltros()">
          </div>
          <div class="col-md-2 mb-16">
            <label class="form-label">Acciones</label>
            <div class="d-grid">
              <button
                class="gre-btn-secondary"
                (click)="limpiarFiltros()">
                <i class="ph ph-broom"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Tabla -->
      <div class="gre-table-card">
        <div class="card-body">
          <div *ngIf="loading" class="gre-loading">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando guías...</p>
          </div>

          <div *ngIf="error" class="gre-alert alert-danger">
            <i class="ph ph-warning"></i>{{ error }}
          </div>

          <div *ngIf="!loading && !error" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Traslado</th>
                  <th>Destinatario</th>
                  <th>Peso (kg)</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let guia of guias">
                  <td class="td-number">
                    <strong>{{ guia.numero_completo || guia.serie + '-' + guia.correlativo }}</strong>
                  </td>
                  <td>{{ guia.fecha_emision | date:'dd/MM/yyyy' }}</td>
                  <td>{{ guia.fecha_inicio_traslado | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div>
                      <strong>{{ guia.destinatario_razon_social || 'Sin destinatario' }}</strong>
                      <br>
                      <small class="text-muted" *ngIf="guia.destinatario_numero_documento">
                        {{ guia.destinatario_tipo_documento === '6' ? 'RUC' : 'DNI' }}: {{ guia.destinatario_numero_documento }}
                      </small>
                      <small class="text-muted" *ngIf="guia.cliente?.razon_social">
                        <br>Cliente: {{ guia.cliente.razon_social }}
                      </small>
                    </div>
                  </td>
                  <td>{{ guia.peso_total | number:'1.2-2' }}</td>
                  <td>
                    <span class="gre-badge" [ngClass]="getEstadoClass(guia.estado)">
                      {{ guia.estado_nombre || guia.estado }}
                    </span>
                  </td>
                  <td>
                    <div class="gre-actions-group">
                      <button
                        class="gre-btn-action btn-view"
                        title="Ver Detalle"
                        (click)="verDetalle(guia)">
                        <i class="ph ph-eye"></i>
                      </button>
                      <button
                        *ngIf="guia.estado === 'PENDIENTE'"
                        class="gre-btn-action btn-send"
                        title="Enviar a SUNAT"
                        (click)="enviarSunat(guia)">
                        <i class="ph ph-paper-plane"></i>
                      </button>
                      <button
                        *ngIf="guia.estado === 'ACEPTADO'"
                        class="gre-btn-action btn-download"
                        title="Descargar XML"
                        (click)="descargarXML(guia)">
                        <i class="ph ph-file-code"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="guias.length === 0" class="gre-empty">
              <i class="ph ph-file-text"></i>
              <h6>No hay guías de remisión</h6>
              <button class="gre-btn-primary" (click)="nuevaGuia()">
                <i class="ph ph-plus"></i>
                Crear Primera Guía
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-guia-remision-modal
      [isOpen]="mostrarModal"
      [tipoGuiaPredefinido]="'REMITENTE'"
      (onClose)="cerrarModal()"
      (onSuccess)="onGuiaCreada($event)">
    </app-guia-remision-modal>
  `
})
export class GuiasRemitenteListComponent implements OnInit {
  guias: GuiaRemision[] = [];
  loading = false;
  error = '';
  mostrarModal = false;
  
  filtroEstado = '';
  filtroFechaInicio = '';
  filtroFechaFin = '';
  
  totalGuias = 0;
  guiasPendientes = 0;
  guiasAceptadas = 0;
  guiasRechazadas = 0;

  constructor(
    private guiasService: GuiasRemisionService
  ) {}

  ngOnInit(): void {
    this.cargarGuias();
  }

  cargarGuias(): void {
    this.loading = true;
    this.error = '';
    
    const filtros: any = {
      tipo_guia: 'REMITENTE',
      estado: this.filtroEstado,
      fecha_inicio: this.filtroFechaInicio,
      fecha_fin: this.filtroFechaFin
    };

    this.guiasService.getGuias(filtros).subscribe({
      next: (response) => {
        this.guias = response.data?.data || response.data || [];
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar guías';
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalGuias = this.guias.length;
    this.guiasPendientes = this.guias.filter(g => g.estado === 'PENDIENTE').length;
    this.guiasAceptadas = this.guias.filter(g => g.estado === 'ACEPTADO').length;
    this.guiasRechazadas = this.guias.filter(g => g.estado === 'RECHAZADO').length;
  }

  aplicarFiltros(): void {
    this.cargarGuias();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.cargarGuias();
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADO': return 'badge-aceptado';
      case 'ENVIADO': return 'badge-enviado';
      case 'RECHAZADO': return 'badge-rechazado';
      case 'PENDIENTE': return 'badge-pendiente';
      default: return 'badge-pendiente';
    }
  }

  nuevaGuia(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onGuiaCreada(_guia: any): void {
    this.cargarGuias();
    Swal.fire('Éxito', 'GRE Remitente creada exitosamente', 'success');
  }

  verDetalle(guia: GuiaRemision): void {
    const clienteInfo = guia.cliente?.razon_social 
      ? `<p><strong>Cliente Asociado:</strong> ${guia.cliente.razon_social}</p>` 
      : '';
    
    const destinatarioDoc = guia.destinatario_numero_documento
      ? `<p><strong>Documento:</strong> ${guia.destinatario_tipo_documento === '6' ? 'RUC' : 'DNI'} ${guia.destinatario_numero_documento}</p>`
      : '';

    Swal.fire({
      title: 'Detalle de GRE Remitente',
      html: `
        <div class="text-start">
          <p><strong>Número:</strong> ${guia.numero_completo || guia.serie + '-' + guia.correlativo}</p>
          <p><strong>Fecha Emisión:</strong> ${new Date(guia.fecha_emision).toLocaleDateString('es-PE')}</p>
          <p><strong>Fecha Traslado:</strong> ${new Date(guia.fecha_inicio_traslado).toLocaleDateString('es-PE')}</p>
          <hr>
          <h6>Destinatario</h6>
          <p><strong>Razón Social:</strong> ${guia.destinatario_razon_social || 'No especificado'}</p>
          ${destinatarioDoc}
          <p><strong>Dirección:</strong> ${guia.destinatario_direccion || 'No especificada'}</p>
          ${clienteInfo}
          <hr>
          <h6>Traslado</h6>
          <p><strong>Origen:</strong> ${guia.punto_partida_direccion}</p>
          <p><strong>Destino:</strong> ${guia.punto_llegada_direccion}</p>
          <p><strong>Peso Total:</strong> ${guia.peso_total} kg</p>
          <p><strong>Bultos:</strong> ${guia.numero_bultos || 'No especificado'}</p>
          <hr>
          <p><strong>Estado:</strong> <span class="badge bg-${this.getEstadoBadgeColor(guia.estado)}">${guia.estado}</span></p>
          ${guia.mensaje_sunat ? `<p><strong>Mensaje SUNAT:</strong> ${guia.mensaje_sunat}</p>` : ''}
        </div>
      `,
      icon: 'info',
      width: '600px'
    });
  }

  getEstadoBadgeColor(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADO': return 'success';
      case 'ENVIADO': return 'info';
      case 'RECHAZADO': return 'danger';
      case 'PENDIENTE': return 'warning';
      default: return 'secondary';
    }
  }

  enviarSunat(guia: GuiaRemision): void {
    Swal.fire({
      title: '¿Enviar a SUNAT?',
      text: `¿Desea enviar la guía ${guia.numero_completo} a SUNAT?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.guiasService.enviarSunat(guia.id!).subscribe({
          next: (response) => {
            Swal.fire('Éxito', response.message, 'success');
            this.cargarGuias();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al enviar a SUNAT', 'error');
          }
        });
      }
    });
  }

  descargarXML(guia: GuiaRemision): void {
    this.guiasService.descargarXML(guia.id!).subscribe({
      next: (response) => {
        const blob = new Blob([response.data.xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (_err) => {
        Swal.fire('Error', 'No se pudo descargar el XML', 'error');
      }
    });
  }
}
