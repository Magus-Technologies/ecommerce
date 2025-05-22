// src\app\layouts\main-layouts\header\header.component.ts
import { Component, ElementRef, Inject, OnInit, ViewChild,  PLATFORM_ID, HostListener,AfterViewInit  } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2, Select2Data } from 'ng-select2-component';
import { UserProfileComponent } from '../../../component/user-profile/user-profile.component';
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

  categories: Select2Data = [
    { value: '', label: 'All categories' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'breakfast', label: 'Breakfast & Dairy' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'milk', label: 'Milks and Dairies' },
    { value: 'pet', label: 'Pet Foods & Toy' },
    { value: 'bakery', label: 'Breads & Bakery' },
    { value: 'seafood', label: 'Fresh Seafood' },
    { value: 'frozen', label: 'Fronzen Foods' },
    { value: 'noodles', label: 'Noodles & Rice' },
    { value: 'icecream', label: 'Ice Cream' }
  ];

  categorie = [
    { name: 'Vegetables', icon: 'assets/images/icon/category-1.png', route: 'shop' },
    { name: 'Milk & Cake', icon: 'assets/images/icon/category-2.png', route: 'shop' },
    { name: 'Grocery', icon: 'assets/images/icon/category-3.png', route: 'shop' },
    { name: 'Beauty', icon: 'assets/images/icon/category-4.png', route: 'shop' },
    { name: 'Wines & Drinks', icon: 'assets/images/icon/category-5.png', route: 'shop' },
    { name: 'Snacks', icon: 'assets/images/icon/category-6.png', route: 'shop' },
    { name: 'Juice', icon: 'assets/images/icon/category-7.png', route: 'shop' },
    { name: 'Fruits', icon: 'assets/images/icon/category-8.png', route: 'shop' },
    { name: 'Tea & Coffee', icon: 'assets/images/icon/category-9.png', route: 'shop' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
  }

  ngOnInit() {
    this.isHomePageActive = this.router.url === '/' || this.router.url === '/index-two' || this.router.url === '/index-three';
    // console.log(this.router.url);
   
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
