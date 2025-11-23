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
  imageUrl?: string; // Ajouté si jamais le back renvoie l'image ici
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

// NOUVEAU : Interface pour la réponse de commande
export interface OrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:8080/api'; // Attention: J'ai retiré '/cart' ici pour flexibilité

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

  /** Charger le panier depuis le back */
  loadCart() {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart`).pipe(
      tap((cart) => this.syncState(cart))
    );
  }

  /** Ajouter un produit */
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

  /** Mettre à jour quantité */
  updateQuantity(productId: number, quantity: number) {
    const body: CartUpdateRequest = { quantity };
    return this.http
      .patch<CartResponse>(`${this.baseUrl}/cart/items/${productId}`, body)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Supprimer un produit */
  removeItem(productId: number) {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart/items/${productId}`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** Vider le panier */
  clear() {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart`)
      .pipe(tap((cart) => this.syncState(cart)));
  }

  /** NOUVEAU : Valider la commande */
  checkout(): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders/checkout`, {}).pipe(
      tap(() => {
        // Sur succès, on vide l'état local car le back a vidé le panier
        this.syncState({ cartId: 0, items: [], totalQuantity: 0, totalAmount: 0 });
      })
    );
  }

  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  }
}
