import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { 
  ConfiguracionPuntos,
  ReglaEspecial,
  SimulacionPuntos,
  PuntosFormData
} from '../../../models/puntos-recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-puntos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-puntos.component.html',
  styleUrls: ['./recompensas-puntos.component.scss']
})
export class RecompensasPuntosComponent implements OnInit, OnDestroy {
  // Estados
  loading = false;
  activeTab = 'configuracion';
  
  // Datos
  configuracion: ConfiguracionPuntos | null = null;
  reglasEspeciales: ReglaEspecial[] = [];
  simulacion: SimulacionPuntos | null = null;
  
  // Formularios
  configuracionForm: FormGroup;
  simulacionForm: FormGroup;
  
  // Modales
  showSimulacionModal = false;
  
  // Permisos
  puedeEditar = false;
  puedeVer = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.configuracionForm = this.fb.group({
      puntos_por_peso: [0.1, [Validators.required, Validators.min(0.01)]],
      puntos_minimos_redencion: [100, [Validators.required, Validators.min(1)]],
      valor_punto_pesos: [1, [Validators.required, Validators.min(0.01)]],
      puntos_maximos_por_compra: [1000, [Validators.required, Validators.min(1)]],
      dias_expiracion: [365, [Validators.required, Validators.min(1)]],
      activo: [true]
    });
    
    this.simulacionForm = this.fb.group({
      monto_compra: [100, [Validators.required, Validators.min(0.01)]],
      categoria_id: [''],
      producto_id: ['']
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.loadConfiguracion();
    this.loadReglasEspeciales();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkPermissions(): void {
    this.puedeEditar = this.permissionsService.hasPermission('recompensas.edit');
    this.puedeVer = this.permissionsService.hasPermission('recompensas.ver');
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  onSimularPuntos(): void {
    this.showSimulacionModal = true;
  }
  
  onSubmitConfiguracion(): void {
    if (this.configuracionForm.invalid) return;
    
    this.loading = true;
    const formData: PuntosFormData = this.configuracionForm.value;
    
    // Simular guardado
    setTimeout(() => {
      this.loadConfiguracion();
      this.loading = false;
    }, 1000);
  }
  
  onSubmitSimulacion(): void {
    if (this.simulacionForm.invalid) return;
    
    this.loading = true;
    const formData = this.simulacionForm.value;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.simularPuntos(formData).subscribe({
    //   next: (data) => {
    //     this.simulacion = data;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error en simulación:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar mensaje de no implementado
    setTimeout(() => {
      this.simulacion = {
        monto_compra: formData.monto_compra,
        categoria_id: formData.categoria_id,
        producto_id: formData.producto_id,
        es_registro: false,
        resultado: {
          puntos_por_compra: 0,
          puntos_por_monto: 0,
          puntos_registro: 0,
          puntos_reglas_especiales: 0,
          total_puntos: 0,
          reglas_aplicadas: [],
          descripcion_calculo: 'Simulación no implementada - Conecte con el backend para obtener resultados reales'
        }
      };
      this.loading = false;
    }, 500);
  }
  
  onModalClosed(): void {
    this.showSimulacionModal = false;
    this.simulacion = null;
    this.simulacionForm.reset();
    this.simulacionForm.patchValue({ monto_compra: 100 });
  }
  
  private loadConfiguracion(): void {
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getConfiguracionPuntos().subscribe({
    //   next: (data) => {
    //     this.configuracion = data;
    //     if (this.configuracion) {
    //       this.configuracionForm.patchValue(this.configuracion);
    //     }
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando configuración:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar configuración por defecto
    setTimeout(() => {
      this.configuracion = {
        id: 1,
        puntos_por_peso: 0.1,
        puntos_minimos_redencion: 100,
        valor_punto_pesos: 1,
        puntos_maximos_por_compra: 1000,
        dias_expiracion: 365,
        activo: true,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      if (this.configuracion) {
        this.configuracionForm.patchValue(this.configuracion);
      }
      this.loading = false;
    }, 500);
  }
  
  private loadReglasEspeciales(): void {
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getReglasEspeciales().subscribe({
    //   next: (data) => {
    //     this.reglasEspeciales = data;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando reglas especiales:', error);
    //   }
    // });
    
    // Por ahora, mostrar lista vacía
    this.reglasEspeciales = [];
  }
}
