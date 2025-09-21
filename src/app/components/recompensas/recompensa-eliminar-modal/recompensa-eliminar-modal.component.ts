import { Component, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { Recompensa } from '../../../models/recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';

@Component({
  selector: 'app-recompensa-eliminar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recompensa-eliminar-modal.component.html',
  styleUrls: ['./recompensa-eliminar-modal.component.scss']
})
export class RecompensaEliminarModalComponent implements OnDestroy {
  @Input() recompensa: Recompensa | null = null;
  
  @Output() eliminado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();
  
  // Estados
  loading = false;
  confirmacionTexto = '';
  textoConfirmacion = 'ELIMINAR';
  
  private destroy$ = new Subject<void>();
  private recompensasService = inject(RecompensasService);
  
  constructor() {}
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'puntos': 'ph-coins',
      'descuento': 'ph-percent',
      'envio_gratis': 'ph-truck',
      'regalo': 'ph-gift'
    };
    return icons[tipo] || 'ph-question';
  }
  
  getEstadoBadgeClass(activo: boolean, esVigente: boolean): string {
    if (!activo) return 'badge-secondary';
    if (esVigente) return 'badge-success';
    return 'badge-warning';
  }
  
  getEstadoText(activo: boolean, esVigente: boolean): string {
    if (!activo) return 'Inactiva';
    if (esVigente) return 'Vigente';
    return 'Expirada';
  }
  
  getImpactoText(): string {
    if (!this.recompensa) return '';
    
    const aplicaciones = this.recompensa.total_aplicaciones;
    
    if (aplicaciones === 0) {
      return 'Esta recompensa no ha sido utilizada aún, por lo que su eliminación no afectará a ningún cliente.';
    } else if (aplicaciones < 10) {
      return `Esta recompensa ha sido utilizada ${aplicaciones} veces. Su eliminación afectará a un número reducido de clientes.`;
    } else if (aplicaciones < 100) {
      return `Esta recompensa ha sido utilizada ${aplicaciones} veces. Su eliminación afectará a varios clientes.`;
    } else {
      return `Esta recompensa ha sido utilizada ${aplicaciones} veces. Su eliminación afectará a muchos clientes.`;
    }
  }
  
  getImpactoClass(): string {
    if (!this.recompensa) return 'text-info';
    
    const aplicaciones = this.recompensa.total_aplicaciones;
    
    if (aplicaciones === 0) return 'text-success';
    if (aplicaciones < 10) return 'text-warning';
    return 'text-danger';
  }
  
  canConfirm(): boolean {
    return this.confirmacionTexto === this.textoConfirmacion;
  }
  
  onConfirmar(): void {
    if (!this.recompensa || !this.canConfirm()) return;
    
    this.loading = true;
    
    this.recompensasService.deleteRecompensa(this.recompensa.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.eliminado.emit();
          }
        },
        error: (error) => {
          console.error('Error al eliminar recompensa:', error);
          // Aquí podrías mostrar un mensaje de error
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  onCancelar(): void {
    this.cancelado.emit();
  }
}
