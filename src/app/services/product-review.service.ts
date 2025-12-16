import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReviewStatus = 'VISIBLE' | 'DELETED';

// Interface pour le client (Product Detail)
export interface ProductReview {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  mine?: boolean;
  status: ReviewStatus; // ✅ Nécessaire pour l'alerte "Supprimé"
}

// Interface pour l'Admin (Tableau de bord)
export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userEmail: string;
  authorName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  deletedAt?: string;
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
  private adminUrl = 'http://localhost:8080/api/admin/reviews'; // Assure-toi que ton contrôleur admin est mappé ici

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('jwt');

    if (!token) return undefined;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ================= CLIENT =================

  getForProduct(productId: number): Observable<ProductReview[]> {
    const headers = this.authHeaders(); // Headers optionnels, mais utiles pour savoir si "mine" est true
    return this.http.get<ProductReview[]>(`${this.baseUrl}/product/${productId}`, { headers });
  }

  addReview(payload: ProductReviewCreateRequest): Observable<ProductReview> {
    const headers = this.authHeaders();
    return this.http.post<ProductReview>(this.baseUrl, payload, { headers });
  }

  updateReview(id: number, payload: ProductReviewUpdateRequest): Observable<ProductReview> {
    const headers = this.authHeaders();
    return this.http.put<ProductReview>(`${this.baseUrl}/${id}`, payload, { headers });
  }

  deleteReview(id: number): Observable<void> {
    const headers = this.authHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  // ================= ADMIN =================

  /**
   * Récupère tous les avis pour l'admin
   * @param status (Optionnel) Filtrer par 'VISIBLE' ou 'DELETED'
   */
  adminGetAll(status?: ReviewStatus): Observable<AdminReview[]> {
    const headers = this.authHeaders();
    let params = new HttpParams();
    if (status && status !== 'ALL' as any) {
      params = params.set('status', status);
    }
    return this.http.get<AdminReview[]>(this.adminUrl, { headers, params });
  }

  /**
   * Change le statut d'un avis (VISIBLE <-> DELETED)
   */
  adminChangeStatus(id: number, status: ReviewStatus): Observable<AdminReview> {
    const headers = this.authHeaders();
    // Utilisation de PATCH ou PUT selon ton backend. Ici PATCH est sémantiquement correct.
    return this.http.patch<AdminReview>(
      `${this.adminUrl}/${id}/status`,
      null, // Body vide ou objet status si besoin, ici on passe le status en query param
      { headers, params: { status } }
    );
  }
}
