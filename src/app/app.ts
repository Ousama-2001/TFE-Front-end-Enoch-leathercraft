// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService, CartResponse } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe   // 👉 important pour pouvoir utiliser | t dans le template
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

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // langue actuelle
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    // Charge le panier si l'utilisateur est connecté
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

  changeLang(lang: 'fr' | 'en'): void {
    this.languageService.setLanguage(lang);
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
