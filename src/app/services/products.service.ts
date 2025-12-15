import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency: string;
  weightGrams?: number;
  isActive?: boolean;

  // ✅ compat public
  imageUrls?: string[];

  // ✅ admin CRUD images
  images?: ProductImage[];

  stockQuantity?: number;

  segmentCategoryId?: number | null;
  typeCategoryId?: number | null;
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency?: string;
  weightGrams?: number;
  isActive?: boolean;
  stockQuantity?: number;

  segmentCategoryId?: number | null;
  typeCategoryId?: number | null;
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

  getArchived(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/admin/products/archived`);
  }

  create(body: ProductCreateRequest, files: File[]): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(body));
    (files || []).forEach((f) => formData.append('files', f, f.name));
    return this.http.post<Product>(`${this.baseUrl}/admin/products`, formData);
  }

  update(id: number, body: ProductCreateRequest, files?: File[] | null): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(body));
    (files || []).forEach((f) => formData.append('files', f, f.name));
    return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${id}`);
  }

  restore(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/admin/products/${id}/restore`, {});
  }

  // ✅ supprimer image par ID (ton back existe déjà)
  deleteImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${productId}/images/${imageId}`);
  }

  // ✅ URL d'image (prend index)
  getImageUrl(product: Product, index = 0): string {
    const arr = product.imageUrls || [];
    if (arr.length > 0) {
      const u = arr[Math.min(index, arr.length - 1)];
      if (!u) return 'assets/img/products/placeholder-bag.jpg';
      if (u.startsWith('http://') || u.startsWith('https://')) return u;
      if (u.startsWith('/')) return `http://localhost:8080${u}`;
      return `http://localhost:8080/${u}`;
    }
    return 'assets/img/products/placeholder-bag.jpg';
  }

  // ✅ admin : url image à partir de ProductImage
  getAdminImageUrl(img: ProductImage): string {
    const u = img?.url || '';
    if (!u) return 'assets/img/products/placeholder-bag.jpg';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/')) return `http://localhost:8080${u}`;
    return `http://localhost:8080/${u}`;
  }
}
