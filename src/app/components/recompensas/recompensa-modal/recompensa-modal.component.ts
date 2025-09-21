import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { Recompensa, TipoRecompensa, RecompensaFormData } from '../../../models/recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';

@Component({
  selector: 'app-recompensa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensa-modal.component.html',
  styleUrls: ['./recompensa-modal.component.scss']
})
export class RecompensaModalComponent implements OnInit, OnDestroy {
  @Input() recompensa: Recompensa | null = null;
  @Input() tipos: TipoRecompensa[] = [];
  @Input() isEdit = false;
  
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();
  
  // Formulario
  recompensaForm: FormGroup;
  
  // Estados
  loading = false;
  submitted = false;
  
  // Fechas mínimas
  minDate = new Date().toISOString().split('T')[0];
  minEndDate = '';
  
  private destroy$ = new Subject<void>();
  private recompensasService = inject(RecompensasService);
  
  constructor(
    private fb: FormBuilder
  ) {
    this.recompensaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: [''],
      tipo: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      activo: [true]
    });
  }
  
  ngOnInit(): void {
    this.setupFormValidation();
    
    if (this.isEdit && this.recompensa) {
      this.loadRecompensaData();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupFormValidation(): void {
    // Validación de fechas
    this.recompensaForm.get('fecha_inicio')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(fechaInicio => {
        if (fechaInicio) {
          this.minEndDate = fechaInicio;
          const fechaFin = this.recompensaForm.get('fecha_fin')?.value;
          if (fechaFin && fechaFin <= fechaInicio) {
            this.recompensaForm.get('fecha_fin')?.setValue('');
          }
        }
      });
  }
  
  private loadRecompensaData(): void {
    if (!this.recompensa) return;
    
    this.recompensaForm.patchValue({
      nombre: this.recompensa.nombre,
      descripcion: this.recompensa.descripcion,
      tipo: this.recompensa.tipo,
      fecha_inicio: this.recompensa.fecha_inicio.split('T')[0],
      fecha_fin: this.recompensa.fecha_fin.split('T')[0],
      activo: this.recompensa.activo
    });
    
    // Establecer fecha mínima de fin
    this.minEndDate = this.recompensa.fecha_inicio.split('T')[0];
  }
  
  get f() {
    return this.recompensaForm.controls;
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
  
  getTipoDescription(tipo: string): string {
    const descriptions: Record<string, string> = {
      'puntos': 'Sistema de acumulación de puntos por compras',
      'descuento': 'Descuentos directos en productos o servicios',
      'envio_gratis': 'Envío gratuito en compras',
      'regalo': 'Productos de regalo o muestras gratis'
    };
    return descriptions[tipo] || '';
  }
  
  getTipoLabel(tipo: string): string {
    const tipoObj = this.tipos.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }
  
  onTipoChange(): void {
    const tipo = this.recompensaForm.get('tipo')?.value;
    if (tipo && !this.recompensaForm.get('descripcion')?.value) {
      this.recompensaForm.get('descripcion')?.setValue(this.getTipoDescription(tipo));
    }
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.recompensaForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const formData: RecompensaFormData = this.recompensaForm.value;
    
    const request = this.isEdit && this.recompensa
      ? this.recompensasService.updateRecompensa(this.recompensa.id, formData)
      : this.recompensasService.createRecompensa(formData);
    
    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.guardado.emit();
          }
        },
        error: (error) => {
          console.error('Error al guardar recompensa:', error);
          // Aquí podrías mostrar un mensaje de error
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  
  onCancel(): void {
    this.cancelado.emit();
  }
  
  getModalTitle(): string {
    return this.isEdit ? 'Editar Recompensa' : 'Nueva Recompensa';
  }
  
  getSubmitButtonText(): string {
    if (this.loading) {
      return this.isEdit ? 'Actualizando...' : 'Creando...';
    }
    return this.isEdit ? 'Actualizar' : 'Crear';
  }
}
