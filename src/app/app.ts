import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  showNavbar = true;
  showMiniCart = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    public cart: CartService
  ) {
    this.updateNavbarVisibility(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    this.cart.loadCart().subscribe();
  }

  private updateNavbarVisibility(url: string): void {
    this.showNavbar = !(
      url.startsWith('/login') ||
      url.startsWith('/register')
    );
  }

  // 🔥 Correction : méthode compatible 100% avec ton AuthService actuel
  get isLoggedIn(): boolean {
    // si ton AuthService a déjà une méthode → on l'utilise
    if (typeof (this.auth as any).isAuthenticated === 'function') {
      return this.auth.isAuthenticated();
    }

    // sinon → fallback sur token localStorage
    return !!localStorage.getItem('token');
  }

  onLogout(): void {
    this.auth.logout();
  }

  onCartEnter(): void {
    this.showMiniCart = true;
  }

  onCartLeave(): void {
    this.showMiniCart = false;
  }
}
