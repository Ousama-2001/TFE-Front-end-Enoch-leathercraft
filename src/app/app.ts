// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageService } from './services/language.service';
import {
  WishlistService,
  WishlistItemResponse,
} from './services/wishlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe, // pour | t dans le template
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  title = 'Enoch Leathercraft';

  miniCartOpen = false;
  cartQuantity = 0;
  cart$!: Observable<CartResponse | null>;

  currentLang: 'fr' | 'en' = 'fr';

  // 🔥 compteur wishlist pour le badge dans le header
  wishlistCount = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private wishlistService: WishlistService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // langue actuelle
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    const isAuth = this.authService.isAuthenticated();

    // Charge le panier si l'utilisateur est connecté
    if (isAuth) {
      this.cartService.loadCart().subscribe({
        next: (cart: CartResponse) => {
          this.cartQuantity = cart.totalQuantity;
        },
        error: () => {
          // on ignore les 403 éventuels
        },
      });

      // 🔥 Charge aussi la wishlist pour le badge
      this.wishlistService.load().subscribe({
        next: (items: WishlistItemResponse[]) => {
          this.wishlistCount = items.length;
        },
        error: () => {
          // on ignore les erreurs ici
        },
      });
    }

    // Met à jour le badge du panier en live
    this.cart$.subscribe((cart) => {
      this.cartQuantity = cart ? cart.totalQuantity : 0;
    });

    // Met à jour le badge wishlist en live (quand on toggle ailleurs)
    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistCount = items.length;
    });
  }

  changeLang(lang: 'fr' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  isAuthPage(): boolean {
    return this.authService.isAuthPage();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // 🔥 nouvelle méthode pour le bouton cœur dans le header
  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  logout(): void {
    this.authService.logout();
  }
}
