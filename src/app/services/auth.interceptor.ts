import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Vérifie le chemin

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. On injecte le AuthService pour utiliser sa méthode officielle
  const authService = inject(AuthService);

  // 2. On récupère le token via le service (qui connait la clé 'auth_token')
  const token = authService.getToken();


  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
