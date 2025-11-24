// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  identifier: string;   // email OU pseudo
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ADMIN' | 'CUSTOMER';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'auth_role';

  private readonly api = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  // ---------- LOGIN ----------
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  // ---------- REGISTER ----------
  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  // ---------- SESSION ----------
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
    return localStorage.getItem(this.roleKey) === 'ADMIN';
  }

  // ---------- MOT DE PASSE OUBLIÉ ----------
  requestPasswordReset(email: string) {
    return this.http.post(`${this.api}/auth/password-reset-request`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.api}/auth/password-reset`, {
      token,
      newPassword,
    });
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
