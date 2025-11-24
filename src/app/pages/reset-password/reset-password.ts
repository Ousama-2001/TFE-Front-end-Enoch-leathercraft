import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {

  token = '';
  newPassword = '';
  confirmPassword = '';

  error = '';
  success = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Lien de réinitialisation invalide.';
    }
  }

  submit(): void {
    this.error = '';
    this.success = '';

    if (!this.token) {
      this.error = 'Lien de réinitialisation invalide.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.success = 'Mot de passe réinitialisé avec succès.';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error || 'Lien invalide ou expiré.';
        this.loading = false;
      }
    });
  }
}
