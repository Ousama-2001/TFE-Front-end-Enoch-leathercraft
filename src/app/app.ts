import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [
    CommonModule,   // fournit *ngIf, *ngFor, etc.
    RouterOutlet,   // <router-outlet>
    RouterLink      // routerLink / routerLinkActive
  ],
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  // On cache la navbar sur login / register / admin
  isHiddenRoute(): boolean {
    const url = this.router.url;
    return (
      url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/admin')
    );
  }

  onLogout(): void {
    this.auth.logout();
  }
}
