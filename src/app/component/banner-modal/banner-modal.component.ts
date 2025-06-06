// src/app/component/banner-modal/banner-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BannersService, Banner, BannerCreate } from '../../services/banner.service';

@Component({
  selector: 'app-banner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="modalCrearBanner" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 rounded-12">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-heading fw-semibold">
              {{ banner ? 'Editar Banner' : 'Nuevo Banner' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-24">
            <form [formGroup]="bannerForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <!-- Información básica -->
                <div class="col-md-8">
                  <div class="mb-16">
                    <label class="form-label text-heading fw-medium mb-8">Título Principal *</label>
                    <input type="text" 
                           class="form-control px-16 py-12 border rounded-8"
                           [class.is-invalid]="bannerForm.get('titulo')?.invalid && bannerForm.get('titulo')?.touched"
                           formControlName="titulo"
                           placeholder="Ej: Ordena tus productos diarios y recibe Express Delivery">
                    <div class="invalid-feedback" 
                         *ngIf="bannerForm.get('titulo')?.invalid && bannerForm.get('titulo')?.touched">
                      El título es requerido (mínimo 5 caracteres)
                    </div>
                  </div>

                  <div class="mb-16">
                    <label class="form-label text-heading fw-medium mb-8">Subtítulo</label>
                    <input type="text" 
                           class="form-control px-16 py-12 border rounded-8"
                           formControlName="subtitulo"
                           placeholder="Ej: Ahorre hasta un 50% en su primer pedido">
                  </div>

                  <div class="mb-16">
                    <label class="form-label text-heading fw-medium mb-8">Descripción</label>
                    <textarea class="form-control px-16 py-12 border rounded-8" 
                              rows="3"
                              formControlName="descripcion"
                              placeholder="Descripción adicional del banner..."></textarea>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Texto del Botón *</label>
                      <input type="text" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="bannerForm.get('texto_boton')?.invalid && bannerForm.get('texto_boton')?.touched"
                             formControlName="texto_boton"
                             placeholder="Ej: Explorar Tienda">
                      <div class="invalid-feedback" 
                           *ngIf="bannerForm.get('texto_boton')?.invalid && bannerForm.get('texto_boton')?.touched">
                        El texto del botón es requerido
                      </div>
                    </div>

                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Precio "Desde"</label>
                      <div class="input-group">
                        <span class="input-group-text bg-gray-50 border-end-0">S/</span>
                        <input type="number" 
                               class="form-control px-16 py-12 border-start-0"
                               formControlName="precio_desde"
                               step="0.01"
                               min="0"
                               placeholder="60.99">
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-8 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">URL de Enlace *</label>
                      <input type="text" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="bannerForm.get('enlace_url')?.invalid && bannerForm.get('enlace_url')?.touched"
                             formControlName="enlace_url"
                             placeholder="/shop">
                      <div class="invalid-feedback" 
                           *ngIf="bannerForm.get('enlace_url')?.invalid && bannerForm.get('enlace_url')?.touched">
                        La URL de enlace es requerida
                      </div>
                    </div>

                    <div class="col-md-4 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Orden *</label>
                      <input type="number" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="bannerForm.get('orden')?.invalid && bannerForm.get('orden')?.touched"
                             formControlName="orden"
                             min="1"
                             placeholder="1">
                      <div class="invalid-feedback" 
                           *ngIf="bannerForm.get('orden')?.invalid && bannerForm.get('orden')?.touched">
                        El orden es requerido
                      </div>
                    </div>
                  </div>

                  <div class="form-check">
                    <input class="form-check-input" 
                           type="checkbox" 
                           formControlName="activo"
                           id="activo">
                    <label class="form-check-label text-heading fw-medium" for="activo">
                      Banner activo
                    </label>
                  </div>
                </div>

                <!-- Imagen -->
                <div class="col-md-4">
                  <label class="form-label text-heading fw-medium mb-8">Imagen del Banner</label>
                  <div class="upload-area border-2 border-dashed border-gray-200 rounded-8 p-16 text-center"
                       [class.border-main-600]="imagePreview">
                    
                    <div *ngIf="!imagePreview" class="text-center">
                      <i class="ph ph-image text-gray-400 text-4xl mb-12"></i>
                      <p class="text-gray-500 text-sm mb-12">Seleccionar imagen del banner</p>
                      <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                        <i class="ph ph-upload me-6"></i>
                        Subir imagen
                        <input type="file" 
                               class="d-none" 
                               accept="image/*"
                               (change)="onImageSelected($event)">
                      </label>
                    </div>

                    <div *ngIf="imagePreview" class="text-center">
                      <img [src]="imagePreview" 
                           alt="Preview" 
                           class="img-fluid rounded-6 mb-12"
                           style="max-height: 200px;">
                      <br>
                      <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                        <i class="ph ph-pencil me-6"></i>
                        Cambiar imagen
                        <input type="file" 
                               class="d-none" 
                               accept="image/*"
                               (change)="onImageSelected($event)">
                      </label>
                    </div>
                  </div>
                  <small class="text-gray-500 text-xs mt-8 d-block">
                    Formatos: JPG, PNG, GIF (máx. 2MB)<br>
                    Recomendado: 534x270px
                  </small>
                </div>
              </div>
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
                    [disabled]="isLoading"
                    (click)="onSubmit()">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-8"></span>
              <i *ngIf="!isLoading" class="ph ph-check me-8"></i>
              {{ isLoading ? 'Guardando...' : (banner ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-area {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .upload-area:hover {
      border-color: var(--bs-main-600) !important;
    }
  `]
})
export class BannerModalComponent implements OnInit, OnChanges {
  
  @Input() banner: Banner | null = null;
  @Output() bannerGuardado = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  bannerForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bannersService: BannersService
  ) {
    this.bannerForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      subtitulo: [''],
      descripcion: [''],
      texto_boton: ['Explorar Tienda', [Validators.required]],
      precio_desde: [''],
      enlace_url: ['/shop', [Validators.required]],
      orden: [1, [Validators.required, Validators.min(1)]],
      activo: [true]
    });
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.banner) {
      // Modo edición
      this.bannerForm.patchValue({
        titulo: this.banner.titulo,
        subtitulo: this.banner.subtitulo,
        descripcion: this.banner.descripcion,
        texto_boton: this.banner.texto_boton,
        precio_desde: this.banner.precio_desde,
        enlace_url: this.banner.enlace_url,
        orden: this.banner.orden,
        activo: this.banner.activo
      });
      this.imagePreview = this.banner.imagen_url || null;
    } else {
      // Modo creación
      this.bannerForm.reset({
        titulo: '',
        subtitulo: '',
        descripcion: '',
        texto_boton: 'Explorar Tienda',
        precio_desde: '',
        enlace_url: '/shop',
        orden: 1,
        activo: true
      });
      this.imagePreview = null;
      this.selectedImage = null;
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.bannerForm.valid) {
      this.isLoading = true;
      
      const bannerData: BannerCreate = {
        ...this.bannerForm.value,
        imagen: this.selectedImage
      };

      const request = this.banner 
        ? this.bannersService.actualizarBanner(this.banner.id, bannerData)
        : this.bannersService.crearBanner(bannerData);

      request.subscribe({
        next: (response) => {
          console.log('Banner guardado exitosamente:', response);
          this.bannerGuardado.emit();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al guardar banner:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bannerForm.controls).forEach(key => {
      const control = this.bannerForm.get(key);
      control?.markAsTouched();
    });
  }

  private cerrarModal(): void {
    this.isLoading = false;
    const modal = document.getElementById('modalCrearBanner');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.modalCerrado.emit();
  }
}