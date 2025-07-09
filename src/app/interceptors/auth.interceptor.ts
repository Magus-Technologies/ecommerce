// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtener el token
  const token = authService.getToken();
  
  // Si hay token, añadirlo a los headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Continuar con la petición y manejar errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized), limpiar la sesión y redirigir al login
      if (error.status === 401) {
        // Solo limpiar sesión si el usuario estaba logueado
        if (authService.isLoggedIn()) {
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};