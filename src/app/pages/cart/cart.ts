import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Services
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

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

  constructor(
    public cart: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

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
      this.remove(item);
    } else {
      this.cart.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  remove(item: CartItem): void {
    if(confirm('Voulez-vous retirer cet article ?')) {
      this.cart.removeItem(item.productId).subscribe();
    }
  }

  clearCart(): void {
    if(confirm('Voulez-vous vraiment vider tout le panier ?')) {
      this.cart.clear().subscribe();
    }
  }

  // ---------------------------
  //   VALIDATION DU CHECKOUT
  // ---------------------------
  checkout() {
    this.validating = true;
    this.error = '';

    this.orderService.checkout().subscribe({
      next: (order) => {
        console.log('Commande réussie:', order);

        // 🔥 IMPORTANT : rafraîchir le panier pour vider l’affichage
        this.cart.loadCart().subscribe();

        this.validating = false;

        this.router.navigate(['/order-success', order.reference]);
      },
      error: (err) => {
        console.error('Erreur checkout:', err);
        this.error = "Erreur lors de la validation. Êtes-vous bien connecté ?";
        this.validating = false;
      }
    });
  }
}
