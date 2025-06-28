// src\app\layouts\main-layouts\header\header.component.ts
import { Component, ElementRef, Inject, OnInit, ViewChild,  PLATFORM_ID, HostListener,AfterViewInit, OnDestroy  } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2, Select2Data } from 'ng-select2-component';
import { UserProfileComponent } from '../../../component/user-profile/user-profile.component';
import { CategoriasPublicasService, CategoriaPublica } from '../../../services/categorias-publicas.service';
import { CartService } from '../../../services/cart.service';
import { Subject, takeUntil } from 'rxjs';

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

  activeIndex: any | null = null;
  windowWidth: number = 0;
  cartItemCount: number = 0;

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

  // @HostListener('window:scroll')
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
  categoryDropdownVisible = false;
  isActive = false;

  isMobileMenuActive: boolean = false;

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
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
  }

  ngOnInit() {
    this.isHomePageActive = this.router.url === '/' || this.router.url === '/index-two' || this.router.url === '/index-three';
    this.cargarCategoriasPublicas();
    
    // Suscribirse a los cambios del carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartItemCount = summary.cantidad_items;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onSearch() {
    console.log('Search term:', this.searchTerm);
    console.log('Selected category:', this.selectedCategory);
    // Add your search logic here
  }

  toggleCategoryDropdown() {
    this.isActive = !this.isActive;
    this.categoryDropdownVisible = !this.categoryDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-dropdown-wrapper')) {
      this.categoryDropdownVisible = false;
    }
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  isParentActive(routes: string[]): boolean {
    const currentUrl = this.router.url;
    return routes.some(route => route !== '/' ? currentUrl.startsWith(route) : currentUrl === route);
  }
  
  activeDropdown: string | null = null;

  toggleDropdown(menu: string): void {
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }
}