// src\app\pages\shop\shop.component.ts
import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink,  ActivatedRoute,  Router } from "@angular/router"
import { BreadcrumbComponent } from "../../component/breadcrumb/breadcrumb.component"
import { ShippingComponent } from "../../component/shipping/shipping.component"
import { ProductosService, ProductoPublico, type CategoriaParaSidebar } from "../../services/productos.service"

@Component({
  selector: "app-shop",
  imports: [CommonModule, RouterLink, BreadcrumbComponent, ShippingComponent],
  templateUrl: "./shop.component.html",
  styleUrl: "./shop.component.scss",
})
export class ShopComponent implements OnInit {
  listview: "list" | "grid" = "grid"

  productos: ProductoPublico[] = []
  categorias: CategoriaParaSidebar[] = []
  isLoading = false
  categoriaSeleccionada?: number

  // pagination
  currentPage = 1
  totalPages = 1
  totalProductos = 0

  // rating
  ratings = [
    { rating: 5, progress: 70, total: 124 },
    { rating: 4, progress: 50, total: 52 },
    { rating: 3, progress: 35, total: 12 },
    { rating: 2, progress: 20, total: 5 },
    { rating: 1, progress: 5, total: 2 },
  ]

  // color
  colors = [
    { id: "color1", name: "Black", count: 12, class: "checked-black" },
    { id: "color2", name: "Blue", count: 12, class: "checked-primary" },
    { id: "color3", name: "Gray", count: 12, class: "checked-gray" },
    { id: "color4", name: "Green", count: 12, class: "checked-success" },
    { id: "color5", name: "Red", count: 12, class: "checked-danger" },
    { id: "color6", name: "White", count: 12, class: "checked-white" },
    { id: "color7", name: "Purple", count: 12, class: "checked-purple" },
  ]

  // brands
  brands = [
    { id: "brand1", name: "Apple" },
    { id: "brand2", name: "Samsung" },
    { id: "brand3", name: "Microsoft" },
    { id: "brand4", name: "Apple" },
    { id: "brand5", name: "HP" },
    { id: "DELL", name: "DELL" },
    { id: "Redmi", name: "Redmi" },
  ]

  constructor(
    private productosService: ProductosService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Cargar categorías para el sidebar
    this.cargarCategorias()

    // Escuchar cambios en los query parameters
    this.route.queryParams.subscribe((params) => {
      this.categoriaSeleccionada = params["categoria"] ? +params["categoria"] : undefined
      this.currentPage = 1 // Reset página al cambiar filtros
      this.cargarProductos()
    })
  }

  cargarCategorias(): void {
    this.productosService.obtenerCategoriasParaSidebar().subscribe({
      next: (categorias) => {
        this.categorias = categorias
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error)
      },
    })
  }

  cargarProductos(): void {
    this.isLoading = true

    const filtros = {
      categoria: this.categoriaSeleccionada,
      page: this.currentPage,
    }

    this.productosService.obtenerProductosPublicos(filtros).subscribe({
      next: (response) => {
        this.productos = response.productos
        this.currentPage = response.pagination.current_page
        this.totalPages = response.pagination.last_page
        this.totalProductos = response.pagination.total
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error al cargar productos:", error)
        this.isLoading = false
      },
    })
  }

  seleccionarCategoria(categoriaId: number): void {
    // Navegar con query parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoriaId },
      queryParamsHandling: "merge",
    })
  }

  limpiarFiltros(): void {
    // Navegar sin query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    })
  }

  togglelistview(): void {
    this.listview = this.listview === "grid" ? "list" : "grid"
  }

  // ✅ MÉTODO PARA MANEJAR ERRORES DE IMAGEN
  onImageError(event: any): void {
    event.target.src = "/placeholder.svg?height=200&width=200&text=Imagen+no+disponible"
  }

  // Method to generate page numbers based on totalPages
  getPages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.cargarProductos()
    }
  }
}
