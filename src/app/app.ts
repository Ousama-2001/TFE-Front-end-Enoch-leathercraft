import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {

  title = 'Enoch Leathercraft';

  miniCartOpen = false;
  cartQuantity = 0;

  // 👉 on déclare seulement ici
  cart$!: Observable<CartResponse | null>;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    // 👉 et on l'initialise dans le constructeur
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // Charge le panier seulement si l'utilisateur est connecté
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({
        next: (cart: CartResponse) => {
          this.cartQuantity = cart.totalQuantity;
        },
        error: () => {
          // on ignore les 403 éventuels
        }
      });
    }

    // Met à jour le badge du panier en live
    this.cart$.subscribe((cart) => {
      this.cartQuantity = cart ? cart.totalQuantity : 0;
    });
  }

  isAuthPage(): boolean {
    return this.authService.isAuthPage();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout();
  }
}
