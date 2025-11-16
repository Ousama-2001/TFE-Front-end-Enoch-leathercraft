// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth_token';
  private roleKey = 'auth_role';

  constructor(private http: HttpClient) {}

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(identifier: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      identifier,
      password,
    });
  }

  setSession(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.roleKey, res.role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }
}
