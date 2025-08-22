// src/app/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, FormsModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { subtotal: 0, igv: 0, total: 0, cantidad_items: 0 };
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
    this.cartService.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(items => { 
      console.log('Items del carrito recibidos:', items);
      this.cartItems = items || []; 
    });
    this.cartService.cartSummary$.pipe(takeUntil(this.destroy$)).subscribe(summary => { 
      console.log('Resumen del carrito recibido:', summary);
      this.cartSummary = summary || { subtotal: 0, igv: 0, total: 0, cantidad_items: 0 }; 
    });
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe(user => { 
      this.isLoggedIn = !!user;
      // Forzar recarga del carrito cuando cambia el estado de autenticación
      if (user) {
        console.log('Usuario autenticado, forzando recarga del carrito');
        this.cartService.forceReloadCart();
      }
    });
  }
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (!item || newQuantity < 1) {
      if (item) {
        this.removeProduct(item.id);
      }
      return;
    }
    this.isUpdating = true;
    this.cartService.updateQuantity(item, newQuantity).subscribe({
      error: (err) => {
        Swal.fire({ 
          title: 'Stock insuficiente', 
          text: `Solo hay ${item.stock_disponible || 0} unidades disponibles`, 
          icon: 'warning', 
          confirmButtonColor: '#dc3545' 
        });
        this.cartService.cartItems$.pipe(take(1)).subscribe((items: CartItem[]) => this.cartItems = items || []);
      },
      complete: () => this.isUpdating = false
    });
  }

  incrementQuantity(item: CartItem): void { 
    if (item && item.cantidad !== undefined) {
      this.updateQuantity(item, item.cantidad + 1); 
    }
  }
  
  decrementQuantity(item: CartItem): void { 
    if (item && item.cantidad !== undefined && item.cantidad > 1) {
      this.updateQuantity(item, item.cantidad - 1); 
    }
  }

  removeProduct(itemId: number): void {
    if (!itemId) return;
    
    const itemToRemove = this.cartItems.find(i => i.id === itemId);
    if (!itemToRemove) return;

    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que quieres eliminar "${itemToRemove.nombre || 'Producto'}" del carrito?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeFromCart(itemToRemove).subscribe(() => {
          Swal.fire({ 
            title: '¡Eliminado!', 
            text: 'El producto ha sido eliminado del carrito.', 
            icon: 'success', 
            timer: 2000, 
            showConfirmButton: false 
          });
        });
      }
    });
  }

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
        this.cartService.clearCart().subscribe(() => {
          Swal.fire({ 
            title: '¡Carrito vaciado!', 
            text: 'Todos los productos han sido eliminados.', 
            icon: 'success', 
            timer: 2000, 
            showConfirmButton: false 
          });
        });
      }
    });
  }

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
    const cuponesValidos: { [key: string]: number } = { 
      'DESCUENTO10': 10, 
      'DESCUENTO20': 20, 
      'BIENVENIDO': 15, 
      'FREE25BAC': 25 
    };
    const descuento = cuponesValidos[this.codigoCupon.toUpperCase()];
    if (descuento) {
      this.descuentoCupon = ((this.cartSummary.total || 0) * descuento) / 100;
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

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      Swal.fire('Carrito vacío', 'Agrega productos al carrito antes de continuar', 'warning');
      return;
    }
    if (!this.isLoggedIn) {
      Swal.fire({ 
        title: 'Inicia sesión', 
        text: 'Debes iniciar sesión para continuar con la compra', 
        icon: 'info', 
        showCancelButton: true, 
        confirmButtonText: 'Iniciar sesión' 
      })
      .then(result => { 
        if (result.isConfirmed) { 
          this.router.navigate(['/account']); 
        } 
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void { 
    this.router.navigate(['/shop']); 
  }
  
  getItemSubtotal(item: CartItem): number { 
    if (!item) return 0;
    const precio = this.ensureNumber(item.precio);
    const cantidad = this.ensureNumber(item.cantidad);
    return precio * cantidad; 
  }
  
  getTotalFinal(): number { 
    const total = this.ensureNumber(this.cartSummary.total);
    const descuento = this.ensureNumber(this.descuentoCupon);
    return total - descuento; 
  }
  
  formatPrice(price: number | undefined | null): string { 
    const safePrice = this.ensureNumber(price);
    return safePrice.toFixed(2); 
  }
  
  onImageError(event: any): void { 
    console.log('Error de imagen:', event.target.src);
    // Usar la imagen SVG placeholder que creamos
    event.target.src = 'assets/images/placeholder.svg';
  }

  // Método para debuggear las imágenes
  debugImageUrl(item: CartItem): void {
    console.log('Item:', item);
    console.log('Imagen URL:', item.imagen_url);
    console.log('Nombre:', item.nombre);
    
    // Probar si la imagen se puede cargar
    if (item.imagen_url) {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Imagen cargada exitosamente:', item.imagen_url);
      };
      img.onerror = () => {
        console.log('❌ Error al cargar imagen:', item.imagen_url);
      };
      img.src = item.imagen_url;
    } else {
      console.log('❌ No hay URL de imagen');
    }
  }

  // Método auxiliar para asegurar que un valor sea un número
  private ensureNumber(value: any): number {
    if (value === undefined || value === null || isNaN(value)) {
      return 0;
    }
    return Number(value);
  }
}