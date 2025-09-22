// src\app\pages\my-account\my-account.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ModalFotoComponent } from '../../component/modal-foto/modal-foto.component';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ModalFotoComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss'
})
export class MyAccountComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading: boolean = true;
  showModalFoto: boolean = false;
  private destroy$ = new Subject<void>();
  private photoUrlCache: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/account']);
      return;
    }

    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoading = false;

          // Si no hay usuario, redirigir al login
          if (!user) {
            this.router.navigate(['/account']);
          }
        },
        error: (error) => {
          console.error('Error al cargar datos del usuario:', error);
          this.isLoading = false;
          this.router.navigate(['/account']);
        }
      });
  }


  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/account']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Aún así redirigir al login
        this.router.navigate(['/account']);
      }
    });
  }

  // Métodos auxiliares para obtener información del usuario
  getUserName(): string {
    if (!this.currentUser) return 'Usuario';
    
    // Si es un cliente e-commerce, extraer solo los nombres
    if (this.currentUser.tipo_usuario === 'cliente') {
      // Si existe name (que viene como nombre_completo), extraer solo los nombres
      if (this.currentUser.name) {
        const nombres = this.currentUser.name.split(' ');
        // Tomar solo las primeras dos palabras (nombres)
        return nombres.slice(0, 2).join(' ');
      }
      return 'Cliente';
    }
    
    // Si es admin, usar name completo
    return this.currentUser.name || 'Usuario';
  }

  getUserEmail(): string {
    return this.currentUser?.email || '';
  }

  getUserType(): string {
    if (this.currentUser?.tipo_usuario === 'cliente') {
      return 'Cliente Verificado';
    } else if (this.currentUser?.tipo_usuario === 'admin') {
      return 'Administrador';
    }
    return 'Usuario';
  }

  getUserTypeClass(): string {
    if (this.currentUser?.tipo_usuario === 'cliente') {
      return 'bg-main-50 text-main-600';
    } else if (this.currentUser?.tipo_usuario === 'admin') {
      return 'bg-success-50 text-success-600';
    }
    return 'bg-gray-50 text-gray-600';
  }

  // Método para obtener las iniciales del usuario para el avatar
  getUserInitials(): string {
    const name = this.getUserName();
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Método para obtener la URL de la foto de perfil
  getUserPhotoUrl(): string | null {
    if (this.photoUrlCache !== null) {
      return this.photoUrlCache;
    }

    if (this.currentUser?.tipo_usuario === 'cliente') {
      const userAny = this.currentUser as any;
      const photoField = this.currentUser.foto || userAny.foto_url || userAny.profile_photo || userAny.avatar;

      if (photoField) {
        let finalUrl = photoField;

        if (finalUrl.startsWith('http')) {
          finalUrl = finalUrl.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
        } else {
          let photoPath = finalUrl;
          if (photoPath.includes('/storage/clientes//storage/clientes/')) {
            photoPath = photoPath.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
          }
          finalUrl = `${environment.baseUrl}${photoPath}`;
        }

        this.photoUrlCache = finalUrl;
        return finalUrl;
      }
    }

    this.photoUrlCache = null;
    return null;
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  // Método para abrir modal de foto
  abrirModalFoto(): void {
    this.showModalFoto = true;
  }

  // Método para cerrar modal de foto
  cerrarModalFoto(): void {
    this.showModalFoto = false;
  }

  // Método para actualizar foto de perfil
  onFotoActualizada(): void {
    this.cerrarModalFoto();

    // Limpiar cache de foto
    this.photoUrlCache = null;

    // Forzar recarga de datos con un pequeño delay para asegurar que el backend se haya actualizado
    setTimeout(() => {
      this.authService.refreshUserData().subscribe({
        next: () => {
          this.loadUserData();
        },
        error: (error) => {
          this.loadUserData();
        }
      });
    }, 500);
  }
}