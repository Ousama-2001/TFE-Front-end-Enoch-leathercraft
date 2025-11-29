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
      // correspond au champ `identifier` du AuthRequest côté back
      identifier: this.emailOrUsername.trim(),
      password: this.password,
    };

    this.loading = true;

    this.auth.login(payload).subscribe({
      next: () => {
        this.loading = false;
        // ✅ redirection vers la home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        const code = err?.error?.message || err?.error;

        switch (code) {
          case 'BAD_CREDENTIALS':
            this.error = 'Email/pseudo ou mot de passe incorrect.';
            break;
          case 'IDENTIFIER_REQUIRED':
            this.error = 'Veuillez entrer votre email ou votre pseudo.';
            break;
          case 'EMAIL_REQUIRED':
            this.error = 'Email requis.';
            break;
          default:
            this.error =
              'Identifiants invalides. Veuillez réessayer.';
        }

        this.loading = false;
      },
    });
  }
}
