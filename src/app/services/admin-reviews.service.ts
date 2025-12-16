import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Simplification : Uniquement VISIBLE ou DELETED
export type ReviewStatus = 'VISIBLE' | 'DELETED';

export interface AdminReview {
  id: number;
  productId: number | null;
  productName: string | null;
  userId: number | null;
  userEmail: string | null;
  authorName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  deletedAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminReviewsService {

  private readonly baseUrl = 'http://localhost:8080/api/admin/reviews';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/admin/reviews
   */
  search(options?: {
    status?: ReviewStatus;
    productId?: number | null;
    email?: string;
  }): Observable<AdminReview[]> {
    let params = new HttpParams();

    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.productId != null) {
      params = params.set('productId', String(options.productId));
    }
    if (options?.email && options.email.trim()) {
      params = params.set('email', options.email.trim());
    }

    return this.http.get<AdminReview[]>(this.baseUrl, { params });
  }

  /**
   * PATCH /api/admin/reviews/{id}/status
   */
  changeStatus(id: number, status: ReviewStatus): Observable<AdminReview> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AdminReview>(`${this.baseUrl}/${id}/status`, null, {
      params,
    });
  }
}
