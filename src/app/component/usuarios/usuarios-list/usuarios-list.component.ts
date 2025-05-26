import { UsuariosService, Usuario as UsuarioBackend } from '../../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // 
import { Component, OnInit } from '@angular/core';


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
  imports: [CommonModule],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss'] 
})

export class UsuariosListComponent implements OnInit {

  usuarios: Usuario[] = [];
  loading = false;

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



  // Reemplaza la función cargarUsuariosFalsos() con esta nueva:
  private cargarUsuarios(): void {
    this.loading = true;
    
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuariosBackend: UsuarioBackend[]) => {
        this.usuarios = usuariosBackend.map(usuario => ({
          id: usuario.id,
          nombre: usuario.name,
          email: usuario.email,
          rol: usuario.role?.nombre || 'Sin rol',
          estado: 'habilitado' as const, // Por ahora todos habilitados, puedes agregar este campo al modelo
          fechaCreacion: new Date(usuario.created_at)
        }));
        this.loading = false;
      },
       error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
        // Opcional: mostrar mensaje de error al usuario
      }
    });
  }

  onCrearUsuario(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

  onEditarUsuario(usuario: Usuario): void {
    console.log('Editar usuario:', usuario.id);
    // TODO: Implementar navegación a formulario de edición
  }

  onEliminarUsuario(usuario: Usuario): void {
    console.log('Eliminar usuario:', usuario.id);
    // TODO: Implementar lógica de eliminación con confirmación
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
