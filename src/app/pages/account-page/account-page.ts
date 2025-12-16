import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Profile, UserOrder } from '../../services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

type AccountTab = 'overview' | 'profile' | 'address' | 'orders' | 'security';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    RouterModule,
    TranslatePipe
  ],
  templateUrl: './account-page.html',
  styleUrls: ['./account-page.scss']
})
export class AccountPageComponent implements OnInit {

  activeTab: AccountTab = 'overview';

  profile: Profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    postalCode: '',
    city: '',
    country: ''
  };

  myOrders: UserOrder[] = [];
  totalSpent = 0;

  loadingProfile = false;
  loadingOrders = false;
  savingProfile = false;
  changingPassword = false;

  error = '';
  success = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  // ✅ CHANGEMENT EMAIL
  newEmail = '';
  emailCurrentPassword = '';
  requestingEmailChange = false;
  emailChangeInfo = '';

  constructor(
    private accountService: AccountService,
    private router: Router,
    private lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
  }

  private tr(key: string): string {
    return this.lang.t(key);
  }

  switchTab(tab: AccountTab): void {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
    this.emailChangeInfo = '';
  }

  loadProfile(): void {
    this.loadingProfile = true;

    this.accountService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loadingProfile = false;
      },
      error: () => {
        this.error = this.tr('account.error.loadProfile');
        this.loadingProfile = false;
      }
    });
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.error = '';
    this.success = '';

    this.accountService.updateProfile(this.profile).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.success = this.tr('account.success.profileUpdated');
        this.savingProfile = false;
      },
      error: () => {
        this.error = this.tr('account.error.saveProfile');
        this.savingProfile = false;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;

    this.accountService.getMyOrders().subscribe({
      next: (orders) => {
        this.myOrders = [...orders].sort((a, b) => {
          const da = new Date(a.createdAt as any).getTime();
          const db = new Date(b.createdAt as any).getTime();
          return db - da;
        });

        this.computeTotalSpent();
        this.loadingOrders = false;
      },
      error: () => {
        this.error = this.tr('account.error.loadOrders');
        this.loadingOrders = false;
      }
    });
  }

  private computeTotalSpent(): void {
    this.totalSpent = this.myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  submitPasswordChange(): void {
    this.error = '';
    this.success = '';
    this.emailChangeInfo = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.error = this.tr('account.error.requiredFields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = this.tr('account.error.passwordMismatch');
      return;
    }

    this.changingPassword = true;

    this.accountService.changePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (msg: string) => {
        this.success = (msg && msg.trim().length)
          ? msg
          : this.tr('account.success.passwordUpdated');

        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.changingPassword = false;
      },
      error: (err: HttpErrorResponse) => {
        if (typeof err.error === 'string' && err.error.trim().length) {
          this.error = err.error;
        } else {
          this.error = this.tr('account.error.changePassword');
        }
        this.changingPassword = false;
      }
    });
  }

  submitEmailChangeRequest(): void {
    this.error = '';
    this.success = '';
    this.emailChangeInfo = '';

    const email = (this.newEmail || '').trim().toLowerCase();
    const pwd = this.emailCurrentPassword || '';

    if (!email || !pwd) {
      this.error = this.tr('account.error.requiredFields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      this.error = 'Email invalide.';
      return;
    }

    this.requestingEmailChange = true;

    this.accountService.requestEmailChange({ newEmail: email, currentPassword: pwd }).subscribe({
      next: () => {
        this.emailChangeInfo = 'Un lien de confirmation a été envoyé sur le nouvel email. Clique dessus pour valider le changement.';
        this.newEmail = '';
        this.emailCurrentPassword = '';
        this.requestingEmailChange = false;
      },
      error: (err: HttpErrorResponse) => {
        const code = err?.error;

        if (code === 'EMAIL_ALREADY_USED') {
          this.error = 'Cet email est déjà utilisé.';
        } else if (code === 'EMAIL_INVALID') {
          this.error = 'Email invalide.';
        } else if (code === 'BAD_PASSWORD') {
          this.error = 'Mot de passe incorrect.';
        } else if (code === 'EMAIL_SAME_AS_CURRENT') {
          this.error = 'C’est déjà ton email actuel.';
        } else if (code === 'PASSWORD_REQUIRED') {
          this.error = 'Mot de passe requis.';
        } else if (code === 'EMAIL_REQUIRED') {
          this.error = 'Email requis.';
        } else {
          this.error = "Impossible d'envoyer le lien. Réessaie.";
        }

        this.requestingEmailChange = false;
      }
    });
  }

  // ✅ MODIFICATION ICI : Message personnalisé pour les 30 jours
  deleteAccount(): void {
    const message = "Êtes-vous sûr de vouloir supprimer votre compte ?\n\nAttention : Votre compte sera désactivé immédiatement et TOTALEMENT supprimé après 30 jours.";

    if (!confirm(message)) {
      return;
    }

    this.accountService.deleteMyAccount().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = this.tr('account.error.deleteAccount');
      }
    });
  }

  getOrderStatusLabel(status: string): string {
    return this.tr(`order.status.${status}`);
  }
}
