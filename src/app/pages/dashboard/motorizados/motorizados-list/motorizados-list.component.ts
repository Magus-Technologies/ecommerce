import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ToastrService } from 'ngx-toastr';
import { MotorizadosService, Motorizado } from '../../../../services/motorizados.service';
import { PermissionsService } from '../../../../services/permissions.service';

@Component({
  selector: 'app-motorizados-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="usuarios-container">
      <div class="usuarios-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-motorcycle"></i>
              Gestión de Motorizados
            </h1>
            <p class="page-subtitle">Administra los motorizados de delivery</p>
          </div>
          <a *ngIf="permissionsService.canCreateMotorizados()" 
             routerLink="/dashboard/motorizados/crear" 
             class="btn btn-create">
            <i class="fas fa-plus"></i>
            Nuevo Motorizado
          </a>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue">
            <i class="fas fa-motorcycle" style="color: white;"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.total}}</h3>
            <p>Total Motorizados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <i class="fas fa-check-circle" style="color: white;"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.activos}}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <i class="fas fa-pause-circle" style="color: white;"></i>
          </div>
          <div class="stat-content">
            <h3>{{estadisticas.inactivos}}</h3>
            <p>Inactivos</p>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-header">
          <h2 class="table-title">Lista de Motorizados</h2>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar motorizado..."
              [(ngModel)]="filtroTexto"
              (input)="filtrarMotorizados()">
          </div>
        </div>

        <div class="table-wrapper" *ngIf="!isLoading">
          <table class="usuarios-table" *ngIf="motorizadosFiltrados.length > 0">
            <thead>
              <tr>
                <th>Motorizado</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Vehículo</th>
                <th>Placa</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row" *ngFor="let motorizado of motorizadosFiltrados">
                <td>
                  <div class="user-info">
                    <div class="user-avatar" *ngIf="!motorizado.foto_perfil">
                      {{motorizado.nombre_completo.substring(0,2).toUpperCase()}}
                    </div>
                    <img *ngIf="motorizado.foto_perfil" 
                         [src]="motorizado.foto_perfil" 
                         class="user-avatar-img">
                    <div class="user-details">
                      <span class="user-name">{{motorizado.nombre_completo}}</span>
                      <span class="user-id">{{motorizado.numero_unidad}}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <span class="badge badge-default">{{motorizado.tipo_documento?.nombre}}</span>
                    <div class="user-id">{{motorizado.numero_documento}}</div>
                  </div>
                </td>
                <td class="email">{{motorizado.telefono}}</td>
                <td>
                  <div>
                    <span class="user-name">{{motorizado.vehiculo_marca}} {{motorizado.vehiculo_modelo}}</span>
                    <div class="user-id">{{motorizado.vehiculo_ano}} - {{motorizado.vehiculo_cilindraje}}</div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-default">{{motorizado.vehiculo_placa}}</span>
                </td>
                <td>
                  <span [class]="motorizado.estado ? 'badge badge-activo' : 'badge badge-inactivo'">
                    {{motorizado.estado ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
                <td class="fecha">{{formatDate(motorizado.created_at)}}</td>
                <td>
                  <div class="action-buttons">
                    <button *ngIf="permissionsService.canShowMotorizados()"
                            (click)="verDetalle(motorizado.id!)"
                            class="btn-action btn-view"
                            title="Ver detalles">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button *ngIf="permissionsService.canEditMotorizados()"
                            (click)="editarMotorizado(motorizado.id!)"
                            class="btn-action btn-edit"
                            title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button *ngIf="permissionsService.canEditMotorizados()"
                            (click)="toggleEstado(motorizado.id!, motorizado.estado!)"
                            [class]="motorizado.estado ? 'btn-action btn-delete' : 'btn-action btn-edit'"
                            [title]="motorizado.estado ? 'Desactivar' : 'Activar'">
                      <i [class]="motorizado.estado ? 'fas fa-ban' : 'fas fa-check'"></i>
                    </button>
                    <button *ngIf="permissionsService.canDeleteMotorizados()"
                            (click)="eliminarMotorizado(motorizado.id!, motorizado.nombre_completo)"
                            class="btn-action btn-delete"
                            title="Eliminar">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="empty-state" *ngIf="motorizadosFiltrados.length === 0">
            <div class="empty-icon">
              <i class="fas fa-motorcycle"></i>
            </div>
            <h3>No hay motorizados registrados</h3>
            <p>Comienza agregando tu primer motorizado</p>
            <a *ngIf="permissionsService.canCreateMotorizados()" 
               routerLink="/dashboard/motorizados/crear" 
               class="btn btn-create">
              <i class="fas fa-plus"></i>
              Crear Motorizado
            </a>
          </div>
        </div>

        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Cargando motorizados...</p>
        </div>
      </div>
    </div>
  `
})
export class MotorizadosListComponent implements OnInit {
  motorizados: Motorizado[] = [];
  motorizadosFiltrados: Motorizado[] = [];
  filtroTexto = '';
  isLoading = false;
  estadisticas = { total: 0, activos: 0, inactivos: 0 };

  constructor(
    private motorizadosService: MotorizadosService,
    public permissionsService: PermissionsService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMotorizados();
  }

  cargarMotorizados(): void {
    this.isLoading = true;
    this.motorizadosService.getMotorizados().subscribe({
      next: (motorizados) => {
        this.motorizados = motorizados;
        this.motorizadosFiltrados = motorizados;
        this.calcularEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar motorizados');
        this.isLoading = false;
      }
    });
  }

  filtrarMotorizados(): void {
    if (!this.filtroTexto) {
      this.motorizadosFiltrados = this.motorizados;
      return;
    }

    const filtro = this.filtroTexto.toLowerCase();
    this.motorizadosFiltrados = this.motorizados.filter(motorizado =>
      motorizado.nombre_completo.toLowerCase().includes(filtro) ||
      motorizado.numero_documento.includes(filtro) ||
      motorizado.vehiculo_placa.toLowerCase().includes(filtro) ||
      motorizado.numero_unidad.toLowerCase().includes(filtro)
    );
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.motorizados.length;
    this.estadisticas.activos = this.motorizados.filter(m => m.estado).length;
    this.estadisticas.inactivos = this.motorizados.filter(m => !m.estado).length;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/dashboard/motorizados/ver', id]);
  }

  editarMotorizado(id: number): void {
    this.router.navigate(['/dashboard/motorizados/editar', id]);
  }

  toggleEstado(id: number, estadoActual: boolean): void {
    const accion = estadoActual ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de ${accion} este motorizado?`)) {
      this.motorizadosService.toggleEstado(id).subscribe({
        next: (response) => {
          this.toastr.success(`Motorizado ${accion}do exitosamente`);
          this.cargarMotorizados();
        },
        error: () => {
          this.toastr.error(`Error al ${accion} motorizado`);
        }
      });
    }
  }

  eliminarMotorizado(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de eliminar al motorizado ${nombre}? Esta acción no se puede deshacer.`)) {
      this.motorizadosService.eliminarMotorizado(id).subscribe({
        next: () => {
          this.toastr.success('Motorizado eliminado exitosamente');
          this.cargarMotorizados();
        },
        error: () => {
          this.toastr.error('Error al eliminar motorizado');
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
