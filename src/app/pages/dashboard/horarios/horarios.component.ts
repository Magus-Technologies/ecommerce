import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HorariosService, Horario, Usuario } from '../../../services/horarios.service';
import { PermissionsService } from '../../../services/permissions.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
})
export class HorariosComponent implements OnInit {
  // Estados
  isLoading = false;
  isSubmitting = false;
  mostrarModal = false;
  vistaActual: 'tabla' | 'calendario' = 'tabla';

  // Datos
  todosLosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  disponibilidad: { [key: number]: boolean } = {};

  // Filtros
  filtroUsuario = '';
  filtroRol = '';
  filtroEstado = '';

  // Formulario
  horarioForm: FormGroup;
  horarioEditando: Horario | null = null;

  // Permisos
  puedeCrearHorarios = false;
  puedeEditarHorarios = false;
  puedeEliminarHorarios = false;

  // Agregar después de las otras propiedades
  usuarioSeleccionadoCalendario = '';
  usuarioCalendarioData: Usuario | null = null;

  // Gestión masiva
  mostrarModalMasivo = false;
  usuariosSeleccionados: number[] = [];
  todosSeleccionados = false;
  horarioMasivoForm: FormGroup;
  accionMasiva = 'agregar';

  // Constantes
  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  constructor(
    private horariosService: HorariosService,
    private permissionsService: PermissionsService,
    private fb: FormBuilder
  ) {
    this.horarioForm = this.fb.group({
      user_id: ['', Validators.required],
      dia_semana: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      es_descanso: [false],
      fecha_especial: [''],
      comentarios: ['']
    });
    // Agregar después del horarioForm
    this.horarioMasivoForm = this.fb.group({});
    this.diasSemana.forEach(dia => {
      this.horarioMasivoForm.addControl(dia.key + '_activo', this.fb.control(false));
      this.horarioMasivoForm.addControl(dia.key + '_inicio', this.fb.control(''));
      this.horarioMasivoForm.addControl(dia.key + '_fin', this.fb.control(''));
      this.horarioMasivoForm.addControl(dia.key + '_descanso', this.fb.control(false));
    });

  }

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarHorarios();
  }

  verificarPermisos(): void {
    this.puedeCrearHorarios = this.permissionsService.hasPermission('horarios.create');
    this.puedeEditarHorarios = this.permissionsService.hasPermission('horarios.edit');
    this.puedeEliminarHorarios = this.permissionsService.hasPermission('horarios.delete');
  }

  cargarHorarios(): void {
    this.isLoading = true;
    this.horariosService.obtenerHorarios(this.filtroRol).subscribe({
      next: (response) => {
        this.todosLosUsuarios = response.usuarios;
        this.disponibilidad = {};
        
        // Mapear disponibilidad
        response.disponibles_ahora.forEach((item: any) => {
          this.disponibilidad[item.id] = item.disponible;
        });
        this.inicializarUsuarios();

        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
      }
    });
  }

  inicializarUsuarios(): void {
    this.todosLosUsuarios.forEach(usuario => {
      if (usuario.mostrarImagen === undefined) {
        usuario.mostrarImagen = true;
      }
    });
  }

  aplicarFiltros(): void {
    let usuarios = [...this.todosLosUsuarios];

    // Filtro por usuario
    if (this.filtroUsuario) {
      usuarios = usuarios.filter(u => u.id.toString() === this.filtroUsuario);
    }

    // Filtro por estado de disponibilidad
    if (this.filtroEstado) {
      usuarios = usuarios.filter(u => {
        const disponible = this.estaDisponible(u.id);
        return this.filtroEstado === 'disponible' ? disponible : !disponible;
      });
    }

    this.usuariosFiltrados = usuarios;
  }

  cambiarVista(): void {
    this.vistaActual = this.vistaActual === 'tabla' ? 'calendario' : 'tabla';
  }

  estaDisponible(userId: number): boolean {
    return this.disponibilidad[userId] || false;
  }

  obtenerRolPrincipal(usuario: Usuario): string {
    return usuario.roles?.[0]?.name || 'Sin rol';
  }

  obtenerHorariosDia(usuario: Usuario, dia: string): Horario[] {
    return usuario.horarios?.filter(h => h.dia_semana === dia && !h.fecha_especial) || [];
  }

  abrirModalHorario(horario?: Horario): void {
    this.horarioEditando = horario || null;
    
    if (horario) {
      this.horarioForm.patchValue({
        user_id: horario.user_id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        es_descanso: horario.es_descanso,
        fecha_especial: horario.fecha_especial || '',
        comentarios: horario.comentarios || ''
      });
    } else {
      this.horarioForm.reset();
      this.horarioForm.patchValue({
        es_descanso: false
      });
    }
    
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.horarioEditando = null;
    this.horarioForm.reset();
  }

  guardarHorario(): void {
    if (this.horarioForm.invalid) return;

    this.isSubmitting = true;
    const horarioData = this.horarioForm.value;

    // Limpiar fecha_especial si está vacía
    if (!horarioData.fecha_especial) {
      horarioData.fecha_especial = null;
    }

    const request = this.horarioEditando 
      ? this.horariosService.actualizarHorario(this.horarioEditando.id!, horarioData)
      : this.horariosService.crearHorario(horarioData);

    request.subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: response.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.cerrarModal();
        this.cargarHorarios();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al guardar horario:', error);
        const mensaje = error.error?.error || 'Error al guardar el horario';
        Swal.fire('Error', mensaje, 'error');
        this.isSubmitting = false;
      }
    });
  }

  editarHorarioUsuario(usuario: Usuario): void {
  Swal.fire({
    title: `Editar horarios de ${usuario.name}`,
    html: `
      <div class="text-start">
        <p><strong>Usuario:</strong> ${usuario.name}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Rol:</strong> ${this.obtenerRolPrincipal(usuario)}</p>
        <p><strong>Estado:</strong> ${this.estaDisponible(usuario.id) ? '🟢 Disponible' : '🔴 No disponible'}</p>
        <hr>
        <p class="mb-2"><strong>Horarios actuales:</strong></p>
        ${this.generarResumenHorarios(usuario)}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Agregar nuevo horario',
    cancelButtonText: 'Cerrar',
    confirmButtonColor: '#3085d6',
    width: '600px'
  }).then((result) => {
    if (result.isConfirmed) {
      // Pre-seleccionar el usuario en el modal
      this.horarioForm.patchValue({
        user_id: usuario.id,
        es_descanso: false
      });
      this.abrirModalHorario();
    }
  });
}

verDetalleUsuario(usuario: Usuario): void {
  const horariosDetalle = this.generarDetalleCompleto(usuario);
  
  Swal.fire({
    title: `Detalle de ${usuario.name}`,
    html: horariosDetalle,
    confirmButtonText: 'Cerrar',
    width: '700px',
    customClass: {
      htmlContainer: 'text-start'
    }
  });
}

private generarResumenHorarios(usuario: Usuario): string {
  let html = '<div class="row">';
  
  this.diasSemana.forEach(dia => {
    const horarios = this.obtenerHorariosDia(usuario, dia.key);
    html += `<div class="col-6 mb-2">`;
    html += `<strong>${dia.label}:</strong> `;
    
    if (horarios.length === 0) {
      html += '<span class="text-muted">Sin horario</span>';
    } else {
      html += horarios.map(h => 
        h.es_descanso ? 
        '<span class="badge bg-secondary">Descanso</span>' : 
        `<span class="badge bg-primary">${h.hora_inicio} - ${h.hora_fin}</span>`
      ).join(' ');
    }
    
    html += '</div>';
  });
  
  html += '</div>';
  return html;
}

private generarDetalleCompleto(usuario: Usuario): string {
  let html = `
    <div class="mb-3">
      <h6>Información del Usuario</h6>
      <p><strong>Nombre:</strong> ${usuario.name}</p>
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Rol:</strong> ${this.obtenerRolPrincipal(usuario)}</p>
      <p><strong>Estado actual:</strong> 
        <span class="badge ${this.estaDisponible(usuario.id) ? 'bg-success' : 'bg-danger'}">
          ${this.estaDisponible(usuario.id) ? '🟢 Disponible ahora' : '🔴 No disponible'}
        </span>
      </p>
    </div>
    
    <div class="mb-3">
      <h6>Horarios Semanales</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light">
            <tr>
              <th>Día</th>
              <th>Horarios</th>
            </tr>
          </thead>
          <tbody>
  `;

  this.diasSemana.forEach(dia => {
    const horarios = this.obtenerHorariosDia(usuario, dia.key);
    html += `<tr>`;
    html += `<td><strong>${dia.label}</strong></td>`;
    html += `<td>`;
    
    if (horarios.length === 0) {
      html += '<span class="text-muted">Sin horario asignado</span>';
    } else {
      html += horarios.map(h => {
        if (h.es_descanso) {
          return '<span class="badge bg-secondary me-1">Descanso</span>';
        } else {
          return `<span class="badge bg-primary me-1">${h.hora_inicio} - ${h.hora_fin}</span>`;
        }
      }).join('');
      
      // Mostrar comentarios si existen
      const comentarios = horarios.filter(h => h.comentarios).map(h => h.comentarios);
      if (comentarios.length > 0) {
        html += `<br><small class="text-muted">Comentarios: ${comentarios.join(', ')}</small>`;
      }
    }
    
    html += `</td>`;
    html += `</tr>`;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  return html;
}
  
 exportarHorarios(): void {
  if (this.usuariosFiltrados.length === 0) {
    Swal.fire('Info', 'No hay datos para exportar', 'info');
    return;
  }

  // Crear datos para Excel
  const excelData = this.generarDatosExcel();
  
  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Horarios');

  // Configurar anchos de columna
  const colWidths = [
    { wch: 20 }, // Usuario
    { wch: 25 }, // Email
    { wch: 15 }, // Rol
    { wch: 15 }, // Estado
    { wch: 20 }, // Lunes
    { wch: 20 }, // Martes
    { wch: 20 }, // Miércoles
    { wch: 20 }, // Jueves
    { wch: 20 }, // Viernes
    { wch: 20 }, // Sábado
    { wch: 20 }  // Domingo
  ];
  ws['!cols'] = colWidths;

  // Descargar archivo
  const fileName = `horarios_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  Swal.fire({
    title: '¡Éxito!',
    text: 'Horarios exportados correctamente',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
}

private generarDatosExcel(): any[] {
  return this.usuariosFiltrados.map(usuario => {
    const fila: any = {
      'Usuario': usuario.name,
      'Email': usuario.email,
      'Rol': this.obtenerRolPrincipal(usuario),
      'Estado': this.estaDisponible(usuario.id) ? 'Disponible' : 'No disponible'
    };

    this.diasSemana.forEach(dia => {
      const horarios = this.obtenerHorariosDia(usuario, dia.key);
      if (horarios.length === 0) {
        fila[dia.label] = '-';
      } else {
        fila[dia.label] = horarios.map(h => 
          h.es_descanso ? 'Descanso' : `${h.hora_inicio}-${h.hora_fin}`
        ).join('; ');
      }
    });

    return fila;
  });
}


  private generarDatosCSV(): string {
    const headers = [
      'Usuario',
      'Email', 
      'Rol',
      'Estado',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    ];

    let csvContent = headers.join(',') + '\n';

    this.usuariosFiltrados.forEach(usuario => {
      const fila = [
        `"${usuario.name}"`,
        `"${usuario.email}"`,
        `"${this.obtenerRolPrincipal(usuario)}"`,
        `"${this.estaDisponible(usuario.id) ? 'Disponible' : 'No disponible'}"`,
        ...this.diasSemana.map(dia => {
          const horarios = this.obtenerHorariosDia(usuario, dia.key);
          if (horarios.length === 0) return '"-"';
          return `"${horarios.map(h => 
            h.es_descanso ? 'Descanso' : `${h.hora_inicio}-${h.hora_fin}`
          ).join('; ')}"`;
        })
      ];
      
      csvContent += fila.join(',') + '\n';
    });

    return csvContent;
  }

  onImageError(event: any) {
    const imgElement = event.target;
    
    // Encontrar el usuario en el array y marcar que no debe mostrar imagen
    const userInfo = imgElement.closest('.user-info');
    const userName = userInfo.querySelector('.user-name').textContent.trim();
    
    // Buscar el usuario en el array y marcar la imagen como fallida
    const usuario = this.usuariosFiltrados.find(u => u.name === userName);
    if (usuario) {
      usuario.mostrarImagen = false;
    }
  }

  generarColorPorNombre(nombre: string): string {
    const colores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F'
    ];
    
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colores.length;
    return colores[index];
  }

  obtenerUrlAvatar(usuario: any): string {
    if (usuario?.profile?.avatar_url) {
      return `${environment.baseUrl}${usuario.profile.avatar_url}`;
    }
    return '/assets/images/avatar/default-avatar.png';
  }

  cambiarUsuarioCalendario(): void {
    if (this.usuarioSeleccionadoCalendario) {
      this.usuarioCalendarioData = this.usuariosFiltrados.find(
        u => u.id.toString() === this.usuarioSeleccionadoCalendario
      ) || null;
    } else {
      this.usuarioCalendarioData = null;
    }
  }

  abrirModalGestionMasiva(): void {
  this.mostrarModalMasivo = true;
  this.usuariosSeleccionados = [];
  this.todosSeleccionados = false;
}

cerrarModalMasivo(): void {
  this.mostrarModalMasivo = false;
  this.horarioMasivoForm.reset();
}

toggleTodosUsuarios(event: any): void {
  this.todosSeleccionados = event.target.checked;
  if (this.todosSeleccionados) {
    this.usuariosSeleccionados = this.todosLosUsuarios.map(u => u.id);
  } else {
    this.usuariosSeleccionados = [];
  }
}

toggleUsuario(userId: number, event: any): void {
  if (event.target.checked) {
    this.usuariosSeleccionados.push(userId);
  } else {
    this.usuariosSeleccionados = this.usuariosSeleccionados.filter(id => id !== userId);
  }
  this.todosSeleccionados = this.usuariosSeleccionados.length === this.todosLosUsuarios.length;
}

aplicarPlantilla(event: any): void {
  const plantilla = event.target.value;
  
  // Resetear formulario
  this.horarioMasivoForm.reset();
  
  if (plantilla === 'full_time') {
    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
      this.horarioMasivoForm.patchValue({
        [dia + '_activo']: true,
        [dia + '_inicio']: '08:00',
        [dia + '_fin']: '17:00',
        [dia + '_descanso']: false
      });
    });
  } else if (plantilla === 'medio_tiempo') {
    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
      this.horarioMasivoForm.patchValue({
        [dia + '_activo']: true,
        [dia + '_inicio']: '08:00',
        [dia + '_fin']: '12:00',
        [dia + '_descanso']: false
      });
    });
  } else if (plantilla === 'noche') {
    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
      this.horarioMasivoForm.patchValue({
        [dia + '_activo']: true,
        [dia + '_inicio']: '18:00',
        [dia + '_fin']: '02:00',
        [dia + '_descanso']: false
      });
    });
  }
}

aplicarHorariosMasivos(): void {
  if (this.usuariosSeleccionados.length === 0) {
    Swal.fire('Error', 'Selecciona al menos un usuario', 'error');
    return;
  }

  this.isSubmitting = true;
  let horariosCreados = 0;
  let errores = 0;

  const promesas = this.usuariosSeleccionados.map(userId => {
    return this.procesarUsuarioMasivo(userId);
  });

  Promise.all(promesas).then(resultados => {
    horariosCreados = resultados.filter(r => r.success).length;
    errores = resultados.filter(r => !r.success).length;

    this.isSubmitting = false;
    this.cerrarModalMasivo();
    this.cargarHorarios();

    Swal.fire({
      title: '¡Proceso completado!',
      html: `
        <p>✅ Usuarios procesados: ${horariosCreados}</p>
        ${errores > 0 ? `<p>❌ Errores: ${errores}</p>` : ''}
      `,
      icon: horariosCreados > 0 ? 'success' : 'warning'
    });
  });
}

private procesarUsuarioMasivo(userId: number): Promise<{success: boolean}> {
  return new Promise((resolve) => {
    const promesasHorarios: Promise<any>[] = [];

    this.diasSemana.forEach(dia => {
      const activo = this.horarioMasivoForm.get(dia.key + '_activo')?.value;
      if (activo) {
        const horarioData = {
          user_id: userId,
          dia_semana: dia.key,
          hora_inicio: this.horarioMasivoForm.get(dia.key + '_inicio')?.value,
          hora_fin: this.horarioMasivoForm.get(dia.key + '_fin')?.value,
          es_descanso: this.horarioMasivoForm.get(dia.key + '_descanso')?.value,
          fecha_especial: undefined,
          comentarios: 'Creado por gestión masiva',
          activo: true  
        };

        promesasHorarios.push(
          this.horariosService.crearHorario(horarioData).toPromise()
        );
      }
    });

    if (promesasHorarios.length === 0) {
      resolve({success: true});
      return;
    }

    Promise.all(promesasHorarios)
      .then(() => resolve({success: true}))
      .catch(() => resolve({success: false}));
  });
}


}
