import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { GuiasRemisionService } from '../../services/guias-remision.service';
import { ProductosService } from '../../services/productos.service';

interface GuiaRemisionForm {
  tipo_guia: 'REMITENTE' | 'INTERNO';

  // Fecha
  fecha_inicio_traslado: string;

  // Cliente (solo para REMITENTE)
  cliente_id?: number;

  // Destinatario (opcional para REMITENTE, opcional para INTERNO)
  destinatario_tipo_documento?: string;
  destinatario_numero_documento?: string;
  destinatario_razon_social?: string;
  destinatario_direccion?: string;
  destinatario_ubigeo?: string;
  usar_cliente_como_destinatario?: boolean;

  // Traslado
  motivo_traslado: string;
  modalidad_traslado: string;
  modo_transporte: string;
  numero_bultos: number;

  // Vehículo y conductor (solo REMITENTE con modalidad 02)
  numero_placa?: string;
  conductor_dni?: string;
  conductor_nombres?: string;

  // Puntos de partida y llegada
  punto_partida_ubigeo: string;
  punto_partida_direccion: string;
  punto_llegada_ubigeo: string;
  punto_llegada_direccion: string;

  // Observaciones
  observaciones?: string;

  // Productos
  detalles: Array<{
    producto_id: number;
    nombre_producto?: string;
    cantidad: number;
    peso_unitario: number;
    observaciones?: string;
  }>;
}

@Component({
  selector: 'app-guia-remision-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  template: `
    <app-base-modal
      [isOpen]="isOpen"
      [title]="getModalTitle()"
      icon="ph ph-truck"
      size="xl"
      headerClass="bg-primary text-white"
      [loading]="loading"
      [confirmDisabled]="!isFormValid()"
      confirmText="Emitir Guía"
      confirmIcon="ph ph-paper-plane"
      (onClose)="close()"
      (onConfirm)="submit()">

      <div class="gre-modal">
      <!-- Navegación de pasos mejorada -->
      <div class="steps-container mb-4" *ngIf="!tipoGuiaPredefinido">
        <div class="steps-wrapper">
          <div class="step-item" [class.active]="paso === 0" [class.completed]="paso > 0">
            <div class="step-circle">
              <i class="ph ph-list"></i>
            </div>
            <span class="step-label">Tipo</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" [class.active]="paso === 1" [class.completed]="paso > 1">
            <div class="step-circle">
              <i class="ph ph-user"></i>
            </div>
            <span class="step-label">Destinatario</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" [class.active]="paso === 2" [class.completed]="paso > 2">
            <div class="step-circle">
              <i class="ph ph-map-pin"></i>
            </div>
            <span class="step-label">Traslado</span>
          </div>
          <div class="step-divider" *ngIf="form.tipo_guia === 'REMITENTE' && form.modalidad_traslado === '02'"></div>
          <div class="step-item" *ngIf="form.tipo_guia === 'REMITENTE' && form.modalidad_traslado === '02'" [class.active]="paso === 3" [class.completed]="paso > 3">
            <div class="step-circle">
              <i class="ph ph-truck"></i>
            </div>
            <span class="step-label">Vehículo</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" [class.active]="paso === 4" [class.completed]="paso > 4">
            <div class="step-circle">
              <i class="ph ph-package"></i>
            </div>
            <span class="step-label">Productos</span>
          </div>
        </div>
      </div>

      <!-- Navegación simplificada para tipo predefinido -->
      <div class="steps-container mb-4" *ngIf="tipoGuiaPredefinido">
        <div class="steps-wrapper">
          <div class="step-item" *ngIf="form.tipo_guia !== 'INTERNO'" [class.active]="paso === 1" [class.completed]="paso > 1">
            <div class="step-circle">
              <i class="ph ph-user"></i>
            </div>
            <span class="step-label">Destinatario</span>
          </div>
          <div class="step-divider" *ngIf="form.tipo_guia !== 'INTERNO'"></div>
          <div class="step-item" [class.active]="paso === 2" [class.completed]="paso > 2">
            <div class="step-circle">
              <i class="ph ph-map-pin"></i>
            </div>
            <span class="step-label">Traslado</span>
          </div>
          <div class="step-divider" *ngIf="form.tipo_guia === 'REMITENTE' && form.modalidad_traslado === '02'"></div>
          <div class="step-item" *ngIf="form.tipo_guia === 'REMITENTE' && form.modalidad_traslado === '02'" [class.active]="paso === 3" [class.completed]="paso > 3">
            <div class="step-circle">
              <i class="ph ph-truck"></i>
            </div>
            <span class="step-label">Vehículo</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" [class.active]="paso === 4" [class.completed]="paso > 4">
            <div class="step-circle">
              <i class="ph ph-package"></i>
            </div>
            <span class="step-label">Productos</span>
          </div>
        </div>
      </div>

      <!-- Paso 0: Tipo de Guía (Solo si no hay tipo predefinido) -->
      <div *ngIf="paso === 0 && !tipoGuiaPredefinido" class="py-4">
        <h5 class="text-center mb-4">Seleccione el Tipo de Guía de Remisión</h5>

        <div class="row justify-content-center g-4">
          <div class="col-md-4" *ngFor="let tipo of tiposGuiaFiltrados">
            <div class="card h-100 shadow-sm border-2 cursor-pointer transition-all"
                 [class.border-primary]="form.tipo_guia === tipo.codigo"
                 [class.bg-light]="form.tipo_guia === tipo.codigo"
                 [class.border-secondary]="form.tipo_guia !== tipo.codigo"
                 (click)="seleccionarTipoGuia(tipo.codigo)"
                 style="transition: all 0.2s ease;">
              <div class="card-body text-center p-4">
                <div class="mb-3">
                  <i class="ph ph-file-text"
                     style="font-size: 3.5rem;"
                     [class.text-primary]="form.tipo_guia === tipo.codigo"
                     [class.text-secondary]="form.tipo_guia !== tipo.codigo"></i>
                </div>
                <h5 class="card-title mb-2"
                    [class.text-primary]="form.tipo_guia === tipo.codigo">
                  {{ tipo.nombre }}
                </h5>
                <p class="card-text text-muted small mb-3" style="min-height: 40px;">
                  {{ tipo.descripcion }}
                </p>
                <div>
                  <span class="badge px-3 py-2"
                        [class.bg-success]="tipo.requiere_sunat"
                        [class.bg-secondary]="!tipo.requiere_sunat">
                    {{ tipo.requiere_sunat ? 'ENVÍA A SUNAT' : 'NO ENVÍA A SUNAT' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertas informativas -->
        <div class="row justify-content-center mt-4">
          <div class="col-md-8">
            <div class="alert alert-info" *ngIf="form.tipo_guia === 'INTERNO'">
              <div class="d-flex align-items-start">
                <i class="ph ph-info me-3" style="font-size: 1.5rem;"></i>
                <div>
                  <strong>Traslado Interno:</strong> No requiere envío a SUNAT.
                  Ideal para movimientos entre almacenes de la misma empresa.
                </div>
              </div>
            </div>

            <div class="alert alert-success" *ngIf="form.tipo_guia === 'REMITENTE'">
              <div class="d-flex align-items-start">
                <i class="ph ph-check-circle me-3" style="font-size: 1.5rem;"></i>
                <div>
                  <strong>GRE Remitente:</strong> Guía para cuando eres el dueño de la mercancía.
                  Puedes usar transporte propio (modalidad 02) o contratado (modalidad 01).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paso 1: Cliente y Destinatario (Solo para REMITENTE) -->
      <div *ngIf="paso === 1 && form.tipo_guia === 'REMITENTE'" class="step-content">

        <!-- Opción: Usar cliente existente -->
        <div class="option-card mb-3"
             [class.selected]="usarClienteComoDestinatario"
             (click)="toggleCheckbox()">
          <div class="option-header">
            <div class="option-icon">
              <i class="ph ph-buildings"></i>
            </div>
            <div class="option-content">
              <h6 class="mb-1">Cliente Registrado</h6>
              <small class="text-muted">Usar datos de un cliente con RUC</small>
            </div>
            <div class="option-check">
              <i class="ph" [class.ph-check-circle]="usarClienteComoDestinatario" [class.ph-circle]="!usarClienteComoDestinatario"></i>
            </div>
          </div>

          <div *ngIf="usarClienteComoDestinatario" class="option-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">ID del Cliente *</label>
                <input type="number" class="form-control" [(ngModel)]="form.cliente_id"
                       placeholder="Ej: 1, 2, 3..."
                       min="1"
                       (click)="$event.stopPropagation()"
                       [class.is-invalid]="!form.cliente_id || form.cliente_id <= 0"
                       [class.is-valid]="form.cliente_id && form.cliente_id > 0">
                <small class="text-muted">El cliente debe tener RUC registrado</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Opción: Ingresar datos manualmente -->
        <div class="option-card mb-3"
             [class.selected]="!usarClienteComoDestinatario"
             (click)="!usarClienteComoDestinatario ? null : toggleCheckbox()">
          <div class="option-header">
            <div class="option-icon">
              <i class="ph ph-user"></i>
            </div>
            <div class="option-content">
              <h6 class="mb-1">Ingresar Manualmente</h6>
              <small class="text-muted">Destinatario con DNI o RUC</small>
            </div>
            <div class="option-check">
              <i class="ph" [class.ph-check-circle]="!usarClienteComoDestinatario" [class.ph-circle]="usarClienteComoDestinatario"></i>
            </div>
          </div>

          <div *ngIf="!usarClienteComoDestinatario" class="option-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Cliente (Opcional)</label>
                <input type="number" class="form-control" [(ngModel)]="form.cliente_id"
                       placeholder="ID del cliente para trazabilidad"
                       min="1"
                       (click)="$event.stopPropagation()">
                <small class="text-muted">Solo para vincular con un cliente existente</small>
              </div>
              <div class="col-md-4">
                <label class="form-label">Tipo Documento *</label>
                <select class="form-select" [(ngModel)]="form.destinatario_tipo_documento" (click)="$event.stopPropagation()">
                  <option value="1">DNI</option>
                  <option value="6">RUC</option>
                  <option value="4">Carnet Extranjería</option>
                  <option value="7">Pasaporte</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">N° Documento *</label>
                <input type="text" class="form-control" [(ngModel)]="form.destinatario_numero_documento"
                       [maxlength]="form.destinatario_tipo_documento === '6' ? 11 : 8"
                       (click)="$event.stopPropagation()">
              </div>
              <div class="col-md-4">
                <label class="form-label">Razón Social / Nombres *</label>
                <input type="text" class="form-control" [(ngModel)]="form.destinatario_razon_social"
                       (click)="$event.stopPropagation()">
              </div>
              <div class="col-md-8">
                <label class="form-label">Dirección *</label>
                <input type="text" class="form-control" [(ngModel)]="form.destinatario_direccion"
                       placeholder="Ej: AV. LOS HEROES 123, LIMA"
                       (click)="$event.stopPropagation()">
              </div>
              <div class="col-md-4">
                <label class="form-label">Ubigeo *</label>
                <input type="text" class="form-control" [(ngModel)]="form.destinatario_ubigeo"
                       placeholder="150101"
                       maxlength="6"
                       (click)="$event.stopPropagation()">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paso 2: Datos de Traslado -->
      <div *ngIf="paso === 2" class="step-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Fecha Inicio Traslado *</label>
            <input type="date" class="form-control" [(ngModel)]="form.fecha_inicio_traslado">
          </div>

          <div class="col-md-6" *ngIf="form.tipo_guia === 'REMITENTE'">
            <label class="form-label">Motivo de Traslado *</label>
            <select class="form-select" [(ngModel)]="form.motivo_traslado">
              <option value="01">Venta</option>
              <option value="02">Compra</option>
              <option value="13">Otros</option>
            </select>
          </div>

          <div class="col-md-6" *ngIf="form.tipo_guia === 'INTERNO'">
            <label class="form-label">Motivo de Traslado *</label>
            <select class="form-select" [(ngModel)]="form.motivo_traslado">
              <option value="04">Traslado entre establecimientos</option>
            </select>
          </div>

          <div class="col-md-6" *ngIf="form.tipo_guia === 'REMITENTE'">
            <label class="form-label">Modalidad de Traslado *</label>
            <select class="form-select" [(ngModel)]="form.modalidad_traslado">
              <option value="01">Transporte Público (Olva, Shalom, etc.)</option>
              <option value="02">Transporte Privado (vehículo propio)</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Número de Bultos</label>
            <input type="number" class="form-control" [(ngModel)]="form.numero_bultos" min="1" value="1">
          </div>

          <!-- Puntos de Partida y Llegada -->
          <div class="col-12 mt-4">
            <div class="section-header">
              <i class="ph ph-map-pin-line me-2"></i>
              <span>Punto de Partida</span>
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Ubigeo *</label>
            <input type="text" class="form-control" [(ngModel)]="form.punto_partida_ubigeo"
                   placeholder="150101" maxlength="6">
          </div>
          <div class="col-md-8">
            <label class="form-label">Dirección *</label>
            <input type="text" class="form-control" [(ngModel)]="form.punto_partida_direccion"
                   placeholder="AV. PRINCIPAL 123, LIMA">
          </div>

          <div class="col-12 mt-4">
            <div class="section-header">
              <i class="ph ph-map-pin me-2"></i>
              <span>Punto de Llegada</span>
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Ubigeo *</label>
            <input type="text" class="form-control" [(ngModel)]="form.punto_llegada_ubigeo"
                   placeholder="150101" maxlength="6">
          </div>
          <div class="col-md-8">
            <label class="form-label">Dirección *</label>
            <input type="text" class="form-control" [(ngModel)]="form.punto_llegada_direccion"
                   placeholder="AV. DESTINO 456, LIMA">
          </div>

          <div class="col-12">
            <label class="form-label">Observaciones</label>
            <textarea class="form-control" [(ngModel)]="form.observaciones" rows="2"
                      placeholder="Observaciones adicionales (opcional)"></textarea>
          </div>
        </div>
      </div>

      <!-- Paso 3: Vehículo y Conductor (Solo para REMITENTE con modalidad privado) -->
      <div *ngIf="paso === 3 && form.tipo_guia === 'REMITENTE' && form.modalidad_traslado === '02'" class="step-content">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Modo de Transporte *</label>
            <select class="form-select" [(ngModel)]="form.modo_transporte">
              <option value="01">Terrestre</option>
              <option value="02">Fluvial</option>
              <option value="03">Aéreo</option>
              <option value="04">Marítimo</option>
            </select>
          </div>
          <div class="col-md-8">
            <label class="form-label">Placa del Vehículo *</label>
            <input type="text" class="form-control" [(ngModel)]="form.numero_placa"
                   placeholder="ABC-123" maxlength="7">
          </div>
          <div class="col-md-6">
            <label class="form-label">DNI del Conductor *</label>
            <input type="text" class="form-control" [(ngModel)]="form.conductor_dni"
                   maxlength="8" placeholder="12345678">
          </div>
          <div class="col-md-6">
            <label class="form-label">Nombres del Conductor *</label>
            <input type="text" class="form-control" [(ngModel)]="form.conductor_nombres"
                   placeholder="JUAN PEREZ GARCIA">
          </div>
        </div>
      </div>

      <!-- Paso 4: Productos/Items -->
      <div *ngIf="paso === 4" class="step-content">
        <!-- Buscador de productos (ESTILO POS) -->
        <div class="producto-search-card mb-3">
          <div class="search-header">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" class="form-control"
                   [(ngModel)]="busquedaProducto"
                   (input)="buscarProductos()"
                   placeholder="Buscar producto por nombre o código..."
                   autofocus>
            <button *ngIf="busquedaProducto" 
                    type="button" 
                    class="btn-clear-search" 
                    (click)="limpiarBusqueda()">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- RESULTADOS DE BÚSQUEDA CON SELECCIÓN MÚLTIPLE -->
          <div class="search-results" *ngIf="busquedaProducto && productosFiltrados.length > 0">
            <!-- Header con selección múltiple -->
            <div class="search-results-header">
              <div class="header-left">
                <input 
                  type="checkbox" 
                  class="custom-checkbox" 
                  [checked]="todosResultadosSeleccionados"
                  [indeterminate]="algunosResultadosSeleccionados"
                  (change)="toggleTodosResultados($event)"
                  title="Seleccionar todos"
                >
                <span class="results-count">{{ productosFiltrados.length }} resultados</span>
                <span *ngIf="totalResultadosSeleccionados > 0" class="badge-selected">
                  <i class="ph ph-check-circle"></i>
                  {{ totalResultadosSeleccionados }} seleccionado(s)
                </span>
              </div>
              <button 
                *ngIf="totalResultadosSeleccionados > 0"
                type="button"
                class="btn btn-sm btn-primary"
                (click)="agregarProductosSeleccionados()">
                <i class="ph ph-plus"></i>
                Agregar seleccionados
              </button>
            </div>

            <!-- Lista de resultados -->
            <div class="results-list">
              <div 
                *ngFor="let producto of productosFiltrados.slice(0, 6); trackBy: trackByProductoId" 
                class="search-result-item"
                [class.selected]="producto.seleccionado"
              >
                <div class="result-left">
                  <input 
                    type="checkbox" 
                    class="custom-checkbox" 
                    [(ngModel)]="producto.seleccionado"
                    (change)="onCheckboxResultadoChange(producto)"
                    (click)="$event.stopPropagation()"
                  >
                  <div class="producto-info">
                    <div class="producto-icon">
                      <i class="ph ph-package"></i>
                    </div>
                    <div class="producto-details">
                      <strong>{{ producto.nombre }}</strong>
                      <small class="text-muted d-block">
                        Código: {{ producto.codigo_producto || 'N/A' }} | 
                        Stock: {{ getStockDisponible(producto) }}
                      </small>
                    </div>
                  </div>
                </div>

                <div class="result-right">
                  <!-- Controles de cantidad (solo si está seleccionado) -->
                  <div class="quantity-controls" *ngIf="producto.seleccionado">
                    <button 
                      type="button" 
                      class="btn-quantity btn-minus"
                      (click)="decrementarResultado(producto); $event.stopPropagation()"
                      [disabled]="producto.cantidadSeleccionada <= 1"
                    >
                      <i class="ph ph-minus"></i>
                    </button>
                    <input 
                      type="number" 
                      class="quantity-input" 
                      [(ngModel)]="producto.cantidadSeleccionada"
                      (change)="validarCantidadResultado(producto)"
                      (click)="$event.stopPropagation()"
                      min="1"
                      [max]="getStockDisponible(producto)"
                    >
                    <button 
                      type="button" 
                      class="btn-quantity btn-plus"
                      (click)="incrementarResultado(producto); $event.stopPropagation()"
                      [disabled]="producto.cantidadSeleccionada >= getStockDisponible(producto) || getStockDisponible(producto) === 0"
                    >
                      <i class="ph ph-plus"></i>
                    </button>
                  </div>
                  
                  <!-- Botón agregar individual (si no está seleccionado) -->
                  <button 
                    *ngIf="!producto.seleccionado"
                    type="button" 
                    class="btn btn-sm btn-primary"
                    (click)="seleccionarProducto(producto)">
                    <i class="ph ph-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Mostrar más resultados -->
            <div *ngIf="productosFiltrados.length > 6" class="search-footer">
              <small class="text-muted">
                Mostrando 6 de {{ productosFiltrados.length }} resultados
              </small>
            </div>
          </div>

          <!-- Sin resultados -->
          <div class="search-empty" *ngIf="busquedaProducto && productosFiltrados.length === 0">
            <i class="ph ph-magnifying-glass"></i>
            <p class="mb-0">No se encontraron productos</p>
          </div>
        </div>

        <!-- Lista de productos agregados -->
        <div class="productos-agregados">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">
              <i class="ph ph-list-bullets me-2"></i>
              Productos Agregados ({{ form.detalles.length }})
            </h6>
            <span class="badge bg-primary">
              Peso Total: {{ getPesoTotalCalculado() | number:'1.2-2' }} kg
            </span>
          </div>

          <div *ngIf="form.detalles.length === 0" class="empty-productos">
            <i class="ph ph-package"></i>
            <p class="mb-0">Busca y selecciona productos arriba para agregarlos</p>
          </div>

          <div class="producto-item" *ngFor="let detalle of form.detalles; let i = index"
               [class.invalid]="!esDetalleValido(detalle)">
            <div class="producto-header">
              <div class="producto-name">
                <strong>{{ detalle.nombre_producto || 'Producto #' + detalle.producto_id }}</strong>
              </div>
              <button type="button" class="btn btn-sm btn-outline-danger"
                      (click)="eliminarDetalle(i)">
                <i class="ph ph-trash"></i>
              </button>
            </div>
            <div class="producto-body">
              <div class="row g-2">
                <div class="col-md-4">
                  <label class="form-label">Cantidad *</label>
                  <input type="number" class="form-control form-control-sm"
                         [(ngModel)]="detalle.cantidad"
                         placeholder="Ej: 10"
                         step="1" min="1"
                         (change)="calcularPesoTotal()"
                         [class.is-invalid]="!detalle.cantidad || detalle.cantidad <= 0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Peso Unit. (kg) *</label>
                  <input type="number" class="form-control form-control-sm"
                         [(ngModel)]="detalle.peso_unitario"
                         placeholder="Ej: 2.5"
                         step="0.01" min="0.01"
                         (change)="calcularPesoTotal()"
                         [class.is-invalid]="!detalle.peso_unitario || detalle.peso_unitario <= 0">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Peso Total</label>
                  <div class="peso-total-display">
                    {{ (detalle.cantidad * detalle.peso_unitario) | number:'1.2-2' }} kg
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Observaciones (opcional)</label>
                  <input type="text" class="form-control form-control-sm"
                         [(ngModel)]="detalle.observaciones"
                         placeholder="Ej: Frágil, Refrigerado, etc.">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerta si no hay productos -->
        <div *ngIf="form.detalles.length === 0" class="alert alert-info mt-3">
          <i class="ph ph-info me-2"></i>
          <strong>Productos a trasladar:</strong> Son los productos de tu inventario que enviarás.
          Busca y selecciona al menos un producto para continuar.
        </div>
      </div>

      <!-- Mensajes -->
      <div *ngIf="error" class="alert alert-danger mt-3">
        <i class="ph ph-warning me-2"></i>{{ error }}
      </div>
      <div *ngIf="success" class="alert alert-success mt-3">
        <i class="ph ph-check-circle me-2"></i>{{ success }}
      </div>
    </div>

    <!-- Footer personalizado -->
    <div footer class="d-flex justify-content-between w-100">
        <button type="button" class="btn btn-secondary" (click)="close()" [disabled]="loading">
          Cancelar
        </button>
        <div>
          <button *ngIf="paso > 0" type="button" class="btn btn-outline-primary me-2" 
                  (click)="paso = paso - 1" [disabled]="loading">
            <i class="ph ph-arrow-left me-1"></i> Anterior
          </button>
          <button *ngIf="paso < getMaxPaso()" type="button" class="btn btn-primary" 
                  (click)="siguientePaso()">
            Siguiente <i class="ph ph-arrow-right ms-1"></i>
          </button>
          <button *ngIf="paso === getMaxPaso()" type="button" class="btn btn-success" 
                  (click)="submit()" [disabled]="loading || !isFormValid()">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading" class="ph ph-paper-plane me-1"></i>
            {{ loading ? 'Emitiendo...' : 'Emitir Guía' }}
          </button>
        </div>
    </div>
  </app-base-modal>
  `,
  styles: [`
    :host ::ng-deep .modal-xl {
      max-width: 1140px;
    }

    :host ::ng-deep .modal-dialog-scrollable .modal-body {
      max-height: calc(100vh - 200px);
    }

    .gre-modal {
      min-height: 500px;
    }

    /* Steps Navigation */
    .steps-container {
      overflow-x: auto;
      padding: 0.5rem 0;
    }

    .steps-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: fit-content;
      gap: 0;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .step-item.active {
      opacity: 1;
    }

    .step-item.completed {
      opacity: 0.7;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bs-gray-300);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .step-item.active .step-circle {
      background: var(--bs-primary);
      color: white;
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.1);
    }

    .step-item.completed .step-circle {
      background: var(--bs-success);
      color: white;
    }

    .step-circle i {
      font-size: 1.25rem;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-align: center;
    }

    .step-divider {
      width: 60px;
      height: 2px;
      background: var(--bs-gray-300);
      margin: 0 0.5rem;
      margin-bottom: 1.5rem;
    }

    /* Step Content */
    .step-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Option Cards */
    .option-card {
      border: 2px solid var(--bs-gray-300);
      border-radius: 0.75rem;
      transition: all 0.3s ease;
      cursor: pointer;
      background: white;
      overflow: hidden;
    }

    .option-card:hover {
      border-color: var(--bs-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .option-card.selected {
      border-color: var(--bs-primary);
      background: rgba(var(--bs-primary-rgb), 0.03);
    }

    .option-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .option-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      background: var(--bs-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .option-card.selected .option-icon {
      background: var(--bs-primary);
      color: white;
    }

    .option-icon i {
      font-size: 1.5rem;
    }

    .option-content {
      flex: 1;
    }

    .option-content h6 {
      margin: 0;
      font-weight: 600;
    }

    .option-check {
      font-size: 1.5rem;
      color: var(--bs-gray-400);
      transition: all 0.3s ease;
    }

    .option-card.selected .option-check {
      color: var(--bs-primary);
    }

    .option-body {
      padding: 0 1.25rem 1.25rem;
      border-top: 1px solid var(--bs-gray-200);
      padding-top: 1.25rem;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: var(--bs-gray-700);
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--bs-gray-200);
    }

    .section-header i {
      color: var(--bs-primary);
    }

    /* Form Elements */
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--bs-gray-700);
    }

    .form-control,
    .form-select {
      font-size: 0.875rem;
      border-radius: 0.5rem;
      border: 1.5px solid var(--bs-gray-300);
      transition: all 0.2s ease;
    }

    .form-control:focus,
    .form-select:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.1);
    }

    /* Table */
    .table-responsive {
      max-height: 400px;
      overflow-y: auto;
      border-radius: 0.5rem;
      border: 1px solid var(--bs-gray-200);
    }

    .table thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bs-gray-100);
    }

    /* Utilities */
    .cursor-pointer {
      cursor: pointer;
    }

    .transition-all {
      transition: all 0.2s ease;
    }

    /* Product Search (ESTILO POS) */
    .producto-search-card {
      background: white;
      border: 2px solid var(--bs-gray-300);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .search-header {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid var(--bs-gray-200);
    }

    .search-header i {
      font-size: 1.25rem;
      color: var(--bs-gray-500);
    }

    .search-header .form-control {
      border: none;
      padding: 0;
      box-shadow: none;
      flex: 1;
    }

    .search-header .form-control:focus {
      border: none;
      box-shadow: none;
    }

    .btn-clear-search {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bs-gray-200);
      border: none;
      border-radius: 6px;
      color: var(--bs-gray-600);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-clear-search:hover {
      background: var(--bs-gray-300);
      color: var(--bs-gray-900);
    }

    /* Search Results Header */
    .search-results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--bs-gray-200);
      background: var(--bs-gray-50);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--bs-primary);
    }

    .results-count {
      font-size: 0.875rem;
      color: var(--bs-gray-600);
      font-weight: 500;
    }

    .badge-selected {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: rgba(var(--bs-primary-rgb), 0.1);
      color: var(--bs-primary);
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Results List */
    .results-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--bs-gray-100);
      transition: all 0.2s ease;
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .search-result-item:hover {
      background: var(--bs-gray-50);
    }

    .search-result-item.selected {
      background: rgba(var(--bs-primary-rgb), 0.05);
      border-left: 3px solid var(--bs-primary);
    }

    .result-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .result-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .producto-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .producto-icon {
      width: 40px;
      height: 40px;
      border-radius: 0.5rem;
      background: var(--bs-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: var(--bs-gray-600);
      flex-shrink: 0;
    }

    .producto-details {
      flex: 1;
      min-width: 0;
    }

    .producto-details strong {
      display: block;
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .producto-details small {
      font-size: 0.75rem;
    }

    /* Quantity Controls */
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: white;
      border: 1px solid var(--bs-gray-300);
      border-radius: 0.5rem;
      padding: 0.25rem;
    }

    .btn-quantity {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bs-gray-100);
      border: none;
      border-radius: 0.375rem;
      color: var(--bs-gray-700);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-quantity:hover:not(:disabled) {
      background: var(--bs-primary);
      color: white;
    }

    .btn-quantity:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-quantity i {
      font-size: 0.875rem;
    }

    .quantity-input {
      width: 45px;
      border: none;
      text-align: center;
      font-weight: 600;
      color: var(--bs-gray-900);
      font-size: 0.875rem;
      background: transparent;
      padding: 0;
    }

    .quantity-input:focus {
      outline: none;
    }

    .quantity-input::-webkit-inner-spin-button,
    .quantity-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Search Footer */
    .search-footer {
      padding: 0.75rem 1rem;
      text-align: center;
      border-top: 1px solid var(--bs-gray-200);
      background: var(--bs-gray-50);
    }

    .search-empty,
    .search-loading {
      padding: 2rem;
      text-align: center;
      color: var(--bs-gray-500);
    }

    .search-empty i {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    /* Productos Agregados */
    .productos-agregados {
      margin-top: 1.5rem;
    }

    .empty-productos {
      text-align: center;
      padding: 3rem 1rem;
      background: var(--bs-gray-100);
      border-radius: 0.5rem;
      color: var(--bs-gray-500);
    }

    .empty-productos i {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .producto-item {
      background: white;
      border: 2px solid var(--bs-gray-300);
      border-radius: 0.75rem;
      margin-bottom: 0.75rem;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .producto-item.invalid {
      border-color: var(--bs-warning);
      background: rgba(255, 193, 7, 0.05);
    }

    .producto-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--bs-gray-100);
      border-bottom: 1px solid var(--bs-gray-300);
    }

    .producto-name strong {
      font-size: 0.875rem;
      color: var(--bs-gray-800);
    }

    .producto-body {
      padding: 1rem;
    }

    .peso-total-display {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 38px;
      background: var(--bs-gray-100);
      border-radius: 0.5rem;
      font-weight: 600;
      color: var(--bs-primary);
      font-size: 0.875rem;
    }
  `]
})
export class GuiaRemisionModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() guiaId?: number;
  @Input() tipoGuiaPredefinido?: 'REMITENTE' | 'INTERNO';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<any>();

  paso = 0;
  loading = false;
  error = '';
  success = '';
  tiposGuia: any[] = [];
  usarClienteComoDestinatario = false;

  // Búsqueda de productos
  busquedaProducto = '';
  productosBuscados: any[] = [];
  buscandoProductos = false;
  searchTimeout: any;

  // Productos disponibles (todos)
  productosDisponibles: any[] = [];
  productosFiltrados: any[] = [];

  // Getters para selección múltiple
  get totalResultadosSeleccionados(): number {
    return this.productosFiltrados.filter(p => p.seleccionado).length;
  }

  get todosResultadosSeleccionados(): boolean {
    return this.productosFiltrados.length > 0 &&
      this.productosFiltrados.every(p => p.seleccionado);
  }

  get algunosResultadosSeleccionados(): boolean {
    const seleccionados = this.productosFiltrados.filter(p => p.seleccionado).length;
    return seleccionados > 0 && seleccionados < this.productosFiltrados.length;
  }

  get tiposGuiaFiltrados(): any[] {
    if (this.tipoGuiaPredefinido) {
      return this.tiposGuia.filter(t => t.codigo === this.tipoGuiaPredefinido);
    }
    return this.tiposGuia;
  }

  form: GuiaRemisionForm = {
    tipo_guia: 'REMITENTE',
    fecha_inicio_traslado: new Date().toISOString().split('T')[0],
    destinatario_tipo_documento: '6',
    destinatario_numero_documento: '',
    destinatario_razon_social: '',
    destinatario_direccion: '',
    destinatario_ubigeo: '',
    motivo_traslado: '01',
    modalidad_traslado: '02',
    modo_transporte: '01',
    numero_bultos: 1,
    punto_partida_ubigeo: '',
    punto_partida_direccion: '',
    punto_llegada_ubigeo: '',
    punto_llegada_direccion: '',
    detalles: []
  };

  constructor(
    private guiasService: GuiasRemisionService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.cargarTiposGuia();
    this.cargarProductos(); // ✅ Cargar productos al iniciar
    this.resetearFormulario();

    // Si hay tipo predefinido, configurar y saltar al paso correspondiente
    if (this.tipoGuiaPredefinido) {
      this.form.tipo_guia = this.tipoGuiaPredefinido;
      // INTERNO empieza en paso 2 (sin destinatario), otros en paso 1
      this.paso = this.tipoGuiaPredefinido === 'INTERNO' ? 2 : 1;
    }

    // Por defecto, NO usar cliente como destinatario para evitar confusión
    this.usarClienteComoDestinatario = false;

    if (this.guiaId) {
      this.cargarGuia();
    }
  }

  resetearFormulario(): void {
    this.usarClienteComoDestinatario = false;
    this.form.cliente_id = undefined;
    this.error = '';
    this.success = '';
  }

  toggleCheckbox(): void {
    this.usarClienteComoDestinatario = !this.usarClienteComoDestinatario;
    this.onCheckboxClienteChange();
  }

  onCheckboxClienteChange(): void {
    // Limpiar cliente_id cuando se desmarca el checkbox
    if (!this.usarClienteComoDestinatario) {
      this.form.cliente_id = undefined;
      // NO limpiar los datos del destinatario manual cuando se desmarca
      // para que el usuario no pierda lo que ya escribió
    } else {
      // Si marca el checkbox, limpiar los datos manuales del destinatario
      this.form.destinatario_tipo_documento = '6';
      this.form.destinatario_numero_documento = '';
      this.form.destinatario_razon_social = '';
      this.form.destinatario_direccion = '';
      this.form.destinatario_ubigeo = '';
    }
    // Limpiar error
    this.error = '';
  }

  getModalTitle(): string {
    if (this.guiaId) {
      return 'Editar Guía de Remisión';
    }

    if (this.tipoGuiaPredefinido) {
      switch (this.tipoGuiaPredefinido) {
        case 'REMITENTE':
          return 'Nueva GRE Remitente';
        case 'INTERNO':
          return 'Nuevo Traslado Interno';
        default:
          return 'Nueva Guía de Remisión';
      }
    }

    return 'Nueva Guía de Remisión';
  }

  seleccionarTipoGuia(tipo: 'REMITENTE' | 'INTERNO'): void {
    this.form.tipo_guia = tipo;
  }

  cargarTiposGuia(): void {
    this.guiasService.getTiposGuia().subscribe({
      next: (res) => {
        this.tiposGuia = res.data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de guía:', err);
      }
    });
  }

  cargarGuia(): void {
    this.loading = true;
    this.guiasService.getGuia(this.guiaId!).subscribe({
      next: (res: any) => {
        // Cargar datos de la guía
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar la guía';
        this.loading = false;
      }
    });
  }


  esDetalleValido(detalle: any): boolean {
    return detalle.producto_id > 0 &&
      detalle.cantidad > 0 &&
      detalle.peso_unitario > 0;
  }

  todosLosDetallesValidos(): boolean {
    return this.form.detalles.every(d => this.esDetalleValido(d));
  }

  eliminarDetalle(index: number): void {
    this.form.detalles.splice(index, 1);
    this.calcularPesoTotal();
  }

  calcularPesoTotal(): void {
    const pesoCalculado = this.getPesoTotalCalculado();
    // Opcional: actualizar automáticamente el peso total
    // this.form.peso_total = pesoCalculado;
  }

  getPesoTotalCalculado(): number {
    return this.form.detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.peso_unitario);
    }, 0);
  }

  isFormValid(): boolean {
    // 1. Validar productos
    if (this.form.detalles.length === 0) {
      return false;
    }
    if (!this.todosLosDetallesValidos()) {
      return false;
    }

    // 2. Validar puntos de partida y llegada
    if (!this.form.punto_partida_ubigeo || !this.form.punto_partida_direccion ||
      !this.form.punto_llegada_ubigeo || !this.form.punto_llegada_direccion) {
      return false;
    }

    // 3. Validar ubigeos (6 dígitos)
    if (this.form.punto_partida_ubigeo.length !== 6 || this.form.punto_llegada_ubigeo.length !== 6) {
      return false;
    }

    // 4. Validaciones específicas por tipo
    if (this.form.tipo_guia === 'REMITENTE') {
      // Cliente ID obligatorio SOLO si usa cliente como destinatario
      if (this.usarClienteComoDestinatario && (!this.form.cliente_id || this.form.cliente_id <= 0)) {
        return false;
      }

      // Validar destinatario si NO usa cliente como destinatario
      if (!this.usarClienteComoDestinatario) {
        if (!this.form.destinatario_numero_documento ||
          !this.form.destinatario_razon_social ||
          !this.form.destinatario_direccion ||
          !this.form.destinatario_ubigeo ||
          this.form.destinatario_ubigeo.length !== 6) {
          return false;
        }
      }

      // Validar transporte privado
      if (this.form.modalidad_traslado === '02') {
        if (!this.form.numero_placa || !this.form.conductor_dni || !this.form.conductor_nombres) {
          return false;
        }
        // Validar DNI (8 dígitos)
        if (this.form.conductor_dni && this.form.conductor_dni.length !== 8) {
          return false;
        }
      }
    }

    return true;
  }

  submit(): void {
    if (!this.isFormValid()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    // Crear objeto según estructura de la API
    const formData: any = {};

    if (this.form.tipo_guia === 'REMITENTE') {
      // Estructura para GRE Remitente
      formData.cliente_id = this.form.cliente_id;
      formData.motivo_traslado = this.form.motivo_traslado;
      formData.modalidad_traslado = this.form.modalidad_traslado;
      formData.fecha_inicio_traslado = this.form.fecha_inicio_traslado;
      formData.punto_partida_ubigeo = this.form.punto_partida_ubigeo;
      formData.punto_partida_direccion = this.form.punto_partida_direccion;
      formData.punto_llegada_ubigeo = this.form.punto_llegada_ubigeo;
      formData.punto_llegada_direccion = this.form.punto_llegada_direccion;

      // Productos
      formData.productos = this.form.detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        peso_unitario: detalle.peso_unitario,
        observaciones: detalle.observaciones
      }));

      // Opcionales
      if (this.form.numero_bultos) {
        formData.numero_bultos = this.form.numero_bultos;
      }
      if (this.form.observaciones) {
        formData.observaciones = this.form.observaciones;
      }

      // Destinatario
      if (this.usarClienteComoDestinatario) {
        formData.usar_cliente_como_destinatario = true;
      } else {
        formData.destinatario_tipo_documento = this.form.destinatario_tipo_documento;
        formData.destinatario_numero_documento = this.form.destinatario_numero_documento;
        formData.destinatario_razon_social = this.form.destinatario_razon_social;
        formData.destinatario_direccion = this.form.destinatario_direccion;
        formData.destinatario_ubigeo = this.form.destinatario_ubigeo;
      }

      // Modalidad 02 - Transporte Privado
      if (this.form.modalidad_traslado === '02') {
        formData.modo_transporte = this.form.modo_transporte || '01';
        formData.numero_placa = this.form.numero_placa;
        formData.conductor_dni = this.form.conductor_dni;
        formData.conductor_nombres = this.form.conductor_nombres;
      }
    } else {
      // Estructura para Traslado Interno
      formData.motivo_traslado = this.form.motivo_traslado;
      formData.fecha_inicio_traslado = this.form.fecha_inicio_traslado;
      formData.punto_partida_ubigeo = this.form.punto_partida_ubigeo;
      formData.punto_partida_direccion = this.form.punto_partida_direccion;
      formData.punto_llegada_ubigeo = this.form.punto_llegada_ubigeo;
      formData.punto_llegada_direccion = this.form.punto_llegada_direccion;

      // Productos
      formData.productos = this.form.detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        peso_unitario: detalle.peso_unitario,
        observaciones: detalle.observaciones
      }));

      // Opcionales
      if (this.form.numero_bultos) {
        formData.numero_bultos = this.form.numero_bultos;
      }
      if (this.form.observaciones) {
        formData.observaciones = this.form.observaciones;
      }

      // Destinatario opcional para interno
      if (this.form.destinatario_numero_documento) {
        formData.destinatario_tipo_documento = this.form.destinatario_tipo_documento;
        formData.destinatario_numero_documento = this.form.destinatario_numero_documento;
        formData.destinatario_razon_social = this.form.destinatario_razon_social;
        formData.destinatario_direccion = this.form.destinatario_direccion;
        formData.destinatario_ubigeo = this.form.destinatario_ubigeo;
      }
    }

    // Seleccionar el endpoint correcto según el tipo
    let request;
    if (this.form.tipo_guia === 'REMITENTE') {
      request = this.guiasService.crearGuiaRemitente(formData);
    } else {
      request = this.guiasService.crearTrasladoInterno(formData);
    }

    request.subscribe({
      next: (res: any) => {
        this.success = 'Guía de remisión creada exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.onSuccess.emit(res.data);
          this.close();
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error al crear guía:', err);
        this.error = err.error?.message || 'Error al crear la guía de remisión';

        // Mostrar errores de validación si existen
        if (err.error?.errors) {
          const erroresValidacion = Object.values(err.error.errors).flat();
          this.error = erroresValidacion.join(', ');
        }

        this.loading = false;
      }
    });
  }

  getMaxPaso(): number {
    // Para INTERNO: solo 2 pasos (Traslado, Productos) = paso 4
    // Para REMITENTE con modalidad 01: 3 pasos (Destinatario, Traslado, Productos) = paso 4
    // Para REMITENTE con modalidad 02: 4 pasos (Destinatario, Traslado, Transporte, Productos) = paso 4
    return 4;
  }

  siguientePaso(): void {
    // Limpiar errores anteriores
    this.error = '';

    // Validar paso actual antes de avanzar
    if (!this.validarPasoActual()) {
      return;
    }

    // Saltar paso 3 si no es necesario (INTERNO o REMITENTE con modalidad 01)
    if (this.paso === 2) {
      if (this.form.tipo_guia === 'INTERNO' ||
        (this.form.tipo_guia === 'REMITENTE' && this.form.modalidad_traslado === '01')) {
        this.paso = 4; // Saltar al paso de productos
        return;
      }
    }
    this.paso++;
  }

  validarPasoActual(): boolean {
    switch (this.paso) {
      case 0: // Tipo de guía
        if (!this.form.tipo_guia) {
          this.error = 'Selecciona un tipo de guía';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        return true;

      case 1: // Cliente y Destinatario (solo REMITENTE)
        if (this.form.tipo_guia === 'REMITENTE') {
          // Si USA cliente como destinatario, validar que haya cliente
          if (this.usarClienteComoDestinatario) {
            if (!this.form.cliente_id || this.form.cliente_id <= 0) {
              this.error = 'Debes seleccionar un cliente para crear una GRE Remitente';
              setTimeout(() => this.error = '', 5000);
              return false;
            }
          }

          // Si NO usa cliente como destinatario, validar datos del destinatario
          if (!this.usarClienteComoDestinatario) {
            if (!this.form.destinatario_numero_documento || !this.form.destinatario_razon_social ||
              !this.form.destinatario_direccion || !this.form.destinatario_ubigeo) {
              this.error = 'Completa todos los datos del destinatario';
              setTimeout(() => this.error = '', 5000);
              return false;
            }
            if (this.form.destinatario_ubigeo.length !== 6) {
              this.error = 'El ubigeo del destinatario debe tener 6 dígitos';
              setTimeout(() => this.error = '', 5000);
              return false;
            }
          }
        }
        return true;

      case 2: // Traslado
        if (!this.form.fecha_inicio_traslado) {
          this.error = 'Ingresa la fecha de inicio del traslado';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        if (!this.form.punto_partida_ubigeo || !this.form.punto_partida_direccion) {
          this.error = 'Completa los datos del punto de partida';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        if (!this.form.punto_llegada_ubigeo || !this.form.punto_llegada_direccion) {
          this.error = 'Completa los datos del punto de llegada';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        if (this.form.punto_partida_ubigeo.length !== 6) {
          this.error = 'El ubigeo de partida debe tener exactamente 6 dígitos';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        if (this.form.punto_llegada_ubigeo.length !== 6) {
          this.error = 'El ubigeo de llegada debe tener exactamente 6 dígitos';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        return true;

      case 3: // Vehículo (solo REMITENTE con modalidad 02)
        if (this.form.tipo_guia === 'REMITENTE' && this.form.modalidad_traslado === '02') {
          if (!this.form.numero_placa) {
            this.error = 'Ingresa la placa del vehículo';
            setTimeout(() => this.error = '', 3000);
            return false;
          }
          if (!this.form.conductor_dni) {
            this.error = 'Ingresa el DNI del conductor';
            setTimeout(() => this.error = '', 3000);
            return false;
          }
          if (this.form.conductor_dni.length !== 8) {
            this.error = 'El DNI del conductor debe tener 8 dígitos';
            setTimeout(() => this.error = '', 3000);
            return false;
          }
          if (!this.form.conductor_nombres) {
            this.error = 'Ingresa el nombre del conductor';
            setTimeout(() => this.error = '', 3000);
            return false;
          }
        }
        return true;

      case 4: // Productos
        if (this.form.detalles.length === 0) {
          this.error = 'Debes agregar al menos un producto';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        if (!this.todosLosDetallesValidos()) {
          this.error = 'Completa todos los datos de los productos (ID, cantidad y peso son obligatorios)';
          setTimeout(() => this.error = '', 3000);
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // ============================================
  // MÉTODOS DE BÚSQUEDA Y SELECCIÓN DE PRODUCTOS (ESTILO POS)
  // ============================================

  /**
   * Cargar todos los productos disponibles
   */
  cargarProductos(): void {
    this.productosService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productosDisponibles = productos.filter(p => p.activo && p.stock > 0);
        this.productosFiltrados = [];
        console.log('✅ Productos cargados:', this.productosDisponibles.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });
  }

  /**
   * Filtrar productos en tiempo real (estilo POS)
   */
  buscarProductos(): void {
    if (!this.busquedaProducto || this.busquedaProducto.trim() === '') {
      this.productosFiltrados = [];
      return;
    }

    const termino = this.busquedaProducto.toLowerCase().trim();

    this.productosFiltrados = this.productosDisponibles.filter(producto => {
      const nombre = (producto.nombre || '').toLowerCase();
      const codigo = (producto.codigo_producto || producto.codigo || '').toLowerCase();

      return nombre.includes(termino) || codigo.includes(termino);
    }).map(p => ({
      ...p,
      seleccionado: false,
      cantidadSeleccionada: 1
    }));
  }

  /**
   * Limpiar búsqueda
   */
  limpiarBusqueda(): void {
    this.busquedaProducto = '';
    this.productosFiltrados = [];
  }

  /**
   * Seleccionar/deseleccionar todos los resultados
   */
  toggleTodosResultados(event: any): void {
    const checked = event.target.checked;
    this.productosFiltrados.forEach(producto => {
      producto.seleccionado = checked;
      if (checked && !producto.cantidadSeleccionada) {
        producto.cantidadSeleccionada = 1;
      }
    });
  }

  /**
   * Cambio en checkbox individual
   */
  onCheckboxResultadoChange(producto: any): void {
    if (producto.seleccionado && !producto.cantidadSeleccionada) {
      producto.cantidadSeleccionada = 1;
    }
  }

  /**
   * Incrementar cantidad en resultado
   */
  incrementarResultado(producto: any): void {
    const stockDisponible = this.getStockDisponible(producto);
    if (producto.cantidadSeleccionada < stockDisponible) {
      producto.cantidadSeleccionada++;
    }
  }

  /**
   * Decrementar cantidad en resultado
   */
  decrementarResultado(producto: any): void {
    if (producto.cantidadSeleccionada > 1) {
      producto.cantidadSeleccionada--;
    }
  }

  /**
   * Validar cantidad en resultado
   */
  validarCantidadResultado(producto: any): void {
    const stockDisponible = this.getStockDisponible(producto);

    if (producto.cantidadSeleccionada < 1) {
      producto.cantidadSeleccionada = 1;
    } else if (producto.cantidadSeleccionada > stockDisponible) {
      producto.cantidadSeleccionada = stockDisponible;
    }
  }

  /**
   * Obtener stock disponible
   */
  getStockDisponible(producto: any): number {
    return producto.stock || 0;
  }

  /**
   * Agregar producto individual
   */
  seleccionarProducto(producto: any): void {
    // Verificar si el producto ya fue agregado
    const yaAgregado = this.form.detalles.find(d => d.producto_id === producto.id);
    if (yaAgregado) {
      // Si ya existe, incrementar cantidad
      yaAgregado.cantidad += (producto.cantidadSeleccionada || 1);
      this.error = 'Cantidad actualizada para el producto existente';
      setTimeout(() => this.error = '', 2000);
    } else {
      // Agregar producto con datos pre-llenados
      this.form.detalles.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: producto.cantidadSeleccionada || 1,
        peso_unitario: 0.5, // Peso estimado por defecto
        observaciones: ''
      });
    }

    // Limpiar selección
    producto.seleccionado = false;
    producto.cantidadSeleccionada = 1;

    this.calcularPesoTotal();
  }

  /**
   * Agregar productos seleccionados (múltiples)
   */
  agregarProductosSeleccionados(): void {
    const seleccionados = this.productosFiltrados.filter(p => p.seleccionado);

    if (seleccionados.length === 0) {
      this.error = 'No hay productos seleccionados';
      setTimeout(() => this.error = '', 2000);
      return;
    }

    seleccionados.forEach(producto => {
      this.seleccionarProducto(producto);
    });

    this.success = `✅ ${seleccionados.length} producto(s) agregado(s)`;
    setTimeout(() => this.success = '', 2000);

    // Limpiar búsqueda
    this.limpiarBusqueda();
  }

  /**
   * TrackBy para optimizar renderizado
   */
  trackByProductoId(index: number, producto: any): any {
    return producto.id || index;
  }

  close(): void {
    this.paso = this.tipoGuiaPredefinido ? 1 : 0;
    this.error = '';
    this.success = '';
    this.busquedaProducto = '';
    this.productosBuscados = [];
    this.onClose.emit();
  }
}
