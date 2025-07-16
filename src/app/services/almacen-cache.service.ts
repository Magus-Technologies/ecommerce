import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AlmacenService, Producto, Categoria, MarcaProducto } from './almacen.service';

interface CacheData<T> {
  data: T[];
  timestamp: number;
  seccionId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AlmacenCacheService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
  
  // Cache para productos
  private productosCache = new Map<string, CacheData<Producto>>();
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();
  
  // Cache para categorías
  private categoriasCache = new Map<string, CacheData<Categoria>>();
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);
  public categorias$ = this.categoriasSubject.asObservable();
  
  // Cache para marcas
  private marcasCache = new Map<string, CacheData<MarcaProducto>>();
  private marcasSubject = new BehaviorSubject<MarcaProducto[]>([]);
  public marcas$ = this.marcasSubject.asObservable();
  
  // Estados de carga
  private loadingStates = {
    productos: new BehaviorSubject<boolean>(false),
    categorias: new BehaviorSubject<boolean>(false),
    marcas: new BehaviorSubject<boolean>(false)
  };
  
  public productosLoading$ = this.loadingStates.productos.asObservable();
  public categoriasLoading$ = this.loadingStates.categorias.asObservable();
  public marcasLoading$ = this.loadingStates.marcas.asObservable();

  constructor(private almacenService: AlmacenService) {}

  private getCacheKey(seccionId: number | null): string {
    return seccionId ? `seccion_${seccionId}` : 'todas_secciones';
  }

  private isCacheValid<T>(cache: CacheData<T>): boolean {
    const now = Date.now();
    return (now - cache.timestamp) < this.CACHE_DURATION;
  }

  // PRODUCTOS
  obtenerProductos(seccionId?: number): Observable<Producto[]> {
    const cacheKey = this.getCacheKey(seccionId || null);
    const cachedData = this.productosCache.get(cacheKey);
    
    // Si hay datos en caché y son válidos, devolverlos
    if (cachedData && this.isCacheValid(cachedData)) {
      console.log('📦 Productos obtenidos desde caché:', cacheKey);
      this.productosSubject.next(cachedData.data);
      return of(cachedData.data);
    }
    
    // Si no hay caché válido, hacer petición al servidor
    console.log('🌐 Cargando productos desde servidor:', cacheKey);
    this.loadingStates.productos.next(true);
    
    return this.almacenService.obtenerProductos(seccionId).pipe(
      tap(productos => {
        // Guardar en caché
        this.productosCache.set(cacheKey, {
          data: productos,
          timestamp: Date.now(),
          seccionId: seccionId || null
        });
        
        this.productosSubject.next(productos);
        this.loadingStates.productos.next(false);
      })
    );
  }

  // CATEGORÍAS
  obtenerCategorias(seccionId?: number): Observable<Categoria[]> {
    const cacheKey = this.getCacheKey(seccionId || null);
    const cachedData = this.categoriasCache.get(cacheKey);
    
    if (cachedData && this.isCacheValid(cachedData)) {
      console.log('📁 Categorías obtenidas desde caché:', cacheKey);
      this.categoriasSubject.next(cachedData.data);
      return of(cachedData.data);
    }
    
    console.log('🌐 Cargando categorías desde servidor:', cacheKey);
    this.loadingStates.categorias.next(true);
    
    return this.almacenService.obtenerCategorias(seccionId).pipe(
      tap(categorias => {
        this.categoriasCache.set(cacheKey, {
          data: categorias,
          timestamp: Date.now(),
          seccionId: seccionId || null
        });
        
        this.categoriasSubject.next(categorias);
        this.loadingStates.categorias.next(false);
      })
    );
  }

  // MARCAS
  obtenerMarcas(seccionId?: number): Observable<MarcaProducto[]> {
    const cacheKey = this.getCacheKey(seccionId || null);
    const cachedData = this.marcasCache.get(cacheKey);
    
    if (cachedData && this.isCacheValid(cachedData)) {
      console.log('🏷️ Marcas obtenidas desde caché:', cacheKey);
      this.marcasSubject.next(cachedData.data);
      return of(cachedData.data);
    }
    
    console.log('🌐 Cargando marcas desde servidor:', cacheKey);
    this.loadingStates.marcas.next(true);
    
    return this.almacenService.obtenerMarcas(seccionId).pipe(
      tap(marcas => {
        this.marcasCache.set(cacheKey, {
          data: marcas,
          timestamp: Date.now(),
          seccionId: seccionId || null
        });
        
        this.marcasSubject.next(marcas);
        this.loadingStates.marcas.next(false);
      })
    );
  }

  // MÉTODOS PARA INVALIDAR CACHÉ
  invalidarCacheProductos(seccionId?: number): void {
    if (seccionId) {
      this.productosCache.delete(this.getCacheKey(seccionId));
    } else {
      // Invalidar todo el caché de productos
      this.productosCache.clear();
    }
    console.log('🗑️ Caché de productos invalidado');
  }

  invalidarCacheCategorias(seccionId?: number): void {
    if (seccionId) {
      this.categoriasCache.delete(this.getCacheKey(seccionId));
    } else {
      this.categoriasCache.clear();
    }
    console.log('🗑️ Caché de categorías invalidado');
  }

  invalidarCacheMarcas(seccionId?: number): void {
    if (seccionId) {
      this.marcasCache.delete(this.getCacheKey(seccionId));
    } else {
      this.marcasCache.clear();
    }
    console.log('🗑️ Caché de marcas invalidado');
  }

  // Invalidar todo el caché
  invalidarTodoElCache(): void {
    this.productosCache.clear();
    this.categoriasCache.clear();
    this.marcasCache.clear();
    console.log('🗑️ Todo el caché ha sido invalidado');
  }

  // Método para forzar recarga
  forzarRecarga(tipo: 'productos' | 'categorias' | 'marcas', seccionId?: number): void {
    switch (tipo) {
      case 'productos':
        this.invalidarCacheProductos(seccionId);
        this.obtenerProductos(seccionId).subscribe();
        break;
      case 'categorias':
        this.invalidarCacheCategorias(seccionId);
        this.obtenerCategorias(seccionId).subscribe();
        break;
      case 'marcas':
        this.invalidarCacheMarcas(seccionId);
        this.obtenerMarcas(seccionId).subscribe();
        break;
    }
  }

  // Obtener datos actuales sin hacer petición
  obtenerProductosActuales(): Producto[] {
    return this.productosSubject.value;
  }

  obtenerCategoriasActuales(): Categoria[] {
    return this.categoriasSubject.value;
  }

  obtenerMarcasActuales(): MarcaProducto[] {
    return this.marcasSubject.value;
  }
}