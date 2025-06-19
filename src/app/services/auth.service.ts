// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PermissionsService } from './permissions.service'; 
import { Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private permissionsService!: PermissionsService;

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // Inyectamos PermissionsService manualmente para evitar circularidad directa
    setTimeout(() => {
      this.permissionsService = this.injector.get(PermissionsService);
    }, 0);

    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      const storedUser = localStorage.getItem(this.userKey);
      const user = storedUser ? JSON.parse(storedUser) : null;
    
      this.currentUserSubject = new BehaviorSubject<User | null>(user);
    } else {
      this.currentUserSubject = new BehaviorSubject<User | null>(null);
    }
    this.currentUser = this.currentUserSubject.asObservable();

    if (this.isBrowser) {
      this.loadStoredUserData();
    }
  }

  private loadStoredUserData(): void {
    if (!this.isBrowser) return; 
    
    const storedUser = localStorage.getItem(this.userKey);
    const storedToken = localStorage.getItem(this.tokenKey);
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearSession();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success' && this.isBrowser) {
            // Guardar token
            localStorage.setItem(this.tokenKey, response.token);
            
            // Crear objeto de usuario
            const user: User = {
              id: response.user.id,
              name: response.user.name || response.user.nombre_completo,
              email: response.user.email,
              tipo_usuario: response.tipo_usuario,
              roles: Array.isArray(response.user.roles) ? response.user.roles : [],
              permissions: Array.isArray(response.user.permissions) ? response.user.permissions : []
            };
            
            // Guardar usuario
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);

            // Actualizar permisos si es admin
            if (response.tipo_usuario === 'admin' && this.permissionsService) {
              this.permissionsService.setPermissions([...response.user.permissions]);
            }

            console.log('Login exitoso:', user);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.log('Error HTTP original:', error);
          return throwError(() => error);
        })
      );
  }

  // NUEVO: Método para registrar clientes
  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          console.log('Registro exitoso:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.log('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  // NUEVO: Método para obtener tipos de documento
  getDocumentTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/document-types`);
  }

  logout(): Observable<any> {
    if (this.currentUserSubject.value) {
      return this.http.post<any>(`${environment.apiUrl}/logout`, {})
        .pipe(
          tap(() => this.clearSession())
        );
    }
    
    this.clearSession();
    return of({ status: 'success' });
  }

  private clearSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/account']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null; 
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/user`);
  }

  refreshPermissions(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/refresh-permissions`).pipe(
      tap((response: any) => {
        const currentUser = this.getCurrentUser();
        if (currentUser && response.permissions) {
          currentUser.permissions = response.permissions;
          localStorage.setItem('current_user', JSON.stringify(currentUser));
          this.currentUserSubject.next(currentUser);
        }
      })
    );
  }
}