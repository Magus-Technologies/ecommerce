import { UsuariosService, Usuario as UsuarioBackend } from '../../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // 
import { Component, OnInit } from '@angular/core';
import { UsuarioModalComponent } from '../usuario-modal/usuario-modal.component';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'habilitado' | 'deshabilitado';
  fechaCreacion: Date;
}

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss'] 
})

export class UsuariosListComponent implements OnInit {

  usuarios: Usuario[] = [];
  usuariosBackend: any[] = [];
  loading = false;

  // Modal properties
  showModal = false;
  selectedUsuarioId: number | null = null;
  modalMode: 'view' | 'edit' = 'view';

constructor(
  private router: Router,
  private usuariosService: UsuariosService
) {}

 ngOnInit(): void {
  this.cargarUsuarios();
}

// Función para contar usuarios habilitados
getUsuariosActivos(): number {
  return this.usuarios.filter(u => u.estado === 'habilitado').length;
}


// Función para contar administradores
getUsuariosAdministradores(): number {
  return this.usuarios.filter(u => u.rol === 'Administrador').length;
}

  private cargarUsuarios(): void {
    this.loading = true;
    
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuariosBackend: UsuarioBackend[]) => {
        this.usuariosBackend = usuariosBackend; // ← Guardar datos completos
        this.usuarios = usuariosBackend.map(usuario => ({
          id: usuario.id,
          nombre: usuario.name,
          email: usuario.email,
          rol: usuario.roles?.[0]?.name || 'Sin rol',
          estado: 'habilitado' as const,
          fechaCreacion: new Date(usuario.created_at)
        }));
        this.loading = false;
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar usuarios',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        this.loading = false;
      }
    });
  }

  onCrearUsuario(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

    onVerUsuario(usuario: Usuario): void {
    this.selectedUsuarioId = usuario.id;
    this.modalMode = 'view';
    this.showModal = true;
  }

  onEditarUsuario(usuario: Usuario): void {
    this.selectedUsuarioId = usuario.id;
    this.modalMode = 'edit';
    this.showModal = true;
  }

  onEliminarUsuario(usuario: Usuario): void {
    // Eliminado: if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre}?`)) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.eliminarUsuario(usuario.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El usuario ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.cargarUsuarios(); // Recargar la lista
          },
          error: (error) => {
            // Eliminado: console.error('Error al eliminar usuario:', error);
            // Eliminado: alert('Error al eliminar el usuario');
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el usuario',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }


  onCloseModal(): void {
    this.showModal = false;
    this.selectedUsuarioId = null;
  }

  onUsuarioActualizado(): void {
    this.cargarUsuarios(); // Recargar la lista cuando se actualice un usuario
  }

  // Método para obtener avatar o iniciales
  getAvatarDisplay(usuario: Usuario): { type: 'image' | 'initial', value: string, color?: string } {
    // Buscar en los datos del backend si hay avatar_url
    const usuarioBackend = this.usuariosBackend?.find(u => u.id === usuario.id);
    
    if (usuarioBackend?.profile?.avatar_url) {
      return {
        type: 'image',
        value: `http://localhost:8000${usuarioBackend.profile.avatar_url}`
      };
    }
    
    // Si no hay avatar, mostrar iniciales con color
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = usuario.nombre.charCodeAt(0) % colors.length;
    
    return {
      type: 'initial',
      value: usuario.nombre.charAt(0).toUpperCase(),
      color: colors[index]
    };
  }

  
  getRolClass(rol: string): string {
    switch (rol.toLowerCase()) {
      case 'administrador':
        return 'badge-admin';
       case 'asesor':
        return 'badge-vendedor';
       case 'soporte':
        return 'badge-cliente';
      default:
        return 'badge-default';
    }
  }

  getEstadoClass(estado: string): string {
    return estado === 'habilitado' ? 'badge-activo' : 'badge-inactivo';
  }

   trackByUserId(index: number, usuario: Usuario): number {
    return usuario.id;
  }
}
