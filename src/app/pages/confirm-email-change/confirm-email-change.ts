import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';

type State = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-confirm-email-change',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-email-change.html',
  styleUrls: ['./confirm-email-change.scss'],
})
export class ConfirmEmailChangeComponent implements OnInit {
  state: State = 'loading';
  message = '';
  token = '';

  // ✅ affiche un bouton "Se reconnecter"
  showRelogin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      this.message = 'Token manquant.';
      return;
    }

    this.token = token;

    this.accountService.confirmEmailChange({ token }).subscribe({
      next: () => {
        this.state = 'success';
        this.message =
          '✅ Ton email a bien été confirmé. Pour des raisons de sécurité, tu dois te reconnecter.';
        this.showRelogin = true;

        // ✅ logout direct (nettoie token + role) + redirection vers login
        // On garde un petit delay pour que l’utilisateur lise le message
        setTimeout(() => {
          this.auth.logout(); // redirige déjà vers /login chez toi
          // Si jamais tu veux forcer :
          // this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err: any) => {
        this.state = 'error';
        const code = err?.error;

        if (code === 'TOKEN_EXPIRED') {
          this.message = '⏳ Ce lien a expiré. Refais une demande de changement d’email.';
        } else if (code === 'TOKEN_INVALID') {
          this.message = '❌ Lien invalide.';
        } else if (code === 'EMAIL_ALREADY_USED') {
          this.message = '❌ Cet email est déjà utilisé.';
        } else {
          this.message = "❌ Impossible de confirmer l’email. Réessaie.";
        }
      },
    });
  }

  relogin(): void {
    this.auth.logout(); // redirige vers /login
  }

  goAccount(): void {
    this.router.navigate(['/profile']);
  }
}
