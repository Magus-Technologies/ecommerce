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

  // Proceder al checkout
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

    this.router.navigate(['/checkout']);
  }

  // Continuar comprando
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  // Obtener subtotal de un item
  getItemSubtotal(item: CartItem): number {
    return item.precio * item.cantidad;
  }

  // Obtener total final con descuento
  getTotalFinal(): number {
    return Math.max(0, this.cartSummary.total - this.descuentoCupon);
  }

  // Formatear precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Manejar error de imagen
  onImageError(event: any): void {
    event.target.src = '/placeholder.svg?height=80&width=80&text=Sin+imagen';
  }
}