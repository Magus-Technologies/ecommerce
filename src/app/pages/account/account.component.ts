// src/app/pages/account/account.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    ShippingComponent,
    ReactiveFormsModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    
    // Si el usuario ya está logueado, redirigir a la página principal
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  initForms(): void {
    // Formulario de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    console.log('Login con Google clickeado');
    // Implementar Google Auth más adelante
  }

  // Getters para facilitar el acceso a los campos del formulario en el template
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }
}