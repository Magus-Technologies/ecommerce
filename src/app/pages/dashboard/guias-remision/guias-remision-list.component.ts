import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GuiasRemisionService, GuiaRemision, EstadisticasGuias } from '../../../services/guias-remision.service';
import { GuiaRemisionModalComponent } from '../../../components/guia-remision-modal/guia-remision-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-guias-remision-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaRemisionModalComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Guías de Remisión</h5>
        <p class="text-gray-500 mb-0">Administra las guías de remisión electrónicas</p>
      </div>
      <button 
        class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
        (click)="nuevaGuia()">
        <i class="ph ph-plus me-8"></i>
        Nueva Guía de Remisión
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="row g-4 mb-24">
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-info-50 text-info-600">
                <i class="ph ph-file-text text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Total</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.total_guias }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-warning-50 text-warning-600">
                <i class="ph ph-clock text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Pendientes</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.guias_pendientes }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-primary-50 text-primary-600">
                <i class="ph ph-paper-plane text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Enviadas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.guias_enviadas }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-success-50 text-success-600">
                <i class="ph ph-check-circle text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Aceptadas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.guias_aceptadas }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-danger-50 text-danger-600">
                <i class="ph ph-x-circle text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Rechazadas</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.guias_rechazadas }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm rounded-12">
          <div class="card-body p-16">
            <div class="d-flex align-items-center gap-12">
              <div class="w-40 h-40 rounded-8 flex-center bg-purple-50 text-purple-600">
                <i class="ph ph-package text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-2">Peso (kg)</p>
                <h6 class="text-heading fw-semibold mb-0">{{ estadisticas.peso_total_transportado | number:'1.2-2' }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card border-0 shadow-sm rounded-12 mb-24">
      <div class="card-body p-24">
        <div class="row">
          <div class="col-md-3 mb-16">
            <label class="form-label text-heading fw-medium mb-8">Estado</label>
            <select class="form-select px-16 py-12 border rounded-8" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="RECHAZADO">Rechazado</option>
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
            <label class="form-label text-heading fw-medium mb-8">Fecha Fin</label>
            <input 
              type="date" 
              class="form-control px-16 py-12 border rounded-8"
              [(ngModel)]="filtroFechaFin" 
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

    <!-- Tabla de guías -->
    <div class="card border-0 shadow-sm rounded-12">
      <div class="card-body p-0">
        
        <!-- Loading state -->
        <div *ngIf="loading" class="text-center py-40">
          <div class="spinner-border text-main-600" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-gray-500 mt-12 mb-0">Cargando guías de remisión...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="alert alert-danger mx-24 mt-24" role="alert">
          <i class="ph ph-exclamation-triangle me-8"></i>
          {{ error }}
          <button 
            type="button" 
            class="btn btn-sm btn-outline-danger ms-16"
            (click)="cargarGuias()">
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
                <th class="px-24 py-16 text-heading fw-semibold border-0">Fecha</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Cliente</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Destinatario</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Peso (kg)</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0">Estado</th>
                <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let guia of guias" class="border-bottom border-gray-100">
                <!-- Número -->
                <td class="px-24 py-16">
                  <span class="text-heading fw-semibold">{{ guia.numero_completo }}</span>
                </td>

                <!-- Fecha -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ guia.fecha_emision | date:'dd/MM/yyyy' }}</span>
                </td>

                <!-- Cliente -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ guia.cliente?.razon_social || 'N/A' }}</span>
                </td>

                <!-- Destinatario -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ guia.destinatario_razon_social }}</span>
                </td>

                <!-- Peso -->
                <td class="px-24 py-16">
                  <span class="text-heading">{{ guia.peso_total | number:'1.2-2' }}</span>
                </td>

                <!-- Estado -->
                <td class="px-24 py-16">
                  <span class="badge px-12 py-6 rounded-pill fw-medium"
                        [ngClass]="getEstadoClass(guia.estado)">
                    {{ guia.estado_nombre || guia.estado }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-24 py-16 text-center">
                  <div class="d-flex justify-content-center gap-8">
                    <!-- Ver Detalle -->
                    <button 
                      class="btn bg-info-50 hover-bg-info-100 text-info-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Ver Detalle"
                      (click)="verDetalle(guia)">
                      <i class="ph ph-eye text-sm"></i>
                    </button>

                    <!-- Enviar a SUNAT -->
                    <button 
                      *ngIf="guia.estado === 'PENDIENTE'"
                      class="btn bg-primary-50 hover-bg-primary-100 text-primary-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Enviar a SUNAT"
                      (click)="enviarSunat(guia)" 
                      [disabled]="enviando">
                      <i class="ph ph-paper-plane text-sm"></i>
                    </button>

                    <!-- Descargar XML -->
                    <button 
                      *ngIf="guia.estado === 'ACEPTADO'"
                      class="btn bg-success-50 hover-bg-success-100 text-success-600 w-32 h-32 rounded-6 flex-center transition-2"
                      title="Descargar XML"
                      (click)="descargarXML(guia)" 
                      [disabled]="descargando">
                      <i class="ph ph-file-code text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div *ngIf="guias.length === 0" class="text-center py-40">
            <i class="ph ph-file-text text-gray-300 text-6xl mb-16"></i>
            <h6 class="text-heading fw-semibold mb-8">No hay guías de remisión</h6>
            <p class="text-gray-500 mb-16">No se encontraron guías con los filtros aplicados.</p>
            <button 
              class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
              (click)="nuevaGuia()">
              <i class="ph ph-plus me-8"></i>
              Crear Primera Guía
            </button>
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
  `,
  styles: [`
    .table td { vertical-align: middle; }
    .flex-center { display: flex; align-items: center; justify-content: center; }
    .transition-2 { transition: all 0.2s ease; }
  `]
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
    private guiasService: GuiasRemisionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarGuias();
    this.cargarEstadisticas();
  }

  cargarGuias(): void {
    this.loading = true;
    this.error = '';
    
    const filtros = {
      estado: this.filtroEstado,
      fecha_inicio: this.filtroFechaInicio,
      fecha_fin: this.filtroFechaFin
    };

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
    this.filtroEstado = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.cargarGuias();
    this.cargarEstadisticas();
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADO':
        return 'bg-success-50 text-success-600';
      case 'ENVIADO':
        return 'bg-primary-50 text-primary-600';
      case 'RECHAZADO':
        return 'bg-danger-50 text-danger-600';
      case 'PENDIENTE':
        return 'bg-warning-50 text-warning-600';
      default:
        return 'bg-gray-50 text-gray-600';
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

  onGuiaCreada(guia: any): void {
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
      error: (err) => {
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
      error: (err) => {
        this.descargando = false;
        Swal.fire('Error', 'No se pudo descargar el XML', 'error');
      }
    });
  }
}
