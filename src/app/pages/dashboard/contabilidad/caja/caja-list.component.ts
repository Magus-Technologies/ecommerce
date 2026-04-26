import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService, Caja, CajaMovimiento } from '../../../../services/contabilidad/caja.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-caja-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container-fluid p-24">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h5 class="text-heading fw-semibold mb-8">Gestión de Caja</h5>
          <p class="text-gray-500 mb-0">Control de cajas y movimientos diarios</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn bg-main-600 text-white" (click)="abrirModalCrear()">
            <i class="ph ph-plus me-2"></i>
            Crear Caja
          </button>
          <button class="btn bg-success-600 text-white" (click)="abrirModalApertura()">
            <i class="ph ph-lock-open me-2"></i>
            Aperturar Caja
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-24">
        <li class="nav-item">
          <a class="nav-link" [class.active]="tabActivo === 'activas'"
             (click)="cambiarTab('activas')" style="cursor:pointer">
            <i class="ph ph-lock-open me-1"></i>
            Cajas Activas
            <span class="badge bg-success-100 text-success-600 ms-1">{{ movimientosActivos.length }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="tabActivo === 'historial'"
             (click)="cambiarTab('historial')" style="cursor:pointer">
            <i class="ph ph-clock-counter-clockwise me-1"></i>
            Historial
          </a>
        </li>
      </ul>

      <!-- TAB: Cajas Activas -->
      <div *ngIf="tabActivo === 'activas'">
      <div class="row g-4 mb-24">
        <div class="col-md-4" *ngFor="let movimiento of movimientosActivos">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 class="fw-semibold">{{ movimiento.caja?.nombre }}</h6>
                  <span class="badge bg-success-50 text-success-600">ABIERTA</span>
                </div>
                <button class="btn btn-sm btn-danger" (click)="cerrarCaja(movimiento)">
                  <i class="ph ph-lock"></i> Cerrar
                </button>
              </div>
              <div class="mb-2">
                <small class="text-gray-500">Monto Inicial:</small>
                <p class="fw-semibold mb-0">S/ {{ movimiento.monto_inicial | number:'1.2-2' }}</p>
              </div>
              <div class="mb-2">
                <small class="text-gray-500">Apertura:</small>
                <p class="mb-0">{{ movimiento.fecha_apertura | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button class="btn btn-sm btn-outline-primary w-100 mt-2" 
                      (click)="verReporte(movimiento.id)">
                <i class="ph ph-file-text me-1"></i>
                Ver Reporte
              </button>
            </div>
          </div>
        </div>

        <!-- Sin cajas activas -->
        <div class="col-12" *ngIf="movimientosActivos.length === 0 && !loading">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
              <i class="ph ph-cash-register text-gray-300" style="font-size: 4rem;"></i>
              <h6 class="mt-3">No hay cajas abiertas</h6>
              <p class="text-gray-500">Apertura una caja para comenzar</p>
              <button class="btn bg-main-600 text-white" (click)="abrirModalApertura()">
                <i class="ph ph-plus me-2"></i>
                Aperturar Caja
              </button>
            </div>
          </div>
        </div>
      </div>

      </div> <!-- /tab activas -->

      <!-- TAB: Historial -->
      <div *ngIf="tabActivo === 'historial'">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom">
          <h6 class="mb-0">Historial de Movimientos</h6>
        </div>
        <div class="card-body p-0">
          <div *ngIf="loadingHistorial" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-gray-500">Cargando historial...</p>
          </div>

          <div *ngIf="!loadingHistorial" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-gray-50">
                <tr>
                  <th>Caja</th>
                  <th>Fecha Apertura</th>
                  <th>Fecha Cierre</th>
                  <th>Monto Inicial</th>
                  <th>Monto Final</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let mov of movimientos">
                  <td>{{ mov.caja?.nombre }}</td>
                  <td>{{ mov.fecha_apertura | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ mov.fecha_cierre ? (mov.fecha_cierre | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                  <td>S/ {{ mov.monto_inicial | number:'1.2-2' }}</td>
                  <td>{{ mov.monto_final ? ('S/ ' + (mov.monto_final | number:'1.2-2')) : '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="mov.estado === 'ABIERTA' ? 'bg-success-50 text-success-600' : 'bg-gray-50 text-gray-600'">
                      {{ mov.estado }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" (click)="verReporte(mov.id)">
                      <i class="ph ph-file-text"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div> <!-- /tab historial -->
    </div>

    <!-- Modal Apertura -->
    <div class="modal fade" [class.show]="mostrarModalApertura" 
         [style.display]="mostrarModalApertura ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Aperturar Caja</h5>
            <button type="button" class="btn-close" (click)="cerrarModalApertura()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Caja *</label>
              <select class="form-select" [(ngModel)]="datosApertura.caja_id" required>
                <option value="">Seleccione una caja</option>
                <option *ngFor="let caja of cajas" [value]="caja.id">{{ caja.nombre }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Monto Inicial *</label>
              <input type="number" class="form-control" [(ngModel)]="datosApertura.monto_inicial" 
                     placeholder="0.00" step="0.01" min="0" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Observaciones</label>
              <textarea class="form-control" rows="3" [(ngModel)]="datosApertura.observaciones"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarModalApertura()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="aperturar()" [disabled]="procesando">
              <span *ngIf="procesando" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesando ? 'Aperturando...' : 'Aperturar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="mostrarModalApertura" class="modal-backdrop fade show"></div>

    <!-- Modal Cierre -->
    <div class="modal fade" [class.show]="mostrarModalCierre" 
         [style.display]="mostrarModalCierre ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cerrar Caja</h5>
            <button type="button" class="btn-close" (click)="cerrarModalCierre()"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <strong>Caja:</strong> {{ movimientoSeleccionado?.caja?.nombre }}<br>
              <strong>Monto Inicial:</strong> S/ {{ movimientoSeleccionado?.monto_inicial | number:'1.2-2' }}
            </div>
            <div class="mb-3">
              <label class="form-label">Monto Final (Arqueo) *</label>
              <input type="number" class="form-control" [(ngModel)]="datosCierre.monto_final" 
                     placeholder="0.00" step="0.01" min="0" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Observaciones</label>
              <textarea class="form-control" rows="3" [(ngModel)]="datosCierre.observaciones"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarModalCierre()">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="confirmarCierre()" [disabled]="procesando">
              <span *ngIf="procesando" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesando ? 'Cerrando...' : 'Cerrar Caja' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="mostrarModalCierre" class="modal-backdrop fade show"></div>

    <!-- Modal Crear Caja -->
    <div class="modal fade" [class.show]="mostrarModalCrear" 
         [style.display]="mostrarModalCrear ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Crear Nueva Caja</h5>
            <button type="button" class="btn-close" (click)="cerrarModalCrear()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nombre de la Caja *</label>
              <input type="text" class="form-control" [(ngModel)]="datosCrear.nombre" 
                     placeholder="Ej: Caja Principal" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" rows="3" [(ngModel)]="datosCrear.descripcion" 
                        placeholder="Descripción de la caja"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Ubicación</label>
              <input type="text" class="form-control" [(ngModel)]="datosCrear.ubicacion" 
                     placeholder="Ej: Mostrador 1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarModalCrear()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="crearCaja()" [disabled]="procesando">
              <span *ngIf="procesando" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesando ? 'Creando...' : 'Crear Caja' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="mostrarModalCrear" class="modal-backdrop fade show"></div>
  `,
    styles: [`
    .modal { overflow-y: auto; }
  `]
})
export class CajaListComponent implements OnInit {
    tabActivo: 'activas' | 'historial' = 'activas';
    cajas: Caja[] = [];
    movimientos: any[] = [];
    movimientosActivos: any[] = [];
    loading = false;
    loadingHistorial = false;
    procesando = false;

    mostrarModalApertura = false;
    mostrarModalCierre = false;
    mostrarModalCrear = false;
    movimientoSeleccionado: any = null;

    datosApertura = {
        caja_id: '',
        monto_inicial: 0,
        observaciones: ''
    };

    datosCrear = {
        nombre: '',
        descripcion: '',
        ubicacion: ''
    };

    datosCierre = {
        monto_final: 0,
        observaciones: ''
    };

    constructor(private cajaService: CajaService) { }

    ngOnInit(): void {
        this.cargarCajas();
        this.cargarMovimientosActivos();
    }

    cambiarTab(tab: 'activas' | 'historial'): void {
        this.tabActivo = tab;
        if (tab === 'historial' && this.movimientos.length === 0) {
            this.cargarHistorial();
        }
    }

    cargarHistorial(): void {
        this.loadingHistorial = true;
        this.cajaService.getHistorial().subscribe({
            next: (res) => {
                this.movimientos = res.data || [];
                this.loadingHistorial = false;
            },
            error: () => { this.loadingHistorial = false; }
        });
    }

    cargarCajas(): void {
        this.cajaService.getCajas({ activo: true }).subscribe({
            next: (res) => {
                this.cajas = res.data || [];
            },
            error: (err) => console.error('Error al cargar cajas:', err)
        });
    }

    cargarMovimientosActivos(): void {
        this.loading = true;
        this.cajaService.getMovimientosActivos().subscribe({
            next: (res) => {
                this.movimientosActivos = res.data || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error:', err);
                this.loading = false;
            }
        });
    }

    abrirModalApertura(): void {
        this.datosApertura = { caja_id: '', monto_inicial: 0, observaciones: '' };
        this.mostrarModalApertura = true;
    }

    cerrarModalApertura(): void {
        this.mostrarModalApertura = false;
    }

    abrirModalCrear(): void {
        this.datosCrear = { nombre: '', descripcion: '', ubicacion: '' };
        this.mostrarModalCrear = true;
    }

    cerrarModalCrear(): void {
        this.mostrarModalCrear = false;
    }

    crearCaja(): void {
        if (!this.datosCrear.nombre.trim()) {
            Swal.fire('Error', 'El nombre de la caja es requerido', 'error');
            return;
        }

        this.procesando = true;
        this.cajaService.crearCaja({
            nombre: this.datosCrear.nombre,
            codigo: this.datosCrear.nombre.toUpperCase().substring(0, 20)
        }).subscribe({
            next: (res) => {
                Swal.fire('Éxito', 'Caja creada correctamente', 'success');
                this.cerrarModalCrear();
                this.cargarCajas();
                this.procesando = false;
            },
            error: (err) => {
                Swal.fire('Error', err.error?.message || 'Error al crear caja', 'error');
                this.procesando = false;
            }
        });
    }

    aperturar(): void {
        if (!this.datosApertura.caja_id || this.datosApertura.monto_inicial <= 0) {
            Swal.fire('Error', 'Complete todos los campos requeridos', 'error');
            return;
        }

        this.procesando = true;
        this.cajaService.aperturarCaja({
            caja_id: Number(this.datosApertura.caja_id),
            monto_inicial: this.datosApertura.monto_inicial,
            observaciones: this.datosApertura.observaciones
        }).subscribe({
            next: (res) => {
                Swal.fire('Éxito', 'Caja aperturada correctamente', 'success');
                this.cerrarModalApertura();
                this.cargarMovimientosActivos();
                this.procesando = false;
            },
            error: (err) => {
                Swal.fire('Error', err.error?.message || 'Error al aperturar caja', 'error');
                this.procesando = false;
            }
        });
    }

    cerrarCaja(movimiento: any): void {
        this.movimientoSeleccionado = movimiento;
        this.datosCierre = { monto_final: 0, observaciones: '' };
        this.mostrarModalCierre = true;
    }

    cerrarModalCierre(): void {
        this.mostrarModalCierre = false;
        this.movimientoSeleccionado = null;
    }

    confirmarCierre(): void {
        if (this.datosCierre.monto_final <= 0) {
            Swal.fire('Error', 'Ingrese el monto final del arqueo', 'error');
            return;
        }

        this.procesando = true;
        this.cajaService.cerrarCaja(this.movimientoSeleccionado.id, this.datosCierre).subscribe({
            next: (res) => {
                Swal.fire('Éxito', 'Caja cerrada correctamente', 'success');
                this.cerrarModalCierre();
                this.cargarMovimientosActivos();
                this.procesando = false;
            },
            error: (err) => {
                Swal.fire('Error', err.error?.message || 'Error al cerrar caja', 'error');
                this.procesando = false;
            }
        });
    }

    verReporte(movimientoId: number): void {
        this.cajaService.getReporteCaja(movimientoId).subscribe({
            next: (res) => {
                Swal.fire({
                    title: 'Reporte de Caja',
                    html: `<pre>${JSON.stringify(res.data, null, 2)}</pre>`,
                    width: '800px'
                });
            },
            error: (err) => {
                Swal.fire('Error', 'No se pudo cargar el reporte', 'error');
            }
        });
    }
}
