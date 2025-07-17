// src\app\pages\dashboard\almacen\productos\producto-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { AlmacenService } from "../../../../services/almacen.service"
import {Producto, ProductoCreate, Categoria, MarcaProducto} from "../../../../types/almacen.types"

@Component({
  selector: "app-producto-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="modalCrearProducto" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 rounded-12">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-heading fw-semibold">
              {{ producto ? 'Editar Producto' : 'Nuevo Producto' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body p-24">
            <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <!-- Información básica -->
                <div class="col-md-8">
                  <div class="row">
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Nombre del Producto *</label>
                      <input type="text" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched"
                             formControlName="nombre"
                             placeholder="Ej: iPhone 15 Pro Max">
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched">
                        El nombre es requerido (mínimo 3 caracteres)
                      </div>
                    </div>

                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Código del Producto *</label>
                      <input type="text" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="productoForm.get('codigo_producto')?.invalid && productoForm.get('codigo_producto')?.touched"
                             formControlName="codigo_producto"
                             placeholder="Ej: IP15PM001">
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('codigo_producto')?.invalid && productoForm.get('codigo_producto')?.touched">
                        El código del producto es requerido
                      </div>
                    </div>
                  </div>

                  <div class="mb-16">
                    <label class="form-label text-heading fw-medium mb-8">Descripción</label>
                    <textarea class="form-control px-16 py-12 border rounded-8" 
                              rows="3"
                              formControlName="descripcion"
                              placeholder="Descripción del producto..."></textarea>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Categoría *</label>
                      <select class="form-select px-16 py-12 border rounded-8"
                              [class.is-invalid]="productoForm.get('categoria_id')?.invalid && productoForm.get('categoria_id')?.touched"
                              formControlName="categoria_id">
                        <option value="">Seleccionar categoría</option>
                        <option *ngFor="let categoria of categorias" [value]="categoria.id">
                          {{ categoria.nombre }}
                        </option>
                      </select>
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('categoria_id')?.invalid && productoForm.get('categoria_id')?.touched">
                        Selecciona una categoría
                      </div>
                    </div>

                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Marca</label>
                      <select class="form-select px-16 py-12 border rounded-8"
                              formControlName="marca_id">
                        <option value="">Seleccionar marca (opcional)</option>
                        <option *ngFor="let marca of marcas" [value]="marca.id">
                          {{ marca.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Precios y Stock -->
                  <div class="row">
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Precio de Compra *</label>
                      <div class="input-group">
                        <span class="input-group-text bg-gray-50 border-end-0">S/</span>
                        <input type="number" 
                               class="form-control px-16 py-12 border-start-0"
                               [class.is-invalid]="productoForm.get('precio_compra')?.invalid && productoForm.get('precio_compra')?.touched"
                               formControlName="precio_compra"
                               step="0.01"
                               min="0"
                               placeholder="0.00">
                      </div>
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('precio_compra')?.invalid && productoForm.get('precio_compra')?.touched">
                        El precio de compra es requerido
                      </div>
                    </div>

                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Precio de Venta *</label>
                      <div class="input-group">
                        <span class="input-group-text bg-gray-50 border-end-0">S/</span>
                        <input type="number" 
                               class="form-control px-16 py-12 border-start-0"
                               [class.is-invalid]="productoForm.get('precio_venta')?.invalid && productoForm.get('precio_venta')?.touched"
                               formControlName="precio_venta"
                               step="0.01"
                               min="0"
                               placeholder="0.00">
                      </div>
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('precio_venta')?.invalid && productoForm.get('precio_venta')?.touched">
                        El precio de venta es requerido
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Stock Actual *</label>
                      <input type="number" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="productoForm.get('stock')?.invalid && productoForm.get('stock')?.touched"
                             formControlName="stock"
                             min="0"
                             placeholder="0">
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('stock')?.invalid && productoForm.get('stock')?.touched">
                        El stock es requerido
                      </div>
                    </div>

                    <div class="col-md-6 mb-16">
                      <label class="form-label text-heading fw-medium mb-8">Stock Mínimo *</label>
                      <input type="number" 
                             class="form-control px-16 py-12 border rounded-8"
                             [class.is-invalid]="productoForm.get('stock_minimo')?.invalid && productoForm.get('stock_minimo')?.touched"
                             formControlName="stock_minimo"
                             min="0"
                             placeholder="5">
                      <div class="invalid-feedback" 
                           *ngIf="productoForm.get('stock_minimo')?.invalid && productoForm.get('stock_minimo')?.touched">
                        El stock mínimo es requerido
                      </div>
                    </div>
                  </div>

                  <div class="form-check">
                    <input class="form-check-input" 
                           type="checkbox" 
                           formControlName="activo"
                           id="activo">
                    <label class="form-check-label text-heading fw-medium" for="activo">
                      Producto activo
                    </label>
                  </div>
                </div>

                <!-- Imagen -->
                <div class="col-md-4">
                  <label class="form-label text-heading fw-medium mb-8">Imagen del Producto</label>
                  <div class="upload-area border-2 border-dashed border-gray-200 rounded-8 p-16 text-center"
                       [class.border-main-600]="imagePreview">
                    
                    <div *ngIf="!imagePreview" class="text-center">
                      <i class="ph ph-image text-gray-400 text-4xl mb-12"></i>
                      <p class="text-gray-500 text-sm mb-12">Seleccionar imagen</p>
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
                           style="max-height: 150px;">
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
                    Formatos: JPG, PNG, GIF (máx. 2MB)
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
              {{ isLoading ? 'Guardando...' : (producto ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .upload-area {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .upload-area:hover {
      border-color: var(--bs-main-600) !important;
    }
  `,
  ],
})
export class ProductoModalComponent implements OnInit, OnChanges {
  @Input() producto: Producto | null = null
  @Output() productoGuardado = new EventEmitter<void>()
  @Output() modalCerrado = new EventEmitter<void>()

  productoForm: FormGroup
  categorias: Categoria[] = []
  marcas: MarcaProducto[] = []
  selectedImage: File | null = null
  imagePreview: string | null = null
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private almacenService: AlmacenService,
  ) {
    this.productoForm = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(3)]],
      descripcion: [""],
      codigo_producto: ["", [Validators.required]],
      categoria_id: ["", [Validators.required]],
      marca_id: [""],
      precio_compra: ["", [Validators.required, Validators.min(0)]],
      precio_venta: ["", [Validators.required, Validators.min(0)]],
      stock: ["", [Validators.required, Validators.min(0)]],
      stock_minimo: [5, [Validators.required, Validators.min(0)]],
      activo: [true],
    })
  }

  ngOnInit(): void {
    this.cargarCategorias()
    this.cargarMarcas()
  }

  ngOnChanges(): void {
    if (this.producto) {
      this.productoForm.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        codigo_producto: this.producto.codigo_producto,
        categoria_id: this.producto.categoria_id,
        marca_id: this.producto.marca_id || "",
        precio_compra: this.producto.precio_compra,
        precio_venta: this.producto.precio_venta,
        stock: this.producto.stock,
        stock_minimo: this.producto.stock_minimo,
        activo: this.producto.activo,
      })
      this.imagePreview = this.producto.imagen_url || null
    } else {
      this.productoForm.reset({
        nombre: "",
        descripcion: "",
        codigo_producto: "",
        categoria_id: "",
        marca_id: "",
        precio_compra: "",
        precio_venta: "",
        stock: "",
        stock_minimo: 5,
        activo: true,
      })
      this.imagePreview = null
      this.selectedImage = null
    }
  }

  cargarCategorias(): void {
    this.almacenService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter((cat) => cat.activo)
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
      },
    })
  }

  cargarMarcas(): void {
    this.almacenService.obtenerMarcasActivas().subscribe({
      next: (marcas) => {
        this.marcas = marcas
      },
      error: (error) => {
        console.error("Error al cargar marcas:", error)
      },
    })
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      this.selectedImage = file

      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.isLoading = true

      const formValue = {
        ...this.productoForm.value,
        activo: Boolean(this.productoForm.get('activo')?.value),
        imagen: this.selectedImage,
      }

      // Si marca_id está vacío, convertirlo a null
      if (!formValue.marca_id) {
        formValue.marca_id = null
      }

      const request = this.producto
        ? this.almacenService.actualizarProducto(this.producto.id, formValue)
        : this.almacenService.crearProducto(formValue)

      request.subscribe({
        next: (response) => {
          console.log("Producto guardado exitosamente:", response)
          this.productoGuardado.emit()
          this.cerrarModal()
        },
        error: (error) => {
          console.error("Error al guardar producto:", error)
          this.isLoading = false
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach((key) => {
      const control = this.productoForm.get(key)
      control?.markAsTouched()
    })
  }

  private cerrarModal(): void {
    this.isLoading = false
    const modal = document.getElementById("modalCrearProducto")
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal)
      if (bootstrapModal) {
        bootstrapModal.hide()
      }
    }
    this.modalCerrado.emit()
  }
}