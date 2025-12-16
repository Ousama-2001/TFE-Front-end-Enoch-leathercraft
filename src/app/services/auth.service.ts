// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;

  // ✅ Ajout CGV (optionnel)
  acceptTerms?: boolean;
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface LoginResponse {
  token: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'auth_role';

  private readonly api = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  // ✅ disponibilité username/email
  isUsernameAvailable(username: string) {
    return this.http.get<{ available: boolean }>(
      `${this.api}/auth/availability/username`,
      { params: { username } }
    );
  }

  isEmailAvailable(email: string) {
    return this.http.get<{ available: boolean }>(
      `${this.api}/auth/availability/email`,
      { params: { email } }
    );
  }

  private setSession(res: LoginResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.roleKey, res.role);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const role = localStorage.getItem(this.roleKey) as UserRole | null;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    const role = localStorage.getItem(this.roleKey) as UserRole | null;
    return role === 'SUPER_ADMIN';
  }

  requestPasswordReset(email: string) {
    return this.http.post(`${this.api}/auth/password-reset-request`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.api}/auth/password-reset`, {
      token,
      newPassword,
    });
  }

  requestReactivation(email: string, message?: string) {
    return this.http.post(`${this.api}/auth/reactivation-request`, {
      email,
      message,
    });
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/register');
  }

  getUserKey(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.parseJwt(token);
    if (!payload) return null;

    const candidate =
      payload.userId ??
      payload.id ??
      payload.sub ??
      payload.email ??
      payload.username ??
      payload.login ??
      payload.name;

    if (!candidate) return null;
    return String(candidate);
  }

  private parseJwt(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );

      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
