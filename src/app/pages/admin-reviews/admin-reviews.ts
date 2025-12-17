import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReviewsService, AdminReview, ReviewStatus } from '../../services/admin-reviews.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-reviews.html',
  styleUrls: ['./admin-reviews.scss']
})
export class AdminReviewsPageComponent implements OnInit {

  reviews: AdminReview[] = [];
  loading = false;
  error = '';

  // Filtres
  filterStatus: 'ALL' | ReviewStatus = 'ALL';
  searchTerm: string = '';

  // ✅ Pagination
  pageSize = 12; // ajuste si tu veux (8/12/16…)
  page = 1;

  constructor(private reviewService: AdminReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    const statusParam = this.filterStatus === 'ALL' ? undefined : this.filterStatus;

    this.reviewService.search({ status: statusParam }).subscribe({
      next: (data) => {
        // Tri par date décroissante
        this.reviews = (data ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;

        // ✅ reset page si besoin
        this.page = 1;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger les avis.';
        this.loading = false;
      }
    });
  }

  // Filtrage local (statut + recherche)
  get filteredReviews() {
    let list = this.reviews;

    if (this.filterStatus !== 'ALL') {
      list = list.filter(r => r.status === this.filterStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(r =>
        (r.authorName && r.authorName.toLowerCase().includes(term)) ||
        (r.productName && r.productName.toLowerCase().includes(term)) ||
        (r.userEmail && r.userEmail.toLowerCase().includes(term)) ||
        (r.comment && r.comment.toLowerCase().includes(term))
      );
    }

    return list;
  }

  // ✅ Pagination calculée
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReviews.length / this.pageSize));
  }

  get paginatedReviews(): AdminReview[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredReviews.slice(start, start + this.pageSize);
  }

  changePage(delta: number): void {
    this.page = Math.max(1, Math.min(this.totalPages, this.page + delta));
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
  }

  // Action: Visible
  makeVisible(id: number): void {
    this.updateStatus(id, 'VISIBLE');
  }

  // Action: Supprimer (Masquer)
  deleteReview(id: number): void {
    if (!confirm("Masquer cet avis du site public ?")) return;
    this.updateStatus(id, 'DELETED');
  }

  private updateStatus(id: number, status: ReviewStatus): void {
    this.reviewService.changeStatus(id, status).subscribe({
      next: (updatedReview) => {
        this.reviews = this.reviews.map(r => r.id === updatedReview.id ? updatedReview : r);

        // ✅ si la page devient vide après update, on recule d’une page
        if (this.paginatedReviews.length === 0 && this.page > 1) {
          this.page--;
        }
      },
      error: () => alert("Erreur lors de la mise à jour.")
    });
  }

  setFilter(status: 'ALL' | ReviewStatus) {
    this.filterStatus = status;
    this.page = 1; // ✅ important
    // Optionnel: si tu veux recharger depuis le serveur à chaque filtre
    // this.loadReviews();
  }
}
