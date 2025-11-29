import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
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

  // Wishlist locale
  favorites = new Set<number>();

  // Skeleton
  skeletonItems = Array(8).fill(0);

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // récupération éventuelle des filtres depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.selectedSegment = params['segment'] || '';
      this.selectedCategory = params['category'] || '';
      this.searchTerm = params['search'] || '';
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

    this.cartService.loadCart().subscribe();
  }

  // ====== FILTRES / TRI ======

  applyFilters(): void {
    let result = [...this.products];

    // recherche plein texte
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // segment (homme/femme/mixte)
    if (this.selectedSegment) {
      result = result.filter(p => (p as any).segment === this.selectedSegment);
    }

    // catégorie (sacs, ceintures, etc.)
    if (this.selectedCategory) {
      result = result.filter(p => (p as any).category === this.selectedCategory);
    }

    // matériau
    if (this.selectedMaterial) {
      const mat = this.selectedMaterial.toLowerCase();
      result = result.filter(p =>
        p.material && p.material.toLowerCase().includes(mat)
      );
    }

    // prix min / max
    if (this.priceMin != null) {
      result = result.filter(p => p.price >= this.priceMin!);
    }
    if (this.priceMax != null) {
      result = result.filter(p => p.price <= this.priceMax!);
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
        // ici j'utilise l'id comme proxy "nouveauté" (plus grand = plus récent)
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
    const item = this.cartService.items.find((i: CartItem) => i.productId === p.id);
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

  // ====== FAVORIS (local uniquement) ======

  toggleFavorite(p: Product): void {
    if (!p.id) return;
    if (this.favorites.has(p.id)) {
      this.favorites.delete(p.id);
    } else {
      this.favorites.add(p.id);
    }
  }

  isFavorite(p: Product): boolean {
    return !!p.id && this.favorites.has(p.id);
  }
}
