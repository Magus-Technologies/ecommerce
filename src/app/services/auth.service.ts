
// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PermissionsService } from './permissions.service';
import { CartService } from './cart.service'; // <-- IMPORTADO

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isBrowser: boolean;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private permissionsService!: PermissionsService;
  private cartService!: CartService; // <-- AÑADIDO

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Inyección manual para evitar dependencias circulares
    setTimeout(() => {
      this.permissionsService = this.injector.get(PermissionsService);
      this.cartService = this.injector.get(CartService); // <-- AÑADIDO
    }, 0);

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

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.status === 'success' && this.isBrowser) {
          this.storeAuthData(response);
        }
      }),
      // Sincronizar el carrito después de guardar los datos de autenticación
      switchMap(response => {
        if (response.status === 'success' && this.isBrowser) {
          return this.cartService.syncCart().pipe(
            tap(() => console.log('Sincronización de carrito completada tras login.')),
            catchError(err => {
              console.error('Fallo la sincronización del carrito, pero el login fue exitoso.', err);
              return of(response); // No detener el flujo de login por fallo en sync
            }),
            switchMap(() => of(response)) // Devolver la respuesta original del login
          );
        }
        return of(response);
      }),
      catchError(this.handleAuthError)
    );
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    const user: User = {
      id: response.user.id,
      name: response.user.name || response.user.nombre_completo,
      email: response.user.email,
      tipo_usuario: response.tipo_usuario,
      roles: Array.isArray(response.user.roles) ? response.user.roles : [],
      permissions: Array.isArray(response.user.permissions) ? response.user.permissions : [],
      email_verified_at: response.user.email_verified_at
    };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    if (response.tipo_usuario === 'admin' && this.permissionsService) {
      this.permissionsService.setPermissions([...response.user.permissions]);
    }
  }

  logout(): Observable<any> {
    if (this.currentUserSubject.value) {
      return this.http.post<any>(`${environment.apiUrl}/logout`, {}).pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of({ status: 'success' });
        })
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
    if (this.router.url.includes('/admin') || this.router.url.includes('/account')) {
        this.router.navigate(['/account']);
    }
  }

  private handleAuthError(error: HttpErrorResponse) {
    console.log('Error HTTP original:', error);
    return throwError(() => error);
  }

  // ... (resto de métodos como getToken, isLoggedIn, etc. sin cambios)
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
  
  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/register`, registerData);
  }

  getDocumentTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/document-types`);
  }

  checkEmail(email: string): Observable<{exists: boolean, message: string}> {
    return this.http.post<{exists: boolean, message: string}>(`${environment.apiUrl}/check-email`, { email });
  }

  checkDocumento(numeroDocumento: string): Observable<{exists: boolean, message: string}> {
    return this.http.post<{exists: boolean, message: string}>(`${environment.apiUrl}/check-documento`, { numero_documento: numeroDocumento });
  }

  forgotPassword(email: string): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/reset-password`, { token, email, password, password_confirmation: passwordConfirmation });
  }

  verifyResetToken(token: string, email: string): Observable<{status: string, valid: boolean}> {
    return this.http.post<{status: string, valid: boolean}>(`${environment.apiUrl}/verify-reset-token`, { token, email });
  }

  verifyEmail(verificationData: {email: string, token: string}): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/verify-email`, verificationData);
  }

  resendVerification(email: string): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/resend-verification`, { email });
  }

  /**
   * Procesar login con Google
   */
  processGoogleAuth(token: string, userData: string): void {
    if (!this.isBrowser) return;
    
    try {
      // Guardar token
      localStorage.setItem(this.tokenKey, token);
      
      // Parsear datos de usuario
      const googleUserData = JSON.parse(decodeURIComponent(userData));
      
      // Crear objeto de usuario compatible con el sistema existente
      const user: User = {
        id: googleUserData.id,
        name: googleUserData.nombre_completo || (googleUserData.nombres + ' ' + googleUserData.apellidos),
        email: googleUserData.email,
        tipo_usuario: 'cliente',
        roles: googleUserData.roles || [],
        permissions: googleUserData.permissions || []
      };
      
      // Guardar usuario
      localStorage.setItem(this.userKey, JSON.stringify(user));
      
      // Actualizar estado
      this.currentUserSubject.next(user);

      // Sincronizar carrito
      this.cartService.syncCart().subscribe({
        next: () => console.log('Sincronización de carrito tras login con Google completada.'),
        error: (err) => console.error('Fallo la sincronización del carrito en login con Google.', err)
      });
      
      console.log('Google auth procesado exitosamente:', user);
    } catch (error) {
      console.error('Error procesando Google auth:', error);
      this.clearSession();
      throw error;
    }
  }
}
