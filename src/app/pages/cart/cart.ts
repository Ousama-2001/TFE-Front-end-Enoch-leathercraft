import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  isLoggedIn = false;
  expiryMessage = '';
  stockMessage = '';

  promoCode = '';
  promoError = '';
  promoSuccess = '';
  promoApplying = false;

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isAuthenticated();

    this.cart.loadCart().subscribe({ error: () => {} });

    this.sub = this.cart.timeLeftMs$.subscribe((ms) => {
      if (this.cart.items.length && ms === 0) {
        this.expiryMessage = 'Temps écoulé : votre panier a été vidé.';
        this.cart.loadCart().subscribe({ error: () => {} });
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if(img) img.src = 'assets/img/products/placeholder-bag.jpg';
  }

  goToProduct(item: CartItem): void {
    this.router.navigate(['/products', item.productId]);
  }

  trackByProductId(_: number, item: CartItem): number {
    return item.productId;
  }

  formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  canIncrease(item: CartItem): boolean {
    const stock = item.stockQuantity;
    if (stock === undefined || stock === null) return true;
    return item.quantity < stock;
  }

  increase(item: CartItem): void {
    if (!this.canIncrease(item)) {
      this.stockMessage = 'Stock insuffisant.';
      setTimeout(() => (this.stockMessage = ''), 2000);
      return;
    }
    this.cart.updateQuantity(item.productId, item.quantity + 1).subscribe({
      next: () => (this.stockMessage = ''),
      error: () => this.stockMessage = 'Erreur mise à jour.'
    });
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      this.remove(item);
    } else {
      this.cart.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  remove(item: CartItem): void {
    this.cart.removeItem(item.productId).subscribe();
  }

  clearCart(): void {
    this.cart.clear().subscribe();
    this.cart.clearPromo();
    this.promoCode = '';
    this.promoSuccess = '';
    this.promoError = '';
  }

  goToCheckout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  applyPromo(): void {
    this.promoError = '';
    this.promoSuccess = '';

    const code = (this.promoCode || '').trim();
    if (!code) {
      this.promoError = 'Entrez un code.';
      return;
    }

    this.promoApplying = true;
    this.cart.validateCoupon(code).subscribe({
      next: (res) => {
        if (res?.valid && typeof res.percent === 'number') {
          this.cart.applyCouponValidated(res.code, res.percent);
          this.promoSuccess = `Code ${res.code} appliqué (-${res.percent}%).`;
        } else {
          this.cart.clearPromo();
          this.promoError = 'Code invalide ou expiré.';
        }
        this.promoApplying = false;
      },
      error: () => {
        this.cart.clearPromo();
        this.promoError = 'Erreur vérification code.';
        this.promoApplying = false;
      }
    });
  }

  removePromo(): void {
    this.cart.clearPromo();
    this.promoCode = '';
    this.promoSuccess = '';
    this.promoError = '';
  }
}
