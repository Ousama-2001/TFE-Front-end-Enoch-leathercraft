// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageService } from './services/language.service';
import { WishlistService, WishlistItemResponse } from './services/wishlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
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

  // ✅ pour afficher guest / connecté dans la navbar
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    const isAuth = this.authService.isAuthenticated();

    if (isAuth) {
      this.cartService.loadCart().subscribe({
        next: (cart: CartResponse) => (this.cartQuantity = cart.totalQuantity),
        error: () => {},
      });

      this.wishlistService.load().subscribe({
        next: (items: WishlistItemResponse[]) => (this.wishlistCount = items.length),
        error: () => {},
      });
    } else {
      // guest -> badges à 0
      this.cartQuantity = 0;
      this.wishlistCount = 0;
    }

    this.cart$.subscribe((cart) => {
      this.cartQuantity = cart ? cart.totalQuantity : 0;
    });

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

  // ✅ wishlist protégée même via bouton
  goToWishlist(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  logout(): void {
    this.authService.logout();
    this.cartQuantity = 0;
    this.wishlistCount = 0;
    this.router.navigate(['/home']);
  }
}
