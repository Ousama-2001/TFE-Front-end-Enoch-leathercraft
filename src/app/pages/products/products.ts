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

  // Pagination
  page = 1;
  pageSize = 8;

  // Filtres / recherche
  searchTerm = '';
  selectedSegment = '';
  selectedCategory = '';
  selectedMaterial = '';
  priceMin: number | null = null;
  priceMax: number | null = null;
  sortBy = '';

  // Wishlist
  wishlistProductIds = new Set<number>();
  wishlistLoading = false;
  isLoggedIn = false;

  // Skeleton
  skeletonItems = Array(8).fill(0);

  // ✅ message visiteur
  authWarning = '';

  constructor(
    private productService: ProductService,
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

      if (this.products && this.products.length > 0) {
        this.applyFilters();
      }
    });

    this.productService.getAll().subscribe({
      next: (list) => {
        this.products = list;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });

    // panier : si visiteur, ton backend va sûrement renvoyer 401/403 → on ignore
    this.cartService.loadCart().subscribe({ error: () => {} });

    if (this.isLoggedIn) {
      this.loadWishlist();
    }

    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistProductIds = new Set(
        items
          .filter((it) => !!it.product && !!it.product.id)
          .map((it) => it.product.id)
      );
    });
  }

  private requireLoginOrRedirect(): boolean {
    if (this.auth.isAuthenticated()) return true;

    this.authWarning =
      'Vous devez être connecté ou inscrit pour effectuer cette action.';
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      this.authWarning = '';
    }, 1200);

    return false;
  }

  private loadWishlist(): void {
    this.wishlistLoading = true;
    this.wishlistService.load().subscribe({
      next: (items: WishlistItemResponse[]) => {
        this.wishlistProductIds = new Set(
          items
            .filter((it) => !!it.product && !!it.product.id)
            .map((it) => it.product.id)
        );
        this.wishlistLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement wishlist', err);
        this.wishlistLoading = false;
      },
    });
  }

  // ====== Helpers segments / catégories ======

  private getSegmentSlug(p: Product): string | null {
    switch ((p as any).segmentCategoryId) {
      case 1:
        return 'homme';
      case 2:
        return 'femme';
      case 3:
        return 'petite-maroquinerie';
      default:
        return null;
    }
  }

  private getTypeSlug(p: Product): string | null {
    switch ((p as any).typeCategoryId) {
      case 4:
        return 'sacs-sacoches';
      case 5:
        return 'ceintures';
      case 6:
        return 'portefeuilles';
      case 7:
        return 'portes-cartes';
      case 8:
        return 'sets-de-table';
      default:
        return null;
    }
  }

  // ====== FILTRES / TRI ======

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          ((p as any).description && (p as any).description.toLowerCase().includes(term))
      );
    }

    if (this.selectedSegment) {
      result = result.filter((p) => this.getSegmentSlug(p) === this.selectedSegment);
    }

    if (this.selectedCategory) {
      result = result.filter((p) => this.getTypeSlug(p) === this.selectedCategory);
    }

    if (this.selectedMaterial) {
      const mat = this.selectedMaterial.toLowerCase();
      result = result.filter(
        (p) => (p as any).material && (p as any).material.toLowerCase().includes(mat)
      );
    }

    if (this.priceMin != null) result = result.filter((p) => p.price >= this.priceMin!);
    if (this.priceMax != null) result = result.filter((p) => p.price <= this.priceMax!);

    switch (this.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
    }

    this.filteredProducts = result;
    this.page = 1;
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // ====== PAGINATION ======

  get paginatedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ====== PANIER ======

  getQuantity(p: Product): number {
    if (!p.id) return 0;
    const item = this.cartService.items.find((i: CartItem) => i.productId === p.id);
    return item ? item.quantity : 0;
  }

  isAddDisabled(p: Product): boolean {
    const stock = (p as any).stockQuantity;
    if (stock == null) return false;
    return this.getQuantity(p) >= stock || stock <= 0;
  }

  isMaxQuantityReached(p: Product): boolean {
    const stock = (p as any).stockQuantity;
    if (stock == null) return false;
    return this.getQuantity(p) >= stock;
  }

  increase(p: Product): void {
    if (!p.id) return;

    if (!this.requireLoginOrRedirect()) return;

    if (this.isAddDisabled(p)) {
      alert('Vous avez atteint le stock maximum disponible pour ce produit.');
      return;
    }

    this.cartService.addProduct(p.id, 1).subscribe({
      error: () => {
        // si backend refuse (token expiré etc.)
        this.authWarning = 'Vous devez être connecté pour ajouter au panier.';
        setTimeout(() => (this.authWarning = ''), 2000);
      },
    });
  }

  decrease(p: Product): void {
    if (!p.id) return;

    if (!this.requireLoginOrRedirect()) return;

    const q = this.getQuantity(p);
    if (q <= 1) {
      this.cartService.removeItem(p.id).subscribe();
    } else {
      this.cartService.updateQuantity(p.id, q - 1).subscribe();
    }
  }

  // ====== WISHLIST ======

  isFavorite(p: Product): boolean {
    return !!p.id && this.wishlistProductIds.has(p.id);
  }

  toggleFavorite(p: Product): void {
    if (!p.id) return;

    if (!this.requireLoginOrRedirect()) return;

    this.wishlistService.toggle(p.id).subscribe({
      next: (items: WishlistItemResponse[]) => {
        this.wishlistProductIds = new Set(
          items
            .filter((it) => !!it.product && !!it.product.id)
            .map((it) => it.product.id)
        );
      },
      error: (err) => console.error('Erreur toggle wishlist pour produit', p.id, err),
    });
  }
}
