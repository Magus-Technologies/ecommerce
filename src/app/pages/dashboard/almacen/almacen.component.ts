import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule, NavigationEnd } from "@angular/router"
import { AlmacenService } from "../../../services/almacen.service"
import { filter } from "rxjs/operators"

@Component({
  selector: "app-almacen",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading fw-semibold mb-8">Gestión de Almacén</h4>
          <p class="text-gray-500 mb-0">Administra productos y categorías desde un solo lugar</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="card border-0 shadow-sm rounded-12 mb-24">
        <div class="card-body p-0">
          <nav class="nav nav-tabs border-0" id="almacenTabs" role="tablist">
            <button class="nav-link px-24 py-16 border-0 text-heading fw-medium" 
                    [class.active]="activeTab === 'productos'"
                    (click)="navigateToTab('productos')"
                    type="button">
              <i class="ph ph-package me-8"></i>
              Productos
              <span class="badge bg-main-50 text-main-600 ms-8">{{ totalProductos }}</span>
            </button>
            <button class="nav-link px-24 py-16 border-0 text-heading fw-medium" 
                    [class.active]="activeTab === 'categorias'"
                    (click)="navigateToTab('categorias')"
                    type="button">
              <i class="ph ph-folder me-8"></i>
              Categorías
              <span class="badge bg-main-50 text-main-600 ms-8">{{ totalCategorias }}</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <div class="tab-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
    .nav-tabs .nav-link {
      border-radius: 0;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .nav-tabs .nav-link.active {
      background-color: var(--bs-main-50);
      color: var(--bs-main-600);
      border-bottom: 2px solid var(--bs-main-600);
    }
    .nav-tabs .nav-link:hover {
      background-color: var(--bs-gray-50);
    }
  `,
  ],
})
export class AlmacenComponent implements OnInit {
  totalProductos = 0
  totalCategorias = 0
  activeTab = 'productos'

  constructor(
    private almacenService: AlmacenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTotales()
    this.detectActiveTab()
    
    // Escuchar cambios de ruta para actualizar la pestaña activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectActiveTab()
    })
  }

  private cargarTotales(): void {
    // Cargar total de productos
    this.almacenService.obtenerProductos().subscribe({
      next: (productos) => {
        this.totalProductos = productos.length
      },
      error: (error) => {
        console.error("Error al cargar productos:", error)
        this.totalProductos = 0
      },
    })

    // Cargar total de categorías
    this.almacenService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.totalCategorias = categorias.length
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
        this.totalCategorias = 0
      },
    })
  }

  private detectActiveTab(): void {
    const currentUrl = this.router.url
    if (currentUrl.includes('/almacen/productos')) {
      this.activeTab = 'productos'
    } else if (currentUrl.includes('/almacen/categorias')) {
      this.activeTab = 'categorias'
    }
  }

  navigateToTab(tab: string): void {
    this.activeTab = tab
    this.router.navigate(['/dashboard/almacen', tab])
  }
}