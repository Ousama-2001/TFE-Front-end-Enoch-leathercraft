import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd,
  RouterLink,
} from '@angular/router';
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
    // au démarrage : savoir si on est sur /login ou /register
    this.updateNavbarVisibility(this.router.url);

    // mettre à jour la navbar à chaque navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    // on récupère le panier dès que l'app démarre (si token présent)
    this.cart.loadCart().subscribe({
      error: () => {
        // silencieux : si pas connecté, pas grave
      },
    });
  }

  private updateNavbarVisibility(url: string): void {
    this.showNavbar = !(
      url.startsWith('/login') ||
      url.startsWith('/register')
    );
  }

  // Utilisé dans le template pour afficher / cacher le bouton Déconnexion
  get isLoggedIn(): boolean {
    // si ton AuthService expose déjà isAuthenticated(), on l’utilise
    if (typeof (this.auth as any).isAuthenticated === 'function') {
      return this.auth.isAuthenticated();
    }

    // sinon on se base sur la présence du token
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
