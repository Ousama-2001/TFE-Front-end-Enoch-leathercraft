import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  email = '';
  success = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService) {}

  submit(): void {
    this.error = '';
    this.success = '';

    if (!this.email.trim()) {
      this.error = 'Veuillez entrer votre adresse email.';
      return;
    }

    this.loading = true;

    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.success = 'Si un compte existe, un email de réinitialisation a été envoyé.';
        this.loading = false;
      },
      error: () => {
        this.success = 'Si un compte existe, un email de réinitialisation a été envoyé.';
        this.loading = false;
      }
    });
  }
}
