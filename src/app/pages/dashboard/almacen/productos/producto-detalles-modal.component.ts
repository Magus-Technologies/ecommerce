import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms"
import { QuillModule } from 'ngx-quill'
import { AlmacenService } from "../../../../services/almacen.service"
import { Producto } from "../../../../types/almacen.types"

@Component({
  selector: "app-producto-detalles-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="modalDetallesProducto" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 rounded-12">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-heading fw-semibold">
              Detalles del Producto: {{ producto?.nombre }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-24">
            <form [formGroup]="detallesForm" (ngSubmit)="onSubmit()">
              
              <!-- Tabs de navegación -->
              <ul class="nav nav-tabs mb-24" id="detallesTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="descripcion-tab" data-bs-toggle="tab" 
                          data-bs-target="#descripcion" type="button" role="tab">
                    Descripción
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="especificaciones-tab" data-bs-toggle="tab" 
                          data-bs-target="#especificaciones" type="button" role="tab">
                    Especificaciones
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="caracteristicas-tab" data-bs-toggle="tab" 
                          data-bs-target="#caracteristicas" type="button" role="tab">
                    Características Técnicas
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="imagenes-tab" data-bs-toggle="tab" 
                          data-bs-target="#imagenes" type="button" role="tab">
                    Imágenes
                  </button>
                </li>
              </ul>

              <div class="tab-content" id="detallesTabContent">
                
                <!-- Tab Descripción -->
                <div class="tab-pane fade show active" id="descripcion" role="tabpanel">
                  <div class="row">
                    <div class="col-12 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Descripción Detallada</label>
                      <div class="quill-wrapper">
                        <quill-editor 
                          formControlName="descripcion_detallada"
                          [style]="{'min-height': '200px'}"
                          [modules]="quillConfig"
                          theme="snow"
                          format="html"
                          placeholder="Escribe una descripción detallada del producto...">
                        </quill-editor>
                      </div>
                    </div>
                    
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Instrucciones de Uso</label>
                      <textarea class="form-control px-16 py-12 border rounded-8" 
                                rows="4"
                                formControlName="instrucciones_uso"
                                placeholder="Instrucciones de uso del producto..."></textarea>
                    </div>
                    
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Garantía</label>
                      <textarea class="form-control px-16 py-12 border rounded-8" 
                                rows="4"
                                formControlName="garantia"
                                placeholder="Información sobre la garantía..."></textarea>
                    </div>
                    
                    <div class="col-12 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Políticas de Devolución</label>
                      <textarea class="form-control px-16 py-12 border rounded-8" 
                                rows="3"
                                formControlName="politicas_devolucion"
                                placeholder="Políticas de devolución..."></textarea>
                    </div>
                  </div>
                </div>

                <!-- Tab Especificaciones -->
                <div class="tab-pane fade" id="especificaciones" role="tabpanel">
                  <div class="row">
                    <div class="col-12 mb-16">
                      <div class="d-flex justify-content-between align-items-center mb-16">
                        <h6 class="mb-0">Especificaciones del Producto</h6>
                        <button type="button" class="btn btn-sm bg-main-600 text-white" 
                                (click)="agregarEspecificacion()">
                          <i class="ph ph-plus me-8"></i>Agregar
                        </button>
                      </div>
                      
                      <div formArrayName="especificaciones">
                        <div *ngFor="let spec of especificaciones.controls; let i = index"
                             [formGroupName]="i" class="row mb-12 align-items-end">
                          <div class="col-md-4">
                            <input type="text" class="form-control"
                                   formControlName="nombre" placeholder="Nombre (ej: Marca)">
                          </div>
                          <div class="col-md-6">
                            <input type="text" class="form-control"
                                   formControlName="valor" placeholder="Valor (ej: Samsung)">
                          </div>
                          <div class="col-md-2 d-flex justify-content-center">
                            <button type="button" class="btn btn-sm btn-danger rounded-circle"
                                    style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                                    (click)="eliminarEspecificacion(i)"
                                    title="Eliminar especificación">
                              <i class="ph ph-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Dimensiones -->
                    <div class="col-12">
                      <h6 class="mb-16">Dimensiones y Peso (Opcional)</h6>
                      <div class="row">
                        <div class="col-md-3 mb-16">
                          <label class="form-label">Largo (cm)</label>
                          <input type="number" class="form-control" 
                                 formControlName="largo" step="0.1" min="0">
                        </div>
                        <div class="col-md-3 mb-16">
                          <label class="form-label">Ancho (cm)</label>
                          <input type="number" class="form-control" 
                                 formControlName="ancho" step="0.1" min="0">
                        </div>
                        <div class="col-md-3 mb-16">
                          <label class="form-label">Alto (cm)</label>
                          <input type="number" class="form-control" 
                                 formControlName="alto" step="0.1" min="0">
                        </div>
                        <div class="col-md-3 mb-16">
                          <label class="form-label">Peso (kg)</label>
                          <input type="number" class="form-control" 
                                 formControlName="peso" step="0.01" min="0">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab Características Técnicas -->
                <div class="tab-pane fade" id="caracteristicas" role="tabpanel">
                  <div class="row">
                    <div class="col-12 mb-16">
                      <div class="d-flex justify-content-between align-items-center mb-16">
                        <h6 class="mb-0">Características Técnicas</h6>
                        <button type="button" class="btn btn-sm bg-success text-white" 
                                (click)="agregarCaracteristicaTecnica()">
                          <i class="ph ph-plus me-8"></i>Agregar
                        </button>
                      </div>
                      
                      <div formArrayName="caracteristicas_tecnicas">
                        <div *ngFor="let carac of caracteristicasTecnicas.controls; let i = index"
                             [formGroupName]="i" class="row mb-12 align-items-end">
                          <div class="col-md-4">
                            <input type="text" class="form-control"
                                   formControlName="caracteristica" placeholder="Característica (ej: Procesador)">
                          </div>
                          <div class="col-md-6">
                            <input type="text" class="form-control"
                                   formControlName="detalle" placeholder="Detalle (ej: Intel Core i7-12700H)">
                          </div>
                          <div class="col-md-2 d-flex justify-content-center">
                            <button type="button" class="btn btn-sm btn-danger rounded-circle"
                                    style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                                    (click)="eliminarCaracteristicaTecnica(i)"
                                    title="Eliminar característica">
                              <i class="ph ph-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Videos -->
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center mb-16">
                        <h6 class="mb-0">Videos Demostrativos (URLs)</h6>
                        <button type="button" class="btn btn-sm bg-secondary text-white" 
                                (click)="agregarVideo()">
                          <i class="ph ph-plus me-8"></i>Agregar Video
                        </button>
                      </div>
                      
                      <div formArrayName="videos">
                        <div *ngFor="let video of videos.controls; let i = index"
                             class="row mb-12 align-items-end">
                          <div class="col-md-8">
                            <input type="url" class="form-control"
                                   [formControlName]="i"
                                   placeholder="https://youtube.com/watch?v=..."
                                   (input)="onVideoUrlChange(i, $event)">
                          </div>
                          <div class="col-md-2 d-flex justify-content-center gap-8">
                            <button type="button" class="btn btn-sm btn-info rounded-circle"
                                    style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                                    (click)="previewVideo(video.value)"
                                    [disabled]="!isValidVideoUrl(video.value)"
                                    title="Preview del video">
                              <i class="ph ph-play text-xs"></i>
                            </button>
                          </div>
                          <div class="col-md-2 d-flex justify-content-center">
                            <button type="button" class="btn btn-sm btn-danger rounded-circle"
                                    style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                                    (click)="eliminarVideo(i)"
                                    title="Eliminar video">
                              <i class="ph ph-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab Imágenes -->
                <div class="tab-pane fade" id="imagenes" role="tabpanel">
                  <div class="row">
                    <div class="col-12 mb-16">
                      <div class="d-flex justify-content-between align-items-center mb-16">
                        <h6 class="mb-0">Galería de Imágenes</h6>
                        <label class="btn btn-sm bg-main-600 text-white cursor-pointer">
                          <i class="ph ph-upload me-8"></i>Subir Imágenes
                          <input type="file" class="d-none" multiple accept="image/*" 
                                 (change)="onImagenesSelected($event)">
                        </label>
                      </div>
                      
                      <!-- Preview de imágenes -->
                      <div class="row g-12" *ngIf="imagenesPreview.length > 0">
                        <div class="col-md-3" *ngFor="let imagen of imagenesPreview; let i = index">
                          <div class="position-relative border rounded-8 p-8">
                            <img [src]="imagen" class="w-100 rounded-6" style="height: 150px; object-fit: cover;">
                            <button type="button"
                                    class="btn btn-sm btn-danger position-absolute top-0 end-0 m-8"
                                    (click)="eliminarImagenPreview(i)">
                              <i class="ph ph-x text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Recomendaciones de imagen -->
                      <div class="mt-16">
                        <small class="text-gray-500 text-xs d-block">
                          <strong>Formatos:</strong> JPG, PNG, GIF (máx. 2MB por imagen)
                        </small>
                        <small class="text-info text-xs d-block mt-4">
                          <i class="ph ph-lightbulb me-4"></i>
                          <strong>Tamaño recomendado:</strong> 400x400px (cuadrado) para mejor visualización
                        </small>
                        <small class="text-warning text-xs d-block mt-4">
                          ⚠️ Imágenes muy anchas o altas pueden verse deformadas en la tienda
                        </small>
                      </div>
                      
                      <!-- Imágenes existentes -->
                      <div class="row g-12 mt-16" *ngIf="imagenesExistentes.length > 0">
                        <div class="col-12">
                          <h6 class="text-sm text-gray-600 mb-12">Imágenes Actuales</h6>
                        </div>
                        <div class="col-md-3" *ngFor="let imagen of imagenesExistentes; let i = index">
                          <div class="position-relative border rounded-8 p-8">
                            <img [src]="imagen" class="w-100 rounded-6" style="height: 150px; object-fit: cover;">
                            <button type="button" 
                                    class="btn btn-sm btn-danger position-absolute top-0 end-0 m-8"
                                    (click)="eliminarImagenExistente(i)">
                              <i class="ph ph-x text-xs"></i>
                            </button>
                          </div>
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
                    (click)="cancelarYCerrar()"
                    data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" 
                    class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    [disabled]="isLoading"
                    (click)="onSubmit()">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-8"></span>
              <i *ngIf="!isLoading" class="ph ph-check me-8"></i>
              {{ isLoading ? 'Guardando...' : 'Guardar Detalles' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quill-wrapper {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    ::ng-deep .ql-toolbar {
      border: none;
      border-bottom: 1px solid #ddd;
      background: #f8f9fa;
    }
    
    ::ng-deep .ql-container {
      border: none;
      font-size: 14px;
    }
    
    ::ng-deep .ql-editor {
      min-height: 200px;
      padding: 12px;
    }
    
    ::ng-deep .ql-editor.ql-blank::before {
      color: #999;
      font-style: italic;
    }
    
    ::ng-deep .quill-editor {
      background: white;
    }
  `]
})
export class ProductoDetallesModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() producto: Producto | null = null
  @Output() detallesGuardados = new EventEmitter<void>()
  @Output() modalCerrado = new EventEmitter<void>()

  detallesForm: FormGroup
  isLoading = false
  imagenesSeleccionadas: File[] = []
  imagenesPreview: string[] = []
  imagenesExistentes: string[] = []

  // Configuración del editor Quill
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean', 'link', 'image']
    ]
  }

  constructor(
    private fb: FormBuilder,
    private almacenService: AlmacenService
  ) {
    this.detallesForm = this.fb.group({
      descripcion_detallada: [''],
      instrucciones_uso: [''],
      garantia: [''],
      politicas_devolucion: [''],
      especificaciones: this.fb.array([]),
      caracteristicas_tecnicas: this.fb.array([]),
      videos: this.fb.array([]),
      largo: [''],
      ancho: [''],
      alto: [''],
      peso: ['']
    })
  }

  ngOnInit(): void {
    // Configurar listener para el modal
    this.setupModalEventListeners()
  }

  ngOnDestroy(): void {
    // Limpiar eventos al destruir el componente
    this.removeModalEventListeners()
  }

  private setupModalEventListeners(): void {
    const modal = document.getElementById('modalDetallesProducto')
    if (modal) {
      // Listener para cuando el modal se oculta
      modal.addEventListener('hidden.bs.modal', () => {
        console.log('Modal de detalles cerrado - limpiando datos')
        this.resetFormulario()
        this.modalCerrado.emit()
      })
    }
  }

  private removeModalEventListeners(): void {
    const modal = document.getElementById('modalDetallesProducto')
    if (modal) {
      modal.removeEventListener('hidden.bs.modal', () => {})
    }
  }

  ngOnChanges(): void {
    if (this.producto) {
      console.log('ngOnChanges - producto:', this.producto);

      // LIMPIAR INMEDIATAMENTE antes de cargar datos del servidor
      this.limpiarDatosInmediatamente();

      this.cargarDetallesProducto()
    } else {
      // Si no hay producto, resetear formulario
      this.resetFormulario()
    }
  }

  private limpiarDatosInmediatamente(): void {
    console.log('🧹 Limpiando datos inmediatamente al cambiar producto');

    // Limpiar imágenes inmediatamente (lo más importante)
    this.imagenesPreview = []
    this.imagenesSeleccionadas = []
    this.imagenesExistentes = []

    // Limpiar formulario inmediatamente
    this.detallesForm.patchValue({
      descripcion_detallada: '',
      instrucciones_uso: '',
      garantia: '',
      politicas_devolucion: '',
      largo: '',
      ancho: '',
      alto: '',
      peso: ''
    });

    // Limpiar arrays inmediatamente
    this.especificaciones.clear()
    this.caracteristicasTecnicas.clear()
    this.videos.clear()

    // Agregar elementos por defecto para UX
    this.agregarEspecificacion()
    this.agregarCaracteristicaTecnica()
  }

  private resetFormulario(): void {
    this.detallesForm.reset({
      descripcion_detallada: '',
      instrucciones_uso: '',
      garantia: '',
      politicas_devolucion: '',
      largo: '',
      ancho: '',
      alto: '',
      peso: ''
    })

    // Limpiar arrays
    this.especificaciones.clear()
    this.caracteristicasTecnicas.clear()
    this.videos.clear()
    this.imagenesPreview = []
    this.imagenesSeleccionadas = []
    this.imagenesExistentes = []

    // Agregar elementos por defecto
    this.agregarEspecificacion()
    this.agregarCaracteristicaTecnica()
  }

  // Getters para FormArrays
  get especificaciones() {
    return this.detallesForm.get('especificaciones') as FormArray
  }

  get caracteristicasTecnicas() {
    return this.detallesForm.get('caracteristicas_tecnicas') as FormArray
  }

  get videos() {
    return this.detallesForm.get('videos') as FormArray
  }

  // Métodos para especificaciones
  agregarEspecificacion(): void {
    const especificacionGroup = this.fb.group({
      nombre: [''],
      valor: ['']
    })
    this.especificaciones.push(especificacionGroup)
  }

  eliminarEspecificacion(index: number): void {
    this.especificaciones.removeAt(index)
  }

  // Métodos para características técnicas
  agregarCaracteristicaTecnica(): void {
    const caracteristicaGroup = this.fb.group({
      caracteristica: [''],
      detalle: ['']
    })
    this.caracteristicasTecnicas.push(caracteristicaGroup)
  }

  eliminarCaracteristicaTecnica(index: number): void {
    this.caracteristicasTecnicas.removeAt(index)
  }

  // Métodos para videos
  agregarVideo(): void {
    this.videos.push(this.fb.control(''))
  }

  eliminarVideo(index: number): void {
    this.videos.removeAt(index)
  }

  // Métodos para preview de videos
  onVideoUrlChange(index: number, event: any): void {
    const url = event.target.value;
    // Solo para logging, la validación se hace en isValidVideoUrl
    console.log(`Video ${index} URL changed:`, url);
  }

  isValidVideoUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;

    // Validar URLs de YouTube (videos normales)
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;

    // Validar URLs de YouTube Shorts
    const youtubeShortsRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/;

    // Validar URLs de TikTok
    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[a-zA-Z0-9]+|tiktok\.com\/t\/[a-zA-Z0-9]+)/;

    // Validar URLs de Instagram Reels
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p)\/[a-zA-Z0-9_-]+/;

    // Validar URLs de Vimeo
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;

    return youtubeRegex.test(url) || youtubeShortsRegex.test(url) || tiktokRegex.test(url) || instagramRegex.test(url) || vimeoRegex.test(url);
  }

  previewVideo(url: string): void {
    if (!this.isValidVideoUrl(url)) {
      alert('URL de video no válida. Formatos soportados: YouTube, YouTube Shorts, TikTok, Instagram Reels, Vimeo.');
      return;
    }

    // Convertir URL a formato embed
    const embedUrl = this.getVideoEmbedUrl(url);

    // Abrir en una nueva ventana pequeña para preview
    const width = 800;
    const height = 450;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    window.open(
      embedUrl,
      'VideoPreview',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    );
  }

  private getYouTubeEmbedUrl(url: string): string {
    // Extraer el ID del video de diferentes formatos de URL de YouTube
    const regexes = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    return url; // Si no coincide, devolver la URL original
  }

  // Función universal para obtener URL de embed de diferentes plataformas
  private getVideoEmbedUrl(url: string): string {
    // YouTube (incluye Shorts)
    const youtubeRegexes = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const regex of youtubeRegexes) {
      const match = url.match(regex);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Para TikTok e Instagram, abrimos la URL original ya que no tienen embed directo
    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[a-zA-Z0-9]+|tiktok\.com\/t\/[a-zA-Z0-9]+)/;
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p)\/[a-zA-Z0-9_-]+/;

    if (tiktokRegex.test(url) || instagramRegex.test(url)) {
      return url; // Para TikTok e Instagram, devolver URL original
    }

    return url; // Si no coincide con ningún formato, devolver URL original
  }

  // Métodos para imágenes
  onImagenesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[]
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.imagenesSeleccionadas.push(file)
        
        const reader = new FileReader()
        reader.onload = (e: any) => {
          this.imagenesPreview.push(e.target.result)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  eliminarImagenPreview(index: number): void {
    this.imagenesSeleccionadas.splice(index, 1)
    this.imagenesPreview.splice(index, 1)
  }

  eliminarImagenExistente(index: number): void {
    if (this.producto) {
      this.almacenService.eliminarImagenDetalle(this.producto.id, index).subscribe({
        next: () => {
          this.imagenesExistentes.splice(index, 1)
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error)
        }
      })
    }
  }

  cargarDetallesProducto(): void {
    if (!this.producto) return

    console.log('Cargando detalles para producto ID:', this.producto.id);

    this.almacenService.obtenerDetallesProducto(this.producto.id).subscribe({
      next: (response) => {
        console.log('Respuesta detalles:', response);
        const detalles = response.detalles

        // Los datos ya se limpiaron en limpiarDatosInmediatamente()
        // Solo necesitamos cargar los nuevos datos

        if (detalles) {
          // Cargar datos básicos
          this.detallesForm.patchValue({
            descripcion_detallada: detalles.descripcion_detallada || '',
            instrucciones_uso: detalles.instrucciones_uso || '',
            garantia: detalles.garantia || '',
            politicas_devolucion: detalles.politicas_devolucion || ''
          })

          // Cargar dimensiones
          let dimensiones = detalles.dimensiones;
          if (typeof dimensiones === 'string') {
            try {
              dimensiones = JSON.parse(dimensiones);
            } catch (e) {
              dimensiones = null;
            }
          }

          if (dimensiones) {
            // Si las dimensiones están como array (formato anterior: [largo, ancho, alto, peso])
            if (Array.isArray(dimensiones) && dimensiones.length >= 4) {
              this.detallesForm.patchValue({
                largo: dimensiones[0] || '',
                ancho: dimensiones[1] || '',
                alto: dimensiones[2] || '',
                peso: dimensiones[3] || ''
              });
              console.log('Dimensiones cargadas desde array:', {
                largo: dimensiones[0],
                ancho: dimensiones[1],
                alto: dimensiones[2],
                peso: dimensiones[3]
              });
            }
            // Si las dimensiones están como objeto (formato nuevo: {largo, ancho, alto, peso})
            else if (typeof dimensiones === 'object' && !Array.isArray(dimensiones)) {
              this.detallesForm.patchValue({
                largo: dimensiones.largo || '',
                ancho: dimensiones.ancho || '',
                alto: dimensiones.alto || '',
                peso: dimensiones.peso || ''
              });
              console.log('Dimensiones cargadas desde objeto:', dimensiones);
            }
          } else {
            // Si no hay dimensiones, limpiar campos de dimensiones
            this.detallesForm.patchValue({
              largo: '',
              ancho: '',
              alto: '',
              peso: ''
            });
          }

          // Cargar especificaciones
          let especificaciones = detalles.especificaciones;
          if (typeof especificaciones === 'string') {
            try {
              especificaciones = JSON.parse(especificaciones);
            } catch (e) {
              especificaciones = null;
            }
          }

          if (especificaciones && Array.isArray(especificaciones) && especificaciones.length > 0) {
            especificaciones.forEach((spec: any) => {
              const group = this.fb.group({
                nombre: [spec.nombre || ''],
                valor: [spec.valor || '']
              })
              this.especificaciones.push(group)
            })
          } else {
            this.agregarEspecificacion()
          }

          // Cargar características técnicas
          let caracteristicasTecnicas = detalles.caracteristicas_tecnicas;
          if (typeof caracteristicasTecnicas === 'string') {
            try {
              caracteristicasTecnicas = JSON.parse(caracteristicasTecnicas);
            } catch (e) {
              caracteristicasTecnicas = null;
            }
          }

          if (caracteristicasTecnicas && Array.isArray(caracteristicasTecnicas) && caracteristicasTecnicas.length > 0) {
            caracteristicasTecnicas.forEach((carac: any) => {
              const group = this.fb.group({
                caracteristica: [carac.caracteristica || ''],
                detalle: [carac.detalle || '']
              })
              this.caracteristicasTecnicas.push(group)
            })
          } else {
            this.agregarCaracteristicaTecnica()
          }

          // Cargar videos
          let videos = detalles.videos;
          if (typeof videos === 'string') {
            try {
              videos = JSON.parse(videos);
            } catch (e) {
              videos = null;
            }
          }

          if (videos && Array.isArray(videos) && videos.length > 0) {
            videos.forEach((video: string) => {
              this.videos.push(this.fb.control(video))
            })
          }

          // Cargar imágenes existentes
          this.imagenesExistentes = detalles.imagenes_url || []
        } else {
          // Si no hay detalles, ya se limpiaron en limpiarDatosInmediatamente()
          console.log('No hay detalles - los datos ya están limpios');
        }

        console.log('Detalles cargados exitosamente');
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error)
        // En caso de error, agregar campos por defecto
        this.especificaciones.clear()
        this.caracteristicasTecnicas.clear()
        this.videos.clear()
        this.agregarEspecificacion()
        this.agregarCaracteristicaTecnica()
      }
    })
  }

  onSubmit(): void {
    if (!this.producto) return

    this.isLoading = true

    // Preparar datos del formulario
    const formData = new FormData()
    
    // Datos básicos
    formData.append('descripcion_detallada', this.detallesForm.get('descripcion_detallada')?.value || '')
    formData.append('instrucciones_uso', this.detallesForm.get('instrucciones_uso')?.value || '')
    formData.append('garantia', this.detallesForm.get('garantia')?.value || '')
    formData.append('politicas_devolucion', this.detallesForm.get('politicas_devolucion')?.value || '')

    // Dimensiones - asegurar que se guarden como objeto
    const dimensiones = {
      largo: this.detallesForm.get('largo')?.value || null,
      ancho: this.detallesForm.get('ancho')?.value || null,
      alto: this.detallesForm.get('alto')?.value || null,
      peso: this.detallesForm.get('peso')?.value || null
    }

    console.log('Guardando dimensiones:', dimensiones);
    formData.append('dimensiones', JSON.stringify(dimensiones))

    // Especificaciones
    const especificaciones = this.especificaciones.value.filter((spec: any) => 
      spec.nombre && spec.valor
    )
    formData.append('especificaciones', JSON.stringify(especificaciones))

    // Características técnicas
    const caracteristicasTecnicas = this.caracteristicasTecnicas.value.filter((carac: any) => 
      carac.caracteristica && carac.detalle
    )
    formData.append('caracteristicas_tecnicas', JSON.stringify(caracteristicasTecnicas))

    // Videos
    const videos = this.videos.value.filter((video: string) => video.trim())
    formData.append('videos', JSON.stringify(videos))

    // Imágenes
    this.imagenesSeleccionadas.forEach((imagen, index) => {
      formData.append(`imagenes[${index}]`, imagen)
    })

    // Enviar al servidor
    this.almacenService.guardarDetallesProducto(this.producto.id, formData).subscribe({
      next: (response) => {
        console.log('Detalles guardados exitosamente:', response)
        this.detallesGuardados.emit()
        this.cerrarModal()
      },
      error: (error) => {
        console.error('Error al guardar detalles:', error)
        this.isLoading = false
      }
    })
  }

  cancelarYCerrar(): void {
    console.log('Cancelando y cerrando modal de detalles')
    this.resetFormulario()
    this.modalCerrado.emit()
  }

  private cerrarModal(): void {
    this.isLoading = false

    // Limpiar formulario y datos al cerrar
    this.resetFormulario()

    const modal = document.getElementById("modalDetallesProducto")
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal)
      if (bootstrapModal) {
        bootstrapModal.hide()
      }
    }
    this.modalCerrado.emit()
  }
}