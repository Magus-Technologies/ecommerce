// src/app/pages/dashboard/ventas/nueva-venta.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { VentasService } from '../../../services/ventas.service';
import { AlmacenService } from '../../../services/almacen.service';
import { Producto } from '../../../types/almacen.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-24">
      <div>
        <h5 class="text-heading fw-semibold mb-8">Nueva Venta</h5>
        <p class="text-gray-500 mb-0">Registra una nueva venta en el sistema</p>
      </div>
      <button 
        class="btn bg-gray-100 hover-bg-gray-200 text-gray-600 px-16 py-8 rounded-8"
        routerLink="/dashboard/ventas">
        <i class="ph ph-arrow-left me-8"></i>
        Volver
      </button>
    </div>

    <form [formGroup]="ventaForm" (ngSubmit)="onSubmit()">
      <div class="row">
        <!-- Información de la venta -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-12 mb-24">
            <div class="card-header bg-gray-50 border-0 rounded-top-12 p-24">
              <h6 class="text-heading fw-semibold mb-0">Información de la Venta</h6>
            </div>
            <div class="card-body p-24">
              <div class="row">
                <div class="col-md-6 mb-16">
                  <label class="form-label text-heading fw-medium mb-8">Método de Pago</label>
                  <select class="form-select px-16 py-12 border rounded-8" formControlName="metodo_pago">
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                  </select>
                </div>
                <div class="col-md-6 mb-16">
                  <div class="form-check mt-32">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      formControlName="requiere_factura"
                      id="requiere_factura">
                    <label class="form-check-label text-heading fw-medium" for="requiere_factura">
                      Requiere factura
                    </label>
                  </div>
                </div>
              </div>
              <div class="mb-16">
                <label class="form-label text-heading fw-medium mb-8">Observaciones</label>
                <textarea 
                  class="form-control px-16 py-12 border rounded-8" 
                  rows="3"
                  formControlName="observaciones"
                  placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </div>

          <!-- Productos -->
          <div class="card border-0 shadow-sm rounded-12">
            <div class="card-header bg-gray-50 border-0 rounded-top-12 p-24">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="text-heading fw-semibold mb-0">Productos</h6>
                <button 
                  type="button"
                  class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                  (click)="agregarProducto()">
                  <i class="ph ph-plus me-8"></i>
                  Agregar Producto
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-24 py-16 text-heading fw-semibold border-0">Producto</th>
                      <th class="px-24 py-16 text-heading fw-semibold border-0">Precio</th>
                      <th class="px-24 py-16 text-heading fw-semibold border-0">Cantidad</th>
                      <th class="px-24 py-16 text-heading fw-semibold border-0">Descuento</th>
                      <th class="px-24 py-16 text-heading fw-semibold border-0">Subtotal</th>
                      <th class="px-24 py-16 text-heading fw-semibold border-0 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody formArrayName="productos">
                    <tr *ngFor="let producto of productosArray.controls; let i = index" [formGroupName]="i">
                      <td class="px-24 py-16">
                        <select 
                          class="form-select px-16 py-12 border rounded-8"
                          formControlName="producto_id"
                          (change)="onProductoChange(i)">
                          <option value="">Seleccionar producto</option>
                          <option *ngFor="let prod of productos" [value]="prod.id">
                            {{ prod.nombre }} ({{ prod.codigo_producto }})
                          </option>
                        </select>
                      </td>
                      <td class="px-24 py-16">
                        <input 
                          type="number" 
                          class="form-control px-16 py-12 border rounded-8"
                          formControlName="precio_unitario"
                          step="0.01"
                          min="0"
                          (input)="calcularSubtotal(i)">
                      </td>
                      <td class="px-24 py-16">
                        <input 
                          type="number" 
                          class="form-control px-16 py-12 border rounded-8"
                          formControlName="cantidad"
                          min="1"
                          (input)="calcularSubtotal(i)">
                      </td>
                      <td class="px-24 py-16">
                        <input 
                          type="number" 
                          class="form-control px-16 py-12 border rounded-8"
                          formControlName="descuento_unitario"
                          step="0.01"
                          min="0"
                          (input)="calcularSubtotal(i)">
                      </td>
                      <td class="px-24 py-16">
                        <span class="text-heading fw-semibold">
                          S/ {{ getSubtotalLinea(i) }}
                        </span>
                      </td>
                      <td class="px-24 py-16 text-center">
                        <button 
                          type="button"
                          class="btn bg-danger-50 hover-bg-danger-100 text-danger-600 w-32 h-32 rounded-6 flex-center transition-2"
                          (click)="eliminarProducto(i)">
                          <i class="ph ph-trash text-sm"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty state -->
                <div *ngIf="productosArray.length === 0" class="text-center py-40">
                  <i class="ph ph-package text-gray-300 text-4xl mb-16"></i>
                  <h6 class="text-heading fw-semibold mb-8">No hay productos</h6>
                  <p class="text-gray-500 mb-16">Agrega productos para crear la venta</p>
                  <button 
                    type="button"
                    class="btn bg-main-600 hover-bg-main-700 text-white px-16 py-8 rounded-8"
                    (click)="agregarProducto()">
                    <i class="ph ph-plus me-8"></i>
                    Agregar primer producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-12 position-sticky" style="top: 24px;">
            <div class="card-header bg-gray-50 border-0 rounded-top-12 p-24">
              <h6 class="text-heading fw-semibold mb-0">Resumen de Venta</h6>
            </div>
            <div class="card-body p-24">
              <div class="d-flex justify-content-between mb-12">
                <span class="text-gray-600">Subtotal:</span>
                <span class="text-heading fw-medium">S/ {{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-12">
                <span class="text-gray-600">IGV (18%):</span>
                <span class="text-heading fw-medium">S/ {{ igv.toFixed(2) }}</span>
              </div>
              <div class="mb-16">
                <label class="form-label text-gray-600 mb-8">Descuento adicional:</label>
                <div class="input-group">
                  <span class="input-group-text bg-gray-50 border-end-0">S/</span>
                  <input 
                    type="number" 
                    class="form-control px-16 py-12 border-start-0"
                    formControlName="descuento_total"
                    step="0.01"
                    min="0"
                    (input)="calcularTotales()">
                </div>
              </div>
              <hr class="border-gray-200 my-16">
              <div class="d-flex justify-content-between mb-24">
                <span class="text-heading fw-semibold">Total:</span>
                <span class="text-heading fw-bold text-xl">S/ {{ total.toFixed(2) }}</span>
              </div>
              
              <button 
                type="submit" 
                class="btn bg-main-600 hover-bg-main-700 text-white w-100 py-12 rounded-8"
                [disabled]="isLoading || ventaForm.invalid || productosArray.length === 0">
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-8"></span>
                <i *ngIf="!isLoading" class="ph ph-check me-8"></i>
                {{ isLoading ? 'Guardando...' : 'Registrar Venta' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
    .table td {
      vertical-align: middle;
    }
  `,
  ],
})
export class NuevaVentaComponent implements OnInit {
  ventaForm: FormGroup;
  productos: Producto[] = [];
  isLoading = false;
  
  // Totales
  subtotal = 0;
  igv = 0;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private almacenService: AlmacenService,
    private router: Router
  ) {
    this.ventaForm = this.fb.group({
      metodo_pago: ['', Validators.required],
      requiere_factura: [false],
      observaciones: [''],
      descuento_total: [0, [Validators.min(0)]],
      productos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.agregarProducto(); // Agregar una línea inicial
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
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0)]],
      descuento_unitario: [0, [Validators.min(0)]]
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
    
    this.productosArray.controls.forEach(control => {
      const cantidad = control.get('cantidad')?.value || 0;
      const precio = control.get('precio_unitario')?.value || 0;
      const descuento = control.get('descuento_unitario')?.value || 0;
      
      const precioSinIgv = precio / 1.18;
      const subtotalLinea = (cantidad * precioSinIgv) - (descuento * cantidad);
      subtotalSinIgv += subtotalLinea;
    });
    
    this.subtotal = subtotalSinIgv;
    this.igv = subtotalSinIgv * 0.18;
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