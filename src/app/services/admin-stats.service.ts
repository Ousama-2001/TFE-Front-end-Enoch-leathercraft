import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './products.service';

export interface SalesStatsResponse {
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// 👇 même structure que ton OrderResponse côté back
export interface AdminOrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string; // ISO date
  items: AdminOrderItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getSalesStats(): Observable<SalesStatsResponse> {
    return this.http.get<SalesStatsResponse>(`${this.baseUrl}/stats/sales`);
  }

  getLowStockProducts(threshold: number = 5): Observable<Product[]> {
    const params = new HttpParams().set('threshold', threshold);
    return this.http.get<Product[]>(`${this.baseUrl}/products/low-stock`, { params });
  }

  // 👇 nouvelles : récupérer toutes les commandes admin
  getAllOrders(): Observable<AdminOrderResponse[]> {
    return this.http.get<AdminOrderResponse[]>(`${this.baseUrl}/orders`);
  }
}
