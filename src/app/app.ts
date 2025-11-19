import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
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

  private updateNavbarVisibility(url: string): void {
    this.showNavbar = !(
      url.startsWith('/login') ||
      url.startsWith('/register')
    );
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
