import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  identifier = '';
  password = '';
  error = '';
  loading = false;              // 👈 AJOUT

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;        // 👈 on bloque le bouton

    this.auth
      .login({
        identifier: this.identifier,
        password: this.password,
      })
      .subscribe({
        next: (res: LoginResponse) => {
          console.log('LOGIN success', res);
          this.loading = false; // 👈 on réactive le bouton

          if (res.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/products']);
          }
        },
        error: (err: any) => {
          console.error('LOGIN error', err);
          this.error = 'Identifiants incorrects.';
          this.loading = false; // 👈 on réactive aussi en cas d’erreur
        },
      });
  }
}
