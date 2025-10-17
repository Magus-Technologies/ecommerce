// src\app\pages\dashboard\almacen\productos\producto-modal.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { AlmacenService } from '../../../../services/almacen.service';
import {
  Producto,
  ProductoCreate,
  Categoria,
  MarcaProducto,
} from '../../../../types/almacen.types';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './producto-modal.component.html',
  styles: [
    `
      .upload-area {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .upload-area:hover {
        border-color: var(--bs-main-600) !important;
      }
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
    `,
  ],
})
export class ProductoModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() producto: Producto | null = null;
  @Output() productoGuardado = new EventEmitter<Producto>(); // ✅ CAMBIO: Emitir el producto
  @Output() modalCerrado = new EventEmitter<void>();

  // Formularios
  productoForm: FormGroup;
  detallesForm: FormGroup;

  // Datos
  categorias: Categoria[] = [];
  marcas: MarcaProducto[] = [];

  // Imágenes principales
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  imageValidationMessage: string = '';
  imageValidationType: 'error' | 'warning' | '' = '';

  // Imágenes galería (detalles)
  imagenesSeleccionadas: File[] = [];
  imagenesPreview: string[] = [];
  imagenesExistentes: string[] = [];

  // Estados
  isLoading = false;
  activeTab: string = 'basico';

  // Configuración del editor Quill
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean', 'link', 'image'],
    ],
  };

  constructor(private fb: FormBuilder, private almacenService: AlmacenService) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      codigo_producto: ['', [Validators.required]],
      categoria_id: ['', [Validators.required]],
      marca_id: [''],
      precio_compra: ['', [Validators.required, Validators.min(0)]],
      precio_venta: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      stock_minimo: [5, [Validators.required, Validators.min(0)]],
      activo: [true],
      destacado: [false],
      mostrar_igv: [true],
    });

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
      peso: [''],
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarMarcas();
    this.setupModalEventListeners();
  }

  ngOnDestroy(): void {
    this.removeModalEventListeners();
  }

  ngOnChanges(): void {
    if (this.producto) {
      console.log(
        'ngOnChanges - Cargando producto para edición:',
        this.producto
      );
      this.cargarProductoParaEdicion();
    } else {
      console.log('ngOnChanges - Creando nuevo producto');
      this.resetearFormularios();
    }
  }

  private setupModalEventListeners(): void {
    const modal = document.getElementById('modalCrearProducto');
    if (modal) {
      modal.addEventListener('hidden.bs.modal', () => {
        console.log('Modal cerrado - limpiando datos');
        this.resetearFormularios();
        this.modalCerrado.emit();
      });
    }
  }

  private removeModalEventListeners(): void {
    const modal = document.getElementById('modalCrearProducto');
    if (modal) {
      modal.removeEventListener('hidden.bs.modal', () => {});
    }
  }

  cargarProductoParaEdicion(): void {
    if (!this.producto) return;

    // Cargar datos básicos
    this.productoForm.patchValue({
      nombre: this.producto.nombre || '',
      descripcion: this.producto.descripcion || '',
      codigo_producto: this.producto.codigo_producto || '',
      categoria_id: this.producto.categoria_id || '',
      marca_id: this.producto.marca_id || '',
      precio_compra: this.producto.precio_compra || '',
      precio_venta: this.producto.precio_venta || '',
      stock: this.producto.stock || 0,
      stock_minimo: this.producto.stock_minimo || 5,
      activo: Boolean(this.producto.activo),
      destacado: Boolean(this.producto.destacado),
      mostrar_igv:
        this.producto.mostrar_igv !== undefined
          ? Boolean(this.producto.mostrar_igv)
          : true,
    });

    this.imagePreview = this.producto.imagen_url || null;
    this.selectedImage = null;
    this.clearImageValidation();

    // Cargar detalles si el producto existe
    this.cargarDetallesProducto();
  }

  resetearFormularios(): void {
    // Resetear formulario básico
    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      codigo_producto: '',
      categoria_id: '',
      marca_id: '',
      precio_compra: '',
      precio_venta: '',
      stock: '',
      stock_minimo: 5,
      activo: true,
      destacado: false,
      mostrar_igv: true,
    });

    // Resetear formulario de detalles
    this.detallesForm.reset({
      descripcion_detallada: '',
      instrucciones_uso: '',
      garantia: '',
      politicas_devolucion: '',
      largo: '',
      ancho: '',
      alto: '',
      peso: '',
    });

    // Limpiar arrays
    this.especificaciones.clear();
    this.caracteristicasTecnicas.clear();
    this.videos.clear();

    // Limpiar imágenes
    this.imagePreview = null;
    this.selectedImage = null;
    this.imagenesPreview = [];
    this.imagenesSeleccionadas = [];
    this.imagenesExistentes = [];
    this.clearImageValidation();

    // Volver al primer tab
    this.activeTab = 'basico';

    // Agregar elementos por defecto
    this.agregarEspecificacion();
    this.agregarCaracteristicaTecnica();
  }

  cargarCategorias(): void {
    this.almacenService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter((cat) => cat.activo);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      },
    });
  }

  cargarMarcas(): void {
    this.almacenService.obtenerMarcasActivas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
      },
    });
  }

  cargarDetallesProducto(): void {
    if (!this.producto) return;

    console.log('Cargando detalles para producto ID:', this.producto.id);

    this.almacenService.obtenerDetallesProducto(this.producto.id).subscribe({
      next: (response) => {
        console.log('Respuesta detalles:', response);
        const detalles = response.detalles;

        if (detalles) {
          // Cargar datos básicos
          this.detallesForm.patchValue({
            descripcion_detallada: detalles.descripcion_detallada || '',
            instrucciones_uso: detalles.instrucciones_uso || '',
            garantia: detalles.garantia || '',
            politicas_devolucion: detalles.politicas_devolucion || '',
          });

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
            if (Array.isArray(dimensiones) && dimensiones.length >= 4) {
              this.detallesForm.patchValue({
                largo: dimensiones[0] || '',
                ancho: dimensiones[1] || '',
                alto: dimensiones[2] || '',
                peso: dimensiones[3] || '',
              });
            } else if (
              typeof dimensiones === 'object' &&
              !Array.isArray(dimensiones)
            ) {
              this.detallesForm.patchValue({
                largo: dimensiones.largo || '',
                ancho: dimensiones.ancho || '',
                alto: dimensiones.alto || '',
                peso: dimensiones.peso || '',
              });
            }
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

          this.especificaciones.clear();
          if (
            especificaciones &&
            Array.isArray(especificaciones) &&
            especificaciones.length > 0
          ) {
            especificaciones.forEach((spec: any) => {
              const group = this.fb.group({
                nombre: [spec.nombre || ''],
                valor: [spec.valor || ''],
              });
              this.especificaciones.push(group);
            });
          } else {
            this.agregarEspecificacion();
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

          this.caracteristicasTecnicas.clear();
          if (
            caracteristicasTecnicas &&
            Array.isArray(caracteristicasTecnicas) &&
            caracteristicasTecnicas.length > 0
          ) {
            caracteristicasTecnicas.forEach((carac: any) => {
              const group = this.fb.group({
                caracteristica: [carac.caracteristica || ''],
                detalle: [carac.detalle || ''],
              });
              this.caracteristicasTecnicas.push(group);
            });
          } else {
            this.agregarCaracteristicaTecnica();
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

          this.videos.clear();
          if (videos && Array.isArray(videos) && videos.length > 0) {
            videos.forEach((video: string) => {
              this.videos.push(this.fb.control(video));
            });
          }

          // Cargar imágenes existentes
          this.imagenesExistentes = detalles.imagenes_url || [];
        } else {
          // Si no hay detalles, agregar campos por defecto
          this.agregarEspecificacion();
          this.agregarCaracteristicaTecnica();
        }

        console.log('Detalles cargados exitosamente');
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.agregarEspecificacion();
        this.agregarCaracteristicaTecnica();
      },
    });
  }

  // ==================== IMAGEN PRINCIPAL ====================

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.clearImageValidation();

      // Validar tamaño del archivo (máx. 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.showImageValidation(
          'La imagen es muy grande. El tamaño máximo permitido es 2MB.',
          'error'
        );
        event.target.value = '';
        this.selectedImage = null;
        this.imagePreview = null;
        return;
      }

      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;

        // Verificar dimensiones de la imagen
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // Mostrar advertencia si las dimensiones no son ideales
          if (width < 200 || height < 200) {
            this.showImageValidation(
              `Imagen muy pequeña (${width}x${height}px). Se recomienda usar al menos 400x400px para mejor calidad.`,
              'warning'
            );
          } else if (Math.abs(width - height) > width * 0.3) {
            this.showImageValidation(
              `Imagen no cuadrada (${width}x${height}px). Para mejor visualización usa imágenes cuadradas (ej: 400x400px).`,
              'warning'
            );
          } else {
            this.imageValidationMessage = `¡Perfecto! Imagen con dimensiones ideales (${width}x${height}px).`;
            this.imageValidationType = 'warning';
            setTimeout(() => this.clearImageValidation(), 3000);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private showImageValidation(
    message: string,
    type: 'error' | 'warning'
  ): void {
    this.imageValidationMessage = message;
    this.imageValidationType = type;
  }

  private clearImageValidation(): void {
    this.imageValidationMessage = '';
    this.imageValidationType = '';
  }

  // ==================== GALERÍA DE IMÁGENES ====================

  onImagenesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    files.forEach((file) => {
      // Validar tamaño (máx. 2MB por imagen)
      if (file.size > 2 * 1024 * 1024) {
        alert(`La imagen ${file.name} es muy grande. Máximo 2MB por imagen.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Verificar dimensiones de la imagen
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;

            // Mostrar advertencia si las dimensiones no son ideales
            if (width < 200 || height < 200) {
              console.warn(
                `Imagen ${file.name} muy pequeña (${width}x${height}px). Se recomienda usar al menos 400x400px.`
              );
            } else if (Math.abs(width - height) > width * 0.3) {
              console.warn(
                `Imagen ${file.name} no cuadrada (${width}x${height}px). Para mejor visualización usa imágenes cuadradas.`
              );
            } else {
              console.log(
                `✓ Imagen ${file.name} con dimensiones ideales (${width}x${height}px).`
              );
            }

            // Agregar la imagen al array
            this.imagenesSeleccionadas.push(file);
            this.imagenesPreview.push(e.target.result);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Limpiar el input
    event.target.value = '';
  }

  eliminarImagenPreview(index: number): void {
    this.imagenesSeleccionadas.splice(index, 1);
    this.imagenesPreview.splice(index, 1);
  }

  eliminarImagenExistente(index: number): void {
    if (this.producto) {
      this.almacenService
        .eliminarImagenDetalle(this.producto.id, index)
        .subscribe({
          next: () => {
            this.imagenesExistentes.splice(index, 1);
          },
          error: (error) => {
            console.error('Error al eliminar imagen:', error);
          },
        });
    }
  }

  // ==================== GETTERS PARA FORM ARRAYS ====================

  get especificaciones() {
    return this.detallesForm.get('especificaciones') as FormArray;
  }

  get caracteristicasTecnicas() {
    return this.detallesForm.get('caracteristicas_tecnicas') as FormArray;
  }

  get videos() {
    return this.detallesForm.get('videos') as FormArray;
  }

  // ==================== MÉTODOS PARA ESPECIFICACIONES ====================

  agregarEspecificacion(): void {
    const especificacionGroup = this.fb.group({
      nombre: [''],
      valor: [''],
    });
    this.especificaciones.push(especificacionGroup);
  }

  eliminarEspecificacion(index: number): void {
    this.especificaciones.removeAt(index);
  }

  // ==================== MÉTODOS PARA CARACTERÍSTICAS TÉCNICAS ====================

  agregarCaracteristicaTecnica(): void {
    const caracteristicaGroup = this.fb.group({
      caracteristica: [''],
      detalle: [''],
    });
    this.caracteristicasTecnicas.push(caracteristicaGroup);
  }

  eliminarCaracteristicaTecnica(index: number): void {
    this.caracteristicasTecnicas.removeAt(index);
  }

  // ==================== MÉTODOS PARA VIDEOS ====================

  agregarVideo(): void {
    this.videos.push(this.fb.control(''));
  }

  eliminarVideo(index: number): void {
    this.videos.removeAt(index);
  }

  isValidVideoUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
    const youtubeShortsRegex =
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/;
    const tiktokRegex =
      /^(https?:\/\/)?(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[a-zA-Z0-9]+|tiktok\.com\/t\/[a-zA-Z0-9]+)/;
    const instagramRegex =
      /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p)\/[a-zA-Z0-9_-]+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;

    return (
      youtubeRegex.test(url) ||
      youtubeShortsRegex.test(url) ||
      tiktokRegex.test(url) ||
      instagramRegex.test(url) ||
      vimeoRegex.test(url)
    );
  }

  previewVideo(url: string): void {
    if (!this.isValidVideoUrl(url)) {
      alert(
        'URL de video no válida. Formatos soportados: YouTube, YouTube Shorts, TikTok, Instagram Reels, Vimeo.'
      );
      return;
    }

    const embedUrl = this.getVideoEmbedUrl(url);
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

  private getVideoEmbedUrl(url: string): string {
    const youtubeRegexes = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const regex of youtubeRegexes) {
      const match = url.match(regex);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  }

  onVideoUrlChange(index: number, event: any): void {
    const url = event.target.value;
    console.log(`Video ${index} URL changed:`, url);
  }

  // ==================== GUARDAR ====================

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.isLoading = true;

      const formValue = {
        ...this.productoForm.value,
        activo: Boolean(this.productoForm.get('activo')?.value),
        imagen: this.selectedImage,
      };

      // ✅ CORRECCIÓN: Convertir marca_id vacío o string vacío a null
      const marcaId = this.productoForm.get('marca_id')?.value;
      if (!marcaId || marcaId === '' || marcaId === 'null') {
        formValue.marca_id = null;
      } else {
        // Asegurar que sea un número
        formValue.marca_id = Number(marcaId);
      }

      console.log('📦 Datos a enviar:', formValue);
      console.log('🏷️ Marca ID:', formValue.marca_id);

      const request = this.producto
        ? this.almacenService.actualizarProducto(this.producto.id, formValue)
        : this.almacenService.crearProducto(formValue);

      request.subscribe({
        next: (response) => {
          console.log('Producto guardado exitosamente:', response);

          // ✅ OPTIMIZACIÓN: Guardar el producto para emitirlo después
          const productoGuardado = response.producto;

          // Si hay detalles para guardar
          const productoId = this.producto?.id || response.producto?.id;
          if (productoId && this.tieneDetallesParaGuardar()) {
            this.guardarDetalles(productoId, productoGuardado);
          } else {
            // ✅ Emitir el producto guardado
            this.productoGuardado.emit(productoGuardado);
            this.cerrarModal();
          }
        },
        error: (error) => {
          console.error('Error al guardar producto:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private tieneDetallesParaGuardar(): boolean {
    const detalles = this.detallesForm.value;

    // Verificar si hay algún detalle con contenido
    return !!(
      detalles.descripcion_detallada ||
      detalles.instrucciones_uso ||
      detalles.garantia ||
      detalles.politicas_devolucion ||
      this.especificaciones.value.some(
        (spec: any) => spec.nombre && spec.valor
      ) ||
      this.caracteristicasTecnicas.value.some(
        (carac: any) => carac.caracteristica && carac.detalle
      ) ||
      this.videos.value.some((video: string) => video.trim()) ||
      this.imagenesSeleccionadas.length > 0 ||
      detalles.largo ||
      detalles.ancho ||
      detalles.alto ||
      detalles.peso
    );
  }

  private guardarDetalles(productoId: number, productoGuardado?: any): void {
    const formData = new FormData();

    // Datos básicos
    formData.append(
      'descripcion_detallada',
      this.detallesForm.get('descripcion_detallada')?.value || ''
    );
    formData.append(
      'instrucciones_uso',
      this.detallesForm.get('instrucciones_uso')?.value || ''
    );
    formData.append('garantia', this.detallesForm.get('garantia')?.value || '');
    formData.append(
      'politicas_devolucion',
      this.detallesForm.get('politicas_devolucion')?.value || ''
    );

    // Dimensiones
    const dimensiones = {
      largo: this.detallesForm.get('largo')?.value || null,
      ancho: this.detallesForm.get('ancho')?.value || null,
      alto: this.detallesForm.get('alto')?.value || null,
      peso: this.detallesForm.get('peso')?.value || null,
    };
    formData.append('dimensiones', JSON.stringify(dimensiones));

    // Especificaciones
    const especificaciones = this.especificaciones.value.filter(
      (spec: any) => spec.nombre && spec.valor
    );
    formData.append('especificaciones', JSON.stringify(especificaciones));

    // Características técnicas
    const caracteristicasTecnicas = this.caracteristicasTecnicas.value.filter(
      (carac: any) => carac.caracteristica && carac.detalle
    );
    formData.append(
      'caracteristicas_tecnicas',
      JSON.stringify(caracteristicasTecnicas)
    );

    // Videos
    const videos = this.videos.value.filter((video: string) => video.trim());
    formData.append('videos', JSON.stringify(videos));

    // Imágenes
    this.imagenesSeleccionadas.forEach((imagen, index) => {
      formData.append(`imagenes[${index}]`, imagen);
    });

    // Enviar al servidor
    this.almacenService
      .guardarDetallesProducto(productoId, formData)
      .subscribe({
        next: (response) => {
          console.log('Detalles guardados exitosamente:', response);
          // ✅ Emitir el producto guardado
          this.productoGuardado.emit(productoGuardado);
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al guardar detalles:', error);
          // Aunque los detalles fallen, el producto ya se guardó
          // ✅ Emitir el producto guardado
          this.productoGuardado.emit(productoGuardado);
          this.cerrarModal();
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach((key) => {
      const control = this.productoForm.get(key);
      control?.markAsTouched();
    });
  }

  private cerrarModal(): void {
    this.isLoading = false;
    const modal = document.getElementById('modalCrearProducto');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.modalCerrado.emit();
  }

  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }
}
