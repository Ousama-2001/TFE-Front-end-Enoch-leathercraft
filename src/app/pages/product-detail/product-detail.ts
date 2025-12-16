import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductReviewService, ProductReview } from '../../services/product-review.service';
import { WishlistService, WishlistItemResponse } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

type PromoStatus = 'NONE' | 'UPCOMING' | 'ACTIVE' | 'EXPIRED';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
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

  // =======================
  // ✅ CAROUSEL PREMIUM
  // =======================
  activeImageIndex = 0;

  // drag state
  isDragging = false;
  dragPointerId: number | null = null;
  dragStartX = 0;
  dragStartY = 0;
  dragStartOffset = 0;
  dragOffsetX = 0;
  isAnimating = false;

  // zoom modal
  zoomOpen = false;
  zoomScale = 1;
  zoomMin = 1;
  zoomMax = 4;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public productService: ProductService,
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
        this.dragOffsetX = 0;

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

  /* =========================================================
   ✅ PROMO HELPERS (affichage détail)
   ========================================================= */

  get effectivePrice(): number {
    if (!this.product) return 0;
    return this.productService.getEffectivePrice(this.product);
  }

  get discountPercent(): number {
    if (!this.product) return 0;
    return this.productService.getDiscountPercent(this.product);
  }

  get promoStatus(): PromoStatus {
    const p = this.product;
    if (!p) return 'NONE';

    const promo = typeof p.promoPrice === 'number' ? p.promoPrice : null;
    const start = p.promoStartAt ? new Date(p.promoStartAt).getTime() : null;
    const end = p.promoEndAt ? new Date(p.promoEndAt).getTime() : null;

    if (!promo || promo <= 0 || promo >= (p.price ?? 0)) return 'NONE';

    const now = Date.now();

    if (start != null && now < start) return 'UPCOMING';
    if (end != null && now > end) return 'EXPIRED';
    return 'ACTIVE';
  }

  get hasPromo(): boolean {
    return this.promoStatus !== 'NONE' && this.discountPercent > 0;
  }

  get promoStatusLabel(): string {
    switch (this.promoStatus) {
      case 'UPCOMING':
        return 'Promo bientôt disponible';
      case 'ACTIVE':
        return 'Promo en cours';
      case 'EXPIRED':
        return 'Promo expirée';
      default:
        return '';
    }
  }

  /* =======================
   ✅ helpers images
   ======================= */
  get images(): string[] {
    return this.product?.imageUrls ?? [];
  }

  get hasThumbs(): boolean {
    return this.images.length > 1;
  }

  get canSlide(): boolean {
    return this.images.length > 1;
  }

  get activeImageUrl(): string {
    if (!this.images.length) return 'assets/img/products/placeholder-bag.jpg';
    const idx = Math.min(Math.max(this.activeImageIndex, 0), this.images.length - 1);
    return 'http://localhost:8080' + this.images[idx];
  }

  private normalizeIndex(i: number): number {
    const n = this.images.length;
    if (!n) return 0;
    return (i % n + n) % n;
  }

  private animateTo(offset: number): void {
    this.isAnimating = true;
    this.dragOffsetX = offset;
    setTimeout(() => (this.isAnimating = false), 220);
  }

  private commitSlide(nextIndex: number, direction: 'next' | 'prev'): void {
    if (!this.canSlide) return;

    const w = this.getCarouselWidth();
    if (!w) {
      this.activeImageIndex = this.normalizeIndex(nextIndex);
      this.dragOffsetX = 0;
      return;
    }

    const out = direction === 'next' ? -w : w;
    this.animateTo(out);

    setTimeout(() => {
      this.activeImageIndex = this.normalizeIndex(nextIndex);
      this.isAnimating = true;
      this.dragOffsetX = 0;
      setTimeout(() => (this.isAnimating = false), 120);
    }, 200);
  }

  prevImage(): void {
    if (!this.canSlide) return;
    this.commitSlide(this.activeImageIndex - 1, 'prev');
  }

  nextImage(): void {
    if (!this.canSlide) return;
    this.commitSlide(this.activeImageIndex + 1, 'next');
  }

  setActiveImage(i: number): void {
    if (!this.images.length) return;
    if (i < 0 || i >= this.images.length) return;
    if (i === this.activeImageIndex) return;

    const direction: 'next' | 'prev' = i > this.activeImageIndex ? 'next' : 'prev';
    this.commitSlide(i, direction);
  }

  /* =======================
   ✅ drag / swipe (pointer)
   ======================= */
  onCarouselPointerDown(e: PointerEvent): void {
    if (!this.canSlide) return;
    if ((e as any).button === 2) return;

    this.isDragging = true;
    this.dragPointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartOffset = this.dragOffsetX;
    this.isAnimating = false;
  }

  onCarouselPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    if (this.dragPointerId !== null && e.pointerId !== this.dragPointerId) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) return;

    const w = this.getCarouselWidth() || 300;
    const raw = this.dragStartOffset + dx;

    const resistance = 0.35;
    const capped = Math.max(Math.min(raw, w * resistance), -w * resistance);
    this.dragOffsetX = capped;
  }

  onCarouselPointerUp(e: PointerEvent): void {
    if (!this.isDragging) return;
    if (this.dragPointerId !== null && e.pointerId !== this.dragPointerId) return;

    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    this.isDragging = false;
    this.dragPointerId = null;

    if (Math.abs(dy) > Math.abs(dx)) {
      this.animateTo(0);
      return;
    }

    const w = this.getCarouselWidth() || 300;
    const threshold = Math.min(120, w * 0.25);

    if (dx <= -threshold) {
      this.nextImage();
      return;
    }
    if (dx >= threshold) {
      this.prevImage();
      return;
    }

    this.animateTo(0);
  }

  onCarouselPointerCancel(): void {
    this.isDragging = false;
    this.dragPointerId = null;
    this.animateTo(0);
  }

  private getCarouselWidth(): number {
    const el = document.querySelector('.image-wrapper') as HTMLElement | null;
    return el ? el.clientWidth : 0;
  }

  // clavier
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.zoomOpen) {
      if (e.key === 'Escape') this.closeZoom();
      if (e.key === 'ArrowLeft') this.prevImage();
      if (e.key === 'ArrowRight') this.nextImage();
      if (e.key === '+' || e.key === '=') this.zoomIn();
      if (e.key === '-') this.zoomOut();
      return;
    }

    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowLeft') this.prevImage();
    if (e.key === 'ArrowRight') this.nextImage();
  }

  /* =======================
   ✅ zoom modal
   ======================= */
  openZoom(): void {
    if (!this.images.length) return;
    this.zoomOpen = true;
    this.zoomScale = 1;
    document.body.style.overflow = 'hidden';
  }

  closeZoom(): void {
    this.zoomOpen = false;
    this.zoomScale = 1;
    document.body.style.overflow = '';
  }

  zoomIn(): void {
    this.zoomScale = Math.min(this.zoomMax, Number((this.zoomScale + 0.25).toFixed(2)));
  }

  zoomOut(): void {
    this.zoomScale = Math.max(this.zoomMin, Number((this.zoomScale - 0.25).toFixed(2)));
  }

  resetZoom(): void {
    this.zoomScale = 1;
  }

  onZoomWheel(e: WheelEvent): void {
    if (!this.zoomOpen) return;
    e.preventDefault();
    if (e.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  onZoomBackdropClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('zoom-backdrop')) this.closeZoom();
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
      .updateReview(r.id, { rating: this.editRating, comment: this.editComment.trim() })
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
