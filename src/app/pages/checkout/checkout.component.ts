import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../services/ubigeo.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule, 
    RouterLink, 
    ReactiveFormsModule, 
    BreadcrumbComponent, 
    ShippingComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    igv: 0,
    total: 0,
    cantidad_items: 0
  };

  // Ubigeo data
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

  // Estados del componente
  buscandoDocumento = false;
  procesandoPedido = false;
  isLoggedIn = false;

  // Costos de envío
  costoEnvio = {
    delivery: 30.00,    // Delivery en Lima
    provincia: 7.00,    // Envío a provincia
    recojo: 0.00        // Recojo en tienda
  };
  costoEnvioCalculado = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private ubigeoService: UbigeoService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkCartItems();
    this.loadCartData();
    this.loadUbigeoData();
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializar formulario
  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      numeroDocumento: [''],
      cliente: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      celular: ['', [Validators.required, Validators.pattern('^[9][0-9]{8}$')]],
      departamento: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      formaEnvio: ['', [Validators.required]],
      tipoPago: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
      observaciones: ['']
    });
  }

  // Verificar si hay items en el carrito
  private checkCartItems(): void {
    if (this.cartService.isEmpty()) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'No tienes productos en tu carrito para procesar la compra',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      }).then(() => {
        this.router.navigate(['/shop']);
      });
    }
  }

  // Cargar datos del carrito
  private loadCartData(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        if (items.length === 0) {
          this.router.navigate(['/shop']);
        }
      });

    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }

  // Cargar datos de ubigeo
  private loadUbigeoData(): void {
    this.ubigeoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
      }
    });
  }

  // Verificar estado de autenticación
  private checkAuthStatus(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          // Pre-llenar datos del usuario logueado
          this.checkoutForm.patchValue({
            cliente: user.name,
            email: user.email
          });
        }
      });
  }

  // Buscar datos por documento
  buscarDocumento(): void {
    const numeroDocumento = this.checkoutForm.get('numeroDocumento')?.value;
    
    if (!numeroDocumento || numeroDocumento.length < 8) {
      Swal.fire({
        title: 'Número inválido',
        text: 'Ingrese un número de documento válido',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.buscandoDocumento = true;

    // Simular búsqueda (aquí puedes integrar con API de RENIEC/SUNAT)
    setTimeout(() => {
      this.buscandoDocumento = false;
      
      if (numeroDocumento.length === 8) {
        // Simular datos de DNI
        this.checkoutForm.patchValue({
          cliente: 'JUAN PÉREZ GARCÍA'
        });
      } else if (numeroDocumento.length === 11) {
        // Simular datos de RUC
        this.checkoutForm.patchValue({
          cliente: 'EMPRESA EJEMPLO S.A.C.'
        });
      }

      Swal.fire({
        title: 'Datos encontrados',
        text: 'Se han cargado los datos del documento',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1500);
  }

  // Cambios en ubigeo
  onDepartamentoChange(): void {
    const departamentoId = this.checkoutForm.get('departamento')?.value;
    
    if (departamentoId) {
      this.ubigeoService.getProvincias(departamentoId).subscribe({
        next: (provincias) => {
          this.provincias = provincias;
          this.distritos = [];
          this.checkoutForm.patchValue({
            provincia: '',
            distrito: ''
          });
        },
        error: (error) => {
          console.error('Error cargando provincias:', error);
        }
      });
    } else {
      this.provincias = [];
      this.distritos = [];
    }
  }

  onProvinciaChange(): void {
    const departamentoId = this.checkoutForm.get('departamento')?.value;
    const provinciaId = this.checkoutForm.get('provincia')?.value;
    
    if (departamentoId && provinciaId) {
      this.ubigeoService.getDistritos(departamentoId, provinciaId).subscribe({
        next: (distritos) => {
          this.distritos = distritos;
          this.checkoutForm.patchValue({
            distrito: ''
          });
        },
        error: (error) => {
          console.error('Error cargando distritos:', error);
        }
      });
    } else {
      this.distritos = [];
    }
  }

  // Cambio en forma de envío
  onFormaEnvioChange(): void {
    const formaEnvio = this.checkoutForm.get('formaEnvio')?.value;
    
    switch (formaEnvio) {
      case 'delivery':
        this.costoEnvioCalculado = this.costoEnvio.delivery;
        break;
      case 'envio_provincia':
        this.costoEnvioCalculado = this.costoEnvio.provincia;
        break;
      case 'recojo_tienda':
        this.costoEnvioCalculado = this.costoEnvio.recojo;
        break;
      default:
        this.costoEnvioCalculado = 0;
    }
  }

  // Pedir cotización
  pedirCotizacion(): void {
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const formData = this.checkoutForm.value;
    const mensaje = this.generarMensajeWhatsApp(formData);
    const numeroWhatsApp = '51999999999'; // Reemplazar con tu número
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
  }

  // Pagar con tarjeta
  pagarConTarjeta(): void {
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.procesandoPedido = true;

    const formData = this.checkoutForm.value;
    const datosCheckout = {
      metodo_pago: 'tarjeta',
      direccion_envio: formData.direccion,
      telefono_contacto: formData.celular,
      observaciones: formData.observaciones || ''
    };

    this.cartService.procesarPedido(datosCheckout).subscribe({
      next: (response) => {
        this.procesandoPedido = false;
        
        Swal.fire({
          title: '¡Pedido creado exitosamente!',
          html: `
            <div class="text-center">
              <i class="ph ph-check-circle text-success mb-3" style="font-size: 4rem;"></i>
              <h5>Pedido #${response.pedido?.codigo_pedido || response.codigo_pedido}</h5>
              <p class="text-muted">Tu pedido ha sido registrado y será procesado pronto.</p>
              <p><strong>Total: S/ ${this.formatPrice(this.getTotalFinal())}</strong></p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#198754',
          confirmButtonText: 'Ver mis pedidos'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/mis-pedidos']);
          } else {
            this.router.navigate(['/shop']);
          }
        });
      },
      error: (error) => {
        this.procesandoPedido = false;
        console.error('Error al crear pedido:', error);
        Swal.fire({
          title: 'Error al crear pedido',
          text: error.error?.message || 'Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Submit del formulario
  onSubmit(): void {
    this.pagarConTarjeta();
  }

  // Marcar formulario como touched
  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  // Generar mensaje de WhatsApp
  private generarMensajeWhatsApp(formData: any): string {
    let mensaje = '🛒 *NUEVA COTIZACIÓN DE PEDIDO*\n\n';
    mensaje += `👤 *Cliente:* ${formData.cliente}\n`;
    mensaje += `📱 *Celular:* ${formData.celular}\n`;
    mensaje += `📧 *Email:* ${formData.email}\n`;
    mensaje += `📍 *Dirección:* ${formData.direccion}\n`;
    mensaje += `🚚 *Envío:* ${formData.formaEnvio}\n`;
    mensaje += `💳 *Pago:* ${formData.tipoPago}\n\n`;
    
    mensaje += '*PRODUCTOS:*\n';
    this.cartItems.forEach(item => {
      mensaje += `• ${item.nombre} x${item.cantidad} - S/ ${this.formatPrice(this.getItemSubtotal(item))}\n`;
    });
    
    mensaje += `\n💰 *TOTAL: S/ ${this.formatPrice(this.getTotalFinal())}*`;
    
    if (formData.observaciones) {
      mensaje += `\n\n📝 *Notas:* ${formData.observaciones}`;
    }

    return mensaje;
  }

  // Helpers
  getItemSubtotal(item: CartItem): number {
    const precio = typeof item.precio === 'number' ? item.precio : parseFloat(String(item.precio || 0));
    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : parseInt(String(item.cantidad || 0));
    
    if (isNaN(precio) || isNaN(cantidad)) {
      return 0;
    }
    
    return precio * cantidad;
  }

  getTotalFinal(): number {
    const subtotal = typeof this.cartSummary.subtotal === 'number' ? this.cartSummary.subtotal : 0;
    const envio = this.costoEnvioCalculado;
    
    return subtotal + envio;
  }

  formatPrice(price: number | string | null | undefined): string {
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
    
    if (isNaN(numPrice)) {
      return '0.00';
    }
    
    return numPrice.toFixed(2);
  }
}