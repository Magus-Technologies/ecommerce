// src/app/layouts/dashboard-layout/dashboard-sidebar/dashboard-sidebar.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
  Input,
  HostListener,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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



  isDesktop = false;
  private permisosSub: Subscription | null = null;

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