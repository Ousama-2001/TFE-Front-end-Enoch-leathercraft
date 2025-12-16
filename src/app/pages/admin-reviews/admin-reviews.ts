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
  // 'ALL' n'est pas un ReviewStatus, c'est juste pour le front
  filterStatus: 'ALL' | ReviewStatus = 'ALL';
  searchTerm: string = '';

  constructor(private reviewService: AdminReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    // Si le filtre est 'ALL', on envoie undefined au service pour qu'il ne filtre pas par statut
    const statusParam = this.filterStatus === 'ALL' ? undefined : this.filterStatus;

    this.reviewService.search({ status: statusParam }).subscribe({
      next: (data) => {
        // Tri par date décroissante (plus récent en haut)
        this.reviews = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger les avis.';
        this.loading = false;
      }
    });
  }

  // Filtrage local pour la recherche textuelle uniquement
  // (Le filtrage par statut est déjà fait via l'API dans loadReviews,
  // mais on peut le refaire ici si on veut éviter de rappeler le serveur à chaque clic sur les boutons filtres)
  get filteredReviews() {
    let list = this.reviews;

    // Si on change le filtre localement sans recharger l'API (optionnel, sinon appeler loadReviews() au changement)
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

  // Action: Rendre visible (équivalent à Approuver/Restaurer)
  makeVisible(id: number): void {
    this.updateStatus(id, 'VISIBLE');
  }

  // Action: Supprimer (équivalent à Rejeter/Masquer)
  deleteReview(id: number): void {
    if(!confirm("Masquer cet avis du site public ?")) return;
    this.updateStatus(id, 'DELETED');
  }

  private updateStatus(id: number, status: ReviewStatus): void {
    this.reviewService.changeStatus(id, status).subscribe({
      next: (updatedReview) => {
        // Mise à jour locale
        this.reviews = this.reviews.map(r => r.id === updatedReview.id ? updatedReview : r);
      },
      error: () => alert("Erreur lors de la mise à jour.")
    });
  }

  // Méthode pour recharger lors du clic sur les filtres
  setFilter(status: 'ALL' | ReviewStatus) {
    this.filterStatus = status;
    // Option 1 : Filtrage local immédiat (rapide) -> ne rien faire d'autre
    // Option 2 : Recharger depuis le serveur (plus sûr si pagination) -> this.loadReviews();
  }
}
