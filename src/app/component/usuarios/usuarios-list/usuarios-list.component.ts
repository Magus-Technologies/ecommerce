import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


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

  constructor(private router: Router) {}

 ngOnInit(): void {
  this.cargarUsuariosFalsos();
}

// Función para contar usuarios habilitados
getUsuariosActivos(): number {
  return this.usuarios.filter(u => u.estado === 'habilitado').length;
}


// Función para contar administradores
getUsuariosAdministradores(): number {
  return this.usuarios.filter(u => u.rol === 'Administrador').length;
}



  private cargarUsuariosFalsos(): void {
    // Datos de ejemplo simulados
    this.usuarios = [
      {
        id: 1,
        nombre: 'Ana García',
        email: 'ana.garcia@email.com',
        rol: 'Administrador',
        estado: 'habilitado',
        fechaCreacion: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'Carlos López',
        email: 'carlos.lopez@email.com',
        rol: 'Asesor', // Antes: 'Vendedor'
        estado: 'habilitado',
        fechaCreacion: new Date('2024-02-20')
      },
      {
        id: 3,
        nombre: 'María Rodríguez',
        email: 'maria.rodriguez@email.com',
         rol: 'Soporte',
        estado: 'habilitado',
        fechaCreacion: new Date('2024-03-10')
      },
      {
        id: 4,
        nombre: 'José Martínez',
        email: 'jose.martinez@email.com',
        rol: 'Asesor',
        estado: 'deshabilitado',
        fechaCreacion: new Date('2024-01-25')
      },
      {
        id: 5,
        nombre: 'Laura Sánchez',
        email: 'laura.sanchez@email.com',
        rol: 'Soporte',
        estado: 'habilitado',
        fechaCreacion: new Date('2024-04-05')
      },
      {
        id: 6,
        nombre: 'David González',
        email: 'david.gonzalez@email.com',
        rol: 'Administrador',
        estado: 'habilitado',
        fechaCreacion: new Date('2024-02-14')
      }
    ];
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
