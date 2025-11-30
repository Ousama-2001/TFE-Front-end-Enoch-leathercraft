// src/app/services/admin-reviews.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED';

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  authorEmail: string;
  authorName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminReviewsService {
  private baseUrl = 'http://localhost:8080/api/admin/reviews';

  constructor(private http: HttpClient) {}

  /**
   * Liste / recherche des avis pour l’admin
   */
  search(options?: {
    status?: ReviewStatus | '';
    productId?: number | null;
    email?: string;
  }): Observable<AdminReview[]> {
    let params = new HttpParams();

    if (options) {
      if (options.status) {
        params = params.set('status', options.status);
      }
      if (options.productId != null) {
        params = params.set('productId', String(options.productId));
      }
      if (options.email && options.email.trim()) {
        params = params.set('email', options.email.trim());
      }
    }

    return this.http.get<AdminReview[]>(this.baseUrl, { params });
  }

  /**
   * Changer le statut d’un avis (APPROVED / REJECTED / DELETED / PENDING)
   */
  changeStatus(id: number, status: ReviewStatus): Observable<AdminReview> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AdminReview>(`${this.baseUrl}/${id}/status`, null, {
      params,
    });
  }
}
