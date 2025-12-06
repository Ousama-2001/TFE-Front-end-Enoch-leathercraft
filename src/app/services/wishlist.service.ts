// src/app/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Product } from './products.service';

export interface WishlistItemResponse {
  id: number;
  product: Product;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = 'http://localhost:8080/api/wishlist';

  private wishlistSubject = new BehaviorSubject<WishlistItemResponse[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Charge la wishlist depuis le back */
  load(): Observable<WishlistItemResponse[]> {
    return this.http
      .get<WishlistItemResponse[]>(this.baseUrl)
      .pipe(tap((items) => this.wishlistSubject.next(items)));
  }

  /** Toggle like/unlike */
  toggle(productId: number): Observable<WishlistItemResponse[]> {
    return this.http
      .post<WishlistItemResponse>(`${this.baseUrl}/${productId}`, {})
      .pipe(
        tap((item) => {
          const current = this.wishlistSubject.value;
          const exists = current.some((w) => w.product.id === productId);
          const updated = exists
            ? current.filter((w) => w.product.id !== productId)
            : [...current, item];

          this.wishlistSubject.next(updated);
        }),
        map(() => this.wishlistSubject.value)
      );
  }

  /** Supprime un produit de la wishlist */
  remove(productId: number): Observable<WishlistItemResponse[]> {
    return this.http
      .delete<void>(`${this.baseUrl}/${productId}`)
      .pipe(
        tap(() => {
          const updated = this.wishlistSubject.value.filter(
            (w) => w.product.id !== productId
          );
          this.wishlistSubject.next(updated);
        }),
        map(() => this.wishlistSubject.value)
      );
  }

  /** Nombre d’items pour le badge */
  getCount(): number {
    return this.wishlistSubject.value.length;
  }
  clear(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clear`).pipe(
      tap(() => this.wishlistSubject.next([]))
    );
  }

}
