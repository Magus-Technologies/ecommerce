import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

import { FacturacionService } from '../../../services/facturacion.service';
import { AlmacenService } from '../../../services/almacen.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { ClienteEditModalComponent } from '../../../components/cliente-edit-modal/cliente-edit-modal.component';
import { ProductoQuickModalComponent, ProductoQuickItem } from '../../../components/producto-quick-modal/producto-quick-modal.component';
import { PagoRapidoModalComponent, PagoResultado } from '../../../components/pago-rapido-modal/pago-rapido-modal.component';
import { ConfirmacionSunatModalComponent } from '../../../components/confirmacion-sunat-modal/confirmacion-sunat-modal.component';
import { SerieSelectorModalComponent } from '../../../components/serie-selector-modal/serie-selector-modal.component';
import {
  VentaFormData,
  VentaItemFormData,
  FacturarFormData,
  Cliente,
  Venta,
  Serie,
  Comprobante,
  TIPOS_DOCUMENTO,
  TIPOS_COMPROBANTE,
  TIPOS_AFECTACION_IGV,
  METODOS_PAGO
} from '../../../models/facturacion.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteEditModalComponent, ProductoQuickModalComponent, PagoRapidoModalComponent, ConfirmacionSunatModalComponent, SerieSelectorModalComponent],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class PosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del formulario
  ventaForm: VentaFormData = {
    cliente: {
      tipo_documento: TIPOS_DOCUMENTO.SIN_DOC,
      numero_documento: '',
      nombre: '',
      direccion: '',
      email: '',
      telefono: ''
    },
    items: [],
    descuento_global: 0,
    metodo_pago: METODOS_PAGO.EFECTIVO,
    observaciones: '',
    moneda: 'PEN'
  };

  // Productos disponibles (se cargan desde la API)
  productos: any[] = [];

  // Búsqueda y filtrado
  terminoBusqueda = '';
  productosFiltrados: any[] = [];

  // Producto seleccionado para agregar
  productoSeleccionado = {
    descripcion: '',
    cantidad: 1,
    precio: 0,
    codigo: '',
    stock: 0
  };

  // Tipo de documento seleccionado
  tipoDocumentoSeleccionado = 'NOTA_DE_VENTA';

  // Control IGV manual
  aplicarIgvEnVenta = true;

  // Pago
  pagaCon = 0;



  // Tasa de cambio (fija para PEN)
  tasaCambio = 1.00;

  // Estados
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // ID del cliente si ya existe en la base de datos
  clienteExistenteId: number | null = null;
  
  // Checkboxes de progreso
  get clienteCompletado(): boolean {
    return !!this.ventaForm.cliente.nombre && this.ventaForm.cliente.nombre.trim() !== '';
  }
  
  get productosCompletado(): boolean {
    return this.ventaForm.items.length > 0;
  }
  
  get pagoCompletado(): boolean {
    return !!this.ventaForm.metodo_pago;
  }
  
  get procesarHabilitado(): boolean {
    return this.clienteCompletado && this.productosCompletado && this.pagoCompletado;
  }
  fechaActual = new Date().toISOString().split('T')[0];
  ventaGuardada: Venta | null = null;

  // Modal de Cliente
  mostrarClienteModal = false;
  clienteParaModal: any | null = null;
  // Modal Producto
  mostrarProductoModal = false;
  // Modal Pago
  mostrarPagoModal = false;
  // Modal Confirmación SUNAT
  mostrarConfirmacionModal = false;
  // Modal Series
  mostrarSerieModal = false;
  // Modal Éxito Venta
  mostrarModalExito = false;
  // Modal Configuración
  mostrarConfiguracionModal = false;
  // Estado de envío de notificación
  enviandoNotificacion = false;
  notificacionEnviada = false;

  // FLUJO SECUENCIAL DE MODALES
  mostrarModalTipoComprobante = false;
  mostrarModalDatosCliente = false;
  comprobanteConfigurado = false; // Indica si ya se seleccionó tipo y serie
  procesandoVenta = false; // Flag para evitar procesamiento múltiple

  // NUEVAS PROPIEDADES PARA FACTURACIÓN ELECTRÓNICA
  seriesDisponibles = signal<Serie[]>([]);
  tipoComprobanteSeleccionado = signal<'01' | '03'>('03'); // Boleta por defecto
  serieSeleccionada = signal<Serie | null>(null);
  comprobanteGenerado = signal<Comprobante | null>(null);
  mostrarPanelComprobante = signal(false);

  // Estados de carga para acciones de comprobante
  facturando = signal(false);
  descargandoPDF = signal(false);
  descargandoXML = signal(false);
  enviandoEmail = signal(false);
  consultandoSunat = signal(false);

  // Constantes
  readonly TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;
  readonly TIPOS_COMPROBANTE = TIPOS_COMPROBANTE;
  readonly TIPOS_AFECTACION_IGV = TIPOS_AFECTACION_IGV;
  readonly METODOS_PAGO = METODOS_PAGO;

  // Unidades de medida disponibles
  readonly UNIDADES_MEDIDA = [
    { codigo: 'NIU', descripcion: 'Unidad (Bienes)' },
    { codigo: 'ZZ', descripcion: 'Servicio' },
    { codigo: 'KGM', descripcion: 'Kilogramo' },
    { codigo: 'MTR', descripcion: 'Metro' },
    { codigo: 'LTR', descripcion: 'Litro' },
    { codigo: 'UND', descripcion: 'Unidad' }
  ];

  // Cálculos mejorados
  get subtotal(): number {
    return this.ventaForm.items.reduce((sum, item) => {
      const subtotalItem = item.cantidad * item.precio_unitario;
      return sum + subtotalItem;
    }, 0);
  }

  get descuentoTotal(): number {
    const descuentoItems = this.ventaForm.items.reduce((sum, item) => sum + (item.descuento || 0), 0);
    return descuentoItems + (this.ventaForm.descuento_global || 0);
  }

  get subtotalNeto(): number {
    return this.subtotal - this.descuentoTotal;
  }

  get igv(): number {
    // Calcular IGV solo para items gravados
    return this.ventaForm.items.reduce((sum, item) => {
      if (item.tipo_afectacion_igv === TIPOS_AFECTACION_IGV.GRAVADO) {
        const subtotalItem = (item.cantidad * item.precio_unitario) - (item.descuento || 0);
        return sum + (subtotalItem * 0.18);
      }
      return sum;
    }, 0);
  }

  get total(): number {
    return this.subtotalNeto + this.igv;
  }

  // Métodos de cálculo para el template
  calcularSubtotal(): number {
    return this.subtotal;
  }

  calcularIGV(): number {
    return this.igv;
  }

  calcularTotal(): number {
    return this.total;
  }

  // Método para recalcular todos los items
  recalcularTodosLosItems(): void {
    this.ventaForm.items.forEach(item => {
      this.calcularItem(item);
    });
  }

  // Número siguiente para la serie seleccionada
  getNumeroSiguiente(): string {
    const serie = this.serieSeleccionada();
    if (!serie) return '--';
    const siguiente = (Number(serie.correlativo_actual) || 0) + 1;
    return String(siguiente);
  }

  // Vuelto calculado
  getVuelto(): number {
    const cambio = (this.pagaCon || 0) - this.calcularTotal();
    return cambio > 0 ? cambio : 0;
  }

  constructor(
    private facturacionService: FacturacionService,
    private almacenService: AlmacenService,
    private notificacionesService: NotificacionesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarSeriesDisponibles();
    this.cargarProductos(); // Cargar productos desde la API
    this.probarAPIs(); // Probar conectividad de APIs

    // FLUJO OBLIGATORIO: Mostrar modal de tipo de comprobante al iniciar
    setTimeout(() => {
      this.iniciarFlujoVenta();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // FLUJO SECUENCIAL DE VENTA
  // ============================================

  /**
   * PASO 1: Iniciar flujo de venta - Seleccionar tipo de comprobante
   */
  iniciarFlujoVenta(): void {
    console.log('🚀 Iniciando flujo de venta - PASO 1: Tipo de Comprobante');
    this.mostrarModalTipoComprobante = true;
    this.comprobanteConfigurado = false;
  }

  /**
   * PASO 2: Confirmar tipo de comprobante y serie
   */
  confirmarTipoComprobante(): void {
    // Validar que se haya seleccionado un tipo
    if (!this.tipoDocumentoSeleccionado) {
      this.error = '⚠️ Por favor seleccione un tipo de comprobante';
      return;
    }

    // Si NO es nota de venta, validar que haya serie
    if (this.tipoDocumentoSeleccionado !== 'NOTA_DE_VENTA' && !this.serieSeleccionada()) {
      this.error = '⚠️ Por favor seleccione una serie';
      return;
    }

    console.log('✅ Tipo de comprobante confirmado:', this.tipoDocumentoSeleccionado);
    this.comprobanteConfigurado = true;
    this.mostrarModalTipoComprobante = false;

    // PASO 3: Abrir modal de datos del cliente
    this.abrirModalCliente();
  }

  /**
   * PASO 3: Abrir modal de cliente según tipo de comprobante
   */
  abrirModalCliente(): void {
    console.log('📋 PASO 2: Configurar datos del cliente');

    // Limpiar datos previos del cliente
    this.ventaForm.cliente = {
      tipo_documento: this.tipoDocumentoSeleccionado === '01' ? TIPOS_DOCUMENTO.RUC : TIPOS_DOCUMENTO.DNI,
      numero_documento: '',
      nombre: '',
      direccion: '',
      email: '',
      telefono: ''
    };

    this.mostrarModalDatosCliente = true;
  }

  /**
   * PASO 4: Confirmar datos del cliente
   */
  confirmarDatosCliente(): void {
    // Validar según tipo de comprobante
    if (this.tipoDocumentoSeleccionado === '01') {
      // FACTURA: Requiere RUC completo
      if (!this.ventaForm.cliente.numero_documento || this.ventaForm.cliente.numero_documento.length !== 11) {
        this.error = '⚠️ Para Factura se requiere RUC (11 dígitos)';
        return;
      }
      if (!this.ventaForm.cliente.nombre || this.ventaForm.cliente.nombre.trim() === '') {
        this.error = '⚠️ Ingrese la razón social del cliente';
        return;
      }
      if (!this.ventaForm.cliente.direccion || this.ventaForm.cliente.direccion.trim() === '') {
        this.error = '⚠️ Ingrese la dirección fiscal';
        return;
      }
    } else if (this.tipoDocumentoSeleccionado === '03') {
      // BOLETA: Requiere al menos nombre
      if (!this.ventaForm.cliente.nombre || this.ventaForm.cliente.nombre.trim() === '') {
        this.error = '⚠️ Ingrese el nombre del cliente';
        return;
      }
    }

    console.log('✅ Datos del cliente confirmados');
    this.mostrarModalDatosCliente = false;

    // Ahora el usuario puede agregar productos
    this.success = '✅ Configuración completada. Puede agregar productos al carrito.';

    // Buscar si el cliente ya existe
    if (this.ventaForm.cliente.numero_documento) {
      this.buscarCliente();
    }
  }

  /**
   * Cancelar configuración y reiniciar flujo
   */
  cancelarConfiguracion(): void {
    this.mostrarModalTipoComprobante = false;
    this.mostrarModalDatosCliente = false;
    this.comprobanteConfigurado = false;

    // Preguntar si desea salir del POS
    if (confirm('¿Desea salir del Punto de Venta?')) {
      this.router.navigate(['/dashboard/ventas']);
    } else {
      // Reiniciar flujo
      setTimeout(() => this.iniciarFlujoVenta(), 300);
    }
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================

  cargarDatosIniciales(): void {
    // Cargar productos reales desde la API usando AlmacenService
    this.almacenService.obtenerProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos: any[]) => {
          this.productos = productos.filter(p => p.activo && p.stock > 0);
          this.productosFiltrados = [...this.productos];
          console.log('✅ Productos cargados desde AlmacenService:', this.productos.length);
        },
        error: (err: any) => {
          console.error('❌ Error al cargar productos:', err);
          // Mantener productos simulados como fallback
        }
      });
  }

  // Método para probar conectividad de APIs
  probarAPIs(): void {
    console.log('🔍 Probando conectividad de APIs...');

    // Probar endpoint de estado del sistema
    this.facturacionService.getEstadoSistema()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Estado del sistema:', response);
        },
        error: (error) => {
          console.error('❌ Error en estado del sistema:', error);
        }
      });

    // Probar endpoint de productos
    this.facturacionService.getProductos({ page: 1, per_page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Productos API:', response);
        },
        error: (error) => {
          console.error('❌ Error en productos API:', error);
        }
      });

    // Probar endpoint de clientes
    this.facturacionService.getClientes({ page: 1, per_page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Clientes API:', response);
        },
        error: (error) => {
          console.error('❌ Error en clientes API:', error);
        }
      });

    // Probar endpoint de series
    this.facturacionService.getSeries({ page: 1, per_page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Series API:', response);
        },
        error: (error) => {
          console.error('❌ Error en series API:', error);
        }
      });
  }

  cargarSeriesDisponibles(): void {
    this.facturacionService.getSeries({ estado: 'activo' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.seriesDisponibles.set(response.data);
            this.actualizarSerieSegunTipo();
          }
        },
        error: (error) => {
          console.error('Error al cargar series:', error);
          this.error = 'Error al cargar series de facturación';
        }
      });
  }


  actualizarSerieSegunTipo(): void {
    const series = this.seriesDisponibles();
    const tipo = this.tipoDocumentoSeleccionado;

    const seriesPorTipo = series.filter(s => s.tipo_comprobante === tipo);
    if (seriesPorTipo.length > 0) {
      this.serieSeleccionada.set(seriesPorTipo[0]);
    } else {
      this.serieSeleccionada.set(null);
    }
  }

  onTipoComprobanteChange(): void {
    // Validar que para Factura (01) se requiere RUC
    if (this.tipoDocumentoSeleccionado === '01') {
      if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        this.error = 'Para emitir Factura se requiere RUC del cliente';
        this.tipoDocumentoSeleccionado = '03';
        return;
      }

      const ruc = this.ventaForm.cliente.numero_documento;
      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        this.error = 'El RUC ingresado no es válido (debe tener 11 dígitos)';
        this.tipoDocumentoSeleccionado = '03';
        return;
      }
    }

    this.actualizarSerieSegunTipo();
    this.error = null;
  }


  validarRUC(): void {
    if (!this.ventaForm.cliente.numero_documento) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.facturacionService.validarRUC(this.ventaForm.cliente.numero_documento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success && response.data) {
            // Actualizar datos del cliente con información de SUNAT
            this.ventaForm.cliente.nombre = response.data.razon_social || this.ventaForm.cliente.nombre;
            this.ventaForm.cliente.direccion = response.data.direccion || this.ventaForm.cliente.direccion;
            this.success = 'RUC validado exitosamente con SUNAT';
            this.error = null;
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al validar RUC:', err);
          this.error = 'Error al validar RUC con SUNAT. Puede continuar con los datos manuales.';
          this.success = null;
        }
      });
  }

  // ============================================
  // GESTIÓN DE ITEMS
  // ============================================

  agregarItemVacio(): void {
    const nuevoItem: VentaItemFormData = {
      descripcion: '',
      unidad_medida: 'NIU',
      cantidad: 1,
      precio_unitario: 0,
      tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO,
      descuento: 0
    };
    this.ventaForm.items.push(nuevoItem);
  }

  agregarProducto(producto: any): void {
    console.log('🛒 Agregando producto:', producto);

    const itemExistente = this.ventaForm.items.find(item =>
      item.producto_id === producto.id
    );

    if (itemExistente) {
      itemExistente.cantidad += 1;
      this.calcularItem(itemExistente);
      console.log('📈 Cantidad incrementada para producto existente');
    } else {
      // Crear nuevo item con todos los campos necesarios para facturación
      const nuevoItem: VentaItemFormData = {
        producto_id: producto.id,
        codigo_producto: producto.codigo_producto || producto.codigo || `PROD-${producto.id}`,
        descripcion: producto.nombre,
        unidad_medida: 'NIU',
        cantidad: 1,
        precio_unitario: producto.precio_venta || producto.precio || 0,
        tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO,
        descuento: 0
      };

      this.calcularItem(nuevoItem);
      this.ventaForm.items.push(nuevoItem);
      console.log('✅ Nuevo producto agregado:', nuevoItem);
    }
  }

  calcularItem(item: VentaItemFormData): void {
    const subtotal = item.cantidad * item.precio_unitario;
    const descuento = item.descuento || 0;
    const subtotalNeto = subtotal - descuento;

    let igv = 0;
    if (item.tipo_afectacion_igv === TIPOS_AFECTACION_IGV.GRAVADO) {
      igv = subtotalNeto * 0.18;
    }

    item.subtotal = subtotal;
    item.igv = igv;
    item.total = subtotalNeto + igv;
  }

  eliminarItem(index: number): void {
    this.ventaForm.items.splice(index, 1);
    // No agregar item vacío automáticamente
  }

  incrementarCantidad(index: number): void {
    if (index >= 0 && index < this.ventaForm.items.length) {
      this.ventaForm.items[index].cantidad += 1;
      this.calcularItem(this.ventaForm.items[index]);
    }
  }

  decrementarCantidad(index: number): void {
    if (index >= 0 && index < this.ventaForm.items.length) {
      if (this.ventaForm.items[index].cantidad > 1) {
        this.ventaForm.items[index].cantidad -= 1;
        this.calcularItem(this.ventaForm.items[index]);
      }
    }
  }

  // Método para actualizar cantidad directamente
  actualizarCantidad(index: number, cantidad: number): void {
    if (index >= 0 && index < this.ventaForm.items.length && cantidad > 0) {
      this.ventaForm.items[index].cantidad = cantidad;
      this.calcularItem(this.ventaForm.items[index]);
    }
  }

  // Método para actualizar precio directamente
  actualizarPrecio(index: number, precio: number): void {
    if (index >= 0 && index < this.ventaForm.items.length && precio >= 0) {
      this.ventaForm.items[index].precio_unitario = precio;
      this.calcularItem(this.ventaForm.items[index]);
    }
  }

  // ============================================
  // GESTIÓN DE CLIENTES
  // ============================================

  /**
   * Buscar cliente en base de datos para autocompletar
   * Si no existe, el backend lo creará automáticamente al procesar la venta
   */
  buscarCliente(): void {
    const numeroDoc = this.ventaForm.cliente.numero_documento;
    const tipoDoc = this.ventaForm.cliente.tipo_documento;

    if (!numeroDoc || numeroDoc.trim() === '') {
      console.log('⚠️ Número de documento vacío');
      return;
    }

    console.log(`🔍 Buscando cliente: ${tipoDoc} - ${numeroDoc}`);

    this.facturacionService.getClientes({
      documento: numeroDoc
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            const cliente = response.data[0];

            // Autocompletar campos con datos del cliente encontrado
            this.ventaForm.cliente = {
              tipo_documento: cliente.tipo_documento || tipoDoc,
              numero_documento: cliente.numero_documento,
              nombre: (cliente as any).razon_social || cliente.nombre || '',
              direccion: cliente.direccion || '',
              email: cliente.email || '',
              telefono: cliente.telefono || ''
            };

            this.success = '✅ Cliente encontrado y cargado';
            console.log('✅ Cliente encontrado:', cliente);
          } else {
            console.log('ℹ️ Cliente no encontrado - Se creará automáticamente');
            this.success = 'ℹ️ Cliente nuevo - Complete los datos';
          }
        },
        error: (error) => {
          console.log('ℹ️ Cliente no encontrado - Se creará automáticamente');
        }
      });
  }

  // ============================================
  // OPERACIONES DE VENTA
  // ============================================

  procesarVenta(): void {
    console.log('🔵 procesarVenta() llamado - Modal:', this.mostrarPagoModal, 'Procesando:', this.procesandoVenta);

    // PROTECCIÓN: Evitar procesamiento múltiple
    if (this.procesandoVenta || this.mostrarPagoModal) {
      console.log('⚠️ Ya está procesando o modal abierto, ignorando...');
      return;
    }

    // Validar que se haya configurado el comprobante primero
    if (!this.comprobanteConfigurado) {
      this.error = '⚠️ Por favor complete la configuración de comprobante y cliente';
      this.iniciarFlujoVenta();
      return;
    }

    // Validar que se haya seleccionado un tipo de comprobante válido
    if (!this.tipoDocumentoSeleccionado || this.tipoDocumentoSeleccionado === '') {
      this.error = '⚠️ Por favor seleccione el tipo de comprobante';
      this.iniciarFlujoVenta();
      return;
    }

    // Validar que haya productos en el carrito
    if (this.ventaForm.items.length === 0) {
      this.error = '⚠️ Agregue productos al carrito antes de procesar la venta';
      return;
    }

    // Si es factura o boleta, validar que haya una serie seleccionada
    if (this.tipoDocumentoSeleccionado !== 'NOTA_DE_VENTA' && !this.serieSeleccionada()) {
      this.error = '⚠️ Por favor seleccione una serie para el comprobante';
      this.iniciarFlujoVenta();
      return;
    }

    // Validar datos del cliente según el tipo de comprobante
    if (this.tipoDocumentoSeleccionado === '01') {
      // Factura requiere RUC
      if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        this.error = '⚠️ Para emitir Factura se requiere RUC del cliente';
        this.abrirModalCliente();
        return;
      }
    }

    // Si ya hay un método de pago seleccionado, procesar directamente
    if (this.ventaForm.metodo_pago && this.ventaForm.metodo_pago !== '') {
      console.log('💰 Método de pago ya seleccionado:', this.ventaForm.metodo_pago);
      console.log('⚡ Procesando venta directamente...');

      this.procesandoVenta = true;

      // Procesar directamente sin abrir modal
      if (this.tipoDocumentoSeleccionado === 'NOTA_DE_VENTA') {
        this.guardarVenta();
      } else {
        this.emitirFlujoEncadenado();
      }

      // Resetear flag
      setTimeout(() => {
        this.procesandoVenta = false;
      }, 1000);

      return;
    }

    console.log('💳 PASO 4: Abrir modal de método de pago');

    // Marcar como procesando
    this.procesandoVenta = true;

    // Abrir modal de método de pago
    this.mostrarPagoModal = true;
  }

  /**
   * PASO 5: Confirmar pago y procesar venta final
   */
  confirmarYProcesarVenta(resultado: PagoResultado): void {
    console.log('✅ Método de pago confirmado:', resultado.metodo);

    // Cerrar modal inmediatamente
    this.mostrarPagoModal = false;

    // Actualizar método de pago
    this.ventaForm.metodo_pago = resultado.metodo as any;

    // Agregar información adicional a observaciones si aplica
    if (resultado.metodo === 'EFECTIVO') {
      const vuelto = resultado.vuelto ?? 0;
      if (vuelto > 0) {
        this.ventaForm.observaciones = `${this.ventaForm.observaciones || ''} Vuelto: S/ ${vuelto.toFixed(2)}`.trim();
      }
    } else if (resultado.referencia) {
      this.ventaForm.observaciones = `${this.ventaForm.observaciones || ''} Ref: ${resultado.referencia}`.trim();
    }

    // Pequeño delay para asegurar que el modal se cierre antes de procesar
    setTimeout(() => {
      // Procesar según el tipo
      if (this.tipoDocumentoSeleccionado === 'NOTA_DE_VENTA') {
        // Solo guardar como nota de venta
        this.guardarVenta();
      } else {
        // Guardar y facturar
        this.emitirFlujoEncadenado();
      }

      // Resetear flag después de procesar
      this.procesandoVenta = false;
    }, 100);
  }

  puedeProcesarVenta(): boolean {
    return this.validarVentaSinErrores();
  }

  limpiarVenta(): void {
    this.limpiarFormulario();
    this.comprobanteGenerado.set(null);
    this.ventaGuardada = null;
    this.mostrarPanelComprobante.set(false);
  }

  guardarVenta(): void {
    if (!this.validarVenta()) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    // Primero buscar o crear cliente
    this.facturacionService.getClienteByDocumento(
      this.ventaForm.cliente.tipo_documento,
      this.ventaForm.cliente.numero_documento
    )
      .pipe(
        takeUntil(this.destroy$),
        // Si no existe, crear cliente
        catchError(() => {
          const nuevoCliente: any = {
            tipo_documento: this.ventaForm.cliente.tipo_documento as any,
            numero_documento: this.ventaForm.cliente.numero_documento,
            nombres: this.ventaForm.cliente.nombre.split(" ")[0] || this.ventaForm.cliente.nombre, apellidos: this.ventaForm.cliente.nombre.split(" ").slice(1).join(" ") || "",
            direccion: this.ventaForm.cliente.direccion,
            email: this.ventaForm.cliente.email,
            telefono: this.ventaForm.cliente.telefono
          };
          return this.facturacionService.createCliente(nuevoCliente);
        })
      )
      .subscribe({
        next: (clienteResponse: any) => {
          // Obtener el cliente de la respuesta
          const cliente = clienteResponse.data || clienteResponse;

          // Preparar datos para envío según estructura de API
          const datosVenta: any = {
            cliente_id: cliente.id,
            tipo_documento: this.tipoDocumentoSeleccionado,
            fecha_venta: new Date().toISOString().split('T')[0],
            hora_venta: new Date().toTimeString().split(' ')[0],
            metodo_pago: this.ventaForm.metodo_pago,
            descuento_global: this.ventaForm.descuento_global,
            observaciones: this.ventaForm.observaciones,
            moneda: this.ventaForm.moneda,
            productos: this.ventaForm.items.map(item => ({
              producto_id: item.producto_id,
              codigo_producto: item.codigo_producto,
              descripcion: item.descripcion,
              unidad_medida: item.unidad_medida,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              descuento: item.descuento || 0,
              tipo_afectacion_igv: item.tipo_afectacion_igv
            }))
          };

          console.log('📤 Enviando venta con cliente_id:', datosVenta);

          // Ahora sí crear la venta
          this.facturacionService.createVenta(datosVenta)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.loading = false;
                if (response.success && response.data) {
                  this.ventaGuardada = response.data;
                  this.success = 'Venta guardada exitosamente';
                  // No limpiar formulario automáticamente, permitir facturar
                } else {
                  this.error = response.message || 'Error al guardar la venta';
                }
              },
              error: (error) => {
                this.loading = false;
                this.error = error.error?.message || 'Error al guardar la venta';
                console.error('Error detallado:', error);
              }
            });
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error al procesar cliente: ' + (error?.error?.message || 'Error desconocido');
          console.error('Error al procesar cliente:', error);
        }
      });
  }

  facturarVenta(): void {
    if (!this.ventaGuardada) {
      this.error = 'Primero debe guardar la venta';
      return;
    }

    if (!this.serieSeleccionada()) {
      this.error = 'Debe seleccionar una serie';
      return;
    }

    this.facturando.set(true);
    this.error = null;

    const datosFacturacion: FacturarFormData = {
      tipo_comprobante: this.tipoDocumentoSeleccionado as '01' | '03',
      serie: this.serieSeleccionada()!.serie,
      metodo_pago: this.ventaForm.metodo_pago,
      observaciones: this.ventaForm.observaciones
    };

    this.facturacionService.facturarVenta(this.ventaGuardada.id!, datosFacturacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.facturando.set(false);
          if (response.success && response.data) {
            this.comprobanteGenerado.set(response.data);
            this.mostrarPanelComprobante.set(true);
            this.success = `Comprobante ${response.data.numero_completo} generado exitosamente`;
            this.error = null;
          } else {
            this.error = response.message || 'Error al emitir el comprobante';
          }
        },
        error: (error) => {
          this.facturando.set(false);
          this.error = error.error?.message || 'Error al emitir el comprobante';
        }
      });
  }

  // ============================================
  // ACCIONES DE COMPROBANTE
  // ============================================

  descargarPDF(): void {
    const comprobante = this.comprobanteGenerado();
    if (!comprobante || this.descargandoPDF()) return;

    this.descargandoPDF.set(true);

    this.facturacionService.downloadComprobantePdf(comprobante.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.descargandoPDF.set(false);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${comprobante.numero_completo}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.descargandoPDF.set(false);
          console.error('Error al descargar PDF:', error);
          this.error = 'Error al descargar PDF';
        }
      });
  }

  descargarXML(): void {
    const comprobante = this.comprobanteGenerado();
    if (!comprobante || this.descargandoXML()) return;

    this.descargandoXML.set(true);

    this.facturacionService.downloadXml(comprobante.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.descargandoXML.set(false);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${comprobante.numero_completo}.xml`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.descargandoXML.set(false);
          console.error('Error al descargar XML:', error);
          this.error = 'Error al descargar XML';
        }
      });
  }

  enviarPorEmail(): void {
    const comprobante = this.comprobanteGenerado();
    if (!comprobante || this.enviandoEmail()) return;

    const email = this.ventaForm.cliente.email;
    if (!email) {
      this.error = 'El cliente no tiene email registrado';
      return;
    }

    this.enviandoEmail.set(true);

    this.facturacionService.enviarEmail(comprobante.venta_id!, email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.enviandoEmail.set(false);
          this.success = `Comprobante enviado a ${email}`;
        },
        error: (error) => {
          this.enviandoEmail.set(false);
          console.error('Error al enviar email:', error);
          this.error = 'Error al enviar comprobante por email';
        }
      });
  }

  enviarEmail(): void {
    this.enviarPorEmail();
  }

  consultarEstadoSunat(): void {
    const comprobante = this.comprobanteGenerado();
    if (!comprobante || this.consultandoSunat()) return;

    this.consultandoSunat.set(true);

    this.facturacionService.consultarEstado(comprobante.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.consultandoSunat.set(false);
          if (response.success && response.data) {
            // Actualizar comprobante con nuevo estado
            this.comprobanteGenerado.set({
              ...comprobante,
              estado_sunat: response.data.estado_sunat,
              mensaje_sunat: response.data.mensaje_sunat
            });
            this.success = `Estado SUNAT: ${response.data.estado_sunat}`;
          }
        },
        error: (error) => {
          this.consultandoSunat.set(false);
          console.error('Error al consultar SUNAT:', error);
          this.error = 'Error al consultar estado en SUNAT';
        }
      });
  }

  consultarSunat(): void {
    this.consultarEstadoSunat();
  }

  cerrarPanelComprobante(): void {
    this.mostrarPanelComprobante.set(false);
    // Preguntar si desea nueva venta
    if (confirm('¿Desea iniciar una nueva venta?')) {
      this.limpiarFormulario();
      this.comprobanteGenerado.set(null);
      this.ventaGuardada = null;
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private validarVentaSinErrores(): boolean {
    // Validar cliente
    if (!this.ventaForm.cliente.nombre.trim()) {
      return false;
    }

    // Validar items
    if (this.ventaForm.items.length === 0 ||
      this.ventaForm.items.every(item => !item.descripcion.trim())) {
      return false;
    }

    // Validar que todos los items tengan datos válidos
    for (let i = 0; i < this.ventaForm.items.length; i++) {
      const item = this.ventaForm.items[i];
      if (!item.descripcion.trim()) {
        return false;
      }
      if (item.cantidad <= 0) {
        return false;
      }
      if (item.precio_unitario <= 0) {
        return false;
      }
    }

    // Validar total
    if (this.total <= 0) {
      return false;
    }

    // Validar serie solo si se va a facturar
    if (this.tipoDocumentoSeleccionado !== 'NOTA_DE_VENTA' && !this.serieSeleccionada()) {
      return false;
    }

    // Validar que para Factura se requiere RUC
    if (this.tipoDocumentoSeleccionado === '01') {
      if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        return false;
      }

      const ruc = this.ventaForm.cliente.numero_documento;
      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        return false;
      }
    }

    // Validar límite de boleta sin documento
    if (this.tipoDocumentoSeleccionado === '03' &&
      this.ventaForm.cliente.tipo_documento === TIPOS_DOCUMENTO.SIN_DOC &&
      this.total > 700) {
      return false;
    }

    return true;
  }

  private validarVenta(): boolean {
    // Limpiar errores previos
    this.error = null;

    // Validar cliente
    if (!this.ventaForm.cliente.nombre.trim()) {
      this.error = 'El nombre del cliente es obligatorio';
      return false;
    }

    // Validar items
    if (this.ventaForm.items.length === 0 ||
      this.ventaForm.items.every(item => !item.descripcion.trim())) {
      this.error = 'Debe agregar al menos un producto';
      return false;
    }

    // Validar que todos los items tengan datos válidos
    for (let i = 0; i < this.ventaForm.items.length; i++) {
      const item = this.ventaForm.items[i];
      if (!item.descripcion.trim()) {
        this.error = `El item ${i + 1} debe tener una descripción`;
        return false;
      }
      if (item.cantidad <= 0) {
        this.error = `El item ${i + 1} debe tener una cantidad mayor a 0`;
        return false;
      }
      if (item.precio_unitario <= 0) {
        this.error = `El item ${i + 1} debe tener un precio mayor a 0`;
        return false;
      }
    }

    // Validar total
    if (this.total <= 0) {
      this.error = 'El total debe ser mayor a 0';
      return false;
    }

    // Validar serie solo si se va a facturar
    if (this.tipoDocumentoSeleccionado !== 'NOTA_DE_VENTA' && !this.serieSeleccionada()) {
      this.error = 'Debe seleccionar una serie para facturar';
      return false;
    }

    // Validar que para Factura se requiere RUC
    if (this.tipoDocumentoSeleccionado === '01') {
      if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        this.error = 'Para emitir Factura se requiere RUC del cliente';
        return false;
      }

      const ruc = this.ventaForm.cliente.numero_documento;
      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        this.error = 'El RUC ingresado no es válido (debe tener 11 dígitos)';
        return false;
      }
    }

    // Validar límite de boleta sin documento
    if (this.tipoDocumentoSeleccionado === '03' &&
      this.ventaForm.cliente.tipo_documento === TIPOS_DOCUMENTO.SIN_DOC &&
      this.total > 700) {
      this.error = 'Para boletas sin documento, el monto máximo es S/ 700.00';
      return false;
    }

    return true;
  }

  private limpiarFormulario(): void {
    this.ventaForm = {
      cliente: {
        tipo_documento: TIPOS_DOCUMENTO.SIN_DOC,
        numero_documento: '',
        nombre: '',
        direccion: '',
        email: '',
        telefono: ''
      },
      items: [],
      descuento_global: 0,
      metodo_pago: METODOS_PAGO.EFECTIVO,
      observaciones: '',
      moneda: 'PEN'
    };
    // No agregar item vacío automáticamente
  }

  cerrarMensajes(): void {
    this.error = null;
    this.success = null;
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  irAVentas(): void {
    this.router.navigate(['/dashboard/ventas']);
  }

  irAComprobantes(): void {
    this.router.navigate(['/dashboard/comprobantes']);
  }

  // ============================================
  // MODAL DE CLIENTE (reutiliza ClienteEditModalComponent)
  // ============================================

  abrirClienteModal(): void {
    const nombre = this.ventaForm.cliente.nombre || '';
    const partes = nombre.trim().split(' ');
    const nombres = partes.slice(0, -1).join(' ') || nombre;
    const apellidos = partes.length > 1 ? partes[partes.length - 1] : '';

    this.clienteParaModal = {
      id_cliente: undefined,
      tipo_documento: this.ventaForm.cliente.tipo_documento,
      numero_documento: this.ventaForm.cliente.numero_documento,
      nombres: nombres,
      apellidos: apellidos,
      nombre: nombre,
      direccion: this.ventaForm.cliente.direccion,
      email: this.ventaForm.cliente.email,
      telefono: this.ventaForm.cliente.telefono,
      estado: true
    };
    this.mostrarClienteModal = true;
  }

  cerrarClienteModal(): void {
    this.mostrarClienteModal = false;
  }

  onClienteActualizado(clienteActualizado: any): void {
    this.ventaForm.cliente = {
      tipo_documento: clienteActualizado.tipo_documento || this.ventaForm.cliente.tipo_documento,
      numero_documento: clienteActualizado.numero_documento || this.ventaForm.cliente.numero_documento,
      nombre: clienteActualizado.nombre || `${clienteActualizado.nombres || ''} ${clienteActualizado.apellidos || ''}`.trim(),
      direccion: clienteActualizado.direccion || '',
      email: clienteActualizado.email || '',
      telefono: clienteActualizado.telefono || ''
    };
    
    // Buscar si el cliente ya existe en la base de datos
    if (this.ventaForm.cliente.numero_documento) {
      this.buscarCliente();
    } else {
      this.clienteExistenteId = null;
    }
    
    this.mostrarClienteModal = false;
  }

  onClienteGuardado(cliente: any): void {
    this.onClienteActualizado(cliente);
  }



  // ============================================
  // MODAL DE PRODUCTO RÁPIDO
  // ============================================
  abrirProductoModal(): void {
    this.mostrarProductoModal = true;
  }

  cerrarProductoModal(): void {
    this.mostrarProductoModal = false;
  }

  onSeleccionProducto(prod: ProductoQuickItem): void {
    const producto = {
      id: prod.id,
      codigo: prod.codigo || prod.codigo_producto || `PROD-${prod.id}`,
      nombre: prod.nombre,
      precio: prod.precio,
      stock: prod.stock ?? 0
    } as any;
    this.agregarProducto(producto);
    this.mostrarProductoModal = false;
  }

  // Wrapper para manejar eventos del modal
  onSeleccionProductoEvent(event: any): void {
    if (event && event.id) {
      this.onSeleccionProducto(event);
    }
  }

  onProductoSeleccionado(prod: ProductoQuickItem): void {
    this.onSeleccionProducto(prod);
  }

  // ============================================
  // MODAL DE PAGO RÁPIDO
  // ============================================
  abrirPagoModal(): void {
    this.mostrarPagoModal = true;
  }

  cerrarPagoModal(): void {
    console.log('🔴 Cerrando modal de pago');
    this.mostrarPagoModal = false;
    this.procesandoVenta = false; // Resetear flag
  }

  onPagoProcesado(resultado: PagoResultado): void {
    // Usar el nuevo flujo de confirmación y procesamiento
    this.confirmarYProcesarVenta(resultado);
  }

  // Wrapper para manejar eventos del modal de pago
  onPagoProcesadoEvent(event: any): void {
    if (event && event.metodo) {
      this.onPagoProcesado(event);
    }
  }

  // ============================================
  // MODAL CONFIRMACIÓN SUNAT
  // ============================================
  abrirConfirmacionSunat(): void {
    // Validación mínima previa
    if (!this.validarVenta()) return;
    this.mostrarConfirmacionModal = true;
  }

  cerrarConfirmacionSunat(): void {
    this.mostrarConfirmacionModal = false;
  }

  cerrarConfirmacionModal(): void {
    this.cerrarConfirmacionSunat();
  }

  onConfirmacionSunat(confirmado: boolean): void {
    if (confirmado) {
      this.confirmarEmisionSunat();
    } else {
      this.cerrarConfirmacionSunat();
    }
  }

  // Wrapper para manejar eventos del modal de confirmación
  onConfirmacionSunatEvent(event: any): void {
    if (typeof event === 'boolean') {
      this.onConfirmacionSunat(event);
    }
  }

  confirmarEmisionSunat(): void {
    this.mostrarConfirmacionModal = false;
    this.emitirFlujoEncadenado();
  }

  // ============================================
  // MODAL SERIES
  // ============================================
  abrirSerieModal(): void { this.mostrarSerieModal = true; }
  cerrarSerieModal(): void { this.mostrarSerieModal = false; }
  onSeleccionSerie(serie: any): void {
    const match = this.seriesDisponibles().find(s => s.serie === serie.serie && s.tipo_comprobante === serie.tipo_comprobante);
    if (match) {
      // Asegurar que solo se establezcan tipos válidos para emisión (01 o 03)
      const tipo = match.tipo_comprobante === '01' || match.tipo_comprobante === '03' ? match.tipo_comprobante : '03';
      this.tipoDocumentoSeleccionado = tipo;
      this.serieSeleccionada.set(match);
    }
    this.mostrarSerieModal = false;
  }

  // Wrapper para manejar eventos del modal de series
  onSeleccionSerieEvent(event: any): void {
    if (event && event.serie) {
      this.onSeleccionSerie(event);
    }
  }

  onSerieSeleccionada(serie: any): void {
    this.onSeleccionSerie(serie);
  }

  // ============================================
  // EMISIÓN ENCADENADA (GUARDAR → EMITIR)
  // ============================================
  private emitirFlujoEncadenado(): void {
    // Validación mínima
    if (!this.validarVenta()) return;

    // Si ya existe venta guardada, emitir directamente
    if (this.ventaGuardada && this.ventaGuardada.id) {
      this.facturarVenta();
      return;
    }

    // Guardar y, al completar, emitir
    this.loading = true;
    this.error = null;
    this.success = null;

    // Preparar datos para envío según documentación API
    const datosVenta: any = {
      productos: this.ventaForm.items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento_unitario: item.descuento || 0
      })),
      descuento_total: this.ventaForm.descuento_global || 0,
      requiere_factura: this.tipoDocumentoSeleccionado !== 'NOTA_DE_VENTA',
      metodo_pago: this.ventaForm.metodo_pago || 'efectivo',
      observaciones: this.ventaForm.observaciones || ''
    };

    // Si el cliente ya existe (tiene ID guardado), enviar solo el ID
    if (this.clienteExistenteId) {
      datosVenta.cliente_id = this.clienteExistenteId;
      console.log('📤 Enviando venta con cliente existente ID:', this.clienteExistenteId);
    } else {
      // Si no hay cliente_id, el backend lo manejará
      console.log('📤 Enviando venta sin cliente_id (backend creará cliente genérico)');
    }

    // Crear la venta
    this.facturacionService.createVenta(datosVenta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          // Manejar diferentes formatos de respuesta del backend
          if (response.success && response.data) {
            this.ventaGuardada = response.data;
            this.success = 'Venta registrada exitosamente';
            this.mostrarModalExito = true;
          } else if (response.venta) {
            // Formato alternativo: {message: string, venta: Venta}
            this.ventaGuardada = response.venta;
            this.success = response.message || 'Venta registrada exitosamente';
            this.mostrarModalExito = true;
          } else {
            this.error = 'No se pudo guardar la venta';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error?.error?.message || 'Error al guardar venta';
          console.error('Error detallado:', error);
        }
      });
  }

  // Método eliminado - usar confirmarYProcesarVenta() en su lugar

  // Método para agregar producto manualmente
  agregarProductoManual(): void {
    if (!this.productoSeleccionado.descripcion || this.productoSeleccionado.cantidad <= 0 || this.productoSeleccionado.precio <= 0) {
      this.error = 'Por favor complete todos los campos del producto correctamente';
      return;
    }

    const nuevoItem: VentaItemFormData = {
      producto_id: 0, // ID temporal para productos manuales
      descripcion: this.productoSeleccionado.descripcion,
      codigo_producto: this.productoSeleccionado.codigo || 'MANUAL',
      cantidad: this.productoSeleccionado.cantidad,
      precio_unitario: this.productoSeleccionado.precio,
      descuento: 0,
      tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO,
      unidad_medida: 'NIU'
    };

    this.calcularItem(nuevoItem);
    this.ventaForm.items.push(nuevoItem);

    // Limpiar formulario
    this.productoSeleccionado = {
      descripcion: '',
      cantidad: 1,
      precio: 0,
      codigo: '',
      stock: 0
    };

    this.success = 'Producto agregado correctamente';
    this.error = null;
  }


  // Método para manejar cambio de tipo de documento
  onTipoDocumentoChange(): void {
    // Limpiar mensajes de error previos
    this.error = null;

    // Validar y ajustar según el tipo de documento seleccionado
    switch (this.tipoDocumentoSeleccionado) {
      case '01': // FACTURA
        console.log('✅ Factura seleccionada - Se requiere RUC del cliente');
        // Validar que el cliente tenga RUC
        if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
          this.error = '⚠️ Para Factura se requiere RUC. Por favor ingrese el RUC del cliente.';
          // Cambiar automáticamente a RUC
          this.ventaForm.cliente.tipo_documento = TIPOS_DOCUMENTO.RUC;
        }
        // Actualizar series disponibles
        this.actualizarSerieSegunTipo();
        break;

      case '03': // BOLETA
        console.log('✅ Boleta seleccionada - DNI o datos mínimos del cliente');
        // Actualizar series disponibles
        this.actualizarSerieSegunTipo();
        break;

      case 'NOTA_DE_VENTA':
        console.log('✅ Nota de Venta seleccionada - No requiere comprobante electrónico');
        // Limpiar serie seleccionada
        this.serieSeleccionada.set(null);
        break;

      default:
        console.warn('⚠️ Tipo de documento no reconocido:', this.tipoDocumentoSeleccionado);
    }
  }

  // ============================================
  // MÉTODOS PARA CARGAR DATOS REALES DESDE API
  // ============================================

  /**
   * Cargar productos desde la API
   */
  cargarProductos(): void {
    this.facturacionService.getProductos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productos = response.data;
          this.productosFiltrados = [...this.productos];
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar productos';
      }
    });
  }

  /**
   * Buscar productos por término de búsqueda
   * CORREGIDO: Busca SOLO en nombre y código del producto, no en categorías ni descripciones
   */
  buscarProductos(termino: string): void {
    console.log('🔍 Buscando productos con término:', termino);

    if (!termino || termino.trim() === '') {
      this.productosFiltrados = [...this.productos];
      console.log('📦 Productos sin filtro:', this.productosFiltrados.length);
      return;
    }

    const terminoLower = termino.toLowerCase().trim();

    // Filtrar SOLO por nombre y código del producto
    const productosFiltradosLocal = this.productos.filter(producto => {
      const nombre = producto.nombre?.toLowerCase() || '';
      const codigo = producto.codigo_producto?.toLowerCase() || producto.codigo?.toLowerCase() || '';

      // Buscar ÚNICAMENTE en nombre y código del producto
      return nombre.includes(terminoLower) || codigo.includes(terminoLower);
    });

    // Ordenar resultados: primero los que comienzan con el término
    this.productosFiltrados = productosFiltradosLocal.sort((a, b) => {
      const nombreA = a.nombre?.toLowerCase() || '';
      const nombreB = b.nombre?.toLowerCase() || '';
      const codigoA = a.codigo_producto?.toLowerCase() || a.codigo?.toLowerCase() || '';
      const codigoB = b.codigo_producto?.toLowerCase() || b.codigo?.toLowerCase() || '';

      // Prioridad 1: Nombre comienza con el término
      const aStartsWithNombre = nombreA.startsWith(terminoLower);
      const bStartsWithNombre = nombreB.startsWith(terminoLower);
      if (aStartsWithNombre && !bStartsWithNombre) return -1;
      if (!aStartsWithNombre && bStartsWithNombre) return 1;

      // Prioridad 2: Código comienza con el término
      const aStartsWithCodigo = codigoA.startsWith(terminoLower);
      const bStartsWithCodigo = codigoB.startsWith(terminoLower);
      if (aStartsWithCodigo && !bStartsWithCodigo) return -1;
      if (!aStartsWithCodigo && bStartsWithCodigo) return 1;

      // Si ambos son iguales en prioridad, ordenar alfabéticamente
      return nombreA.localeCompare(nombreB);
    });

    console.log('📦 Productos encontrados:', this.productosFiltrados.length);
    if (this.productosFiltrados.length > 0) {
      console.log('🔝 Primeros 3 resultados:', this.productosFiltrados.slice(0, 3).map(p => p.nombre));
    }
  }

  /**
   * Buscar cliente por documento
   */
  buscarClientePorDocumento(documento: string): void {
    if (!documento || documento.trim() === '') {
      return;
    }

    this.facturacionService.getClientes({ documento }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const cliente = response.data[0];
          // Guardar el ID del cliente existente
          this.clienteExistenteId = cliente.id || (cliente as any).id_cliente || null;

          this.ventaForm.cliente = {
            tipo_documento: cliente.tipo_documento,
            numero_documento: cliente.numero_documento,
            nombre: cliente.nombre,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            email: cliente.email
          };

          console.log('✅ Cliente encontrado con ID:', this.clienteExistenteId);
        } else {
          // Si no se encuentra, limpiar el ID
          this.clienteExistenteId = null;
          console.log('ℹ️ Cliente no encontrado, se creará uno nuevo');
        }
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
        this.clienteExistenteId = null;
        this.error = 'Error al buscar cliente';
      }
    });
  }

  // ============================================
  // BÚSQUEDA Y FILTRADO DE PRODUCTOS
  // ============================================
  filtrarProductos(): void {
    // Si el término está vacío, mostrar todos los productos
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.productosFiltrados = [...this.productos];
      return;
    }

    // Si hay término de búsqueda, buscar en la API
    this.buscarProductos(this.terminoBusqueda);
  }

  onBuscarProductos(): void {
    console.log('🔍 Botón buscar presionado');
    this.filtrarProductos();
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.productosFiltrados = [...this.productos];
  }

  onSeleccionarProducto(producto: any): void {
    console.log('🛒 Producto seleccionado:', producto);

    // Verificar si el producto ya está en la venta
    const itemExistente = this.ventaForm.items.find(item => item.producto_id === producto.id);

    if (itemExistente) {
      // Si ya existe, incrementar cantidad
      itemExistente.cantidad += 1;
      this.calcularItem(itemExistente);
      console.log('📈 Cantidad incrementada para producto existente');
    } else {
      // Si no existe, agregar nuevo item con todos los datos correctos
      const nuevoItem: VentaItemFormData = {
        producto_id: producto.id,
        codigo_producto: producto.codigo_producto || producto.codigo || `PROD-${producto.id}`,
        descripcion: producto.nombre,
        unidad_medida: 'NIU',
        cantidad: 1,
        precio_unitario: producto.precio_venta || producto.precio || 0,
        descuento: 0,
        tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO
      };

      // Calcular totales del item
      this.calcularItem(nuevoItem);

      this.ventaForm.items.push(nuevoItem);
      console.log('✅ Nuevo producto agregado:', nuevoItem);
    }

    // Limpiar búsqueda después de seleccionar
    this.onLimpiarBusqueda();
  }

  /**
   * Obtener stock actual del producto seleccionado
   */
  getStockActual(): number {
    if (this.productoSeleccionado.descripcion) {
      const producto = this.productos.find(p => p.nombre === this.productoSeleccionado.descripcion);
      return producto ? (producto.stock || 0) : 0;
    }
    return 0;
  }

  // ============================================
  // MODAL DE ÉXITO Y ACCIONES POST-VENTA
  // ============================================

  cerrarModalExito(): void {
    this.mostrarModalExito = false;
    // Resetear variables de notificación
    this.enviandoNotificacion = false;
    this.notificacionEnviada = false;

    // Preguntar si desea nueva venta
    if (confirm('¿Desea iniciar una nueva venta?')) {
      this.limpiarFormulario();
      this.ventaGuardada = null;
    }
  }

  imprimirComprobante(): void {
    if (!this.ventaGuardada) return;

    // Generar contenido para imprimir
    const contenido = this.generarContenidoImpresion();

    // Abrir ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenido);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
    }
  }

  private generarContenidoImpresion(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comprobante - ${venta.codigo_venta}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10px; }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .header h2 { margin: 5px 0; font-size: 16px; }
          .info { margin-bottom: 10px; font-size: 12px; }
          .info div { margin: 3px 0; }
          .items { margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
          .totals { margin-top: 10px; font-size: 12px; }
          .totals div { display: flex; justify-content: space-between; margin: 3px 0; }
          .total-final { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>COMPROBANTE DE VENTA</h2>
          <div><strong>${venta.codigo_venta}</strong></div>
        </div>
        
        <div class="info">
          <div><strong>Fecha:</strong> ${fecha}</div>
          <div><strong>Cliente:</strong> ${venta.cliente?.razon_social || venta.cliente?.nombre_comercial || 'Cliente General'}</div>
          <div><strong>Documento:</strong> ${venta.cliente?.numero_documento || 'N/A'}</div>
          <div><strong>Método de Pago:</strong> ${venta.metodo_pago}</div>
        </div>
        
        <div class="items">
          <div style="font-weight: bold; margin-bottom: 5px;">DETALLE:</div>
          ${venta.detalles?.map((item: any) => `
            <div class="item">
              <div style="flex: 1;">${item.descripcion || item.producto?.nombre || 'Producto'}</div>
            </div>
            <div class="item" style="padding-left: 10px;">
              <div>${item.cantidad} x S/ ${Number(item.precio_unitario).toFixed(2)}</div>
              <div>S/ ${Number(item.subtotal).toFixed(2)}</div>
            </div>
          `).join('') || ''}
        </div>
        
        <div class="totals">
          <div>
            <span>Subtotal:</span>
            <span>S/ ${Number(venta.subtotal).toFixed(2)}</span>
          </div>
          <div>
            <span>IGV (18%):</span>
            <span>S/ ${Number(venta.igv).toFixed(2)}</span>
          </div>
          <div class="total-final">
            <span>TOTAL:</span>
            <span>S/ ${Number(venta.total).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>¡Gracias por su compra!</div>
          <div style="margin-top: 10px;">Este documento no tiene validez tributaria</div>
        </div>
      </body>
      </html>
    `;
  }

  enviarPorWhatsApp(): void {
    if (!this.ventaGuardada) return;

    const venta = this.ventaGuardada;
    const telefono = venta.cliente?.telefono || '';

    if (!telefono) {
      this.error = 'El cliente no tiene teléfono registrado';
      return;
    }

    // Generar mensaje para WhatsApp
    const mensaje = this.generarMensajeWhatsApp();

    // Limpiar número de teléfono (solo dígitos)
    const telefonoLimpio = telefono.replace(/\D/g, '');

    // Abrir WhatsApp Web
    const url = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  private generarMensajeWhatsApp(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');

    let mensaje = `*COMPROBANTE DE VENTA*\n\n`;
    mensaje += `*Código:* ${venta.codigo_venta}\n`;
    mensaje += `*Fecha:* ${fecha}\n`;
    mensaje += `*Cliente:* ${venta.cliente?.razon_social || 'Cliente General'}\n\n`;
    mensaje += `*DETALLE:*\n`;

    venta.detalles?.forEach((item: any) => {
      mensaje += `• ${item.descripcion || 'Producto'}\n`;
      mensaje += `  ${item.cantidad} x S/ ${Number(item.precio_unitario).toFixed(2)} = S/ ${Number(item.subtotal).toFixed(2)}\n`;
    });

    mensaje += `\n*Subtotal:* S/ ${Number(venta.subtotal).toFixed(2)}\n`;
    mensaje += `*IGV (18%):* S/ ${Number(venta.igv).toFixed(2)}\n`;
    mensaje += `*TOTAL:* S/ ${Number(venta.total).toFixed(2)}\n\n`;
    mensaje += `*Método de Pago:* ${venta.metodo_pago}\n\n`;
    mensaje += `¡Gracias por su compra! 🎉`;

    return mensaje;
  }

  enviarPorCorreo(): void {
    if (!this.ventaGuardada) return;

    const email = this.ventaGuardada.cliente?.email || this.ventaForm.cliente.email;

    if (!email) {
      this.error = 'El cliente no tiene email registrado';
      return;
    }

    this.enviandoEmail.set(true);

    // Aquí deberías llamar a un endpoint del backend que envíe el email
    // Por ahora, simularemos el envío
    setTimeout(() => {
      this.enviandoEmail.set(false);
      this.success = `Comprobante enviado a ${email}`;
    }, 2000);
  }

  // ============================================
  // ENVÍO DE NOTIFICACIONES
  // ============================================
  enviarComprobanteNotificacion(): void {
    if (!this.ventaGuardada) {
      this.error = 'No hay venta para enviar';
      return;
    }

    // Obtener email del cliente
    const email = this.ventaGuardada.cliente?.email || this.ventaForm.cliente.email;

    if (!email) {
      this.error = 'El cliente no tiene email registrado. Por favor agregue un email.';
      return;
    }

    this.enviandoNotificacion = true;
    this.error = null;

    // Enviar notificación
    this.notificacionesService.enviarNotificacion({
      tipo: 'email',
      destinatario: email,
      asunto: `Comprobante de Venta - ${this.ventaGuardada.codigo_venta}`,
      mensaje: `Estimado cliente, adjuntamos su comprobante de venta ${this.ventaGuardada.codigo_venta} por un total de S/ ${this.ventaGuardada.total}.`
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.enviandoNotificacion = false;
          this.notificacionEnviada = true;
          this.success = `Comprobante enviado exitosamente a ${email}`;

          // Resetear después de 3 segundos
          setTimeout(() => {
            this.notificacionEnviada = false;
          }, 3000);
        },
        error: (error) => {
          this.enviandoNotificacion = false;
          this.error = error?.error?.message || 'Error al enviar la notificación';
          console.error('Error al enviar notificación:', error);
        }
      });
  }

  // ============================================
  // MODAL DE CONFIGURACIÓN
  // ============================================
  abrirConfiguracionModal(): void {
    this.mostrarConfiguracionModal = true;
  }

  cerrarConfiguracionModal(guardar: boolean = false): void {
    if (guardar) {
      // Si se hace clic en guardar, actualizar según tipo de comprobante
      this.actualizarSerieSegunTipo();
    }
    this.mostrarConfiguracionModal = false;
  }
}