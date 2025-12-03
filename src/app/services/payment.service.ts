import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutPayload } from './cart.service';

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
}
