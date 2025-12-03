import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  notes?: string;
  items: CheckoutItem[];
  // totalAmount?: number; // tu peux l'ajouter si ton back le veut
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private baseUrl = 'http://localhost:8080/api/checkout';

  constructor(private http: HttpClient) {}

  createOrder(payload: CheckoutRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }
}
