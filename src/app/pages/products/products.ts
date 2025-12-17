import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import { WishlistService, WishlistItemResponse } from '../../services/wishlist.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule, TranslatePipe],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  error = '';

  page = 1;
  pageSize = 8;

  searchTerm = '';
  selectedSegment = '';
  selectedCategory = '';
  priceMin: number | null = null;
  priceMax: number | null = null;
  sortBy = '';
  showPromosOnly = false;

  wishlistProductIds = new Set<number>();
  wishlistLoading = false;
  isLoggedIn = false;
  skeletonItems = Array(8).fill(0);
  authWarning = '';

  constructor(
    public productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.isLoggedIn = this.auth.isAuthenticated();

    this.route.queryParams.subscribe((params) => {
      this.selectedSegment = params['segment'] || '';
      this.selectedCategory = params['category'] || '';
      this.searchTerm = params['search'] || '';
      this.sortBy = params['sort'] || this.sortBy || '';
      if (params['promo'] === 'true') this.showPromosOnly = true;
      if (this.products.length > 0) this.applyFilters();
    });

    this.productService.getAll().subscribe({
      next: (list) => {
        this.products = list;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });

    this.cartService.loadCart().subscribe({ error: () => {} });

    if (this.isLoggedIn) this.loadWishlist();

    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistProductIds = new Set(
        items.filter((it) => !!it.product?.id).map((it) => it.product.id)
      );
    });
  }

  preventNegative(event: any): void {
    const input = event.target;
    if (input.value < 0) {
      input.value = 0;
      if (input.placeholder === 'Min') this.priceMin = 0;
      if (input.placeholder === 'Max') this.priceMax = 0;
    }
  }

  private requireLoginOrRedirect(): boolean {
    if (this.auth.isAuthenticated()) return true;
    this.authWarning = 'Vous devez être connecté pour effectuer cette action.';
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      this.authWarning = '';
    }, 1200);
    return false;
  }

  private loadWishlist(): void {
    this.wishlistLoading = true;
    this.wishlistService.load().subscribe({
      next: (items) => {
        this.wishlistProductIds = new Set(items.map((it) => it.product.id));
        this.wishlistLoading = false;
      },
      error: () => (this.wishlistLoading = false),
    });
  }

  private getSegmentSlug(p: Product): string | null {
    switch ((p as any).segmentCategoryId) {
      case 1: return 'homme';
      case 2: return 'femme';
      case 3: return 'petite-maroquinerie';
      default: return null;
    }
  }

  private getTypeSlug(p: Product): string | null {
    switch ((p as any).typeCategoryId) {
      case 4: return 'sacs-sacoches';
      case 5: return 'ceintures';
      case 6: return 'portefeuilles';
      case 7: return 'portes-cartes';
      case 8: return 'sets-de-table';
      default: return null;
    }
  }

  applyFilters(): void {
    let result = [...this.products];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(term));
    }
    if (this.selectedSegment) result = result.filter(p => this.getSegmentSlug(p) === this.selectedSegment);
    if (this.selectedCategory) result = result.filter(p => this.getTypeSlug(p) === this.selectedCategory);
    if (this.showPromosOnly) result = result.filter(p => this.productService.isPromoValid(p));
    if (this.priceMin != null) result = result.filter(p => this.productService.getEffectivePrice(p) >= this.priceMin!);
    if (this.priceMax != null) result = result.filter(p => this.productService.getEffectivePrice(p) <= this.priceMax!);

    switch (this.sortBy) {
      case 'price-asc': result.sort((a, b) => this.productService.getEffectivePrice(a) - this.productService.getEffectivePrice(b)); break;
      case 'price-desc': result.sort((a, b) => this.productService.getEffectivePrice(b) - this.productService.getEffectivePrice(a)); break;
      case 'newest': result.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
    }
    this.filteredProducts = result;
    this.page = 1;
  }

  onFiltersChange(): void { this.applyFilters(); }
  togglePromoFilter(): void { this.showPromosOnly = !this.showPromosOnly; this.applyFilters(); }
  clearSearch(): void { this.searchTerm = ''; this.applyFilters(); }
  clearAllFilters(): void {
    this.searchTerm = ''; this.selectedSegment = ''; this.selectedCategory = '';
    this.priceMin = null; this.priceMax = null; this.sortBy = ''; this.showPromosOnly = false;
    this.applyFilters();
  }

  get paginatedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredProducts.length / this.pageSize) || 1; }
  changePage(newPage: number): void { if (newPage >= 1 && newPage <= this.totalPages) { this.page = newPage; window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  getQuantity(p: Product): number { return this.cartService.items.find(i => i.productId === p.id)?.quantity || 0; }
  isAddDisabled(p: Product): boolean { return this.getQuantity(p) >= ((p as any).stockQuantity || 0); }
  isMaxQuantityReached(p: Product): boolean { return this.getQuantity(p) >= ((p as any).stockQuantity || 0); }

  increase(p: Product): void {
    if (!p.id || !this.requireLoginOrRedirect()) return;
    this.cartService.addProduct(p.id, 1).subscribe();
  }

  decrease(p: Product): void {
    if (!p.id || !this.requireLoginOrRedirect()) return;
    const q = this.getQuantity(p);
    q <= 1 ? this.cartService.removeItem(p.id).subscribe() : this.cartService.updateQuantity(p.id, q - 1).subscribe();
  }

  isFavorite(p: Product): boolean { return !!p.id && this.wishlistProductIds.has(p.id); }
  toggleFavorite(p: Product): void {
    if (!p.id || !this.requireLoginOrRedirect()) return;
    this.wishlistService.toggle(p.id).subscribe({ next: (items) => this.wishlistProductIds = new Set(items.map(it => it.product.id)) });
  }
}
