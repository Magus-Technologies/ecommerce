// src/app/component/oferta-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfertasAdminService, OfertaAdmin, TipoOferta } from '../../../../services/ofertas-admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-oferta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="modalCrearOferta" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 rounded-12">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-heading fw-semibold">
              {{ oferta?.id ? 'Editar Oferta' : 'Nueva Oferta' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-24">
            <form (ngSubmit)="guardarOferta()" #ofertaForm="ngForm">
              <div class="row">
                
                <!-- Columna Principal -->
                <div class="col-lg-8">
                  
                  <!-- Información básica -->
                  <div class="card border-0 bg-gray-50 mb-20">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-info me-8 text-main-600"></i>
                        Información básica
                      </h6>
                      
                      <div class="row">
                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Título *</label>
                          <input type="text" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.titulo"
                                 name="titulo"
                                 placeholder="Ej: Super Oferta de Verano"
                                 required>
                        </div>

                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Subtítulo</label>
                          <input type="text" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.subtitulo"
                                 name="subtitulo"
                                 placeholder="Ej: Hasta 50% de descuento">
                        </div>

                        <div class="col-12 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Descripción</label>
                          <textarea class="form-control px-16 py-12 border rounded-8" 
                                    rows="3"
                                    [(ngModel)]="formData.descripcion"
                                    name="descripcion"
                                    placeholder="Descripción detallada de la oferta..."></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Configuración de descuento -->
                  <div class="card border-0 bg-gray-50 mb-20">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-percent me-8 text-success-600"></i>
                        Configuración de descuento
                      </h6>
                      
                      <div class="row">
                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Tipo de descuento *</label>
                          <select class="form-select px-16 py-12 border rounded-8" 
                                  [(ngModel)]="formData.tipo_descuento"
                                  name="tipo_descuento"
                                  required>
                            <option value="porcentaje">Porcentaje (%)</option>
                            <option value="cantidad_fija">Cantidad fija (S/)</option>
                          </select>
                        </div>

                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Valor del descuento *</label>
                          <div class="input-group">
                            <span class="input-group-text bg-gray-50 border-end-0">
                              {{ formData.tipo_descuento === 'porcentaje' ? '%' : 'S/' }}
                            </span>
                            <input type="number" 
                                   class="form-control px-16 py-12 border-start-0"
                                   [(ngModel)]="formData.valor_descuento"
                                   name="valor_descuento"
                                   min="0"
                                   step="0.01"
                                   required>
                          </div>
                        </div>

                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Compra mínima</label>
                          <div class="input-group">
                            <span class="input-group-text bg-gray-50 border-end-0">S/</span>
                            <input type="number" 
                                   class="form-control px-16 py-12 border-start-0"
                                   [(ngModel)]="formData.precio_minimo"
                                   name="precio_minimo"
                                   min="0"
                                   step="0.01"
                                   placeholder="0.00">
                          </div>
                        </div>

                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Límite de uso</label>
                          <input type="number" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.limite_uso"
                                 name="limite_uso"
                                 min="1"
                                 placeholder="Dejar vacío para ilimitado">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Fechas de vigencia -->
                  <div class="card border-0 bg-gray-50 mb-20">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-calendar me-8 text-warning-600"></i>
                        Vigencia
                      </h6>
                      
                      <div class="row">
                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Fecha de inicio *</label>
                          <input type="datetime-local" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.fecha_inicio"
                                 name="fecha_inicio"
                                 required>
                        </div>

                        <div class="col-md-6 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Fecha de fin *</label>
                          <input type="datetime-local" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.fecha_fin"
                                 name="fecha_fin"
                                 required>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Configuración de apariencia -->
                  <div class="card border-0 bg-gray-50">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-palette me-8 text-purple-600"></i>
                        Apariencia y enlaces
                      </h6>
                      
                      <div class="row">
                        <div class="col-md-4 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Color de fondo</label>
                          <input type="color" 
                                 class="form-control form-control-color px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.color_fondo"
                                 name="color_fondo">
                        </div>

                        <div class="col-md-4 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">Texto del botón</label>
                          <input type="text" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.texto_boton"
                                 name="texto_boton"
                                 placeholder="Compra ahora">
                        </div>

                        <div class="col-md-4 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">
                            Prioridad
                            <i class="ph ph-info-circle text-info-600 ms-2" 
                               title="La prioridad determina el orden de aparición. Mayor número = mayor prioridad. Ej: Prioridad 5 aparece antes que prioridad 1"></i>
                          </label>
                          <input type="number" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.prioridad"
                                 name="prioridad"
                                 min="0"
                                 placeholder="0">
                          <small class="text-muted">
                            <strong>Orden de visualización:</strong> Mayor número = mayor prioridad. 
                            Ej: Prioridad 5 se muestra antes que prioridad 1.
                          </small>
                        </div>

                        <div class="col-12 mb-16">
                          <label class="form-label text-heading fw-medium mb-8">URL de enlace</label>
                          <input type="text" 
                                 class="form-control px-16 py-12 border rounded-8"
                                 [(ngModel)]="formData.enlace_url"
                                 name="enlace_url"
                                 placeholder="/shop">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna Lateral -->
                <div class="col-lg-4">
                  
                  <!-- Imágenes -->
                  <div class="card border-0 bg-gray-50 mb-20">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-image me-8 text-info-600"></i>
                        Imágenes
                      </h6>
                      
                      <!-- Imagen principal -->
                      <div class="mb-20">
                        <label class="form-label text-heading fw-medium mb-8">
                          Imagen principal
                          <small class="text-muted d-block">Dimensiones recomendadas: 400x300px</small>
                        </label>
                        <div class="upload-area border-2 border-dashed border-gray-200 rounded-8 p-16 text-center"
                             [class.border-main-600]="imagenPreview">
                          
                          <div *ngIf="!imagenPreview" class="text-center">
                            <i class="ph ph-image text-gray-400 text-4xl mb-12"></i>
                            <p class="text-gray-500 text-sm mb-12">Seleccionar imagen</p>
                            <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                              <i class="ph ph-upload me-6"></i>
                              Subir imagen
                              <input type="file" 
                                     class="d-none" 
                                     accept="image/*"
                                     (change)="onImageSelected($event, 'imagen')">
                            </label>
                          </div>

                          <div *ngIf="imagenPreview" class="text-center">
                            <img [src]="imagenPreview" 
                                 alt="Preview" 
                                 class="img-fluid rounded-6 mb-12"
                                 style="max-height: 120px;"
                                 (error)="onImageError('imagen')">
                            <br>
                            <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                              <i class="ph ph-pencil me-6"></i>
                              Cambiar
                              <input type="file" 
                                     class="d-none" 
                                     accept="image/*"
                                     (change)="onImageSelected($event, 'imagen')">
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Banner -->
                      <div>
                        <label class="form-label text-heading fw-medium mb-8">
                          Banner (Flash Sales)
                          <small class="text-muted d-block">Dimensiones recomendadas: 828x268px</small>
                        </label>
                        <div class="upload-area border-2 border-dashed border-gray-200 rounded-8 p-16 text-center"
                             [class.border-main-600]="bannerPreview">
                          
                          <div *ngIf="!bannerPreview" class="text-center">
                            <i class="ph ph-image text-gray-400 text-4xl mb-12"></i>
                            <p class="text-gray-500 text-sm mb-12">Seleccionar banner</p>
                            <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                              <i class="ph ph-upload me-6"></i>
                              Subir banner
                              <input type="file" 
                                     class="d-none" 
                                     accept="image/*"
                                     (change)="onImageSelected($event, 'banner_imagen')">
                            </label>
                          </div>

                          <div *ngIf="bannerPreview" class="text-center">
                            <img [src]="bannerPreview" 
                                 alt="Preview" 
                                 class="img-fluid rounded-6 mb-12"
                                 style="max-height: 120px;"
                                 (error)="onImageError('banner')">
                            <br>
                            <label class="btn bg-main-50 text-main-600 px-12 py-6 rounded-6 cursor-pointer text-sm">
                              <i class="ph ph-pencil me-6"></i>
                              Cambiar
                              <input type="file" 
                                     class="d-none" 
                                     accept="image/*"
                                     (change)="onImageSelected($event, 'banner_imagen')">
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Configuración de visualización -->
                  <div class="card border-0 bg-gray-50">
                    <div class="card-body p-16">
                      <h6 class="text-heading fw-semibold mb-16 d-flex align-items-center">
                        <i class="ph ph-eye me-8 text-primary-600"></i>
                        Visualización
                      </h6>
                      
                      <div class="d-flex flex-column gap-12">
                        <!-- ✅ NUEVO CHECKBOX: Oferta principal del día -->
                        <div class="form-check">
                          <input class="form-check-input" 
                                 type="checkbox" 
                                 [(ngModel)]="formData.es_oferta_principal"
                                 name="es_oferta_principal"
                                 id="es_oferta_principal">
                          <label class="form-check-label text-heading fw-medium" for="es_oferta_principal">
                            <i class="ph ph-star text-warning-600 me-4"></i>
                            Oferta principal del día
                          </label>
                          <small class="text-gray-500 d-block">
                            <strong>¡IMPORTANTE!</strong> Solo una oferta puede ser principal a la vez. 
                            Esta oferta se mostrará en la sección especial "Ofertas del día" del home.
                          </small>
                        </div>

                        <div class="form-check">
                          <input class="form-check-input" 
                                 type="checkbox" 
                                 [(ngModel)]="formData.mostrar_countdown"
                                 name="mostrar_countdown"
                                 id="mostrar_countdown">
                          <label class="form-check-label text-heading fw-medium" for="mostrar_countdown">
                            Mostrar countdown
                          </label>
                          <small class="text-gray-500 d-block">Muestra temporizador de cuenta regresiva en Flash Sales</small>
                        </div>

                        <div class="form-check">
                          <input class="form-check-input" 
                                 type="checkbox" 
                                 [(ngModel)]="formData.mostrar_en_slider"
                                 name="mostrar_en_slider"
                                 id="mostrar_en_slider">
                          <label class="form-check-label text-heading fw-medium" for="mostrar_en_slider">
                            Mostrar en slider
                          </label>
                          <small class="text-gray-500 d-block">Aparece en el slider principal del home</small>
                        </div>

                        <div class="form-check">
                          <input class="form-check-input" 
                                 type="checkbox" 
                                 [(ngModel)]="formData.mostrar_en_banner"
                                 name="mostrar_en_banner"
                                 id="mostrar_en_banner">
                          <label class="form-check-label text-heading fw-medium" for="mostrar_en_banner">
                            Mostrar en banner
                          </label>
                          <small class="text-gray-500 d-block">Aparece en sección de banners promocionales</small>
                        </div>

                        <div class="form-check">
                          <input class="form-check-input" 
                                 type="checkbox" 
                                 [(ngModel)]="formData.activo"
                                 name="activo"
                                 id="activo">
                          <label class="form-check-label text-heading fw-medium" for="activo">
                            Oferta activa
                          </label>
                          <small class="text-gray-500 d-block">Solo las ofertas activas se muestran públicamente</small>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    (click)="guardarOferta()">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-8"></span>
              <i *ngIf="!isLoading" class="ph ph-check me-8"></i>
              {{ isLoading ? 'Guardando...' : (oferta?.id ? 'Actualizar' : 'Crear') }} Oferta
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
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  `]
})
export class OfertaModalComponent implements OnInit, OnChanges {
  @Input() oferta: OfertaAdmin | null = null;
  @Output() ofertaGuardada = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  formData: OfertaAdmin = this.getEmptyForm();
  tiposOfertas: TipoOferta[] = [];
  isLoading = false;
  
  // ✅ Variables separadas para los previews de imágenes
  imagenPreview: string | null = null;
  bannerPreview: string | null = null;

  constructor(
    private ofertasAdminService: OfertasAdminService
  ) {}

  ngOnInit(): void {
    this.cargarTiposOfertas();
  }

  ngOnChanges(): void {
    console.log('🔄 ngOnChanges - Oferta recibida:', this.oferta);
    
    if (this.oferta) {
      // ✅ Modo edición - cargar datos existentes
      this.formData = { ...this.oferta };
      
      // ✅ Cargar previews de imágenes existentes con logs para debug
      console.log('📸 URLs de imágenes:', {
        imagen_url: this.oferta.imagen_url,
        banner_imagen_url: this.oferta.banner_imagen_url
      });
      
      this.imagenPreview = this.oferta.imagen_url || null;
      this.bannerPreview = this.oferta.banner_imagen_url || null;
      
      console.log('🖼️ Previews asignados:', {
        imagenPreview: this.imagenPreview,
        bannerPreview: this.bannerPreview
      });
      
      // Convertir fechas para datetime-local
      if (this.formData.fecha_inicio) {
        this.formData.fecha_inicio = this.formatDateForInput(this.formData.fecha_inicio);
      }
      if (this.formData.fecha_fin) {
        this.formData.fecha_fin = this.formatDateForInput(this.formData.fecha_fin);
      }
    } else {
      // ✅ Modo creación - resetear todo
      this.formData = this.getEmptyForm();
      this.imagenPreview = null;
      this.bannerPreview = null;
    }
  }

  private getEmptyForm(): OfertaAdmin {
    return {
      titulo: '',
      subtitulo: '',
      descripcion: '',
      tipo_descuento: 'porcentaje',
      valor_descuento: 0,
      fecha_inicio: '',
      fecha_fin: '',
      color_fondo: '#3B82F6',
      texto_boton: 'Compra ahora',
      enlace_url: '/shop',
      activo: true,
      mostrar_countdown: false,
      mostrar_en_slider: false,
      mostrar_en_banner: false,
      es_oferta_principal: false, // ✅ NUEVO CAMPO
      prioridad: 0
    };
  }

  cargarTiposOfertas(): void {
    this.ofertasAdminService.obtenerTiposOfertas().subscribe({
      next: (tipos) => {
        this.tiposOfertas = tipos;
      },
      error: (error) => {
        console.error('Error al cargar tipos de ofertas:', error);
      }
    });
  }

  onImageSelected(event: any, tipo: 'imagen' | 'banner_imagen'): void {
    const file = event.target.files[0];
    if (file) {
      // ✅ Guardar el archivo en formData
      (this.formData as any)[tipo] = file;
      
      // ✅ Crear preview y asignarlo a la variable correcta
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (tipo === 'imagen') {
          this.imagenPreview = result;
        } else {
          this.bannerPreview = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ Método para manejar errores de carga de imagen
  onImageError(tipo: 'imagen' | 'banner'): void {
    console.error(`❌ Error al cargar imagen de ${tipo}`);
    if (tipo === 'imagen') {
      this.imagenPreview = null;
    } else {
      this.bannerPreview = null;
    }
  }

  guardarOferta(): void {
    this.isLoading = true;

    const operacion = this.oferta?.id 
      ? this.ofertasAdminService.actualizarOferta(this.oferta.id, this.formData)
      : this.ofertasAdminService.crearOferta(this.formData);

    operacion.subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: `Oferta ${this.oferta?.id ? 'actualizada' : 'creada'} correctamente`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.ofertaGuardada.emit();
        this.cerrarModal();
        this.isLoading = false;
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la oferta',
          icon: 'error'
        });
        console.error('Error al guardar oferta:', error);
        this.isLoading = false;
      }
    });
  }

  private cerrarModal(): void {
    const modal = document.getElementById('modalCrearOferta');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.modalCerrado.emit();
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}