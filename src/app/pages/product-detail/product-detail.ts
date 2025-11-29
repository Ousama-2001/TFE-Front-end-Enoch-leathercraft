import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import {
  ProductReviewService,
  ProductReview
} from '../../services/product-review.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  addedMessage = '';

  // --- stock / panier ---
  stockAvailable = 0;
  isOutOfStock = false;
  stockMessage = '';

  // --- avis ---
  reviews: ProductReview[] = [];
  reviewsLoading = false;
  reviewsError = '';

  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewError = '';
  reviewSuccessMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    private reviewService: ProductReviewService,
  ) {}

  ngOnInit(): void {
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

        // recharge le panier pour avoir les quantités à jour
        this.cartService.loadCart().subscribe();

        // charge les avis
        this.loadReviews(id);
      },
      error: (err) => {
        console.error('Erreur chargement produit', err);
        this.error = 'Produit introuvable.';
        this.loading = false;
      },
    });
  }

  // =================== NAVIGATION ===================
  goBack(): void {
    this.router.navigate(['/products']);
  }

  // =================== PANIER / STOCK ===================

  // quantité actuelle du produit dans le panier
  get quantity(): number {
    if (!this.product) return 0;
    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === this.product!.id,
    );
    return item ? item.quantity : 0;
  }

  // peut-on encore augmenter ?
  get canIncrease(): boolean {
    if (!this.product) return false;
    if (this.isOutOfStock) return false;
    return this.quantity < this.stockAvailable;
  }

  increase(): void {
    if (!this.product || !this.product.id) return;
    if (!this.canIncrease) {
      this.stockMessage = 'Stock insuffisant pour ajouter plus d’exemplaires.';
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      next: () => {
        this.stockMessage = '';
        this.cartService.loadCart().subscribe();
      },
      error: (err) => {
        console.error('Erreur ajout au panier', err);
      },
    });
  }

  decrease(): void {
    if (!this.product || !this.product.id) return;
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

  // =================== AVIS PRODUIT ===================

  private loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.reviewsError = '';

    this.reviewService.getForProduct(productId).subscribe({
      next: (list: ProductReview[]) => {
        this.reviews = list;
        this.reviewsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement avis', err);
        this.reviewsError = 'Impossible de charger les avis pour ce produit.';
        this.reviewsLoading = false;
      },
    });
  }

  submitReview(): void {
    if (!this.product || !this.product.id) {
      return;
    }

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
          this.reviewComment = '';
          this.reviewRating = 5;
          this.reviewSubmitting = false;
          this.reviewSuccessMsg = 'Merci pour votre avis !';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: (err) => {
          console.error('Erreur ajout avis', err);

          if (err.status === 401 || err.status === 403) {
            this.reviewError =
              'Vous devez être connecté pour laisser un avis.';
          } else {
            this.reviewError =
              'Impossible d’enregistrer votre avis. Réessayez plus tard.';
          }

          this.reviewSubmitting = false;
        },
      });
  }
}
