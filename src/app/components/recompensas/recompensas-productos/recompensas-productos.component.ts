import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Modelos
import { 
  ProductoRecompensa,
  CategoriaInfo,
  ProductoInfo,
  FiltrosReglas,
  PaginacionReglas
} from '../../../models/producto-recompensa.model';

// Servicios
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-productos.component.html',
  styleUrls: ['./recompensas-productos.component.scss']
})
export class RecompensasProductosComponent implements OnInit, OnDestroy {
  // Estados
  loading = false;
  loadingCategorias = false;
  activeTab = 'productos';
  
  // Datos
  productos: ProductoRecompensa[] = [];
  categorias: CategoriaInfo[] = [];
  productosDisponibles: ProductoInfo[] = [];
  
  // Filtros y paginación
  filtros: FiltrosReglas = {
    categoria_id: '',
    producto_id: '',
    activo: true,
    busqueda: ''
  };
  paginacion: PaginacionReglas = {
    pagina: 1,
    por_pagina: 10,
    total: 0,
    total_paginas: 0
  };
  
  // Formularios
  productoForm: FormGroup;
  filtrosForm: FormGroup;
  
  // Modales
  showAgregarModal = false;
  showEditarModal = false;
  productoSeleccionado: ProductoRecompensa | null = null;
  
  // Permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;
  puedeVer = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.productoForm = this.fb.group({
      producto_id: ['', Validators.required],
      categoria_id: ['', Validators.required],
      puntos_por_unidad: [0, [Validators.required, Validators.min(1)]],
      puntos_por_precio: [0, [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });
    
    this.filtrosForm = this.fb.group({
      categoria_id: [''],
      producto_id: [''],
      activo: [true],
      busqueda: ['']
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.loadCategorias();
    this.loadProductos();
    this.setupFiltrosForm();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkPermissions(): void {
    this.puedeCrear = this.permissionsService.hasPermission('recompensas.create');
    this.puedeEditar = this.permissionsService.hasPermission('recompensas.edit');
    this.puedeEliminar = this.permissionsService.hasPermission('recompensas.delete');
    this.puedeVer = this.permissionsService.hasPermission('recompensas.ver');
  }
  
  private setupFiltrosForm(): void {
    this.filtrosForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    if (tab === 'categorias') {
      this.loadCategorias();
    }
  }
  
  onAgregarProducto(): void {
    this.productoForm.reset();
    this.productoForm.patchValue({ activo: true });
    this.showAgregarModal = true;
  }
  
  onEditarProducto(producto: ProductoRecompensa): void {
    this.productoSeleccionado = producto;
    this.productoForm.patchValue({
      producto_id: producto.producto_id,
      categoria_id: producto.categoria_id,
      puntos_por_unidad: producto.puntos_por_unidad,
      puntos_por_precio: producto.puntos_por_precio,
      activo: producto.activo
    });
    this.showEditarModal = true;
  }
  
  onEliminarProducto(producto: ProductoRecompensa): void {
    if (!this.puedeEliminar) return;
    
    this.loading = true;
    
    // Simular eliminación
    setTimeout(() => {
      this.loadProductos();
      this.loading = false;
    }, 1000);
  }
  
  onSubmitProducto(): void {
    if (this.productoForm.invalid) return;
    
    this.loading = true;
    const formData = this.productoForm.value;
    
    // Simular guardado
    setTimeout(() => {
      this.loadProductos();
      this.showAgregarModal = false;
      this.showEditarModal = false;
      this.productoSeleccionado = null;
      this.productoForm.reset();
      this.loading = false;
    }, 1000);
  }
  
  onModalClosed(): void {
    this.showAgregarModal = false;
    this.showEditarModal = false;
    this.productoSeleccionado = null;
    this.productoForm.reset();
  }
  
  onCategoriaChange(): void {
    const categoriaId = this.productoForm.get('categoria_id')?.value;
    if (categoriaId) {
      this.loadProductosPorCategoria(categoriaId);
    }
  }
  
  onPageChange(pagina: number): void {
    this.paginacion.pagina = pagina;
    this.loadProductos();
  }
  
  onPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.paginacion.por_pagina = parseInt(target.value);
    this.paginacion.pagina = 1;
    this.loadProductos();
  }
  
  aplicarFiltros(): void {
    this.filtros = { ...this.filtrosForm.value };
    this.paginacion.pagina = 1;
    this.loadProductos();
  }
  
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.filtrosForm.patchValue({ activo: true });
  }
  
  getProductoNombre(productoId: number): string {
    const producto = this.productosDisponibles.find(p => p.id === productoId);
    return producto ? producto.nombre : `Producto #${productoId}`;
  }
  
  getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : `Categoría #${categoriaId}`;
  }
  
  getEstadoClass(activo: boolean): string {
    return activo ? 'text-success' : 'text-danger';
  }
  
  getEstadoIcon(activo: boolean): string {
    return activo ? 'ph-check-circle' : 'ph-x-circle';
  }
  
  getPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginacion.pagina - 2);
    const fin = Math.min(this.paginacion.total_paginas, this.paginacion.pagina + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
  
  // Exponer Math para usar en el template
  Math = Math;
  
  private loadCategorias(): void {
    this.loadingCategorias = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getCategoriasProductos().subscribe({
    //   next: (data) => {
    //     this.categorias = data;
    //     this.loadingCategorias = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando categorías:', error);
    //     this.loadingCategorias = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.categorias = [];
      this.loadingCategorias = false;
    }, 500);
  }
  
  private loadProductos(): void {
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getProductosRecompensas().subscribe({
    //   next: (data) => {
    //     this.productos = data.productos;
    //     this.paginacion = data.paginacion;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando productos:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar datos vacíos
    setTimeout(() => {
      this.productos = [];
      this.paginacion.total = 0;
      this.paginacion.total_paginas = 0;
      this.loading = false;
    }, 500);
  }
  
  private loadProductosPorCategoria(categoriaId: number): void {
    // Simular carga de productos por categoría
    this.productosDisponibles = [
      {
        id: 101,
        nombre: 'Smartphone Samsung Galaxy',
        codigo_producto: 'SM-GAL-001',
        precio_venta: 500.00,
        stock: 10,
        categoria: {
          id: 1,
          nombre: 'Electrónicos'
        }
      },
      {
        id: 102,
        nombre: 'Camiseta Algodón',
        codigo_producto: 'CAM-001',
        precio_venta: 25.00,
        stock: 50,
        categoria: {
          id: 2,
          nombre: 'Ropa'
        }
      },
      {
        id: 103,
        nombre: 'Sofá 3 Plazas',
        codigo_producto: 'SOF-001',
        precio_venta: 800.00,
        stock: 5,
        categoria: {
          id: 3,
          nombre: 'Hogar'
        }
      }
    ].filter(p => p.categoria.id === categoriaId);
  }
}
