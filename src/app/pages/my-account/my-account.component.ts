// src\app\pages\my-account\my-account.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { DireccionesService, Direccion } from '../../services/direcciones.service';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../services/ubigeo.service';
import { PedidosService, Pedido } from '../../services/pedidos.service';
import { ReclamosService, Reclamo } from '../../services/reclamos.service';
import { ModalDireccionComponent } from '../../component/modal-direccion/modal-direccion.component';
@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalDireccionComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss'
})
export class MyAccountComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  // Propiedades para direcciones
  direcciones: Direccion[] = [];
  isLoadingDirecciones = false;
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  direccionEditando: Direccion | null = null;

  // Para el modal
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

  // Propiedades para pedidos
  pedidos: Pedido[] = [];
  isLoadingPedidos = false;
  showPedidos = false;
  pedidoSeleccionado: Pedido | null = null;

  // Propiedades para reclamos
  reclamos: Reclamo[] = [];
  isLoadingReclamos = false;
  showReclamos = false;
  reclamoSeleccionado: Reclamo | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private direccionesService: DireccionesService,
    private ubigeoService: UbigeoService,
    private pedidosService: PedidosService,
    private reclamosService: ReclamosService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.cargarDirecciones();
    this.cargarDepartamentos();
    this.cargarPedidos();
    this.cargarReclamos();
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
          } else {
            // Si es cliente, cargar pedidos
            if (user.tipo_usuario === 'cliente') {
              this.cargarPedidos();
            }
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

  // ✅ MÉTODOS PARA DIRECCIONES
  cargarDirecciones(): void {
    // Solo cargar direcciones si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.isLoadingDirecciones = true;
    this.direccionesService.obtenerDirecciones().subscribe({
      next: (response) => {
        console.log('Direcciones cargadas:', response);
        this.direcciones = response.direcciones;
        console.log('Direcciones procesadas:', this.direcciones);
        
        // Verificar que cada dirección tenga su ubigeo
        this.direcciones.forEach((direccion, index) => {
          console.log(`Dirección ${index}:`, direccion);
          console.log(`Ubigeo de dirección ${index}:`, direccion.ubigeo);
        });
        
        this.isLoadingDirecciones = false;
      },
      error: (error) => {
        console.error('Error cargando direcciones:', error);
        this.isLoadingDirecciones = false;
        // Si es error de autenticación, no hacer nada más
        if (error.status === 401) {
          this.direcciones = [];
        }
      }
    });
  }

  abrirModal(mode: 'create' | 'edit' = 'create', direccion?: Direccion): void {
    console.log('🚀 Abriendo modal en modo:', mode);
    console.log('📝 Dirección a editar:', direccion);
    
    this.modalMode = mode;
    this.direccionEditando = direccion || null;
    
    // Usar Angular en lugar de Bootstrap nativo
    this.showModal = true;
    
    // Forzar detección de cambios para que Angular sepa que cambió la propiedad
    setTimeout(() => {
      const modal = document.getElementById('modalDireccion');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }, 0);
  }
  cerrarModal(): void {
    this.showModal = false;
    this.direccionEditando = null;
  }

  onDireccionGuardada(): void {
    console.log('Dirección guardada, esperando un momento antes de recargar...');
    
    // Esperar un momento para que el backend procese la actualización
    setTimeout(() => {
      console.log('Recargando direcciones después de guardar...');
      this.cargarDirecciones();
      // También recargar pedidos por si hay cambios
      if (this.currentUser?.tipo_usuario === 'cliente') {
        this.cargarPedidos();
      }
    }, 500);
    
    this.cerrarModal();
  }

  cargarDepartamentos(): void {
    this.ubigeoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
      }
    });
  }

  // ✅ MÉTODOS PARA PEDIDOS
  cargarPedidos(): void {
    // Solo cargar pedidos si el usuario está logueado y es cliente
    if (!this.authService.isLoggedIn() || this.currentUser?.tipo_usuario !== 'cliente') {
      return;
    }

    this.isLoadingPedidos = true;
    this.pedidosService.getPedidosPorUsuario(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.pedidos = response.pedidos;
        }
        this.isLoadingPedidos = false;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
        this.isLoadingPedidos = false;
        this.pedidos = [];
      }
    });
  }

  togglePedidos(): void {
    this.showPedidos = !this.showPedidos;
    this.showReclamos = false;
    if (this.showPedidos && this.pedidos.length === 0) {
      this.cargarPedidos();
    }
  }

  toggleDirecciones(): void {
    this.showPedidos = false;
    this.showReclamos = false;
  }

  toggleReclamos(): void {
    this.showReclamos = !this.showReclamos;
    this.showPedidos = false;
    if (this.showReclamos && this.reclamos.length === 0) {
      this.cargarReclamos();
    }
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-secondary-50 text-secondary-600';
    
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-warning-50 text-warning-600';
      case 'confirmado':
        return 'bg-info-50 text-info-600';
      case 'en preparación':
        return 'bg-primary-50 text-primary-600';
      case 'en recepción':
        return 'bg-orange-50 text-orange-600';
      case 'enviado a provincia':
        return 'bg-purple-50 text-purple-600';
      case 'procesando':
        return 'bg-info-50 text-info-600';
      case 'enviado':
        return 'bg-primary-50 text-primary-600';
      case 'entregado':
        return 'bg-success-50 text-success-600';
      case 'cancelado':
        return 'bg-danger-50 text-danger-600';
      default:
        return 'bg-secondary-50 text-secondary-600';
    }
  }

  verDetallePedido(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
    const modal = document.getElementById('detallePedidoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  imprimirPedido(): void {
    console.log('Imprimir pedido:', this.pedidoSeleccionado?.codigo_pedido);
    // Aquí puedes implementar la lógica de impresión
    // Por ejemplo, abrir en nueva ventana o generar PDF
    window.print();
  }

  eliminarDireccion(direccion: Direccion): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      this.direccionesService.eliminarDireccion(direccion.id).subscribe({
        next: () => {
          this.cargarDirecciones();
        },
        error: (error) => {
          console.error('Error eliminando dirección:', error);
        }
      });
    }
  }

  establecerPredeterminada(direccion: Direccion): void {
    if (!direccion.predeterminada) {
      this.direccionesService.establecerPredeterminada(direccion.id).subscribe({
        next: () => {
          this.cargarDirecciones();
        },
        error: (error) => {
          console.error('Error estableciendo dirección predeterminada:', error);
        }
      });
    }
  }

  // ✅ MÉTODOS PARA RECLAMOS
  cargarReclamos(): void {
    // Solo cargar reclamos si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      return;
    }

    console.log('Usuario actual:', this.currentUser);
    console.log('Cargando reclamos del usuario...');

    this.isLoadingReclamos = true;
    this.reclamosService.obtenerMisReclamos().subscribe({
      next: (response) => {
        console.log('Respuesta completa de reclamos:', response);
        console.log('Reclamos encontrados:', response.reclamos?.length || 0);
        if (response.status === 'success') {
          this.reclamos = response.reclamos || [];
        }
        this.isLoadingReclamos = false;
      },
      error: (error) => {
        console.error('Error cargando reclamos:', error);
        console.error('Detalles del error:', error.error);
        this.isLoadingReclamos = false;
        this.reclamos = [];
      }
    });
  }

  verDetalleReclamo(reclamo: Reclamo): void {
    this.reclamoSeleccionado = reclamo;
    const modal = document.getElementById('detalleReclamoModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  getEstadoReclamoClass(estado: string | undefined): string {
    return this.reclamosService.getEstadoClass(estado || 'pendiente');
  }

  getEstadoReclamoLabel(estado: string | undefined): string {
    const estados = this.reclamosService.getEstadosReclamos();
    const estadoObj = estados.find(e => e.value === (estado || 'pendiente'));
    return estadoObj ? estadoObj.label : 'Desconocido';
  }

  getTipoSolicitudLabel(tipo: string | undefined): string {
    return tipo === 'reclamo' ? 'Reclamo' : 'Queja';
  }

  getTipoBienLabel(tipo: string | undefined): string {
    return tipo === 'producto' ? 'Producto' : 'Servicio';
  }

  calcularDiasRestantes(fechaLimite: string): number {
    if (!fechaLimite) return 0;
    const limite = new Date(fechaLimite);
    const hoy = new Date();
    const diferencia = limite.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    return dias > 0 ? dias : 0;
  }

  isReclamoVencido(fechaLimite: string, estado: string): boolean {
    if (!fechaLimite || estado === 'resuelto' || estado === 'cerrado') {
      return false;
    }
    const limite = new Date(fechaLimite);
    const hoy = new Date();
    return limite < hoy;
  }

  // ✅ MÉTODOS PARA TRACKING DE PROVINCIA
  esEnvioAProvincia(pedido: Pedido): boolean {
    return pedido.forma_envio === 'envio_provincia';
  }

  formatFormaEnvio(forma: string | null | undefined): string {
    if (!forma) return 'No especificada';
    
    switch (forma.toLowerCase()) {
      case 'delivery':
        return 'Delivery';
      case 'recojo_tienda':
        return 'Recojo en tienda';
      case 'envio_provincia':
        return 'Envío a provincia';
      default:
        return forma.replace('_', ' ').charAt(0).toUpperCase() + forma.slice(1);
    }
  }

  isTrackingStepCompleted(step: string, currentState: string | undefined): boolean {
    if (!currentState) return false;
    
    const steps = ['Pendiente', 'Confirmado', 'En Recepción', 'Enviado a Provincia', 'Entregado'];
    const currentIndex = steps.indexOf(currentState);
    const stepIndex = steps.indexOf(step);
    
    return currentIndex > stepIndex;
  }

  isTrackingStepActive(step: string, currentState: string | undefined): boolean {
    if (!currentState) return step === 'Pendiente';
    return step === currentState;
  }

  getProgressHeight(currentState: string | undefined): number {
    if (!currentState) return 0;
    
    const steps = ['Pendiente', 'Confirmado', 'En Recepción', 'Enviado a Provincia', 'Entregado'];
    const currentIndex = steps.indexOf(currentState);
    
    if (currentIndex === -1) return 0;
    
    // Calcular el porcentaje basado en el progreso
    return ((currentIndex + 1) / steps.length) * 100;
  }
}