import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],   // 🔥 NgIf vient d'ici
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  showNavbar = true;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    // état initial au démarrage
    this.updateNavbarVisibility(this.router.url);

    // mise à jour à chaque changement de route
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
}
