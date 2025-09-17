import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CotizacionesService, Cotizacion } from '../../../services/cotizaciones.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.scss'
})
export class CotizacionesComponent implements OnInit, OnDestroy {
  cotizaciones: Cotizacion[] = [];
  isLoadingCotizaciones = false;
  cotizacionSeleccionada: Cotizacion | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private cotizacionesService: CotizacionesService
  ) {}

  ngOnInit(): void {
    this.cargarCotizaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarCotizaciones(): void {
    this.isLoadingCotizaciones = true;
    this.cotizacionesService.obtenerMisCotizaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.cotizaciones) {
            this.cotizaciones = response.cotizaciones;
          }
          this.isLoadingCotizaciones = false;
        },
        error: (error) => {
          console.error('Error cargando cotizaciones:', error);
          this.isLoadingCotizaciones = false;
        }
      });
  }

  verDetallesCotizacion(cotizacion: Cotizacion): void {
    // Descargar PDF de la cotización
    this.cotizacionesService.descargarPDF(
      cotizacion.id,
      `Cotizacion_${cotizacion.codigo_cotizacion}.pdf`
    );
  }

  convertirACompra(cotizacion: Cotizacion): void {
    if (confirm(`¿Deseas convertir la cotización ${cotizacion.codigo_cotizacion} en una compra?`)) {
      console.log('Convirtiendo cotización a compra:', cotizacion);

      this.cotizacionesService.convertirACompra(cotizacion.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            alert('¡Cotización convertida a compra exitosamente!');
            this.cargarCotizaciones(); // Recargar la lista
          }
        },
        error: (error) => {
          console.error('Error convirtiendo cotización:', error);
          alert('Error al convertir la cotización. Inténtalo de nuevo.');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return this.cotizacionesService.formatearFecha(fecha);
  }

  formatearPrecio(precio: number): string {
    return this.cotizacionesService.formatearPrecio(precio);
  }

  getEstadoClass(estado: any): string {
    return this.cotizacionesService.getEstadoClass(estado);
  }
}