// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
})
export class DashboardSidebarComponent implements OnInit, AfterViewInit {
  @Input() isSidebarOpen = false;
  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() sidebarCollapsed = new EventEmitter<boolean>();

  isCollapsed = false;
  esSuperadmin = false;
  puedeVerUsuarios = false;
  puedeVerBanners = false;
  puedeVerBanners_promocionales = false;
  puedeVerClientes = false;
  puedeVerOfertas = false; // ✅ NUEVO
  puedeVerCupones = false; // ✅ NUEVO
  // Agrega esta línea después de puedeVerClientes = false;
  puedeVerPedidos = false;

  isDesktop = false;
  private permisosSub: any;

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.esSuperadmin = currentUser?.roles?.includes('superadmin') ?? false;
    this.checkPermissions();
    this.checkScreenSize();

    // Suscribirse a los cambios de permisos en tiempo real
    this.permisosSub = this.permissionsService.permissions$.subscribe(
      (perms) => {
        this.checkPermissions();
      }
    );
    this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
    this.puedeVerBanners = this.permissionsService.hasPermission('banners.ver');
    this.puedeVerBanners_promocionales = this.permissionsService.hasPermission('banners_promocionales.ver');
    this.puedeVerClientes = this.permissionsService.hasPermission('clientes.ver');
    this.puedeVerPedidos = this.permissionsService.hasPermission('pedidos.ver');
    
    this.checkScreenSize();

    // 🔁 Suscribirse a los cambios de permisos en tiempo real
    this.permisosSub = this.permissionsService.permissions$.subscribe(perms => {
      this.puedeVerUsuarios = perms.includes('usuarios.ver');
      this.puedeVerBanners = perms.includes('banners.ver');
      this.puedeVerBanners_promocionales = perms.includes('banners_promocionales.ver');
      this.puedeVerClientes = perms.includes('clientes.ver');
      this.puedeVerPedidos = perms.includes('pedidos.ver');
    });
  }

  ngOnDestroy(): void {
    this.permisosSub?.unsubscribe();
  }

  private checkPermissions(): void {
    this.puedeVerUsuarios =
      this.permissionsService.hasPermission('usuarios.ver');
    this.puedeVerBanners = this.permissionsService.hasPermission('banners.ver');
    this.puedeVerBanners_promocionales = this.permissionsService.hasPermission(
      'banners_promocionales.ver'
    );
    this.puedeVerClientes =
      this.permissionsService.hasPermission('clientes.ver');
    this.puedeVerOfertas = this.permissionsService.hasPermission('ofertas.ver'); // ✅ NUEVO
    this.puedeVerCupones = this.permissionsService.hasPermission('cupones.ver'); // ✅ NUEVO
    this.puedeVerBanners_promocionales = this.permissionsService.hasPermission('banners_promocionales.ver');
    this.puedeVerClientes = this.permissionsService.hasPermission('clientes.ver');
    this.puedeVerPedidos = this.permissionsService.hasPermission('pedidos.ver');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sidebarToggled.emit(!this.isCollapsed);
      this.sidebarCollapsed.emit(this.isCollapsed);
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
