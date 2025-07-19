import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-claimbook',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BreadcrumbComponent, ShippingComponent],
  templateUrl: './claimbook.component.html',
  styleUrl: './claimbook.component.scss'
})
export class ClaimbookComponent implements OnInit {
  claimbookForm!: FormGroup;
  isSubmitting = false;
  currentDate = new Date().toLocaleDateString('es-PE');
  claimNumber = this.generateClaimNumber();

  // Datos de la empresa
  companyInfo = {
    name: 'MAGUS ECOMMERCE E.I.R.L.',
    ruc: '20601907063',
    address: 'Av. Ejemplo 123, Lima, Perú',
    store: 'Tienda Virtual - E-commerce'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.claimbookForm = this.fb.group({
      // Datos del consumidor
      consumerName: ['', [Validators.required, Validators.minLength(2)]],
      consumerAddress: ['', [Validators.required]],
      consumerDni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      consumerPhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      consumerEmail: ['', [Validators.required, Validators.email]],
      isMinor: [false],
      
      // Datos del apoderado (si es menor de edad)
      guardianName: [''],
      guardianAddress: [''],
      guardianDni: [''],
      guardianPhone: [''],
      guardianEmail: [''],
      
      // Identificación del bien contratado
      claimType: ['producto', Validators.required], // producto o servicio
      claimedAmount: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      
      // Detalle de la reclamación
      complaintType: ['reclamo', Validators.required], // reclamo o queja
      complaintDetail: ['', [Validators.required, Validators.minLength(20)]],
      consumerRequest: ['', [Validators.required, Validators.minLength(10)]],
      
      // Observaciones del proveedor
      providerResponse: [''],
      responseDate: [''],
      
      // Términos y condiciones
      acceptTerms: [false, Validators.requiredTrue]
    });

    // Validaciones condicionales para menor de edad
    this.claimbookForm.get('isMinor')?.valueChanges.subscribe(isMinor => {
      const guardianFields = ['guardianName', 'guardianAddress', 'guardianDni', 'guardianPhone', 'guardianEmail'];
      
      if (isMinor) {
        guardianFields.forEach(field => {
          this.claimbookForm.get(field)?.setValidators([Validators.required]);
          if (field === 'guardianDni') {
            this.claimbookForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
          }
          if (field === 'guardianPhone') {
            this.claimbookForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
          }
          if (field === 'guardianEmail') {
            this.claimbookForm.get(field)?.setValidators([Validators.required, Validators.email]);
          }
        });
      } else {
        guardianFields.forEach(field => {
          this.claimbookForm.get(field)?.clearValidators();
        });
      }
      
      guardianFields.forEach(field => {
        this.claimbookForm.get(field)?.updateValueAndValidity();
      });
    });
  }

  private generateClaimNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${randomNum}-${year}`;
  }

  onSubmit(): void {
    if (this.claimbookForm.valid) {
      this.isSubmitting = true;
      
      // Simular envío del formulario
      setTimeout(() => {
        this.isSubmitting = false;
        
        Swal.fire({
          title: '¡Reclamo registrado exitosamente!',
          html: `
            <div class="text-start">
              <p><strong>Número de reclamo:</strong> ${this.claimNumber}</p>
              <p><strong>Fecha:</strong> ${this.currentDate}</p>
              <p class="text-sm text-gray-600 mt-3">
                Su reclamo ha sido registrado correctamente. Recibirá una respuesta 
                en un plazo no mayor a 30 días calendario.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#198754'
        }).then(() => {
          this.resetForm();
        });
      }, 2000);
    } else {
      this.markFormGroupTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.claimbookForm.controls).forEach(key => {
      const control = this.claimbookForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.claimbookForm.reset();
    this.claimbookForm.patchValue({
      claimType: 'producto',
      complaintType: 'reclamo',
      isMinor: false,
      acceptTerms: false
    });
    this.claimNumber = this.generateClaimNumber();
  }

  // Métodos de validación para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.claimbookForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.claimbookForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Ingrese un email válido';
      if (field.errors['pattern']) {
        if (fieldName.includes('Dni')) return 'DNI debe tener 8 dígitos';
        if (fieldName.includes('Phone')) return 'Teléfono debe tener 9 dígitos';
      }
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return 'El monto debe ser mayor a 0';
    }
    return '';
  }

  // Método para imprimir el formulario
  printForm(): void {
    window.print();
  }

  // Método para limpiar el formulario
  clearForm(): void {
    Swal.fire({
      title: '¿Limpiar formulario?',
      text: 'Se perderán todos los datos ingresados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetForm();
        Swal.fire({
          title: 'Formulario limpiado',
          text: 'El formulario ha sido reiniciado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}