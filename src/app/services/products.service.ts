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

  // 🔹 PUBLIC CATALOGUE
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  // 🔹 DETAIL PRODUIT PUBLIC (doit passer par /api/products/**, PAS /admin)
  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // 🔹 ADMIN

  create(body: ProductCreateRequest, file: File): Observable<Product> {
    const formData = new FormData();

    // 1. Ajouter le fichier image.
    formData.append('file', file, file.name);

    // 2. Ajouter le DTO du produit, converti en chaîne JSON.
    formData.append('product', JSON.stringify(body));

    return this.http.post<Product>(`${this.baseUrl}/admin/products`, formData);
  }


  update(id: number, body: ProductCreateRequest): Observable<Product> {
    return this.http.put<Product>(
      `${this.baseUrl}/admin/products/${id}`,
      body,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/products/${id}`,
    );
  }
}
