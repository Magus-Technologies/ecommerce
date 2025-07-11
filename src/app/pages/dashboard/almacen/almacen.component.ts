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
          <h4 class="text-heading fw-semibold mb-8">Gestión de Almacén</h4>
          <p class="text-gray-500 mb-0">
            Administra productos y categorías desde un solo lugar
          </p>
        </div>
      </div>

      <!-- Selector de Sección -->
      <div class="card border-0 shadow-sm rounded-12 mb-24">
        <div class="card-body p-24">
          <div class="row align-items-center">
            <div class="col-md-6">
              <label class="form-label text-heading fw-medium mb-8">Filtrar por Sección</label>
              <!-- Reemplázalo por: -->
              <select class="form-select" [(ngModel)]="seccionSeleccionada" (change)="onSeccionChange($event)">
                <option value="">Todas las secciones</option>
                <option *ngFor="let seccion of secciones" [value]="seccion.id">
                  {{ seccion.nombre }} ({{ seccion.categorias_count || 0 }} categorías)
                </option>
              </select>
            </div>
            <div class="col-md-6 text-end">
              <!-- Reemplázalo por: -->
              <button class="btn px-16 py-8 rounded-8"
                      [class]="secciones.length >= 3 ? 'bg-gray-400 text-white' : 'bg-success-600 hover-bg-success-700 text-white'"
                      *ngIf="permissionsService.canViewSecciones()"
                      (click)="abrirModalSeccion()">
                <i class="ph me-8" [class]="secciones.length >= 3 ? 'ph-gear' : 'ph-plus'"></i>
                {{ secciones.length >= 3 ? 'Gestionar Secciones' : 'Agregar Sección' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="card border-0 shadow-sm rounded-12 mb-24">
        <div class="card-body p-0">
          <nav class="nav nav-tabs border-0" id="almacenTabs" role="tablist">
            <button
              class="nav-link px-24 py-16 border-0 text-heading fw-medium"
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
              class="nav-link px-24 py-16 border-0 text-heading fw-medium"
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
              class="nav-link px-24 py-16 border-0 text-heading fw-medium"
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
    `,
  ],
})
export class AlmacenComponent implements OnInit {
  totalProductos = 0;
  totalCategorias = 0;
  totalMarcas = 0;
  activeTab = 'productos';
  secciones: Seccion[] = [];
  seccionSeleccionada: number | null = null;

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

    // ← AGREGAR ESTAS LÍNEAS
    // Inicializar con "Todas las secciones"
    this.seccionSeleccionada = null;
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

 // Busca este método y reemplázalo:
  onSeccionChange(event: any): void {
    const value = event.target ? event.target.value : event;
    this.seccionSeleccionada = value === '' || value === 'null' ? null : Number(value);
    
    console.log('Sección seleccionada:', this.seccionSeleccionada);
    
    this.seccionFilterService.setSeccionSeleccionada(this.seccionSeleccionada);
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
