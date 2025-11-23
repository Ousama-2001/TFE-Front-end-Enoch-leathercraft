import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  material?: string;
  price: number;
  currency: string;
  weightGrams?: number;
  isActive?: boolean;
  imageUrls?: string[];
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  material?: string;
  price: number;
  currency?: string;
  weightGrams?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // CREATE (Reste inchangé)
  create(body: ProductCreateRequest, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('product', JSON.stringify(body));
    return this.http.post<Product>(`${this.baseUrl}/admin/products`, formData);
  }

  // UPDATE (MODIFIÉ : Accepte maintenant un fichier optionnel)
  update(id: number, body: ProductCreateRequest, file?: File | null): Observable<Product> {
    const formData = new FormData();

    // Ajoute le produit en JSON
    formData.append('product', JSON.stringify(body));

    // Ajoute le fichier SEULEMENT s'il est fourni (nouveau ou modifié)
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${id}`);
  }
}
