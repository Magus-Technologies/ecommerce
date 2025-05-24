import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Address {
  label: string;
  district: string;
  city: string;
  province: string;
  department: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.scss'
})
export class UserRegistrationComponent {
userForm!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Datos ficticios para los selects
  roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Usuario' },
    { id: 3, name: 'Moderador' },
    { id: 4, name: 'Editor' }
  ];

  documentTypes = [
    { id: 1, name: 'DNI' },
    { id: 2, name: 'Pasaporte' },
    { id: 3, name: 'Carnet de Extranjería' },
    { id: 4, name: 'Cédula' }
  ];

  genders = [
    { id: 'M', name: 'Masculino' },
    { id: 'F', name: 'Femenino' },
    { id: 'O', name: 'Otro' },
    { id: 'N', name: 'Prefiero no decir' }
  ];

  districts = [
    { id: 1, name: 'Miraflores' },
    { id: 2, name: 'San Isidro' },
    { id: 3, name: 'Barranco' },
    { id: 4, name: 'Surco' },
    { id: 5, name: 'La Molina' }
  ];

  cities = [
    { id: 1, name: 'Lima' },
    { id: 2, name: 'Arequipa' },
    { id: 3, name: 'Trujillo' },
    { id: 4, name: 'Cusco' },
    { id: 5, name: 'Piura' }
  ];

  provinces = [
    { id: 1, name: 'Lima' },
    { id: 2, name: 'Arequipa' },
    { id: 3, name: 'La Libertad' },
    { id: 4, name: 'Cusco' },
    { id: 5, name: 'Piura' }
  ];

  departments = [
    { id: 1, name: 'Lima' },
    { id: 2, name: 'Arequipa' },
    { id: 3, name: 'La Libertad' },
    { id: 4, name: 'Cusco' },
    { id: 5, name: 'Piura' }
  ];

  countries = [
    { id: 1, name: 'Perú' },
    { id: 2, name: 'Colombia' },
    { id: 3, name: 'Ecuador' },
    { id: 4, name: 'Chile' },
    { id: 5, name: 'Argentina' }
  ];

constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      // Datos base (users)
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],

      // Datos del perfil (user_profiles)
      first_name: ['', [Validators.required]],
      apellido_paterno: ['', [Validators.required]],
      apellido_materno: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      document_type: ['', [Validators.required]],
      document_number: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      avatar_url: [''],

      // Direcciones (user_addresses)
      addresses: this.fb.array([this.createAddressGroup()])
    });

    // Validador personalizado para confirmar contraseña
    this.userForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
  }

  passwordMatchValidator(control: any) {
    const password = this.userForm?.get('password')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  createAddressGroup(): FormGroup {
    return this.fb.group({
      label: ['Casa', [Validators.required]],
      district: [''],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],
      department: ['', [Validators.required]],
      postal_code: [''],
      country: ['', [Validators.required]],
      is_default: [false]
    });
  }

  get addresses(): FormArray {
    return this.userForm.get('addresses') as FormArray;
  }

  addAddress(): void {
    this.addresses.push(this.createAddressGroup());
  }

  removeAddress(index: number): void {
    if (this.addresses.length > 1) {
      this.addresses.removeAt(index);
    }
  }

  onDefaultAddressChange(selectedIndex: number): void {
    // Solo una dirección puede ser la principal
    this.addresses.controls.forEach((control, index) => {
      if (index === selectedIndex) {
        control.get('is_default')?.setValue(true);
      } else {
        control.get('is_default')?.setValue(false);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      // Aquí procesarías los datos del formulario
      console.log('Datos del formulario:', formData);
      console.log('Archivo seleccionado:', this.selectedFile);
      
      // Ejemplo de cómo enviarías los datos
      this.submitUserData(formData);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched(this.userForm);
    }
  }

  private submitUserData(formData: any): void {
    // Separar los datos según las tablas
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    const profileData = {
      first_name: formData.first_name,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      phone: formData.phone,
      document_type: formData.document_type,
      document_number: formData.document_number,
      birth_date: formData.birth_date,
      gender: formData.gender,
      avatar_url: formData.avatar_url
    };

    const addressesData = formData.addresses;

    console.log('User Data:', userData);
    console.log('Profile Data:', profileData);
    console.log('Addresses Data:', addressesData);

    // Aquí harías las llamadas a tu servicio/API
    // this.userService.createUser(userData, profileData, addressesData, this.selectedFile);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  // Métodos auxiliares para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isAddressFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.addresses.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato inválido';
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  irListaUsuarios() {
    this.router.navigate(['/dashboard/usuarios']);
  }
}
