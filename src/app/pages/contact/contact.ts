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

  loading = false;
  success = false;
  error = '';

  constructor(private contactService: ContactService) {}

  onSubmit(): void {
    this.success = false;
    this.error = '';

    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
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
          this.loading = false;
          this.success = true;
          this.name = '';
          this.email = '';
          this.message = '';
        },
        error: (err) => {
          this.loading = false;
          if (err?.status === 429) {
            this.error = err.error || 'Veuillez attendre avant de réessayer.';
          } else {
            this.error = "Erreur lors de l’envoi. Réessaie plus tard.";
          }
        },
      });
  }
}
