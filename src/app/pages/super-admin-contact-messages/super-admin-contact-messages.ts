import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  SuperAdminContactMessagesService,
  ContactMessageAdmin
} from '../../services/super-admin-contact-messages.service';

type SupportFilter = 'pending' | 'handled' | 'all';

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

  filter: SupportFilter = 'pending';

  constructor(private service: SuperAdminContactMessagesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.service.getAll().subscribe({
      next: data => {
        this.messages = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les messages.';
        this.loading = false;
      }
    });
  }

  setFilter(f: SupportFilter): void {
    this.filter = f;
  }

  // ✅ tri du plus récent au plus ancien
  private sortByDateDesc(list: ContactMessageAdmin[]): ContactMessageAdmin[] {
    return [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return db - da;
    });
  }

  get pendingCount(): number {
    return this.messages.filter(m => !m.handled).length;
  }

  get handledCount(): number {
    return this.messages.filter(m => m.handled).length;
  }

  get totalCount(): number {
    return this.messages.length;
  }

  get filteredMessages(): ContactMessageAdmin[] {
    let list = this.messages;

    if (this.filter === 'pending') {
      list = list.filter(m => !m.handled);
    } else if (this.filter === 'handled') {
      list = list.filter(m => m.handled);
    }

    return this.sortByDateDesc(list);
  }

  toggleHandled(msg: ContactMessageAdmin): void {
    this.service.updateHandled(msg.id, !msg.handled).subscribe({
      next: updated => {
        this.messages = this.messages.map(m => m.id === updated.id ? updated : m);
      }
    });
  }
}
