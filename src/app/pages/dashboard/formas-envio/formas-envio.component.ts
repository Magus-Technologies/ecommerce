import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormaEnvioService, FormaEnvio } from '../../../services/forma-envio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formas-envio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formas-envio.component.html',
  styleUrl: './formas-envio.component.scss'
})
export class FormasEnvioComponent implements OnInit {
  formasEnvio: FormaEnvio[] = [];
  formaEnvioForm!: FormGroup;
  isEditMode = false;
  selectedId: number | null = null;
  isLoading = false;
  showModal = false;

  constructor(
    private fb: FormBuilder,
    private formaEnvioService: FormaEnvioService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadFormasEnvio();
  }

  initForm(): void {
    this.formaEnvioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      descripcion: [''],
      costo: [0, [Validators.required, Validators.min(0)]],
      activo: [true],
      orden: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadFormasEnvio(): void {
    this.isLoading = true;
    this.formaEnvioService.obtenerTodas().subscribe({
      next: (response) => {
        this.formasEnvio = response.formas_envio;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar formas de envío:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las formas de envío', 'error');
      }
    });
  }

  openModal(formaEnvio?: FormaEnvio): void {
    this.showModal = true;
    if (formaEnvio) {
      this.isEditMode = true;
      this.selectedId = formaEnvio.id!;
      this.formaEnvioForm.patchValue(formaEnvio);
    } else {
      this.isEditMode = false;
      this.selectedId = null;
      this.formaEnvioForm.reset({ activo: true, orden: 0, costo: 0 });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.formaEnvioForm.reset();
  }

  onSubmit(): void {
    if (this.formaEnvioForm.invalid) {
      Object.keys(this.formaEnvioForm.controls).forEach(key => {
        this.formaEnvioForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = this.formaEnvioForm.value;

    if (this.isEditMode && this.selectedId) {
      this.formaEnvioService.actualizar(this.selectedId, formData).subscribe({
        next: (response) => {
          Swal.fire('¡Éxito!', response.message, 'success');
          this.closeModal();
          this.loadFormasEnvio();
        },
        error: (error) => {
          Swal.fire('Error', error.error?.message || 'Error al actualizar', 'error');
        }
      });
    } else {
      this.formaEnvioService.crear(formData).subscribe({
        next: (response) => {
          Swal.fire('¡Éxito!', response.message, 'success');
          this.closeModal();
          this.loadFormasEnvio();
        },
        error: (error) => {
          Swal.fire('Error', error.error?.message || 'Error al crear', 'error');
        }
      });
    }
  }

  toggleEstado(id: number): void {
    this.formaEnvioService.toggleEstado(id).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', response.message, 'success');
        this.loadFormasEnvio();
      },
      error: (error) => {
        Swal.fire('Error', error.error?.message || 'Error al cambiar estado', 'error');
      }
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formaEnvioService.eliminar(id).subscribe({
          next: (response) => {
            Swal.fire('¡Eliminado!', response.message, 'success');
            this.loadFormasEnvio();
          },
          error: (error) => {
            Swal.fire('Error', error.error?.message || 'Error al eliminar', 'error');
          }
        });
      }
    });
  }

  // Getters para el template
  get formasEnvioActivas(): number {
    return this.formasEnvio.filter(f => f.activo).length;
  }

  get formasEnvioInactivas(): number {
    return this.formasEnvio.filter(f => !f.activo).length;
  }
}
