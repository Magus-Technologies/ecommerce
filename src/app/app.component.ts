// src\app\app.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as AOS from 'aos';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'marketpro';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      if (isPlatformBrowser(this.platformId)) {
        AOS.init({
          duration: 1000,
          once: true,
          easing: 'ease-in-out',
        });
      }

      // Verificar si hay parámetros de autenticación de Google en la URL
      this.route.queryParams.subscribe(params => {
        const token = params['token'];
        const userData = params['user'];
        const tipoUsuario = params['tipo_usuario'];

        // Código existente antes:
        if (token && userData && tipoUsuario === 'cliente') {
          try {
            // REEMPLAZA desde aquí:
            // Procesar autenticación de Google usando el método del AuthService
            this.authService.processGoogleAuth(token, userData);
            
            // Limpiar URL y redirigir
            this.router.navigate(['/'], { replaceUrl: true });
            console.log('Login con Google exitoso');
            // HASTA aquí
          } catch (error) {
            console.error('Error procesando autenticación de Google:', error);
            this.router.navigate(['/account'], { 
              queryParams: { error: 'auth_processing_failed' }, 
              replaceUrl: true 
            });
          }
        }

        // Verificar si hay error de autenticación
        if (params['error'] === 'google_auth_failed') {
          console.error('Error en autenticación con Google');
          this.router.navigate(['/account'], { replaceUrl: true });
        }
      });
    }
  }
}