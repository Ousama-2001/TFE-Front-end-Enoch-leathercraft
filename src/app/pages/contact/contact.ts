import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '../../pipes/translate.pipe';

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

  onSubmit(): void {
    if (!this.name || !this.email || !this.message) {
      this.success = false;
      return;
    }

    // Pour l’instant, on simule juste l’envoi
    console.log('Contact form:', {
      name: this.name,
      email: this.email,
      message: this.message,
    });

    this.success = true;
    this.message = '';
  }
}
