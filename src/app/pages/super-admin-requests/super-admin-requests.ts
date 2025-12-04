import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  SuperAdminRequestsService,
  ReactivationRequest,
} from '../../services/super-admin-requests.service';

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

  constructor(
    private requestsService: SuperAdminRequestsService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.requestsService.getAll().subscribe({
      next: (list) => {
        this.requests = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement demandes', err);
        this.error =
          'Impossible de charger les demandes de réactivation.';
        this.loading = false;
      },
    });
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

  toggleHandled(req: ReactivationRequest): void {
    const newValue = !req.handled;

    this.requestsService.updateHandled(req.id, newValue).subscribe({
      next: (updated) => {
        this.requests = this.requests.map((r) =>
          r.id === updated.id ? updated : r
        );
      },
      error: (err) => {
        console.error('Erreur update handled', err);
        this.error =
          "Impossible de mettre à jour l'état de cette demande.";
      },
    });
  }
}
