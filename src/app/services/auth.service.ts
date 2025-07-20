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
    console.log('🚨 CLEARESSION LLAMADO - Redirigiendo a /account');
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
  /**
 * Verificar si el email ya existe
 */
checkEmail(email: string): Observable<{exists: boolean, message: string}> {
  return this.http.post<{exists: boolean, message: string}>(`${environment.apiUrl}/check-email`, {
    email: email
  });
}

/**
 * Verificar si el número de documento ya existe
 */
checkDocumento(numeroDocumento: string): Observable<{exists: boolean, message: string}> {
  return this.http.post<{exists: boolean, message: string}>(`${environment.apiUrl}/check-documento`, {
    numero_documento: numeroDocumento
  });
}

/**
 * Solicitar recuperación de contraseña
 */
forgotPassword(email: string): Observable<{status: string, message: string}> {
  return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/forgot-password`, {
    email: email
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error en forgot password:', error);
      return throwError(() => error);
    })
  );
}

/**
 * Restablecer contraseña
 */
resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Observable<{status: string, message: string}> {
  return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/reset-password`, {
    token: token,
    email: email,
    password: password,
    password_confirmation: passwordConfirmation
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error en reset password:', error);
      return throwError(() => error);
    })
  );
}

/**
 * Verificar token de recuperación
 */
verifyResetToken(token: string, email: string): Observable<{status: string, valid: boolean}> {
  return this.http.post<{status: string, valid: boolean}>(`${environment.apiUrl}/verify-reset-token`, {
    token: token,
    email: email
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error en verify token:', error);
      return throwError(() => error);
    })
  );
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
    
    console.log('Google auth procesado exitosamente:', user);
  } catch (error) {
    console.error('Error procesando Google auth:', error);
    this.clearSession();
    throw error;
  }
}

  /**
   * Verificar email
   */
  verifyEmail(verificationData: {email: string, token: string}): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/verify-email`, verificationData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log('Error en verify email:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Reenviar verificación de email
   */
  resendVerification(email: string): Observable<{status: string, message: string}> {
    return this.http.post<{status: string, message: string}>(`${environment.apiUrl}/resend-verification`, {
      email: email
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Error en resend verification:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login para clientes (con verificación de email)
   */
  clientLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/clientes/login`, credentials)
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
              permissions: Array.isArray(response.user.permissions) ? response.user.permissions : [],
              email_verified_at: response.user.email_verified_at
            };
            
            // Guardar usuario
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);

            console.log('Login de cliente exitoso:', user);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.log('Error HTTP en client login:', error);
          return throwError(() => error);
        })
      );
  }
  
  

}