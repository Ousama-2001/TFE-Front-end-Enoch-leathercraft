import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav style="padding:12px;background:#181818;border-bottom:1px solid #2a2a2a">
      <a routerLink="/register" style="margin-right:12px;color:#e3ded3">Register</a>
      <a routerLink="/products" style="color:#e3ded3">Products</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
