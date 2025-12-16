import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
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
  imports: [CommonModule, CurrencyPipe, DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';

  // messages feedback
  addedMessage = '';
  authWarning = '';

  // stock
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

  // Formulaire Nouvel avis
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewError = '';
  reviewSuccessMsg = '';

  // Edition avis
  editingReviewId: number | null = null;
  editRating = 5;
  editComment = '';
  editSubmitting = false;

  // =======================
  // ✅ CAROUSEL
  // =======================
  activeImageIndex = 0;
  isDragging = false;
  dragPointerId: number | null = null;
  dragStartX = 0;
  dragStartY = 0;
  dragStartOffset = 0;
  dragOffsetX = 0;
  isAnimating = false;

  // Zoom
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

        // Charger infos annexes
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
   PROMO HELPERS
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
    const promo = p.promoPrice;
    if (!promo || promo <= 0 || promo >= (p.price ?? 0)) return 'NONE';

    const now = Date.now();
    const start = p.promoStartAt ? new Date(p.promoStartAt).getTime() : null;
    const end = p.promoEndAt ? new Date(p.promoEndAt).getTime() : null;

    if (start != null && now < start) return 'UPCOMING';
    if (end != null && now > end) return 'EXPIRED';
    return 'ACTIVE';
  }

  get hasPromo(): boolean {
    return this.promoStatus === 'ACTIVE';
  }

  get promoStatusLabel(): string {
    switch (this.promoStatus) {
      case 'UPCOMING': return 'Promo bientôt disponible';
      case 'ACTIVE': return 'Promo en cours';
      case 'EXPIRED': return 'Promo expirée';
      default: return '';
    }
  }

  /* =======================
   CAROUSEL IMAGES
   ======================= */
  get images(): string[] {
    return this.product?.imageUrls ?? [];
  }
  get hasThumbs(): boolean { return this.images.length > 1; }
  get canSlide(): boolean { return this.images.length > 1; }

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

  prevImage(): void { if (this.canSlide) this.commitSlide(this.activeImageIndex - 1, 'prev'); }
  nextImage(): void { if (this.canSlide) this.commitSlide(this.activeImageIndex + 1, 'next'); }

  setActiveImage(i: number): void {
    if (!this.images.length || i === this.activeImageIndex) return;
    const direction = i > this.activeImageIndex ? 'next' : 'prev';
    this.commitSlide(i, direction);
  }

  /* =======================
   DRAG / SWIPE
   ======================= */
  onCarouselPointerDown(e: PointerEvent): void {
    if (!this.canSlide || (e as any).button === 2) return;
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
    // Résistance aux bords
    const capped = Math.max(Math.min(raw, w * 0.35), -w * 0.35);
    this.dragOffsetX = capped;
  }

  onCarouselPointerUp(e: PointerEvent): void {
    if (!this.isDragging) return;
    if (this.dragPointerId !== null && e.pointerId !== this.dragPointerId) return;
    const dx = e.clientX - this.dragStartX;
    this.isDragging = false;
    this.dragPointerId = null;

    const w = this.getCarouselWidth() || 300;
    const threshold = Math.min(100, w * 0.25);

    if (dx <= -threshold) this.nextImage();
    else if (dx >= threshold) this.prevImage();
    else this.animateTo(0);
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

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.zoomOpen) {
      if (e.key === 'Escape') this.closeZoom();
      if (e.key === '+' || e.key === '=') this.zoomIn();
      if (e.key === '-') this.zoomOut();
      return;
    }
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowLeft') this.prevImage();
    if (e.key === 'ArrowRight') this.nextImage();
  }

  /* =======================
   ZOOM
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
  zoomIn(): void { this.zoomScale = Math.min(this.zoomMax, Number((this.zoomScale + 0.25).toFixed(2))); }
  zoomOut(): void { this.zoomScale = Math.max(this.zoomMin, Number((this.zoomScale - 0.25).toFixed(2))); }
  resetZoom(): void { this.zoomScale = 1; }
  onZoomWheel(e: WheelEvent): void {
    if (!this.zoomOpen) return;
    e.preventDefault();
    if (e.deltaY < 0) this.zoomIn(); else this.zoomOut();
  }

  /* ================== ACTIONS (Auth Check) ================== */
  private requireLoginOrRedirect(): boolean {
    if (this.auth.isAuthenticated()) return true;
    this.authWarning = 'Connectez-vous pour effectuer cette action.';
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      this.authWarning = '';
    }, 1200);
    return false;
  }

  goBack(): void { this.router.navigate(['/products']); }

  /* ================== PANIER ================== */
  get quantity(): number {
    const item = this.cartService.items.find((i: CartItem) => i.productId === this.product?.id);
    return item ? item.quantity : 0;
  }
  get canIncrease(): boolean {
    if (!this.product || this.isOutOfStock) return false;
    return this.quantity < this.stockAvailable;
  }

  increase(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;
    if (!this.canIncrease) { this.stockMessage = 'Stock insuffisant.'; return; }
    this.cartService.addProduct(this.product.id!, 1).subscribe({
      next: () => { this.stockMessage = ''; this.cartService.loadCart().subscribe(); },
      error: () => { this.stockMessage = "Erreur d'ajout."; },
    });
  }

  decrease(): void {
    if (!this.requireLoginOrRedirect() || !this.product || this.quantity <= 0) return;
    if (this.quantity === 1) {
      this.cartService.removeItem(this.product.id!).subscribe({ next: () => this.cartService.loadCart().subscribe() });
    } else {
      this.cartService.updateQuantity(this.product.id!, this.quantity - 1).subscribe({ next: () => this.cartService.loadCart().subscribe() });
    }
    this.stockMessage = '';
  }

  addToCart(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;
    if (!this.canIncrease) { this.stockMessage = 'Stock insuffisant.'; return; }
    this.cartService.addProduct(this.product.id!, 1).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        this.addedMessage = 'Produit ajouté ✔';
        setTimeout(() => (this.addedMessage = ''), 1500);
      },
      error: () => this.addedMessage = "Erreur d'ajout",
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
    // Calcul basé uniquement sur les avis visibles pour l'affichage global
    // Mais ici 'reviews' contient aussi les DELETED de l'user courant.
    // Idéalement, on ne compte que les VISIBLE pour la moyenne.
    const visibleReviews = this.reviews.filter(r => r.status === 'VISIBLE');
    if (!visibleReviews.length) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }
    this.totalReviews = visibleReviews.length;
    this.averageRating = visibleReviews.reduce((a, r) => a + r.rating, 0) / this.totalReviews;
  }

  get roundedAverage(): number { return Math.round(this.averageRating || 0); }

  private loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.reviewService.getForProduct(productId).subscribe({
      next: (list: ProductReview[]) => {
        this.reviews = list;
        this.recomputeAverage();
        this.reviewsLoading = false;
      },
      error: () => { this.reviewsError = 'Erreur chargement avis.'; this.reviewsLoading = false; },
    });
  }

  submitReview(): void {
    if (!this.requireLoginOrRedirect() || !this.product) return;
    if (!this.reviewComment.trim()) { this.reviewError = 'Commentaire requis.'; return; }

    this.reviewSubmitting = true;
    this.reviewService.addReview({ productId: this.product.id!, rating: this.reviewRating, comment: this.reviewComment.trim() })
      .subscribe({
        next: (r) => {
          this.reviews.unshift(r);
          this.recomputeAverage();
          this.reviewComment = '';
          this.reviewRating = 5;
          this.reviewSubmitting = false;
          this.reviewSuccessMsg = 'Avis publié !';
          setTimeout(() => (this.reviewSuccessMsg = ''), 2000);
        },
        error: () => { this.reviewSubmitting = false; this.reviewError = "Erreur envoi."; },
      });
  }

  startEdit(r: ProductReview): void {
    if (!this.requireLoginOrRedirect() || !r.mine) return;
    this.editingReviewId = r.id;
    this.editRating = r.rating;
    this.editComment = r.comment;
  }

  cancelEdit(): void { this.editingReviewId = null; this.editSubmitting = false; }

  submitEdit(r: ProductReview): void {
    if (!this.requireLoginOrRedirect() || !r.mine) return;
    if (!this.editComment.trim()) return;

    this.editSubmitting = true;
    this.reviewService.updateReview(r.id, { rating: this.editRating, comment: this.editComment.trim() })
      .subscribe({
        next: (u) => {
          this.reviews = this.reviews.map((x) => (x.id === u.id ? u : x));
          this.cancelEdit();
          this.recomputeAverage();
        },
        error: () => { this.editSubmitting = false; },
      });
  }

  deleteReview(r: ProductReview): void {
    if (!this.requireLoginOrRedirect() || !r.mine) return;
    if (!confirm('Supprimer cet avis ?')) return;

    this.reviewService.deleteReview(r.id).subscribe({
      next: () => {
        // En front, soit on le retire, soit on le marque DELETED.
        // Le back le marque DELETED. Pour l'UI instantanée :
        // Option A: On le retire de la liste
        // this.reviews = this.reviews.filter((x) => x.id !== r.id);

        // Option B: On le marque DELETED pour voir l'alerte tout de suite
        const idx = this.reviews.findIndex(x => x.id === r.id);
        if(idx !== -1) {
          this.reviews[idx].status = 'DELETED';
        }

        this.recomputeAverage();
        if (this.editingReviewId === r.id) this.cancelEdit();
      },
      error: () => { this.reviewError = 'Erreur suppression.'; },
    });
  }
}
