// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { Observable, filter } from 'rxjs';

import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageService } from './services/language.service';
import { WishlistService, WishlistItemResponse } from './services/wishlist.service';

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

  // ✅ FIX : déclaré ici, assigné dans constructor
  timeLeftMs$!: Observable<number>;

  currentLang: 'fr' | 'en' = 'fr';
  wishlistCount = 0;

  authWarning = '';
  mobileNavOpen = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private wishlistService: WishlistService,
    private cookieConsent: CookieConsentService
  ) {
    this.cart$ = this.cartService.cart$;
    this.timeLeftMs$ = this.cartService.timeLeftMs$; // ✅ plus rouge
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.cookieConsent.reloadForCurrentUser();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileNavOpen = false;
        this.miniCartOpen = false;
      });

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

  // ✅ format timer pour navbar
  formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  changeLang(lang: 'fr' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  isAuthPage(): boolean {
    return this.authService.isAuthPage();
  }

  goToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.authWarning =
        'Vous devez être connecté ou inscrit pour accéder au panier.';
      setTimeout(() => {
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

    this.cartQuantity = 0;
    this.wishlistCount = 0;

    this.cookieConsent.reloadForCurrentUser();

    this.router.navigate(['/home']);
  }
}
