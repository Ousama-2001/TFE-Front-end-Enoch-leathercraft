import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Services
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent implements OnInit {
  validating = false;
  error = '';

  // ✅ état login
  isLoggedIn = false;

  // ✅ message guest
  guestMessage = '';

  constructor(
    public cart: CartService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cart.loadCart().subscribe();

    // ✅ détection connexion
    this.isLoggedIn = this.auth.isAuthenticated?.()
      ? this.auth.isAuthenticated()
      : !!localStorage.getItem('auth_token');

    // reset message
    this.guestMessage = '';
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      this.remove(item);
    } else {
      this.cart.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  remove(item: CartItem): void {
    if (confirm('Voulez-vous retirer cet article ?')) {
      this.cart.removeItem(item.productId).subscribe();
    }
  }

  clearCart(): void {
    if (confirm('Voulez-vous vraiment vider tout le panier ?')) {
      this.cart.clear().subscribe();
    }
  }

  /** ✅ Checkout : si pas connecté -> login + returnUrl */
  goToCheckout(): void {
    if (!this.cart.items.length) return;

    // guest -> on bloque et on redirige
    if (!this.isLoggedIn) {
      this.guestMessage =
        'Vous devez être connecté ou inscrit pour valider votre commande.';
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    // connecté -> checkout
    this.router.navigate(['/checkout']);
  }
}
