import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PagoEntrada {
  totalPagar: number;
}

export interface PagoResultado {
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO' | 'YAPE' | 'PLIN';
  montoEntregado?: number; // para efectivo
  vuelto?: number;
  referencia?: string; // operación/últimos dígitos
}

@Component({
  selector: 'app-pago-rapido-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" (click)="cerrarModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-wallet me-2"></i>
              Pago rápido
            </h5>
            <button type="button" class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Total a pagar</span>
                <strong>S/ {{ totalPagar | number:'1.2-2' }}</strong>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Método de pago</label>
              <select class="form-select" [(ngModel)]="metodo">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CREDITO">Crédito</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
              </select>
            </div>

            <div *ngIf="metodo==='EFECTIVO'" class="mb-3">
              <label class="form-label">Monto entregado</label>
              <input type="number" class="form-control" [(ngModel)]="montoEntregado" min="0" step="0.01">
              <div class="form-text" *ngIf="montoEntregado>=0">
                Vuelto: <strong>S/ {{ (montoEntregado - totalPagar) | number:'1.2-2' }}</strong>
              </div>
              <div class="mt-2 d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-secondary" (click)="montoEntregado = totalPagar">Exacto</button>
                <button class="btn btn-sm btn-outline-secondary" (click)="montoEntregado = redondear(totalPagar, 0)">Redondear</button>
                <button class="btn btn-sm btn-outline-secondary" (click)="montoEntregado = sugerencias[0]">S/ {{ sugerencias[0] }}</button>
                <button class="btn btn-sm btn-outline-secondary" (click)="montoEntregado = sugerencias[1]">S/ {{ sugerencias[1] }}</button>
                <button class="btn btn-sm btn-outline-secondary" (click)="montoEntregado = sugerencias[2]">S/ {{ sugerencias[2] }}</button>
              </div>
            </div>

            <div *ngIf="metodo!=='EFECTIVO'" class="mb-3">
              <label class="form-label">Referencia (opcional)</label>
              <input type="text" class="form-control" [(ngModel)]="referencia" placeholder="N° operación / últimos dígitos">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" [disabled]="!puedeConfirmar()" (click)="confirmar()">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PagoRapidoModalComponent {
  @Input() totalPagar = 0;
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmarPago = new EventEmitter<PagoResultado>();
  @Output() pagoProcesado = new EventEmitter<PagoResultado>();

  metodo: PagoResultado['metodo'] = 'EFECTIVO';
  montoEntregado = 0;
  referencia = '';

  get sugerencias(): number[] {
    const r = this.redondear(this.totalPagar, 0);
    return [r, r + 5, r + 10];
  }

  redondear(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.ceil(valor * factor) / factor;
  }

  puedeConfirmar(): boolean {
    if (this.metodo === 'EFECTIVO') {
      return this.montoEntregado >= this.totalPagar;
    }
    return true;
  }

  cerrarModal(): void {
    this.cancelar.emit();
    this.cerrar.emit();
  }

  confirmar(): void {
    const res: PagoResultado = {
      metodo: this.metodo,
      montoEntregado: this.metodo === 'EFECTIVO' ? this.montoEntregado : undefined,
      vuelto: this.metodo === 'EFECTIVO' ? Math.max(0, this.montoEntregado - this.totalPagar) : undefined,
      referencia: this.metodo !== 'EFECTIVO' ? this.referencia : undefined
    };
    this.confirmarPago.emit(res);
    this.pagoProcesado.emit(res);
    this.cerrar.emit();
  }
}


