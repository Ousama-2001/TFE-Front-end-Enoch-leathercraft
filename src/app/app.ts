import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Observable } from 'rxjs';

import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageService } from './services/language.service';
import { WishlistService, WishlistItemResponse } from './services/wishlist.service';

// ✅ Cookie banner
import { CookieBannerComponent } from './pages/cookie-banner/cookie-banner';
import { CookieConsentService } from './services/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    CookieBannerComponent,
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

  // ✅ message visiteur (cart)
  authWarning = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private wishlistService: WishlistService,
    private cookieConsent: CookieConsentService // ✅ important
  ) {
    this.cart$ = this.cartService.cart$;
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    // ✅ cookies: recharge selon user courant (guest ou connecté)
    this.cookieConsent.reloadForCurrentUser();

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
        next: (items: WishlistItemResponse[]) =>
          (this.wishlistCount = items.length),
        error: () => {},
      });
    } else {
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

  // ✅ panier protégé : si guest clique -> message + redirect
  goToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.authWarning =
        'Vous devez être connecté ou inscrit pour accéder au panier.';
      setTimeout(() => {
        // ✅ returnUrl = /cart (logique)
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
        this.authWarning = '';
      }, 1200);
      return;
    }

    this.router.navigate(['/cart']);
  }

  goToWishlist(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/wishlist' },
      });
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  logout(): void {
    this.authService.logout();

    // ✅ badges à 0
    this.cartQuantity = 0;
    this.wishlistCount = 0;

    // ✅ cookies: on repasse en "guest"
    this.cookieConsent.reloadForCurrentUser();

    this.router.navigate(['/home']);
  }
}
