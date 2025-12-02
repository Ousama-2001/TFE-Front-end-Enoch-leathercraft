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
  stockQuantity?: number;
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
  stockQuantity?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ------- CATALOGUE ACTIF (public + admin) -------
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // ------- PRODUITS ARCHIVÉS (soft delete) -------
  getArchived(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/admin/products/archived`);
  }

  // ------- CRÉATION AVEC IMAGE -------
  create(body: ProductCreateRequest, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('product', JSON.stringify(body));
    return this.http.post<Product>(`${this.baseUrl}/admin/products`, formData);
  }

  // ------- MISE À JOUR AVEC IMAGE OPTIONNELLE -------
  update(id: number, body: ProductCreateRequest, file?: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(body));

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, formData);
  }

  // ------- SOFT DELETE (passe en "archivé") -------
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${id}`);
  }

  // ------- RESTAURER UN PRODUIT ARCHIVÉ -------
  restore(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/admin/products/${id}/restore`, {});
  }

  getMainImageUrl(product: Product): string {
    if (!product.imageUrls || product.imageUrls.length === 0) {
      return 'assets/images/placeholder-product.jpg';
    }

    const first = product.imageUrls[0];

    if (first.startsWith('http://') || first.startsWith('https://')) {
      return first;
    }

    return `http://localhost:8080/${first}`;
  }
}
