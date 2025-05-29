// src\app\layouts\main-layouts\header\header.component.ts
import { Component, ElementRef, Inject, OnInit, ViewChild,  PLATFORM_ID, HostListener,AfterViewInit  } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2, Select2Data } from 'ng-select2-component';
import { UserProfileComponent } from '../../../component/user-profile/user-profile.component';
import { CategoriasPublicasService, CategoriaPublica } from '../../../services/categorias-publicas.service';
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
export class HeaderComponent {
  @ViewChild('progressPath') progressPathRef!: ElementRef<SVGPathElement>;
  isActiveProgress: boolean = false;
  private pathLength!: number;

  activeIndex: any | null = null;
  windowWidth: number = 0;

  setupPath() {
    const path = this.progressPathRef.nativeElement;
    this.pathLength = path.getTotalLength();
    path.style.transition = path.style.webkitTransition = 'none';
    path.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
    path.style.strokeDashoffset = this.pathLength.toString();
    path.getBoundingClientRect(); // force reflow
    path.style.transition = path.style.webkitTransition = 'stroke-dashoffset 10ms linear';
  }

  // @HostListener('window:scroll')
  @HostListener('window:resize', [])
  onScroll() {
    this.updateProgress();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isActiveProgress = scrollTop > 50;
  }

  updateProgress() {
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
    // { value: 'grocery', label: 'Tienda de comestibles' },
    // { value: 'breakfast', label: 'Breakfast & Dairy' },
    // { value: 'vegetables', label: 'Desayuno y Lácteos' },
    // { value: 'milk', label: 'Leches y productos lácteos' },
    // { value: 'pet', label: 'Pet Foods & Toy' },
    // { value: 'bakery', label: 'Panes y panadería' },
    // { value: 'seafood', label: 'Mariscos frescos' },
    // { value: 'frozen', label: 'Alimentos Congelados' },
    // { value: 'noodles', label: 'Fideos y arroz' },
    // { value: 'icecream', label: 'Helado' }
  ];

  // categorie = [
  //   { name: 'Vegetales', icon: 'assets/images/icon/category-1.png', route: 'shop' },
  //   { name: 'Leche y pastel', icon: 'assets/images/icon/category-2.png', route: 'shop' },
  //   { name: 'Tienda de comestibles', icon: 'assets/images/icon/category-3.png', route: 'shop' },
  //   { name: 'Belleza', icon: 'assets/images/icon/category-4.png', route: 'shop' },
  //   { name: 'Vinos y bebidas', icon: 'assets/images/icon/category-5.png', route: 'shop' },
  //   { name: 'Aperitivos', icon: 'assets/images/icon/category-6.png', route: 'shop' },
  //   { name: 'Jugos', icon: 'assets/images/icon/category-7.png', route: 'shop' },
  //   { name: 'Frutas', icon: 'assets/images/icon/category-8.png', route: 'shop' },
  //   { name: 'Té y café', icon: 'assets/images/icon/category-9.png', route: 'shop' }
  // ];
  categorie: any[] = [];

  categoriasPublicas: CategoriaPublica[] = [];
  isLoadingCategorias = false;
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private categoriasPublicasService: CategoriasPublicasService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
  }

  ngOnInit() {
    this.isHomePageActive = this.router.url === '/' || this.router.url === '/index-two' || this.router.url === '/index-three';
    // console.log(this.router.url);
    this.cargarCategoriasPublicas();
   
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
    if (this.isBrowser && this.progressPathRef) {
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

  // @HostListener('document:click', ['$event'])
  // onOutsideClick(event: MouseEvent): void {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.nav-menu__item')) {
  //     this.activeDropdown = null;
  //   }
  // }
}
