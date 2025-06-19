// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VentasService } from './ventas.service';

export interface CartItem {
  id: number;
  producto_id: number;
  nombre: string;
  imagen_url: string;
  precio: number;
  cantidad: number;
  stock_disponible: number;
  codigo_producto: string;
  categoria?: string;
  marca?: string;
}

export interface CartSummary {
  subtotal: number;
  igv: number;
  total: number;
  cantidad_items: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'shopping_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    subtotal: 0,
    igv: 0,
    total: 0,
    cantidad_items: 0
  });

  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  constructor(private ventasService?: VentasService) {
    this.loadCartFromStorage();
  }

  // Cargar carrito desde localStorage
  private loadCartFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedCart = localStorage.getItem(this.STORAGE_KEY);
        if (savedCart) {
          const items: CartItem[] = JSON.parse(savedCart);
          this.cartItemsSubject.next(items);
          this.updateCartSummary(items);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  // Guardar carrito en localStorage
  private saveCartToStorage(items: CartItem[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Normalizar producto para el carrito
  private normalizeProduct(producto: any): any {
    return {
      id: producto.id,
      nombre: producto.nombre || producto.name || producto.title,
      precio: producto.precio_venta || producto.precio || producto.price,
      stock: producto.stock || producto.stock_disponible || 100,
      codigo_producto: producto.codigo_producto || producto.code || `PROD-${producto.id}`,
      imagen_url: producto.imagen_url || producto.imagen_principal || producto.image,
      categoria: producto.categoria?.nombre || producto.categoria,
      marca: producto.marca?.nombre || producto.marca
    };
  }

  // Agregar producto al carrito
  addToCart(producto: any, cantidad: number = 1): boolean {
    try {
      const normalizedProduct = this.normalizeProduct(producto);
      const currentItems = this.cartItemsSubject.value;
      const existingItemIndex = currentItems.findIndex(item => item.producto_id === normalizedProduct.id);

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        const existingItem = currentItems[existingItemIndex];
        const nuevaCantidad = existingItem.cantidad + cantidad;
        
        if (nuevaCantidad > normalizedProduct.stock) {
          console.warn('No hay suficiente stock disponible');
          return false;
        }

        currentItems[existingItemIndex] = {
          ...existingItem,
          cantidad: nuevaCantidad
        };
      } else {
        // Si es un producto nuevo, agregarlo
        if (cantidad > normalizedProduct.stock) {
          console.warn('No hay suficiente stock disponible');
          return false;
        }

        const newItem: CartItem = {
          id: Date.now(), // ID temporal único
          producto_id: normalizedProduct.id,
          nombre: normalizedProduct.nombre,
          imagen_url: normalizedProduct.imagen_url,
          precio: normalizedProduct.precio,
          cantidad: cantidad,
          stock_disponible: normalizedProduct.stock,
          codigo_producto: normalizedProduct.codigo_producto,
          categoria: normalizedProduct.categoria,
          marca: normalizedProduct.marca
        };

        currentItems.push(newItem);
      }

      this.cartItemsSubject.next([...currentItems]);
      this.updateCartSummary(currentItems);
      this.saveCartToStorage(currentItems);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  // Actualizar cantidad de un item
  updateQuantity(itemId: number, cantidad: number): boolean {
    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex >= 0) {
      const item = currentItems[itemIndex];
      
      if (cantidad <= 0) {
        this.removeFromCart(itemId);
        return true;
      }

      if (cantidad > item.stock_disponible) {
        console.warn('No hay suficiente stock disponible');
        return false;
      }

      currentItems[itemIndex] = {
        ...item,
        cantidad: cantidad
      };

      this.cartItemsSubject.next([...currentItems]);
      this.updateCartSummary(currentItems);
      this.saveCartToStorage(currentItems);
      return true;
    }

    return false;
  }

  // Remover item del carrito
  removeFromCart(itemId: number): void {
    const currentItems = this.cartItemsSubject.value;
    const filteredItems = currentItems.filter(item => item.id !== itemId);
    
    this.cartItemsSubject.next(filteredItems);
    this.updateCartSummary(filteredItems);
    this.saveCartToStorage(filteredItems);
  }

  // Limpiar carrito completo
  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.updateCartSummary([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Actualizar resumen del carrito
  private updateCartSummary(items: CartItem[]): void {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.precio * item.cantidad);
    }, 0);

    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    const cantidad_items = items.reduce((sum, item) => sum + item.cantidad, 0);

    this.cartSummarySubject.next({
      subtotal,
      igv,
      total,
      cantidad_items
    });
  }

  // Obtener cantidad total de items
  getTotalItems(): number {
    return this.cartSummarySubject.value.cantidad_items;
  }

  // Verificar si el carrito está vacío
  isEmpty(): boolean {
    return this.cartItemsSubject.value.length === 0;
  }

  // Obtener items actuales del carrito
  getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Obtener resumen actual del carrito
  getCurrentSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  // Procesar compra (crear venta) - solo si VentasService está disponible
  procesarCompra(datosCompra: {
    metodo_pago: string;
    requiere_factura?: boolean;
    observaciones?: string;
  }): Observable<any> {
    const items = this.cartItemsSubject.value;
    
    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    if (!this.ventasService) {
      throw new Error('VentasService no está disponible');
    }

    const productos = items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad
    }));

    const ventaData = {
      productos,
      metodo_pago: datosCompra.metodo_pago,
      requiere_factura: datosCompra.requiere_factura || false,
      observaciones: datosCompra.observaciones || ''
    };

    return this.ventasService.crearVentaEcommerce(ventaData);
  }
}