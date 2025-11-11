import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  firstName = '';
  lastName  = '';
  username  = '';
  email     = '';
  password  = '';
  loading   = false;
  error     = '';

  constructor(private auth: AuthService) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.register({
      firstName: this.firstName,
      lastName:  this.lastName,
      username:  this.username,
      email:     this.email,
      password:  this.password
    }).subscribe({
      next: () => (this.loading = false),
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message || 'Erreur';
      },
    });
  }
}
