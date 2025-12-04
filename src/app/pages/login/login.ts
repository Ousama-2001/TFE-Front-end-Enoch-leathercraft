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

  // erreur pour la partie "login"
  error = '';

  // Compte supprimé → bloc de réactivation
  deletedAccount = false;
  reactivateEmail = '';
  reactivateMessage = '';

  // erreur spécifique pour la partie "réactivation"
  reactivationError = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.reactivationError = '';
    this.deletedAccount = false;

    if (!this.emailOrUsername || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    const payload: LoginRequest = {
      identifier: this.emailOrUsername.trim(),
      password: this.password,
    };

    this.loading = true;

    this.auth.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;

        const code = err?.error?.message || err?.error;

        switch (code) {
          case 'ACCOUNT_DELETED':
            this.deletedAccount = true;
            this.reactivateEmail = this.emailOrUsername.trim();
            this.error =
              'Votre compte est désactivé. Vous pouvez demander une réactivation en confirmant votre email.';
            break;
          case 'BAD_CREDENTIALS':
            this.error = 'Email/pseudo ou mot de passe incorrect.';
            break;
          case 'IDENTIFIER_REQUIRED':
            this.error = 'Veuillez entrer votre email ou votre pseudo.';
            break;
          case 'EMAIL_REQUIRED':
            this.error = 'Email requis.';
            break;
          case 'REQUEST_ALREADY_EXISTS':
            this.deletedAccount = true;
            this.error =
              'Vous avez déjà envoyé une demande de réactivation pour cet email.';
            break;
          default:
            this.error = 'Identifiants invalides. Veuillez réessayer.';
        }
      },
    });
  }

  requestReactivation(): void {
    this.reactivationError = '';

    if (!this.reactivateEmail || !this.reactivateEmail.includes('@')) {
      this.reactivationError =
        'Veuillez indiquer un email valide pour la réactivation.';
      return;
    }

    this.loading = true;

    this.auth
      .requestReactivation(
        this.reactivateEmail.trim(),
        this.reactivateMessage.trim()
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.deletedAccount = false;
          this.reactivationError = '';
          this.error = '';
          alert(
            "Votre demande de réactivation a été envoyée.\nUn super administrateur examinera votre compte."
          );
        },
        error: (err) => {
          this.loading = false;
          const code = err?.error?.message || err?.error;

          if (err.status === 409 || code === 'REQUEST_ALREADY_EXISTS') {
            this.reactivationError =
              'Vous avez déjà envoyé une demande de réactivation pour cet email.';
            this.deletedAccount = true;
          } else {
            this.reactivationError =
              "Impossible d'envoyer la demande de réactivation pour le moment.";
          }
        },
      });
  }
}
