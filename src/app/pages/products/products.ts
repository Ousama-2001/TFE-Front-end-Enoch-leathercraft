// src/app/pages/products/products.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import {
  WishlistService,
  WishlistItemResponse,
} from '../../services/wishlist.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

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

  // Wishlist (côté API)
  wishlistProductIds = new Set<number>();
  wishlistLoading = false;
  isLoggedIn = false;

  // Skeleton
  skeletonItems = Array(8).fill(0);

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Vérifie si l'utilisateur est connecté (même clé que ton interceptor si tu veux)
    this.isLoggedIn = !!localStorage.getItem('auth_token');

    // Récupération des filtres depuis l'URL
    this.route.queryParams.subscribe((params) => {
      this.selectedSegment = params['segment'] || '';
      this.selectedCategory = params['category'] || '';
      this.searchTerm = params['search'] || '';
      this.sortBy = params['sort'] || this.sortBy || '';
    });

    // Chargement des produits
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

    // Chargement du panier
    this.cartService.loadCart().subscribe();

    // Chargement de la wishlist si connecté
    if (this.isLoggedIn) {
      this.loadWishlist();
    }

    // Reste synchronisé si la wishlist change ailleurs
    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistProductIds = new Set(
        items
          .filter((it) => !!it.product && !!it.product.id)
          .map((it) => it.product.id)
      );
    });
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
    switch (p.segmentCategoryId) {
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
    switch (p.typeCategoryId) {
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

    // recherche plein texte
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // segment (homme / femme / petite-maroquinerie)
    if (this.selectedSegment) {
      result = result.filter(
        (p) => this.getSegmentSlug(p) === this.selectedSegment
      );
    }

    // catégorie (sacs-sacoches, ceintures, portefeuilles, etc.)
    if (this.selectedCategory) {
      result = result.filter(
        (p) => this.getTypeSlug(p) === this.selectedCategory
      );
    }

    // matériau
    if (this.selectedMaterial) {
      const mat = this.selectedMaterial.toLowerCase();
      result = result.filter(
        (p) => p.material && p.material.toLowerCase().includes(mat)
      );
    }

    // prix min / max
    if (this.priceMin != null) {
      result = result.filter((p) => p.price >= this.priceMin!);
    }
    if (this.priceMax != null) {
      result = result.filter((p) => p.price <= this.priceMax!);
    }

    // tri
    switch (this.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // approximation de nouveauté par id
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

  // ====== PANIER + GESTION STOCK ======

  getQuantity(p: Product): number {
    if (!p.id) return 0;
    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === p.id
    );
    return item ? item.quantity : 0;
  }

  /** true si le bouton "ajouter au panier" doit être désactivé */
  isAddDisabled(p: Product): boolean {
    if (p.stockQuantity == null) return false;
    return this.getQuantity(p) >= p.stockQuantity || p.stockQuantity <= 0;
  }

  /** true si on est déjà au stock maximum pour ce produit */
  isMaxQuantityReached(p: Product): boolean {
    if (p.stockQuantity == null) return false;
    return this.getQuantity(p) >= p.stockQuantity;
  }

  increase(p: Product): void {
    if (!p.id) return;

    if (this.isAddDisabled(p)) {
      alert('Vous avez atteint le stock maximum disponible pour ce produit.');
      return;
    }

    this.cartService.addProduct(p.id, 1).subscribe();
  }

  decrease(p: Product): void {
    if (!p.id) return;
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

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/products' },
      });
      return;
    }

    this.wishlistService.toggle(p.id).subscribe({
      next: (items: WishlistItemResponse[]) => {
        this.wishlistProductIds = new Set(
          items
            .filter((it) => !!it.product && !!it.product.id)
            .map((it) => it.product.id)
        );
      },
      error: (err) =>
        console.error('Erreur toggle wishlist pour produit', p.id, err),
    });
  }
}
