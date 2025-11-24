import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface UserOrder {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {

  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/me`);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.api}/me`, profile);
  }

  getMyOrders(): Observable<UserOrder[]> {
    return this.http.get<UserOrder[]>(`${this.api}/me/orders`);
  }

  changePassword(payload: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/me/change-password`, payload);
  }
}
