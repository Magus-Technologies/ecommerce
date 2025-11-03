import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuiasRemisionService, GuiaRemision, EstadisticasGuias } from '../../../services/guias-remision.service';
import { GuiaRemisionModalComponent } from '../../../components/guia-remision-modal/guia-remision-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-guias-remision-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaRemisionModalComponent],
  template: `
    <div class="gre-container">
      <!-- Header -->
      <div class="gre-header">
        <div class="gre-title">
          <h5>Guías de Remisión</h5>
          <p>Administra las guías de remisión electrónicas</p>
        </div>
        <div class="gre-actions">
          <button class="gre-btn-primary" (click)="nuevaGuia()">
            <i class="ph ph-plus"></i>
            Nueva Guía de Remisión
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="gre-stats">
        <div class="row g-4">
          <div class="col-md-2">
            <div class="stat-card stat-total">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-file-text"></i>
                  </div>
                  <div>
                    <p class="stat-label">Total</p>
                    <h6 class="stat-value">{{ estadisticas.total_guias }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card stat-pending">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-clock"></i>
                  </div>
                  <div>
                    <p class="stat-label">Pendientes</p>
                    <h6 class="stat-value">{{ estadisticas.guias_pendientes }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card stat-sent">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-paper-plane"></i>
                  </div>
                  <div>
                    <p class="stat-label">Enviadas</p>
                    <h6 class="stat-value">{{ estadisticas.guias_enviadas }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card stat-accepted">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-check-circle"></i>
                  </div>
                  <div>
                    <p class="stat-label">Aceptadas</p>
                    <h6 class="stat-value">{{ estadisticas.guias_aceptadas }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card stat-rejected">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-x-circle"></i>
                  </div>
                  <div>
                    <p class="stat-label">Rechazadas</p>
                    <h6 class="stat-value">{{ estadisticas.guias_rechazadas }}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat-card stat-weight">
              <div class="card-body">
                <div class="d-flex align-items-center gap-12">
                  <div class="stat-icon">
                    <i class="ph ph-package"></i>
                  </div>
                  <div>
                    <p class="stat-label">Peso (kg)</p>
                    <h6 class="stat-value">{{ estadisticas.peso_total_transportado | number:'1.2-2' }}</h6>
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
            <div class="col-md-3 mb-16">
              <label class="form-label">Tipo de Guía</label>
              <select class="form-select" [(ngModel)]="filtroTipoGuia" (change)="aplicarFiltros()">
                <option value="">Todos los tipos</option>
                <option value="REMITENTE">GRE Remitente</option>
                <option value="INTERNO">Traslado Interno</option>
              </select>
            </div>
            <div class="col-md-3 mb-16">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ACEPTADO">Aceptado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>
            <div class="col-md-2 mb-16">
              <label class="form-label">Fecha Inicio</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filtroFechaInicio"
                (change)="aplicarFiltros()">
            </div>
            <div class="col-md-2 mb-16">
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

          <!-- Loading state -->
          <div *ngIf="loading" class="gre-loading">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando guías de remisión...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="gre-alert alert-danger">
            <i class="ph ph-exclamation-triangle"></i>
            {{ error }}
            <button
              type="button"
              class="btn btn-sm btn-outline-danger ms-auto"
              (click)="cargarGuias()">
              <i class="ph ph-arrow-clockwise"></i>
              Reintentar
            </button>
          </div>

          <!-- Tabla -->
          <div *ngIf="!loading && !error" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Destinatario</th>
                  <th>Peso (kg)</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let guia of guias">
                  <!-- Número -->
                  <td class="td-number">{{ guia.numero_completo }}</td>

                  <!-- Tipo -->
                  <td>
                    <span class="gre-tipo-badge" [ngClass]="getTipoGuiaClass(guia.tipo_guia)">
                      {{ getTipoGuiaNombre(guia.tipo_guia) }}
                    </span>
                  </td>

                  <!-- Fecha -->
                  <td>{{ guia.fecha_emision | date:'dd/MM/yyyy' }}</td>

                  <!-- Cliente -->
                  <td>{{ guia.cliente?.razon_social || 'N/A' }}</td>

                  <!-- Destinatario -->
                  <td>{{ guia.destinatario_razon_social }}</td>

                  <!-- Peso -->
                  <td>{{ guia.peso_total | number:'1.2-2' }}</td>

                  <!-- Estado -->
                  <td>
                    <span class="gre-badge" [ngClass]="getEstadoClass(guia.estado)">
                      {{ guia.estado_nombre || guia.estado }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td>
                    <div class="gre-actions-group">
                      <!-- Ver Detalle -->
                      <button
                        class="gre-btn-action btn-view"
                        title="Ver Detalle"
                        (click)="verDetalle(guia)">
                        <i class="ph ph-eye"></i>
                      </button>

                      <!-- Enviar a SUNAT -->
                      <button
                        *ngIf="guia.requiere_sunat && guia.estado === 'PENDIENTE'"
                        class="gre-btn-action btn-send"
                        title="Enviar a SUNAT"
                        (click)="enviarSunat(guia)"
                        [disabled]="enviando">
                        <i class="ph ph-paper-plane"></i>
                      </button>

                      <!-- Descargar XML -->
                      <button
                        *ngIf="guia.estado === 'ACEPTADO'"
                        class="gre-btn-action btn-download"
                        title="Descargar XML"
                        (click)="descargarXML(guia)"
                        [disabled]="descargando">
                        <i class="ph ph-file-code"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty state -->
            <div *ngIf="guias.length === 0" class="gre-empty">
              <i class="ph ph-file-text"></i>
              <h6>No hay guías de remisión</h6>
              <p>No se encontraron guías con los filtros aplicados.</p>
              <button
                class="gre-btn-primary"
                (click)="nuevaGuia()">
                <i class="ph ph-plus"></i>
                Crear Primera Guía
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Guía de Remisión -->
    <app-guia-remision-modal
      [isOpen]="mostrarModal"
      [guiaId]="guiaSeleccionada"
      (onClose)="cerrarModal()"
      (onSuccess)="onGuiaCreada($event)">
    </app-guia-remision-modal>
  `
})
export class GuiasRemisionListComponent implements OnInit {
  guias: GuiaRemision[] = [];
  loading = false;
  error = '';
  enviando = false;
  descargando = false;
  mostrarModal = false;
  guiaSeleccionada?: number;

  // Filtros
  filtroTipoGuia: 'REMITENTE' | 'INTERNO' | '' = '';
  filtroEstado = '';
  filtroFechaInicio = '';
  filtroFechaFin = '';

  // Estadísticas
  estadisticas: EstadisticasGuias = {
    total_guias: 0,
    guias_pendientes: 0,
    guias_enviadas: 0,
    guias_aceptadas: 0,
    guias_rechazadas: 0,
    peso_total_transportado: 0
  };

  constructor(
    private guiasService: GuiasRemisionService
  ) {}

  ngOnInit(): void {
    this.cargarGuias();
    this.cargarEstadisticas();
  }

  cargarGuias(): void {
    this.loading = true;
    this.error = '';

    const filtros: any = {
      estado: this.filtroEstado,
      fecha_inicio: this.filtroFechaInicio,
      fecha_fin: this.filtroFechaFin
    };

    if (this.filtroTipoGuia) {
      filtros.tipo_guia = this.filtroTipoGuia;
    }

    this.guiasService.getGuias(filtros).subscribe({
      next: (response) => {
        this.guias = response.data?.data || response.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar guías de remisión';
        this.loading = false;
        console.error('Error al cargar guías:', err);
      }
    });
  }

  cargarEstadisticas(): void {
    const filtros = {
      fecha_inicio: this.filtroFechaInicio,
      fecha_fin: this.filtroFechaFin
    };

    this.guiasService.getEstadisticas(filtros).subscribe({
      next: (response) => {
        this.estadisticas = response.data;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarGuias();
    this.cargarEstadisticas();
  }

  limpiarFiltros(): void {
    this.filtroTipoGuia = '';
    this.filtroEstado = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.cargarGuias();
    this.cargarEstadisticas();
  }

  getTipoGuiaClass(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'REMITENTE':
        return 'badge-remitente';
      case 'INTERNO':
        return 'badge-interno';
      default:
        return 'badge-interno';
    }
  }

  getTipoGuiaNombre(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'REMITENTE':
        return 'GRE Remitente';
      case 'INTERNO':
        return 'Traslado Interno';
      default:
        return tipo;
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADO':
        return 'badge-aceptado';
      case 'ENVIADO':
        return 'badge-enviado';
      case 'RECHAZADO':
        return 'badge-rechazado';
      case 'PENDIENTE':
        return 'badge-pendiente';
      default:
        return 'badge-pendiente';
    }
  }

  nuevaGuia(): void {
    this.guiaSeleccionada = undefined;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guiaSeleccionada = undefined;
  }

  onGuiaCreada(_guia: any): void {
    this.cargarGuias();
    this.cargarEstadisticas();
    Swal.fire('Éxito', 'Guía de remisión creada exitosamente', 'success');
  }

  verDetalle(guia: GuiaRemision): void {
    this.guiasService.getGuia(guia.id!).subscribe({
      next: (response) => {
        const g = response.data;
        Swal.fire({
          title: 'Detalle de Guía de Remisión',
          html: `
            <div class="text-start">
              <p><strong>Número:</strong> ${g.numero_completo}</p>
              <p><strong>Cliente:</strong> ${g.cliente?.razon_social || 'N/A'}</p>
              <p><strong>Destinatario:</strong> ${g.destinatario_razon_social}</p>
              <p><strong>Fecha Traslado:</strong> ${g.fecha_inicio_traslado}</p>
              <p><strong>Peso Total:</strong> ${g.peso_total} kg</p>
              <p><strong>Estado:</strong> ${g.estado_nombre || g.estado}</p>
              ${g.mensaje_sunat ? `<p><strong>Mensaje SUNAT:</strong> ${g.mensaje_sunat}</p>` : ''}
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Cerrar',
          width: '600px'
        });
      },
      error: (_err) => {
        Swal.fire('Error', 'No se pudo cargar el detalle de la guía', 'error');
      }
    });
  }

  enviarSunat(guia: GuiaRemision): void {
    Swal.fire({
      title: '¿Enviar a SUNAT?',
      text: `¿Desea enviar la guía ${guia.numero_completo} a SUNAT?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enviando = true;
        this.guiasService.enviarSunat(guia.id!).subscribe({
          next: (response) => {
            this.enviando = false;
            Swal.fire('Éxito', response.message, 'success');
            this.cargarGuias();
            this.cargarEstadisticas();
          },
          error: (err) => {
            this.enviando = false;
            Swal.fire('Error', err.error?.message || 'Error al enviar a SUNAT', 'error');
          }
        });
      }
    });
  }

  descargarXML(guia: GuiaRemision): void {
    this.descargando = true;
    this.guiasService.descargarXML(guia.id!).subscribe({
      next: (response) => {
        // Crear blob y descargar
        const blob = new Blob([response.data.xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.descargando = false;
      },
      error: (_err) => {
        this.descargando = false;
        Swal.fire('Error', 'No se pudo descargar el XML', 'error');
      }
    });
  }
}
