import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  identifier = ''; // email OU pseudo
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    console.log('LOGIN submit', this.identifier, this.password); // debug

    if (!this.identifier || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.identifier, this.password).subscribe({
      next: (res) => {
        console.log('LOGIN success', res); // debug
        this.loading = false;
        this.auth.setSession(res);

        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        console.error('LOGIN error', err);
        this.loading = false;
        this.error = 'Identifiants incorrects.';
      },
    });
  }
}
