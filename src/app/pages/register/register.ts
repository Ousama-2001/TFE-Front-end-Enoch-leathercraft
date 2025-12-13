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

  // ✅ CGV
  acceptTerms = false;
  submitted = false;

  error = '';

  // ✅ pour ton register.html (queryParams)
  returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
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
        // ✅ admin -> admin, sinon returnUrl ou home
        if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.returnUrl || '/home');
        }
      },
      error: (err: any) => {
        console.error('REGISTER error', err);
        this.error = "Inscription impossible. Vérifie les données.";
      },
    });
  }
}
