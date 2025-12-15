import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';

  success = false;
  error = '';
  loading = false;

  constructor(private contactService: ContactService) {}

  onSubmit(): void {
    this.success = false;
    this.error = '';

    if (!this.name || !this.email || !this.message) {
      this.error = 'Veuillez compléter tous les champs.';
      return;
    }

    this.loading = true;

    this.contactService
      .send({
        name: this.name.trim(),
        email: this.email.trim(),
        message: this.message.trim(),
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.name = '';
          this.email = '';
          this.message = '';
          this.loading = false;
        },
        error: (err) => {
          console.error('Contact error:', err);
          this.error = "Erreur lors de l'envoi. Réessaie plus tard.";
          this.loading = false;
        },
      });
  }
}
