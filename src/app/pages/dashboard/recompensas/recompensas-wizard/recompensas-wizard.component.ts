import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { RecompensasService } from '../../../../services/recompensas.service';
import { RecompensaWizard } from '../../../../models/recompensa-wizard.model';
import { RecompensasProductosCategoriasComponent } from './recompensas-productos-categorias.component';
import { RecompensasSegmentosClientesComponent } from './recompensas-segmentos-clientes.component';
import { RecompensasConfiguracionPuntosComponent } from './recompensas-configuracion-puntos.component';
import { ProductoInfo, CategoriaInfo, ClienteInfo, EstadoRecompensa } from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RecompensasProductosCategoriasComponent,
    RecompensasSegmentosClientesComponent,
    RecompensasConfiguracionPuntosComponent
  ],
  templateUrl: './recompensas-wizard.component.html',
  styleUrls: ['./recompensas-wizard.component.scss']
})
export class RecompensasWizardComponent implements OnInit {
  private recompensasService = inject(RecompensasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  // Estado del wizard
  pasoActual = 1;
  totalPasos = 5;
  loading = false;
  error: string | null = null;
  esEdicion = false;

  // Formularios
  datosGeneralesForm: FormGroup;
  segmentacionForm: FormGroup;
  productosForm: FormGroup;
  configuracionForm: FormGroup;

  // Datos del wizard
  wizard: RecompensaWizard = {
    datos_generales: {
      nombre: '',
      descripcion: '',
      tipo: 'puntos',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'programada' as EstadoRecompensa
    },
    segmentacion: {
      tipo_segmentacion: 'todos',
      clientes_especificos: [],
      segmentos: []
    },
    productos: {
      tipo_asignacion: 'todos',
      productos_especificos: [],
      categorias_especificas: []
    },
    configuracion: {
      puntos: {
        puntos_por_compra: 0,
        puntos_por_monto: 0,
        puntos_registro: 0
      },
      descuento: {
        tipo_descuento: 'porcentaje',
        valor_descuento: 0,
        compra_minima: 0
      },
      envio: {
        minimo_compra: 0,
        zonas_aplicables: []
      },
      regalo: {
        minimo_compra: 0,
        productos_regalo: []
      }
    },
    resumen: {
      nombre: '',
      tipo: 'puntos',
      fecha_inicio: '',
      fecha_fin: '',
      total_clientes: 0,
      total_productos: 0,
      configuracion_completa: false
    }
  };

  // Productos y categorías seleccionados
  productosSeleccionados: ProductoInfo[] = [];
  categoriasSeleccionadas: CategoriaInfo[] = [];

  // Segmentos y clientes seleccionados
  segmentosSeleccionados: any[] = [];
  clientesSeleccionados: ClienteInfo[] = [];
  tipoSegmentacion: string = 'todos';
  configuracionPuntos: any = null;

  // Opciones para selectores
  tiposRecompensa: any[] = [];
  estadosRecompensa: any[] = [];

  // Fecha mínima permitida (hoy)
  hoyStr: string;

  constructor() {
    // Calcular hoy en formato YYYY-MM-DD para el input date
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    this.hoyStr = `${y}-${m}-${d}`;
    // Inicializar formularios
    this.datosGeneralesForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['puntos', Validators.required],
      fecha_inicio: ['', [Validators.required, this.validarFechaNoPasada.bind(this)]],
      fecha_fin: ['', Validators.required],
      estado: ['programada']
    });

    this.segmentacionForm = this.fb.group({
      tipo_segmentacion: ['todos', Validators.required]
    });

    this.productosForm = this.fb.group({
      tipo_asignacion: ['todos', Validators.required]
    });

    this.configuracionForm = this.fb.group({
      puntos_por_compra: [0],
      puntos_por_monto: [0],
      puntos_registro: [0],
      tipo_descuento: ['porcentaje'],
      valor_descuento: [0],
      compra_minima: [0],
      minimo_compra_envio: [0]
    });
  }

  ngOnInit(): void {
    this.cargarTiposYEstados();
    this.configurarEscuchaFechaInicio();
    // Verificar si es edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.cargarRecompensaParaEdicion(parseInt(id));
    }
  }

  cargarTiposYEstados(): void {
    this.recompensasService.obtenerTipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tiposRecompensa = response.data.tipos || [];
          // Siempre filtrar estados no permitidos en creación
          const fechaInicioActual = this.datosGeneralesForm.get('fecha_inicio')?.value;
          const estadosCrudos = (response.data.estados || []).map((e: any) => ({ value: e.value, label: e.label }));
          this.estadosRecompensa = this.filtrarEstadosParaCreacion(estadosCrudos, fechaInicioActual);
          
          // Si no hay tipos cargados, usar valores por defecto
          if (this.tiposRecompensa.length === 0) {
            this.tiposRecompensa = [
              { value: 'puntos', label: 'Sistema de Puntos' },
              { value: 'descuento', label: 'Descuentos' },
              { value: 'envio_gratis', label: 'Envío Gratuito' },
              { value: 'regalo', label: 'Productos de Regalo' }
            ];
          }

          // Asegurar un estado válido por defecto después de filtrar
          const estadoActual = this.datosGeneralesForm.get('estado')?.value;
          const estadoValido = this.estadosRecompensa.find(e => e.value === estadoActual)?.value
            || this.obtenerEstadoPorDefecto(fechaInicioActual);
          this.datosGeneralesForm.patchValue({ estado: estadoValido }, { emitEvent: false });
        }
      },
      error: (error) => {
        console.error('Error cargando tipos de recompensas:', error);
        // Usar valores por defecto en caso de error
        this.tiposRecompensa = [
          { value: 'puntos', label: 'Sistema de Puntos' },
          { value: 'descuento', label: 'Descuentos' },
          { value: 'envio_gratis', label: 'Envío Gratuito' },
          { value: 'regalo', label: 'Productos de Regalo' }
        ];
        // Filtrar estados por fecha aún en fallback
        const fechaInicioActual = this.datosGeneralesForm.get('fecha_inicio')?.value;
        this.estadosRecompensa = this.filtrarEstadosParaCreacion([
          { value: 'programada', label: 'Programada' },
          { value: 'activa', label: 'Activa' },
          { value: 'pausada', label: 'Pausada' }
        ], fechaInicioActual);

        // Estado por defecto coherente
        this.datosGeneralesForm.patchValue({ estado: this.obtenerEstadoPorDefecto(fechaInicioActual) }, { emitEvent: false });
      }
    });
  }

  configurarEscuchaFechaInicio(): void {
    // Escuchar cambios en la fecha de inicio para actualizar estados disponibles
    this.datosGeneralesForm.get('fecha_inicio')?.valueChanges.subscribe(fechaInicio => {
      if (fechaInicio) {
        this.obtenerEstadosDisponibles(fechaInicio);
      }
    });
  }

  obtenerEstadosDisponibles(fechaInicio: string): void {
    this.recompensasService.obtenerEstadosDisponibles(fechaInicio).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Actualizar la lista de estados disponibles siempre filtrando creación
          const estadosCrudos = response.data.estados_disponibles.map((estado: any) => ({
            value: estado.value,
            label: estado.label
          }));
          this.estadosRecompensa = this.filtrarEstadosParaCreacion(estadosCrudos, fechaInicio);

          // Aplicar el estado por defecto si no hay uno seleccionado
          const estadoActual = this.datosGeneralesForm.get('estado')?.value;
          const estadoValido = (!estadoActual || !this.estadosRecompensa.find(e => e.value === estadoActual))
            ? this.obtenerEstadoPorDefecto(fechaInicio)
            : estadoActual;
          this.datosGeneralesForm.patchValue({ estado: estadoValido }, { emitEvent: false });

          console.log('Estados disponibles actualizados:', {
            fechaInicio,
            estados: this.estadosRecompensa,
            estadoPorDefecto: this.obtenerEstadoPorDefecto(fechaInicio),
            mensaje: response.data.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error obteniendo estados disponibles:', error);
        // En caso de error, mantener los estados por defecto
      }
    });
  }

  // Helpers: reglas de negocio para estados permitidos en creación
  private filtrarEstadosParaCreacion(estados: { value: string; label: string }[], fechaInicio?: string) {
    const hoy = new Date();
    const fecha = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;

    const esFuturo = fecha ? fecha > new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) : false;
    // Nunca permitir expirada ni cancelada al crear
    const baseSinProhibidos = estados.filter(e => e.value !== 'expirada' && e.value !== 'cancelada');

    if (esFuturo) {
      // Solo programada o pausada
      return baseSinProhibidos.filter(e => e.value === 'programada' || e.value === 'pausada');
    }
    // Fecha hoy o pasada: activa o pausada
    return baseSinProhibidos.filter(e => e.value === 'activa' || e.value === 'pausada');
  }

  private obtenerEstadoPorDefecto(fechaInicio?: string): 'programada' | 'activa' | 'pausada' {
    const hoy = new Date();
    const fecha = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
    const esFuturo = fecha ? fecha > new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) : false;
    return esFuturo ? 'programada' : 'activa';
  }

  // Validator: no permitir fecha de inicio pasada
  private validarFechaNoPasada(control: any) {
    const valor: string = control?.value;
    if (!valor) return null;
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fecha = new Date(valor + 'T00:00:00');
    return fecha < hoySinHora ? { fechaPasada: true } : null;
  }

  cargarRecompensaParaEdicion(id: number): void {
    this.loading = true;
    this.recompensasService.obtenerDetalle(id).subscribe({
      next: (response) => {
        // Cargar datos existentes en el wizard
        this.datosGeneralesForm.patchValue({
          nombre: response.recompensa.nombre,
          descripcion: response.recompensa.descripcion,
          tipo: response.recompensa.tipo,
          fecha_inicio: response.recompensa.fecha_inicio,
          fecha_fin: response.recompensa.fecha_fin
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la recompensa';
        this.loading = false;
      }
    });
  }

  // Navegación entre pasos
  siguientePaso(): void {
    if (this.validarPasoActual()) {
      if (this.pasoActual < this.totalPasos) {
        this.pasoActual++;
        this.actualizarWizard();
      }
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  irAPaso(paso: number): void {
    if (paso >= 1 && paso <= this.totalPasos) {
      this.pasoActual = paso;
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual) {
      case 1:
        return this.datosGeneralesForm.valid;
      case 2:
        return this.segmentacionForm.valid;
      case 3:
        return this.productosForm.valid;
      case 4:
        return this.configuracionForm.valid;
      case 5:
        return true;
      default:
        return false;
    }
  }

  actualizarWizard(): void {
    // Actualizar datos del wizard con los formularios
    this.wizard.datos_generales = this.datosGeneralesForm.value;
    this.wizard.segmentacion = this.segmentacionForm.value;
    this.wizard.productos = this.productosForm.value;
    
    // Actualizar configuración según el tipo
    const tipo = this.datosGeneralesForm.get('tipo')?.value;
    const config = this.configuracionForm.value;
    
    if (tipo === 'puntos') {
      this.wizard.configuracion.puntos = {
        puntos_por_compra: config.puntos_por_compra || 0,
        puntos_por_monto: config.puntos_por_monto || 0,
        puntos_registro: config.puntos_registro || 0
      };
    } else if (tipo === 'descuento') {
      this.wizard.configuracion.descuento = {
        tipo_descuento: config.tipo_descuento || 'porcentaje',
        valor_descuento: config.valor_descuento || 0,
        compra_minima: config.compra_minima || 0
      };
    } else if (tipo === 'envio_gratis') {
      this.wizard.configuracion.envio = {
        minimo_compra: config.minimo_compra_envio || 0,
        zonas_aplicables: []
      };
    }

    // Actualizar resumen
    this.wizard.resumen = {
      nombre: this.wizard.datos_generales.nombre,
      tipo: this.wizard.datos_generales.tipo,
      fecha_inicio: this.wizard.datos_generales.fecha_inicio,
      fecha_fin: this.wizard.datos_generales.fecha_fin,
      total_clientes: this.wizard.segmentacion.clientes_especificos?.length || 0,
      total_productos: this.wizard.productos.productos_especificos?.length || 0,
      configuracion_completa: this.validarConfiguracionCompleta()
    };
  }

  validarConfiguracionCompleta(): boolean {
    const tipo = this.wizard.datos_generales.tipo;
    
    switch (tipo) {
      case 'puntos':
        return (this.wizard.configuracion.puntos?.puntos_por_compra || 0) > 0 || 
               (this.wizard.configuracion.puntos?.puntos_por_monto || 0) > 0;
      case 'descuento':
        return this.wizard.configuracion.descuento.valor_descuento > 0;
      case 'envio_gratis':
        return this.wizard.configuracion.envio.minimo_compra >= 0;
      case 'regalo':
        return this.wizard.configuracion.regalo.productos_regalo.length > 0;
      default:
        return false;
    }
  }

  // Acciones del wizard
  guardarBorrador(): void {
    this.actualizarWizard();
    console.log('Guardando borrador:', this.wizard);
  }

  activarRecompensa(): void {
    console.log('Iniciando activación de recompensa...');
    console.log('Wizard completo:', this.validarWizardCompleto());
    
    if (this.validarWizardCompleto()) {
      this.loading = true;
      this.error = null;
      this.actualizarWizard();
      
      // Preparar datos para crear la recompensa
      const datosRecompensa = {
        nombre: this.wizard.datos_generales.nombre?.trim(),
        descripcion: this.wizard.datos_generales.descripcion?.trim(),
        tipo: this.wizard.datos_generales.tipo,
        fecha_inicio: this.wizard.datos_generales.fecha_inicio,
        fecha_fin: this.wizard.datos_generales.fecha_fin,
        estado: this.wizard.datos_generales.estado
      };

      // Validar que los datos requeridos no estén vacíos
      if (!datosRecompensa.nombre || !datosRecompensa.descripcion || !datosRecompensa.fecha_inicio || !datosRecompensa.fecha_fin) {
        this.error = 'Por favor completa todos los campos requeridos';
        this.loading = false;
        return;
      }

      console.log('Datos de la recompensa a crear:', datosRecompensa);
      console.log('Productos seleccionados:', this.productosSeleccionados.length);
      console.log('Categorías seleccionadas:', this.categoriasSeleccionadas.length);

      // Crear la recompensa
      this.recompensasService.crear(datosRecompensa).subscribe({
        next: (response) => {
          console.log('Respuesta del servicio crear:', response);
          console.log('Estructura completa de response.data:', JSON.stringify(response.data, null, 2));
          
          if (response.success) {
            console.log('Recompensa creada exitosamente:', response.data);
            
            // Obtener el ID de la recompensa - ESTRUCTURA CORRECTA DEL BACKEND
            let recompensaId = null;
            
            // PRIORIDAD 1: response.data.recompensa.id (ESTRUCTURA ACTUAL DEL BACKEND)
            if ((response.data as any).recompensa && (response.data as any).recompensa.id) {
              recompensaId = (response.data as any).recompensa.id;
              console.log('✅ ID encontrado en response.data.recompensa.id:', recompensaId);
            }
            // PRIORIDAD 2: response.data.id (ESTRUCTURA ANTERIOR - COMPATIBILIDAD)
            else if ((response.data as any).id) {
              recompensaId = (response.data as any).id;
              console.log('✅ ID encontrado en response.data.id:', recompensaId);
            }
            // PRIORIDAD 3: response.data.data.id (ESTRUCTURA ALTERNATIVA)
            else if ((response.data as any).data && (response.data as any).data.id) {
              recompensaId = (response.data as any).data.id;
              console.log('✅ ID encontrado en response.data.data.id:', recompensaId);
            }
            // PRIORIDAD 4: Si response.data es directamente el objeto recompensa
            else if (response.data && typeof response.data === 'object' && (response.data as any).id) {
              recompensaId = (response.data as any).id;
              console.log('✅ ID encontrado en response.data (objeto directo):', recompensaId);
            }
            
            // DEBUGGING: Mostrar todas las propiedades disponibles
            console.log('🔍 DEBUGGING - Propiedades de response.data:', Object.keys(response.data));
            if ((response.data as any).recompensa) {
              console.log('🔍 DEBUGGING - Propiedades de response.data.recompensa:', Object.keys((response.data as any).recompensa));
              console.log('🔍 DEBUGGING - response.data.recompensa.id:', (response.data as any).recompensa.id);
            }
            
            console.log('ID de recompensa obtenido:', recompensaId);
            
            if (!recompensaId) {
              console.error('❌ CRÍTICO: No se pudo obtener el ID de la recompensa');
              console.error('Estructura completa de response.data:', response.data);
              console.error('Propiedades disponibles:', Object.keys(response.data));
              
              // Mostrar error específico
              this.error = 'Error crítico: No se pudo obtener el ID de la recompensa creada. Verifica la estructura de respuesta del backend.';
              
              // Navegar a la lista de recompensas después de un breve delay
              setTimeout(() => {
                this.loading = false;
                this.router.navigate(['/dashboard/recompensas']);
              }, 3000);
              return;
            }
            
            // Si hay productos/categorías seleccionados, asignarlos
            if (this.productosSeleccionados.length > 0 || this.categoriasSeleccionadas.length > 0) {
              console.log('Asignando productos y categorías...');
              this.asignarProductosYCategorias(recompensaId);
            } else {
              console.log('No hay productos/categorías, activando recompensa...');
              // Si no hay asignaciones, activar si es necesario y navegar
              this.activarRecompensaCreada(recompensaId);
            }
          } else {
            console.error('Error en la respuesta del servicio:', response);
            this.error = response.message || 'Error al crear la recompensa';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error creando recompensa:', error);
          this.error = error.error?.message || 'Error al crear la recompensa';
          this.loading = false;
        }
      });
    } else {
      console.error('Wizard no está completo, no se puede crear la recompensa');
      this.error = 'Por favor completa todos los pasos del wizard';
    }
  }

  validarWizardCompleto(): boolean {
    const datosGeneralesValido = this.datosGeneralesForm.valid;
    const segmentacionValido = this.segmentacionForm.valid;
    const productosValido = this.productosForm.valid;
    const configuracionValido = this.configuracionForm.valid;
    const configuracionCompleta = this.validarConfiguracionCompleta();
    
    console.log('Validación del wizard:', {
      datosGenerales: datosGeneralesValido,
      segmentacion: segmentacionValido,
      productos: productosValido,
      configuracion: configuracionValido,
      configuracionCompleta: configuracionCompleta,
      datosGeneralesErrors: this.datosGeneralesForm.errors,
      segmentacionErrors: this.segmentacionForm.errors,
      productosErrors: this.productosForm.errors,
      configuracionErrors: this.configuracionForm.errors
    });
    
    return datosGeneralesValido && 
           segmentacionValido && 
           productosValido && 
           configuracionValido &&
           configuracionCompleta;
  }

  // Asignar productos y categorías a la recompensa creada
  private asignarProductosYCategorias(recompensaId: number): void {
    const asignaciones: Observable<any>[] = [];

    // Asignar productos específicos
    this.productosSeleccionados.forEach(producto => {
      const asignacion = this.recompensasService.asignarProducto(recompensaId, {
        tipo: 'producto',
        producto_id: producto.id
      });
      asignaciones.push(asignacion);
    });

    // Asignar categorías
    this.categoriasSeleccionadas.forEach(categoria => {
      const asignacion = this.recompensasService.asignarProducto(recompensaId, {
        tipo: 'categoria',
        categoria_id: categoria.id
      });
      asignaciones.push(asignacion);
    });

    // Si no hay asignaciones, activar si es necesario y navegar
    if (asignaciones.length === 0) {
      console.log('No hay productos o categorías para asignar');
      this.activarRecompensaCreada(recompensaId);
      return;
    }

    // Ejecutar todas las asignaciones en paralelo
    forkJoin(asignaciones).subscribe({
      next: (results) => {
        console.log('Productos y categorías asignados exitosamente:', results);
        
        // Actualizar estadísticas de la recompensa
        this.actualizarEstadisticasRecompensa(recompensaId);
      },
      error: (error) => {
        console.error('Error asignando productos/categorías:', error);
        this.error = 'Error al asignar productos y categorías: ' + (error.error?.message || error.message);
        this.loading = false;
      }
    });
  }

  // Actualizar estadísticas de la recompensa
  private actualizarEstadisticasRecompensa(recompensaId: number): void {
    // Obtener estadísticas de productos para actualizar los contadores
    this.recompensasService.obtenerEstadisticasProductos(recompensaId).subscribe({
      next: (response) => {
        console.log('Estadísticas de productos actualizadas:', response);
        
        // Activar la recompensa después de configurar todo
        this.activarRecompensaCreada(recompensaId);
      },
      error: (error) => {
        console.warn('No se pudieron actualizar las estadísticas:', error);
        // Continuar aunque no se puedan actualizar las estadísticas
        this.activarRecompensaCreada(recompensaId);
      }
    });
  }

  // Activar la recompensa creada (solo si se creó como inactiva)
  private activarRecompensaCreada(recompensaId: number): void {
    // Solo activar si la recompensa se creó como programada
    if (this.wizard.datos_generales.estado === 'programada') {
      this.recompensasService.activar(recompensaId).subscribe({
        next: (response) => {
          console.log('Recompensa activada exitosamente:', response);
          this.loading = false;
          this.router.navigate(['/dashboard/recompensas']);
        },
        error: (error) => {
          console.warn('No se pudo activar la recompensa:', error);
          // Continuar aunque no se pueda activar
          this.loading = false;
          this.router.navigate(['/dashboard/recompensas']);
        }
      });
    } else {
      // Si ya se creó como activa, solo navegar
      console.log('Recompensa creada como activa, navegando...');
      this.loading = false;
      this.router.navigate(['/dashboard/recompensas']);
    }
  }

  cancelar(): void {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
      this.router.navigate(['/dashboard/recompensas']);
    }
  }

  // Métodos auxiliares
  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposRecompensa.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getPasoLabel(paso: number): string {
    const pasos = [
      'Datos Generales',
      'Segmentación',
      'Productos',
      'Configuración',
      'Resumen'
    ];
    return pasos[paso - 1] || '';
  }

  isPasoCompletado(paso: number): boolean {
    switch (paso) {
      case 1:
        return this.datosGeneralesForm.valid;
      case 2:
        return this.segmentacionForm.valid;
      case 3:
        return this.productosForm.valid;
      case 4:
        return this.configuracionForm.valid;
      case 5:
        return this.validarWizardCompleto();
      default:
        return false;
    }
  }

  getProgreso(): number {
    return (this.pasoActual / this.totalPasos) * 100;
  }

  // Manejar cambios en productos y categorías
  onProductosCategoriasChange(data: { productos: ProductoInfo[], categorias: CategoriaInfo[] }): void {
    this.productosSeleccionados = data.productos;
    this.categoriasSeleccionadas = data.categorias;
    
    // Actualizar el wizard con los datos seleccionados
    this.wizard.productos.productos_especificos = data.productos.map(p => p.id);
    this.wizard.productos.categorias_especificas = data.categorias.map(c => c.id);
    
    // Actualizar el resumen
    this.actualizarResumen();
  }

  // Manejar cambios en segmentación
  onSegmentacionChange(data: { tipo: string, segmentos: any[], clientes: ClienteInfo[] }): void {
    this.tipoSegmentacion = data.tipo;
    this.segmentosSeleccionados = data.segmentos;
    this.clientesSeleccionados = data.clientes;
    
    // Actualizar el wizard con los datos seleccionados
    this.wizard.segmentacion.tipo_segmentacion = data.tipo;
    this.wizard.segmentacion.segmentos = data.segmentos.map(s => s.value);
    this.wizard.segmentacion.clientes_especificos = data.clientes.map(c => c.id);
    
    // Actualizar el resumen
    this.actualizarResumen();
  }

  // Manejar cambios en configuración de puntos
  onConfiguracionPuntosChange(configuracion: any): void {
    this.configuracionPuntos = configuracion;
    this.wizard.configuracion.puntos = configuracion;
    this.actualizarResumen();
  }

  // Actualizar resumen del wizard
  private actualizarResumen(): void {
    this.wizard.resumen.nombre = this.wizard.datos_generales.nombre;
    this.wizard.resumen.tipo = this.wizard.datos_generales.tipo;
    this.wizard.resumen.fecha_inicio = this.wizard.datos_generales.fecha_inicio;
    this.wizard.resumen.fecha_fin = this.wizard.datos_generales.fecha_fin;
    this.wizard.resumen.total_clientes = (this.wizard.segmentacion.clientes_especificos?.length || 0) + (this.wizard.segmentacion.segmentos?.length || 0);
    this.wizard.resumen.total_productos = this.productosSeleccionados.length + this.categoriasSeleccionadas.reduce((total, cat) => total + (cat.productos_count || 0), 0);
    this.wizard.resumen.configuracion_completa = this.validarWizardCompleto();
  }

  // Métodos para manejar tipos de recompensas
  onTipoChange(): void {
    // Método para manejar cambios en el tipo de recompensa
    const tipoSeleccionado = this.datosGeneralesForm.get('tipo')?.value;
    console.log('Tipo seleccionado:', tipoSeleccionado);
  }

  getTipoSeleccionado(): any {
    const tipoSeleccionado = this.datosGeneralesForm.get('tipo')?.value;
    return this.tiposRecompensa.find(tipo => tipo.value === tipoSeleccionado);
  }
}
