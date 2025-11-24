// src/app/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  emailOrUsername = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';

    if (!this.emailOrUsername || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    const payload: LoginRequest = {
      identifier: this.emailOrUsername.trim(), // 👈 correspond AU BACK
      password: this.password,
    };

    this.loading = true;

    this.auth.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          err.error ||
          'Identifiants invalides. Veuillez réessayer.';
        this.loading = false;
      },
    });
  }
}
