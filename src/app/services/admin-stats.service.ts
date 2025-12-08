// src/app/services/admin-stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
}

export interface AdminOrderItemResponse {
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string; // raison / décisions
  items: AdminOrderItemResponse[];
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  currency: string;
  stockQuantity?: number;
  material?: string;
  weightGrams?: number;
  imageUrls?: string[];
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {

  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  // ---------- Stats de ventes ----------
  getSalesStats(): Observable<SalesStatsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<SalesStatsResponse>(
      `${this.baseUrl}/stats/sales`,
      { headers }
    );
  }

  // ---------- Commandes ----------
  getAllOrders(): Observable<AdminOrderResponse[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<AdminOrderResponse[]>(
      `${this.baseUrl}/orders`,
      { headers }
    );
  }

  updateOrderStatus(orderId: number, newStatus: string): Observable<AdminOrderResponse> {
    const headers = this.getAuthHeaders();
    return this.http.patch<AdminOrderResponse>(
      `${this.baseUrl}/orders/${orderId}/status`,
      { status: newStatus },
      { headers }
    );
  }

  // ---------- Retours ----------
  approveReturn(orderId: number): Observable<AdminOrderResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AdminOrderResponse>(
      `${this.baseUrl}/orders/${orderId}/returns/approve`,
      {},
      { headers }
    );
  }

  rejectReturn(orderId: number, reason: string): Observable<AdminOrderResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<AdminOrderResponse>(
      `${this.baseUrl}/orders/${orderId}/returns/reject`,
      { reason },
      { headers }
    );
  }

  // ---------- Stock faible ----------
  // 🔴 Avant : GET /api/admin/stock/low
  // ✅ Maintenant : GET /api/admin/products/low-stock (comme ton controller)
  getLowStockProducts(threshold: number): Observable<Product[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('threshold', threshold);
    return this.http.get<Product[]>(
      `${this.baseUrl}/products/low-stock`,
      { headers, params }
    );
  }

  // 🔴 Avant : body JSON { stockQuantity: x }
  // ✅ Maintenant : PUT /api/admin/products/{id}/stock?quantity=x
  updateProductStock(productId: number, newQty: number): Observable<Product> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('quantity', newQty);
    return this.http.put<Product>(
      `${this.baseUrl}/products/${productId}/stock`,
      null,
      { headers, params }
    );
  }
}
