import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensasService } from '../../../../services/recompensas.service';
import { ProductosService } from '../../../../services/productos.service';
import { CategoriasService } from '../../../../services/categorias.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { 
  ProductoAsignado, 
  ProductoInfo, 
  CategoriaInfo, 
  FiltrosProducto, 
  FiltrosCategoria 
} from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-productos-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5><i class="fas fa-shopping-cart me-2"></i>Paso 3: Productos y Categorías</h5>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <!-- Productos Específicos -->
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h6><i class="fas fa-box me-2"></i>Productos Específicos</h6>
                <div class="mb-3">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar productos..."
                    [(ngModel)]="filtroProductos.buscar"
                    (input)="onProductosSearchChange($event)"
                  >
                </div>
                <div class="product-list" style="max-height: 300px; overflow-y: auto;">
                  <div *ngIf="productosDisponibles.length === 0 && !cargandoProductos" class="text-center text-muted py-3">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>Busca productos para agregar</p>
                  </div>
                  <div *ngIf="cargandoProductos" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                  <div *ngFor="let producto of productosDisponibles" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      [id]="'prod-' + producto.id"
                      [checked]="productoSeleccionado(producto.id)"
                      (change)="toggleProducto(producto)"
                    >
                    <label class="form-check-label" [for]="'prod-' + producto.id">
                      {{ producto.nombre }} - S/{{ producto.precio_venta | number:'1.2-2' }}
                      <small class="text-muted d-block">{{ producto.codigo_producto }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Categorías -->
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h6><i class="fas fa-tags me-2"></i>Categorías</h6>
                <div class="mb-3">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar categorías..."
                    [(ngModel)]="filtroCategorias.buscar"
                    (input)="onCategoriasSearchChange($event)"
                  >
                </div>
                <div class="category-list" style="max-height: 300px; overflow-y: auto;">
                  <div *ngIf="categoriasDisponibles.length === 0 && !cargandoCategorias" class="text-center text-muted py-3">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>Busca categorías para agregar</p>
                  </div>
                  <div *ngIf="cargandoCategorias" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                  <div *ngFor="let categoria of categoriasDisponibles" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      [id]="'cat-' + categoria.id"
                      [checked]="categoriaSeleccionada(categoria.id)"
                      (change)="toggleCategoria(categoria)"
                    >
                    <label class="form-check-label" [for]="'cat-' + categoria.id">
                      {{ categoria.nombre }} ({{ categoria.productos_count }} productos)
                      <small *ngIf="categoria.descripcion" class="text-muted d-block">{{ categoria.descripcion }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos y Categorías Seleccionados -->
        <div class="card">
          <div class="card-body">
            <h6>Productos y Categorías Seleccionados</h6>
            
            <!-- Alerta informativa -->
            <div *ngIf="productosSeleccionados.length === 0 && categoriasSeleccionadas.length === 0" 
                 class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              No has seleccionado productos ni categorías. La recompensa se aplicará a todos los productos.
            </div>

            <!-- Lista de productos seleccionados -->
            <div *ngIf="productosSeleccionados.length > 0" class="mb-3">
              <h6 class="text-primary">
                <i class="fas fa-box me-2"></i>Productos Específicos ({{ productosSeleccionados.length }})
              </h6>
              <div class="row">
                <div *ngFor="let producto of productosSeleccionados" class="col-md-6 mb-2">
                  <div class="card card-body py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ producto.nombre }}</strong>
                        <small class="text-muted d-block">{{ producto.codigo_producto }}</small>
                      </div>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        (click)="removerProducto(producto.id)"
                        title="Remover producto"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de categorías seleccionadas -->
            <div *ngIf="categoriasSeleccionadas.length > 0" class="mb-3">
              <h6 class="text-success">
                <i class="fas fa-tags me-2"></i>Categorías ({{ categoriasSeleccionadas.length }})
              </h6>
              <div class="row">
                <div *ngFor="let categoria of categoriasSeleccionadas" class="col-md-6 mb-2">
                  <div class="card card-body py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ categoria.nombre }}</strong>
                        <small class="text-muted d-block">{{ categoria.productos_count }} productos</small>
                      </div>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        (click)="removerCategoria(categoria.id)"
                        title="Remover categoría"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen total -->
            <div *ngIf="productosSeleccionados.length > 0 || categoriasSeleccionadas.length > 0" 
                 class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              <strong>Total de productos aplicables:</strong> {{ totalProductosAplicables }}
              <small class="d-block text-muted">
                {{ productosSeleccionados.length }} productos específicos + 
                {{ totalProductosEnCategorias }} productos de categorías
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list, .category-list {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 0.5rem;
    }
    
    .form-check {
      padding: 0.5rem;
      border-bottom: 1px solid #f8f9fa;
    }
    
    .form-check:last-child {
      border-bottom: none;
    }
    
    .form-check:hover {
      background-color: #f8f9fa;
    }
    
    .card-body .card {
      border: 1px solid #e9ecef;
    }
  `]
})
export class RecompensasProductosCategoriasComponent implements OnInit {
  @Input() recompensaId?: number;
  @Output() productosCategoriasChange = new EventEmitter<{
    productos: ProductoInfo[];
    categorias: CategoriaInfo[];
  }>();

  // Productos disponibles
  productosDisponibles: ProductoInfo[] = [];
  categoriasDisponibles: CategoriaInfo[] = [];
  
  // Productos y categorías seleccionados
  productosSeleccionados: ProductoInfo[] = [];
  categoriasSeleccionadas: CategoriaInfo[] = [];
  
  // Filtros
  filtroProductos: FiltrosProducto = {
    buscar: '',
    limite: 20,
    solo_activos: true
  };
  
  filtroCategorias: FiltrosCategoria = {
    buscar: '',
    limite: 20,
    solo_activas: true
  };
  
  // Estados de carga
  cargandoProductos = false;
  cargandoCategorias = false;

  // Subjects para debounce
  private productosSearchSubject = new Subject<string>();
  private categoriasSearchSubject = new Subject<string>();

  constructor(
    private recompensasService: RecompensasService,
    private productosService: ProductosService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    // Configurar debounce para búsquedas
    this.productosSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filtroProductos.buscar = searchTerm;
        this.buscarProductos();
      });

    this.categoriasSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filtroCategorias.buscar = searchTerm;
        this.buscarCategorias();
      });

    // Cargar productos y categorías reales al inicio
    this.cargarDatosIniciales();
  }

  // Cargar datos iniciales
  private cargarDatosIniciales(): void {
    // Cargar productos y categorías reales desde la API
    this.cargarProductosReales();
    this.cargarCategoriasReales();
  }

  // Métodos para manejar la búsqueda
  onProductosSearchChange(event: any): void {
    const searchTerm = event.target.value;
    this.productosSearchSubject.next(searchTerm);
  }

  onCategoriasSearchChange(event: any): void {
    const searchTerm = event.target.value;
    this.categoriasSearchSubject.next(searchTerm);
  }

  // Búsqueda de productos
  buscarProductos(): void {
    const searchTerm = this.filtroProductos.buscar.trim();
    
    if (searchTerm.length < 2) {
      // Si no hay término de búsqueda, cargar productos reales
      this.cargarProductosReales();
      return;
    }

    this.cargandoProductos = true;
    this.recompensasService.buscarProductos({
      buscar: searchTerm,
      limite: 50
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.productosDisponibles = response.data || [];
        } else {
          console.warn('Endpoint de recompensas no disponible, usando servicio alternativo');
          this.buscarProductosAlternativo(searchTerm);
        }
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.warn('Error con endpoint de recompensas, usando servicio alternativo:', error);
        this.buscarProductosAlternativo(searchTerm);
      }
    });
  }

  // Cargar productos de prueba
  private cargarProductosPrueba(): void {
    this.productosDisponibles = [
      {
        id: 1,
        nombre: 'Laptop Gaming ASUS ROG',
        codigo_producto: 'LAP-ASUS-001',
        precio_venta: 2500.00,
        stock: 25,
        activo: true,
        categoria: {
          id: 5,
          nombre: 'Electrónicos'
        }
      },
      {
        id: 2,
        nombre: 'Mouse Gaming Razer',
        codigo_producto: 'MOU-RAZER-001',
        precio_venta: 89.99,
        stock: 50,
        activo: true,
        categoria: {
          id: 6,
          nombre: 'Accesorios'
        }
      },
      {
        id: 3,
        nombre: 'Teclado Mecánico Corsair',
        codigo_producto: 'TEC-CORS-001',
        precio_venta: 149.99,
        stock: 30,
        activo: true,
        categoria: {
          id: 6,
          nombre: 'Accesorios'
        }
      },
      {
        id: 4,
        nombre: 'Monitor Samsung 24"',
        codigo_producto: 'MON-SAM-001',
        precio_venta: 299.99,
        stock: 15,
        activo: true,
        categoria: {
          id: 5,
          nombre: 'Electrónicos'
        }
      },
      {
        id: 5,
        nombre: 'Auriculares Sony WH-1000XM4',
        codigo_producto: 'AUR-SON-001',
        precio_venta: 399.99,
        stock: 20,
        activo: true,
        categoria: {
          id: 6,
          nombre: 'Accesorios'
        }
      }
    ];
  }

  // Filtrar productos de prueba por término de búsqueda
  private filtrarProductosPrueba(searchTerm: string): void {
    this.cargarProductosPrueba();
    this.productosDisponibles = this.productosDisponibles.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.categoria && producto.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Búsqueda de categorías
  buscarCategorias(): void {
    const searchTerm = this.filtroCategorias.buscar?.trim() || '';
    
    if (searchTerm.length < 2) {
      // Si no hay término de búsqueda, cargar categorías reales
      this.cargarCategoriasReales();
      return;
    }

    this.cargandoCategorias = true;
    this.recompensasService.buscarCategorias({
      buscar: searchTerm,
      limite: 50
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.categoriasDisponibles = response.data || [];
        } else {
          console.warn('Endpoint de recompensas no disponible, usando servicio alternativo');
          this.buscarCategoriasAlternativo(searchTerm);
        }
        this.cargandoCategorias = false;
      },
      error: (error) => {
        console.warn('Error con endpoint de recompensas, usando servicio alternativo:', error);
        this.buscarCategoriasAlternativo(searchTerm);
      }
    });
  }

  // Cargar categorías de prueba
  private cargarCategoriasPrueba(): void {
    this.categoriasDisponibles = [
      {
        id: 5,
        nombre: 'Electrónicos',
        descripcion: 'Dispositivos electrónicos y tecnología',
        activo: true,
        productos_count: 45
      },
      {
        id: 6,
        nombre: 'Accesorios',
        descripcion: 'Accesorios para computadoras y gaming',
        activo: true,
        productos_count: 78
      },
      {
        id: 7,
        nombre: 'Componentes',
        descripcion: 'Componentes internos para PC',
        activo: true,
        productos_count: 32
      },
      {
        id: 8,
        nombre: 'Gaming',
        descripcion: 'Productos especializados para gaming',
        activo: true,
        productos_count: 25
      },
      {
        id: 9,
        nombre: 'Oficina',
        descripcion: 'Productos para oficina y trabajo',
        activo: true,
        productos_count: 18
      }
    ];
  }

  // Filtrar categorías de prueba por término de búsqueda
  private filtrarCategoriasPrueba(searchTerm: string): void {
    this.cargarCategoriasPrueba();
    this.categoriasDisponibles = this.categoriasDisponibles.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Cargar productos reales desde la API
  private cargarProductosReales(): void {
    this.cargandoProductos = true;
    
    // Intentar primero con el endpoint de recompensas
    this.recompensasService.buscarProductos({
      buscar: '',
      limite: 50
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.productosDisponibles = response.data || [];
        } else {
          console.warn('Endpoint de recompensas no disponible, usando servicio alternativo');
          this.cargarProductosAlternativo();
        }
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.warn('Error con endpoint de recompensas, usando servicio alternativo:', error);
        this.cargarProductosAlternativo();
      }
    });
  }

  // Fallback: cargar productos usando el servicio alternativo
  private cargarProductosAlternativo(): void {
    this.productosService.obtenerProductos().subscribe({
      next: (productos) => {
        // Convertir los productos del servicio a la estructura esperada
        this.productosDisponibles = productos.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          codigo_producto: producto.codigo_producto || `PROD-${producto.id}`,
          precio_venta: producto.precio_venta || 0,
          stock: producto.stock || 0,
          activo: producto.activo,
          categoria: producto.categoria ? {
            id: producto.categoria.id,
            nombre: producto.categoria.nombre
          } : undefined
        }));
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error cargando productos con servicio alternativo:', error);
        this.productosDisponibles = [];
        this.cargandoProductos = false;
      }
    });
  }

  // Fallback: buscar productos usando el servicio alternativo
  private buscarProductosAlternativo(searchTerm: string): void {
    this.productosService.obtenerProductos().subscribe({
      next: (productos) => {
        // Filtrar productos por término de búsqueda
        const productosFiltrados = productos.filter(producto =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.codigo_producto && producto.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (producto.categoria && producto.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        // Convertir a la estructura esperada
        this.productosDisponibles = productosFiltrados.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          codigo_producto: producto.codigo_producto || `PROD-${producto.id}`,
          precio_venta: producto.precio_venta || 0,
          stock: producto.stock || 0,
          activo: producto.activo,
          categoria: producto.categoria ? {
            id: producto.categoria.id,
            nombre: producto.categoria.nombre
          } : undefined
        }));
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error buscando productos con servicio alternativo:', error);
        this.productosDisponibles = [];
        this.cargandoProductos = false;
      }
    });
  }

  // Cargar categorías reales desde la API
  private cargarCategoriasReales(): void {
    this.cargandoCategorias = true;
    
    // Intentar primero con el endpoint de recompensas
    this.recompensasService.buscarCategorias({
      buscar: '',
      limite: 50
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.categoriasDisponibles = response.data || [];
        } else {
          console.warn('Endpoint de recompensas no disponible, usando servicio alternativo');
          this.cargarCategoriasAlternativo();
        }
        this.cargandoCategorias = false;
      },
      error: (error) => {
        console.warn('Error con endpoint de recompensas, usando servicio alternativo:', error);
        this.cargarCategoriasAlternativo();
      }
    });
  }

  // Fallback: cargar categorías usando el servicio alternativo
  private cargarCategoriasAlternativo(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Convertir las categorías del servicio a la estructura esperada
        this.categoriasDisponibles = categorias.map(categoria => ({
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          productos_count: 0 // Este valor se puede calcular después si es necesario
        }));
        this.cargandoCategorias = false;
      },
      error: (error) => {
        console.error('Error cargando categorías con servicio alternativo:', error);
        this.categoriasDisponibles = [];
        this.cargandoCategorias = false;
      }
    });
  }

  // Fallback: buscar categorías usando el servicio alternativo
  private buscarCategoriasAlternativo(searchTerm: string): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Filtrar categorías por término de búsqueda
        const categoriasFiltradas = categorias.filter(categoria =>
          categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        // Convertir a la estructura esperada
        this.categoriasDisponibles = categoriasFiltradas.map(categoria => ({
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          productos_count: 0 // Este valor se puede calcular después si es necesario
        }));
        this.cargandoCategorias = false;
      },
      error: (error) => {
        console.error('Error buscando categorías con servicio alternativo:', error);
        this.categoriasDisponibles = [];
        this.cargandoCategorias = false;
      }
    });
  }

  // Verificar si un producto está seleccionado
  productoSeleccionado(productoId: number): boolean {
    return this.productosSeleccionados.some(p => p.id === productoId);
  }

  // Verificar si una categoría está seleccionada
  categoriaSeleccionada(categoriaId: number): boolean {
    return this.categoriasSeleccionadas.some(c => c.id === categoriaId);
  }

  // Toggle de producto
  toggleProducto(producto: ProductoInfo): void {
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
    if (index >= 0) {
      this.productosSeleccionados.splice(index, 1);
    } else {
      this.productosSeleccionados.push(producto);
    }
    this.emitirCambios();
  }

  // Toggle de categoría
  toggleCategoria(categoria: CategoriaInfo): void {
    const index = this.categoriasSeleccionadas.findIndex(c => c.id === categoria.id);
    if (index >= 0) {
      this.categoriasSeleccionadas.splice(index, 1);
    } else {
      this.categoriasSeleccionadas.push(categoria);
    }
    this.emitirCambios();
  }

  // Remover producto
  removerProducto(productoId: number): void {
    this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== productoId);
    this.emitirCambios();
  }

  // Remover categoría
  removerCategoria(categoriaId: number): void {
    this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter(c => c.id !== categoriaId);
    this.emitirCambios();
  }

  // Emitir cambios al componente padre
  emitirCambios(): void {
    this.productosCategoriasChange.emit({
      productos: this.productosSeleccionados,
      categorias: this.categoriasSeleccionadas
    });
  }

  // Calcular total de productos aplicables
  get totalProductosAplicables(): number {
    return this.productosSeleccionados.length + this.totalProductosEnCategorias;
  }

  // Calcular total de productos en categorías seleccionadas
  get totalProductosEnCategorias(): number {
    return this.categoriasSeleccionadas.reduce((total, categoria) => total + categoria.productos_count, 0);
  }
}
