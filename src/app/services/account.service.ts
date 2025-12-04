// src/app/services/account.service.ts
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
  createdAt: string;
  totalAmount: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private readonly api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // -------- PROFIL --------
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/me`);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.api}/me`, profile);
  }

  // -------- COMMANDES --------
  getMyOrders(): Observable<UserOrder[]> {
    return this.http.get<UserOrder[]>(`${this.api}/me/orders`);
  }

  // -------- SÉCURITÉ : CHANGEMENT DE MOT DE PASSE --------
  changePassword(payload: { oldPassword: string; newPassword: string }): Observable<string> {
    return this.http.post(`${this.api}/me/change-password`, payload, {
      responseType: 'text'
    });
  }

  // -------- SUPPRESSION COMPTE --------
  deleteMyAccount() {
    return this.http.delete('/api/me');
  }

}
