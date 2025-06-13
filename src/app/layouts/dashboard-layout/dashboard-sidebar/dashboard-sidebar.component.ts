// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';
@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit, AfterViewInit {
  
  @Input() isSidebarOpen = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() sidebarCollapsed = new EventEmitter<boolean>(); // ✅ Nuevo output

  isCollapsed = false;
  esSuperadmin = false;
  puedeVerUsuarios = false;
  puedeVerBanners = false;
  isDesktop = false;
  private permisosSub: any;

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.esSuperadmin = currentUser?.roles?.includes('superadmin') ?? false;
    this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
    this.puedeVerBanners = this.permissionsService.hasPermission('banners.ver');
    
    this.checkScreenSize();

    // 🔁 Suscribirse a los cambios de permisos en tiempo real
    this.permisosSub = this.permissionsService.permissions$.subscribe(perms => {
      this.puedeVerUsuarios = perms.includes('usuarios.ver');
      this.puedeVerBanners = perms.includes('banners.ver');
    });
  }

  ngOnDestroy(): void {
    this.permisosSub?.unsubscribe();
  }

  cargarPermisos(): void {
    const currentUser = this.authService.getCurrentUser();
    this.esSuperadmin = currentUser?.roles?.includes('superadmin') ?? false;
    this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
    this.puedeVerBanners = this.permissionsService.hasPermission('banners.ver');
  }

  // ✅ Mover las emisiones iniciales aquí para evitar ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sidebarToggled.emit(!this.isCollapsed);
      this.sidebarCollapsed.emit(this.isCollapsed); // ✅ Emitir estado inicial
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 992;
    
    if (!this.isDesktop) {
      this.isCollapsed = false;
      this.isSidebarOpen = false;
      // ✅ También usar setTimeout aquí para evitar errores
      setTimeout(() => {
        this.sidebarCollapsed.emit(false); 
      });
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleCollapse(): void {
    if (this.isDesktop) {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarToggled.emit(!this.isCollapsed);
      this.sidebarCollapsed.emit(this.isCollapsed);
    }
  }
}