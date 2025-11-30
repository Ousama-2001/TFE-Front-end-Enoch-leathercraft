// src/app/services/product-review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  mine?: boolean; // true si c'est l'avis de l'utilisateur connecté (renvoyé par le back)
}

export interface ProductReviewCreateRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface ProductReviewUpdateRequest {
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ProductReviewService {
  private baseUrl = 'http://localhost:8080/api/product-reviews';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('jwt');

    if (!token) {
      return undefined;
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ---- Récupérer les avis d'un produit ----
  getForProduct(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`${this.baseUrl}/product/${productId}`);
  }

  // ---- Ajouter un avis ----
  addReview(payload: ProductReviewCreateRequest): Observable<ProductReview> {
    const headers = this.authHeaders();
    return this.http.post<ProductReview>(this.baseUrl, payload, { headers });
  }

  // ---- Modifier un avis ----
  updateReview(id: number, payload: ProductReviewUpdateRequest): Observable<ProductReview> {
    const headers = this.authHeaders();
    return this.http.put<ProductReview>(`${this.baseUrl}/${id}`, payload, { headers });
  }

  // ---- Supprimer un avis ----
  deleteReview(id: number): Observable<void> {
    const headers = this.authHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }
}
