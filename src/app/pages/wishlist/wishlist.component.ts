// src\app\pages\wishlist\wishlist.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil, of, Observable } from 'rxjs';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink, BreadcrumbComponent, ShippingComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: WishlistItem[] = [];
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar si el usuario está logueado
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        if (!this.isLoggedIn) {
          // Si no está logueado, redirigir a login
          this.router.navigate(['/account']);
          return;
        }
      });

    // Suscribirse a los cambios de la wishlist
    this.wishlistService.wishlistItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.wishlistItems = items;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Eliminar producto de la wishlist
  removeFromWishlist(productoId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este producto será eliminado de tu lista de deseos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.wishlistService.removeByProductId(productoId);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado de tu lista de deseos',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Agregar producto al carrito desde la wishlist
  addToCartFromWishlist(item: WishlistItem): void {
    if (item.stock_disponible <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no está disponible actualmente',
        icon: 'warning'
      });
      return;
    }

    const success = this.cartService.addToCart(item, 1);

    if (success) {
      Swal.fire({
        title: '¡Agregado al carrito!',
        text: `${item.nombre} ha sido agregado a tu carrito`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito',
        icon: 'error'
      });
    }
  }

  // Continuar comprando
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  // Formatear precio
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

// Obtener estado del stock
getStockStatus(stock: number | string | null | undefined): string {
  const numStock = typeof stock === 'number' ? stock : parseInt(String(stock || 0));
  
  if (isNaN(numStock) || numStock <= 0) return 'Sin Stock';
  if (numStock > 10) return 'En Stock';
  if (numStock > 0) return 'Pocas unidades';
  return 'Sin Stock';
}

// Obtener clase CSS para el estado del stock
getStockStatusClass(stock: number | string | null | undefined): string {
  const numStock = typeof stock === 'number' ? stock : parseInt(String(stock || 0));
  
  if (isNaN(numStock) || numStock <= 0) return 'text-danger-600';
  if (numStock > 10) return 'text-success-600';
  if (numStock > 0) return 'text-warning-600';
  return 'text-danger-600';
}


  // Obtener cantidad de reviews
  getReviewsCount(item: WishlistItem): number {
    return item.reviews_count || 0;
  }

  // Manejar error de imagen
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-product.jpg';
  }
}
