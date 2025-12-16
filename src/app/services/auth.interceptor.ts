import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = authService.getToken();

  // Debug
  const before = req.headers.get('Authorization');
  console.log('[AUTH-INTERCEPTOR][BEFORE]', req.method, req.url, 'auth=', before);

  if (!token) {
    console.log('[AUTH-INTERCEPTOR] no token -> passthrough');
    return next(req);
  }

  // ✅ Force ajout
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  const after = authReq.headers.get('Authorization');
  console.log('[AUTH-INTERCEPTOR][AFTER]', authReq.method, authReq.url, 'auth=', after);

  return next(authReq);
};
