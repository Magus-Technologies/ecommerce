// src/app/pages/account/account.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
  registerForm!: FormGroup;
  loginError: string = '';
  registerError: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showRegisterPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar formularios
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

    // Formulario de registro
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Modificar el método onLogin para quitar la redirección duplicada:
onLogin(): void {
  if (this.loginForm.invalid) {
    // Marcar todos los campos como tocados para mostrar errores
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
      // NO redirigir aquí, ya que el servicio de autenticación se encarga de eso
      // this.router.navigate(['/']); // COMENTADO para evitar conflicto de redirección
    },
    error: (error) => {
      // Resto del código permanece igual...
    }
  });
}



  onRegister(): void {
    // Esta función la implementaremos más adelante
    // Por ahora solo validamos el formulario
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    // Aquí iría la lógica para registrar un usuario
    // Por ahora solo mostramos un mensaje
    alert('Funcionalidad de registro no implementada aún');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  // Getters para facilitar el acceso a los campos del formulario en el template
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }
  get registerUsername() { return this.registerForm.get('username'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
}