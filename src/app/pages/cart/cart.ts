import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent {
  constructor(public cart: CartService) {}

  trackByProductId(_index: number, item: CartItem): number {
    return item.productId;
  }

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity + 1);
  }

  decrease(item: CartItem): void {
    if (item.quantity > 1) {
      this.cart.updateQuantity(item.productId, item.quantity - 1);
    } else {
      this.cart.removeItem(item.productId);
    }
  }

  remove(item: CartItem): void {
    this.cart.removeItem(item.productId);
  }

  clear(): void {
    this.cart.clear();
  }

  checkout(): void {
    // plus tard : appel backend pour créer une commande
    alert('Simulation : commande créée (backend à implémenter).');
  }
}
