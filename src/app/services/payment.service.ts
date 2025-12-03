import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutPayload, OrderResponse } from './cart.service';

export interface StripeCheckoutResponse {
  checkoutUrl: string;
  orderReference: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  startStripeCheckout(payload: CheckoutPayload): Observable<StripeCheckoutResponse> {
    return this.http.post<StripeCheckoutResponse>(
      `${this.baseUrl}/stripe-checkout`,
      payload
    );
  }

  // 🔹 Confirmation Stripe : le back vérifie et envoie l'email
  confirmStripePayment(sessionId: string): Observable<OrderResponse> {
    const params = new HttpParams().set('session_id', sessionId);
    return this.http.post<OrderResponse>(`${this.baseUrl}/stripe-confirm`, null, { params });
  }
}
