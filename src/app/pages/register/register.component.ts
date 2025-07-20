// src/app/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { BreadcrumbComponent } from '../../component/breadcrumb/breadcrumb.component';
import { ShippingComponent } from '../../component/shipping/shipping.component';
import { AuthService } from '../../services/auth.service';
import { ReniecService } from '../../services/reniec.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  UbigeoService,
  Departamento,
  Provincia,
  Distrito,
} from '../../services/ubigeo.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    ShippingComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  registerError: string = '';
  registerSuccess: string = '';
  isLoading: boolean = false;
  showRegisterPassword: boolean = false;
  isDniLoading: boolean = false;
  dniStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  
  // Estados de validación
  emailStatus: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  documentoStatus: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  
  // Listas para ubigeo
  departamentos: Departamento[] = [];
  provincias: Provincia[] = [];
  distritos: Distrito[] = [];

  // Estados de carga
  isLoadingDepartamentos = false;
  isLoadingProvincias = false;
  isLoadingDistritos = false;

  // --- Propiedades para el Puzzle CAPTCHA ---
  puzzleSolved = false;
  puzzlePieces: any[] = [];
  puzzleBoard: (any | null)[] = [null, null, null, null];
  selectedPuzzleImage = '';
  private puzzleImages: string[] = [];
  private draggedPiece: any = null;
  showPuzzle = false;
  

  // Tipos de documento
  tiposDocumento: any[] = [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'Pasaporte' },
    { id: 3, nombre: 'Carnet de Extranjería' },
    { id: 4, nombre: 'RUC' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private reniecService: ReniecService,
    private ubigeoService: UbigeoService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setupDniAutoComplete();
    this.setupEmailValidation();
    this.setupDocumentoValidation();
    this.setupUbigeoListeners();
    this.loadDocumentTypes();
    this.loadDepartamentos();

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    this.initializePuzzleImages();
    this.setupPuzzle();
  }

  // --- Métodos para el Puzzle CAPTCHA ---

  initializePuzzleImages(): void {
    // **REEMPLAZA ESTAS URLS CON LAS 8 IMÁGENES QUE QUIERAS USAR**
    this.puzzleImages = [
      'https://img.freepik.com/fotos-premium/cerezos-flor-aldea-japonesa-paisaje-anime-manga-ilustracion_691560-7845.jpg',
      'https://img.freepik.com/vector-premium/imagen-gatito_1138544-28699.jpg',
      'https://static.vecteezy.com/system/resources/previews/011/194/544/non_2x/town-night-anime-background-photo.jpg',
      'https://cafesabora.com/sites/default/files/taza-para-cafe_0.jpg',
      'https://i.pinimg.com/originals/38/44/04/384404885abaa598f5a26fe8672c179d.jpg',
      'https://i.pinimg.com/736x/2a/ec/c7/2aecc77f26354b5c12538ea63c1151c7.jpg',
      'https://imgmedia.larepublica.pe/640x374/larepublica/original/2023/08/04/64ccfed7bc6c3c375112b8c9.webp',
      'assets/images/puzzle/logo_puzzle.jpg',
    ];
    console.log('Puzzle images initialized:', this.puzzleImages);
  }

  setupPuzzle(): void {
    this.puzzleSolved = false;
    this.puzzleBoard = [null, null, null, null];
    this.selectedPuzzleImage = this.puzzleImages[Math.floor(Math.random() * this.puzzleImages.length)];
    console.log('Selected puzzle image:', this.selectedPuzzleImage);

    const pieces = [];
    for (let i = 0; i < 4; i++) {
      pieces.push({
        id: i,
        style: {
          'background-image': `url(${this.selectedPuzzleImage})`,
          'background-position': `${(i % 2) * -150}px ${(Math.floor(i / 2)) * -150}px`,
        }
      });
    }
    this.puzzlePieces = this.shuffle(pieces);
    console.log('Puzzle pieces generated:', this.puzzlePieces);
  }

  shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  onDragStart(piece: any): void {
    this.draggedPiece = piece;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necesario para permitir el drop
    const target = event.target as HTMLElement;
    if (target.classList.contains('puzzle-placeholder')) {
        target.classList.add('over');
    }
  }

  onDragLeave(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('over');
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const target = event.target as HTMLElement;
    target.classList.remove('over');

    if (this.puzzleBoard[index] === null) { // Si el espacio está libre
      // Mover la pieza del contenedor de piezas al tablero
      this.puzzleBoard[index] = this.draggedPiece;
      this.puzzlePieces = this.puzzlePieces.filter(p => p.id !== this.draggedPiece.id);
      this.draggedPiece = null;
      this.checkPuzzle();
    }
  }

  checkPuzzle(): void {
    const isSolved = this.puzzleBoard.every((piece, i) => piece && piece.id === i);
    if (isSolved) {
      this.puzzleSolved = true;
      // Ocultar el puzzle después de un breve delay para mostrar el éxito
      setTimeout(() => {
        this.showPuzzle = false;
      }, 2000);
    }
  }

  initForms(): void {
    this.registerForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(255)]],
      apellidos: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      tipo_documento_id: ['', Validators.required],
      numero_documento: ['', [Validators.required, Validators.maxLength(20)]],
      telefono: ['', Validators.maxLength(20)],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],

      // Datos de dirección (opcionales)
      direccion_completa: [''],
      departamento_id: [''],
      provincia_id: [''],
      distrito_id: [''],
      ubigeo: [''],
    });

    // Nueva lógica: escuchar cambios en tipo de documento para mostrar/ocultar puzzle
    this.registerForm.get('tipo_documento_id')?.valueChanges.subscribe(() => {
      const numeroDocumento = this.registerForm.get('numero_documento')?.value;
      const tipoDocumento = this.registerForm.get('tipo_documento_id')?.value;
      
      if (tipoDocumento && numeroDocumento && numeroDocumento.length >= 8) {
        this.showPuzzle = true;
        if (this.puzzlePieces.length === 0) {
          this.setupPuzzle();
        }
      } else {
        this.showPuzzle = false;
      }
    });
  }

  setupEmailValidation(): void {
    this.registerForm
      .get('email')
      ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((email) => {
        if (email && this.registerForm.get('email')?.valid) {
          this.checkEmailExists(email);
        } else {
          this.emailStatus = 'idle';
        }
      });
  }

  setupDocumentoValidation(): void {
  this.registerForm
    .get('numero_documento')
    ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
    .subscribe((numeroDocumento) => {
      if (numeroDocumento && numeroDocumento.length >= 8) {
        this.checkDocumentoExists(numeroDocumento);
        // Nueva lógica: mostrar puzzle cuando hay tipo de documento y número válido
        const tipoDocumento = this.registerForm.get('tipo_documento_id')?.value;
        if (tipoDocumento && numeroDocumento.length >= 8) {
          this.showPuzzle = true;
          if (this.puzzlePieces.length === 0) {
            this.setupPuzzle();
          }
        }
      } else {
        this.documentoStatus = 'idle';
        this.showPuzzle = false; // Ocultar puzzle si el documento no es válido
      }
    });
}

  checkEmailExists(email: string): void {
    this.emailStatus = 'checking';
    this.authService.checkEmail(email).subscribe({
      next: (response) => {
        this.emailStatus = response.exists ? 'taken' : 'available';
        if (response.exists) {
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
        }
      },
      error: (error) => {
        this.emailStatus = 'idle';
        console.error('Error verificando email:', error);
      },
    });
  }

  checkDocumentoExists(numeroDocumento: string): void {
    this.documentoStatus = 'checking';
    this.authService.checkDocumento(numeroDocumento).subscribe({
      next: (response) => {
        this.documentoStatus = response.exists ? 'taken' : 'available';
        if (response.exists) {
          this.registerForm.get('numero_documento')?.setErrors({ documentoTaken: true });
        }
      },
      error: (error) => {
        this.documentoStatus = 'idle';
        console.error('Error verificando documento:', error);
      },
    });
  }

  loadDepartamentos(): void {
    this.isLoadingDepartamentos = true;
    this.ubigeoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
        this.isLoadingDepartamentos = false;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.isLoadingDepartamentos = false;
      },
    });
  }

  setupUbigeoListeners(): void {
    // Escuchar cambios en departamento
    this.registerForm
      .get('departamento_id')
      ?.valueChanges.subscribe((departamentoId) => {
        if (departamentoId) {
          this.loadProvincias(departamentoId);
          this.registerForm.patchValue({
            provincia_id: '',
            distrito_id: '',
            ubigeo: '',
          });
          this.provincias = [];
          this.distritos = [];
        }
      });

    // Escuchar cambios en provincia
    this.registerForm
      .get('provincia_id')
      ?.valueChanges.subscribe((provinciaId) => {
        const departamentoId = this.registerForm.get('departamento_id')?.value;
        if (departamentoId && provinciaId) {
          this.loadDistritos(departamentoId, provinciaId);
          this.registerForm.patchValue({
            distrito_id: '',
            ubigeo: '',
          });
          this.distritos = [];
        }
      });

    // Escuchar cambios en distrito para establecer ubigeo final
    this.registerForm
      .get('distrito_id')
      ?.valueChanges.subscribe((distritoId) => {
        if (distritoId) {
          const distrito = this.distritos.find((d) => d.id === distritoId);
          if (distrito) {
            this.registerForm.patchValue({
              ubigeo: String(distrito.id_ubigeo), // ← Convertir a string
            });
          }
        }
      });
  }

  loadProvincias(departamentoId: string): void {
    this.isLoadingProvincias = true;
    this.ubigeoService.getProvincias(departamentoId).subscribe({
      next: (provincias) => {
        this.provincias = provincias;
        this.isLoadingProvincias = false;
      },
      error: (error) => {
        console.error('Error cargando provincias:', error);
        this.isLoadingProvincias = false;
      },
    });
  }

  loadDistritos(departamentoId: string, provinciaId: string): void {
    this.isLoadingDistritos = true;
    this.ubigeoService.getDistritos(departamentoId, provinciaId).subscribe({
      next: (distritos) => {
        this.distritos = distritos;
        this.isLoadingDistritos = false;
      },
      error: (error) => {
        console.error('Error cargando distritos:', error);
        this.isLoadingDistritos = false;
      },
    });
  }

  setupDniAutoComplete(): void {
    // Escuchar cambios en el número de documento para DNI
    this.registerForm
      .get('numero_documento')
      ?.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((numeroDocumento) => {
        this.consultarDni(numeroDocumento);
      });

    // Limpiar campos cuando cambie el tipo de documento
    this.registerForm.get('tipo_documento_id')?.valueChanges.subscribe(() => {
      this.registerForm.patchValue({
        nombres: '',
        apellidos: '',
      });
      this.dniStatus = 'idle';
    });
  }

  consultarDni(numeroDocumento: string): void {
    // Solo consultar si es DNI (tipo 1) y tiene 8 dígitos
    if (
      this.registerForm.get('tipo_documento_id')?.value === '1' &&
      numeroDocumento &&
      numeroDocumento.length === 8 &&
      /^\d{8}$/.test(numeroDocumento)
    ) {
      this.isDniLoading = true;
      this.dniStatus = 'loading';

      this.reniecService.buscarPorDni(numeroDocumento).subscribe({
        next: (response) => {
          this.isDniLoading = false;

          if (
            response.success &&
            response.nombres &&
            response.apellidoPaterno &&
            response.apellidoMaterno
          ) {
            this.registerForm.patchValue({
              nombres: response.nombres,
              apellidos: `${response.apellidoPaterno} ${response.apellidoMaterno}`,
            });

            this.dniStatus = 'success';
          } else {
            this.dniStatus = 'error';
            console.warn('DNI no encontrado o datos incompletos');
          }
        },
        error: (error) => {
          this.isDniLoading = false;
          this.dniStatus = 'error';
          console.error('Error consultando DNI:', error);
        },
      });
    } else {
      this.dniStatus = 'idle';
    }
  }

  loadDocumentTypes(): void {
    this.authService.getDocumentTypes().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
      },
      error: (error) => {
        console.error('Error cargando tipos de documento:', error);
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Nueva validación: verificar que el puzzle esté resuelto si se está mostrando
    if (this.showPuzzle && !this.puzzleSolved) {
      this.registerError = 'Debes completar el rompecabezas para continuar con el registro';
      return;
    }

    // Validar que las contraseñas coincidan
    if (
      this.registerForm.value.password !==
      this.registerForm.value.password_confirmation
    ) {
      this.registerError = 'Las contraseñas no coinciden';
      return;
    }

    // Verificar si hay errores de duplicados
    if (this.emailStatus === 'taken') {
      this.registerError = 'El correo electrónico ya está registrado';
      return;
    }

    if (this.documentoStatus === 'taken') {
      this.registerError = 'El número de documento ya está registrado';
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const registerData = { ...this.registerForm.value };
    
    // Asegurar que ubigeo sea string si existe
    if (registerData.ubigeo) {
      registerData.ubigeo = String(registerData.ubigeo);
    }

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registerSuccess =
          'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.';
        this.registerForm.reset();

        // Redirigir a verificación después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/verify-email']);
        }, 2000);
      },

      error: (error) => {
        this.isLoading = false;

        if (error.status === 422) {
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            let errorMessage = 'Errores de validación:\n';

            Object.keys(errors).forEach((key) => {
              errorMessage += `• ${errors[key][0]}\n`;
            });

            this.registerError = errorMessage;
          } else {
            this.registerError = 'Error en los datos proporcionados.';
          }
        } else if (error.status === 0) {
          this.registerError =
            'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.registerError =
            'Error del servidor. Por favor, inténtalo más tarde.';
        }
      },
    });
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

 
  loginWithGoogle(): void {
    window.location.href = `${environment.baseUrl}/auth/google`;

  }

  // Getters para facilitar el acceso a los campos del formulario
  get registerNombres() {
    return this.registerForm.get('nombres');
  }
  get registerApellidos() {
    return this.registerForm.get('apellidos');
  }
  get registerEmail() {
    return this.registerForm.get('email');
  }
  get registerTipoDocumento() {
    return this.registerForm.get('tipo_documento_id');
  }
  get registerNumeroDocumento() {
    return this.registerForm.get('numero_documento');
  }
  get registerPassword() {
    return this.registerForm.get('password');
  }
  get registerPasswordConfirmation() {
    return this.registerForm.get('password_confirmation');
  }

  // Nueva función para resetear el puzzle
  resetPuzzle(): void {
    this.puzzleSolved = false;
    this.puzzleBoard = [null, null, null, null];
    
    // Recrear las piezas originales
    const pieces = [];
    for (let i = 0; i < 4; i++) {
      pieces.push({
        id: i,
        style: {
          'background-image': `url(${this.selectedPuzzleImage})`,
          'background-position': `${(i % 2) * -150}px ${(Math.floor(i / 2)) * -150}px`,
        }
      });
    }
    this.puzzlePieces = this.shuffle(pieces);
  }
  
}
























































