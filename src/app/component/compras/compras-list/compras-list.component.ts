import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../../services/compras.service';
import { Compra } from '../../../services/compras.service';
import { NgxDatatableModule, ColumnMode, SelectionType, SortType, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxDatatableModule],
  templateUrl: "./compras-list.component.html",
  styles: [`
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
    }

    ::ng-deep .compras-table {
      .action-buttons {
        display: flex !important;
        gap: 4px !important;
        align-items: center !important;
        justify-content: center !important;
        flex-wrap: nowrap !important;
      }

      .action-btn {
        width: 24px !important;
        height: 24px !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
        font-size: 10px !important;
        min-width: 24px !important;
      }

      .details-btn {
        background-color: #cff4fc !important;
        color: #087990 !important;
      }

      .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    }
  `]
})
export class ComprasListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('table') table!: DatatableComponent;

  compras: Compra[] = [];
  compraSeleccionada: Compra | null = null;
  loading = false;
  pageSize = 10;
  private resizeSubscription!: Subscription;

  // Cache para URLs de fotos para evitar regeneración constante
  private photoUrlCache = new Map<string, string | null>();

  // Configuración para NGX-Datatable
  columns = [
    { name: 'Código', prop: 'codigo_compra', flexGrow: 1.5, minWidth: 200 },
    { name: 'Cliente', prop: 'cliente_nombre', flexGrow: 2.5, minWidth: 250 },
    { name: 'Fecha', prop: 'fecha_compra', flexGrow: 1.2, minWidth: 140 },
    { name: 'Total', prop: 'total', flexGrow: 1, minWidth: 120 },
    { name: 'Estado', prop: 'estado_compra.nombre', flexGrow: 1.2, minWidth: 130 },
    { name: 'Acciones', prop: 'acciones', flexGrow: 0.8, minWidth: 120 }
  ];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  SortType = SortType;

  constructor(private comprasService: ComprasService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  ngAfterViewInit(): void {
    // Escuchar cambios del sidebar para recalcular la tabla
    const sidebarListener = () => {
      // Recálculo inmediato sin setTimeout para respuesta más rápida
      this.recalcularTabla();

      // Recálculo adicional por si acaso
      setTimeout(() => {
        this.recalcularTabla();
      }, 10);
    };

    window.addEventListener('sidebarChanged', sidebarListener);

    // Escuchar cambios de ventana
    const resizeListener = () => {
      this.recalcularTabla();
    };

    window.addEventListener('resize', resizeListener);

    // Cleanup en destroy
    this.resizeSubscription = new Subscription();
    this.resizeSubscription.add(() => {
      window.removeEventListener('sidebarChanged', sidebarListener);
      window.removeEventListener('resize', resizeListener);
    });
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  // Método para recalcular columnas cuando cambia el layout
  private recalcularTabla(): void {
    if (this.table) {
      // Forzar recalculo inmediato
      this.table.recalculate();
      this.table.recalculateColumns();

      // Forzar redibujado del DOM
      this.table.recalculateDims();

      // Detectar cambios para Angular
      setTimeout(() => {
        if (this.table) {
          this.table.recalculate();
        }
      }, 1);
    }
  }

  cargarCompras(): void {
    this.loading = true;
    // Limpiar cache de fotos cuando se recargan las compras
    this.photoUrlCache.clear();

    this.comprasService.obtenerTodasLasCompras().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.compras = response.compras || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando compras:', error);
        this.loading = false;
      }
    });
  }

  verDetalle(compra: Compra): void {
    this.compraSeleccionada = compra;
    console.log('Ver detalle de compra:', compra.codigo_compra);

    // Activar el modal de Bootstrap
    const modalElement = document.getElementById('modalDetalleCompra');
    if (modalElement) {
      // Usar Bootstrap 5 Modal API
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  aprobarCompra(compra: Compra): void {
    if (confirm('¿Está seguro de aprobar esta compra?')) {
      this.comprasService.aprobarCompra(compra.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.cargarCompras();
          }
        },
        error: (error) => {
          console.error('Error aprobando compra:', error);
          alert('Error al aprobar la compra');
        }
      });
    }
  }

  rechazarCompra(compra: Compra): void {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      this.comprasService.rechazarCompra(compra.id, motivo).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.cargarCompras();
          }
        },
        error: (error) => {
          console.error('Error rechazando compra:', error);
          alert('Error al rechazar la compra');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return this.comprasService.formatearFecha(fecha);
  }

  formatearPrecio(precio: number): string {
    return this.comprasService.formatearPrecio(precio);
  }

  getEstadoClass(estado: any): string {
    return this.comprasService.getEstadoClass(estado);
  }

  getEstadoIcon(estado: any): string {
    return this.comprasService.getEstadoIcon(estado);
  }

  getEstadoTexto(estado: any): string {
    return this.comprasService.getEstadoTexto(estado);
  }

  getEstadoTextoCorto(estado: any): string {
    const textoCompleto = this.comprasService.getEstadoTexto(estado);
    // Acortar textos largos para que quepan mejor en la tabla
    const textoCorto: { [key: string]: string } = {
      'Pendiente Aprobación': 'Pendiente',
      'Pendiente de Aprobación': 'Pendiente',
      'Pendiente Pago': 'Pend. Pago',
      'En Proceso': 'Proceso',
      'Completada': 'Completa',
      'Cancelada': 'Cancelada',
      'Rechazada': 'Rechazada'
    };
    return textoCorto[textoCompleto] || textoCompleto;
  }

  necesitaAtencion(compra: Compra): boolean {
    return this.comprasService.necesitaAtencion(compra);
  }

  getSelectionText(): string {
    return `${this.compras.length} ${this.compras.length === 1 ? 'compra' : 'compras'}`;
  }

  // Método para obtener la URL de la foto del cliente
  getClientePhotoUrl(compra: Compra): string | null {
    const cacheKey = `compra-${compra.id}-user-${(compra as any).user_cliente_id}`;

    if (this.photoUrlCache.has(cacheKey)) {
      return this.photoUrlCache.get(cacheKey)!;
    }

    const compraAny = compra as any;
    const userCliente = compraAny.user_cliente;

    if (userCliente) {
      const photoField = userCliente.foto || userCliente.foto_url ||
                        userCliente.profile_photo || userCliente.avatar ||
                        userCliente.image;

      if (photoField) {
        let finalUrl = photoField;

        if (finalUrl.startsWith('http')) {
          finalUrl = finalUrl.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
        } else {
          let photoPath = finalUrl;
          if (photoPath.includes('/storage/clientes//storage/clientes/')) {
            photoPath = photoPath.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
          }
          if (!photoPath.includes('/')) {
            photoPath = `/storage/clientes/${photoPath}`;
          }
          finalUrl = `${environment.baseUrl}${photoPath}`;
        }

        const result = finalUrl;
        this.photoUrlCache.set(cacheKey, result);
        return result;
      }
    }

    const photoField = compraAny.cliente_foto || compraAny.cliente_photo ||
                      compraAny.foto || compraAny.cliente_imagen || compraAny.avatar;

    if (photoField) {
      let finalUrl = photoField;
      if (finalUrl.startsWith('http')) {
        finalUrl = finalUrl.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
      } else {
        let photoPath = finalUrl;
        if (photoPath.includes('/storage/clientes//storage/clientes/')) {
          photoPath = photoPath.replace('/storage/clientes//storage/clientes/', '/storage/clientes/');
        }
        if (!photoPath.includes('/')) {
          photoPath = `/storage/clientes/${photoPath}`;
        }
        finalUrl = `${environment.baseUrl}${photoPath}`;
      }

      this.photoUrlCache.set(cacheKey, finalUrl);
      return finalUrl;
    }

    this.photoUrlCache.set(cacheKey, null);
    return null;
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  // TrackBy function para evitar re-renders innecesarios
  trackByCompraId(index: number, compra: Compra): number {
    return compra.id;
  }
}