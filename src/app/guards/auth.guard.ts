import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // ✅ message simple (tu peux remplacer par toast plus tard)
  alert('Vous devez être connecté ou inscrit pour accéder au panier.');

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
