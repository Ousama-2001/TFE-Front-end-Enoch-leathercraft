// src/app/pages/account-page/account-page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Profile, UserOrder } from '../../services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';  // ⭐ import RouterModule

type AccountTab = 'overview' | 'profile' | 'address' | 'orders' | 'security';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    RouterModule           // ⭐ pour que routerLink fonctionne
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
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
        this.error = 'Impossible de charger le profil.';
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
        this.success = 'Profil mis à jour.';
        this.savingProfile = false;
      },
      error: () => {
        this.error = 'Erreur lors de la sauvegarde.';
        this.savingProfile = false;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.accountService.getMyOrders().subscribe({
      next: (orders) => {
        this.myOrders = orders;
        this.computeTotalSpent();
        this.loadingOrders = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos commandes.';
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
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.changingPassword = true;

    this.accountService.changePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (msg: string) => {
        this.success = msg && msg.trim().length ? msg : 'Mot de passe mis à jour.';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.changingPassword = false;
      },
      error: (err: HttpErrorResponse) => {
        if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Erreur lors du changement de mot de passe.';
        }
        this.changingPassword = false;
      }
    });
  }

  deleteAccount(): void {
    if (!confirm('Voulez-vous vraiment supprimer votre compte ?')) {
      return;
    }

    this.accountService.deleteMyAccount().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Impossible de supprimer le compte.';
      }
    });
  }
}
