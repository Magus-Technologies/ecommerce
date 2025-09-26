import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensasService } from '../../../../services/recompensas.service';

export interface ConfiguracionPuntosData {
  puntos_por_compra: number;
  puntos_por_monto: number;
  puntos_registro: number;
  tipo_calculo: string;
  valor: number;
  minimo_compra: number;
  maximo_puntos: number;
  multiplicador_nivel: number;
}

@Component({
  selector: 'app-recompensas-configuracion-puntos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recompensas-configuracion-puntos.component.html',
  styleUrls: ['./recompensas-configuracion-puntos.component.scss']
})
export class RecompensasConfiguracionPuntosComponent implements OnInit {
  @Input() recompensaId?: number;
  @Input() configuracionInicial?: ConfiguracionPuntosData;
  @Output() configuracionChange = new EventEmitter<ConfiguracionPuntosData>();

  configuracion: ConfiguracionPuntosData = {
    puntos_por_compra: 0,
    puntos_por_monto: 0,
    puntos_registro: 0,
    tipo_calculo: 'fijo',
    valor: 0,
    minimo_compra: 0,
    maximo_puntos: 0,
    multiplicador_nivel: 1
  };

  tiposCalculo = [
    { value: 'fijo', label: 'Puntos Fijos' },
    { value: 'porcentaje', label: 'Porcentaje del Monto' },
    { value: 'escalonado', label: 'Escalonado por Nivel' }
  ];

  simulacion = {
    monto_compra: 0,
    puntos_obtenidos: 0,
    calculando: false
  };

  ejemplosPredefinidos = [
    {
      nombre: 'Básico',
      descripcion: 'Sistema simple de puntos fijos',
      configuracion: {
        puntos_por_compra: 10,
        puntos_por_monto: 0,
        puntos_registro: 50,
        tipo_calculo: 'fijo',
        valor: 0,
        minimo_compra: 0,
        maximo_puntos: 0,
        multiplicador_nivel: 1
      }
    },
    {
      nombre: 'Por Monto',
      descripcion: 'Puntos basados en el monto de compra',
      configuracion: {
        puntos_por_compra: 0,
        puntos_por_monto: 1,
        puntos_registro: 100,
        tipo_calculo: 'porcentaje',
        valor: 5,
        minimo_compra: 50,
        maximo_puntos: 500,
        multiplicador_nivel: 1
      }
    },
    {
      nombre: 'Mixto',
      descripcion: 'Combinación de puntos fijos y por monto',
      configuracion: {
        puntos_por_compra: 20,
        puntos_por_monto: 1,
        puntos_registro: 75,
        tipo_calculo: 'porcentaje',
        valor: 3,
        minimo_compra: 30,
        maximo_puntos: 1000,
        multiplicador_nivel: 1
      }
    },
    {
      nombre: 'Generoso',
      descripcion: 'Sistema de puntos más generoso',
      configuracion: {
        puntos_por_compra: 50,
        puntos_por_monto: 2,
        puntos_registro: 200,
        tipo_calculo: 'porcentaje',
        valor: 10,
        minimo_compra: 20,
        maximo_puntos: 2000,
        multiplicador_nivel: 1.5
      }
    }
  ];

  ejemplosSimulacion = [
    { monto: 25, label: 'Compra pequeña' },
    { monto: 75, label: 'Compra media' },
    { monto: 150, label: 'Compra grande' },
    { monto: 300, label: 'Compra premium' }
  ];

  constructor(private recompensasService: RecompensasService) {}

  ngOnInit(): void {
    if (this.configuracionInicial) {
      this.configuracion = { ...this.configuracionInicial };
    }
    this.emitChanges();
  }

  onConfiguracionChange(): void {
    this.emitChanges();
    this.simularCalculo();
  }

  private emitChanges(): void {
    this.configuracionChange.emit({ ...this.configuracion });
  }

  simularCalculo(): void {
    if (this.simulacion.monto_compra <= 0) {
      this.simulacion.puntos_obtenidos = 0;
      return;
    }

    this.simulacion.calculando = true;

    const datosSimulacion = {
      monto_compra: this.simulacion.monto_compra,
      tipo_calculo: this.configuracion.tipo_calculo
    };

    if (this.recompensaId) {
      this.recompensasService.simularCalculoPuntos(this.recompensaId, datosSimulacion)
        .subscribe({
          next: (response) => {
            this.simulacion.puntos_obtenidos = response.data?.puntos_obtenidos || 0;
            this.simulacion.calculando = false;
          },
          error: (error) => {
            console.error('Error al simular cálculo:', error);
            this.simulacion.puntos_obtenidos = this.calcularPuntosLocal();
            this.simulacion.calculando = false;
          }
        });
    } else {
      // Cálculo local si no hay recompensaId
      this.simulacion.puntos_obtenidos = this.calcularPuntosLocal();
      this.simulacion.calculando = false;
    }
  }

  private calcularPuntosLocal(): number {
    let puntos = 0;

    // Puntos por compra
    puntos += this.configuracion.puntos_por_compra;

    // Puntos por monto
    if (this.configuracion.puntos_por_monto > 0) {
      switch (this.configuracion.tipo_calculo) {
        case 'fijo':
          puntos += this.configuracion.puntos_por_monto;
          break;
        case 'porcentaje':
          puntos += Math.floor((this.simulacion.monto_compra * this.configuracion.puntos_por_monto) / 100);
          break;
        case 'escalonado':
          puntos += Math.floor((this.simulacion.monto_compra * this.configuracion.puntos_por_monto * this.configuracion.multiplicador_nivel) / 100);
          break;
      }
    }

    // Aplicar máximo de puntos si está configurado
    if (this.configuracion.maximo_puntos > 0 && puntos > this.configuracion.maximo_puntos) {
      puntos = this.configuracion.maximo_puntos;
    }

    return puntos;
  }

  validarConfiguracion(): boolean {
    return (this.configuracion.puntos_por_compra > 0 || 
            this.configuracion.puntos_por_monto > 0 || 
            this.configuracion.puntos_registro > 0);
  }

  resetearConfiguracion(): void {
    this.configuracion = {
      puntos_por_compra: 0,
      puntos_por_monto: 0,
      puntos_registro: 0,
      tipo_calculo: 'fijo',
      valor: 0,
      minimo_compra: 0,
      maximo_puntos: 0,
      multiplicador_nivel: 1
    };
    this.emitChanges();
  }

  aplicarEjemplo(ejemplo: any): void {
    this.configuracion = { ...ejemplo.configuracion };
    this.onConfiguracionChange();
  }

  simularConEjemplo(monto: number): void {
    this.simulacion.monto_compra = monto;
    this.simularCalculo();
  }

  guardarConfiguracion(): void {
    if (!this.recompensaId) return;

    this.recompensasService.actualizarConfiguracionPuntos(this.recompensaId, this.configuracion).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Configuración de puntos guardada:', response.data);
        }
      },
      error: (error) => {
        console.error('Error guardando configuración de puntos:', error);
      }
    });
  }

  obtenerEjemplos(): void {
    this.recompensasService.obtenerEjemplosPuntos().subscribe({
      next: (response) => {
        if (response.success) {
          this.ejemplosPredefinidos = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando ejemplos:', error);
      }
    });
  }

  validarConfiguracionCompleta(): void {
    this.recompensasService.validarConfiguracionPuntos(this.configuracion).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Configuración válida:', response.data);
        } else {
          console.warn('Configuración inválida:', response.message);
        }
      },
      error: (error) => {
        console.error('Error validando configuración:', error);
      }
    });
  }
}
