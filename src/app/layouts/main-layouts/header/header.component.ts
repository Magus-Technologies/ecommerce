// src\app\layouts\main-layouts\header\header.component.ts
import { Component, ElementRef, Inject, OnInit, ViewChild,  PLATFORM_ID, HostListener,AfterViewInit, OnDestroy  } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2, Select2Data } from 'ng-select2-component';
import { UserProfileComponent } from '../../../component/user-profile/user-profile.component';
import { CategoriasPublicasService, CategoriaPublica } from '../../../services/categorias-publicas.service';
import { ProductosService, ProductoSugerencia } from '../../../services/productos.service';
import { CartService } from '../../../services/cart.service';
import { EmpresaInfoService } from '../../../services/empresa-info.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { IndexTwoService } from '../../../services/index-two.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink, 
    FormsModule, 
    CommonModule, 
    ReactiveFormsModule, 
    Select2, 
    RouterLinkActive,
    UserProfileComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('progressPath') progressPathRef!: ElementRef<SVGPathElement>;
  isActiveProgress: boolean = false;
  private pathLength!: number;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  activeIndex: any | null = null;
  windowWidth: number = 0;
  cartItemCount: number = 0;
  empresaInfo: any = null;
  // ✅ NUEVAS PROPIEDADES PARA AUTOCOMPLETADO
  searchSuggestions: ProductoSugerencia[] = [];
  showSuggestions: boolean = false;
  isLoadingSuggestions: boolean = false;
  selectedSuggestionIndex: number = -1;



  setupPath() {
    if (!this.progressPathRef?.nativeElement) {
      return;
    }
    const path = this.progressPathRef.nativeElement;
    this.pathLength = path.getTotalLength();
    path.style.transition = path.style.webkitTransition = 'none';
    path.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
    path.style.strokeDashoffset = this.pathLength.toString();
    path.getBoundingClientRect(); // force reflow
    path.style.transition = path.style.webkitTransition = 'stroke-dashoffset 10ms linear';
  }

  @HostListener('window:scroll', [])
  @HostListener('window:resize', [])
  onScroll() {
    if (this.isBrowser) {
    this.updateProgress();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isActiveProgress = scrollTop > 50;
    }
  }

  updateProgress() {
    if (!this.progressPathRef?.nativeElement || !this.pathLength) {
      return;
    }
    const scroll = window.pageYOffset || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = this.pathLength - (scroll * this.pathLength / height);
    this.progressPathRef.nativeElement.style.strokeDashoffset = progress.toString();
  }

  scrollToTop(event: Event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isBrowser: boolean = false;
  selectedCategory: string = '';
  searchTerm: string = '';
  isHomePageActive: boolean = false;
  isIndexTwoPage: boolean = false;
  categoryDropdownVisible = false;
  isActive = false;

  isMobileMenuActive: boolean = false;

  currentRoute: string = '';

  openMobileMenu() {
    this.isMobileMenuActive = true;
    document.body.classList.add('scroll-hide-sm');
  }

  closeMobileMenu() {
    this.isMobileMenuActive = false;
    document.body.classList.remove('scroll-hide-sm');
  }

  onResize() {
    this.windowWidth = window.innerWidth;
  }

  toggleSubmenu(index: string) {
    if (this.windowWidth < 992) {
      if (this.activeIndex === index) {
        this.activeIndex = null;
      } else {
        this.activeIndex = index;
      }
    }
  }
  
  onImageError(event: any): void {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/images/icon/category-default.png';
}

  categories: Select2Data = [
    { value: '', label: 'Todas las categorias' },
  ];

  categorie: any[] = [];
  categoriasPublicas: CategoriaPublica[] = [];
  isLoadingCategorias = false;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private categoriasPublicasService: CategoriasPublicasService,
    private productosService: ProductosService,
    private cartService: CartService,
    private empresaInfoService: EmpresaInfoService,
    private route: ActivatedRoute,
    private indexTwoService: IndexTwoService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateRouteFlags(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.updateRouteFlags(this.router.url);
    this.cargarCategoriasPublicas();
    
    // ✅ NUEVO: Suscribirse a cambios de ruta
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.updateRouteFlags(event.urlAfterRedirects);
    });

    // Suscribirse a los cambios del carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartItemCount = summary.cantidad_items;
      });

    // ✅ NUEVO: Configurar búsqueda con autocompletado
    this.setupSearchSubscription();
     this.cargarInformacionEmpresa();
  }
  // Agregar este nuevo método
private cargarInformacionEmpresa(): void {
  if (!this.isBrowser) return;
  
  this.empresaInfoService.obtenerEmpresaInfoPublica()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (info) => {
        this.empresaInfo = info;
      },
      error: (error) => {
        console.error('Error al cargar información de la empresa:', error);
        // Mantener valores por defecto en caso de error
        this.empresaInfo = null;
      }
    });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ NUEVO: Configurar suscripción de búsqueda con debounce
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo emitir si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.buscarProductos(searchTerm);
      });
  }

  // Modifica el método existente buscarProductos():
  private buscarProductos(termino: string): void {
    if (!termino.trim() || termino.length < 2) {
      this.hideSuggestions();
      return;
    }

    this.isLoadingSuggestions = true;
    
    // ✅ MODIFICADO: Pasar categoría seleccionada para filtrar sugerencias
    const categoriaFiltro = this.selectedCategory && this.selectedCategory !== '' ? this.selectedCategory : undefined;
    
    this.productosService.buscarProductos(termino, categoriaFiltro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sugerencias) => {
          this.searchSuggestions = sugerencias;
          this.showSuggestions = sugerencias.length > 0;
          this.isLoadingSuggestions = false;
          this.selectedSuggestionIndex = -1;
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
          this.isLoadingSuggestions = false;
          this.hideSuggestions();
        }
      });
  }

  // ✅ NUEVO: Ocultar sugerencias
  private hideSuggestions(): void {
    this.showSuggestions = false;
    this.searchSuggestions = [];
    this.selectedSuggestionIndex = -1;
  }

  // ✅ NUEVO: Método para manejar cambios en el input de búsqueda
  onSearchTermChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // ✅ NUEVO: Método para manejar teclas en el input
  onSearchKeyPress(event: KeyboardEvent): void {
    if (!this.showSuggestions) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.onSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.searchSuggestions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.selectSuggestion(this.searchSuggestions[this.selectedSuggestionIndex]);
        } else {
          this.onSearch();
        }
        break;
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  }

  // ✅ NUEVO: Seleccionar una sugerencia
  selectSuggestion(producto: ProductoSugerencia): void {
    this.searchTerm = producto.nombre;
    this.hideSuggestions();
    // Navegar al detalle del producto
    this.router.navigate(['/product-details', producto.id]);
  }

  // ✅ NUEVO: Método para manejar cambios en la categoría
  onCategoryChange(): void {
    // Si hay un término de búsqueda, realizar búsqueda inmediatamente
    if (this.searchTerm.trim()) {
      this.onSearch();
    }
  }

  // ✅ NUEVO: Manejar clics fuera del buscador
  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Ocultar dropdown de categorías
    if (!target.closest('.category-dropdown-wrapper')) {
      this.categoryDropdownVisible = false;
    }

    // Ocultar sugerencias de búsqueda
    if (!target.closest('.search-form__wrapper')) {
      this.hideSuggestions();
    }
  }
  
  cargarCategoriasPublicas(): void {
    if (!this.isBrowser) return;
    
    this.isLoadingCategorias = true;
    this.categoriasPublicasService.obtenerCategoriasPublicas().subscribe({
      next: (categorias) => {
        this.categoriasPublicas = categorias;
        this.actualizarCategoriasDropdown(categorias);
        this.actualizarCategoriasGrid(categorias);
        this.isLoadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías públicas:', error);
        this.isLoadingCategorias = false;
      }
    });
  }
  
  private actualizarCategoriasDropdown(categorias: CategoriaPublica[]): void {
    this.categories = [
      { value: '', label: 'Todas las categorias' },
      ...categorias.map(cat => ({
        value: cat.id.toString(),
        label: cat.nombre
      }))
    ];
  }

  private actualizarCategoriasGrid(categorias: CategoriaPublica[]): void {
    this.categorie = categorias.map(cat => ({
      id: cat.id,
      name: cat.nombre,
      icon: cat.imagen_url || 'assets/images/icon/category-default.png',
      route: 'shop',
      categoria: cat
    }));
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser && this.progressPathRef?.nativeElement) {
      this.setupPath();
      this.updateProgress();
    }
  }

  toggleCategoryDropdown() {
    this.isActive = !this.isActive;
    this.categoryDropdownVisible = !this.categoryDropdownVisible;
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  isParentActive(routes: string[]): boolean {
    const currentUrl = this.router.url;
    return routes.some(route => route !== '/' ? currentUrl.startsWith(route) : currentUrl === route);
  }

  private updateRouteFlags(url: string): void {
    this.isHomePageActive = url === '/' || url.startsWith('/index-two') || url.startsWith('/index-three');
    this.isIndexTwoPage = url.startsWith('/index-two');
  }
  
  activeDropdown: string | null = null;

  toggleDropdown(menu: string): void {
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }
  // ✅ NUEVO MÉTODO: Activar modo armado PC desde el header
  activarModoArmadoPC(): void {
    // Emitir evento para que index-two component lo escuche
    this.indexTwoService.activarModoArmado();
  }

  // ✅ NUEVO: Método para detectar tipo de página actual
  private detectarTipoPagina(): { tipo: 'home' | 'shop' | 'categoria' | 'computadoras' | 'laptops' | 'otros', categoriaId?: number } {
    const url = this.currentRoute || this.router.url;
    
    // Páginas principales
    if (url === '/' || url === '') {
      return { tipo: 'home' };
    }
    
    if (url.startsWith('/index-two')) {
      return { tipo: 'computadoras' };
    }
    
    if (url.startsWith('/index-laptop')) {
      return { tipo: 'laptops' };
    }
    
    if (url.startsWith('/shop')) {
      // Extraer categoria de query params si existe
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const categoriaId = urlParams.get('categoria');
      return { 
        tipo: categoriaId ? 'categoria' : 'shop', 
        categoriaId: categoriaId ? parseInt(categoriaId) : undefined 
      };
    }
    
    return { tipo: 'otros' };
  }

  // ✅ COMPLETAMENTE NUEVO: Método onSearch con lógica compleja
  onSearch(): void {
    if (!this.searchTerm.trim()) return;
    
    this.hideSuggestions();
    
    const paginaActual = this.detectarTipoPagina();
    const categoriaSeleccionada = this.selectedCategory && this.selectedCategory !== '' ? this.selectedCategory : null;
    const terminoBusqueda = this.searchTerm.trim();
    
    // **REGLA PRINCIPAL: La categoría del selector tiene máxima prioridad**
    
    if (categoriaSeleccionada) {
      // Escenario 1: Usuario seleccionó categoría específica en el selector
      // SIEMPRE navegar a shop con esa categoría, sin importar la página actual
      this.router.navigate(['/shop'], { 
        queryParams: {
          search: terminoBusqueda,
          categoria: categoriaSeleccionada
        }
      });
      return;
    }
    
    // Escenario 2: "Todas las categorías" seleccionado
    switch (paginaActual.tipo) {
      case 'categoria':
        // Está en una página de categoría específica, mantener en la misma página
        // pero con el nuevo término de búsqueda
        this.router.navigate(['/shop'], {
          queryParams: {
            search: terminoBusqueda,
            categoria: paginaActual.categoriaId
          },
          queryParamsHandling: 'merge'
        });
        break;
        
      case 'computadoras':
        // Está en sección computadoras, buscar solo en productos de computadoras
        // Aquí necesitarías definir qué categorías pertenecen a computadoras
        // Por ahora, navegar a shop con búsqueda global pero podrías filtrar por sección
        this.router.navigate(['/shop'], { 
          queryParams: {
            search: terminoBusqueda,
            seccion: 1 // Asumiendo que sección 1 es computadoras
          }
        });
        break;
        
      case 'laptops':
        // Está en sección laptops, buscar solo en productos de laptops
        this.router.navigate(['/shop'], { 
          queryParams: {
            search: terminoBusqueda,
            seccion: 2 // Asumiendo que sección 2 es laptops
          }
        });
        break;
        
      case 'home':
      case 'shop':
      case 'otros':
      default:
        // Búsqueda global en todas las categorías
        this.router.navigate(['/shop'], { 
          queryParams: {
            search: terminoBusqueda
          }
        });
        break;
    }
  }

}