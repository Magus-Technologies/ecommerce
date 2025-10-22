import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { GuiasRemisionService } from '../../services/guias-remision.service';

interface GuiaRemisionForm {
  tipo_documento: string;
  serie: string;
  numero?: number;
  fecha_emision: string;
  destinatario: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    direccion: string;
  };
  envio: {
    motivo_traslado: string;
    modalidad_traslado: string;
    fecha_inicio_traslado: string;
    peso_bruto_total: number;
    numero_bultos: number;
    direccion_partida: string;
    direccion_llegada: string;
    ubigeo_partida?: string;
    ubigeo_llegada?: string;
  };
  transportista?: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    placa_vehiculo?: string;
    licencia_conducir?: string;
  };
  items: Array<{
    codigo: string;
    descripcion: string;
    unidad_medida: string;
    cantidad: number;
  }>;
}

@Component({
  selector: 'app-guia-remision-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  template: `
    <app-base-modal
      [isOpen]="isOpen"
      [title]="guiaId ? 'Editar Guía de Remisión' : 'Nueva Guía de Remisión'"
      icon="ph ph-truck"
      size="xl"
      headerClass="bg-primary text-white"
      [loading]="loading"
      [confirmDisabled]="!isFormValid()"
      confirmText="Emitir Guía"
      confirmIcon="ph ph-paper-plane"
      (onClose)="close()"
      (onConfirm)="submit()">
      
      <!-- Pasos -->
      <div class="mb-4">
        <ul class="nav nav-pills nav-fill">
          <li class="nav-item">
            <a class="nav-link" [class.active]="paso === 1" (click)="paso = 1">
              <i class="ph ph-user me-1"></i> Destinatario
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="paso === 2" (click)="paso = 2">
              <i class="ph ph-map-pin me-1"></i> Envío
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="paso === 3" (click)="paso = 3">
              <i class="ph ph-truck me-1"></i> Transportista
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [class.active]="paso === 4" (click)="paso = 4">
              <i class="ph ph-package me-1"></i> Items
            </a>
          </li>
        </ul>
      </div>

      <!-- Paso 1: Destinatario -->
      <div *ngIf="paso === 1">
        <h6 class="mb-3">Datos del Destinatario</h6>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tipo Doc. *</label>
            <select class="form-select" [(ngModel)]="form.destinatario.tipo_documento">
              <option value="6">RUC</option>
              <option value="1">DNI</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Número Documento *</label>
            <input type="text" class="form-control" [(ngModel)]="form.destinatario.numero_documento">
          </div>
          <div class="col-md-5">
            <label class="form-label">Razón Social *</label>
            <input type="text" class="form-control" [(ngModel)]="form.destinatario.razon_social">
          </div>
          <div class="col-12">
            <label class="form-label">Dirección *</label>
            <input type="text" class="form-control" [(ngModel)]="form.destinatario.direccion">
          </div>
        </div>
      </div>

      <!-- Paso 2: Envío -->
      <div *ngIf="paso === 2">
        <h6 class="mb-3">Datos del Envío</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Motivo de Traslado *</label>
            <select class="form-select" [(ngModel)]="form.envio.motivo_traslado">
              <option value="01">Venta</option>
              <option value="02">Compra</option>
              <option value="04">Traslado entre establecimientos</option>
              <option value="08">Importación</option>
              <option value="09">Exportación</option>
              <option value="13">Otros</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Modalidad de Traslado *</label>
            <select class="form-select" [(ngModel)]="form.envio.modalidad_traslado">
              <option value="01">Transporte público</option>
              <option value="02">Transporte privado</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Fecha Inicio Traslado *</label>
            <input type="date" class="form-control" [(ngModel)]="form.envio.fecha_inicio_traslado">
          </div>
          <div class="col-md-4">
            <label class="form-label">Peso Bruto Total (kg) *</label>
            <input type="number" class="form-control" [(ngModel)]="form.envio.peso_bruto_total" step="0.01">
          </div>
          <div class="col-md-4">
            <label class="form-label">Número de Bultos *</label>
            <input type="number" class="form-control" [(ngModel)]="form.envio.numero_bultos">
          </div>
          <div class="col-md-6">
            <label class="form-label">Dirección de Partida *</label>
            <input type="text" class="form-control" [(ngModel)]="form.envio.direccion_partida">
          </div>
          <div class="col-md-6">
            <label class="form-label">Dirección de Llegada *</label>
            <input type="text" class="form-control" [(ngModel)]="form.envio.direccion_llegada">
          </div>
        </div>
      </div>

      <!-- Paso 3: Transportista -->
      <div *ngIf="paso === 3">
        <h6 class="mb-3">Datos del Transportista</h6>
        <div class="alert alert-info">
          <i class="ph ph-info me-2"></i>
          Requerido solo para modalidad de transporte privado
        </div>
        <div class="row g-3" *ngIf="form.envio.modalidad_traslado === '02'">
          <div class="col-md-3">
            <label class="form-label">Tipo Doc. *</label>
            <select class="form-select" [(ngModel)]="form.transportista!.tipo_documento">
              <option value="6">RUC</option>
              <option value="1">DNI</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Número Documento *</label>
            <input type="text" class="form-control" [(ngModel)]="form.transportista!.numero_documento">
          </div>
          <div class="col-md-5">
            <label class="form-label">Razón Social *</label>
            <input type="text" class="form-control" [(ngModel)]="form.transportista!.razon_social">
          </div>
          <div class="col-md-6">
            <label class="form-label">Placa del Vehículo</label>
            <input type="text" class="form-control" [(ngModel)]="form.transportista!.placa_vehiculo">
          </div>
          <div class="col-md-6">
            <label class="form-label">Licencia de Conducir</label>
            <input type="text" class="form-control" [(ngModel)]="form.transportista!.licencia_conducir">
          </div>
        </div>
      </div>

      <!-- Paso 4: Items -->
      <div *ngIf="paso === 4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Items a Trasladar</h6>
          <button type="button" class="btn btn-sm btn-primary" (click)="agregarItem()">
            <i class="ph ph-plus me-1"></i> Agregar Item
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="bg-gray-50">
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of form.items; let i = index">
                <td>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="item.codigo">
                </td>
                <td>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="item.descripcion">
                </td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="item.unidad_medida">
                    <option value="NIU">NIU - Unidad</option>
                    <option value="ZZ">ZZ - Servicio</option>
                    <option value="KGM">KGM - Kilogramo</option>
                  </select>
                </td>
                <td>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="item.cantidad" step="0.01">
                </td>
                <td>
                  <button type="button" class="btn btn-sm btn-danger" (click)="eliminarItem(i)">
                    <i class="ph ph-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mensajes -->
      <div *ngIf="error" class="alert alert-danger mt-3">
        <i class="ph ph-warning me-2"></i>{{ error }}
      </div>
      <div *ngIf="success" class="alert alert-success mt-3">
        <i class="ph ph-check-circle me-2"></i>{{ success }}
      </div>

      <!-- Footer personalizado -->
      <div footer class="d-flex justify-content-between w-100">
        <button type="button" class="btn btn-secondary" (click)="close()" [disabled]="loading">
          Cancelar
        </button>
        <div>
          <button *ngIf="paso > 1" type="button" class="btn btn-outline-primary me-2" 
                  (click)="paso = paso - 1" [disabled]="loading">
            <i class="ph ph-arrow-left me-1"></i> Anterior
          </button>
          <button *ngIf="paso < 4" type="button" class="btn btn-primary" 
                  (click)="paso = paso + 1">
            Siguiente <i class="ph ph-arrow-right ms-1"></i>
          </button>
          <button *ngIf="paso === 4" type="button" class="btn btn-success" 
                  (click)="submit()" [disabled]="loading || !isFormValid()">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading" class="ph ph-paper-plane me-1"></i>
            {{ loading ? 'Emitiendo...' : 'Emitir Guía' }}
          </button>
        </div>
      </div>
    </app-base-modal>
  `
})
export class GuiaRemisionModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() guiaId?: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<any>();

  paso = 1;
  loading = false;
  error = '';
  success = '';

  form: GuiaRemisionForm = {
    tipo_documento: '09',
    serie: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    destinatario: {
      tipo_documento: '6',
      numero_documento: '',
      razon_social: '',
      direccion: ''
    },
    envio: {
      motivo_traslado: '01',
      modalidad_traslado: '01',
      fecha_inicio_traslado: new Date().toISOString().split('T')[0],
      peso_bruto_total: 0,
      numero_bultos: 1,
      direccion_partida: '',
      direccion_llegada: ''
    },
    transportista: {
      tipo_documento: '6',
      numero_documento: '',
      razon_social: ''
    },
    items: []
  };

  constructor(private guiasService: GuiasRemisionService) {}

  ngOnInit(): void {
    if (this.guiaId) {
      this.cargarGuia();
    }
  }

  cargarGuia(): void {
    this.loading = true;
    this.guiasService.getGuia(this.guiaId!).subscribe({
      next: (res: any) => {
        // Cargar datos de la guía
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar la guía';
        this.loading = false;
      }
    });
  }

  agregarItem(): void {
    this.form.items.push({
      codigo: '',
      descripcion: '',
      unidad_medida: 'NIU',
      cantidad: 1
    });
  }

  eliminarItem(index: number): void {
    this.form.items.splice(index, 1);
  }

  isFormValid(): boolean {
    return this.form.destinatario.numero_documento !== '' &&
           this.form.destinatario.razon_social !== '' &&
           this.form.envio.direccion_partida !== '' &&
           this.form.envio.direccion_llegada !== '' &&
           this.form.items.length > 0;
  }

  submit(): void {
    if (!this.isFormValid()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    // Mapear form a GuiaRemisionFormData
    const formData: any = {
      cliente_id: 1, // TODO: Obtener del contexto
      destinatario_tipo_documento: this.form.destinatario.tipo_documento,
      destinatario_numero_documento: this.form.destinatario.numero_documento,
      destinatario_razon_social: this.form.destinatario.razon_social,
      destinatario_direccion: this.form.destinatario.direccion,
      destinatario_ubigeo: this.form.envio.ubigeo_llegada || '150101',
      motivo_traslado: this.form.envio.motivo_traslado,
      modalidad_traslado: this.form.envio.modalidad_traslado,
      fecha_inicio_traslado: this.form.envio.fecha_inicio_traslado,
      peso_total: this.form.envio.peso_bruto_total,
      numero_bultos: this.form.envio.numero_bultos,
      punto_partida_ubigeo: this.form.envio.ubigeo_partida || '150101',
      punto_partida_direccion: this.form.envio.direccion_partida,
      punto_llegada_ubigeo: this.form.envio.ubigeo_llegada || '150101',
      punto_llegada_direccion: this.form.envio.direccion_llegada,
      observaciones: '',
      productos: this.form.items.map(item => ({
        producto_id: 1, // TODO: Mapear correctamente
        cantidad: item.cantidad,
        peso_unitario: 1,
        observaciones: item.descripcion
      }))
    };

    // Agregar datos de transportista si aplica
    if (this.form.envio.modalidad_traslado === '02' && this.form.transportista) {
      formData.numero_placa = this.form.transportista.placa_vehiculo;
      formData.numero_licencia = this.form.transportista.licencia_conducir;
    }

    this.guiasService.crearGuia(formData).subscribe({
      next: (res: any) => {
        this.success = 'Guía de remisión emitida exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.onSuccess.emit(res.data);
          this.close();
        }, 1500);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al emitir la guía';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.paso = 1;
    this.error = '';
    this.success = '';
    this.onClose.emit();
  }
}
