// src/app/pages/register/register.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest, LoginResponse } from '../../services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error';

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

  returnUrl: string | null = null;

  // ✅ regex front (guidage utilisateur)
  readonly usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
  readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  readonly strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

  usernameAvailability: Availability = 'idle';
  emailAvailability: Availability = 'idle';

  private username$ = new Subject<string>();
  private email$ = new Subject<string>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.getSafeReturnUrl());
      return;
    }

    this.returnUrl = this.getSafeReturnUrlRaw();

    this.username$
      .pipe(debounceTime(450), distinctUntilChanged())
      .subscribe((value) => this.checkUsername(value));

    this.email$
      .pipe(debounceTime(450), distinctUntilChanged())
      .subscribe((value) => this.checkEmail(value));
  }

  onUsernameInput(value: string) {
    this.username = value;
    this.usernameAvailability = 'idle';

    const v = value.trim();
    if (!v || !this.usernameRegex.test(v)) return;

    this.usernameAvailability = 'checking';
    this.username$.next(v);
  }

  onEmailInput(value: string) {
    this.email = value;
    this.emailAvailability = 'idle';

    const v = value.trim().toLowerCase();
    if (!v || !this.emailRegex.test(v)) return;

    this.emailAvailability = 'checking';
    this.email$.next(v);
  }

  private checkUsername(value: string) {
    this.auth.isUsernameAvailable(value).subscribe({
      next: (res) => (this.usernameAvailability = res.available ? 'available' : 'taken'),
      error: () => (this.usernameAvailability = 'error'),
    });
  }

  private checkEmail(value: string) {
    this.auth.isEmailAvailable(value).subscribe({
      next: (res) => (this.emailAvailability = res.available ? 'available' : 'taken'),
      error: () => (this.emailAvailability = 'error'),
    });
  }

  private getSafeReturnUrlRaw(): string | null {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!raw) return null;
    if (!raw.startsWith('/')) return null;
    return raw;
  }

  private getSafeReturnUrl(): string {
    return this.getSafeReturnUrlRaw() || '/home';
  }

  private normalizeBeforeSubmit() {
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
    this.username = this.username.trim();
    this.email = this.email.trim().toLowerCase();
  }

  onSubmit(form: NgForm): void {
    this.error = '';
    this.submitted = true;

    this.normalizeBeforeSubmit();

    if (!form.valid) {
      this.error = 'Corrige les champs en rouge.';
      return;
    }

    if (!this.acceptTerms) {
      this.error = "Tu dois accepter les Conditions Générales pour t'inscrire.";
      return;
    }

    if (this.usernameAvailability === 'taken') {
      this.error = 'Ce pseudo est déjà utilisé.';
      return;
    }
    if (this.emailAvailability === 'taken') {
      this.error = 'Cet email est déjà utilisé.';
      return;
    }

    const payload: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      password: this.password,
      acceptTerms: this.acceptTerms,
    };

    this.auth.register(payload).subscribe({
      next: (res: LoginResponse) => {
        if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }
        this.router.navigateByUrl(this.getSafeReturnUrl());
      },
      error: (err: any) => {
        const code = err?.error; // chez toi souvent c'est une string genre "EMAIL_ALREADY_USED"
        if (code === 'EMAIL_ALREADY_USED') {
          this.emailAvailability = 'taken';
          this.error = 'Cet email est déjà utilisé.';
          return;
        }
        if (code === 'USERNAME_ALREADY_USED') {
          this.usernameAvailability = 'taken';
          this.error = 'Ce pseudo est déjà utilisé.';
          return;
        }
        if (code === 'WEAK_PASSWORD') {
          this.error = 'Mot de passe trop faible.';
          return;
        }
        this.error = "Inscription impossible. Vérifie les données.";
      },
    });
  }
}
