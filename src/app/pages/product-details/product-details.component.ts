

// src\app\pages\product-details\product-details.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, ActivatedRoute, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { SlickCarouselModule } from "ngx-slick-carousel"
import { BreadcrumbComponent } from "../../component/breadcrumb/breadcrumb.component"
import { ShippingComponent } from "../../component/shipping/shipping.component"
import { AlmacenService } from "../../services/almacen.service"
import { CartService } from "../../services/cart.service"
import { CartNotificationService } from "../../services/cart-notification.service"
import Swal from "sweetalert2"
import { environment } from "../../../environments/environment"
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"

@Component({
  selector: "app-product-details",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SlickCarouselModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: "./product-details.component.html",
  styleUrl: "./product-details.component.scss",
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('zoomImage', { static: false }) zoomImage!: ElementRef<HTMLImageElement>
  @ViewChild('imageContainer', { static: false }) imageContainer!: ElementRef<HTMLDivElement>

  producto: any = null
  detalles: any = null
  productosRelacionados: any[] = []
  isLoading = true
  error: string | null = null
  cantidad = 1
  imagenesProducto: string[] = []
  imagenPrincipal = ""
  isZoomActive = false
  isMobileZoom = false
  private isMobileDevice = false
  especificacionesProcesadas: any[] = []
  caracteristicasProcesadas: any[] = []
  safeDescripcionDetallada: SafeHtml = ""
  environment = environment

  productThumbSlider = { slidesToShow: 1, slidesToScroll: 1, arrows: false, fade: true, asNavFor: ".product-details__images-slider" };
  productImageSlider = { slidesToShow: 4, slidesToScroll: 1, asNavFor: ".product-details__thumb-slider", dots: false, arrows: false, focusOnSelect: true, responsive: [{ breakpoint: 768, settings: { slidesToShow: 3 } }, { breakpoint: 576, settings: { slidesToShow: 2 } }] };
  arrivalSlider = { slidesToShow: 6, slidesToScroll: 1, autoplay: false, autoplaySpeed: 2000, speed: 1500, dots: false, pauseOnHover: true, arrows: true, draggable: true, infinite: true, nextArrow: "#new-arrival-next", prevArrow: "#new-arrival-prev", responsive: [{ breakpoint: 1599, settings: { slidesToShow: 6, arrows: false } }, { breakpoint: 1399, settings: { slidesToShow: 4, arrows: false } }, { breakpoint: 992, settings: { slidesToShow: 3, arrows: false } }, { breakpoint: 575, settings: { slidesToShow: 2, arrows: false } }, { breakpoint: 424, settings: { slidesToShow: 1, arrows: false } }] };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private almacenService: AlmacenService,
    private cartService: CartService,
    private cartNotificationService: CartNotificationService,
    private sanitizer: DomSanitizer,
  ) {
    this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    this.route.params.subscribe((params) => {
      const id = +params["id"]
      if (id && !isNaN(id)) {
        this.cargarProducto(id)
      } else {
        this.error = "ID de producto inválido"
        this.isLoading = false
      }
    })
  }

  ngOnDestroy(): void {
    this.resetZoom()
  }

  cargarProducto(id: number): void {
    this.isLoading = true
    this.error = null
    this.almacenService.obtenerProductoPublico(id).subscribe({
      next: (response) => {
        try {
          this.producto = response.producto
          this.detalles = response.detalles
          this.productosRelacionados = response.productos_relacionados || []
          this.procesarDatosProducto()
          this.isLoading = false
        } catch (processingError) {
          this.error = "Error procesando los datos del producto"
          this.isLoading = false
        }
      },
      error: (error) => {
        this.error = "No se pudo cargar el producto"
        this.isLoading = false
        setTimeout(() => { this.router.navigate(["/"]) }, 3000)
      },
    })
  }

  private procesarDatosProducto(): void {
    try {
      this.configurarImagenes()
      this.procesarEspecificaciones()
      this.procesarCaracteristicas()
      const rawDescription = this.detalles?.descripcion_detallada || this.producto?.descripcion || ""
      this.safeDescripcionDetallada = this.sanitizer.bypassSecurityTrustHtml(rawDescription)
    } catch (error) {
      console.error("Error en procesarDatosProducto:", error)
    }
  }

  private configurarImagenes(): void {
    this.imagenesProducto = []
    const baseUrl = environment.apiUrl.replace("/api", "")
    if (this.producto?.imagen) {
      this.imagenesProducto.push(`${baseUrl}/storage/productos/${this.producto.imagen}`)
    }
    if (this.detalles?.imagenes) {
      try {
        let imagenesDetalles: string[] = []
        if (typeof this.detalles.imagenes === "string") {
          imagenesDetalles = JSON.parse(this.detalles.imagenes)
        } else if (Array.isArray(this.detalles.imagenes)) {
          imagenesDetalles = this.detalles.imagenes
        }
        if (Array.isArray(imagenesDetalles) && imagenesDetalles.length > 0) {
          const imagenesUrls = imagenesDetalles.map((img: string) => `${baseUrl}/storage/productos/detalles/${img}`)
          this.imagenesProducto = [...this.imagenesProducto, ...imagenesUrls]
        }
      } catch (parseError) {
        console.warn("Error parseando imágenes de detalles:", parseError)
      }
    }
    this.imagenPrincipal = this.imagenesProducto.length > 0 ? this.imagenesProducto[0] : ""
  }

  cambiarImagenPrincipal(nuevaImagen: string): void {
    this.imagenPrincipal = nuevaImagen
    this.resetZoom()
  }

  onMouseEnterImage(event: MouseEvent): void { if (!this.isMobileDevice) { this.isZoomActive = true; this.updateZoomPosition(event); } }
  onMouseLeaveImage(event: MouseEvent): void { if (!this.isMobileDevice) { this.isZoomActive = false; this.resetZoom(); } }
  onMouseMoveImage(event: MouseEvent): void { if (!this.isMobileDevice && this.isZoomActive) { this.updateZoomPosition(event); } }
  toggleMobileZoom(): void { if (this.isMobileDevice) { this.isMobileZoom = !this.isMobileZoom; if (!this.isMobileZoom) { this.resetZoom(); } } }

  private updateZoomPosition(event: MouseEvent): void {
    if (!this.imageContainer || !this.zoomImage) return
    const containerRect = this.imageContainer.nativeElement.getBoundingClientRect()
    const percentX = ((event.clientX - containerRect.left) / containerRect.width) * 100
    const percentY = ((event.clientY - containerRect.top) / containerRect.height) * 100
    this.zoomImage.nativeElement.style.transformOrigin = `${Math.max(0, Math.min(100, percentX))}% ${Math.max(0, Math.min(100, percentY))}%`
  }

  private resetZoom(): void { if (this.zoomImage) { this.zoomImage.nativeElement.style.transformOrigin = 'center center' } }
  trackByImageUrl(index: number, imagen: string): string { return imagen; }

  private procesarEspecificaciones(): void {
    this.especificacionesProcesadas = [];
    try {
      if (!this.detalles?.especificaciones) return;
      let specs = (typeof this.detalles.especificaciones === "string") ? JSON.parse(this.detalles.especificaciones) : this.detalles.especificaciones;
      if (Array.isArray(specs)) { this.especificacionesProcesadas = specs.filter(s => s && s.nombre && s.valor); }
    } catch (error) { console.warn("Error procesando especificaciones:", error); }
  }

  private procesarCaracteristicas(): void {
    this.caracteristicasProcesadas = [];
    try {
      if (!this.detalles?.caracteristicas_tecnicas) return;
      let caracteristicas = (typeof this.detalles.caracteristicas_tecnicas === "string") ? JSON.parse(this.detalles.caracteristicas_tecnicas) : this.detalles.caracteristicas_tecnicas;
      if (Array.isArray(caracteristicas)) { this.caracteristicasProcesadas = caracteristicas.filter(c => c && c.caracteristica && c.detalle); }
    } catch (error) { console.warn("Error procesando características:", error); }
  }

  aumentarCantidad(): void { if (this.producto && this.cantidad < this.producto.stock) { this.cantidad++; } }
  disminuirCantidad(): void { if (this.cantidad > 1) { this.cantidad--; } }

  agregarAlCarrito(): void {
    if (!this.producto) return;
    if (this.producto.stock <= 0) {
      Swal.fire({ title: "Sin stock", text: "Este producto no tiene stock disponible", icon: "warning", confirmButtonColor: "#dc3545" });
      return;
    }
    if (this.cantidad > this.producto.stock) {
      Swal.fire({ title: "Stock insuficiente", text: `Solo hay ${this.producto.stock} unidades disponibles`, icon: "warning", confirmButtonColor: "#dc3545" });
      return;
    }

    this.cartService.addToCart(this.producto, this.cantidad).subscribe({
      next: () => {
        // Preparar imagen del producto
        let productImage = this.imagenPrincipal || 'assets/images/thumbs/product-default.png';

        // Usar productos relacionados como sugeridos
        const suggestedProducts = this.productosRelacionados.slice(0, 3);

        // Mostrar notificación llamativa estilo Coolbox
        this.cartNotificationService.showProductAddedNotification(
          this.producto.nombre,
          Number(this.producto.precio_venta || this.producto.precio || 0),
          productImage,
          this.cantidad,
          suggestedProducts
        );
      },
      error: (err) => {
        Swal.fire({ title: "Error", text: err.message || "No se pudo agregar el producto al carrito", icon: "error", confirmButtonColor: "#dc3545" });
      }
    });
  }

  comprarAhora(): void {
    this.agregarAlCarrito();
    setTimeout(() => { this.router.navigate(["/cart"]); }, 1000);
  }

  agregarProductoRelacionado(producto: any): void {
    if (producto.stock <= 0) {
      Swal.fire({ title: "Sin stock", text: "Este producto no tiene stock disponible", icon: "warning", confirmButtonColor: "#dc3545" });
      return;
    }
    this.cartService.addToCart(producto, 1).subscribe({
      next: () => {
        // Preparar imagen del producto
        let productImage = producto.imagen_url || producto.imagen || 'assets/images/thumbs/product-default.png';

        // Usar otros productos relacionados como sugeridos (excluyendo el que se acaba de agregar)
        const suggestedProducts = this.productosRelacionados
          .filter(p => p.id !== producto.id)
          .slice(0, 3);

        // Mostrar notificación llamativa estilo Coolbox
        this.cartNotificationService.showProductAddedNotification(
          producto.nombre,
          Number(producto.precio_venta || producto.precio || 0),
          productImage,
          1,
          suggestedProducts
        );
      },
      error: (err) => {
        Swal.fire({ title: "Error", text: err.message || "No se pudo agregar el producto al carrito", icon: "error", confirmButtonColor: "#dc3545" });
      }
    });
  }

  onImageError(event: any): void { event.target.style.display = "none"; }
  getPorcentajeDescuento(): number { if (!this.producto || !this.producto.precio_oferta) return 0; return Math.round(((this.producto.precio_venta - this.producto.precio_oferta) / this.producto.precio_venta) * 100); }
  getEstrellas(): number[] { return Array(5).fill(0).map((_, i) => (i < Math.floor(4.8) ? 1 : 0)); }
  getEspecificaciones(): any[] { return this.especificacionesProcesadas; }
  getCaracteristicasTecnicas(): any[] { return this.caracteristicasProcesadas; }
  getPrecioActual(): number { if (!this.producto) return 0; return this.producto.precio_oferta || this.producto.precio_venta; }
  getPrecioOriginal(): number { if (!this.producto) return 0; return this.producto.precio_venta; }
  tieneOferta(): boolean { return !!this.producto?.precio_oferta && this.producto.precio_oferta < this.producto.precio_venta; }
  getDescripcion(): string { return this.producto?.descripcion || this.detalles?.descripcion_detallada || "Descripción no disponible"; }
  getGarantia(): string { return this.detalles?.garantia || "La Ley de Protección al Consumidor no prevé la devolución de este producto de calidad adecuada."; }
}
