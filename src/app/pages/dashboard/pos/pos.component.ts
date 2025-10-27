import { Component, OnInit, OnDestroy, signal, computed, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

import { FacturacionService } from '../../../services/facturacion.service';
import { AlmacenService } from '../../../services/almacen.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { EmpresaInfoService } from '../../../services/empresa-info.service';
import { ReniecService } from '../../../services/reniec.service';
import { ClienteEditModalComponent } from '../../../components/cliente-edit-modal/cliente-edit-modal.component';
import { ProductoQuickModalComponent, ProductoQuickItem } from '../../../components/producto-quick-modal/producto-quick-modal.component';
import { PagoRapidoModalComponent, PagoResultado } from '../../../components/pago-rapido-modal/pago-rapido-modal.component';
import { ConfirmacionSunatModalComponent } from '../../../components/confirmacion-sunat-modal/confirmacion-sunat-modal.component';
import { SerieSelectorModalComponent } from '../../../components/serie-selector-modal/serie-selector-modal.component';
import {
  VentaFormData,
  VentaItemFormData,
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

  // Getters para selección de resultados de búsqueda
  get totalResultadosSeleccionados(): number {
    return this.productosFiltrados.filter(p => p.seleccionado).length;
  }

  get todosResultadosSeleccionados(): boolean {
    return this.productosFiltrados.length > 0 && this.productosFiltrados.every(p => p.seleccionado);
  }

  get algunosResultadosSeleccionados(): boolean {
    const seleccionados = this.productosFiltrados.filter(p => p.seleccionado).length;
    return seleccionados > 0 && seleccionados < this.productosFiltrados.length;
  }

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

  // Tipo de comprobante para enviar (ticket o boleta)
  tipoComprobanteParaEnviar: 'ticket' | 'boleta' = 'ticket';

  // Información de la empresa
  empresaInfo: any = null;

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
    // El subtotal es la BASE IMPONIBLE (sin IGV)
    return this.ventaForm.items.reduce((sum, item) => {
      const totalConIgv = item.cantidad * item.precio_unitario;
      const descuento = item.descuento || 0;
      const totalConDescuento = totalConIgv - descuento;

      // Si es gravado, el precio incluye IGV, así que lo desglosamos
      if (item.tipo_afectacion_igv === TIPOS_AFECTACION_IGV.GRAVADO) {
        const baseImponible = totalConDescuento / 1.18;
        return sum + baseImponible;
      }
      // Si no es gravado (exonerado, inafecto), el precio es la base
      return sum + totalConDescuento;
    }, 0);
  }

  get descuentoTotal(): number {
    const descuentoItems = this.ventaForm.items.reduce((sum, item) => sum + (item.descuento || 0), 0);
    return descuentoItems + (this.ventaForm.descuento_global || 0);
  }

  get subtotalNeto(): number {
    // El subtotal ya tiene los descuentos aplicados
    return this.subtotal;
  }

  get igv(): number {
    // El IGV se calcula sobre la base imponible (18%)
    return this.ventaForm.items.reduce((sum, item) => {
      if (item.tipo_afectacion_igv === TIPOS_AFECTACION_IGV.GRAVADO) {
        const totalConIgv = item.cantidad * item.precio_unitario;
        const descuento = item.descuento || 0;
        const totalConDescuento = totalConIgv - descuento;

        // Desglosar el IGV del precio que ya lo incluye
        const baseImponible = totalConDescuento / 1.18;
        const igvItem = baseImponible * 0.18;
        return sum + igvItem;
      }
      return sum;
    }, 0);
  }

  get total(): number {
    // El total es Base Imponible + IGV
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
    private empresaInfoService: EmpresaInfoService,
    private reniecService: ReniecService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarSeriesDisponibles();
    this.cargarProductos(); // Cargar productos desde la API
    this.cargarEmpresaInfo(); // Cargar información de la empresa
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

    // PASO 3: Siempre abrir modal de datos del cliente para validar/actualizar
    // Si se cambió el tipo de comprobante, los requisitos pueden ser diferentes
    this.abrirModalCliente();
  }

  /**
   * PASO 3: Abrir modal de cliente según tipo de comprobante
   */
  abrirModalCliente(): void {
    console.log('📋 PASO 2: Configurar datos del cliente');

    // Si no hay cliente configurado, inicializar con valores por defecto
    if (!this.ventaForm.cliente.nombre) {
      this.ventaForm.cliente = {
        tipo_documento: this.tipoDocumentoSeleccionado === '01' ? TIPOS_DOCUMENTO.RUC : TIPOS_DOCUMENTO.DNI,
        numero_documento: '',
        nombre: '',
        direccion: '',
        email: '',
        telefono: ''
      };
    } else {
      // Si ya hay cliente, solo ajustar el tipo de documento si es necesario
      if (this.tipoDocumentoSeleccionado === '01' && this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        this.ventaForm.cliente.tipo_documento = TIPOS_DOCUMENTO.RUC;
      }
    }

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

  /**
   * Cargar información de la empresa
   */
  cargarEmpresaInfo(): void {
    this.empresaInfoService.obtenerEmpresaInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (empresa) => {
          this.empresaInfo = empresa;
          console.log('✅ Información de empresa cargada:', this.empresaInfo);
        },
        error: (err) => {
          console.error('❌ Error al cargar información de empresa:', err);
          // Si falla, usar valores por defecto
          this.empresaInfo = {
            nombre_empresa: 'MI EMPRESA',
            ruc: '20XXXXXXXXX',
            razon_social: 'MI EMPRESA S.A.C.',
            direccion: 'Dirección de la empresa',
            telefono: '(01) 123-4567',
            email: 'contacto@miempresa.com'
          };
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


  /**
   * Buscar cliente en la base de datos local por número de documento
   */
  buscarClientePorDocumento(): void {
    const numeroDoc = this.ventaForm.cliente.numero_documento;
    if (!numeroDoc || numeroDoc.length < 8) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // PASO 1: Buscar en la base de datos (PRIORIDAD)
    this.facturacionService.getClientes({ numero_documento: numeroDoc })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            // ✅ CLIENTE ENCONTRADO EN DB
            const cliente = response.data[0];
            this.loading = false;

            console.log('📋 Cliente encontrado en DB:', cliente);

            // Autocompletar todos los datos del cliente
            this.ventaForm.cliente = {
              tipo_documento: cliente.tipo_documento || this.ventaForm.cliente.tipo_documento,
              numero_documento: cliente.numero_documento || numeroDoc,
              nombre: cliente.nombre || '',
              direccion: cliente.direccion || '',
              email: cliente.email || '',
              telefono: cliente.telefono || ''
            };

            // Guardar el ID del cliente si existe
            this.clienteExistenteId = cliente.id || null;
            this.success = '✅ Cliente encontrado en el sistema';
            setTimeout(() => this.success = null, 3000);
          } else {
            // ❌ NO ENCONTRADO EN DB → BUSCAR EN RENIEC
            this.buscarEnReniec(numeroDoc);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al buscar en DB:', err);
          // Si hay error en DB, intentar con RENIEC
          this.buscarEnReniec(numeroDoc);
        }
      });
  }

  /**
   * Buscar en RENIEC cuando no se encuentra en DB
   */
  private buscarEnReniec(numeroDoc: string): void {
    const esDni = numeroDoc.length === 8;
    
    if (!esDni) {
      // Si no es DNI, mostrar mensaje
      this.loading = false;
      this.error = 'Cliente no encontrado. Ingrese los datos manualmente.';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    // Buscar en RENIEC
    this.reniecService.buscarPorDni(numeroDoc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          
          if (response.success && (response.nombres || response.nombre)) {
            // ✅ ENCONTRADO EN RENIEC
            const nombreCompleto = response.nombre || 
              `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`;

            this.ventaForm.cliente.nombre = nombreCompleto.trim();
            this.clienteExistenteId = null; // Es un cliente nuevo
            
            this.success = '✅ Datos encontrados en RENIEC';
            setTimeout(() => this.success = null, 3000);
          } else {
            this.error = 'No se encontraron datos. Ingrese manualmente.';
            setTimeout(() => this.error = null, 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al buscar en RENIEC:', err);
          this.error = 'No se encontraron datos. Ingrese manualmente.';
          setTimeout(() => this.error = null, 3000);
        }
      });
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
            this.success = '✅ RUC validado exitosamente con SUNAT';
            this.error = null;
            setTimeout(() => this.success = null, 3000);
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
    const totalConIgv = item.cantidad * item.precio_unitario;
    const descuento = item.descuento || 0;
    const totalConDescuento = totalConIgv - descuento;

    let baseImponible = 0;
    let igv = 0;

    if (item.tipo_afectacion_igv === TIPOS_AFECTACION_IGV.GRAVADO) {
      // El precio incluye IGV, desglosarlo
      baseImponible = totalConDescuento / 1.18;
      igv = baseImponible * 0.18;
    } else {
      // Exonerado o inafecto - el precio es la base
      baseImponible = totalConDescuento;
      igv = 0;
    }

    item.subtotal = baseImponible;
    item.igv = igv;
    item.total = totalConDescuento; // El total es el precio original (con IGV incluido)
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

    // Preparar datos de facturación según nueva API
    const datosFacturacion = {
      cliente_datos: {
        tipo_documento: this.ventaForm.cliente.tipo_documento || '6',
        numero_documento: this.ventaForm.cliente.numero_documento || '',
        razon_social: this.ventaForm.cliente.nombre || 'CLIENTE GENERAL',
        direccion: this.ventaForm.cliente.direccion || 'LIMA - PERÚ',
        email: this.ventaForm.cliente.email
      }
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
      user_cliente_id: null, // NULL = Venta POS (NO envía automáticamente a SUNAT)
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
    } else if (this.ventaForm.cliente && this.ventaForm.cliente.numero_documento) {
      // Si hay datos de cliente pero no tiene ID, enviar sus datos
      datosVenta.cliente_datos = {
        tipo_documento: this.ventaForm.cliente.tipo_documento || '1',
        numero_documento: this.ventaForm.cliente.numero_documento,
        razon_social: this.ventaForm.cliente.nombre || '',
        direccion: this.ventaForm.cliente.direccion || '',
        email: this.ventaForm.cliente.email || '',
        telefono: this.ventaForm.cliente.telefono || ''
      };
      console.log('📤 Enviando venta con cliente_datos:', datosVenta.cliente_datos);
    } else {
      // Si no hay cliente, el backend usará CLIENTE GENERAL
      console.log('📤 Enviando venta sin cliente (backend usará CLIENTE GENERAL)');
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
      // Inicializar propiedades de selección
      this.productosFiltrados.forEach(p => {
        if (!p.hasOwnProperty('seleccionado')) {
          p.seleccionado = false;
          p.cantidadSeleccionada = 1;
        }
      });
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

    // Inicializar propiedades de selección en los resultados
    this.productosFiltrados.forEach(p => {
      if (!p.hasOwnProperty('seleccionado')) {
        p.seleccionado = false;
        p.cantidadSeleccionada = 1;
      }
    });

    console.log('📦 Productos encontrados:', this.productosFiltrados.length);
    if (this.productosFiltrados.length > 0) {
      console.log('🔝 Primeros 3 resultados:', this.productosFiltrados.slice(0, 3).map(p => p.nombre));
    }
  }



  // ============================================
  // BÚSQUEDA Y FILTRADO DE PRODUCTOS
  // ============================================
  filtrarProductos(): void {
    // Si el término está vacío, mostrar todos los productos
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.productosFiltrados = [...this.productos];
      // Inicializar propiedades de selección
      this.productosFiltrados.forEach(p => {
        if (!p.hasOwnProperty('seleccionado')) {
          p.seleccionado = false;
          p.cantidadSeleccionada = 1;
        }
      });
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
    // Limpiar selecciones
    this.productosFiltrados.forEach(p => {
      p.seleccionado = false;
      p.cantidadSeleccionada = 1;
    });
  }

  // ============================================
  // SELECCIÓN MÚLTIPLE EN RESULTADOS DE BÚSQUEDA
  // ============================================
  toggleTodosResultados(event: any): void {
    const checked = event.target.checked;
    this.productosFiltrados.forEach(p => {
      p.seleccionado = checked;
      if (checked && !p.cantidadSeleccionada) {
        p.cantidadSeleccionada = 1;
      }
    });
  }

  onCheckboxResultadoChange(producto: any): void {
    if (producto.seleccionado && !producto.cantidadSeleccionada) {
      producto.cantidadSeleccionada = 1;
    }
  }

  incrementarResultado(producto: any): void {
    const stockDisponible = this.getStockDisponible(producto);
    if (producto.cantidadSeleccionada < stockDisponible) {
      producto.cantidadSeleccionada++;
    }
  }

  decrementarResultado(producto: any): void {
    if (producto.cantidadSeleccionada > 1) {
      producto.cantidadSeleccionada--;
    }
  }

  validarCantidadResultado(producto: any): void {
    const stockDisponible = this.getStockDisponible(producto);
    
    // Asegurar que sea un número válido
    if (isNaN(producto.cantidadSeleccionada) || producto.cantidadSeleccionada < 1) {
      producto.cantidadSeleccionada = 1;
    }
    
    // No permitir más que el stock disponible
    if (producto.cantidadSeleccionada > stockDisponible) {
      producto.cantidadSeleccionada = stockDisponible;
      this.error = `Stock máximo disponible: ${stockDisponible}`;
      setTimeout(() => this.error = null, 3000);
    }
    
    // Redondear a entero
    producto.cantidadSeleccionada = Math.floor(producto.cantidadSeleccionada);
  }

  /**
   * TrackBy para optimizar el ngFor
   */
  trackByProductoId(index: number, producto: any): number {
    return producto.id;
  }

  /**
   * Obtener stock disponible real (stock total - cantidad ya en el carrito)
   */
  getStockDisponible(producto: any): number {
    if (!producto) return 0;
    
    const stockTotal = producto.stock ?? 0;
    
    // Buscar si el producto ya está en el carrito
    const itemEnCarrito = this.ventaForm.items.find(item => item.producto_id === producto.id);
    
    if (itemEnCarrito) {
      // Restar la cantidad que ya está en el carrito
      const disponible = Math.max(0, stockTotal - itemEnCarrito.cantidad);
      console.log(`📦 Stock de "${producto.nombre}": Total=${stockTotal}, EnCarrito=${itemEnCarrito.cantidad}, Disponible=${disponible}`);
      return disponible;
    }
    
    return stockTotal;
  }

  agregarResultadosSeleccionados(): void {
    const seleccionados = this.productosFiltrados.filter(p => p.seleccionado);
    
    if (seleccionados.length === 0) {
      return;
    }

    let productosAgregados = 0;
    
    seleccionados.forEach(producto => {
      // Validar stock disponible REAL (considerando lo que ya está en el carrito)
      const stockDisponible = this.getStockDisponible(producto);
      const cantidadAgregar = producto.cantidadSeleccionada || 1;
      
      if (cantidadAgregar > stockDisponible) {
        this.error = `El producto "${producto.nombre}" no tiene suficiente stock. Disponible: ${stockDisponible}`;
        return;
      }

      // Verificar si el producto ya está en el carrito
      const itemExistente = this.ventaForm.items.find(item => item.producto_id === producto.id);

      if (itemExistente) {
        // Si ya existe, sumar la cantidad
        itemExistente.cantidad += cantidadAgregar;
        this.calcularItem(itemExistente);
        console.log(`📈 Cantidad actualizada para "${producto.nombre}": ${itemExistente.cantidad}`);
        
        // Crear nueva referencia del array para forzar detección de cambios
        this.ventaForm.items = [...this.ventaForm.items];
      } else {
        // Si no existe, crear nuevo item
        const nuevoItem: VentaItemFormData = {
          producto_id: producto.id,
          codigo_producto: producto.codigo_producto || producto.codigo || `PROD-${producto.id}`,
          descripcion: producto.nombre,
          unidad_medida: 'NIU',
          cantidad: cantidadAgregar,
          precio_unitario: producto.precio_venta || producto.precio || 0,
          descuento: 0,
          tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO
        };

        this.calcularItem(nuevoItem);
        this.ventaForm.items = [...this.ventaForm.items, nuevoItem];
        console.log(`✅ Producto agregado: "${producto.nombre}" x${cantidadAgregar}`);
      }
      
      productosAgregados++;
      
      // Limpiar selección del producto
      producto.seleccionado = false;
      producto.cantidadSeleccionada = 1;
    });

    if (productosAgregados > 0) {
      this.success = `✅ ${productosAgregados} producto(s) agregado(s) al carrito`;
      setTimeout(() => this.success = null, 3000);
      
      // Forzar actualización de productosFiltrados para que Angular detecte el cambio
      this.productosFiltrados = [...this.productosFiltrados];
      
      // Forzar detección de cambios para actualizar el stock en la vista
      this.cdr.detectChanges();
    }
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
    
    // Redirigir a la lista de ventas
    this.router.navigate(['/dashboard/ventas']);
  }

  imprimirComprobante(): void {
    if (!this.ventaGuardada) return;

    // Generar contenido según el tipo seleccionado
    const contenido = this.tipoComprobanteParaEnviar === 'ticket'
      ? this.generarContenidoTicket()
      : this.generarContenidoImpresion();

    // Abrir ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenido);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
    }
  }

  /**
   * Obtener nombre del cliente desde venta o formulario
   */
  private obtenerNombreCliente(): string {
    const venta = this.ventaGuardada;

    // Intentar obtener desde venta guardada
    if (venta?.cliente) {
      return venta.cliente.nombre ||
        venta.cliente.nombre_comercial ||
        'Cliente General';
    }

    // Sino, desde el formulario
    return this.ventaForm.cliente.nombre || 'Cliente General';
  }

  /**
   * Obtener documento del cliente
   */
  private obtenerDocumentoCliente(): string {
    const venta = this.ventaGuardada;

    if (venta?.cliente?.numero_documento) {
      return venta.cliente.numero_documento;
    }

    return this.ventaForm.cliente.numero_documento || '';
  }

  /**
   * Obtener dirección del cliente
   */
  private obtenerDireccionCliente(): string {
    const venta = this.ventaGuardada;

    if (venta?.cliente?.direccion) {
      return venta.cliente.direccion;
    }

    return this.ventaForm.cliente.direccion || '';
  }

  /**
   * Genera HTML para ticket/voucher simple (58mm o 80mm)
   */
  private generarContenidoTicket(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');
    const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const nombreCliente = this.obtenerNombreCliente();
    const docCliente = this.obtenerDocumentoCliente();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket - ${venta.codigo_venta}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 58mm;
            margin: 0 auto;
            padding: 5px;
            font-size: 11px;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          .header h2 {
            margin: 3px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .info {
            margin-bottom: 8px;
            font-size: 10px;
          }
          .info div {
            margin: 2px 0;
          }
          .items {
            margin: 8px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 8px 0;
          }
          .item {
            margin: 4px 0;
            font-size: 10px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-detail {
            display: flex;
            justify-content: space-between;
          }
          .totals {
            margin-top: 8px;
            font-size: 11px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .total-final {
            font-weight: bold;
            font-size: 13px;
            border-top: 1px solid #000;
            padding-top: 4px;
            margin-top: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TICKET DE VENTA</h2>
          <div><strong>${venta.codigo_venta}</strong></div>
        </div>

        <div class="info">
          <div><strong>Fecha:</strong> ${fecha} ${hora}</div>
          <div><strong>Cliente:</strong> ${nombreCliente}</div>
          ${docCliente ? `<div><strong>Doc:</strong> ${docCliente}</div>` : ''}
        </div>

        <div class="items">
          <div style="font-weight: bold; margin-bottom: 4px;">PRODUCTOS:</div>
          ${venta.detalles?.map((item: any) => `
            <div class="item">
              <div class="item-name">${item.descripcion || item.producto?.nombre || 'Producto'}</div>
              <div class="item-detail">
                <span>${item.cantidad} x S/ ${Number(item.precio_unitario).toFixed(2)}</span>
                <span><strong>S/ ${Number(item.cantidad * item.precio_unitario).toFixed(2)}</strong></span>
              </div>
            </div>
          `).join('') || ''}
        </div>

        <div class="totals">
          <div class="total-final">
            <span>TOTAL:</span>
            <span>S/ ${Number(venta.total).toFixed(2)}</span>
          </div>
          <div style="margin-top: 4px;">
            <span>Pago:</span>
            <span>${venta.metodo_pago || 'EFECTIVO'}</span>
          </div>
        </div>

        <div class="footer">
          <div>¡Gracias por su compra!</div>
          <div style="margin-top: 5px; font-size: 8px;">Vuelva pronto</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera HTML para comprobante formal (boleta/factura) formato A4
   */
  private generarContenidoImpresion(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');
    const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Determinar tipo de comprobante
    const tipoDoc = this.tipoDocumentoSeleccionado === '01' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    const tipoDocCliente = this.tipoDocumentoSeleccionado === '01' ? 'RUC' : 'DNI';

    // Obtener datos del cliente
    const nombreCliente = this.obtenerNombreCliente();
    const docCliente = this.obtenerDocumentoCliente();
    const direccionCliente = this.obtenerDireccionCliente();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${tipoDoc} - ${venta.codigo_venta}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            color: #000;
          }
          .documento-header {
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
          }
          .empresa-info {
            text-align: center;
            margin-bottom: 15px;
          }
          .empresa-info h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          .empresa-info p {
            margin: 3px 0;
            font-size: 11px;
          }
          .comprobante-box {
            border: 2px solid #000;
            padding: 10px;
            text-align: center;
            background: #f0f0f0;
          }
          .comprobante-box h2 {
            margin: 0 0 5px 0;
            font-size: 16px;
          }
          .comprobante-box .numero {
            font-size: 14px;
            font-weight: bold;
          }
          .seccion {
            margin: 15px 0;
            border: 1px solid #ccc;
            padding: 10px;
          }
          .seccion-titulo {
            background: #e0e0e0;
            padding: 5px 10px;
            font-weight: bold;
            font-size: 12px;
            margin: -10px -10px 10px -10px;
          }
          .datos-fila {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 5px 0;
            font-size: 11px;
          }
          .datos-item {
            display: flex;
          }
          .datos-label {
            font-weight: bold;
            min-width: 120px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 11px;
          }
          table th {
            background: #e0e0e0;
            border: 1px solid #000;
            padding: 8px 5px;
            text-align: left;
            font-weight: bold;
          }
          table td {
            border: 1px solid #ccc;
            padding: 6px 5px;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totales-box {
            float: right;
            width: 300px;
            margin-top: 20px;
          }
          .totales-box table {
            width: 100%;
          }
          .totales-box table td {
            padding: 5px 10px;
          }
          .total-final {
            font-weight: bold;
            font-size: 14px;
            background: #f0f0f0;
          }
          .footer-info {
            clear: both;
            margin-top: 60px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 10px;
          }
          .observaciones {
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #ccc;
            background: #f9f9f9;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <!-- HEADER DEL DOCUMENTO -->
        <div class="documento-header">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
            <!-- Datos de la empresa -->
            <div class="empresa-info" style="text-align: left;">
              <h1>${this.empresaInfo?.nombre_empresa || this.empresaInfo?.razon_social || 'MI EMPRESA'}</h1>
              <p><strong>RUC:</strong> ${this.empresaInfo?.ruc || '20XXXXXXXXX'}</p>
              <p><strong>Dirección:</strong> ${this.empresaInfo?.direccion || 'Dirección de la empresa'}</p>
              <p><strong>Teléfono:</strong> ${this.empresaInfo?.telefono || this.empresaInfo?.celular || '(01) 123-4567'} | <strong>Email:</strong> ${this.empresaInfo?.email || 'contacto@empresa.com'}</p>
            </div>

            <!-- Cuadro del comprobante -->
            <div class="comprobante-box">
              <h2>RUC: ${this.empresaInfo?.ruc || '20XXXXXXXXX'}</h2>
              <h2>${tipoDoc}</h2>
              <div class="numero">${venta.codigo_venta || 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- DATOS DEL CLIENTE -->
        <div class="seccion">
          <div class="seccion-titulo">DATOS DEL CLIENTE</div>
          <div class="datos-fila">
            <div class="datos-item">
              <span class="datos-label">${tipoDocCliente}:</span>
              <span>${docCliente || 'Sin documento'}</span>
            </div>
            <div class="datos-item">
              <span class="datos-label">Fecha de Emisión:</span>
              <span>${fecha} ${hora}</span>
            </div>
          </div>
          <div class="datos-fila">
            <div class="datos-item">
              <span class="datos-label">${this.tipoDocumentoSeleccionado === '01' ? 'Razón Social' : 'Nombre'}:</span>
              <span>${nombreCliente}</span>
            </div>
            <div class="datos-item">
              <span class="datos-label">Moneda:</span>
              <span>Soles (PEN)</span>
            </div>
          </div>
          ${direccionCliente ? `
          <div class="datos-fila">
            <div class="datos-item" style="grid-column: 1 / -1;">
              <span class="datos-label">Dirección:</span>
              <span>${direccionCliente}</span>
            </div>
          </div>
          ` : ''}
        </div>

        <!-- DETALLE DE PRODUCTOS -->
        <div class="seccion">
          <div class="seccion-titulo">DETALLE DE PRODUCTOS/SERVICIOS</div>
          <table>
            <thead>
              <tr>
                <th style="width: 8%;" class="text-center">CANT.</th>
                <th style="width: 12%;">CÓDIGO</th>
                <th style="width: 40%;">DESCRIPCIÓN</th>
                <th style="width: 10%;" class="text-center">U.M.</th>
                <th style="width: 15%;" class="text-right">P.UNIT</th>
                <th style="width: 15%;" class="text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${venta.detalles?.map((item: any) => `
                <tr>
                  <td class="text-center">${Number(item.cantidad).toFixed(2)}</td>
                  <td>${item.codigo_producto || item.producto?.codigo_producto || 'N/A'}</td>
                  <td>${item.descripcion || item.producto?.nombre || 'Producto'}</td>
                  <td class="text-center">NIU</td>
                  <td class="text-right">S/ ${Number(item.precio_unitario).toFixed(2)}</td>
                  <td class="text-right">S/ ${Number(item.cantidad * item.precio_unitario - (item.descuento || 0)).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="6" class="text-center">Sin productos</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- TOTALES -->
        <div class="totales-box">
          <table>
            <tr>
              <td><strong>OP. GRAVADAS:</strong></td>
              <td class="text-right">S/ ${Number(venta.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>OP. EXONERADAS:</strong></td>
              <td class="text-right">S/ 0.00</td>
            </tr>
            <tr>
              <td><strong>OP. INAFECTAS:</strong></td>
              <td class="text-right">S/ 0.00</td>
            </tr>
            ${venta.descuento_total && venta.descuento_total > 0 ? `
            <tr>
              <td><strong>DESCUENTOS:</strong></td>
              <td class="text-right">-S/ ${Number(venta.descuento_total).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td><strong>IGV (18%):</strong></td>
              <td class="text-right">S/ ${Number(venta.igv || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-final">
              <td><strong>TOTAL A PAGAR:</strong></td>
              <td class="text-right"><strong>S/ ${Number(venta.total).toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <!-- OBSERVACIONES -->
        ${venta.observaciones || this.ventaForm.observaciones ? `
        <div class="observaciones" style="clear: both; margin-top: 20px;">
          <strong>Observaciones:</strong><br>
          ${venta.observaciones || this.ventaForm.observaciones || ''}
        </div>
        ` : ''}

        <!-- PIE DE PÁGINA -->
        <div class="footer-info" style="clear: both;">
          <p><strong>Forma de Pago:</strong> ${venta.metodo_pago || 'EFECTIVO'}</p>
          <p style="margin-top: 15px;">
            <strong>REPRESENTACIÓN IMPRESA DEL COMPROBANTE ELECTRÓNICO</strong><br>
            Este documento tiene validez tributaria y puede ser verificado en SUNAT
          </p>
          <p style="font-size: 9px; margin-top: 10px;">
            Autorizado mediante Resolución de Superintendencia N° 097-2012/SUNAT<br>
            Consulte su comprobante en: www.sunat.gob.pe
          </p>
        </div>
      </body>
      </html>
    `;
  }

  enviarPorWhatsApp(): void {
    if (!this.ventaGuardada) return;

    const venta = this.ventaGuardada;
    const telefono = venta.cliente?.telefono || this.ventaForm.cliente.telefono;

    if (!telefono) {
      this.error = 'El cliente no tiene teléfono registrado';
      return;
    }

    // Generar mensaje según el tipo seleccionado
    const mensaje = this.tipoComprobanteParaEnviar === 'ticket'
      ? this.generarTicketWhatsApp()
      : this.generarBoletaWhatsApp();

    // Limpiar número de teléfono (solo dígitos)
    const telefonoLimpio = telefono.replace(/\D/g, '');

    // Abrir WhatsApp Web
    const url = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  private generarMensajeWhatsApp(): string {
    // Método legacy - usar los nuevos métodos específicos
    return this.generarTicketWhatsApp();
  }

  /**
   * Genera un ticket/voucher simple para WhatsApp
   */
  private generarTicketWhatsApp(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');
    const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const nombreCliente = this.obtenerNombreCliente();

    let mensaje = `╔═══════════════════════╗\n`;
    mensaje += `   🧾 *TICKET DE VENTA*\n`;
    mensaje += `╚═══════════════════════╝\n\n`;

    mensaje += `📅 *Fecha:* ${fecha} ${hora}\n`;
    mensaje += `🔢 *Ticket:* ${venta.codigo_venta}\n`;
    mensaje += `👤 *Cliente:* ${nombreCliente}\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    mensaje += `🛒 *PRODUCTOS:*\n`;
    venta.detalles?.forEach((item: any, index: number) => {
      mensaje += `\n${index + 1}. ${item.descripcion || 'Producto'}\n`;
      mensaje += `   ${item.cantidad} x S/ ${Number(item.precio_unitario).toFixed(2)} = *S/ ${Number(item.cantidad * item.precio_unitario).toFixed(2)}*\n`;
    });

    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL: S/ ${Number(venta.total).toFixed(2)}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    mensaje += `💳 *Pago:* ${venta.metodo_pago || 'EFECTIVO'}\n\n`;
    mensaje += `✨ _¡Gracias por su compra!_ ✨\n`;
    mensaje += `📱 Vuelva pronto`;

    return mensaje;
  }

  /**
   * Genera un comprobante formal (boleta/factura) para WhatsApp
   */
  private generarBoletaWhatsApp(): string {
    const venta: any = this.ventaGuardada!;
    const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-PE');
    const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Determinar tipo de comprobante
    const tipoDoc = this.tipoDocumentoSeleccionado === '01' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';

    // Obtener datos del cliente
    const nombreCliente = this.obtenerNombreCliente();
    const docCliente = this.obtenerDocumentoCliente();
    const direccionCliente = this.obtenerDireccionCliente();
    const tipoDocCliente = this.tipoDocumentoSeleccionado === '01' ? 'RUC' : 'DNI/Doc';

    let mensaje = `═══════════════════════════\n`;
    mensaje += `     📄 *${tipoDoc}*\n`;
    mensaje += `═══════════════════════════\n\n`;

    mensaje += `🏢 *DATOS DE LA EMPRESA*\n`;
    mensaje += `Razón Social: ${this.empresaInfo?.razon_social || this.empresaInfo?.nombre_empresa || 'MI EMPRESA'}\n`;
    mensaje += `RUC: ${this.empresaInfo?.ruc || '20XXXXXXXXX'}\n`;
    mensaje += `Dirección: ${this.empresaInfo?.direccion || 'Dirección de la empresa'}\n\n`;

    mensaje += `📋 *DATOS DEL COMPROBANTE*\n`;
    mensaje += `Número: ${venta.codigo_venta}\n`;
    mensaje += `Fecha de Emisión: ${fecha} ${hora}\n\n`;

    mensaje += `👤 *DATOS DEL CLIENTE*\n`;
    mensaje += `${tipoDocCliente}: ${docCliente || 'Sin documento'}\n`;
    mensaje += `Cliente: ${nombreCliente}\n`;

    if (direccionCliente) {
      mensaje += `Dirección: ${direccionCliente}\n`;
    }
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `       *DETALLE DE VENTA*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    venta.detalles?.forEach((item: any, index: number) => {
      mensaje += `*${index + 1}. ${item.descripcion || 'Producto'}*\n`;
      mensaje += `   Cant: ${item.cantidad} | P.Unit: S/ ${Number(item.precio_unitario).toFixed(2)}\n`;
      if (item.descuento && item.descuento > 0) {
        mensaje += `   Descuento: -S/ ${Number(item.descuento).toFixed(2)}\n`;
      }
      mensaje += `   Subtotal: S/ ${Number(item.cantidad * item.precio_unitario - (item.descuento || 0)).toFixed(2)}\n\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `*RESUMEN*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `Base Imponible: S/ ${Number(venta.subtotal || 0).toFixed(2)}\n`;
    mensaje += `IGV (18%):      S/ ${Number(venta.igv || 0).toFixed(2)}\n`;

    if (venta.descuento_total && venta.descuento_total > 0) {
      mensaje += `Descuento:     -S/ ${Number(venta.descuento_total).toFixed(2)}\n`;
    }

    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `*TOTAL: S/ ${Number(venta.total).toFixed(2)}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    mensaje += `💳 *Forma de Pago:* ${venta.metodo_pago || 'EFECTIVO'}\n\n`;

    if (venta.observaciones) {
      mensaje += `📝 *Observaciones:*\n${venta.observaciones}\n\n`;
    }

    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `✅ _Representación impresa de comprobante electrónico_\n\n`;
    mensaje += `¡Gracias por su preferencia! 🙏\n`;
    mensaje += `📧 Consultas: ${this.empresaInfo?.email || 'contacto@empresa.com'}\n`;
    mensaje += `📱 Teléfono: ${this.empresaInfo?.telefono || this.empresaInfo?.celular || '(01) 123-4567'}`;

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