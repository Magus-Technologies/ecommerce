// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
  HostListener,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
})
export class DashboardSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  set isSidebarOpen(value: boolean) {
    console.log('📁 Sidebar recibió isSidebarOpen:', value);
    this._isSidebarOpen = value;
  }
  get isSidebarOpen(): boolean {
    return this._isSidebarOpen;
  }
  private _isSidebarOpen = false;

  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() sidebarCollapsed = new EventEmitter<boolean>();

  isCollapsed = false;
  isEcommerceOpen = false;
  isUsuariosOpen = false;
  isOperacionesOpen = false;
  isAlmacenOpen = false;
  esSuperadmin = false;
  
  // Permisos
  puedeVerUsuarios = false;
  puedeVerBanners = false;
  puedeVerBanners_promocionales = false;
  puedeVerClientes = false;
  puedeVerOfertas = false;
  puedeVerCupones = false;
  puedeVerPedidos = false;
  puedeVerCompras = false;
  puedeVerReclamos = false;
  puedeVerMotorizados = false;
  puedeVerHorarios = false;
  puedeVerEmpresaInfo = false;
  puedeVerEmailTemplates = false;
  puedeConfigure = false; // ✅ NUEVO: Para Arma tu PC
  puedeVerRecompensas = false; // ✅ NUEVO: Para Recompensas 

  // Dropdown state
  showRecompensasDropdown = false;

  isDesktop = false;
  private permisosSub: Subscription | null = null;
  private router = inject(Router);

  constructor(
    private authService: AuthService,
    public permissionsService: PermissionsService   // <- Cambiar private por public
  ) {}


  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.esSuperadmin = currentUser?.roles?.includes('superadmin') ?? false;
    
    // Verificar permisos iniciales
    this.checkPermissions();
    this.checkScreenSize();

    // Suscribirse a cambios de permisos
    this.permisosSub = this.permissionsService.permissions$.subscribe(() => {
      this.checkPermissions();
    });
  }

  ngOnDestroy(): void {
    this.permisosSub?.unsubscribe();
  }

  private checkPermissions(): void {
    // Todas las asignaciones de permisos en un solo lugar
    this.puedeVerUsuarios = this.permissionsService.hasPermission('usuarios.ver');
    this.puedeVerBanners = this.permissionsService.hasPermission('banners.ver');
    this.puedeVerBanners_promocionales = this.permissionsService.hasPermission('banners_promocionales.ver');
    this.puedeVerClientes = this.permissionsService.hasPermission('clientes.ver');
    this.puedeVerOfertas = this.permissionsService.hasPermission('ofertas.ver');
    this.puedeVerCupones = this.permissionsService.hasPermission('cupones.ver');
    this.puedeVerPedidos = this.permissionsService.hasPermission('pedidos.ver');
    this.puedeVerCompras = this.permissionsService.hasPermission('compras.ver');
    this.puedeVerReclamos = this.permissionsService.hasPermission('reclamos.ver');
    this.puedeVerMotorizados = this.permissionsService.hasPermission('motorizados.ver');  // ← NUEVA LÍNEA
    this.puedeVerHorarios = this.permissionsService.hasPermission('horarios.ver');
    this.puedeVerEmpresaInfo = this.permissionsService.hasPermission('empresa_info.ver');
    this.puedeVerEmailTemplates = this.permissionsService.hasPermission('envio_correos.ver');
    this.puedeConfigure = this.permissionsService.hasPermission('categorias.edit'); // ✅ NUEVO
    this.puedeVerRecompensas = this.permissionsService.hasPermission('recompensas.ver'); // ✅ NUEVO
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
  toggleEcommerce(): void {
  this.isEcommerceOpen = !this.isEcommerceOpen;
}

toggleUsuarios(): void {
  this.isUsuariosOpen = !this.isUsuariosOpen;
}

toggleOperaciones(): void {
  this.isOperacionesOpen = !this.isOperacionesOpen;
}

toggleAlmacen(): void {
  this.isAlmacenOpen = !this.isAlmacenOpen;
}


  toggleRecompensasDropdown(): void {
    this.showRecompensasDropdown = !this.showRecompensasDropdown;
  }

  navegarARecompensasSubmodulo(submodulo: string, event: Event): void {
    // Prevenir el comportamiento por defecto del enlace
    event.preventDefault();
    
    // Cerrar el dropdown
    this.showRecompensasDropdown = false;
    
    // Navegar según el submódulo
    if (submodulo === 'crear') {
      // Navegar al wizard de creación
      this.router.navigate(['/dashboard/recompensas/crear']);
    } else if (submodulo === 'lista') {
      // Navegar a la lista de recompensas
      this.router.navigate(['/dashboard/recompensas/lista']);
    } else {
      // Por defecto, navegar a la lista
      this.router.navigate(['/dashboard/recompensas']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.recompensas-dropdown')) {
      this.showRecompensasDropdown = false;
    }
  }
}