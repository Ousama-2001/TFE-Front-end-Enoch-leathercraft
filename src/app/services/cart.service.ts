import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// --- INTERFACES ---

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface CartResponse {
  cartId: number;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
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

/** 🔹 Payload envoyé au back pour le checkout */
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
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:8080/api';

  // État local "simple"
  items: CartItem[] = [];
  totalQuantity = 0;
  totalAmount = 0;

  // État observable
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  private syncState(cart: CartResponse) {
    this.cartSubject.next(cart);
    this.items = cart.items;
    this.totalQuantity = cart.totalQuantity;
    this.totalAmount = cart.totalAmount;
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

  clear() {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** ✅ Checkout avec payload */
  checkout(payload: CheckoutPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders/checkout`, payload).pipe(
      tap(() => {
        this.syncState({ cartId: 0, items: [], totalQuantity: 0, totalAmount: 0 });
      })
    );
  }

  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }
}
