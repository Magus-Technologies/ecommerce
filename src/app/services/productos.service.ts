// src/app/services/productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo_producto: string;
  categoria_id: number;
  categoria?: Categoria;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  imagen?: string;
  imagen_url?: string; // Agregado para la URL de la imagen
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  codigo_producto: string;
  categoria_id: number;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  imagen?: File;
  activo: boolean;
}
export interface ProductoPublico {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_oferta?: number;
  stock: number;
  imagen_principal: string;
  categoria: string;
  categoria_id: number;
  rating: number;
  total_reviews: string;
  reviews_count: number;
  sold_count: number;
  total_stock: number;
  is_on_sale: boolean;
  discount_percentage: number;
}
export interface ProductosPublicosResponse {
  productos: ProductoPublico[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CategoriaParaSidebar {
  id: number;
  nombre: string;
  productos_count: number;
}

export interface EstadisticasProductos {
  total_productos: number;
}

export interface ProductoStockCritico {
  id: number;
  nombre: string;
  stock: number;
  stock_minimo: number;
  categoria_id: number;
  categoria?: Categoria;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}`;
  private baseUrl = environment.apiUrl.replace('/api', ''); // http://localhost:8000 en environment 

  constructor(private http: HttpClient) {}

  // Productos
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`).pipe(
      map(productos => productos.map(producto => ({
        ...producto,
        imagen_url: producto.imagen ? `${this.baseUrl}/storage/productos/${producto.imagen}` : undefined
      })))
    );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`).pipe(
      map(producto => ({
        ...producto,
        imagen_url: producto.imagen ? `${this.baseUrl}/storage/productos/${producto.imagen}` : undefined
      }))
    );
  }

  crearProducto(producto: ProductoCreate): Observable<any> {
    const formData = new FormData();
    
    formData.append('nombre', producto.nombre);
    formData.append('codigo_producto', producto.codigo_producto);
    formData.append('categoria_id', producto.categoria_id.toString());
    formData.append('precio_compra', producto.precio_compra.toString());
    formData.append('precio_venta', producto.precio_venta.toString());
    formData.append('stock', producto.stock.toString());
    formData.append('stock_minimo', producto.stock_minimo.toString());
    formData.append('activo', producto.activo ? '1' : '0');
    
    if (producto.descripcion) {
      formData.append('descripcion', producto.descripcion);
    }
    
    if (producto.imagen) {
      formData.append('imagen', producto.imagen);
    }

    return this.http.post<any>(`${this.apiUrl}/productos`, formData);
  }

  actualizarProducto(id: number, producto: Partial<ProductoCreate>): Observable<any> {
    const formData = new FormData();
    
    Object.keys(producto).forEach(key => {
      const value = (producto as any)[key];
      if (value !== null && value !== undefined) {

        // añadir lógica para manejar tipos específicos
        if (key === 'activo') {
          formData.append(key, value.toString()); //envia un boolean
        } else if (key === 'imagen' && value instanceof File) {
          formData.append(key, value);
        }else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/productos/${id}`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`);
  }

  // Categorías
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categorias`, categoria);
  }
  obtenerProductosPublicos(filtros?: {
    categoria?: number;
    search?: string;
    page?: number;
  }): Observable<ProductosPublicosResponse> {
    let params = new HttpParams();
    
    if (filtros?.categoria) {
      params = params.set('categoria', filtros.categoria.toString());
    }
    if (filtros?.search) {
      params = params.set('search', filtros.search);
    }
    if (filtros?.page) {
      params = params.set('page', filtros.page.toString());
    }

    return this.http.get<ProductosPublicosResponse>(`${this.apiUrl}/productos-publicos`, { params });
  }

  obtenerCategoriasParaSidebar(): Observable<CategoriaParaSidebar[]> {
    return this.http.get<CategoriaParaSidebar[]>(`${this.apiUrl}/categorias-sidebar`);
  }

  obtenerEstadisticasProductos(): Observable<EstadisticasProductos> {
    return this.http.get<EstadisticasProductos>(`${this.apiUrl}/productos/estadisticas`);
  }

  obtenerProductosStockCritico(): Observable<ProductoStockCritico[]> {
    return this.http.get<ProductoStockCritico[]>(`${this.apiUrl}/productos/stock-critico`);
  }
}