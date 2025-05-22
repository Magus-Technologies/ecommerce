// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { User, AuthResponse, LoginRequest } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Solo intentar cargar datos del localStorage si estamos en el navegador
    if (this.isBrowser) {
      this.loadStoredUserData();
    }
  }

  private loadStoredUserData(): void {
    if (!this.isBrowser) return;
    
    const storedUser = localStorage.getItem(this.userKey);
    const storedToken = localStorage.getItem(this.tokenKey);
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success' && this.isBrowser) {
            // Guardar token y datos de usuario solo en el navegador
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
            
            // Actualizar el BehaviorSubject
            this.currentUserSubject.next(response.user);

      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          }
        })
      );
  }

  logout(): Observable<any> {
    // Solo hacer la petición si hay un usuario logueado
    if (this.currentUserSubject.value) {
      return this.http.post<any>(`${environment.apiUrl}/logout`, {})
        .pipe(
          tap(() => this.clearSession())
        );
    }
    
    // Si no hay usuario, solo limpiar la sesión local
    this.clearSession();
    return of({ status: 'success' });
  }

  private clearSession(): void {
    // Eliminar datos del localStorage solo en el navegador
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    
    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    this.router.navigate(['/account']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Método para obtener el perfil del usuario desde el backend
  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/user`);
  }
}