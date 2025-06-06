import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
private permissionsSubject = new BehaviorSubject<string[]>([]);
public permissions$: Observable<string[]> = this.permissionsSubject.asObservable();


   constructor(private authService: AuthService) {
      // Cargar permisos del usuario actual al iniciar (si existe en localStorage)
      const userData = localStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        this.setPermissions(user.permissions || []);
      }
   }

   setPermissions(permissions: string[]): void {
    this.permissionsSubject.next(permissions);
  }

  hasPermission(permission: string): boolean {
    const user = this.authService.getCurrentUser();
    return user?.permissions?.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasRole(role: string): boolean {
    const user = this.authService.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  canAccess(permission: string): Observable<boolean> {
    return this.authService.currentUser.pipe(
      map(user => user?.permissions?.includes(permission) ?? false)
    );
  }
}
