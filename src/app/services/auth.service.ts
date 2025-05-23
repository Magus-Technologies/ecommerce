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
    
    if (this.isBrowser) {
      this.loadStoredUserData();
    }
  }

  private loadStoredUserData(): void {
    if (!this.isBrowser) return;
    
    const storedUser = localStorage.getItem(this.userKey);
    const storedToken = localStorage.getItem(this.tokenKey);
    
    if (storedUser && storedToken) {
      try { // 🔴 Agregado try-catch para manejar JSON inválido
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearSession(); // 🔴 Limpiar datos inválidos
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success' && this.isBrowser) {
            // 🔴 Guardar token
            localStorage.setItem(this.tokenKey, response.token);
            
            // 🔴 Crear objeto de usuario con la estructura correcta
            const user: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role // ✅ Solución correcta
            };
            
            // 🔴 Guardar usuario como string JSON
            localStorage.setItem(this.userKey, JSON.stringify(user));
            
            // 🔴 Actualizar el BehaviorSubject
            this.currentUserSubject.next(user);

            console.log('Login exitoso, redirigiendo...', user); // 🔴 Log para debugging
            
            // 🔴 Redirigir al dashboard
            this.router.navigate(['/dashboard']);
          }
        })
      );
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
    return !!this.getToken() && !!this.currentUserSubject.value; // 🔴 Verificar también el usuario
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/user`);
  }
}