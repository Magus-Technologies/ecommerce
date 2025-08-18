// src/app/components/modal-direccion/modal-direccion.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DireccionesService, Direccion } from '../../services/direcciones.service';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../services/ubigeo.service';

@Component({
  selector: 'app-modal-direccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="modalDireccion" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 rounded-12">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-heading fw-semibold">
              {{ direccion ? 'Editar Dirección' : 'Nueva Dirección' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-24">
            <!-- Mensaje de error -->
            <div *ngIf="error" class="alert alert-danger mb-16">
              {{ error }}
            </div>

            <form [formGroup]="direccionForm" (ngSubmit)="onSubmit()">
              <!-- Nombre del destinatario -->
              <div class="mb-16">
                <label class="form-label text-heading fw-medium mb-8">Nombre del destinatario *</label>
                <input type="text" 
                       class="form-control px-16 py-12 border rounded-8"
                       [class.is-invalid]="direccionForm.get('nombre_destinatario')?.invalid && direccionForm.get('nombre_destinatario')?.touched"
                       formControlName="nombre_destinatario"
                       placeholder="¿A nombre de quién?">
                <div class="invalid-feedback" 
                     *ngIf="direccionForm.get('nombre_destinatario')?.invalid && direccionForm.get('nombre_destinatario')?.touched">
                  El nombre del destinatario es requerido
                </div>
              </div>

              <!-- Ubicación -->
              <div class="row">
                <div class="col-md-4 mb-16">
                  <label class="form-label text-heading fw-medium mb-8">Departamento *</label>
                  <select class="form-select px-16 py-12 border rounded-8"
                          [class.is-invalid]="direccionForm.get('departamento_id')?.invalid && direccionForm.get('departamento_id')?.touched"
                          formControlName="departamento_id">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let dept of departamentos" [value]="dept.id">
                      {{ dept.nombre }}
                    </option>
                  </select>
                  <div class="invalid-feedback" 
                       *ngIf="direccionForm.get('departamento_id')?.invalid && direccionForm.get('departamento_id')?.touched">
                    Selecciona un departamento
                  </div>
                </div>

                <div class="col-md-4 mb-16">
                  <label class="form-label text-heading fw-medium mb-8">Provincia *</label>
                  <select class="form-select px-16 py-12 border rounded-8"
                          [class.is-invalid]="direccionForm.get('provincia_id')?.invalid && direccionForm.get('provincia_id')?.touched"
                          formControlName="provincia_id"
                          [disabled]="!direccionForm.get('departamento_id')?.value">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let prov of provincias" [value]="prov.id">
                      {{ prov.nombre }}
                    </option>
                  </select>
                  <div *ngIf="isLoadingProvincias" class="text-muted text-xs mt-4">
                    Cargando provincias...
                  </div>
                  <div class="invalid-feedback" 
                       *ngIf="direccionForm.get('provincia_id')?.invalid && direccionForm.get('provincia_id')?.touched">
                    Selecciona una provincia
                  </div>
                </div>

                <div class="col-md-4 mb-16">
                  <label class="form-label text-heading fw-medium mb-8">Distrito *</label>
                  <select class="form-select px-16 py-12 border rounded-8"
                          [class.is-invalid]="direccionForm.get('distrito_id')?.invalid && direccionForm.get('distrito_id')?.touched"
                          formControlName="distrito_id"
                          [disabled]="!direccionForm.get('provincia_id')?.value">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let dist of distritos" [value]="dist.id">
                      {{ dist.nombre }}
                    </option>
                  </select>
                  <div *ngIf="isLoadingDistritos" class="text-muted text-xs mt-4">
                    Cargando distritos...
                  </div>
                  <div class="invalid-feedback" 
                       *ngIf="direccionForm.get('distrito_id')?.invalid && direccionForm.get('distrito_id')?.touched">
                    Selecciona un distrito
                  </div>
                </div>
              </div>

              <!-- Dirección completa -->
              <div class="mb-16">
                <label class="form-label text-heading fw-medium mb-8">Dirección completa *</label>
                <textarea class="form-control px-16 py-12 border rounded-8" 
                          rows="3"
                          [class.is-invalid]="direccionForm.get('direccion_completa')?.invalid && direccionForm.get('direccion_completa')?.touched"
                          formControlName="direccion_completa"
                          placeholder="Av/Jr/Calle, número, manzana, lote, interior, referencias..."></textarea>
                <div class="invalid-feedback" 
                     *ngIf="direccionForm.get('direccion_completa')?.invalid && direccionForm.get('direccion_completa')?.touched">
                  La dirección completa es requerida
                </div>
              </div>

              <!-- Teléfono -->
              <div class="mb-16">
                <label class="form-label text-heading fw-medium mb-8">Teléfono (opcional)</label>
                <input type="tel" 
                       class="form-control px-16 py-12 border rounded-8"
                       formControlName="telefono"
                       placeholder="999 999 999">
              </div>

              <!-- Dirección predeterminada -->
              <div class="form-check">
                <input class="form-check-input" 
                       type="checkbox" 
                       formControlName="predeterminada"
                       id="predeterminada">
                <label class="form-check-label text-heading fw-medium" for="predeterminada">
                  Establecer como dirección principal
                </label>
              </div>

              <!-- Campo oculto para ubigeo -->
              <input type="hidden" formControlName="ubigeo_id">
            </form>
          </div>
          
          <div class="modal-footer border-0 pt-0">
            <button type="button" 
                    class="btn bg-gray-100 hover-bg-gray-200 text-gray-600 px-16 py-8 rounded-8"
                    data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" 
                    class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    [disabled]="isLoading || direccionForm.invalid"
                    (click)="onSubmit()">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-8"></span>
              <i *ngIf="!isLoading" class="ph ph-check me-8"></i>
              {{ isLoading ? 'Guardando...' : (direccion ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalDireccionComponent implements OnInit, OnChanges {
  
  @Input() direccion: Direccion | null = null;
  @Input() departamentos: Departamento[] = [];
  @Output() direccionGuardada = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  direccionForm: FormGroup;
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];
  isLoadingProvincias = false;
  isLoadingDistritos = false;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private direccionesService: DireccionesService,
    private ubigeoService: UbigeoService
  ) {
    this.direccionForm = this.fb.group({
      nombre_destinatario: ['', [Validators.required, Validators.maxLength(255)]],
      direccion_completa: ['', [Validators.required]],
      telefono: ['', [Validators.maxLength(20)]],
      departamento_id: ['', Validators.required],
      provincia_id: ['', Validators.required],
      distrito_id: ['', Validators.required],
      ubigeo_id: ['', Validators.required],
      predeterminada: [false]
    });
  }

  ngOnInit(): void {
    this.setupUbigeoListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['direccion'] && this.direccionForm) {
      this.loadDireccionData();
    }
  }

  setupUbigeoListeners(): void {
    // Escuchar cambios en departamento
    this.direccionForm.get('departamento_id')?.valueChanges.subscribe((departamentoId) => {
      if (departamentoId) {
        this.loadProvincias(departamentoId);
        this.direccionForm.patchValue({
          provincia_id: '',
          distrito_id: '',
          ubigeo_id: ''
        });
        this.provincias = [];
        this.distritos = [];
      }
    });

    // Escuchar cambios en provincia
    this.direccionForm.get('provincia_id')?.valueChanges.subscribe((provinciaId) => {
      const departamentoId = this.direccionForm.get('departamento_id')?.value;
      if (departamentoId && provinciaId) {
        this.loadDistritos(departamentoId, provinciaId);
        this.direccionForm.patchValue({
          distrito_id: '',
          ubigeo_id: ''
        });
        this.distritos = [];
      }
    });

    // Escuchar cambios en distrito
    this.direccionForm.get('distrito_id')?.valueChanges.subscribe((distritoId) => {
      if (distritoId) {
        const distrito = this.distritos.find(d => d.id === distritoId);
        if (distrito) {
          this.direccionForm.patchValue({
            ubigeo_id: distrito.id_ubigeo
          });
        }
      }
    });
  }

  loadDireccionData(): void {
    if (this.direccion) {
      // Modo edición
      this.direccionForm.patchValue({
        nombre_destinatario: this.direccion.nombre_destinatario,
        direccion_completa: this.direccion.direccion_completa,
        telefono: this.direccion.telefono || '',
        predeterminada: this.direccion.predeterminada,
        ubigeo_id: this.direccion.ubigeo_id
      });

      // Si tiene ubigeo, cargar la cadena de ubicación
      if (this.direccion.ubigeo_id) {
        this.loadUbigeoChain(this.direccion.ubigeo_id);
      }
    } else {
      // Modo creación
      this.direccionForm.reset({
        nombre_destinatario: '',
        direccion_completa: '',
        telefono: '',
        departamento_id: '',
        provincia_id: '',
        distrito_id: '',
        ubigeo_id: '',
        predeterminada: false
      });
      this.provincias = [];
      this.distritos = [];
    }
  }

  loadUbigeoChain(ubigeoId: string): void {
    // Por ahora, simplemente establecemos el ubigeo_id
    // Aquí podrías implementar lógica para cargar la cadena completa si es necesario
    this.direccionForm.patchValue({
      ubigeo_id: ubigeoId
    });
  }

  loadProvincias(departamentoId: string): void {
    this.isLoadingProvincias = true;
    this.ubigeoService.getProvincias(departamentoId).subscribe({
      next: (provincias) => {
        this.provincias = provincias;
        this.isLoadingProvincias = false;
      },
      error: (error) => {
        console.error('Error cargando provincias:', error);
        this.isLoadingProvincias = false;
      }
    });
  }

  loadDistritos(departamentoId: string, provinciaId: string): void {
    this.isLoadingDistritos = true;
    this.ubigeoService.getDistritos(departamentoId, provinciaId).subscribe({
      next: (distritos) => {
        this.distritos = distritos;
        this.isLoadingDistritos = false;
      },
      error: (error) => {
        console.error('Error cargando distritos:', error);
        this.isLoadingDistritos = false;
      }
    });
  }

  onSubmit(): void {
    if (this.direccionForm.valid) {
      this.isLoading = true;
      this.error = '';
      
    const formData = this.direccionForm.value;
      // NUEVA LÍNEA: Asegurarse de que ubigeo_id sea una cadena antes de enviar
      if (formData.ubigeo_id !== null && formData.ubigeo_id !== undefined) {
        formData.ubigeo_id = String(formData.ubigeo_id);
      }

      const request = this.direccion 
        ? this.direccionesService.actualizarDireccion(this.direccion.id, formData)
        : this.direccionesService.crearDireccion(formData);

      request.subscribe({
        next: (response) => {
          console.log('Dirección guardada exitosamente:', response);
          this.direccionGuardada.emit();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al guardar dirección:', error);
          this.error = error.error?.message || 'Error al guardar la dirección';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.direccionForm.controls).forEach(key => {
      const control = this.direccionForm.get(key);
      control?.markAsTouched();
    });
  }

  private cerrarModal(): void {
    this.isLoading = false;
    const modal = document.getElementById('modalDireccion');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.modalCerrado.emit();
  }
}