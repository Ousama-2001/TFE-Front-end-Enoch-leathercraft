// src/app/services/super-admin-users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface SaUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: UserRole;
  createdAt: string;

  // 🔹 nouveau : statut soft delete
  deleted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SuperAdminUsersService {
  private baseUrl = 'http://localhost:8080/api/super-admin/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SaUser[]> {
    return this.http.get<SaUser[]>(this.baseUrl);
  }

  updateRole(id: number, role: UserRole): Observable<SaUser> {
    const url = `${this.baseUrl}/${id}/role`;
    // 🔹 le back attend un body { "role": "ADMIN" }
    return this.http.patch<SaUser>(url, { role });
  }

  softDelete(id: number): Observable<SaUser> {
    const url = `${this.baseUrl}/${id}`;
    // 🔹 le back renvoie maintenant l'utilisateur soft-deleted
    return this.http.delete<SaUser>(url);
  }
}
