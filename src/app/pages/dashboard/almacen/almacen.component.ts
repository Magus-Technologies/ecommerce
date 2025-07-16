// src\app\pages\dashboard\almacen\almacen.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AlmacenService, Seccion } from '../../../services/almacen.service';
import { SeccionesGestionModalComponent } from ".//secciones-gestion-modal/secciones-gestion-modal.component"
import { SeccionFilterService } from '../../../services/seccion-filter.service';
import { PermissionsService } from '../../../services/permissions.service';
import { FormsModule } from '@angular/forms'
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [CommonModule, RouterModule, SeccionesGestionModalComponent, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 class="text-heading-two fw-semibold mb-8">Gestión de Almacén</h4>
        </div>
      </div>

      <!-- Navigation Tabs con Filtro Integrado -->
      <div class="card border-0 shadow-sm rounded-12 mb-24">
        <div class="card-body p-0">
          <div class="d-flex align-items-center justify-content-between">
            <!-- Tabs de navegación -->
            <nav class="nav nav-tabs border-0 flex-grow-1" id="almacenTabs" role="tablist">
              <button
                class="nav-link px-24 py-16 border-0 text-heading-two fw-medium"
                [class.active]="activeTab === 'productos'"
                (click)="navigateToTab('productos')"
                type="button"
              >
                <i class="ph ph-package me-8"></i>
                Productos
                <span class="badge bg-main-50 text-main-600 ms-8">{{
                  totalProductos
                }}</span>
              </button>
              <button
                class="nav-link px-24 py-16 border-0 text-heading-two fw-medium"
                [class.active]="activeTab === 'categorias'"
                (click)="navigateToTab('categorias')"
                type="button"
              >
                <i class="ph ph-folder me-8"></i>
                Categorías
                <span class="badge bg-main-50 text-main-600 ms-8">{{
                  totalCategorias
                }}</span>
              </button>
              <button
                class="nav-link px-24 py-16 border-0 text-heading-two fw-medium"
                [class.active]="activeTab === 'marcas'"
                (click)="navigateToTab('marcas')"
                type="button"
              >
                <i class="ph ph-tag me-8"></i>
                Marcas
                <span class="badge bg-main-50 text-main-600 ms-8">{{
                  totalMarcas
                }}</span>
              </button>
            </nav>

            <!-- Filtro de Sección -->
            <div class="d-flex align-items-center px-24 py-16 gap-12">
              <div class="d-flex align-items-center gap-8">
                <i class="ph ph-funnel text-gray-600"></i>
                <span class="text-sm text-gray-600">Filtrar por Sección</span>
              </div>
              <select 
                class="form-select form-select-sm border-gray-300 rounded-8" 
                style="min-width: 180px;"
                [(ngModel)]="seccionSeleccionada" 
                (change)="onSeccionChange($event)">
                <option value="" disabled selected>Seleccionar</option>
                <option value="todas">Todas las secciones</option>
                <option *ngFor="let seccion of secciones" [value]="seccion.id">
                  {{ seccion.nombre }}
                </option>
              </select>

              <!-- Botón para agregar/gestionar secciones -->
              <button 
                class="btn btn-sm btn-outline-primary px-8 py-6 rounded-8 ms-8"
                *ngIf="permissionsService.canViewSecciones()"
                (click)="abrirModalSeccion()"
                title="Agregar/Gestionar Secciones">
                <i class="ph ph-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="tab-content">
        <router-outlet></router-outlet>
      </div>
    </div>

    <!-- Modal de gestión de secciones -->
    <app-secciones-gestion-modal 
      (seccionesActualizadas)="onSeccionesActualizadas()">
    </app-secciones-gestion-modal>
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
      .form-select-sm {
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
      }
      .gap-8 {
        gap: 8px;
      }
      .gap-12 {
        gap: 12px;
      }
      .btn-sm {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AlmacenComponent implements OnInit {
  totalProductos = 0;
  totalCategorias = 0;
  totalMarcas = 0;
  activeTab = 'productos';
  secciones: Seccion[] = [];
  seccionSeleccionada: string | null = null;

  constructor(
    private almacenService: AlmacenService, 
    private router: Router,
    private seccionFilterService: SeccionFilterService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.cargarTotales();
    this.cargarSecciones();
    this.detectActiveTab();

    // Inicializar con "Todas las secciones"
    this.seccionSeleccionada = "todas";
    this.seccionFilterService.setSeccionSeleccionada(null);
    
    // Escuchar cambios de ruta para actualizar la pestaña activa
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.detectActiveTab();
      });
  }

  public cargarTotales(): void {
    const seccionId = this.seccionFilterService.getSeccionSeleccionada();
      
    // Cargar total de productos
    this.almacenService.obtenerProductos(seccionId || undefined).subscribe({
      next: (productos) => {
        this.totalProductos = productos.length;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.totalProductos = 0;
      },
    });

    // Cargar total de categorías
    this.almacenService.obtenerCategorias(seccionId || undefined).subscribe({
      next: (categorias) => {
        this.totalCategorias = categorias.length;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.totalCategorias = 0;
      },
    });

    // Cargar total de marcas
    this.almacenService.obtenerMarcas(seccionId || undefined).subscribe({
      next: (marcas) => {
        this.totalMarcas = marcas.length;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.totalMarcas = 0;
      },
    });
  }

  private detectActiveTab(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/almacen/productos')) {
      this.activeTab = 'productos';
    } else if (currentUrl.includes('/almacen/categorias')) {
      this.activeTab = 'categorias';
    } else if (currentUrl.includes('/almacen/marcas')) {
      this.activeTab = 'marcas';
    }
  }

  navigateToTab(tab: string): void {
    this.activeTab = tab;
    this.router.navigate(['/dashboard/almacen', tab]);
  }

  private cargarSecciones(): void {
    this.almacenService.obtenerSecciones().subscribe({
      next: (secciones) => {
        this.secciones = secciones;
      },
      error: (error) => {
        console.error('Error al cargar secciones:', error);
      },
    });
  }

  onSeccionChange(event: any): void {
    const value = event.target ? event.target.value : event;
    
    if (value === 'todas' || value === '') {
      this.seccionSeleccionada = 'todas';
      this.seccionFilterService.setSeccionSeleccionada(null);
    } else {
      this.seccionSeleccionada = value;
      this.seccionFilterService.setSeccionSeleccionada(Number(value));
    }
    
    console.log('Sección seleccionada:', this.seccionSeleccionada);
    this.cargarTotales();
  }

  abrirModalSeccion(): void {
    const modal = document.getElementById("modalGestionSecciones")
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal)
      bootstrapModal.show()
    }
  }

  onSeccionesActualizadas(): void {
    this.cargarSecciones()
  }

  onDatosActualizados(): void {
    this.cargarTotales()
  }
}