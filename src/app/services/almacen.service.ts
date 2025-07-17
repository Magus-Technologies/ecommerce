// src\app\services\almacen.service.ts
import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, map } from "rxjs"
import { environment } from "../../environments/environment"
import {
  Categoria,
  CategoriaCreate,
  MarcaProducto,
  MarcaProductoCreate,
  Producto,
  ProductoCreate,
  ProductoPublico,
  ProductosPublicosResponse,
  CategoriaParaSidebar,
  Seccion,
  SeccionCreate
} from '../types/almacen.types';

@Injectable({
  providedIn: "root",
})
export class AlmacenService {
  private apiUrl = `${environment.apiUrl}`
  private baseUrl = environment.apiUrl.replace("/api", "")

  constructor(private http: HttpClient) {}

  // ==================== MÉTODOS PARA CATEGORÍAS ====================
  obtenerCategorias(seccionId?: number | null): Observable<Categoria[]> {
    let params = new HttpParams();
    if (seccionId !== null && seccionId !== undefined && seccionId !== 0) {
      params = params.set('seccion', seccionId.toString());
    }
    // console.log('Llamando API categorías con params:', params.toString());
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`, { params });
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}`).pipe(
      map((categoria) => ({
        ...categoria,
        imagen_url: categoria.imagen ? `${this.baseUrl}/storage/categorias/${categoria.imagen}` : undefined,
      })),
    )
  }

  crearCategoria(categoria: CategoriaCreate): Observable<any> {
    const formData = new FormData()

    formData.append("nombre", categoria.nombre)
    formData.append("id_seccion", categoria.id_seccion.toString())
    formData.append("activo", categoria.activo ? "1" : "0")

    if (categoria.descripcion) {
      formData.append("descripcion", categoria.descripcion)
    }

    if (categoria.imagen) {
      formData.append("imagen", categoria.imagen)
    }

    return this.http.post<any>(`${this.apiUrl}/categorias`, formData)
  }

  actualizarCategoria(id: number, categoria: Partial<CategoriaCreate>): Observable<any> {
    const formData = new FormData()

    Object.keys(categoria).forEach((key) => {
      const value = (categoria as any)[key]
      if (value !== null && value !== undefined) {
        if (key === "imagen" && value instanceof File) {
          formData.append(key, value)
        } else if (key === "activo") {
          formData.append(key, value ? "1" : "0")
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    formData.append("_method", "PUT")
    return this.http.post<any>(`${this.apiUrl}/categorias/${id}`, formData)
  }

  toggleEstadoCategoria(id: number, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/categorias/${id}/toggle-estado`, { activo })
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categorias/${id}`)
  }

  obtenerCategoriasParaSidebar(): Observable<CategoriaParaSidebar[]> {
    return this.http.get<CategoriaParaSidebar[]>(`${this.apiUrl}/categorias-sidebar`)
  }

  // ==================== MÉTODOS PARA MARCAS ====================

  obtenerMarcas(seccionId?: number | null): Observable<MarcaProducto[]> {
    let params = new HttpParams();
    if (seccionId !== null && seccionId !== undefined && seccionId !== 0) {
      params = params.set('seccion', seccionId.toString());
    }
    console.log('Llamando API marcas con params:', params.toString());
    return this.http.get<MarcaProducto[]>(`${this.apiUrl}/marcas`, { params });
  }

  obtenerMarca(id: number): Observable<MarcaProducto> {
    return this.http.get<MarcaProducto>(`${this.apiUrl}/marcas/${id}`).pipe(
      map((marca) => ({
        ...marca,
        imagen_url: marca.imagen ? `${this.baseUrl}/storage/marcas_productos/${marca.imagen}` : undefined,
      })),
    )
  }

  crearMarca(marca: MarcaProductoCreate): Observable<any> {
    const formData = new FormData()

    formData.append("nombre", marca.nombre)
    formData.append("activo", marca.activo ? "1" : "0")

    if (marca.descripcion) {
      formData.append("descripcion", marca.descripcion)
    }

    if (marca.imagen) {
      formData.append("imagen", marca.imagen)
    }

    return this.http.post<any>(`${this.apiUrl}/marcas`, formData)
  }

  actualizarMarca(id: number, marca: Partial<MarcaProductoCreate>): Observable<any> {
    const formData = new FormData()

    Object.keys(marca).forEach((key) => {
      const value = (marca as any)[key]
      if (value !== null && value !== undefined) {
        if (key === "imagen" && value instanceof File) {
          formData.append(key, value)
        } else if (key === "activo") {
          formData.append(key, value ? "1" : "0")
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    formData.append("_method", "PUT")
    return this.http.post<any>(`${this.apiUrl}/marcas/${id}`, formData)
  }

  toggleEstadoMarca(id: number, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/marcas/${id}/toggle-estado`, { activo })
  }

  eliminarMarca(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/marcas/${id}`)
  }

  obtenerMarcasActivas(): Observable<MarcaProducto[]> {
    return this.http.get<MarcaProducto[]>(`${this.apiUrl}/marcas/activas`).pipe(
      map((marcas) =>
        marcas.map((marca) => ({
          ...marca,
          imagen_url: marca.imagen ? `${this.baseUrl}/storage/marcas_productos/${marca.imagen}` : undefined,
        })),
      ),
    )
  }

  // ==================== MÉTODOS PARA PRODUCTOS ====================

  obtenerProductos(seccionId?: number | null): Observable<Producto[]> {
    let params = new HttpParams();
    if (seccionId !== null && seccionId !== undefined && seccionId !== 0) {
      params = params.set('seccion', seccionId.toString());
    }
    console.log('Llamando API productos con params:', params.toString());
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`, { params }).pipe(
      map(productos => productos.map(producto => ({
        ...producto,
        imagen_url: producto.imagen ? `${this.baseUrl}/storage/productos/${producto.imagen}` : undefined
      })))
    );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`).pipe(
      map((producto) => ({
        ...producto,
        imagen_url: producto.imagen ? `${this.baseUrl}/storage/productos/${producto.imagen}` : undefined,
      })),
    )
  }

  crearProducto(producto: ProductoCreate): Observable<any> {
    const formData = new FormData()

    formData.append("nombre", producto.nombre)
    formData.append("codigo_producto", producto.codigo_producto)
    formData.append("categoria_id", producto.categoria_id.toString())
    formData.append("precio_compra", producto.precio_compra.toString())
    formData.append("precio_venta", producto.precio_venta.toString())
    formData.append("stock", producto.stock.toString())
    formData.append("stock_minimo", producto.stock_minimo.toString())
    formData.append("activo", producto.activo ? "1" : "0")

    if (producto.descripcion) {
      formData.append("descripcion", producto.descripcion)
    }

    if (producto.marca_id) {
      formData.append("marca_id", producto.marca_id.toString())
    }

    if (producto.imagen) {
      formData.append("imagen", producto.imagen)
    }

    return this.http.post<any>(`${this.apiUrl}/productos`, formData)
  }

  actualizarProducto(id: number, producto: Partial<ProductoCreate>): Observable<any> {
    const formData = new FormData()

    Object.keys(producto).forEach((key) => {
      const value = (producto as any)[key]
      if (value !== null && value !== undefined) {
        if (key === "imagen" && value instanceof File) {
          formData.append(key, value)
        } else if (key === "activo") {
          formData.append(key, value ? "1" : "0")
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    formData.append("_method", "PUT")
    return this.http.post<any>(`${this.apiUrl}/productos/${id}`, formData)
  }

  toggleEstadoProducto(id: number, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/productos/${id}/toggle-estado`, { activo })
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`)
  }

  obtenerProductosPublicos(filtros?: {
    categoria?: number
    marca?: number
    search?: string
    page?: number
  }): Observable<ProductosPublicosResponse> {
    let params = new HttpParams()

    if (filtros?.categoria) {
      params = params.set("categoria", filtros.categoria.toString())
    }
    if (filtros?.marca) {
      params = params.set("marca", filtros.marca.toString())
    }
    if (filtros?.search) {
      params = params.set("search", filtros.search)
    }
    if (filtros?.page) {
      params = params.set("page", filtros.page.toString())
    }

    return this.http.get<ProductosPublicosResponse>(`${this.apiUrl}/productos-publicos`, { params })
  }

  obtenerMarcasPublicas(): Observable<MarcaProducto[]> {
    return this.http.get<MarcaProducto[]>(`${this.apiUrl}/marcas/publicas`).pipe(
      map((marcas) =>
        marcas.map((marca) => ({
          ...marca,
          imagen_url: marca.imagen ? `${this.baseUrl}/storage/marcas_productos/${marca.imagen}` : undefined,
        })),
      ),
    )
  }

  // ✅ NUEVO: Obtener producto público individual con detalles
  obtenerProductoPublico(id: number): Observable<{
    producto: any;
    detalles: any;
    productos_relacionados: any[];
  }> {
    return this.http.get<{
      producto: any;
      detalles: any;
      productos_relacionados: any[];
    }>(`${this.apiUrl}/productos-publicos/${id}`);
  }

  // Métodos para secciones
  obtenerSecciones(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.apiUrl}/secciones`);
  }

  crearSeccion(seccion: SeccionCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/secciones`, seccion);
  }

  actualizarSeccion(id: number, seccion: SeccionCreate): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/secciones/${id}`, seccion);
  }

  eliminarSeccion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/secciones/${id}`);
  }

  migrarCategoria(categoriaId: number, nuevaSeccionId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/categorias/${categoriaId}/migrar-seccion`, {
      nueva_seccion_id: nuevaSeccionId
    });
  }



  validarCupon(codigo: string, total: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cupones/validar`, { codigo, total });
  }

  // ✅ NUEVO MÉTODO: Obtener productos recomendados
  obtenerProductosRecomendados(limite: number = 12): Observable<ProductoPublico[]> {
    let params = new HttpParams();
    params = params.set('limite', limite.toString());
    params = params.set('recomendados', 'true'); // Flag para indicar que queremos productos recomendados
    
    return this.http.get<ProductosPublicosResponse>(`${this.apiUrl}/productos-publicos`, { params })
      .pipe(
        map(response => response.productos)
      );
  }
   
  obtenerDetallesProducto(productoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/productos/${productoId}/detalles`);
  }

  guardarDetallesProducto(productoId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos/${productoId}/detalles`, formData);
  }

  eliminarImagenDetalle(productoId: number, imagenIndex: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${productoId}/detalles/imagenes`, {
      body: { imagen_index: imagenIndex }
    });
  }
}