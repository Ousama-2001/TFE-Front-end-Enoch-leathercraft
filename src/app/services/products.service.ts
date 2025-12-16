// src/app/services/product.service.ts
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

  price: number; // prix normal
  currency: string;

  // ✅ PROMO renvoyée par back
  promoPrice?: number | null;
  promoStartAt?: string | null; // ISO
  promoEndAt?: string | null;   // ISO
  isOnSale?: boolean | null;
  effectivePrice?: number | null; // ✅ calculé back

  // ✅ CODE PROMO (on ajoute au back ensuite)
  promoCode?: string | null;

  weightGrams?: number;
  isActive?: boolean;

  imageUrls?: string[];
  images?: ProductImage[];

  stockQuantity?: number;

  segmentCategoryId?: number | null;
  typeCategoryId?: number | null;

  segmentSlug?: string | null;
  typeSlug?: string | null;
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

  // ✅ PROMO admin
  promoPrice?: number | null;
  promoStartAt?: string | null; // ISO
  promoEndAt?: string | null;   // ISO

  // ✅ CODE PROMO (on ajoute au back ensuite)
  promoCode?: string | null;

  segmentCategoryId?: number | null;
  typeCategoryId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // =========================
  // PUBLIC / CATALOGUE
  // =========================
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // =========================
  // ADMIN / ARCHIVES
  // =========================
  getArchived(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/admin/products/archived`);
  }

  // =========================
  // ADMIN / CRUD
  // =========================

  /**
   * ✅ FormData : on envoie le JSON en Blob application/json
   * (plus robuste que append('product', JSON.stringify(...)))
   */
  private buildProductFormData(body: ProductCreateRequest, files?: File[] | null): FormData {
    const formData = new FormData();

    const normalizedBody = this.normalizePromoDates(body);

    formData.append(
      'product',
      new Blob([JSON.stringify(normalizedBody)], { type: 'application/json' })
    );

    (files || []).forEach((f) => formData.append('files', f, f.name));
    return formData;
  }

  create(body: ProductCreateRequest, files: File[]): Observable<Product> {
    const formData = this.buildProductFormData(body, files);
    return this.http.post<Product>(`${this.baseUrl}/admin/products`, formData);
    // ⚠️ pas de Content-Type à la main : le navigateur met le boundary
  }

  update(id: number, body: ProductCreateRequest, files?: File[] | null): Observable<Product> {
    const formData = this.buildProductFormData(body, files);
    return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${id}`);
  }

  restore(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/admin/products/${id}/restore`, {});
  }

  deleteImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${productId}/images/${imageId}`);
  }

  // =========================
  // ✅ IMAGES URL HELPERS
  // =========================
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

  getAdminImageUrl(img: ProductImage): string {
    const u = img?.url || '';
    if (!u) return 'assets/img/products/placeholder-bag.jpg';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/')) return `http://localhost:8080${u}`;
    return `http://localhost:8080/${u}`;
  }

  // =========================
  // ✅ DATE + HEURE HELPERS (datetime-local)
  // =========================

  /**
   * ISO ("2025-12-15T17:30:00Z") -> "YYYY-MM-DDTHH:mm" (pour input datetime-local)
   * ⚠️ utilise l'heure locale du navigateur (normal pour datetime-local)
   */
  isoToDatetimeLocal(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  /**
   * "YYYY-MM-DDTHH:mm" (datetime-local) -> ISO string
   * Exemple: "2025-12-15T17:30" -> "2025-12-15T16:30:00.000Z" (selon timezone)
   */
  datetimeLocalToIso(local?: string | null): string | null {
    if (!local) return null;
    const d = new Date(local);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  /**
   * Normalise promoStartAt / promoEndAt si le front stocke du datetime-local.
   * - Si c'est déjà ISO => on garde
   * - Si c'est "YYYY-MM-DDTHH:mm" => convert en ISO
   */
  private normalizePromoDates(body: ProductCreateRequest): ProductCreateRequest {
    const copy: ProductCreateRequest = { ...body };

    const normalize = (v?: string | null): string | null | undefined => {
      if (v == null) return v;

      // déjà ISO (simple check)
      if (v.endsWith('Z') || v.includes('+') || v.includes('.')) return v;

      // sinon on tente datetime-local
      const iso = this.datetimeLocalToIso(v);
      return iso ?? v;
    };

    copy.promoStartAt = normalize(copy.promoStartAt) ?? null;
    copy.promoEndAt = normalize(copy.promoEndAt) ?? null;

    return copy;
  }

  // =========================
  // ✅ HELPERS PROMO (validité / status / prix)
  // =========================

  private parseDateSafe(v?: string | null): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  isPromoValid(p: Product, now: Date = new Date()): boolean {
    const base = typeof p.price === 'number' ? p.price : 0;
    const promo = typeof p.promoPrice === 'number' ? p.promoPrice : null;
    if (promo == null) return false;
    if (!base || promo <= 0) return false;
    if (promo >= base) return false;

    const start = this.parseDateSafe(p.promoStartAt);
    const end = this.parseDateSafe(p.promoEndAt);

    if (start && now.getTime() < start.getTime()) return false;
    if (end && now.getTime() > end.getTime()) return false;

    return true;
  }

  getPromoStatus(
    p: Product,
    now: Date = new Date()
  ): 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE' {
    const promo = typeof p.promoPrice === 'number' ? p.promoPrice : null;
    const base = typeof p.price === 'number' ? p.price : 0;

    if (promo == null || !base || promo >= base || promo <= 0) return 'INACTIVE';

    const start = this.parseDateSafe(p.promoStartAt);
    const end = this.parseDateSafe(p.promoEndAt);

    if (start && now.getTime() < start.getTime()) return 'UPCOMING';
    if (end && now.getTime() > end.getTime()) return 'EXPIRED';

    return 'ACTIVE';
  }

  getEffectivePrice(p: Product, now: Date = new Date()): number {
    const eff = p.effectivePrice;
    if (typeof eff === 'number' && eff > 0) return eff;

    if (this.isPromoValid(p, now) && typeof p.promoPrice === 'number') {
      return p.promoPrice;
    }

    return p.price;
  }

  getDiscountPercent(p: Product, now: Date = new Date()): number {
    const base = p.price || 0;
    const eff = this.getEffectivePrice(p, now);
    if (!base || eff >= base) return 0;
    return Math.round(((base - eff) / base) * 100);
  }

  hasPromoCode(p: Product): boolean {
    return !!(p.promoCode && p.promoCode.trim().length > 0);
  }

  getPromoCodeLabel(p: Product): string {
    return (p.promoCode || '').trim();
  }

}
