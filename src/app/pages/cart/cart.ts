import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  validating = false;
  error = '';

  isLoggedIn = false;
  guestMessage = '';

  // ✅ messages UX
  expiryMessage = '';
  stockMessage = '';

  private sub?: Subscription;
  private expiredHandled = false;

  constructor(
    public cart: CartService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cart.loadCart().subscribe();

    this.isLoggedIn = this.auth.isAuthenticated?.()
      ? this.auth.isAuthenticated()
      : !!localStorage.getItem('auth_token');

    this.guestMessage = '';
    this.expiryMessage = '';
    this.stockMessage = '';

    // ✅ si timer arrive à 0 => le back videra, on refresh
    this.sub = this.cart.timeLeftMs$.subscribe((ms) => {
      if (!this.cart.items.length) {
        this.expiredHandled = false;
        return;
      }

      if (ms === 0 && !this.expiredHandled) {
        this.expiredHandled = true;
        this.expiryMessage =
          '⌛ Temps écoulé : votre panier a été vidé (15 minutes dépassées).';
        this.cart.loadCart().subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }

  formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /** ✅ Stock check */
  canIncrease(item: CartItem): boolean {
    // si stock non fourni => on ne bloque pas côté front
    if (typeof item.stockQuantity !== 'number') return true;
    return item.quantity < item.stockQuantity;
  }

  increase(item: CartItem): void {
    this.expiryMessage = '';
    this.stockMessage = '';

    if (!this.canIncrease(item)) {
      this.stockMessage = `Stock insuffisant : maximum ${item.stockQuantity} unité(s) pour "${item.name}".`;
      return;
    }

    this.cart.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decrease(item: CartItem): void {
    this.expiryMessage = '';
    this.stockMessage = '';

    if (item.quantity <= 1) {
      this.remove(item);
    } else {
      this.cart.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  remove(item: CartItem): void {
    this.expiryMessage = '';
    this.stockMessage = '';

    if (confirm('Voulez-vous retirer cet article ?')) {
      this.cart.removeItem(item.productId).subscribe();
    }
  }

  clearCart(): void {
    this.expiryMessage = '';
    this.stockMessage = '';

    if (confirm('Voulez-vous vraiment vider tout le panier ?')) {
      this.cart.clear().subscribe();
    }
  }

  goToCheckout(): void {
    if (!this.cart.items.length) return;

    // si timer expiré, on force un refresh (back vide)
    // (utile si l’utilisateur clique pile au moment où ms tombe à 0)
    // => on évite de l’envoyer checkout avec panier déjà invalide
    // (safe)
    // NOTE: timeLeftMs$ est async, donc on ne l’utilise pas ici directement

    if (!this.isLoggedIn) {
      this.guestMessage =
        'Vous devez être connecté ou inscrit pour valider votre commande.';
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    this.router.navigate(['/checkout']);
  }
}
