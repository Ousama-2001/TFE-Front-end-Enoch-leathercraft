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

  // 🔥 nouveau : envoi de la demande de réactivation
  requestReactivation(email: string, message: string) {
    return this.http.post(`${this.api}/auth/reactivation-request`, {
      email,
      message,
    });
  }


  isAuthPage(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
