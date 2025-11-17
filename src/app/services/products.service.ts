import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  material: string;
  price: number;
  weightGrams: number;
  currency: string;
  slug: string;
  isActive: boolean;
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  description: string;
  material: string;
  price: number;
  weightGrams: number;
  isActive: boolean;
  currency?: string;
  slug?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/products';
  private adminUrl = 'http://localhost:8080/api/admin/products';

  constructor(private http: HttpClient) {}

  /** Récupération publique */
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  /** Création côté admin */
  create(data: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.adminUrl, data);
  }

  /** Mise à jour */
  update(id: number, data: ProductCreateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.adminUrl}/${id}`, data);
  }

  /** Suppression */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
