import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MotorizadosService, Motorizado } from '../../../../../services/motorizados.service';
import { AuthService } from '../../../../../services/auth.service';
import { UbigeoService } from '../../../../../services/ubigeo.service';
import { firstValueFrom } from 'rxjs';

interface UbigeoData {
  provinces: any[];
  districts: any[];
}

interface CategoriaLicencia {
  [key: string]: string;
}

@Component({
  selector: 'app-motorizados-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
   <div class="usuarios-container" style="padding: 20px;">
      <div class="usuarios-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-motorcycle"></i>
              {{isEditMode ? 'Editar' : 'Nuevo'}} Motorizado
            </h1>
            <p class="page-subtitle">{{isEditMode ? 'Modifica los datos del motorizado' : 'Registra un nuevo motorizado de delivery'}}</p>
          </div>
          <button type="button" class="btn btn-cancel" (click)="onCancel()" style="background-color: #6c757d; color: white; border: 1px solid #6c757d;">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
        </div>
      </div>

      <div class="table-container" *ngIf="!isLoading">
        <form [formGroup]="motorizadoForm" (ngSubmit)="onSubmit()">
          <!-- Personal Information Section -->
          <div class="form-section" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fff;">
            <div class="table-header">
              <h2 class="table-title">
                <i class="fas fa-user"></i>
                Información Personal
              </h2>
            </div>
            
            <div class="form-content" style="margin-top: 25px;">
              <!-- Primera fila: Foto + Campos principales -->
              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px; align-items: flex-start;">
                <!-- Columna de la foto -->
                <div class="form-group col-md-2" style="padding: 0 10px; margin-bottom: 20px;">
                  <label class="form-label" style="display: block; margin-bottom: 15px; font-weight: 600; color: #495057; text-align: center;">
                    <i class="fas fa-camera" style="margin-right: 8px; color: #007bff;"></i>
                    Foto del Motorizado
                  </label>
                  <div class="photo-upload-container" style="display: flex; justify-content: center;">
                    
                    <!-- Photo Preview -->
                    <div class="photo-preview" *ngIf="previewUrl" style="position: relative; display: inline-block;">
                      <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid #007bff; box-shadow: 0 8px 25px rgba(0,123,255,0.15); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px;">
                        <img [src]="previewUrl" alt="Vista previa" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; transition: transform 0.3s ease;">
                      </div>
                      <button type="button" 
                              class="btn-remove-image" 
                              (click)="removeImage()"
                              style="position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(238, 90, 82, 0.4); transition: all 0.3s ease; z-index: 10;">
                        <i class="fas fa-times" style="font-size: 12px;"></i>
                      </button>
                    </div>
                    
                    <!-- Upload Area -->
                    <div class="upload-area" *ngIf="!previewUrl" style="position: relative; display: inline-block;">
                      <input
                        type="file"
                        id="foto-input"
                        accept="image/*"
                        (change)="onFileSelected($event)"
                        style="display: none;">
                      <label for="foto-input" 
                             style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; height: 140px; border: 3px dashed #007bff; border-radius: 50%; background: linear-gradient(135deg, rgba(0,123,255,0.05), rgba(102,126,234,0.05)); transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div style="text-align: center; z-index: 2; position: relative;">
                          <i class="fas fa-camera-retro" style="font-size: 28px; color: #007bff; margin-bottom: 6px; opacity: 0.8;"></i>
                          <div style="font-size: 11px; font-weight: 600; color: #007bff; line-height: 1.2;">
                            Subir<br>Foto
                          </div>
                        </div>
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(0,123,255,0.1), transparent); opacity: 0; transition: opacity 0.3s ease;"></div>
                      </label>
                    </div>
                  </div>
                  
                  <!-- File Info -->
                  <div class="file-info" *ngIf="selectedFileName && !previewUrl" style="margin-top: 12px; padding: 6px 12px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 1px solid #dee2e6; border-radius: 15px; display: flex; align-items: center; gap: 6px; font-size: 10px;">
                    <i class="fas fa-file-image" style="color: #007bff; font-size: 12px;"></i>
                    <span style="color: #495057; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">{{selectedFileName}}</span>
                    <button type="button" 
                            (click)="removeImage()" 
                            style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 8px;">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div style="margin-top: 8px; text-align: center;">
                    <small style="color: #6c757d; font-size: 10px; font-style: italic;">
                      JPG, PNG, GIF (Max: 2MB)
                    </small>
                  </div>
                </div>
                
                <!-- Columna izquierda: Nombre, Correo, Teléfono -->
                <div class="col-md-4" style="padding: 0 10px;">
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="nombre_completo" class="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      id="nombre_completo"
                      formControlName="nombre_completo"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('nombre_completo')"
                      placeholder="Ingrese el nombre completo">
                    <div *ngIf="isFieldInvalid('nombre_completo')" class="invalid-feedback">
                      {{getFieldError('nombre_completo')}}
                    </div>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="correo" class="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      id="correo"
                      formControlName="correo"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('correo')"
                      placeholder="correo@ejemplo.com">
                    <div *ngIf="isFieldInvalid('correo')" class="invalid-feedback">
                      {{getFieldError('correo')}}
                    </div>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="telefono" class="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      formControlName="telefono"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('telefono')"
                      placeholder="Número de teléfono">
                    <div *ngIf="isFieldInvalid('telefono')" class="invalid-feedback">
                      {{getFieldError('telefono')}}
                    </div>
                  </div>
                </div>
                
                <!-- Columna derecha: Tipo y Número de documento -->
                <div class="col-md-4" style="padding: 0 10px;">
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="tipo_documento_id" class="form-label">Tipo de Documento *</label>
                    <select
                      id="tipo_documento_id"
                      formControlName="tipo_documento_id"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('tipo_documento_id')">
                      <option value="">Seleccionar</option>
                      <option *ngFor="let tipo of documentTypes" [value]="tipo.id">{{tipo.nombre}}</option>
                    </select>
                    <div *ngIf="isFieldInvalid('tipo_documento_id')" class="invalid-feedback">
                      {{getFieldError('tipo_documento_id')}}
                    </div>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="numero_documento" class="form-label">Número de Documento *</label>
                    <input
                      type="text"
                      id="numero_documento"
                      formControlName="numero_documento"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('numero_documento')"
                      placeholder="Número de documento">
                    <div *ngIf="isFieldInvalid('numero_documento')" class="invalid-feedback">
                      {{getFieldError('numero_documento')}}
                    </div>
                  </div>
                </div>
                
                <!-- Columna para equilibrio -->
                <div class="col-md-2" style="padding: 0 10px;">
                </div>
              </div>
              
              <!-- Segunda fila: Licencia y Categoría (ALINEADOS A LA IZQUIERDA) -->
              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <!-- Licencia y Categoría en la misma fila, empezando desde la izquierda -->
                <div class="col-md-10" style="padding: 0 10px;">
                  <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -5px;">
                    <div class="form-group col-md-6" style="padding: 0 5px; margin-bottom: 20px;">
                      <label for="licencia_numero" class="form-label">N° Licencia *</label>
                      <input
                        type="text"
                        id="licencia_numero"
                        formControlName="licencia_numero"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('licencia_numero')"
                        placeholder="Número de licencia">
                      <div *ngIf="isFieldInvalid('licencia_numero')" class="invalid-feedback">
                        {{getFieldError('licencia_numero')}}
                      </div>
                    </div>
                    
                    <div class="form-group col-md-6" style="padding: 0 5px; margin-bottom: 20px;">
                      <label for="licencia_categoria" class="form-label">Categoría *</label>
                      <select
                        id="licencia_categoria"
                        formControlName="licencia_categoria"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('licencia_categoria')">
                        <option value="">Seleccionar</option>
                        <option *ngFor="let categoria of categoriasLicencia | keyvalue" [value]="categoria.key">
                          {{categoria.value}}
                        </option>
                      </select>
                      <div *ngIf="isFieldInvalid('licencia_categoria')" class="invalid-feedback">
                        {{getFieldError('licencia_categoria')}}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Espacio para equilibrio -->
                <div class="col-md-2" style="padding: 0 10px;">
                </div>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <div class="form-section" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fff;">
            <div class="table-header">
              <h2 class="table-title">
                <i class="fas fa-map-marker-alt"></i>
                Información de Dirección
              </h2>
            </div>
            
            <div class="form-content">
              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="departamento" class="form-label">Departamento *</label>
                  <select
                    id="departamento"
                    formControlName="departamento"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('departamento')"
                    (change)="onDepartamentoChange()">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let dept of departamentos" [value]="dept.id_ubigeo">{{dept.nombre}}</option>
                  </select>
                  <div *ngIf="isFieldInvalid('departamento')" class="invalid-feedback">
                    {{getFieldError('departamento')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="provincia" class="form-label">Provincia *</label>
                  <select
                    id="provincia"
                    formControlName="provincia"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('provincia')"
                    (change)="onProvinciaChange()">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let prov of provincias" [value]="prov.id_ubigeo">{{prov.nombre}}</option>
                  </select>
                  <div *ngIf="isFieldInvalid('provincia')" class="invalid-feedback">
                    {{getFieldError('provincia')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="ubigeo" class="form-label">Distrito *</label>
                  <select
                    id="ubigeo"
                    formControlName="ubigeo"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('ubigeo')">
                    <option value="">Seleccionar</option>
                    <option *ngFor="let dist of distritos" [value]="dist.id_ubigeo">{{dist.nombre}}</option>
                  </select>
                  <div *ngIf="isFieldInvalid('ubigeo')" class="invalid-feedback">
                    {{getFieldError('ubigeo')}}
                  </div>
                </div>
              </div>

              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-12" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="direccion_detalle" class="form-label">Dirección Detalle *</label>
                  <input
                    type="text"
                    id="direccion_detalle"
                    formControlName="direccion_detalle"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('direccion_detalle')"
                    placeholder="Ingrese la dirección completa">
                  <div *ngIf="isFieldInvalid('direccion_detalle')" class="invalid-feedback">
                    {{getFieldError('direccion_detalle')}}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Information Section -->
          <div class="form-section" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fff;">
            <div class="table-header">
              <h2 class="table-title">
                <i class="fas fa-motorcycle"></i>
                Información del Vehículo
              </h2>
            </div>
            
            <div class="form-content">
              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_marca" class="form-label">Marca *</label>
                  <input
                    type="text"
                    id="vehiculo_marca"
                    formControlName="vehiculo_marca"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_marca')"
                    placeholder="Marca del vehículo">
                  <div *ngIf="isFieldInvalid('vehiculo_marca')" class="invalid-feedback">
                    {{getFieldError('vehiculo_marca')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_modelo" class="form-label">Modelo *</label>
                  <input
                    type="text"
                    id="vehiculo_modelo"
                    formControlName="vehiculo_modelo"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_modelo')"
                    placeholder="Modelo">
                  <div *ngIf="isFieldInvalid('vehiculo_modelo')" class="invalid-feedback">
                    {{getFieldError('vehiculo_modelo')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_ano" class="form-label">Año *</label>
                  <input
                    type="number"
                    id="vehiculo_ano"
                    formControlName="vehiculo_ano"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_ano')"
                    [min]="1950"
                    [max]="currentYear + 1"
                    placeholder="Año">
                  <div *ngIf="isFieldInvalid('vehiculo_ano')" class="invalid-feedback">
                    {{getFieldError('vehiculo_ano')}}
                  </div>
                </div>
              </div>

              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_cilindraje" class="form-label">Cilindraje *</label>
                  <input
                    type="text"
                    id="vehiculo_cilindraje"
                    formControlName="vehiculo_cilindraje"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_cilindraje')"
                    placeholder="Ej: 150cc">
                  <div *ngIf="isFieldInvalid('vehiculo_cilindraje')" class="invalid-feedback">
                    {{getFieldError('vehiculo_cilindraje')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_placa" class="form-label">Placa *</label>
                  <input
                    type="text"
                    id="vehiculo_placa"
                    formControlName="vehiculo_placa"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_placa')"
                    placeholder="Número de placa"
                    style="text-transform: uppercase;">
                  <div *ngIf="isFieldInvalid('vehiculo_placa')" class="invalid-feedback">
                    {{getFieldError('vehiculo_placa')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_color_principal" class="form-label">Color Principal *</label>
                  <input
                    type="text"
                    id="vehiculo_color_principal"
                    formControlName="vehiculo_color_principal"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_color_principal')"
                    placeholder="Color principal">
                  <div *ngIf="isFieldInvalid('vehiculo_color_principal')" class="invalid-feedback">
                    {{getFieldError('vehiculo_color_principal')}}
                  </div>
                </div>
              </div>

              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_color_secundario" class="form-label">Color Secundario</label>
                  <input
                    type="text"
                    id="vehiculo_color_secundario"
                    formControlName="vehiculo_color_secundario"
                    class="form-control"
                    placeholder="Color secundario (opcional)">
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_motor" class="form-label">Número de Motor *</label>
                  <input
                    type="text"
                    id="vehiculo_motor"
                    formControlName="vehiculo_motor"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_motor')"
                    placeholder="Número de motor">
                  <div *ngIf="isFieldInvalid('vehiculo_motor')" class="invalid-feedback">
                    {{getFieldError('vehiculo_motor')}}
                  </div>
                </div>
                
                <div class="form-group col-md-4" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="vehiculo_chasis" class="form-label">Número de Chasis *</label>
                  <input
                    type="text"
                    id="vehiculo_chasis"
                    formControlName="vehiculo_chasis"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('vehiculo_chasis')"
                    placeholder="Número de chasis">
                  <div *ngIf="isFieldInvalid('vehiculo_chasis')" class="invalid-feedback">
                    {{getFieldError('vehiculo_chasis')}}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Observations Section -->
          <div class="form-section" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #fff;">
            <div class="table-header">
              <h2 class="table-title">
                <i class="fas fa-clipboard"></i>
                Observaciones
              </h2>
            </div>
            
            <div class="form-content">
              <div class="form-row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div class="form-group col-12" style="padding: 0 10px; margin-bottom: 20px;">
                  <label for="comentario" class="form-label">Comentarios/Observaciones</label>
                  <textarea
                    id="comentario"
                    formControlName="comentario"
                    class="form-control"
                    rows="4"
                    placeholder="Ingrese observaciones adicionales sobre el motorizado (opcional)"
                    style="resize: vertical;"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions" style="padding: 20px; text-align: right; border-top: 1px solid #e9ecef;">
            <button type="button" class="btn btn-cancel" (click)="onCancel()" style="margin-right: 10px; background-color: #6c757d; color: white; border: 1px solid #6c757d;">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="btn btn-create" [disabled]="isSubmitting || motorizadoForm.invalid">
              <i *ngIf="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <i *ngIf="!isSubmitting" class="fas fa-save"></i>
              {{isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}} Motorizado
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Cargando información del motorizado...</p>
      </div>
    </div>
  `
})
export class MotorizadosFormComponent implements OnInit {
  motorizadoForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  currentYear = new Date().getFullYear();
  
  // Data for selects
  documentTypes: any[] = [];
  categoriasLicencia: CategoriaLicencia = {};
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  selectedFile?: File;
  selectedFileName = '';
  previewUrl = '';

  private userId: number | null = null;
  private motorizadoId: number | null = null;
  private cargandoUbigeo = false;
  private addressUbigeoData: UbigeoData = { provinces: [], districts: [] };

  constructor(
    private fb: FormBuilder,
    private motorizadosService: MotorizadosService,
    private authService: AuthService,
    private ubigeoService: UbigeoService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.motorizadoForm = this.fb.group({
      // Personal Information
      nombre_completo: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_documento_id: ['', Validators.required],
      numero_documento: ['', [Validators.required, Validators.maxLength(20)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      
      // License Information
      licencia_numero: ['', [Validators.required, Validators.maxLength(50)]],
      licencia_categoria: ['', Validators.required],
      
      // Address Information
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      ubigeo: ['', Validators.required],
      direccion_detalle: ['', [Validators.required, Validators.maxLength(255)]],
      
      // Vehicle Information
      vehiculo_marca: ['', [Validators.required, Validators.maxLength(50)]],
      vehiculo_modelo: ['', [Validators.required, Validators.maxLength(50)]],
      vehiculo_ano: ['', [Validators.required, Validators.min(1950), Validators.max(this.currentYear + 1)]],
      vehiculo_cilindraje: ['', [Validators.required, Validators.maxLength(20)]],
      vehiculo_placa: ['', [Validators.required, Validators.maxLength(10)]],
      vehiculo_color_principal: ['', [Validators.required, Validators.maxLength(30)]],
      vehiculo_color_secundario: ['', Validators.maxLength(30)],
      vehiculo_motor: ['', [Validators.required, Validators.maxLength(50)]],
      vehiculo_chasis: ['', [Validators.required, Validators.maxLength(50)]],
    
      comentario: ['', Validators.maxLength(500)]
    });
  }

  private loadInitialData(): void {
    this.loadDocumentTypes();
    this.loadCategoriasLicencia();
    this.loadDepartamentos();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.motorizadoId = +id;
      this.loadMotorizado(this.motorizadoId);
    }
  }

  private async loadDocumentTypes(): Promise<void> {
  try {
    this.documentTypes = await firstValueFrom(this.authService.getDocumentTypes());
    console.log('Document types loaded from DB:', this.documentTypes);
  } catch (error) {
    console.error('Error loading document types:', error);
    this.toastr.error('Error al cargar los tipos de documento');
    // Fallback a datos mock solo en caso de error
    this.documentTypes = [
      { id: 1, nombre: 'DNI' },
      { id: 2, nombre: 'Carné de Extranjería' },
      { id: 3, nombre: 'Pasaporte' },
      { id: 4, nombre: 'Otro' }
    ];
  }
}

  private async loadCategoriasLicencia(): Promise<void> {
    try {
      this.categoriasLicencia = await firstValueFrom(this.motorizadosService.getCategoriasLicencia()) as CategoriaLicencia;
    } catch (error) {
      console.error('Error loading license categories:', error);
      this.toastr.error('Error al cargar las categorías de licencia');
    }
  }

  private async loadDepartamentos(): Promise<void> {
    try {
      this.departamentos = await firstValueFrom(this.ubigeoService.getDepartamentos());
    } catch (error) {
      console.error('Error loading departments:', error);
      this.toastr.error('Error al cargar los departamentos');
    }
  }

  async onDepartamentoChange(): Promise<void> {
    const departamentoId = this.motorizadoForm.get('departamento')?.value;
    if (!departamentoId) return;

    try {
      // Resetear provincias y distritos
      this.provincias = [];
      this.distritos = [];
      this.motorizadoForm.patchValue({ provincia: '', ubigeo: '' });
      
      // Encontrar el departamento seleccionado para obtener su código
      const selectedDepartment = this.departamentos.find(d => d.id_ubigeo == departamentoId);
      if (selectedDepartment) {
        console.log(`Cargando provincias para departamento código: ${selectedDepartment.id}`);
        this.provincias = await firstValueFrom(this.ubigeoService.getProvincias(selectedDepartment.id));
        console.log('Provincias cargadas:', this.provincias);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
      this.toastr.error('Error al cargar las provincias');
    }
  }

  async onProvinciaChange(): Promise<void> {
    const departamentoId = this.motorizadoForm.get('departamento')?.value;
    const provinciaId = this.motorizadoForm.get('provincia')?.value;
    if (!departamentoId || !provinciaId) return;

    try {
      // Resetear distritos
      this.distritos = [];
      this.motorizadoForm.patchValue({ ubigeo: '' });
      
      // Obtener los códigos de departamento y provincia
      const selectedDepartment = this.departamentos.find(d => d.id_ubigeo == departamentoId);
      const selectedProvince = this.provincias.find(p => p.id_ubigeo == provinciaId);
      
      if (selectedDepartment && selectedProvince) {
        console.log(`Cargando distritos para departamento: ${selectedDepartment.id}, provincia: ${selectedProvince.id}`);
        this.distritos = await firstValueFrom(
          this.ubigeoService.getDistritos(selectedDepartment.id, selectedProvince.id)
        );
        console.log('Distritos cargados:', this.distritos);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      this.toastr.error('Error al cargar los distritos');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.match('image.*')) {
        this.toastr.error('Por favor seleccione un archivo de imagen válido');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = undefined;
    this.selectedFileName = '';
    this.previewUrl = '';
    // Reset file input
    const fileInput = document.getElementById('foto-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.motorizadoForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string): string {
    const control = this.motorizadoForm.get(field);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es requerido';
    } else if (control.errors['email']) {
      return 'Ingrese un correo electrónico válido';
    } else if (control.errors['min']) {
      return `El valor mínimo permitido es ${control.errors['min'].min}`;
    } else if (control.errors['max']) {
      return `El valor máximo permitido es ${control.errors['max'].max}`;
    } else if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  async onSubmit(): Promise<void> {
    if (this.motorizadoForm.invalid) {
      this.markFormGroupTouched(this.motorizadoForm);
      this.toastr.warning('Por favor complete todos los campos requeridos');
      return;
    }

    this.isSubmitting = true;
    const formData = this.prepareFormData();

    // Debug: verificar qué se está enviando
    console.log('Form values:', this.motorizadoForm.value);
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      if (this.isEditMode && this.motorizadoId) {
        await firstValueFrom(this.motorizadosService.actualizarMotorizado(this.motorizadoId, formData));
        this.toastr.success('Motorizado actualizado exitosamente');
      } else {
        await firstValueFrom(this.motorizadosService.crearMotorizado(formData));
        this.toastr.success('Motorizado creado exitosamente');
      }
      this.router.navigate(['/dashboard/motorizados']);
    } catch (error) {
      console.error('Error saving motorizado:', error);
      this.toastr.error('Ocurrió un error al guardar el motorizado');
    } finally {
      this.isSubmitting = false;
    }
  }

  private prepareFormData(): FormData {
    const formData = new FormData();
    const formValue = this.motorizadoForm.value;
    
    console.log('Preparing FormData from:', formValue);
  
    // Append all form values except UI-only fields
    Object.keys(formValue).forEach(key => {
      // Skip departamento and provincia as they're only for UI, ubigeo contains the final value
      if (key === 'departamento' || key === 'provincia') {
        console.log(`Skipping ${key}: ${formValue[key]}`);
        return;
      }
      
      const value = formValue[key] || '';
      console.log(`Adding ${key}: ${value}`);
      formData.append(key, value);
    });
  
    // Append file if exists
    if (this.selectedFile) {
      console.log('Adding file:', this.selectedFile.name);
      formData.append('foto_perfil', this.selectedFile, this.selectedFile.name);
    }
  
    // Add flag to remove photo if needed (for edit mode)
    if (this.isEditMode && !this.selectedFile && !this.previewUrl) {
      console.log('Adding eliminar_foto flag');
      formData.append('eliminar_foto', 'true');
    }
  
    return formData;
  }

  private async loadMotorizado(id: number): Promise<void> {
    this.isLoading = true;
    try {
      const motorizado = await firstValueFrom(this.motorizadosService.getMotorizado(id));
      this.patchFormWithMotorizadoData(motorizado);
    } catch (error) {
      console.error('Error loading motorizado:', error);
      this.toastr.error('Error al cargar los datos del motorizado');
      this.router.navigate(['/dashboard/motorizados']);
    } finally {
      this.isLoading = false;
    }
  }

  private async patchFormWithMotorizadoData(motorizado: any): Promise<void> {
    // Patch basic form values
    this.motorizadoForm.patchValue({
      nombre_completo: motorizado.nombre_completo,
      tipo_documento_id: motorizado.tipo_documento_id,
      numero_documento: motorizado.numero_documento,
      telefono: motorizado.telefono,
      correo: motorizado.correo,
      licencia_numero: motorizado.licencia_numero,
      licencia_categoria: motorizado.licencia_categoria,
      direccion_detalle: motorizado.direccion_detalle,
      vehiculo_marca: motorizado.vehiculo_marca,
      vehiculo_modelo: motorizado.vehiculo_modelo,
      vehiculo_ano: motorizado.vehiculo_ano,
      vehiculo_cilindraje: motorizado.vehiculo_cilindraje,
      vehiculo_placa: motorizado.vehiculo_placa,
      vehiculo_color_principal: motorizado.vehiculo_color_principal,
      vehiculo_color_secundario: motorizado.vehiculo_color_secundario,
      vehiculo_motor: motorizado.vehiculo_motor,
      vehiculo_chasis: motorizado.vehiculo_chasis,
      comentario: motorizado.comentario || '',
    });
  
    // Load ubigeo chain if ubigeo is present
    if (motorizado.ubigeo) {
      await this.loadUbigeoChain(motorizado.ubigeo.toString());
    }
  
    // Set preview image if exists
    if (motorizado.foto_perfil) {
      this.previewUrl = motorizado.foto_perfil;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control) {
        control.markAsTouched();
        
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  onCancel(): void {
    if (this.motorizadoForm.dirty) {
      if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/dashboard/motorizados']);
      }
    } else {
      this.router.navigate(['/dashboard/motorizados']);
    }
  }

  compareUbigeo(item1: any, item2: any): boolean {
    return item1 && item2 ? item1.id_ubigeo === item2.id_ubigeo : item1 === item2;
  }

  private async loadProvinciasForUbigeo(departamentoId: string, selectedProvinciaId: string): Promise<void> {
    try {
      this.provincias = await firstValueFrom(this.ubigeoService.getProvincias(departamentoId));
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading provinces for ubigeo:', error);
      throw error;
    }
  }

  private async loadDistritosForUbigeo(departamentoId: string, provinciaId: string): Promise<void> {
    try {
      this.distritos = await firstValueFrom(
        this.ubigeoService.getDistritos(departamentoId, provinciaId)
      );
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading districts for ubigeo:', error);
      throw error;
    }
  }

// REEMPLAZAR la función loadUbigeoChain existente
// REEMPLAZAR la función loadUbigeoChain existente
async loadUbigeoChain(ubigeoId: string): Promise<void> {
  if (!ubigeoId) return;

  this.cargandoUbigeo = true;
  
  try {
    // Obtener información del ubigeo seleccionado
    const response = await firstValueFrom(this.ubigeoService.getUbigeoChain(ubigeoId));
    
    if (response?.status === 'success') {
      const { departamento, provincia, distrito } = response.data;
      
      // 1. Buscar el departamento en la lista cargada
      const departamentoEncontrado = this.departamentos.find(dept => 
        dept.id === departamento.id
      );
      
      if (departamentoEncontrado) {
        // 2. Establecer el departamento en el formulario
        this.motorizadoForm.patchValue({
          departamento: departamentoEncontrado.id_ubigeo
        });
        
        // 3. Cargar provincias usando el CÓDIGO del departamento (no el id_ubigeo)
        // El backend espera el código "20", no el id_ubigeo del departamento
        this.provincias = await firstValueFrom(this.ubigeoService.getProvincias(departamento.id));
        
        // 4. Si hay provincia válida (no es "00"), buscarla
        if (provincia.id !== "00") {
          const provinciaEncontrada = this.provincias.find(prov => 
            prov.id === provincia.id
          );
          
          if (provinciaEncontrada) {
            // 5. Establecer la provincia en el formulario
            this.motorizadoForm.patchValue({
              provincia: provinciaEncontrada.id_ubigeo
            });
            
            // 6. Cargar distritos usando los CÓDIGOS (no los id_ubigeo)
            this.distritos = await firstValueFrom(
              this.ubigeoService.getDistritos(departamento.id, provincia.id)
            );
            
            // 7. Si hay distrito válido (no es "00"), buscarlo y establecerlo
            if (distrito.id !== "00") {
              const distritoEncontrado = this.distritos.find(dist => 
                dist.distrito === distrito.id
              );
              
              if (distritoEncontrado) {
                this.motorizadoForm.patchValue({
                  ubigeo: distritoEncontrado.id_ubigeo
                });
              }
            } else {
              // Si distrito es "00", significa que el ubigeo seleccionado es la provincia
              this.motorizadoForm.patchValue({
                ubigeo: parseInt(ubigeoId)
              });
            }
          }
        }
        
        this.cdr.detectChanges();
      } else {
        console.error('No se encontró el departamento con código:', departamento.id);
      }
    }
  } catch (error) {
    console.error('Error loading ubigeo chain:', error);
    this.toastr.error('Error al cargar la ubicación');
  } finally {
    this.cargandoUbigeo = false;
  }
}

  // Funciones auxiliares para extraer códigos
  private getDepartamentoCode(id_ubigeo: string): string {
    // Asumiendo que el id_ubigeo del departamento termina en "0000"
    return id_ubigeo.substring(0, 2);
  }
  
  private getProvinciaCode(id_ubigeo: string): string {
    // Asumiendo que el id_ubigeo de la provincia termina en "00"
    return id_ubigeo.substring(2, 4);
  }
}