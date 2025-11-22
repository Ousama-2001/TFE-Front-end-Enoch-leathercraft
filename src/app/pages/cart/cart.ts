import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit {
  constructor(public cart: CartService) {}

  ngOnInit(): void {
    this.cart.loadCart().subscribe();
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      this.cart.removeItem(item.productId).subscribe();
    } else {
      this.cart.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  remove(item: CartItem): void {
    this.cart.removeItem(item.productId).subscribe();
  }

  clearCart(): void {
    this.cart.clear().subscribe();
  }
}
