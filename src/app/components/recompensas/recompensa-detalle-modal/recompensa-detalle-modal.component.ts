import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { Recompensa } from '../../../models/recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';

interface RecompensaDetalle {
  recompensa: Recompensa;
  configuracion: {
    clientes: Array<{
      id: number;
      segmento: string;
      segmento_nombre: string;
      cliente: any;
      es_cliente_especifico: boolean;
    }>;
    productos: Array<{
      id: number;
      tipo_elemento: string;
      nombre_elemento: string;
      producto: any;
      categoria: any;
    }>;
    puntos: Array<{
      id: number;
      tipo_calculo: string;
      valor: number;
      minimo_compra: number;
      maximo_puntos: number;
      multiplicador_nivel: number;
    }>;
    descuentos: any[];
    envios: any[];
    regalos: any[];
  };
  historial_reciente: Array<{
    id: number;
    cliente: string;
    puntos_otorgados: number;
    beneficio_aplicado: string;
    fecha_aplicacion: string;
    tiempo_transcurrido: string;
  }>;
}

@Component({
  selector: 'app-recompensa-detalle-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recompensa-detalle-modal.component.html',
  styleUrls: ['./recompensa-detalle-modal.component.scss']
})
export class RecompensaDetalleModalComponent implements OnInit, OnDestroy {
  @Input() recompensa: Recompensa | null = null;
  
  @Output() cerrado = new EventEmitter<void>();
  
  // Estados
  loading = false;
  detalle: RecompensaDetalle | null = null;
  activeTab = 'general';
  
  private destroy$ = new Subject<void>();
  private recompensasService = inject(RecompensasService);
  
  constructor() {}
  
  ngOnInit(): void {
    if (this.recompensa) {
      this.loadDetalle();
    }
  }
  
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
  
  getTiempoTranscurrido(fecha: string): string {
    const ahora = new Date();
    const fechaAplicacion = new Date(fecha);
    const diffMs = ahora.getTime() - fechaAplicacion.getTime();
    
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutos < 60) {
      return `hace ${diffMinutos} min`;
    } else if (diffHoras < 24) {
      return `hace ${diffHoras}h`;
    } else {
      return `hace ${diffDias} días`;
    }
  }
  
  getDiasVigencia(): number {
    if (!this.detalle) return 0;
    
    const fechaInicio = new Date(this.detalle.recompensa.fecha_inicio);
    const fechaFin = new Date(this.detalle.recompensa.fecha_fin);
    const diffMs = fechaFin.getTime() - fechaInicio.getTime();
    
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  
  getDuracionTotal(): string {
    if (!this.detalle) return '';
    
    const dias = this.getDiasVigencia();
    
    if (dias < 30) {
      return `${dias} días`;
    } else if (dias < 365) {
      const meses = Math.floor(dias / 30);
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    } else {
      const años = Math.floor(dias / 365);
      return `${años} año${años > 1 ? 's' : ''}`;
    }
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  onCerrar(): void {
    this.cerrado.emit();
  }
  
  private loadDetalle(): void {
    if (!this.recompensa) return;
    
    this.loading = true;
    
    this.recompensasService.getRecompensaDetalle(this.recompensa.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.detalle = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar detalle de recompensa:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
