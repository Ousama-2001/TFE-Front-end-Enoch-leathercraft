import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './products.service';

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
  items: AdminOrderItemResponse[];
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ---- Stats de ventes ----
  getSalesStats(): Observable<SalesStatsResponse> {
    return this.http.get<SalesStatsResponse>(`${this.baseUrl}/admin/stats/sales`);
  }

  // ---- Commandes admin ----
  getAllOrders(): Observable<AdminOrderResponse[]> {
    return this.http.get<AdminOrderResponse[]>(`${this.baseUrl}/admin/orders`);
  }

  // ---- Stock faible ----
  getLowStockProducts(threshold: number): Observable<Product[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<Product[]>(`${this.baseUrl}/admin/products/low-stock`, { params });
  }

  // ---- Mise à jour stock produit ----
  updateProductStock(productId: number, quantity: number): Observable<Product> {
    const params = new HttpParams().set('quantity', quantity.toString());

    return this.http.put<Product>(
      `${this.baseUrl}/admin/products/${productId}/stock`,
      null,      // pas de body
      { params }
    );
  }

  // ---- Mise à jour statut commande ----
  updateOrderStatus(orderId: number, status: string): Observable<AdminOrderResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AdminOrderResponse>(
      `${this.baseUrl}/admin/orders/${orderId}/status`,
      null,
      { params }
    );
  }
}
