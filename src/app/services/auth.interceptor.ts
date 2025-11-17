// src/app/services/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const token = localStorage.getItem('auth_token');

  // si pas de token => on laisse passer sans rien ajouter
  if (!token) {
    return next(req);
  }

  // on peut ignorer les routes d'auth si tu veux
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};
