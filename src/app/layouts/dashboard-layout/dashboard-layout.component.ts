// src/app/layouts/dashboard-layout/dashboard-layout.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { AuthService } from '../../services/auth.service';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardSidebarComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  
  isSidebarOpen = false;
  isSidebarCollapsed = false; 
  isDesktop = false;
  public esSuperadmin: boolean = false;
  puedeVerUsuarios = false;

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService
  ) {
      // Escuchar cambios de permisos
    window.addEventListener('permissionsUpdated', () => {
      this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
    });
  }

 // In dashboard-sidebar.component.ts - Update the ngOnInit method
ngOnInit(): void {
  const currentUser = this.authService.getCurrentUser();
  // Usar getRoleNames() de Spatie que devuelve un array
  this.esSuperadmin = currentUser?.roles?.includes('superadmin') ?? false; 
  this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
  this.checkScreenSize();
}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 992;
    if (this.isDesktop) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
      this.isSidebarCollapsed = false; 
    }
  }

  // ✅ Nuevo método para manejar el colapso
  onSidebarCollapse(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('🍔 Toggle Sidebar - isSidebarOpen:', this.isSidebarOpen);
  }

  closeSidebar(): void {
    if (!this.isDesktop) {
      this.isSidebarOpen = false;
    }
  }
}