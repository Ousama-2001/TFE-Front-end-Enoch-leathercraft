// src/app/pages/admin-reviews/admin-reviews.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminReviewsService,
  AdminReview,
  ReviewStatus,
} from '../../services/admin-reviews.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reviews.html',
  styleUrls: ['./admin-reviews.scss'],
})
export class AdminReviewsPageComponent implements OnInit {
  reviews: AdminReview[] = [];
  loading = false;
  error = '';

  // filtres
  statusFilter: ReviewStatus | '' = '';
  productIdFilter: number | null = null;
  emailFilter = '';

  // pour désactiver les boutons pendant un changement de statut
  updatingId: number | null = null;

  constructor(private adminReviewsService: AdminReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    this.adminReviewsService
      .search({
        status: this.statusFilter,
        productId: this.productIdFilter,
        email: this.emailFilter,
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
    this.statusFilter = '';
    this.productIdFilter = null;
    this.emailFilter = '';
    this.loadReviews();
  }

  changeStatus(review: AdminReview, status: ReviewStatus): void {
    if (this.updatingId !== null) return;

    this.updatingId = review.id;

    this.adminReviewsService.changeStatus(review.id, status).subscribe({
      next: (updated) => {
        // on met à jour la ligne dans le tableau
        const idx = this.reviews.findIndex((r) => r.id === review.id);
        if (idx !== -1) {
          this.reviews[idx] = updated;
        }
        this.updatingId = null;
      },
      error: () => {
        alert("Erreur lors de la mise à jour de l'avis.");
        this.updatingId = null;
      },
    });
  }

  badgeClass(status: ReviewStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'badge badge-approved';
      case 'REJECTED':
        return 'badge badge-rejected';
      case 'DELETED':
        return 'badge badge-deleted';
      case 'PENDING':
      default:
        return 'badge badge-pending';
    }
  }
}
