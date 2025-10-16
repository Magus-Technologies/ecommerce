// src/app/pages/dashboard/ventas/nueva-venta.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../services/ventas.service';
import { AlmacenService } from '../../../services/almacen.service';
import { FacturacionService } from '../../../services/facturacion.service';
import { Producto } from '../../../types/almacen.types';
import { Serie, TIPOS_DOCUMENTO } from '../../../models/facturacion.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nueva-venta.component.html',
  styles: [`
    .table td {
      vertical-align: middle;
    }
    .border-primary {
      border-color: #007bff !important;
    }
  `],
})
export class NuevaVentaComponent implements OnInit {
  ventaForm: FormGroup;
  productos: Producto[] = [];
  isLoading = false;

  // Totales
  subtotal = 0;
  igv = 0;
  total = 0;

  // Facturación electrónica
  seriesDisponibles = signal<Serie[]>([]);
  serieSeleccionada = signal<Serie | null>(null);
  fechaActual = new Date().toISOString().split('T')[0];

  // Mensajes
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Constantes
  readonly TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private almacenService: AlmacenService,
    private facturacionService: FacturacionService,
    private router: Router
  ) {
    this.ventaForm = this.fb.group({
      tipo_comprobante: ['03', Validators.required],
      serie_id: ['', Validators.required],
      cliente: this.fb.group({
        tipo_documento: ['-', Validators.required],
        numero_documento: [''],
        nombre: ['', Validators.required],
        direccion: [''],
        email: [''],
        telefono: ['']
      }),
      metodo_pago: ['', Validators.required],
      observaciones: [''],
      descuento_total: [0, [Validators.min(0)]],
      productos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarSeriesDisponibles();
    this.agregarProducto(); // Agregar una línea inicial
  }

  cargarSeriesDisponibles(): void {
    this.facturacionService.getSeries({ estado: 'activo' }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.seriesDisponibles.set(response.data);
          this.actualizarSerieSegunTipo();
        }
      },
      error: (error) => {
        console.error('Error al cargar series:', error);
        this.errorMessage = 'Error al cargar series de facturación';
      }
    });
  }

  actualizarSerieSegunTipo(): void {
    const series = this.seriesDisponibles();
    const tipo = this.ventaForm.get('tipo_comprobante')?.value;

    const seriesPorTipo = series.filter(s => s.tipo_comprobante === tipo);
    if (seriesPorTipo.length > 0) {
      this.serieSeleccionada.set(seriesPorTipo[0]);
      this.ventaForm.patchValue({ serie_id: seriesPorTipo[0].id });
    } else {
      this.serieSeleccionada.set(null);
      this.ventaForm.patchValue({ serie_id: '' });
    }
  }

  onTipoComprobanteChange(): void {
    const tipoComprobante = this.ventaForm.get('tipo_comprobante')?.value;

    // Validar que para Factura (01) se requiere RUC
    if (tipoComprobante === '01') {
      const tipoDocumento = this.ventaForm.get('cliente.tipo_documento')?.value;
      if (tipoDocumento !== '6') {
        this.errorMessage = 'Para emitir Factura se requiere RUC del cliente';
        this.ventaForm.patchValue({ tipo_comprobante: '03' });
        return;
      }

      const ruc = this.ventaForm.get('cliente.numero_documento')?.value;
      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        this.errorMessage = 'El RUC ingresado no es válido (debe tener 11 dígitos)';
        this.ventaForm.patchValue({ tipo_comprobante: '03' });
        return;
      }
    }

    this.actualizarSerieSegunTipo();
    this.errorMessage = null;
  }

  buscarCliente(): void {
    const numeroDocumento = this.ventaForm.get('cliente.numero_documento')?.value;
    if (!numeroDocumento) return;

    this.facturacionService.getClientes({ numero_documento: numeroDocumento }).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          const cliente = response.data[0];
          this.ventaForm.patchValue({
            cliente: {
              tipo_documento: cliente.tipo_documento,
              numero_documento: cliente.numero_documento,
              nombre: cliente.nombre,
              direccion: cliente.direccion || '',
              email: cliente.email || '',
              telefono: cliente.telefono || ''
            }
          });
          this.successMessage = 'Cliente encontrado y cargado';
        }
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
        this.errorMessage = 'Cliente no encontrado. Puede continuar con los datos manuales.';
      }
    });
  }

  cerrarMensajes(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  get productosArray(): FormArray {
    return this.ventaForm.get('productos') as FormArray;
  }

  cargarProductos(): void {
    this.almacenService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos.filter(p => p.activo && p.stock > 0);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  agregarProducto(): void {
    const productoGroup = this.fb.group({
      producto_id: ['', Validators.required],
      codigo_producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      unidad_medida: ['NIU', Validators.required],
      precio_unitario: [0, [Validators.required, Validators.min(0)]],
      descuento_unitario: [0, [Validators.min(0)]],
      tipo_afectacion_igv: ['10', Validators.required]
    });

    this.productosArray.push(productoGroup);
  }

  eliminarProducto(index: number): void {
    this.productosArray.removeAt(index);
    this.calcularTotales();
  }

  onProductoChange(index: number): void {
    const productoId = this.productosArray.at(index).get('producto_id')?.value;
    const producto = this.productos.find(p => p.id == productoId);

    if (producto) {
      this.productosArray.at(index).patchValue({
        codigo_producto: producto.codigo_producto || `PROD-${producto.id}`,
        precio_unitario: producto.precio_venta
      });
      this.calcularSubtotal(index);
    }
  }

  calcularSubtotal(index: number): void {
    const productoGroup = this.productosArray.at(index);
    const cantidad = productoGroup.get('cantidad')?.value || 0;
    const precio = productoGroup.get('precio_unitario')?.value || 0;
    const descuento = productoGroup.get('descuento_unitario')?.value || 0;
    
    // Validar stock
    const productoId = productoGroup.get('producto_id')?.value;
    const producto = this.productos.find(p => p.id == productoId);
    
    if (producto && cantidad > producto.stock) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${producto.stock} unidades disponibles`,
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      productoGroup.patchValue({ cantidad: producto.stock });
      return;
    }
    
    this.calcularTotales();
  }

  calcularTotales(): void {
    let subtotalSinIgv = 0;
    let igvTotal = 0;

    this.productosArray.controls.forEach(control => {
      const cantidad = control.get('cantidad')?.value || 0;
      const precio = control.get('precio_unitario')?.value || 0;
      const descuento = control.get('descuento_unitario')?.value || 0;
      const tipoAfectacion = control.get('tipo_afectacion_igv')?.value || '10';

      const precioSinIgv = precio / 1.18;
      const subtotalLinea = (cantidad * precioSinIgv) - (descuento * cantidad);
      subtotalSinIgv += subtotalLinea;

      // Solo calcular IGV si es gravado (tipo 10)
      if (tipoAfectacion === '10') {
        igvTotal += subtotalLinea * 0.18;
      }
    });

    this.subtotal = subtotalSinIgv;
    this.igv = igvTotal;
    const descuentoTotal = this.ventaForm.get('descuento_total')?.value || 0;
    this.total = this.subtotal + this.igv - descuentoTotal;
  }

  getSubtotalLinea(index: number): string {
    const productoGroup = this.productosArray.at(index);
    const cantidad = productoGroup.get('cantidad')?.value || 0;
    const precio = productoGroup.get('precio_unitario')?.value || 0;
    const descuento = productoGroup.get('descuento_unitario')?.value || 0;
    
    const precioSinIgv = precio / 1.18;
    const subtotalLinea = (cantidad * precioSinIgv) - (descuento * cantidad);
    const igvLinea = subtotalLinea * 0.18;
    const totalLinea = subtotalLinea + igvLinea;
    
    return totalLinea.toFixed(2);
  }

  onSubmit(): void {
    if (this.ventaForm.valid && this.productosArray.length > 0) {
      this.isLoading = true;

      const ventaData = {
        ...this.ventaForm.value,
        productos: this.productosArray.value
      };

      this.ventasService.crearVenta(ventaData).subscribe({
        next: (response) => {
          Swal.fire({
            title: '¡Venta registrada!',
            text: 'La venta ha sido registrada exitosamente.',
            icon: 'success',
            confirmButtonColor: '#198754'
          }).then(() => {
            this.router.navigate(['/dashboard/ventas']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar la venta. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          console.error('Error al crear venta:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ventaForm.controls).forEach(key => {
      const control = this.ventaForm.get(key);
      control?.markAsTouched();
    });
    
    this.productosArray.controls.forEach(group => {
      const formGroup = group as FormGroup;
      Object.keys(formGroup.controls).forEach(key => {
        formGroup.get(key)?.markAsTouched();
      });
    });
  }
}