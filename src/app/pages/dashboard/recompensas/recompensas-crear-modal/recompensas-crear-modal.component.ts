import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecompensasService } from '../../../../services/recompensas.service';
import { EstadoRecompensa } from '../../../../models/recompensa.model';

@Component({
  selector: 'app-recompensas-crear-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-crear-modal.component.html',
  styleUrls: ['./recompensas-crear-modal.component.scss']
})
export class RecompensasCrearModalComponent implements OnInit {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() recompensaCreada = new EventEmitter<any>();

  formulario: FormGroup;
  loading = false;
  error: string | null = null;

  // Opciones
  tiposRecompensa: any[] = [];
  estadosRecompensa: any[] = [];

  // Fecha mínima (hoy)
  hoyStr: string;

  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService
  ) {
    // Calcular fecha mínima
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    this.hoyStr = `${y}-${m}-${d}`;

    // Inicializar formulario
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['puntos', Validators.required],
      fecha_inicio: ['', [Validators.required, this.validarFechaNoPasada.bind(this)]],
      fecha_fin: ['', Validators.required],
      estado: ['activa'],

      // Configuración según tipo
      // Puntos
      puntos_por_compra: [0, [Validators.min(0)]],
      puntos_por_monto: [0, [Validators.min(0)]],
      puntos_registro: [0, [Validators.min(0)]],

      // Descuento
      tipo_descuento: ['porcentaje'],
      valor_descuento: [0, [Validators.min(0)]],
      compra_minima: [0, [Validators.min(0)]],

      // Envío gratis
      minimo_compra_envio: [0, [Validators.min(0)]],
      tipo_cobertura: ['nacional'],

      // Regalo
      producto_regalo_id: [null],
      cantidad_regalo: [1, [Validators.min(1)]],
      descripcion_regalo: [''],

      // Segmentación
      tipo_segmentacion: ['todos', Validators.required],

      // Productos y categorías
      productos_seleccionados: [[]],
      categorias_seleccionadas: [[]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposYEstados();
    this.configurarEscuchaFechaInicio();
  }

  cargarTiposYEstados(): void {
    this.recompensasService.obtenerTipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tiposRecompensa = response.data.tipos || [
            { value: 'puntos', label: 'Sistema de Puntos' },
            { value: 'descuento', label: 'Descuentos' },
            { value: 'envio_gratis', label: 'Envío Gratuito' },
            { value: 'regalo', label: 'Productos de Regalo' }
          ];

          const estadosCrudos = (response.data.estados || []).map((e: any) => ({
            value: e.value,
            label: e.label
          }));
          this.estadosRecompensa = this.filtrarEstadosParaCreacion(estadosCrudos);

          // Establecer estado por defecto
          const estadoDefault = this.obtenerEstadoDefaultDesdeLista(this.estadosRecompensa);
          this.formulario.patchValue({ estado: estadoDefault }, { emitEvent: false });
        }
      },
      error: (error) => {
        console.error('Error cargando tipos:', error);
        this.tiposRecompensa = [
          { value: 'puntos', label: 'Sistema de Puntos' },
          { value: 'descuento', label: 'Descuentos' },
          { value: 'envio_gratis', label: 'Envío Gratuito' },
          { value: 'regalo', label: 'Productos de Regalo' }
        ];
        this.estadosRecompensa = [
          { value: 'activa', label: 'Activa' },
          { value: 'pausada', label: 'Pausada' }
        ];
      }
    });
  }

  configurarEscuchaFechaInicio(): void {
    this.formulario.get('fecha_inicio')?.valueChanges.subscribe(fechaInicio => {
      if (fechaInicio) {
        this.actualizarEstadosDisponibles(fechaInicio);
      }
    });
  }

  actualizarEstadosDisponibles(fechaInicio: string): void {
    this.recompensasService.obtenerEstadosDisponibles(fechaInicio).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const estadosCrudos = response.data.estados_disponibles.map((estado: any) => ({
            value: estado.value,
            label: estado.label
          }));
          this.estadosRecompensa = this.filtrarEstadosParaCreacion(estadosCrudos);

          const estadoActual = this.formulario.get('estado')?.value;
          const estadoValido = this.estadosRecompensa.find(e => e.value === estadoActual)?.value
            || this.obtenerEstadoDefaultDesdeLista(this.estadosRecompensa);
          this.formulario.patchValue({ estado: estadoValido }, { emitEvent: false });
        }
      },
      error: (error) => {
        console.error('Error obteniendo estados:', error);
      }
    });
  }

  private filtrarEstadosParaCreacion(estados: { value: string; label: string }[]): { value: string; label: string }[] {
    const fechaInicio = this.formulario.get('fecha_inicio')?.value;
    const hoy = new Date();
    const fecha = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
    const esFuturo = fecha ? fecha > new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) : false;

    const baseSinProhibidos = estados.filter(e => e.value !== 'expirada' && e.value !== 'cancelada');
    const permitidos = esFuturo ? ['programada', 'pausada'] : ['activa', 'pausada'];
    let resultado = baseSinProhibidos.filter(e => permitidos.includes(e.value));

    if (!resultado.find(e => e.value === 'pausada')) {
      resultado.push({ value: 'pausada', label: 'Pausada' });
    }

    if (esFuturo) {
      resultado = resultado.map(e => e.value === 'programada' ? { ...e, label: 'Programada' } : e);
      resultado = resultado.filter(e => e.value !== 'activa');
    } else {
      if (!resultado.find(e => e.value === 'activa')) {
        resultado.push({ value: 'activa', label: 'Activa' });
      }
      resultado = resultado.filter(e => e.value !== 'programada');
    }

    return resultado;
  }

  private obtenerEstadoDefaultDesdeLista(estados: { value: string; label: string }[]): 'programada' | 'activa' | 'pausada' {
    if (estados.find(e => e.value === 'activa')) return 'activa';
    if (estados.find(e => e.value === 'programada')) return 'programada';
    return 'pausada';
  }

  private validarFechaNoPasada(control: any) {
    const valor: string = control?.value;
    if (!valor) return null;
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fecha = new Date(valor + 'T00:00:00');
    return fecha < hoySinHora ? { fechaPasada: true } : null;
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposRecompensa.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  get tipoSeleccionado(): string {
    return this.formulario.get('tipo')?.value || 'puntos';
  }

  cerrarModal(): void {
    this.formulario.reset({
      tipo: 'puntos',
      tipo_descuento: 'porcentaje',
      tipo_cobertura: 'nacional',
      tipo_segmentacion: 'todos'
    });
    this.error = null;
    this.cerrar.emit();
  }

  async crearRecompensa(): Promise<void> {
    if (this.formulario.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const valores = this.formulario.value;

    // Datos básicos de la recompensa
    const datosRecompensa: any = {
      nombre: valores.nombre?.trim(),
      descripcion: valores.descripcion?.trim(),
      tipo: valores.tipo,
      fecha_inicio: valores.fecha_inicio,
      fecha_fin: valores.fecha_fin,
      estado: valores.estado || 'activa'
    };

    try {
      // 1. Crear la recompensa
      const responseCrear: any = await this.recompensasService.crear(datosRecompensa).toPromise();

      if (!responseCrear.success) {
        throw new Error(responseCrear.message || 'Error al crear la recompensa');
      }

      // Obtener ID de la recompensa creada
      const recompensaId = responseCrear.data?.recompensa?.id
        || responseCrear.data?.id
        || responseCrear.data?.data?.id;

      if (!recompensaId) {
        throw new Error('No se pudo obtener el ID de la recompensa creada');
      }

      console.log('Recompensa creada con ID:', recompensaId);

      // 2. Asignar segmentación
      await this.asignarSegmentacion(recompensaId, valores.tipo_segmentacion);

      // 3. Asignar productos/categorías si se especificaron
      await this.asignarProductosOCategorias(recompensaId, valores);

      // 4. Crear configuración según el tipo
      await this.crearConfiguracionSegunTipo(recompensaId, valores);

      // Éxito
      this.loading = false;
      this.recompensaCreada.emit(responseCrear.data);
      this.cerrarModal();

    } catch (error: any) {
      console.error('Error creando recompensa:', error);
      this.error = error.message || 'Error al crear la recompensa';
      this.loading = false;
    }
  }

  private async asignarSegmentacion(recompensaId: number, tipoSegmentacion: string): Promise<void> {
    try {
      const payload = { segmento: tipoSegmentacion || 'todos' };
      await this.recompensasService.asignarSegmento(recompensaId, payload).toPromise();
      console.log('Segmentación asignada:', payload);
    } catch (error) {
      console.warn('Error asignando segmentación:', error);
      // No fallar por esto
    }
  }

  private async asignarProductosOCategorias(recompensaId: number, valores: any): Promise<void> {
    try {
      // Si hay productos seleccionados
      if (valores.productos_seleccionados && valores.productos_seleccionados.length > 0) {
        for (const productoId of valores.productos_seleccionados) {
          const payload = {
            tipo: 'producto' as 'producto' | 'categoria',
            producto_id: productoId,
            categoria_id: undefined
          };
          await this.recompensasService.asignarProducto(recompensaId, payload).toPromise();
          console.log('Producto asignado:', productoId);
        }
      }

      // Si hay categorías seleccionadas
      if (valores.categorias_seleccionadas && valores.categorias_seleccionadas.length > 0) {
        for (const categoriaId of valores.categorias_seleccionadas) {
          const payload = {
            tipo: 'categoria' as 'producto' | 'categoria',
            producto_id: undefined,
            categoria_id: categoriaId
          };
          await this.recompensasService.asignarProducto(recompensaId, payload).toPromise();
          console.log('Categoría asignada:', categoriaId);
        }
      }

      // Si no se especificó nada, asignar a "todos" (todas las categorías)
      if ((!valores.productos_seleccionados || valores.productos_seleccionados.length === 0) &&
          (!valores.categorias_seleccionadas || valores.categorias_seleccionadas.length === 0)) {
        console.log('No se especificaron productos ni categorías - aplicará a todos');
      }
    } catch (error) {
      console.warn('Error asignando productos/categorías:', error);
      // No fallar por esto
    }
  }

  private async crearConfiguracionSegunTipo(recompensaId: number, valores: any): Promise<void> {
    const tipo = valores.tipo;

    try {
      if (tipo === 'puntos') {
        const payload = {
          puntos_por_compra: valores.puntos_por_compra || 0,
          puntos_por_monto: valores.puntos_por_monto || 0,
          puntos_registro: valores.puntos_registro || 0,
          valor_por_punto: 0,
          multiplicador_puntos: 1
        };
        await this.recompensasService.crearConfiguracionPuntos(recompensaId, payload).toPromise();
        console.log('Configuración de puntos creada:', payload);

      } else if (tipo === 'descuento') {
        const payload = {
          tipo_descuento: valores.tipo_descuento || 'porcentaje',
          valor_descuento: valores.valor_descuento || 0,
          compra_minima: valores.compra_minima || 0
        };
        await this.recompensasService.crearConfiguracionDescuentos(recompensaId, payload).toPromise();
        console.log('Configuración de descuentos creada:', payload);

      } else if (tipo === 'envio_gratis') {
        const payload = {
          compra_minima: valores.minimo_compra_envio || 0,
          tipo_cobertura: valores.tipo_cobertura || 'nacional'
        };
        await this.recompensasService.crearConfiguracionEnvios(recompensaId, payload).toPromise();
        console.log('Configuración de envíos creada:', payload);

      } else if (tipo === 'regalo') {
        const payload = {
          producto_id: valores.producto_regalo_id || null,
          cantidad: valores.cantidad_regalo || 1,
          descripcion_regalo: valores.descripcion_regalo || ''
        };
        await this.recompensasService.crearConfiguracionRegalos(recompensaId, payload).toPromise();
        console.log('Configuración de regalos creada:', payload);
      }
    } catch (error) {
      console.warn('Error creando configuración:', error);
      // No fallar por esto
    }
  }
}
