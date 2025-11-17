import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ---- Interface produit utilisée partout ----
export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  material?: string;
  weightGrams?: number;
  slug?: string;
  isActive?: boolean;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // --- Récupération des produits publics (page boutique) ---
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  // --- Création d’un produit (admin) ---
  create(data: {
    sku: string;
    name: string;
    description: string;
    material?: string;
    price: number;
    weightGrams?: number;
    isActive?: boolean;
    slug?: string;
    currency?: string;
  }): Observable<Product> {

    const body = {
      ...data,
      currency: data.currency ?? 'EUR'
    };

    return this.http.post<Product>(
      `${this.baseUrl}/admin/products`,
      body
    );
  }

  // --- Suppression d’un produit (admin) ---
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/products/${id}`
    );
  }
}
