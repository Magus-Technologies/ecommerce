// src/app/pages/dashboard/ventas/nueva-venta.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../services/ventas.service';
import { AlmacenService } from '../../../services/almacen.service';
import { FacturacionService } from '../../../services/facturacion.service';
import { ReniecService } from '../../../services/reniec.service';
import { Producto } from '../../../types/almacen.types';
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

  // Mensajes
  errorMessage: string | null = null;
  successMessage: string | null = null;





  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private almacenService: AlmacenService,
    private facturacionService: FacturacionService,
    private reniecService: ReniecService,
    private router: Router
  ) {
    this.ventaForm = this.fb.group({
      cliente: this.fb.group({
        tipo_documento: ['1', Validators.required],
        numero_documento: ['', Validators.required],
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
    this.agregarProducto(); // Agregar una línea inicial
  }

  buscarCliente(): void {
    const numeroDocumento = this.ventaForm.get('cliente.numero_documento')?.value;
    const tipoDocumento = this.ventaForm.get('cliente.tipo_documento')?.value;
    
    if (!numeroDocumento) {
      Swal.fire({
        title: 'Campo requerido',
        text: 'Ingrese el número de documento',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Buscando cliente...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // PASO 1: Buscar en la base de datos (PRIORIDAD)
    this.facturacionService.getClientes({ numero_documento: numeroDocumento }).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          // ✅ CLIENTE ENCONTRADO EN DB
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
          
          Swal.fire({
            title: '✅ Cliente Encontrado',
            html: `
              <div class="text-start">
                <div class="alert alert-success">
                  <strong>Cliente registrado en el sistema</strong>
                </div>
                <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                <p><strong>Documento:</strong> ${cliente.numero_documento}</p>
                ${cliente.direccion ? `<p><strong>Dirección:</strong> ${cliente.direccion}</p>` : ''}
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
        } else {
          // ❌ NO ENCONTRADO EN DB → BUSCAR EN RENIEC/SUNAT
          this.buscarEnReniecSunat(numeroDocumento, tipoDocumento);
        }
      },
      error: (error) => {
        console.error('Error al buscar en DB:', error);
        // Si hay error en DB, intentar con RENIEC/SUNAT
        this.buscarEnReniecSunat(numeroDocumento, tipoDocumento);
      }
    });
  }

  /**
   * Buscar en RENIEC (DNI) o SUNAT (RUC) cuando no se encuentra en DB
   */
  private buscarEnReniecSunat(numeroDocumento: string, tipoDocumento: string): void {
    // Determinar si es DNI (8 dígitos) o RUC (11 dígitos)
    const esDni = numeroDocumento.length === 8;
    const esRuc = numeroDocumento.length === 11;

    if (!esDni && !esRuc) {
      Swal.fire({
        title: 'Documento no válido',
        html: `
          <div class="text-start">
            <p>El documento debe tener:</p>
            <ul>
              <li><strong>8 dígitos</strong> para DNI</li>
              <li><strong>11 dígitos</strong> para RUC</li>
            </ul>
            <p class="text-muted">Puede continuar ingresando los datos manualmente.</p>
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    if (esDni) {
      // Buscar en RENIEC
      this.reniecService.buscarPorDni(numeroDocumento).subscribe({
        next: (response) => {
          if (response.success && (response.nombres || response.nombre)) {
            // Construir nombre completo
            const nombreCompleto = response.nombre || 
              `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`;

            this.ventaForm.patchValue({
              cliente: {
                tipo_documento: '1', // DNI
                numero_documento: numeroDocumento,
                nombre: nombreCompleto.trim()
              }
            });

            Swal.fire({
              title: '✅ Datos Encontrados en RENIEC',
              html: `
                <div class="text-start">
                  <div class="alert alert-info">
                    <strong>Cliente nuevo - Datos de RENIEC</strong>
                  </div>
                  <p><strong>DNI:</strong> ${numeroDocumento}</p>
                  <p><strong>Nombre:</strong> ${nombreCompleto}</p>
                  <p class="text-muted small">Complete los datos adicionales si lo desea.</p>
                </div>
              `,
              icon: 'success',
              confirmButtonColor: '#198754'
            });
          } else {
            this.mostrarClienteNoEncontrado();
          }
        },
        error: (error) => {
          console.error('Error al buscar en RENIEC:', error);
          this.mostrarClienteNoEncontrado();
        }
      });
    } else if (esRuc) {
      // Para RUC, mostrar mensaje que puede ingresar manualmente
      // (La API de SUNAT requiere implementación adicional en el backend)
      Swal.fire({
        title: 'Cliente no encontrado',
        html: `
          <div class="text-start">
            <div class="alert alert-warning">
              <strong>RUC no registrado en el sistema</strong>
            </div>
            <p>El RUC <strong>${numeroDocumento}</strong> no está en la base de datos.</p>
            <p class="text-muted">Puede continuar ingresando los datos manualmente:</p>
            <ul class="text-muted">
              <li>Razón Social</li>
              <li>Dirección</li>
              <li>Email y Teléfono (opcional)</li>
            </ul>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#0d6efd'
      });
    }
  }

  /**
   * Mostrar mensaje cuando no se encuentra el cliente en ningún lado
   */
  private mostrarClienteNoEncontrado(): void {
    Swal.fire({
      title: 'Cliente no encontrado',
      html: `
        <div class="text-start">
          <div class="alert alert-warning">
            <strong>No se encontraron datos</strong>
          </div>
          <p>El documento no está registrado en:</p>
          <ul>
            <li>Base de datos del sistema</li>
            <li>RENIEC</li>
          </ul>
          <p class="text-muted">Puede continuar ingresando los datos manualmente.</p>
        </div>
      `,
      icon: 'warning',
      confirmButtonColor: '#ffc107'
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

      const clienteForm = this.ventaForm.get('cliente')?.value;

      // PASO 1: Registrar venta POS (NO genera comprobante automáticamente)
      const ventaData = {
        cliente_id: null, // Se enviará cliente_datos en su lugar
        productos: this.productosArray.value.map((p: any) => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          descuento_unitario: p.descuento_unitario || 0
        })),
        descuento_total: this.ventaForm.get('descuento_total')?.value || 0,
        metodo_pago: this.ventaForm.get('metodo_pago')?.value,
        observaciones: this.ventaForm.get('observaciones')?.value || null,
        // NO enviar requiere_factura - La venta queda PENDIENTE
        cliente_datos: {
          tipo_documento: clienteForm.tipo_documento,
          numero_documento: clienteForm.numero_documento,
          razon_social: clienteForm.nombre,
          direccion: clienteForm.direccion || '',
          email: clienteForm.email || '',
          telefono: clienteForm.telefono || ''
        }
      };

      this.ventasService.crearVenta(ventaData).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Venta creada exitosamente con estado PENDIENTE
          Swal.fire({
            title: '✅ Venta Registrada',
            html: `
              <div class="text-start">
                <div class="alert alert-success mb-3">
                  <strong>Código de Venta:</strong> ${response.data.codigo_venta}<br>
                  <strong>Total:</strong> S/ ${response.data.total}<br>
                  <strong>Estado:</strong> PENDIENTE
                </div>
                <p class="mb-2">La venta ha sido registrada correctamente.</p>
                <div class="alert alert-info">
                  <strong>Próximos pasos:</strong><br>
                  1. Generar comprobante electrónico<br>
                  2. Enviar a SUNAT para validación<br>
                  3. Descargar PDF y enviar al cliente
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonText: '📋 Ver Ventas',
            showCancelButton: true,
            cancelButtonText: '➕ Nueva Venta',
            confirmButtonColor: '#198754',
            cancelButtonColor: '#0d6efd'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/dashboard/ventas']);
            } else {
              this.resetearFormulario();
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error al registrar venta',
            html: `
              <div class="text-start">
                <p class="mb-3">${error.error?.message || 'No se pudo registrar la venta. Inténtalo de nuevo.'}</p>
                ${error.error?.errors ?
                `<div class="alert alert-danger">
                    <strong>Detalles:</strong><br>
                    ${Object.values(error.error.errors).flat().join('<br>')}
                  </div>` :
                ''
              }
              </div>
            `,
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          console.error('Error al crear venta:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos y agregue al menos un producto',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
    }
  }

  /**
   * Resetear formulario para nueva venta
   */
  private resetearFormulario(): void {
    this.ventaForm.reset({
      cliente: {
        tipo_documento: '1',
        numero_documento: '',
        nombre: '',
        direccion: '',
        email: '',
        telefono: ''
      },
      metodo_pago: '',
      observaciones: '',
      descuento_total: 0
    });
    this.productosArray.clear();
    this.agregarProducto();
    this.calcularTotales();
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
