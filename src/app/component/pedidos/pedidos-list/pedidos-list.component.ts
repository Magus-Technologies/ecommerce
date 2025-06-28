import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { PedidosService, Pedido, PedidosFiltros, EstadoPedido } from "../../../services/pedidos.service"
import { PermissionsService } from "../../../services/permissions.service"

@Component({
  selector: "app-pedidos-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .badge {
      padding: 0.5em 0.75em;
      font-size: 0.75em;
      font-weight: 500;
      border-radius: 0.375rem;
      color: white !important;
    }
    .bg-gradient-info { background: linear-gradient(87deg, #11cdef 0, #1171ef 100%) !important; color: white !important; }
    .bg-gradient-warning { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%) !important; color: white !important; }
    .bg-gradient-success { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%) !important; color: white !important; }
    .bg-gradient-primary { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%) !important; color: white !important; }
    .bg-gradient-danger { background: linear-gradient(87deg, #f5365c 0, #f56036 100%) !important; color: white !important; }
    .bg-gradient-secondary { background: linear-gradient(87deg, #6c757d 0, #8c7ae6 100%) !important; color: white !important; }
  `],
  template: `
    <div class="dashboard-container">
      <div class="row">
        <div class="col-12">
          <h1 class="dashboard-title">
            <i class="fas fa-shopping-cart"></i> Gestión de Pedidos
          </h1>
          <p class="text-muted mb-4">Administra y supervisa todos los pedidos de la plataforma</p>
          
          <div class="table-card">
            <div class="table-card-header">
              <h6 class="table-title mb-0">
                <i class="fas fa-list"></i> Listado de Pedidos
              </h6>
            </div>
            
            <!-- Filtros -->
            <div class="row px-3 mb-4 mt-3">
              <div class="col-md-3 mb-2">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="🔍 Buscar cliente..."
                  [(ngModel)]="filtros.cliente"
                  (keyup.enter)="filtrarPedidos()">
              </div>
              <div class="col-md-2 mb-2">
                <select class="form-select" [(ngModel)]="filtros.estado">
                  <option value="">📋 Estado</option>
                  <option *ngFor="let estado of estados" [value]="estado.id">
                    {{estado.nombre_estado}}
                  </option>
                </select>
              </div>
              <div class="col-md-2 mb-2">
                <input 
                  type="date" 
                  class="form-control" 
                  [(ngModel)]="filtros.fecha_desde"
                  placeholder="Fecha desde">
              </div>
              <div class="col-md-2 mb-2">
                <input 
                  type="date" 
                  class="form-control" 
                  [(ngModel)]="filtros.fecha_hasta"
                  placeholder="Fecha hasta">
              </div>
              <div class="col-md-2 mb-2">
                <select class="form-select" [(ngModel)]="filtros.tienda">
                  <option value="">🏪 Tienda</option>
                  <!-- Placeholder para tiendas -->
                </select>
              </div>
              <div class="col-md-1 mb-2">
                <button class="btn btn-primary w-100" (click)="filtrarPedidos()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <!-- Tabla -->
            <div class="table-responsive">
              <table class="table align-items-center">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo doc / Numero</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let pedido of pedidos; let i = index; trackBy: trackByPedidoId">
                    <td>
                      <span class="text-sm font-weight-bold">{{(currentPage - 1) * 15 + i + 1}}</span>
                    </td>
                    <td>
                      <span class="text-sm text-muted">
                        {{pedido.cliente.tipo_documento}} / {{pedido.cliente.numero_documento}}
                      </span>
                    </td>
                    <td>
                      <span class="text-sm font-weight-bold">{{pedido.cliente.nombre_completo}}</span>
                    </td>
                    <td>
                      <span class="text-sm text-muted">{{pedido.fecha}}</span>
                    </td>
                    <td>
                      <span class="text-sm font-weight-bold text-success">{{pedido.moneda}} {{pedido.total}}</span>
                    </td>
                    <td>
                      <span class="badge" 
                            [ngClass]="getEstadoBadgeClass(pedido.estado?.nombre)">
                        {{pedido.estado?.nombre}}
                      </span>
                    </td>
                    <td>
                      <span class="text-sm text-muted">{{pedido.metodo_pago}}</span>
                    </td>
                    <td>
                      <button 
                        *ngIf="permissionsService.hasPermission('pedidos.show')"
                        class="btn-sm btn-outline-primary" 
                        (click)="verDetalle(pedido.id)"
                        title="Ver detalle">
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Paginación -->
            <div class="d-flex justify-content-between align-items-center px-3 mt-4" *ngIf="totalPages > 1">
              <span class="text-sm text-muted">
                Mostrando {{(currentPage - 1) * 15 + 1}} a {{Math.min(currentPage * 15, totalItems)}} de {{totalItems}} pedidos
              </span>
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button class="page-link" (click)="cambiarPagina(currentPage - 1)">Anterior</button>
                  </li>
                  <li class="page-item" 
                      *ngFor="let page of getPageNumbers()" 
                      [class.active]="page === currentPage">
                    <button class="page-link" (click)="cambiarPagina(page)">{{page}}</button>
                  </li>
                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <button class="page-link" (click)="cambiarPagina(currentPage + 1)">Siguiente</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Detalle Pedido -->
    <div class="modal fade" id="modalDetallePedido" tabindex="-1" *ngIf="pedidoSeleccionado">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-box"></i> Detalle del Pedido #{{pedidoSeleccionado.codigo_pedido}} - {{pedidoSeleccionado.cliente.nombre_completo}}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>📅 Fecha:</strong> {{pedidoSeleccionado.fecha}}</p>
                <p><strong>💳 Método de pago:</strong> {{pedidoSeleccionado.metodo_pago}}</p>
                <p><strong>📍 Dirección:</strong> {{pedidoSeleccionado.direccion}}</p>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-2">
                  <strong>📋 Estado:</strong>
                  <select class="form-select ms-2" 
                          [(ngModel)]="nuevoEstadoId" 
                          *ngIf="permissionsService.hasPermission('pedidos.edit')">
                    <option *ngFor="let estado of estados" [value]="estado.id">
                      {{estado.nombre_estado}}
                    </option>
                  </select>
                  <button class="btn btn-sm btn-warning ms-2" 
                          (click)="abrirModalCambiarEstado()"
                          *ngIf="permissionsService.hasPermission('pedidos.edit')">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
                <p><strong>💰 Total:</strong> {{pedidoSeleccionado.moneda}} {{pedidoSeleccionado.total}}</p>
                <p><strong>🏪 Tienda:</strong> {{pedidoSeleccionado.tienda}}</p>
              </div>
            </div>
            <h6><i class="fas fa-shopping-bag"></i> Productos:</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio U.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let producto of pedidoSeleccionado.productos">
                    <td>{{producto.nombre}}</td>
                    <td><span class="badge bg-secondary">{{producto.cantidad}}</span></td>
                    <td>{{pedidoSeleccionado.moneda}} {{producto.precio_unitario}}</td>
                    <td class="text-success fw-bold">{{pedidoSeleccionado.moneda}} {{producto.subtotal}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-end border-top pt-3">
              <p class="mb-1"><strong>Subtotal productos:</strong> <span class="text-success">{{pedidoSeleccionado.moneda}} {{pedidoSeleccionado.subtotal}}</span></p>
              <p class="mb-1"><strong>Envío:</strong> <span class="text-info">{{pedidoSeleccionado.moneda}} 5.00</span></p>
              <h5 class="text-primary"><strong>Total a pagar: {{pedidoSeleccionado.moneda}} {{pedidoSeleccionado.total}}</strong></h5>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Cambiar Estado -->
    <div class="modal fade" id="modalCambiarEstado" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-sync-alt"></i> Cambiar Estado del Pedido
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Estado actual:</strong> 
              <span class="badge" 
                    [ngClass]="getEstadoBadgeClass(pedidoSeleccionado?.estado?.nombre)">
                {{pedidoSeleccionado?.estado?.nombre || 'Sin estado'}}
              </span>
            </p>
            <div class="mb-3">
              <label class="form-label">Nuevo estado:</label>
              <select class="form-select" [(ngModel)]="nuevoEstadoId">
                <option *ngFor="let estado of estados" [value]="estado.id">
                  {{estado.nombre_estado}}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" (click)="confirmarCambioEstado()">
              <i class="fas fa-check"></i> Confirmar
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PedidosListComponent implements OnInit {
  pedidos: Pedido[] = []
  estados: EstadoPedido[] = []
  pedidoSeleccionado: any = null
  nuevoEstadoId = 0
  // Agregar esta línea
  trackByPedidoId = (index: number, pedido: any) => pedido.id
  filtros: PedidosFiltros = {}
  currentPage = 1
  totalPages = 1
  totalItems = 0
  loading = false
  Math = Math

  constructor(
    private pedidosService: PedidosService,
    public permissionsService: PermissionsService,
  ) {}

  ngOnInit() {
    this.cargarEstados()
    // Cargar pedidos después de un pequeño delay para asegurar que los estados estén listos
    setTimeout(() => {
      this.cargarPedidos()
    }, 100)
  }

  cargarPedidos() {
    this.loading = true
    this.filtros.page = this.currentPage
    this.pedidosService.getPedidos(this.filtros).subscribe({
      next: (response) => {
        console.log("Respuesta del servicio:", response) // Para debug
        this.pedidos = response.pedidos || []
        this.currentPage = response.pagination.current_page
        this.totalPages = response.pagination.last_page
        this.totalItems = response.pagination.total
        this.loading = false

        // Forzar detección de cambios
        setTimeout(() => {
          // Este timeout asegura que Angular detecte los cambios
        }, 0)
      },
      error: (error) => {
        console.error("Error al cargar pedidos:", error)
        this.pedidos = []
        this.loading = false
      },
    })
  }

  cargarEstados() {
    this.pedidosService.getEstados().subscribe({
      next: (estados) => {
        this.estados = estados
      },
      error: (error) => {
        console.error("Error al cargar estados:", error)
      },
    })
  }

  filtrarPedidos() {
    this.currentPage = 1
    this.cargarPedidos()
  }

  verDetalle(pedidoId: number) {
    this.pedidosService.getPedido(pedidoId).subscribe({
      next: (pedido) => {
        this.pedidoSeleccionado = pedido
        this.nuevoEstadoId = pedido.estado.id
        // Abrir modal usando Bootstrap
        const modal = new (window as any).bootstrap.Modal(document.getElementById("modalDetallePedido"))
        modal.show()
      },
      error: (error) => {
        console.error("Error al cargar detalle del pedido:", error)
      },
    })
  }

  abrirModalCambiarEstado() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById("modalCambiarEstado"))
    modal.show()
  }

  confirmarCambioEstado() {
    if (this.pedidoSeleccionado && this.nuevoEstadoId) {
      this.pedidosService.updateEstado(this.pedidoSeleccionado.id, this.nuevoEstadoId).subscribe({
        next: (response) => {
          // Actualizar estado en el pedido seleccionado
          const estadoActualizado = this.estados.find((e) => e.id === this.nuevoEstadoId)
          if (estadoActualizado) {
            this.pedidoSeleccionado.estado = {
              id: estadoActualizado.id,
              nombre: estadoActualizado.nombre_estado,
            }
          }
          // Actualizar en la lista
          const pedidoEnLista = this.pedidos.find((p) => p.id === this.pedidoSeleccionado.id)
          if (pedidoEnLista && estadoActualizado) {
            pedidoEnLista.estado = {
              id: estadoActualizado.id,
              nombre: estadoActualizado.nombre_estado,
            }
          }
          // Cerrar modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("modalCambiarEstado"))
          modal.hide()
          alert("Estado actualizado correctamente")
        },
        error: (error) => {
          console.error("Error al actualizar estado:", error)
          alert("Error al actualizar estado")
        },
      })
    }
  }

  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.cargarPedidos()
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = []
    const start = Math.max(1, this.currentPage - 2)
    const end = Math.min(this.totalPages, this.currentPage + 2)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  getEstadoBadgeClass(estado: string | null | undefined): string {
    // Validación mejorada para valores nulos, undefined o vacíos
    if (!estado || typeof estado !== "string") {
      return "bg-gradient-secondary"
    }

    switch (estado.toLowerCase()) {
      case "nuevo":
        return "bg-gradient-info"
      case "pendiente":
        return "bg-gradient-warning"
      case "pagado":
        return "bg-gradient-success"
      case "en preparación":
      case "en preparacion":
        return "bg-gradient-primary"
      case "en camino":
        return "bg-gradient-info"
      case "enviado":
        return "bg-gradient-info"
      case "entregado":
        return "bg-gradient-success"
      case "sin stock":
        return "bg-gradient-warning"
      case "cancelado":
        return "bg-gradient-danger"
      case "devuelto":
        return "bg-gradient-danger"
      default:
        return "bg-gradient-danger"
    }
  }
}
