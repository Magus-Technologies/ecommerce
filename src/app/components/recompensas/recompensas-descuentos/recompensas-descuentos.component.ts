import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-descuentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-descuentos.component.html',
  styleUrls: ['./recompensas-descuentos.component.scss']
})
export class RecompensasDescuentosComponent implements OnInit {
  loading = false;
  activeTab = 'configuracion';
  
  configuracionForm: FormGroup;
  
  puedeEditar = false;
  puedeVer = false;
  
  constructor(
    private fb: FormBuilder,
    private recompensasService: RecompensasService,
    private permissionsService: PermissionsService
  ) {
    this.configuracionForm = this.fb.group({
      descuento_porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      descuento_minimo: [50, [Validators.required, Validators.min(1)]],
      descuento_maximo: [500, [Validators.required, Validators.min(1)]],
      activo: [true]
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
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  onSubmitConfiguracion(): void {
    if (this.configuracionForm.invalid) return;
    
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
  
  private loadConfiguracion(): void {
    this.loading = true;
    setTimeout(() => {
      this.configuracionForm.patchValue({
        descuento_porcentaje: 10,
        descuento_minimo: 50,
        descuento_maximo: 500,
        activo: true
      });
      this.loading = false;
    }, 1000);
  }
}
