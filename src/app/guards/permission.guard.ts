import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';


export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;

  if (!requiredPermission) {
    return true; // Si no se especifica permiso, permitir acceso
  }

  if (permissionsService.hasPermission(requiredPermission)) {
    return true;
  }

  // Redirigir a página de acceso denegado (o dashboard con error)
  router.navigate(['/dashboard'], { 
    queryParams: { error: 'access_denied' } 
  });
  return false;
};
