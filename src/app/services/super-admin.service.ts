import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserAdmin {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private baseUrl = 'http://localhost:8080/api/super-admin/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(this.baseUrl);
  }

  updateRole(id: number, role: UserRole): Observable<UserAdmin> {
    return this.http.patch<UserAdmin>(`${this.baseUrl}/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
