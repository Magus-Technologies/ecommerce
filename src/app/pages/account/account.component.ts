// src/app/pages/account/account.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    ShippingComponent,
    ReactiveFormsModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  loginError: string = '';
  registerError: string = '';
  registerSuccess: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showRegisterPassword: boolean = false;
  
  // Tipos de documento (cargar desde API)
  tiposDocumento: any[] = [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'Pasaporte' },
    { id: 3, nombre: 'Carnet de Extranjería' },
    { id: 4, nombre: 'RUC' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadDocumentTypes();
    
    // Si el usuario ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  initForms(): void {
    // Formulario de login (sin cambios)
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });

    // Formulario de registro COMPLETO
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
      departamento: [''],
      provincia: [''],
      distrito: ['']
    });
  }

  loadDocumentTypes(): void {
    // Cargar tipos de documento desde la API
    this.authService.getDocumentTypes().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
      },
      error: (error) => {
        console.error('Error cargando tipos de documento:', error);
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Guardar "remember me" si está marcado
        if (this.loginForm.value.remember) {
          localStorage.setItem('remember_email', credentials.email);
        } else {
          localStorage.removeItem('remember_email');
        }

        // Redirigir según el tipo de usuario
        if (response.tipo_usuario === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (response.tipo_usuario === 'cliente') {
          this.router.navigate(['/']); // E-commerce home
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.status === 401) {
          this.loginError = 'Las credenciales proporcionadas son incorrectas.';
        } else if (error.status === 422) {
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            if (errors.email && errors.email.length > 0) {
              this.loginError = errors.email[0];
            } else if (errors.password && errors.password.length > 0) {
              this.loginError = errors.password[0];
            } else {
              this.loginError = 'Por favor, verifica los datos ingresados.';
            }
          } else {
            this.loginError = 'Por favor, verifica los datos ingresados.';
          }
        } else if (error.status === 0) {
          this.loginError = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.loginError = 'Error del servidor. Por favor, inténtalo más tarde.';
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.registerError = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const registerData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registerSuccess = 'Cuenta creada exitosamente. Ya puedes iniciar sesión.';
        this.registerForm.reset();
        
        // Opcional: Auto-login después del registro
        // this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.status === 422) {
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            let errorMessage = 'Errores de validación:\n';
            
            Object.keys(errors).forEach(key => {
              errorMessage += `• ${errors[key][0]}\n`;
            });
            
            this.registerError = errorMessage;
          } else {
            this.registerError = 'Error en los datos proporcionados.';
          }
        } else if (error.status === 0) {
          this.registerError = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.registerError = 'Error del servidor. Por favor, inténtalo más tarde.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  loginWithGoogle(): void {
    console.log('Login con Google clickeado');
    // Implementar Google Auth más adelante
  }

  // Getters para facilitar el acceso a los campos del formulario
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }
  
  get registerNombres() { return this.registerForm.get('nombres'); }
  get registerApellidos() { return this.registerForm.get('apellidos'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerTipoDocumento() { return this.registerForm.get('tipo_documento_id'); }
  get registerNumeroDocumento() { return this.registerForm.get('numero_documento'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerPasswordConfirmation() { return this.registerForm.get('password_confirmation'); }
}