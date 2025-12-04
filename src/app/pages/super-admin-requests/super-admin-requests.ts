import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  SuperAdminRequestsService,
  ReactivationRequest,
} from '../../services/super-admin-requests.service';

type FilterMode = 'PENDING' | 'HANDLED' | 'ALL';

@Component({
  selector: 'app-super-admin-requests',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './super-admin-requests.html',
  styleUrls: ['./super-admin-requests.scss'],
})
export class SuperAdminRequestsPageComponent implements OnInit {
  requests: ReactivationRequest[] = [];
  loading = false;
  error = '';

  filter: FilterMode = 'PENDING';

  // pour le modal de message
  selected: ReactivationRequest | null = null;

  constructor(private requestsService: SuperAdminRequestsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.requestsService.getAll().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les demandes pour le moment.';
      },
    });
  }

  setFilter(mode: FilterMode): void {
    this.filter = mode;
  }

  get totalCount(): number {
    return this.requests.length;
  }

  get pendingCount(): number {
    return this.requests.filter((r) => !r.handled).length;
  }

  get handledCount(): number {
    return this.requests.filter((r) => r.handled).length;
  }

  get filteredRequests(): ReactivationRequest[] {
    switch (this.filter) {
      case 'PENDING':
        return this.requests.filter((r) => !r.handled);
      case 'HANDLED':
        return this.requests.filter((r) => r.handled);
      default:
        return this.requests;
    }
  }

  toggleHandled(req: ReactivationRequest): void {
    const newValue = !req.handled;
    const label = newValue ? 'traitée' : 'en attente';

    if (!confirm(`Marquer la demande de ${req.email} comme ${label} ?`)) {
      return;
    }

    this.requestsService.updateHandled(req.id, newValue).subscribe({
      next: (updated) => {
        this.requests = this.requests.map((r) =>
          r.id === updated.id ? updated : r
        );
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour de la demande.';
      },
    });
  }

  // --------- modal message ---------
  openMessage(req: ReactivationRequest): void {
    this.selected = req;
  }

  closeMessage(): void {
    this.selected = null;
  }
}
