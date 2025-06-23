// src/app/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { AuthService } from '../../services/auth.service';
import { ReniecService } from '../../services/reniec.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  UbigeoService,
  Departamento,
  Provincia,
  Distrito,
} from '../../services/ubigeo.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    ShippingComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  registerError: string = '';
  registerSuccess: string = '';
  isLoading: boolean = false;
  showRegisterPassword: boolean = false;
  isDniLoading: boolean = false;
  dniStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  
  // Estados de validación
  emailStatus: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  documentoStatus: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  
  // Listas para ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

  // Estados de carga
  isLoadingDepartamentos = false;
  isLoadingProvincias = false;
  isLoadingDistritos = false;

  // Tipos de documento
  tiposDocumento: any[] = [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'Pasaporte' },
    { id: 3, nombre: 'Carnet de Extranjería' },
    { id: 4, nombre: 'RUC' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private reniecService: ReniecService,
    private ubigeoService: UbigeoService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setupDniAutoComplete();
    this.setupEmailValidation();
    this.setupDocumentoValidation();
    this.setupUbigeoListeners();
    this.loadDocumentTypes();
    this.loadDepartamentos();

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  initForms(): void {
    this.registerForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(255)]],
      apellidos: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      tipo_documento_id: ['', Validators.required],
      numero_documento: ['', [Validators.required, Validators.maxLength(20)]],
      telefono: ['', Validators.maxLength(20)],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],

      // Datos de dirección (opcionales)
      direccion_completa: [''],
      departamento_id: [''],
      provincia_id: [''],
      distrito_id: [''],
      ubigeo: [''],
    });
  }

  setupEmailValidation(): void {
    this.registerForm
      .get('email')
      ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((email) => {
        if (email && this.registerForm.get('email')?.valid) {
          this.checkEmailExists(email);
        } else {
          this.emailStatus = 'idle';
        }
      });
  }

  setupDocumentoValidation(): void {
    this.registerForm
      .get('numero_documento')
      ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((numeroDocumento) => {
        if (numeroDocumento && numeroDocumento.length >= 8) {
          this.checkDocumentoExists(numeroDocumento);
        } else {
          this.documentoStatus = 'idle';
        }
      });
  }

  checkEmailExists(email: string): void {
    this.emailStatus = 'checking';
    this.authService.checkEmail(email).subscribe({
      next: (response) => {
        this.emailStatus = response.exists ? 'taken' : 'available';
        if (response.exists) {
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
        }
      },
      error: (error) => {
        this.emailStatus = 'idle';
        console.error('Error verificando email:', error);
      },
    });
  }

  checkDocumentoExists(numeroDocumento: string): void {
    this.documentoStatus = 'checking';
    this.authService.checkDocumento(numeroDocumento).subscribe({
      next: (response) => {
        this.documentoStatus = response.exists ? 'taken' : 'available';
        if (response.exists) {
          this.registerForm.get('numero_documento')?.setErrors({ documentoTaken: true });
        }
      },
      error: (error) => {
        this.documentoStatus = 'idle';
        console.error('Error verificando documento:', error);
      },
    });
  }

  loadDepartamentos(): void {
    this.isLoadingDepartamentos = true;
    this.ubigeoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
        this.isLoadingDepartamentos = false;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.isLoadingDepartamentos = false;
      },
    });
  }

  setupUbigeoListeners(): void {
    // Escuchar cambios en departamento
    this.registerForm
      .get('departamento_id')
      ?.valueChanges.subscribe((departamentoId) => {
        if (departamentoId) {
          this.loadProvincias(departamentoId);
          this.registerForm.patchValue({
            provincia_id: '',
            distrito_id: '',
            ubigeo: '',
          });
          this.provincias = [];
          this.distritos = [];
        }
      });

    // Escuchar cambios en provincia
    this.registerForm
      .get('provincia_id')
      ?.valueChanges.subscribe((provinciaId) => {
        const departamentoId = this.registerForm.get('departamento_id')?.value;
        if (departamentoId && provinciaId) {
          this.loadDistritos(departamentoId, provinciaId);
          this.registerForm.patchValue({
            distrito_id: '',
            ubigeo: '',
          });
          this.distritos = [];
        }
      });

    // Escuchar cambios en distrito para establecer ubigeo final
    this.registerForm
      .get('distrito_id')
      ?.valueChanges.subscribe((distritoId) => {
        if (distritoId) {
          const distrito = this.distritos.find((d) => d.id === distritoId);
          if (distrito) {
            this.registerForm.patchValue({
              ubigeo: String(distrito.id_ubigeo), // ← Convertir a string
            });
          }
        }
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
      },
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
      },
    });
  }

  setupDniAutoComplete(): void {
    // Escuchar cambios en el número de documento para DNI
    this.registerForm
      .get('numero_documento')
      ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((numeroDocumento) => {
        this.consultarDni(numeroDocumento);
      });

    // Limpiar campos cuando cambie el tipo de documento
    this.registerForm.get('tipo_documento_id')?.valueChanges.subscribe(() => {
      this.registerForm.patchValue({
        nombres: '',
        apellidos: '',
      });
      this.dniStatus = 'idle';
    });
  }

  consultarDni(numeroDocumento: string): void {
    // Solo consultar si es DNI (tipo 1) y tiene 8 dígitos
    if (
      this.registerForm.get('tipo_documento_id')?.value === '1' &&
      numeroDocumento &&
      numeroDocumento.length === 8 &&
      /^\d{8}$/.test(numeroDocumento)
    ) {
      this.isDniLoading = true;
      this.dniStatus = 'loading';

      this.reniecService.buscarPorDni(numeroDocumento).subscribe({
        next: (response) => {
          this.isDniLoading = false;

          if (
            response.success &&
            response.nombres &&
            response.apellidoPaterno &&
            response.apellidoMaterno
          ) {
            this.registerForm.patchValue({
              nombres: response.nombres,
              apellidos: `${response.apellidoPaterno} ${response.apellidoMaterno}`,
            });

            this.dniStatus = 'success';
          } else {
            this.dniStatus = 'error';
            console.warn('DNI no encontrado o datos incompletos');
          }
        },
        error: (error) => {
          this.isDniLoading = false;
          this.dniStatus = 'error';
          console.error('Error consultando DNI:', error);
        },
      });
    } else {
      this.dniStatus = 'idle';
    }
  }

  loadDocumentTypes(): void {
    this.authService.getDocumentTypes().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
      },
      error: (error) => {
        console.error('Error cargando tipos de documento:', error);
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Validar que las contraseñas coincidan
    if (
      this.registerForm.value.password !==
      this.registerForm.value.password_confirmation
    ) {
      this.registerError = 'Las contraseñas no coinciden';
      return;
    }

    // Verificar si hay errores de duplicados
    if (this.emailStatus === 'taken') {
      this.registerError = 'El correo electrónico ya está registrado';
      return;
    }

    if (this.documentoStatus === 'taken') {
      this.registerError = 'El número de documento ya está registrado';
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const registerData = { ...this.registerForm.value };
    
    // Asegurar que ubigeo sea string si existe
    if (registerData.ubigeo) {
      registerData.ubigeo = String(registerData.ubigeo);
    }

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registerSuccess =
          'Cuenta creada exitosamente. Ya puedes iniciar sesión.';
        this.registerForm.reset();

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/account']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 422) {
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            let errorMessage = 'Errores de validación:\n';

            Object.keys(errors).forEach((key) => {
              errorMessage += `• ${errors[key][0]}\n`;
            });

            this.registerError = errorMessage;
          } else {
            this.registerError = 'Error en los datos proporcionados.';
          }
        } else if (error.status === 0) {
          this.registerError =
            'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.registerError =
            'Error del servidor. Por favor, inténtalo más tarde.';
        }
      },
    });
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  loginWithGoogle(): void {
    console.log('Login con Google clickeado');
    // Implementar Google Auth más adelante
  }

  // Getters para facilitar el acceso a los campos del formulario
  get registerNombres() {
    return this.registerForm.get('nombres');
  }
  get registerApellidos() {
    return this.registerForm.get('apellidos');
  }
  get registerEmail() {
    return this.registerForm.get('email');
  }
  get registerTipoDocumento() {
    return this.registerForm.get('tipo_documento_id');
  }
  get registerNumeroDocumento() {
    return this.registerForm.get('numero_documento');
  }
  get registerPassword() {
    return this.registerForm.get('password');
  }
  get registerPasswordConfirmation() {
    return this.registerForm.get('password_confirmation');
  }
}