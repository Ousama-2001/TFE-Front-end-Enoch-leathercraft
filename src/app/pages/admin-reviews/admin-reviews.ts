// src/app/pages/admin-reviews/admin-reviews.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminReviewsService,
  AdminReview,
  ReviewStatus,
} from '../../services/admin-reviews.service';

type StatusFilter = ReviewStatus | 'ALL';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-reviews.html',
  styleUrls: ['./admin-reviews.scss'],
})
export class AdminReviewsPageComponent implements OnInit {

  reviews: AdminReview[] = [];
  loading = false;
  error = '';

  // Filtres
  statusFilter: StatusFilter = 'ALL';
  productIdFilter: number | null = null;
  customerFilter = '';

  // ID d'avis sur lequel on est en train d'agir (pour désactiver les boutons)
  actionId: number | null = null;

  // Constantes pour les statuts (évite les erreurs de types dans le template)
  readonly statuses: Record<'VISIBLE' | 'HIDDEN' | 'DELETED', ReviewStatus> = {
    VISIBLE: 'VISIBLE',
    HIDDEN: 'HIDDEN',
    DELETED: 'DELETED',
  };

  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL',     label: 'Tous' },
    { value: 'VISIBLE', label: 'Visible' },
    { value: 'HIDDEN',  label: 'Masqué' },
    { value: 'DELETED', label: 'Supprimé' },
  ];

  constructor(private reviewService: AdminReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    const statusParam =
      this.statusFilter === 'ALL' ? undefined : this.statusFilter;

    this.reviewService
      .search({
        status: statusParam,
        productId: this.productIdFilter,
        email: this.customerFilter,
      })
      .subscribe({
        next: (data) => {
          this.reviews = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Impossible de charger les avis.';
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    this.loadReviews();
  }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.productIdFilter = null;
    this.customerFilter = '';
    this.loadReviews();
  }

  // Changer statut (VISIBLE / HIDDEN / DELETED)
  changeStatus(review: AdminReview, status: ReviewStatus): void {
    if (this.actionId !== null) return;

    this.actionId = review.id;

    this.reviewService.changeStatus(review.id, status).subscribe({
      next: (updated) => {
        // on met à jour la ligne dans le tableau
        const idx = this.reviews.findIndex(r => r.id === updated.id);
        if (idx !== -1) {
          this.reviews[idx] = updated;
        }
        this.actionId = null;
      },
      error: () => {
        alert("Erreur lors de la mise à jour du statut.");
        this.actionId = null;
      },
    });
  }

  // CSS du badge
  badgeClass(status: ReviewStatus): string {
    switch (status) {
      case 'VISIBLE': return 'status-pill status-visible';
      case 'HIDDEN':  return 'status-pill status-hidden';
      case 'DELETED': return 'status-pill status-deleted';
      default:        return 'status-pill';
    }
  }

  // petites étoiles jolies
  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
