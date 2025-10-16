import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { FacturacionService } from '../../../services/facturacion.service';
import { ClienteEditModalComponent } from '../../../components/cliente-edit-modal/cliente-edit-modal.component';
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
  imports: [CommonModule, FormsModule, ClienteEditModalComponent],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
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

  // Productos disponibles (simulado - debería venir de tu API de productos)
  productos = [
    { id: 1, codigo: 'PROD001', nombre: 'Laptop HP Pavilion', precio: 2500.00, stock: 10 },
    { id: 2, codigo: 'PROD002', nombre: 'Mouse Inalámbrico', precio: 25.00, stock: 50 },
    { id: 3, codigo: 'PROD003', nombre: 'Teclado Mecánico', precio: 120.00, stock: 30 },
    { id: 4, codigo: 'PROD004', nombre: 'Monitor 24"', precio: 450.00, stock: 15 },
    { id: 5, codigo: 'PROD005', nombre: 'Auriculares Gaming', precio: 180.00, stock: 25 }
  ];

  // Estados
  loading = false;
  error: string | null = null;
  success: string | null = null;
  fechaActual = new Date().toISOString().split('T')[0];
  ventaGuardada: Venta | null = null;

  // Modal de Cliente
  mostrarClienteModal = false;
  clienteParaModal: any | null = null;

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

  // Cálculos
  get subtotal(): number {
    return this.ventaForm.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }

  get descuentoTotal(): number {
    const descuentoItems = this.ventaForm.items.reduce((sum, item) => sum + (item.descuento || 0), 0);
    return descuentoItems + (this.ventaForm.descuento_global || 0);
  }

  get subtotalNeto(): number {
    return this.subtotal - this.descuentoTotal;
  }

  get igv(): number {
    return this.subtotalNeto * 0.18; // 18% IGV
  }

  get total(): number {
    return this.subtotalNeto + this.igv;
  }

  constructor(
    private facturacionService: FacturacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.agregarItemVacio();
    this.cargarDatosIniciales();
    this.cargarSeriesDisponibles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================

  cargarDatosIniciales(): void {
    // Cargar productos reales desde la API
    this.facturacionService.getProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.productos = response.data || [];
        },
        error: (err: any) => {
          console.error('Error al cargar productos:', err);
          // Mantener productos simulados como fallback
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
    const tipo = this.tipoComprobanteSeleccionado();

    const seriesPorTipo = series.filter(s => s.tipo_comprobante === tipo);
    if (seriesPorTipo.length > 0) {
      this.serieSeleccionada.set(seriesPorTipo[0]);
    } else {
      this.serieSeleccionada.set(null);
    }
  }

  onTipoComprobanteChange(): void {
    // Validar que para Factura (01) se requiere RUC
    if (this.tipoComprobanteSeleccionado() === '01') {
      if (this.ventaForm.cliente.tipo_documento !== TIPOS_DOCUMENTO.RUC) {
        this.error = 'Para emitir Factura se requiere RUC del cliente';
        this.tipoComprobanteSeleccionado.set('03');
        return;
      }

      const ruc = this.ventaForm.cliente.numero_documento;
      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        this.error = 'El RUC ingresado no es válido (debe tener 11 dígitos)';
        this.tipoComprobanteSeleccionado.set('03');
        return;
      }
    }

    this.actualizarSerieSegunTipo();
    this.error = null;
  }

  buscarClientePorDocumento(): void {
    if (!this.ventaForm.cliente.numero_documento || !this.ventaForm.cliente.tipo_documento) {
      return;
    }

    // Si es RUC, validar primero con SUNAT
    if (this.ventaForm.cliente.tipo_documento === TIPOS_DOCUMENTO.RUC) {
      this.validarRUC();
      return;
    }

    // Para otros tipos de documento, buscar en la base de datos
    this.facturacionService.getClienteByDocumento(
      this.ventaForm.cliente.tipo_documento,
      this.ventaForm.cliente.numero_documento
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            this.ventaForm.cliente = { ...response.data };
            this.success = 'Cliente encontrado y cargado';
            this.error = null;
          }
        },
        error: (err: any) => {
          console.error('Error al buscar cliente:', err);
          this.error = 'Cliente no encontrado. Puede continuar con los datos manuales.';
          this.success = null;
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
    const itemExistente = this.ventaForm.items.find(item =>
      item.producto_id === producto.id
    );

    if (itemExistente) {
      itemExistente.cantidad += 1;
      this.calcularItem(itemExistente);
    } else {
      // Crear nuevo item con todos los campos necesarios para facturación
      const nuevoItem: any = {
        producto_id: producto.id,
        codigo_producto: producto.codigo || `PROD-${producto.id}`,
        descripcion: producto.nombre,
        unidad_medida: 'NIU',
        cantidad: 1,
        precio_unitario: producto.precio,
        tipo_afectacion_igv: TIPOS_AFECTACION_IGV.GRAVADO,
        descuento: 0
      };
      this.calcularItem(nuevoItem);

      // Eliminar el item vacío si existe
      const itemVacio = this.ventaForm.items.find(item => !item.descripcion.trim());
      if (itemVacio) {
        const index = this.ventaForm.items.indexOf(itemVacio);
        this.ventaForm.items.splice(index, 1);
      }

      this.ventaForm.items.push(nuevoItem);
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
    if (this.ventaForm.items.length === 0) {
      this.agregarItemVacio();
    }
  }

  // ============================================
  // GESTIÓN DE CLIENTES
  // ============================================

  buscarCliente(): void {
    if (!this.ventaForm.cliente.numero_documento) return;

    this.facturacionService.getClientes({
      numero_documento: this.ventaForm.cliente.numero_documento
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          const cliente = response.data[0];
          this.ventaForm.cliente = {
            tipo_documento: cliente.tipo_documento,
            numero_documento: cliente.numero_documento,
            nombre: cliente.nombre,
            direccion: cliente.direccion || '',
            email: cliente.email || '',
            telefono: cliente.telefono || ''
          };
        }
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
      }
    });
  }

  // ============================================
  // OPERACIONES DE VENTA
  // ============================================

  guardarVenta(): void {
    if (!this.validarVenta()) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    this.facturacionService.createVenta(this.ventaForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success && response.data) {
            this.ventaGuardada = response.data;
            this.success = 'Venta guardada exitosamente';
            this.limpiarFormulario();
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al guardar la venta';
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
      tipo_comprobante: this.tipoComprobanteSeleccionado(),
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

    this.facturacionService.downloadPdf(comprobante.venta_id!)
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

  private validarVenta(): boolean {
    if (!this.ventaForm.cliente.nombre.trim()) {
      this.error = 'El nombre del cliente es obligatorio';
      return false;
    }

    if (this.ventaForm.items.length === 0 ||
        this.ventaForm.items.every(item => !item.descripcion.trim())) {
      this.error = 'Debe agregar al menos un producto';
      return false;
    }

    if (this.total <= 0) {
      this.error = 'El total debe ser mayor a 0';
      return false;
    }

    if (!this.serieSeleccionada()) {
      this.error = 'Debe seleccionar una serie';
      return false;
    }

    // Validar que para Factura se requiere RUC
    if (this.tipoComprobanteSeleccionado() === '01') {
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
    this.agregarItemVacio();
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
    this.mostrarClienteModal = false;
  }
}