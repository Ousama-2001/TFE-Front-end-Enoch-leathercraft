// src/app/pages/super-admin-requests/super-admin-requests.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SuperAdminRequestsService,
  AdminRequest,
  RequestStatus
} from '../../services/super-admin-requests.service';

@Component({
  selector: 'app-super-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './super-admin-requests.html',
  styleUrls: ['./super-admin-requests.scss']
})
export class SuperAdminRequestsPageComponent implements OnInit {

  requests: AdminRequest[] = [];
  loading = false;
  error = '';

  // filtre courant pour la liste
  filterStatus: 'ALL' | RequestStatus = 'PENDING';

  constructor(private requestsService: SuperAdminRequestsService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.requestsService.getAll().subscribe({
      next: (data: AdminRequest[]) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement demandes', err);
        this.error = 'Impossible de charger les demandes pour le moment.';
        this.loading = false;
      }
    });
  }

  // ---------- GETTERS pour les compteurs ----------

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'PENDING').length;
  }

  get inProgressCount(): number {
    return this.requests.filter(r => r.status === 'IN_PROGRESS').length;
  }

  get resolvedCount(): number {
    return this.requests.filter(r => r.status === 'RESOLVED').length;
  }

  // Liste filtrée pour l’affichage
  get filteredRequests(): AdminRequest[] {
    if (this.filterStatus === 'ALL') {
      return this.requests;
    }
    return this.requests.filter(r => r.status === this.filterStatus);
  }

  // ---------- Actions sur les demandes ----------

  setFilterStatus(status: 'ALL' | RequestStatus): void {
    this.filterStatus = status;
  }

  markInProgress(req: AdminRequest): void {
    if (!req.id) return;

    this.requestsService.markInProgress(req.id).subscribe({
      next: (updated: AdminRequest) => {
        this.requests = this.requests.map(r => r.id === updated.id ? updated : r);
      },
      error: (err: any) => {
        console.error('Erreur mise en cours', err);
        alert("Impossible de marquer cette demande comme 'en cours'.");
      }
    });
  }

  markResolved(req: AdminRequest): void {
    if (!req.id) return;

    this.requestsService.markResolved(req.id).subscribe({
      next: (updated: AdminRequest) => {
        this.requests = this.requests.map(r => r.id === updated.id ? updated : r);
      },
      error: (err: any) => {
        console.error('Erreur résolution', err);
        alert("Impossible de marquer cette demande comme résolue.");
      }
    });
  }
}
