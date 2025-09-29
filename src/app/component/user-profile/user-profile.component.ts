// src/app/component/user-profile/user-profile.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./user-profile.component.html",
  styleUrl: "./user-profile.component.scss"
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  esSuperadmin = false;
  esCliente = false;
  showAuthDropdown = false;
  showUserDropdown = false;
  isInitializing = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Obtener estado inmediatamente de forma síncrona
    this.initializeUserState();

    // Suscribirse a cambios del usuario
    this.authService.currentUser.subscribe(user => {
      this.updateUserState(user);
      console.log('UserProfile updated:', {
        user: this.user,
        isLoggedIn: this.isLoggedIn,
        esCliente: this.esCliente,
        esSuperadmin: this.esSuperadmin,
        isInitializing: this.isInitializing
      });
    });
  }

  private initializeUserState(): void {
    // Obtener el usuario actual de forma síncrona para evitar estados duplicados
    const currentUser = this.authService.getCurrentUser();
    const isLoggedIn = this.authService.isLoggedIn();

    console.log('🔄 Inicializando estado:', { currentUser, isLoggedIn });

    if (isLoggedIn && currentUser) {
      this.updateUserState(currentUser);
    } else {
      this.updateUserState(null);
    }
  }

  private updateUserState(user: any): void {
    console.log('🔧 Actualizando estado con usuario:', user);

    this.user = user;
    this.isLoggedIn = !!user;

    if (user) {
      // Verificar si es superadmin (puede estar en roles array o como propiedad)
      this.esSuperadmin = user.roles?.includes('superadmin') ||
                         user.roles?.includes('admin') ||
                         user.tipo_usuario === 'admin';
      this.esCliente = user.tipo_usuario === 'cliente';
    } else {
      this.esSuperadmin = false;
      this.esCliente = false;
    }

    // CRÍTICO: Finalizar inicialización inmediatamente
    this.isInitializing = false;

    console.log('✅ Estado actualizado:', {
      isLoggedIn: this.isLoggedIn,
      esCliente: this.esCliente,
      esSuperadmin: this.esSuperadmin,
      isInitializing: this.isInitializing
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar dropdowns al hacer click fuera
    this.showAuthDropdown = false;
    this.showUserDropdown = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.closeUserDropdown();
    });
  }

  toggleAuthDropdown(event: Event): void {
    event.stopPropagation();
    this.showAuthDropdown = !this.showAuthDropdown;
    this.showUserDropdown = false; // Cerrar el otro dropdown
  }

  closeAuthDropdown(): void {
    this.showAuthDropdown = false;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showAuthDropdown = false; // Cerrar el otro dropdown
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }

  getCurrentState(): string {
    if (this.isInitializing) {
      console.log('🔄 User Profile State: LOADING');
      return 'loading';
    }

    if (this.isLoggedIn && this.user) {
      console.log('✅ User Profile State: LOGGED IN -', this.user.name);
      return 'logged';
    }

    console.log('👤 User Profile State: GUEST');
    return 'guest';
  }

  getDisplayName(): string {
    if (!this.user) return 'No Usuario';

    if (this.esCliente) {
      return this.user.name || 'Cliente';
    } else {
      // Es admin
      return this.esSuperadmin ? 'Super Admin' : 'Admin Usuario';
    }
  }
}