import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser.pipe(
    map(user => {
      if (user) {
        if (route.data && route.data['role'] === 'admin' && user.role !== 'admin') {
          alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
          return router.createUrlTree(['/inicio']);
        }
        return true;
      } else {
        alert('Debes iniciar sesión para acceder a esta página.');
        return router.createUrlTree(['/login']);
      }
    })
  );
};