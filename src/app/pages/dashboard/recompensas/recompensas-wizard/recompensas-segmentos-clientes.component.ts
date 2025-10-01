import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensasService } from '../../../../services/recompensas.service';
import { 
  SegmentoAsignado, 
  ClienteInfo, 
  FiltrosCliente 
} from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-segmentos-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5><i class="fas fa-users me-2"></i>Paso 2: Segmentación de Clientes</h5>
      </div>
      <div class="card-body">
        <!-- Tipo de Segmentación -->
        <div class="row mb-4">
          <div class="col-12">
            <label class="form-label">Tipo de Segmentación *</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" id="todos" value="todos" 
                     [(ngModel)]="tipoSegmentacion" (change)="onTipoSegmentacionChange()">
              <label class="btn btn-outline-primary" for="todos">
                <i class="fas fa-globe me-2"></i>Todos los Clientes
              </label>

              <input type="radio" class="btn-check" id="segmentos" value="segmentos" 
                     [(ngModel)]="tipoSegmentacion" (change)="onTipoSegmentacionChange()">
              <label class="btn btn-outline-primary" for="segmentos">
                <i class="fas fa-layer-group me-2"></i>Por Segmentos
              </label>

              <input type="radio" class="btn-check" id="especificos" value="especificos" 
                     [(ngModel)]="tipoSegmentacion" (change)="onTipoSegmentacionChange()">
              <label class="btn btn-outline-primary" for="especificos">
                <i class="fas fa-user me-2"></i>Clientes Específicos
              </label>
            </div>
          </div>
        </div>

        <!-- Información del tipo seleccionado -->
        <div class="alert alert-info" *ngIf="tipoSegmentacion">
          <i class="fas fa-info-circle me-2"></i>
          <strong>Información:</strong> 
          <span *ngIf="tipoSegmentacion === 'todos'">
            La recompensa se aplicará a todos los clientes registrados en el sistema.
          </span>
          <span *ngIf="tipoSegmentacion === 'segmentos'">
            Selecciona los segmentos de clientes que podrán acceder a esta recompensa.
          </span>
          <span *ngIf="tipoSegmentacion === 'especificos'">
            Busca y selecciona clientes específicos para esta recompensa.
          </span>
        </div>

        <!-- Gestión de Segmentos -->
        <div *ngIf="tipoSegmentacion === 'segmentos'" class="mb-4">
          <h6><i class="fas fa-layer-group me-2"></i>Segmentos Disponibles</h6>
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6>Segmentos del Sistema</h6>
                  <div class="segment-list" style="max-height: 300px; overflow-y: auto;">
                    <div *ngIf="segmentosDisponibles.length === 0 && !cargandoSegmentos" class="text-center text-muted py-3">
                      <i class="fas fa-search fa-2x mb-2"></i>
                      <p>No hay segmentos disponibles</p>
                    </div>
                    <div *ngIf="cargandoSegmentos" class="text-center py-3">
                      <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                    <div *ngFor="let segmento of segmentosDisponibles" class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        [id]="'seg-' + segmento.value"
                        [checked]="segmentoSeleccionado(segmento.value)"
                        (change)="toggleSegmento(segmento)"
                      >
                      <label class="form-check-label" [for]="'seg-' + segmento.value">
                        {{ segmento.label }}
                        <small class="text-muted d-block">{{ segmento.descripcion || 'Sin descripción' }}</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6>Segmentos Seleccionados</h6>
                  <div *ngIf="segmentosSeleccionados.length === 0" class="text-center text-muted py-3">
                    <i class="fas fa-layer-group fa-2x mb-2"></i>
                    <p>No has seleccionado segmentos</p>
                  </div>
                  <div *ngFor="let segmento of segmentosSeleccionados" class="mb-2">
                    <div class="card card-body py-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{{ segmento.label }}</strong>
                          <small class="text-muted d-block">{{ segmento.descripcion || 'Sin descripción' }}</small>
                        </div>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          (click)="removerSegmento(segmento.value)"
                          title="Remover segmento"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Clientes Específicos -->
        <div *ngIf="tipoSegmentacion === 'especificos'" class="mb-4">
          <h6><i class="fas fa-user me-2"></i>Clientes Específicos</h6>
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6>Buscar Clientes</h6>
                  <div class="mb-3">
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Buscar por nombre o email..."
                      [(ngModel)]="filtroClientes.buscar"
                      (input)="buscarClientes()"
                    >
                  </div>
                  <div class="client-list" style="max-height: 300px; overflow-y: auto;">
                    <div *ngIf="clientesDisponibles.length === 0 && !cargandoClientes" class="text-center text-muted py-3">
                      <i class="fas fa-search fa-2x mb-2"></i>
                      <p>Busca clientes para agregar</p>
                    </div>
                    <div *ngIf="cargandoClientes" class="text-center py-3">
                      <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                    <div *ngFor="let cliente of clientesDisponibles" class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        [id]="'cli-' + cliente.id"
                        [checked]="clienteSeleccionado(cliente.id)"
                        (change)="toggleCliente(cliente)"
                      >
                      <label class="form-check-label" [for]="'cli-' + cliente.id">
                        <strong>{{ cliente.nombre }}</strong>
                        <small class="text-muted d-block">{{ cliente.email }}</small>
                        <small class="text-muted d-block" *ngIf="cliente.telefono">{{ cliente.telefono }}</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h6>Clientes Seleccionados</h6>
                  <div *ngIf="clientesSeleccionados.length === 0" class="text-center text-muted py-3">
                    <i class="fas fa-user fa-2x mb-2"></i>
                    <p>No has seleccionado clientes</p>
                  </div>
                  <div *ngFor="let cliente of clientesSeleccionados" class="mb-2">
                    <div class="card card-body py-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{{ cliente.nombre }}</strong>
                          <small class="text-muted d-block">{{ cliente.email }}</small>
                          <small class="text-muted d-block" *ngIf="cliente.telefono">{{ cliente.telefono }}</small>
                        </div>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          (click)="removerCliente(cliente.id)"
                          title="Remover cliente"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de Segmentación -->
        <div class="card">
          <div class="card-body">
            <h6>Resumen de Segmentación</h6>
            
            <div *ngIf="tipoSegmentacion === 'todos'" class="alert alert-success">
              <i class="fas fa-globe me-2"></i>
              <strong>Recompensa para todos los clientes</strong>
              <small class="d-block text-muted">
                Todos los clientes registrados podrán acceder a esta recompensa
              </small>
            </div>

            <div *ngIf="tipoSegmentacion === 'segmentos' && segmentosSeleccionados.length > 0" class="alert alert-info">
              <i class="fas fa-layer-group me-2"></i>
              <strong>Recompensa para {{ segmentosSeleccionados.length }} segmento(s)</strong>
              <small class="d-block text-muted">
                Segmentos: {{ getSegmentosLabels() }}
              </small>
            </div>

            <div *ngIf="tipoSegmentacion === 'especificos' && clientesSeleccionados.length > 0" class="alert alert-warning">
              <i class="fas fa-user me-2"></i>
              <strong>Recompensa para {{ clientesSeleccionados.length }} cliente(s) específico(s)</strong>
              <small class="d-block text-muted">
                Clientes seleccionados: {{ getClientesNombres() }}
              </small>
            </div>

            <div *ngIf="(tipoSegmentacion === 'segmentos' && segmentosSeleccionados.length === 0) || 
                        (tipoSegmentacion === 'especificos' && clientesSeleccionados.length === 0)" 
                 class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Configuración incompleta</strong>
              <small class="d-block text-muted">
                Debes seleccionar al menos un segmento o cliente para continuar
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .segment-list, .client-list {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 0.5rem;
    }
    
    .form-check {
      padding: 0.5rem;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .form-check:last-child {
      border-bottom: none;
    }
    
    .form-check:hover {
      background-color: #f8f9fa;
    }
    
    .card-body .card {
      border: 1px solid #e9ecef;
    }
    
    .btn-check:checked + .btn-outline-primary {
      background-color: #0d6efd;
      border-color: #0d6efd;
      color: white;
    }
  `]
})
export class RecompensasSegmentosClientesComponent implements OnInit {
  @Input() recompensaId?: number;
  @Output() segmentacionChange = new EventEmitter<{
    tipo: string;
    segmentos: any[];
    clientes: ClienteInfo[];
  }>();

  // Tipo de segmentación
  tipoSegmentacion: string = 'todos';

  // Segmentos disponibles y seleccionados
  segmentosDisponibles: any[] = [];
  segmentosSeleccionados: any[] = [];
  
  // Clientes disponibles y seleccionados
  clientesDisponibles: ClienteInfo[] = [];
  clientesSeleccionados: ClienteInfo[] = [];
  
  // Filtros
  filtroClientes: FiltrosCliente = {
    buscar: '',
    limite: 20
  };
  
  // Estados de carga
  cargandoSegmentos = false;
  cargandoClientes = false;

  constructor(private recompensasService: RecompensasService) {}

  ngOnInit(): void {
    this.cargarSegmentosDisponibles();
  }

  // Cargar segmentos disponibles
  cargarSegmentosDisponibles(): void {
    this.cargandoSegmentos = true;
    
    // Si tenemos recompensaId, usar el endpoint específico, sino usar datos estáticos
    if (this.recompensaId) {
      this.recompensasService.obtenerSegmentosDisponibles()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.segmentosDisponibles = response.data || [];
            }
            this.cargandoSegmentos = false;
          },
          error: (error) => {
            console.error('Error cargando segmentos:', error);
            this.cargarSegmentosEstaticos();
            this.cargandoSegmentos = false;
          }
        });
    } else {
      // Cargar segmentos estáticos para el wizard
      this.cargarSegmentosEstaticos();
      this.cargandoSegmentos = false;
    }
  }

  // Cargar segmentos estáticos (para el wizard)
  private cargarSegmentosEstaticos(): void {
    this.segmentosDisponibles = [
      {
        value: 'todos',
        label: 'Todos los clientes',
        descripcion: 'Todos los clientes activos del sistema'
      },
      {
        value: 'nuevos',
        label: 'Clientes nuevos (últimos 30 días)',
        descripcion: 'Clientes registrados en los últimos 30 días'
      },
      {
        value: 'regulares',
        label: 'Clientes recurrentes (más de 1 compra)',
        descripcion: 'Clientes con 30-365 días de antigüedad'
      },
      {
        value: 'vip',
        label: 'Clientes VIP (compras > S/ 1000)',
        descripcion: 'Clientes con más de 365 días, +5 pedidos, +$1000 gastado y compra reciente'
      },
      {
        value: 'no_registrados',
        label: 'Clientes no registrados',
        descripcion: 'Usuarios no registrados para captación de nuevos clientes'
      }
    ];
  }

  // Búsqueda de clientes
  buscarClientes(): void {
    if (this.filtroClientes.buscar.length < 2) {
      this.clientesDisponibles = [];
      return;
    }

    this.cargandoClientes = true;
    this.recompensasService.buscarClientes(this.filtroClientes)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clientesDisponibles = response.data || [];
          } else {
            console.warn('Respuesta sin éxito:', response);
            this.clientesDisponibles = [];
          }
          this.cargandoClientes = false;
        },
        error: (error) => {
          console.error('Error buscando clientes:', error);
          // Cargar datos de prueba en caso de error
          this.cargarClientesPrueba();
          this.cargandoClientes = false;
        }
      });
  }

  // Cargar clientes de prueba
  private cargarClientesPrueba(): void {
    this.clientesDisponibles = [
      {
        id: 15,
        nombre: 'Juan Pérez García',
        email: 'juan.perez@email.com',
        numero_documento: '12345678',
        segmento_actual: 'vip',
        activo: true
      },
      {
        id: 25,
        nombre: 'María González López',
        email: 'maria.gonzalez@email.com',
        numero_documento: '87654321',
        segmento_actual: 'regulares',
        activo: true
      },
      {
        id: 35,
        nombre: 'Carlos Rodríguez Silva',
        email: 'carlos.rodriguez@email.com',
        numero_documento: '11223344',
        segmento_actual: 'nuevos',
        activo: true
      }
    ];
  }

  // Cambio de tipo de segmentación
  onTipoSegmentacionChange(): void {
    this.emitirCambios();
  }

  // Verificar si un segmento está seleccionado
  segmentoSeleccionado(segmentoValue: string): boolean {
    return this.segmentosSeleccionados.some(s => s.value === segmentoValue);
  }

  // Verificar si un cliente está seleccionado
  clienteSeleccionado(clienteId: number): boolean {
    return this.clientesSeleccionados.some(c => c.id === clienteId);
  }

  // Toggle de segmento
  toggleSegmento(segmento: any): void {
    const index = this.segmentosSeleccionados.findIndex(s => s.value === segmento.value);
    if (index >= 0) {
      this.segmentosSeleccionados.splice(index, 1);
    } else {
      this.segmentosSeleccionados.push(segmento);
    }
    this.emitirCambios();
  }

  // Toggle de cliente
  toggleCliente(cliente: ClienteInfo): void {
    const index = this.clientesSeleccionados.findIndex(c => c.id === cliente.id);
    if (index >= 0) {
      this.clientesSeleccionados.splice(index, 1);
    } else {
      this.clientesSeleccionados.push(cliente);
    }
    this.emitirCambios();
  }

  // Remover segmento
  removerSegmento(segmentoValue: string): void {
    this.segmentosSeleccionados = this.segmentosSeleccionados.filter(s => s.value !== segmentoValue);
    this.emitirCambios();
  }

  // Remover cliente
  removerCliente(clienteId: number): void {
    this.clientesSeleccionados = this.clientesSeleccionados.filter(c => c.id !== clienteId);
    this.emitirCambios();
  }

  // Emitir cambios al componente padre
  emitirCambios(): void {
    this.segmentacionChange.emit({
      tipo: this.tipoSegmentacion,
      segmentos: this.segmentosSeleccionados,
      clientes: this.clientesSeleccionados
    });
  }

  getSegmentosLabels(): string {
    return this.segmentosSeleccionados.map(s => s.label).join(', ');
  }

  getClientesNombres(): string {
    return this.clientesSeleccionados.map(c => c.nombre).join(', ');
  }
}
