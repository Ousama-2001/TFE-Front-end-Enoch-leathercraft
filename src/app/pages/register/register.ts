import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AuthService,
  RegisterRequest,
  LoginResponse,
} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit {
  firstName = '';
  lastName = '';
  username = '';
  email = '';
  password = '';

  acceptTerms = false;
  submitted = false;

  error = '';

  // ✅ pour queryParams login
  returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // si déjà connecté → on ne reste pas sur register
    if (this.auth.isAuthenticated()) {
      const safe = this.getSafeReturnUrl();
      this.router.navigateByUrl(safe);
      return;
    }

    this.returnUrl = this.getSafeReturnUrlRaw();
  }

  private getSafeReturnUrlRaw(): string | null {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!raw) return null;
    if (!raw.startsWith('/')) return null; // sécurité
    return raw;
  }

  private getSafeReturnUrl(): string {
    return this.getSafeReturnUrlRaw() || '/home';
  }

  onSubmit(): void {
    this.error = '';
    this.submitted = true;

    if (!this.acceptTerms) {
      this.error = "Tu dois accepter les Conditions Générales pour t'inscrire.";
      return;
    }

    const payload: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.auth.register(payload).subscribe({
      next: (res: LoginResponse) => {
        // ✅ admin -> admin
        if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }

        // ✅ sinon returnUrl ou home
        this.router.navigateByUrl(this.getSafeReturnUrl());
      },
      error: (err: any) => {
        console.error('REGISTER error', err);
        this.error = "Inscription impossible. Vérifie les données.";
      },
    });
  }
}
