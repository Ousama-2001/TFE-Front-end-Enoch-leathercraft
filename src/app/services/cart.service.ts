import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './products.service';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'enoch_cart';

  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  get totalQuantity(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get totalAmount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  }

  addProduct(product: Product, quantity: number = 1): void {
    const items = [...this.items];
    const existing = items.find(i => i.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    this.update(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    let items = [...this.items];

    items = items
      .map(i => (i.productId === productId ? { ...i, quantity } : i))
      .filter(i => i.quantity > 0);

    this.update(items);
  }

  removeItem(productId: number): void {
    const items = this.items.filter(i => i.productId !== productId);
    this.update(items);
  }

  clear(): void {
    this.update([]);
  }

  // ------- interne -------

  private update(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.saveToStorage(items);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }
}
