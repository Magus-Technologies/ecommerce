import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecompensasService } from '../../../services/recompensas.service';
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-recompensas-envios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recompensas-envios.component.html',
  styleUrls: ['./recompensas-envios.component.scss']
})
export class RecompensasEnviosComponent implements OnInit {
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
      envio_gratis_minimo: [1000, [Validators.required, Validators.min(1)]],
      envio_gratis_activo: [true],
      puntos_por_envio: [50, [Validators.required, Validators.min(1)]]
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
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
  
  private loadConfiguracion(): void {
    this.loading = true;
    setTimeout(() => {
      this.configuracionForm.patchValue({
        envio_gratis_minimo: 1000,
        envio_gratis_activo: true,
        puntos_por_envio: 50
      });
      this.loading = false;
    }, 1000);
  }
}
