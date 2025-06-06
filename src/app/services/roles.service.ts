import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../environments/environment"
import { Role, Permission } from "../models/role.model"

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = environment.apiUrl // ← MODIFICADO: usar directamente environment.apiUrl s
  
  constructor(private http: HttpClient) {}

  // Obtener todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`)
  }

  // Obtener todos los permisos
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`)
  }

  // Obtener permisos de un rol específico
  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/roles/${roleId}/permissions`)
  }

  // Actualizar permisos de un rol
  updateRolePermissions(roleId: number, permissions: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${roleId}/permissions`, {
      permissions: permissions,
    })
  }

  // Crear nuevo rol
  createRole(name: string): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, { name })
  }

  // Eliminar rol
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${roleId}`)
  }
}
