// src/app/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, FormsModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    igv: 0,
    total: 0,
    cantidad_items: 0
  };
  
  codigoCupon = '';
  descuentoCupon = 0;
  isUpdating = false;
  isLoggedIn = false;
  
  // ✅ NUEVOS: Datos para checkout
  direccionEnvio = '';
  telefonoContacto = '';
  metodoPago = 'efectivo';
  observaciones = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del carrito
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
      });

    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    // Verificar si el usuario está logueado
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Actualizar cantidad de un producto
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeProduct(item.id);
      return;
    }

    const success = this.cartService.updateQuantity(item.id, newQuantity);
    if (!success) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${item.stock_disponible} unidades disponibles`,
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  // Incrementar cantidad
  incrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.cantidad + 1);
  }

  // Decrementar cantidad
  decrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.cantidad - 1);
  }

  // Remover producto del carrito
  removeProduct(itemId: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (!item) return;

    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que quieres eliminar "${item.nombre}" del carrito?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeFromCart(itemId);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado del carrito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Limpiar carrito completo
  clearCart(): void {
    if (this.cartItems.length === 0) return;

    Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.clearCart();
        Swal.fire({
          title: '¡Carrito vaciado!',
          text: 'Todos los productos han sido eliminados.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Aplicar cupón de descuento
  aplicarCupon(): void {
    if (!this.codigoCupon.trim()) {
      Swal.fire({
        title: 'Código requerido',
        text: 'Por favor ingresa un código de cupón',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    // Simular validación de cupón (aquí puedes integrar con tu API)
    const cuponesValidos = {
      'DESCUENTO10': 10,
      'DESCUENTO20': 20,
      'BIENVENIDO': 15,
      'FREE25BAC': 25
    };

    const descuento = cuponesValidos[this.codigoCupon.toUpperCase() as keyof typeof cuponesValidos];
    
    if (descuento) {
      this.descuentoCupon = (this.cartSummary.total * descuento) / 100;
      Swal.fire({
        title: '¡Cupón aplicado!',
        text: `Se ha aplicado un descuento del ${descuento}%`,
        icon: 'success',
        confirmButtonColor: '#198754'
      });
    } else {
      Swal.fire({
        title: 'Cupón inválido',
        text: 'El código de cupón ingresado no es válido',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  // ✅ NUEVO: Proceder al checkout (crear pedido)
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'Agrega productos al carrito antes de continuar',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para continuar con la compra',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/account']);
        }
      });
      return;
    }

    // Mostrar modal de checkout
    this.mostrarModalCheckout();
  }

  // ✅ NUEVO: Mostrar modal de checkout
  mostrarModalCheckout(): void {
    Swal.fire({
      title: 'Finalizar Pedido',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">Dirección de envío *</label>
            <textarea 
              id="direccion-envio" 
              class="form-control" 
              rows="2" 
              placeholder="Ingresa tu dirección completa">${this.direccionEnvio}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono de contacto *</label>
            <input 
              type="tel" 
              id="telefono-contacto" 
              class="form-control" 
              placeholder="999 999 999"
              value="${this.telefonoContacto}">
          </div>
          <div class="mb-3">
            <label class="form-label">Método de pago *</label>
            <select id="metodo-pago" class="form-select">
              <option value="efectivo" ${this.metodoPago === 'efectivo' ? 'selected' : ''}>Efectivo</option>
              <option value="tarjeta" ${this.metodoPago === 'tarjeta' ? 'selected' : ''}>Tarjeta</option>
              <option value="transferencia" ${this.metodoPago === 'transferencia' ? 'selected' : ''}>Transferencia</option>
              <option value="yape" ${this.metodoPago === 'yape' ? 'selected' : ''}>Yape</option>
              <option value="plin" ${this.metodoPago === 'plin' ? 'selected' : ''}>Plin</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Observaciones (opcional)</label>
            <textarea 
              id="observaciones" 
              class="form-control" 
              rows="2" 
              placeholder="Instrucciones especiales...">${this.observaciones}</textarea>
          </div>
          <div class="bg-light p-3 rounded">
            <div class="d-flex justify-content-between">
              <span><strong>Total a pagar:</strong></span>
              <span><strong>S/ ${this.formatPrice(this.getTotalFinal())}</strong></span>
            </div>
          </div>
        </div>
      `,
      width: 600,
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="ph ph-check me-2"></i>Confirmar Pedido',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const direccion = (document.getElementById('direccion-envio') as HTMLTextAreaElement).value;
        const telefono = (document.getElementById('telefono-contacto') as HTMLInputElement).value;
        const metodo = (document.getElementById('metodo-pago') as HTMLSelectElement).value;
        const obs = (document.getElementById('observaciones') as HTMLTextAreaElement).value;

        if (!direccion.trim()) {
          Swal.showValidationMessage('La dirección de envío es requerida');
          return false;
        }

        if (!telefono.trim()) {
          Swal.showValidationMessage('El teléfono de contacto es requerido');
          return false;
        }

        return {
          direccion_envio: direccion.trim(),
          telefono_contacto: telefono.trim(),
          metodo_pago: metodo,
          observaciones: obs.trim()
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.confirmarPedido(result.value);
      }
    });
  }

  // ✅ NUEVO: Confirmar pedido
  confirmarPedido(datosCheckout: any): void {
    Swal.fire({
      title: 'Procesando pedido...',
      text: 'Por favor espera mientras procesamos tu pedido',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.cartService.procesarPedido(datosCheckout).subscribe({
      next: (response) => {
        // Limpiar carrito después de crear el pedido exitosamente
        this.cartService.clearCart();
        
        Swal.fire({
          title: '¡Pedido creado exitosamente!',
          html: `
            <div class="text-center">
              <i class="ph ph-check-circle text-success mb-3" style="font-size: 4rem;"></i>
              <h5>Pedido #${response.pedido?.codigo_pedido || response.codigo_pedido}</h5>
              <p class="text-muted">Tu pedido ha sido registrado y será procesado pronto.</p>
              <p><strong>Total: S/ ${this.formatPrice(this.getTotalFinal())}</strong></p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#198754',
          confirmButtonText: 'Ver mis pedidos'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/mis-pedidos']);
          } else {
            this.router.navigate(['/shop']);
          }
        });
      },
      error: (error) => {
        console.error('Error al crear pedido:', error);
        Swal.fire({
          title: 'Error al crear pedido',
          text: error.error?.message || 'Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Continuar comprando
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  // Obtener subtotal de un item
  getItemSubtotal(item: CartItem): number {
    const precio = typeof item.precio === 'number' ? item.precio : parseFloat(String(item.precio || 0));
    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : parseInt(String(item.cantidad || 0));
    
    if (isNaN(precio) || isNaN(cantidad)) {
      return 0;
    }
    
    return precio * cantidad;
  }

  // Obtener total final con descuento
  getTotalFinal(): number {
    const total = typeof this.cartSummary.total === 'number' ? this.cartSummary.total : 0;
    const descuento = typeof this.descuentoCupon === 'number' ? this.descuentoCupon : 0;
    
    return Math.max(0, total - descuento);
  }

  // Formatear precio
  formatPrice(price: number | string | null | undefined): string {
    // Convertir a número y validar
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
    
    // Si no es un número válido, retornar 0.00
    if (isNaN(numPrice)) {
      return '0.00';
    }
    
    return numPrice.toFixed(2);
  }

  // Manejar error de imagen
  onImageError(event: any): void {
    event.target.src = '/placeholder.svg?height=80&width=80&text=Sin+imagen';
  }
}