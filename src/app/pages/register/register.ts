// src/app/pages/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  username = '';

  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.auth
      .register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.auth.setSession(res);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Register error', err);

          if (err.status === 409 && err.error?.message === 'EMAIL_ALREADY_USED') {
            this.error = 'Cet email est déjà utilisé.';
          } else if (err.status === 409 && err.error?.message === 'USERNAME_ALREADY_USED') {
            this.error = 'Ce pseudo est déjà utilisé.';
          } else {
            this.error = "Inscription impossible.";
          }
        },
      });
  }
}
