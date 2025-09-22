// src\app\pages\dashboard\clientes\clientes.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { PermissionsService } from '../../../services/permissions.service';
import { Subject, takeUntil } from 'rxjs';
import {
  Cliente,
  ClientesFiltros,
  EstadisticasGenerales
} from '../../../models/cliente.model';
import { ClienteEditModalComponent } from '../../../components/cliente-edit-modal/cliente-edit-modal.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ClienteEditModalComponent
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos
  clientes: Cliente[] = [];
  estadisticas: EstadisticasGenerales = {
    total_clientes: 0,
    clientes_activos: 0,
    clientes_nuevos: 0
  };

  // Estados de carga
  loading = false;
  loadingStats = false;

  // Filtros
  filtros: ClientesFiltros = {
    search: '',
    estado: '',
    tipo_login: '',
    per_page: 15,
    page: 1
  };

  // Paginación
  paginacion = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  };

  // Permisos
  puedeVerDetalle = false;
  puedeEditar = false;
  puedeEliminar = false;

  // Modal
  mostrarModalEditar = false;
  clienteEditando: Cliente | null = null;

  // Referencia a Math para el template
  Math = Math;

  constructor(
    private clienteService: ClienteService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPermisos();
    this.cargarEstadisticas();
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPermisos(): void {
    this.puedeVerDetalle = this.permissionsService.hasPermission('clientes.show');
    this.puedeEditar = this.permissionsService.hasPermission('clientes.edit');
    this.puedeEliminar = this.permissionsService.hasPermission('clientes.delete');
  }

  private cargarEstadisticas(): void {
    this.loadingStats = true;
    this.clienteService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.estadisticas = response.data;
          }
          this.loadingStats = false;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          this.loadingStats = false;
        }
      });
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.getClientes(this.filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.clientes = response.data.data;
            this.paginacion = {
              current_page: response.data.current_page,
              last_page: response.data.last_page,
              per_page: response.data.per_page,
              total: response.data.total
            };
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
          this.loading = false;
        }
      });
  }

  buscar(): void {
    this.filtros.page = 1;
    this.cargarClientes();
  }

  limpiarFiltros(): void {
    this.filtros = {
      search: '',
      estado: '',
      tipo_login: '',
      per_page: 15,
      page: 1
    };
    this.cargarClientes();
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.paginacion.last_page) {
      this.filtros.page = page;
      this.cargarClientes();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.paginacion.current_page;
    const last = this.paginacion.last_page;
    
    // Mostrar máximo 5 páginas
    let start = Math.max(1, current - 2);
    let end = Math.min(last, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/dashboard/clientes', id]);
  }

  editarCliente(cliente: Cliente): void {
    this.clienteEditando = { ...cliente };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.clienteEditando = null;
  }

  onClienteActualizado(clienteActualizado: Cliente): void {
    const index = this.clientes.findIndex(c => c.id_cliente === clienteActualizado.id_cliente);
    if (index !== -1) {
      this.clientes[index] = clienteActualizado;
    }
    this.cerrarModalEditar();

    // Recargar toda la lista para asegurar que se obtengan las fotos actualizadas
    setTimeout(() => {
      this.cargarClientes();
      this.cargarEstadisticas(); // Recargar estadísticas por si cambió el estado
    }, 500);
  }

  toggleEstado(cliente: Cliente): void {
    const accion = cliente.estado ? 'desactivar' : 'activar';
    
    if (confirm(`¿Está seguro de ${accion} al cliente ${cliente.nombre_completo}?`)) {
      this.clienteService.toggleEstado(cliente.id_cliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              cliente.estado = !cliente.estado;
              this.cargarEstadisticas(); // Actualizar estadísticas
            }
          },
          error: (error) => {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar el estado del cliente');
          }
        });
    }
  }

  eliminarCliente(cliente: Cliente): void {
    if (confirm(`¿Está seguro de eliminar al cliente ${cliente.nombre_completo}?\n\nEsta acción desactivará la cuenta permanentemente.`)) {
      this.clienteService.deleteCliente(cliente.id_cliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.cargarClientes();
              this.cargarEstadisticas();
            }
          },
          error: (error) => {
            console.error('Error al eliminar cliente:', error);
            alert('Error al eliminar el cliente');
          }
        });
    }
  }

  // Utilidades para el template
  getInitials(nombre: string): string {
    if (!nombre) return '?';
    const words = nombre.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nombre.charAt(0).toUpperCase();
  }

  getTipoLoginClass(tipo: string): string {
    const classes = {
      'manual': 'bg-primary',
      'google': 'bg-danger',
      'facebook': 'bg-info'
    };
    return classes[tipo as keyof typeof classes] || 'bg-secondary';
  }

  getTipoLoginIcon(tipo: string): string {
    const icons = {
      'manual': 'ph ph-user',
      'google': 'ph ph-google-logo',
      'facebook': 'ph ph-facebook-logo'
    };
    return icons[tipo as keyof typeof icons] || 'ph ph-user';
  }

  getTipoLoginText(tipo: string): string {
    const texts = {
      'manual': 'Manual',
      'google': 'Google',
      'facebook': 'Facebook'
    };
    return texts[tipo as keyof typeof texts] || tipo;
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const date = new Date(fecha);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }

  // Método para obtener la URL completa de la foto de perfil
  getClientePhotoUrl(cliente: Cliente): string | null {
    if (!cliente.foto) {
      return null;
    }

    let finalUrl = cliente.foto;

    if (finalUrl.startsWith('http')) {
      finalUrl = finalUrl.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
      return finalUrl;
    }

    let photoPath = finalUrl;
    if (photoPath.includes('/storage/clientes//storage/clientes/')) {
      photoPath = photoPath.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
    }

    if (photoPath.split('/storage/clientes/').length > 2) {
      const parts = photoPath.split('/storage/clientes/');
      photoPath = '/storage/clientes/' + parts[parts.length - 1];
    }

    return `${environment.baseUrl}${photoPath}`;
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
