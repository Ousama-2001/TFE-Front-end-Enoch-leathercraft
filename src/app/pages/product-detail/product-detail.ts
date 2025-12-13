import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import {
  ProductReviewService,
  ProductReview,
} from '../../services/product-review.service';
import {
  WishlistService,
  WishlistItemResponse,
} from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  addedMessage = '';

  // ✅ message visiteur (action protégée)
  authWarning = '';

  // --- stock / panier ---
  stockAvailable = 0;
  isOutOfStock = false;
  stockMessage = '';

  // --- wishlist ---
  isInWishlist = false;
  wishlistLoading = false;

  // --- avis ---
  reviews: ProductReview[] = [];
  reviewsLoading = false;
  reviewsError = '';
  averageRating = 0;
  totalReviews = 0;

  // création avis
  isLoggedIn = false;
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewError = '';
  reviewSuccessMsg = '';

  // édition avis
  editingReviewId: number | null = null;
  editRating = 5;
  editComment = '';
  editSubmitting = false;

  // suppression
  deleteError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    private reviewService: ProductReviewService,
    private wishlistService: WishlistService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isAuthenticated();

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.error = 'Produit invalide.';
      return;
    }

    this.loading = true;

    this.productService.getOne(id).subscribe({
      next: (p: Product) => {
        this.product = p;
        this.stockAvailable = p.stockQuantity ?? 0;
        this.isOutOfStock = this.stockAvailable <= 0;
        this.loading = false;

        // panier
        this.cartService.loadCart().subscribe();

        // avis
        this.loadReviews(id);

        // wishlist
        if (this.isLoggedIn) {
          this.refreshWishlistStatus();
        }
      },
      error: (err: unknown) => {
        console.error('Erreur chargement produit', err);
        this.error = 'Produit introuvable.';
        this.loading = false;
      },
    });
  }

  // =================== HELPER LOGIN ===================

  private requireLoginOrRedirect(): boolean {
    if (this.auth.isAuthenticated()) return true;

    this.authWarning =
      'Vous devez être connecté ou inscrit pour effectuer cette action.';
    setTimeout(() => {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      this.authWarning = '';
    }, 1200);

    return false;
  }

  // =================== NAVIGATION ===================

  goBack(): void {
    this.router.navigate(['/products']);
  }

  // =================== PANIER / STOCK ===================

  get quantity(): number {
    if (!this.product) return 0;
    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === this.product!.id
    );
    return item ? item.quantity : 0;
  }

  get canIncrease(): boolean {
    if (!this.product) return false;
    if (this.isOutOfStock) return false;
    return this.quantity < this.stockAvailable;
  }

  increase(): void {
    if (!this.product || !this.product.id) return;

    if (!this.requireLoginOrRedirect()) return;

    if (!this.canIncrease) {
      this.stockMessage = 'Stock insuffisant pour ajouter plus d’exemplaires.';
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      next: () => {
        this.stockMessage = '';
        this.cartService.loadCart().subscribe();
      },
      error: (err: unknown) => {
        console.error('Erreur ajout au panier', err);
      },
    });
  }

  decrease(): void {
    if (!this.product || !this.product.id) return;

    if (!this.requireLoginOrRedirect()) return;

    if (this.quantity <= 0) return;

    if (this.quantity === 1) {
      this.cartService.removeItem(this.product.id).subscribe({
        next: () => this.cartService.loadCart().subscribe(),
      });
    } else {
      this.cartService
        .updateQuantity(this.product.id, this.quantity - 1)
        .subscribe({
          next: () => this.cartService.loadCart().subscribe(),
        });
    }

    this.stockMessage = '';
  }

  addToCart(): void {
    if (!this.product || !this.product.id) return;

    if (!this.requireLoginOrRedirect()) return;

    if (!this.canIncrease) {
      this.stockMessage = 'Stock insuffisant pour ajouter plus d’exemplaires.';
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        this.addedMessage = 'Produit ajouté au panier ✔';
        this.stockMessage = '';

        const btn = document.querySelector('.btn-cart-animated');
        btn?.classList.add('added');

        setTimeout(() => {
          btn?.classList.remove('added');
          this.addedMessage = '';
        }, 1500);
      },
      error: () => {
        this.addedMessage = "Erreur lors de l'ajout au panier";
        setTimeout(() => (this.addedMessage = ''), 2000);
      },
    });
  }

  // =================== WISHLIST ===================

  private refreshWishlistStatus(): void {
    if (!this.product || !this.product.id) return;
    this.wishlistLoading = true;

    this.wishlistService.load().subscribe({
      next: (items: WishlistItemResponse[]) => {
        this.isInWishlist = items.some(
          (it) => it.product && it.product.id === this.product!.id
        );
        this.wishlistLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement wishlist', err);
        this.wishlistLoading = false;
      },
    });
  }

  toggleWishlist(): void {
    if (!this.product || !this.product.id) return;

    if (!this.requireLoginOrRedirect()) return;

    this.wishlistService.toggle(this.product.id).subscribe({
      next: (items: WishlistItemResponse[]) => {
        this.isInWishlist = items.some(
          (it) => it.product && it.product.id === this.product!.id
        );
      },
      error: (err) => {
        console.error('Erreur toggle wishlist', err);
      },
    });
  }

  // =================== AVIS PRODUIT ===================

  private recomputeAverage(): void {
    if (!this.reviews.length) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.totalReviews = this.reviews.length;
    this.averageRating = sum / this.totalReviews;
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating || 0);
  }

  private loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.reviewsError = '';

    this.reviewService.getForProduct(productId).subscribe({
      next: (list: ProductReview[]) => {
        this.reviews = list;
        this.reviewsLoading = false;
        this.recomputeAverage();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement avis', err);
        this.reviewsError = 'Impossible de charger les avis pour ce produit.';
        this.reviewsLoading = false;
      },
    });
  }

  submitReview(): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!this.product || !this.product.id) return;

    if (!this.reviewComment.trim()) {
      this.reviewError = 'Veuillez entrer un commentaire.';
      return;
    }

    this.reviewError = '';
    this.reviewSubmitting = true;

    this.reviewService
      .addReview({
        productId: this.product.id,
        rating: this.reviewRating,
        comment: this.reviewComment.trim(),
      })
      .subscribe({
        next: (created: ProductReview) => {
          this.reviews = [created, ...this.reviews];
          this.recomputeAverage();

          this.reviewComment = '';
          this.reviewRating = 5;
          this.reviewSubmitting = false;
          this.reviewSuccessMsg = 'Merci pour votre avis !';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: (err: unknown) => {
          console.error('Erreur ajout avis', err);
          this.reviewError =
            'Impossible d’enregistrer votre avis. Réessayez plus tard.';
          this.reviewSubmitting = false;
        },
      });
  }

  startEdit(review: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!review.mine) return;

    this.editingReviewId = review.id;
    this.editRating = review.rating;
    this.editComment = review.comment;
    this.editSubmitting = false;
    this.deleteError = '';
    this.reviewError = '';
    this.reviewSuccessMsg = '';
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editRating = 5;
    this.editComment = '';
    this.editSubmitting = false;
  }

  submitEdit(review: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!this.product || !this.product.id || !review.mine) return;

    if (!this.editComment.trim()) {
      this.reviewError = 'Veuillez entrer un commentaire.';
      return;
    }

    this.editSubmitting = true;
    this.reviewError = '';
    this.reviewSuccessMsg = '';

    this.reviewService
      .updateReview(review.id, {
        rating: this.editRating,
        comment: this.editComment.trim(),
      })
      .subscribe({
        next: (updated: ProductReview) => {
          this.reviews = this.reviews.map((r) =>
            r.id === updated.id ? updated : r
          );
          this.recomputeAverage();
          this.editSubmitting = false;
          this.cancelEdit();
          this.reviewSuccessMsg = 'Votre avis a été mis à jour.';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: (err: unknown) => {
          console.error('Erreur mise à jour avis', err);
          this.reviewError = 'Impossible de mettre à jour votre avis.';
          this.editSubmitting = false;
        },
      });
  }

  deleteReview(review: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!review.mine) return;
    if (!confirm('Supprimer cet avis ?')) return;

    this.deleteError = '';
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.recomputeAverage();
        if (this.editingReviewId === review.id) {
          this.cancelEdit();
        }
      },
      error: (err: unknown) => {
        console.error('Erreur suppression avis', err);
        this.deleteError = 'Impossible de supprimer cet avis.';
      },
    });
  }
}
