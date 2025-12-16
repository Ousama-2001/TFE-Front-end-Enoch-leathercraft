import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  isLoggedIn = false;

  expiryMessage = '';
  stockMessage = '';
  guestMessage = '';

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

    if (!this.isLoggedIn) {
      this.guestMessage =
        'Vous êtes en mode invité. Connectez-vous pour valider la commande.';
    }

    this.cart.loadCart().subscribe({ error: () => {} });

    this.sub = this.cart.timeLeftMs$.subscribe((ms) => {
      if (this.cart.items.length && ms === 0) {
        this.expiryMessage = 'Temps écoulé : votre panier a été vidé.';
        this.cart.loadCart().subscribe({ error: () => {} });
        setTimeout(() => (this.expiryMessage = ''), 2500);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = 'assets/placeholder.png';
  }

  // ✅ clic produit -> page detail
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
      this.stockMessage = 'Stock insuffisant pour augmenter la quantité.';
      setTimeout(() => (this.stockMessage = ''), 2000);
      return;
    }

    this.cart.updateQuantity(item.productId, item.quantity + 1).subscribe({
      next: () => (this.stockMessage = ''),
      error: () => {
        this.stockMessage = 'Impossible de mettre à jour la quantité.';
        setTimeout(() => (this.stockMessage = ''), 2000);
      },
    });
  }

  decrease(item: CartItem): void {
    const nextQty = item.quantity - 1;
    if (nextQty <= 0) {
      this.remove(item);
      return;
    }

    this.cart.updateQuantity(item.productId, nextQty).subscribe({
      error: () => {
        this.stockMessage = 'Impossible de mettre à jour la quantité.';
        setTimeout(() => (this.stockMessage = ''), 2000);
      },
    });
  }

  remove(item: CartItem): void {
    this.cart.removeItem(item.productId).subscribe({ error: () => {} });
  }

  clearCart(): void {
    this.cart.clear().subscribe({ error: () => {} });
    this.cart.clearPromo();
    this.promoCode = '';
    this.promoError = '';
    this.promoSuccess = '';
  }

  goToCheckout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  // ✅ promo: check back
  applyPromo(): void {
    this.promoError = '';
    this.promoSuccess = '';

    const code = (this.promoCode || '').trim().toUpperCase();
    if (!code) {
      this.promoError = 'Entrez un code promo.';
      return;
    }

    this.promoApplying = true;

    this.cart.validateCoupon(code).subscribe({
      next: (res) => {
        if (res?.valid && typeof res.percent === 'number') {
          this.cart.applyCouponValidated(res.code, res.percent);
          this.promoSuccess = `Code ${res.code} appliqué (-${res.percent}%).`;
          this.promoError = '';
        } else {
          this.cart.clearPromo();
          this.promoError = 'Code promo invalide ou expiré.';
          this.promoSuccess = '';
        }
        this.promoApplying = false;
      },
      error: () => {
        this.cart.clearPromo();
        this.promoError = 'Impossible de vérifier le code promo.';
        this.promoSuccess = '';
        this.promoApplying = false;
      },
    });
  }

  removePromo(): void {
    this.cart.clearPromo();
    this.promoCode = '';
    this.promoError = '';
    this.promoSuccess = '';
  }
}
