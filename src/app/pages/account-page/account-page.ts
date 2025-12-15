// src/app/pages/account-page/account-page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Profile, UserOrder } from '../../services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import {TranslatePipe} from '../../pipes/translate.pipe';

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
        // ✅ si ton API renvoie pas trié : on force du plus récent au plus ancien
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
        // si ton backend renvoie déjà un message propre, sinon fallback i18n
        this.success = (msg && msg.trim().length)
          ? msg
          : this.tr('account.success.passwordUpdated');

        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.changingPassword = false;
      },
      error: (err: HttpErrorResponse) => {
        // si backend renvoie une string (souvent déjà en FR), on garde. sinon fallback i18n
        if (typeof err.error === 'string' && err.error.trim().length) {
          this.error = err.error;
        } else {
          this.error = this.tr('account.error.changePassword');
        }
        this.changingPassword = false;
      }
    });
  }

  deleteAccount(): void {
    if (!confirm(this.tr('account.confirm.delete'))) {
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
