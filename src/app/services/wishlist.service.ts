// src/app/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  imageUrls?: string[];
}

export interface WishlistItem {
  id: number;
  product: WishlistProduct;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly api = 'http://localhost:8080/api/wishlist';

  constructor(private http: HttpClient) {}

  /** Récupère la wishlist de l'utilisateur connecté */
  get(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(this.api);
  }

  /** Ajoute un produit à la wishlist (par id) */
  add(productId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/${productId}`, {});
  }

  /** Retire un produit de la wishlist */
  remove(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${productId}`);
  }
}
