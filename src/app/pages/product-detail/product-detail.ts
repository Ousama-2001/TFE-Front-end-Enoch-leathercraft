import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductReviewService, ProductReview } from '../../services/product-review.service';
import { WishlistService, WishlistItemResponse } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

type SlideDir = 'left' | 'right';

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

  // messages
  addedMessage = '';
  authWarning = '';

  // stock / panier
  stockAvailable = 0;
  isOutOfStock = false;
  stockMessage = '';

  // wishlist
  isInWishlist = false;

  // avis
  reviews: ProductReview[] = [];
  reviewsLoading = false;
  reviewsError = '';
  averageRating = 0;
  totalReviews = 0;

  isLoggedIn = false;
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewError = '';
  reviewSuccessMsg = '';

  editingReviewId: number | null = null;
  editRating = 5;
  editComment = '';
  editSubmitting = false;

  // galerie
  activeImageIndex = 0;

  // animation slide
  imageAnimClass: '' | 'slide-left' | 'slide-right' = '';

  // swipe / drag
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragPointerId: number | null = null;

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

    const id = Number(this.route.snapshot.paramMap.get('id'));
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

        this.activeImageIndex = 0;

        this.cartService.loadCart().subscribe();
        this.loadReviews(id);
        if (this.isLoggedIn) this.refreshWishlistStatus();

        this.loading = false;
      },
      error: () => {
        this.error = 'Produit introuvable.';
        this.loading = false;
      },
    });
  }

  /* ================== GALERIE ================== */

  get images(): string[] {
    return this.product?.imageUrls ?? [];
  }

  get hasThumbs(): boolean {
    return this.images.length > 1;
  }

  get activeImageUrl(): string {
    if (!this.images.length) return 'assets/img/products/placeholder-bag.jpg';
    const idx = Math.min(Math.max(this.activeImageIndex, 0), this.images.length - 1);
    return 'http://localhost:8080' + this.images[idx];
  }

  private triggerSlideAnim(dir: SlideDir): void {
    this.imageAnimClass = dir === 'left' ? 'slide-left' : 'slide-right';
    // reset pour permettre de rejouer l'anim même si on change vite
    setTimeout(() => (this.imageAnimClass = ''), 220);
  }

  prevImage(): void {
    if (this.images.length <= 1) return;
    this.triggerSlideAnim('right'); // l'image arrive de la gauche visuellement => on simule inverse
    this.activeImageIndex = (this.activeImageIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage(): void {
    if (this.images.length <= 1) return;
    this.triggerSlideAnim('left');
    this.activeImageIndex = (this.activeImageIndex + 1) % this.images.length;
  }

  setActiveImage(i: number): void {
    if (!this.images.length) return;
    if (i < 0 || i >= this.images.length) return;
    const dir: SlideDir = i > this.activeImageIndex ? 'left' : 'right';
    this.triggerSlideAnim(dir);
    this.activeImageIndex = i;
  }

  // clavier (quand tu es sur la page)
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    // évite de voler les flèches quand tu tapes dans un textarea/select/input
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowLeft') this.prevImage();
    if (e.key === 'ArrowRight') this.nextImage();
  }

  // swipe / drag (pointer events -> souris + touch)
  onPointerDown(e: PointerEvent): void {
    if (this.images.length <= 1) return;
    this.dragging = true;
    this.dragPointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return;
    if (this.dragPointerId !== null && e.pointerId !== this.dragPointerId) return;
    // on ne fait rien en live (simple + fluide), on décide au release
  }

  onPointerUp(e: PointerEvent): void {
    if (!this.dragging) return;
    if (this.dragPointerId !== null && e.pointerId !== this.dragPointerId) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    this.dragging = false;
    this.dragPointerId = null;

    // si geste vertical (scroll) -> ignore
    if (Math.abs(dy) > Math.abs(dx)) return;

    // seuil swipe
    const TH = 50;
    if (dx > TH) this.prevImage();
    if (dx < -TH) this.nextImage();
  }

  onPointerCancel(): void {
    this.dragging = false;
    this.dragPointerId = null;
  }

  /* ================== LOGIN ================== */

  private requireLoginOrRedirect(): boolean {
    if (this.auth.isAuthenticated()) return true;

    this.authWarning = 'Vous devez être connecté pour effectuer cette action.';
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      this.authWarning = '';
    }, 1200);

    return false;
  }

  goBack(): void {
    // si tu veux un vrai retour historique : this.router.navigateByUrl('/products') est ok
    this.router.navigate(['/products']);
  }

  /* ================== PANIER ================== */

  get quantity(): number {
    const item = this.cartService.items.find((i: CartItem) => i.productId === this.product?.id);
    return item ? item.quantity : 0;
  }

  get canIncrease(): boolean {
    if (!this.product) return false;
    if (this.isOutOfStock) return false;
    return this.quantity < this.stockAvailable;
  }

  increase(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;

    if (!this.canIncrease) {
      this.stockMessage = 'Stock insuffisant pour ajouter plus d’exemplaires.';
      return;
    }

    this.cartService.addProduct(this.product.id!, 1).subscribe({
      next: () => {
        this.stockMessage = '';
        this.cartService.loadCart().subscribe();
      },
      error: () => {
        this.stockMessage = "Erreur lors de l'ajout au panier.";
      },
    });
  }

  decrease(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;
    if (this.quantity <= 0) return;

    if (this.quantity === 1) {
      this.cartService.removeItem(this.product.id!).subscribe({
        next: () => this.cartService.loadCart().subscribe(),
      });
    } else {
      this.cartService.updateQuantity(this.product.id!, this.quantity - 1).subscribe({
        next: () => this.cartService.loadCart().subscribe(),
      });
    }

    this.stockMessage = '';
  }

  addToCart(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;

    if (!this.canIncrease) {
      this.stockMessage = 'Stock insuffisant pour ajouter plus d’exemplaires.';
      return;
    }

    this.cartService.addProduct(this.product.id!, 1).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        this.addedMessage = 'Produit ajouté ✔';
        this.stockMessage = '';
        setTimeout(() => (this.addedMessage = ''), 1500);
      },
      error: () => {
        this.addedMessage = "Erreur lors de l'ajout";
        setTimeout(() => (this.addedMessage = ''), 1500);
      },
    });
  }

  /* ================== WISHLIST ================== */

  private refreshWishlistStatus(): void {
    this.wishlistService.load().subscribe((items: WishlistItemResponse[]) => {
      this.isInWishlist = items.some((i) => i.product?.id === this.product?.id);
    });
  }

  toggleWishlist(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;

    this.wishlistService.toggle(this.product.id!).subscribe((items: WishlistItemResponse[]) => {
      this.isInWishlist = items.some((i) => i.product?.id === this.product?.id);
    });
  }

  /* ================== AVIS ================== */

  private recomputeAverage(): void {
    if (!this.reviews.length) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }
    this.totalReviews = this.reviews.length;
    this.averageRating = this.reviews.reduce((a, r) => a + r.rating, 0) / this.totalReviews;
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
        this.recomputeAverage();
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsError = 'Impossible de charger les avis.';
        this.reviewsLoading = false;
      },
    });
  }

  submitReview(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;

    if (!this.reviewComment.trim()) {
      this.reviewError = 'Veuillez entrer un commentaire.';
      return;
    }

    this.reviewError = '';
    this.reviewSubmitting = true;

    this.reviewService
      .addReview({
        productId: this.product.id!,
        rating: this.reviewRating,
        comment: this.reviewComment.trim(),
      })
      .subscribe({
        next: (r: ProductReview) => {
          this.reviews.unshift(r);
          this.recomputeAverage();
          this.reviewComment = '';
          this.reviewRating = 5;
          this.reviewSubmitting = false;
          this.reviewSuccessMsg = 'Merci pour votre avis !';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: () => {
          this.reviewSubmitting = false;
          this.reviewError = "Impossible d’enregistrer votre avis.";
        },
      });
  }

  startEdit(r: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!r.mine) return;

    this.editingReviewId = r.id;
    this.editRating = r.rating;
    this.editComment = r.comment;
    this.reviewError = '';
    this.reviewSuccessMsg = '';
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editSubmitting = false;
  }

  submitEdit(r: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!r.mine) return;

    if (!this.editComment.trim()) {
      this.reviewError = 'Veuillez entrer un commentaire.';
      return;
    }

    this.editSubmitting = true;

    this.reviewService
      .updateReview(r.id, {
        rating: this.editRating,
        comment: this.editComment.trim(),
      })
      .subscribe({
        next: (updated: ProductReview) => {
          this.reviews = this.reviews.map((x) => (x.id === updated.id ? updated : x));
          this.cancelEdit();
          this.recomputeAverage();
          this.reviewSuccessMsg = 'Votre avis a été mis à jour.';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: () => {
          this.editSubmitting = false;
          this.reviewError = "Impossible de mettre à jour votre avis.";
        },
      });
  }

  deleteReview(r: ProductReview): void {
    if (!this.requireLoginOrRedirect()) return;
    if (!r.mine) return;
    if (!confirm('Supprimer cet avis ?')) return;

    this.reviewService.deleteReview(r.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((x) => x.id !== r.id);
        this.recomputeAverage();
        if (this.editingReviewId === r.id) this.cancelEdit();
      },
      error: () => {
        this.reviewError = 'Impossible de supprimer cet avis.';
      },
    });
  }
}
