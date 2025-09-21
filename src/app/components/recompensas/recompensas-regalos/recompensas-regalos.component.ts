import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-regalos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-regalos.component.html',
  styleUrls: ['./recompensas-regalos.component.scss']
})
export class RecompensasRegalosComponent implements OnInit {
  loading = false;
  
  configuracionForm: FormGroup;
  
  puedeEditar = false;
  puedeVer = false;
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.configuracionForm = this.fb.group({
      regalos_activos: [true],
      puntos_por_regalo: [200, [Validators.required, Validators.min(1)]],
      regalos_disponibles: [''],
      regalos_limite: [5, [Validators.required, Validators.min(1)]]
    });
  }
  
  ngOnInit(): void {
    this.checkPermissions();
    this.loadConfiguracion();
  }
  
  private checkPermissions(): void {
    this.puedeEditar = this.permissionsService.hasPermission('recompensas.edit');
    this.puedeVer = this.permissionsService.hasPermission('recompensas.ver');
  }
  
  onSubmitConfiguracion(): void {
    if (this.configuracionForm.invalid) return;
    
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.updateConfiguracionRegalos(this.configuracionForm.value).subscribe({
    //   next: (data) => {
    //     console.log('Configuración actualizada:', data);
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error actualizando configuración:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, simular guardado
    setTimeout(() => {
      console.log('Configuración de regalos guardada (simulado)');
      this.loading = false;
    }, 500);
  }
  
  private loadConfiguracion(): void {
    this.loading = true;
    
    // TODO: Implementar llamada real a la API
    // this.recompensasService.getConfiguracionRegalos().subscribe({
    //   next: (data) => {
    //     this.configuracionForm.patchValue(data);
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error cargando configuración:', error);
    //     this.loading = false;
    //   }
    // });
    
    // Por ahora, mostrar configuración por defecto
    setTimeout(() => {
      this.configuracionForm.patchValue({
        regalos_activos: true,
        puntos_por_regalo: 200,
        regalos_disponibles: 'Cupón de descuento, Producto gratis, Envío gratis',
        regalos_limite: 5
      });
      this.loading = false;
    }, 500);
  }
}
