import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItemResponse {
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string;
  items: OrderItemResponse[];
}

export interface StripeCheckoutResponse {
  checkoutUrl: string;
  orderReference: string;
}

export interface ReturnRequestPayload {
  reason: string;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.baseUrl}/my-orders`);
  }

  getMyOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.baseUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }

  payOrder(id: number): Observable<StripeCheckoutResponse> {
    return this.http.post<StripeCheckoutResponse>(`${this.baseUrl}/${id}/pay`, {});
  }

  requestReturn(id: number, payload: ReturnRequestPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/${id}/return`, payload);
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/invoice`, { responseType: 'blob' });
  }
}
