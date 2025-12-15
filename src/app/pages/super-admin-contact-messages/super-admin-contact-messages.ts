import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SuperAdminContactMessagesService, ContactMessageAdmin } from '../../services/super-admin-contact-messages.service';

@Component({
  selector: 'app-super-admin-contact-messages',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './super-admin-contact-messages.html',
  styleUrls: ['./super-admin-contact-messages.scss'],
})
export class SuperAdminContactMessagesComponent implements OnInit {

  messages: ContactMessageAdmin[] = [];
  loading = false;
  error: string | null = null;

  constructor(private service: SuperAdminContactMessagesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.service.getAll().subscribe({
      next: data => {
        this.messages = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les messages.';
        this.loading = false;
      }
    });
  }

  toggleHandled(msg: ContactMessageAdmin): void {
    this.service.updateHandled(msg.id, !msg.handled).subscribe({
      next: updated => {
        this.messages = this.messages.map(m =>
          m.id === updated.id ? updated : m
        );
      }
    });
  }
}
