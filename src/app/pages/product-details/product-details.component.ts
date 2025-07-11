// src\app\pages\product-details\product-details.component.ts
import { Component,  OnInit,  OnDestroy, Inject, PLATFORM_ID } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink,  ActivatedRoute,  Router } from "@angular/router" // ✅ Eliminado 'type' de ActivatedRoute y Router
import { FormsModule } from "@angular/forms"
import { SlickCarouselModule } from "ngx-slick-carousel"
import { BreadcrumbComponent } from "../../component/breadcrumb/breadcrumb.component"
import { ShippingComponent } from "../../component/shipping/shipping.component"
import  { AlmacenService } from "../../services/almacen.service"
import  { CartService } from "../../services/cart.service"
import Swal from "sweetalert2"
import { environment } from "../../../environments/environment"
import  { DomSanitizer, SafeHtml } from "@angular/platform-browser" // ✅ Importa DomSanitizer y SafeHtml

@Component({
  selector: "app-product-details",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SlickCarouselModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: "./product-details.component.html",
  styleUrl: "./product-details.component.scss",
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  // ✅ DATOS DINÁMICOS
  producto: any = null
  detalles: any = null
  productosRelacionados: any[] = []
  isLoading = true
  error: string | null = null

  // ✅ CONTROL DE CANTIDAD
  cantidad = 1

  // ✅ IMÁGENES DINÁMICAS
  imagenesProducto: string[] = []
  imagenPrincipal = ""

  // ✅ DATOS PROCESADOS (para evitar re-procesamiento)
  especificacionesProcesadas: any[] = []
  caracteristicasProcesadas: any[] = []

  // ✅ PROPIEDAD PARA HTML SEGURO
  safeDescripcionDetallada: SafeHtml = "" // ✅ Nueva propiedad para el HTML sanitizado

  private platformId: any // Corregido el tipo de platformId

  // ✅ CONFIGURACIÓN DE SLIDERS
  productThumbSlider = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: ".product-details__images-slider",
  }

  productImageSlider = {
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: ".product-details__thumb-slider",
    dots: false,
    arrows: false,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  }

  arrivalSlider = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    speed: 1500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: "#new-arrival-next",
    prevArrow: "#new-arrival-prev",
    responsive: [
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 6,
          arrows: false,
        },
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 4,
          arrows: false,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 424,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    private route: ActivatedRoute,
    private router: Router,
    private almacenService: AlmacenService,
    private cartService: CartService,
    private sanitizer: DomSanitizer, // ✅ Inyecta DomSanitizer
  ) {
    this.platformId = platformId
  }

  ngOnInit(): void {
    // ✅ OBTENER ID DEL PRODUCTO DESDE LA RUTA
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
    // Limpiar recursos si es necesario
  }

  // ✅ CARGAR PRODUCTO DINÁMICAMENTE
  cargarProducto(id: number): void {
    this.isLoading = true
    this.error = null

    console.log("🔄 Cargando producto ID:", id)

    this.almacenService.obtenerProductoPublico(id).subscribe({
      next: (response) => {
        console.log("✅ Respuesta del servidor:", response)

        try {
          this.producto = response.producto
          this.detalles = response.detalles
          this.productosRelacionados = response.productos_relacionados || []

          // ✅ PROCESAR DATOS DE FORMA SEGURA
          this.procesarDatosProducto()

          this.isLoading = false
          console.log("✅ Producto cargado exitosamente")
        } catch (processingError) {
          console.error("❌ Error procesando datos del producto:", processingError)
          this.error = "Error procesando los datos del producto"
          this.isLoading = false
        }
      },
      error: (error) => {
        console.error("❌ Error al cargar producto:", error)
        this.error = "No se pudo cargar el producto"
        this.isLoading = false

        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(["/"])
        }, 3000)
      },
    })
  }

  // ✅ PROCESAR TODOS LOS DATOS DEL PRODUCTO DE FORMA SEGURA
  private procesarDatosProducto(): void {
    try {
      // Configurar imágenes
      this.configurarImagenes()

      // Procesar especificaciones
      this.procesarEspecificaciones()

      // Procesar características técnicas
      this.procesarCaracteristicas()

      // ✅ Sanitizar la descripción detallada
      const rawDescription = this.detalles?.descripcion_detallada || this.producto?.descripcion || ""
      this.safeDescripcionDetallada = this.sanitizer.bypassSecurityTrustHtml(rawDescription)

      console.log("✅ Datos del producto procesados correctamente")
    } catch (error) {
      console.error("❌ Error en procesarDatosProducto:", error)
      // No lanzar error, solo loggearlo
    }
  }

  // ✅ CONFIGURAR IMÁGENES DEL PRODUCTO (sin imagen por defecto si no hay)
  private configurarImagenes(): void {
    this.imagenesProducto = [] // Reiniciar array de imágenes
    const baseUrl = environment.apiUrl.replace("/api", "")

    // Imagen principal del producto
    if (this.producto?.imagen) {
      this.imagenesProducto.push(`${baseUrl}/storage/productos/${this.producto.imagen}`)
    }

    // Agregar imágenes adicionales de detalles si existen
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
        console.warn("⚠️ Error parseando imágenes de detalles:", parseError)
      }
    }

    // Si no se encontró ninguna imagen, el array quedará vacío.
    // No se añade una imagen por defecto aquí para evitar 404s si no existe.
    this.imagenPrincipal = this.imagenesProducto.length > 0 ? this.imagenesProducto[0] : ""

    console.log("✅ Imágenes configuradas:", this.imagenesProducto.length)
  }

  // ✅ PROCESAR ESPECIFICACIONES DE FORMA SEGURA
  private procesarEspecificaciones(): void {
    this.especificacionesProcesadas = []

    try {
      if (!this.detalles?.especificaciones) {
        return
      }

      let specs: any = null

      if (typeof this.detalles.especificaciones === "string") {
        specs = JSON.parse(this.detalles.especificaciones)
      } else {
        specs = this.detalles.especificaciones
      }

      if (Array.isArray(specs)) {
        this.especificacionesProcesadas = specs.filter(
          (spec) => spec && typeof spec === "object" && spec.nombre && spec.valor,
        )
      }

      console.log("✅ Especificaciones procesadas:", this.especificacionesProcesadas.length)
    } catch (error) {
      console.warn("⚠️ Error procesando especificaciones:", error)
      this.especificacionesProcesadas = []
    }
  }

  // ✅ PROCESAR CARACTERÍSTICAS TÉCNICAS DE FORMA SEGURA
  private procesarCaracteristicas(): void {
    this.caracteristicasProcesadas = []

    try {
      if (!this.detalles?.caracteristicas_tecnicas) {
        return
      }

      let caracteristicas: any = null

      if (typeof this.detalles.caracteristicas_tecnicas === "string") {
        caracteristicas = JSON.parse(this.detalles.caracteristicas_tecnicas)
      } else {
        caracteristicas = this.detalles.caracteristicas_tecnicas
      }

      if (Array.isArray(caracteristicas)) {
        this.caracteristicasProcesadas = caracteristicas.filter(
          (carac) => carac && typeof carac === "object" && carac.caracteristica && carac.detalle,
        )
      }

      console.log("✅ Características procesadas:", this.caracteristicasProcesadas.length)
    } catch (error) {
      console.warn("⚠️ Error procesando características:", error)
      this.caracteristicasProcesadas = []
    }
  }

  // ✅ CONTROL DE CANTIDAD
  aumentarCantidad(): void {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++
    }
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--
    }
  }

  // ✅ AGREGAR AL CARRITO
  agregarAlCarrito(): void {
    if (!this.producto) return

    if (this.producto.stock <= 0) {
      Swal.fire({
        title: "Sin stock",
        text: "Este producto no tiene stock disponible",
        icon: "warning",
        confirmButtonColor: "#dc3545",
      })
      return
    }

    if (this.cantidad > this.producto.stock) {
      Swal.fire({
        title: "Stock insuficiente",
        text: `Solo hay ${this.producto.stock} unidades disponibles`,
        icon: "warning",
        confirmButtonColor: "#dc3545",
      })
      return
    }

    const success = this.cartService.addToCart(this.producto, this.cantidad)

    if (success) {
      Swal.fire({
        title: "¡Producto agregado!",
        text: `${this.cantidad} ${this.cantidad === 1 ? "unidad" : "unidades"} de "${this.producto.nombre}" agregadas al carrito`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo agregar el producto al carrito",
        icon: "error",
        confirmButtonColor: "#dc3545",
      })
    }
  }

  // ✅ COMPRAR AHORA
  comprarAhora(): void {
    this.agregarAlCarrito()
    // Redirigir al carrito después de agregar
    setTimeout(() => {
      this.router.navigate(["/cart"])
    }, 1000)
  }

  // ✅ AGREGAR PRODUCTO RELACIONADO AL CARRITO
  agregarProductoRelacionado(producto: any): void {
    if (producto.stock <= 0) {
      Swal.fire({
        title: "Sin stock",
        text: "Este producto no tiene stock disponible",
        icon: "warning",
        confirmButtonColor: "#dc3545",
      })
      return
    }

    const success = this.cartService.addToCart(producto, 1)

    if (success) {
      Swal.fire({
        title: "¡Producto agregado!",
        text: `"${producto.nombre}" agregado al carrito`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })
    }
  }

  // ✅ MANEJAR ERROR DE IMAGEN (ahora solo si la URL es inválida, no para un default.png)
  onImageError(event: any): void {
    // Puedes dejar esto vacío o poner una imagen de fallback genérica si realmente la tienes
    // Por ejemplo, si tienes una imagen de "no-image.png" en tus assets:
    // event.target.src = 'assets/images/thumbs/no-image.png';
    // O simplemente no hacer nada si prefieres que la imagen no se muestre
    event.target.src = "" // Esto hará que la imagen no se muestre si falla
  }

  // ✅ OBTENER PORCENTAJE DE DESCUENTO
  getPorcentajeDescuento(): number {
    if (!this.producto || !this.producto.precio_oferta) return 0
    return Math.round(((this.producto.precio_venta - this.producto.precio_oferta) / this.producto.precio_venta) * 100)
  }

  // ✅ OBTENER ESTRELLAS DE RATING
  getEstrellas(): number[] {
    const rating = 4.8 // Por defecto
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0))
  }

  // ✅ OBTENER ESPECIFICACIONES (USAR DATOS PROCESADOS)
  getEspecificaciones(): any[] {
    return this.especificacionesProcesadas
  }

  // ✅ OBTENER CARACTERÍSTICAS TÉCNICAS (USAR DATOS PROCESADOS)
  getCaracteristicasTecnicas(): any[] {
    return this.caracteristicasProcesadas
  }

  // ✅ OBTENER PRECIO ACTUAL
  getPrecioActual(): number {
    if (!this.producto) return 0
    return this.producto.precio_oferta || this.producto.precio_venta
  }

  // ✅ OBTENER PRECIO ORIGINAL
  getPrecioOriginal(): number {
    if (!this.producto) return 0
    return this.producto.precio_venta
  }

  // ✅ VERIFICAR SI TIENE OFERTA
  tieneOferta(): boolean {
    return this.producto?.precio_oferta && this.producto.precio_oferta < this.producto.precio_venta
  }

  // ✅ OBTENER DESCRIPCIÓN SEGURA (ahora no se usa directamente en el HTML con [innerHTML])
  getDescripcion(): string {
    if (this.producto?.descripcion) {
      return this.producto.descripcion
    }
    if (this.detalles?.descripcion_detallada) {
      return this.detalles.descripcion_detallada
    }
    return "Descripción no disponible"
  }

  // ✅ OBTENER GARANTÍA SEGURA
  getGarantia(): string {
    if (this.detalles?.garantia) {
      return this.detalles.garantia
    }
    return "La Ley de Protección al Consumidor no prevé la devolución de este producto de calidad adecuada."
  }
}
