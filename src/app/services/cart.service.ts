import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  combineLatest,
  interval,
  map,
  startWith,
} from 'rxjs';

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
  stockQuantity?: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  expiresAt?: string | null;
  // ✅ Champs nécessaires pour la synchro
  couponCode?: string | null;
  discountPercent?: number;
}

export interface CheckoutPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  notes?: string;
  promoCode?: string | null;
}

export interface CartAddRequest {
  productId: number;
  quantity: number;
}

export interface CartUpdateRequest {
  quantity: number;
}

export interface OrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface CouponValidateResponse {
  code: string;
  valid: boolean;
  percent?: number | null;
  reason?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:8080/api';
  private origin = 'http://localhost:8080';

  items: CartItem[] = [];
  totalQuantity = 0;
  totalAmount = 0;
  expiresAt: string | null = null;

  promoCode: string | null = null;
  discountPercent = 0;

  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  timeLeftMs$ = combineLatest([
    this.cart$,
    interval(1000).pipe(startWith(0)),
  ]).pipe(
    map(([cart]) => {
      if (!cart?.expiresAt) return 0;
      const ms = new Date(cart.expiresAt).getTime() - Date.now();
      return Math.max(0, ms);
    })
  );

  constructor(private http: HttpClient) {}

  // ✅ SYNCHRONISATION ROBUSTE
  private syncState(cart: CartResponse) {
    this.cartSubject.next(cart);
    this.items = cart.items;
    this.totalQuantity = cart.totalQuantity;
    this.totalAmount = cart.totalAmount;
    this.expiresAt = cart.expiresAt ?? null;

    // Met à jour les variables locales depuis le serveur
    // Si le serveur a vidé le coupon (via clearCart), ceci va le vider côté front aussi
    this.promoCode = cart.couponCode || null;
    this.discountPercent = cart.discountPercent || 0;
  }

  getCartItemImage(item: CartItem): string {
    const raw = (item?.imageUrl || '').trim();
    const fallback = `/uploads/products/${encodeURIComponent(item.sku)}.jpg`;
    const path = raw || fallback;

    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${this.origin}${path}`;
    return `${this.origin}/${path}`;
  }

  get totalAfterDiscount(): number {
    const pct = this.discountPercent || 0;
    const base = this.totalAmount || 0;
    const reduced = base * (1 - pct / 100);
    return Math.max(0, Math.round(reduced * 100) / 100);
  }

  get discountAmount(): number {
    const base = this.totalAmount || 0;
    return Math.max(0, Math.round((base - this.totalAfterDiscount) * 100) / 100);
  }

  validateCoupon(codeRaw: string): Observable<CouponValidateResponse> {
    const code = (codeRaw || '').trim().toUpperCase();
    return this.http.get<CouponValidateResponse>(`${this.baseUrl}/coupons/validate`, {
      params: { code },
    });
  }

  applyCouponValidated(code: string, percent: number): void {
    this.promoCode = (code || '').trim().toUpperCase();
    const pct = Number(percent) || 0;
    this.discountPercent = Math.max(0, Math.min(100, pct));
  }

  // ✅ CLEAR LOCAL IMMEDIAT
  clearPromo(): void {
    this.promoCode = null;
    this.discountPercent = 0;
  }

  loadCart() {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart`).pipe(
      tap((cart) => this.syncState(cart))
    );
  }

  addProduct(productOrId: number | { id?: number }, quantity: number = 1) {
    let productId: number;
    if (typeof productOrId === 'number') {
      productId = productOrId;
    } else {
      if (!productOrId.id) throw new Error('Product sans id passé à addProduct');
      productId = productOrId.id;
    }

    const body: CartAddRequest = { productId, quantity };
    return this.http
      .post<CartResponse>(`${this.baseUrl}/cart/items`, body)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  updateQuantity(productId: number, quantity: number) {
    const body: CartUpdateRequest = { quantity };
    return this.http
      .patch<CartResponse>(`${this.baseUrl}/cart/items/${productId}`, body)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  removeItem(productId: number) {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart/items/${productId}`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  // ✅ FLUIDITÉ : RESET IMMEDIAT PUIS APPEL API
  clear() {
    // 1. Mise à jour visuelle instantanée
    this.items = [];
    this.totalQuantity = 0;
    this.totalAmount = 0;
    this.clearPromo();

    this.cartSubject.next({
      cartId: 0,
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      expiresAt: null,
      couponCode: null,
      discountPercent: 0
    });

    // 2. Appel serveur pour nettoyer la DB (articles + coupon)
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  checkout(payload: CheckoutPayload): Observable<OrderResponse> {
    const withPromo: CheckoutPayload = {
      ...payload,
      promoCode: this.promoCode,
    };

    return this.http.post<OrderResponse>(`${this.baseUrl}/orders/checkout`, withPromo).pipe(
      tap(() => {
        // Reset local après succès
        this.clearPromo();
        this.syncState({
          cartId: 0,
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
          expiresAt: null,
          couponCode: null,
          discountPercent: 0
        });
      })
    );
  }

  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }

  getItemStock(productId: number): number | null {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) return null;
    return typeof item.stockQuantity === 'number' ? item.stockQuantity : null;
  }
}
