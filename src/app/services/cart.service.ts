import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
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

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:8080/api/cart';

  // 🔹 état "simple" utilisé par tes templates existants (cart.html, product-detail, etc.)
  items: CartItem[] = [];
  totalQuantity = 0;
  totalAmount = 0;

  // 🔹 état observable (si tu veux utiliser async pipe plus tard)
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- interne : synchronise tout l'état à partir de la réponse du back ---
  private syncState(cart: CartResponse) {
    this.cartSubject.next(cart);
    this.items = cart.items;
    this.totalQuantity = cart.totalQuantity;
    this.totalAmount = cart.totalAmount;
  }

  /** Charger le panier depuis le back */
  loadCart() {
    return this.http.get<CartResponse>(this.baseUrl).pipe(
      tap((cart) => this.syncState(cart))
    );
  }

  /** Ajouter un produit (compatible id OU Product) */
  addProduct(
    productOrId: number | { id?: number },
    quantity: number = 1
  ) {
    let productId: number;

    if (typeof productOrId === 'number') {
      productId = productOrId;
    } else {
      if (!productOrId.id) {
        throw new Error('Product sans id passé à addProduct');
      }
      productId = productOrId.id;
    }

    const body: CartAddRequest = { productId, quantity };

    return this.http
      .post<CartResponse>(`${this.baseUrl}/items`, body)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Mettre à jour la quantité d'un produit (nouvelle API) */
  updateProduct(productId: number, quantity: number) {
    const body: CartUpdateRequest = { quantity };

    return this.http
      .patch<CartResponse>(`${this.baseUrl}/items/${productId}`, body)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Alias pour l'ancienne méthode utilisée dans tes composants */
  updateQuantity(productId: number, quantity: number) {
    return this.updateProduct(productId, quantity);
  }

  /** Supprimer un produit (nouvelle API) */
  removeProduct(productId: number) {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/items/${productId}`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Alias pour l’ancienne méthode utilisée dans tes composants */
  removeItem(productId: number) {
    return this.removeProduct(productId);
  }

  /** Vider le panier (nouvelle API) */
  clearCart() {
    return this.http
      .delete<CartResponse>(this.baseUrl)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Alias pour l’ancienne méthode utilisée dans tes composants */
  clear() {
    return this.clearCart();
  }

  /** Quantité d’un produit dans le panier */
  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }
}
