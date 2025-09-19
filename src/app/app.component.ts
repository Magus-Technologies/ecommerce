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
        console.log('🔍 TODOS los parámetros:', params);
        
        const token = params['token'];
        const userData = params['user'];
        const tipoUsuario = params['tipo_usuario'];
        
        console.log('📋 Parámetros individuales:', {
          token: token ? 'EXISTE' : 'NO EXISTE',
          userData: userData ? 'EXISTE' : 'NO EXISTE',
          tipoUsuario: tipoUsuario,
          tokenLength: token?.length,
          userDataLength: userData?.length
        });

        if (token && userData && tipoUsuario === 'cliente') {
          try {
            console.log('✅ Iniciando processGoogleAuth...');
            console.log('🎯 Token a procesar:', token);
            console.log('👤 UserData sin decodificar:', userData);
            
            // Intentar decodificar userData antes de pasarlo
            const decodedUserData = decodeURIComponent(userData);
            console.log('👤 UserData decodificado:', decodedUserData);
            
            this.authService.processGoogleAuth(token, userData);
            
            console.log('🚀 processGoogleAuth completado, redirigiendo...');
            this.router.navigate(['/'], { replaceUrl: true });
            
          } catch (error) {
            console.error('❌ ERROR en app.component:', error);
            // resto del código...
          }
        } else {
          console.log('⚠️ Condición no cumplida:', {
            hasToken: !!token,
            hasUserData: !!userData,
            tipoUsuario: tipoUsuario
          });
        }
      });
    }
  }
}