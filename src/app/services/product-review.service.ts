import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewCreateRequest {
  productId: number;
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ProductReviewService {
  private baseUrl = 'http://localhost:8080/api/product-reviews';

  constructor(private http: HttpClient) {}

  // ⚠️ correspond EXACTEMENT à @GetMapping("/product/{productId}")
  getForProduct(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`${this.baseUrl}/product/${productId}`);
  }

  addReview(req: ProductReviewCreateRequest): Observable<ProductReview> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<ProductReview>(this.baseUrl, req, { headers });
  }
}
