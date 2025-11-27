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

  // Filtres
  searchTerm = '';
  selectedSegment = '';   // homme / femme / petite-maroquinerie
  selectedCategory = '';  // sacs-sacoches / ceintures / etc.
  priceMin: number | null = null;
  priceMax: number | null = null;

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Récupérer d'abord les query params pour initialiser les filtres
    this.route.queryParams.subscribe(params => {
      this.selectedSegment = params['segment'] || '';
      this.selectedCategory = params['category'] || '';
      this.searchTerm = params['search'] || '';
      // Le prix pourrait aussi venir des params si tu veux plus tard
    });

    // Charger les produits
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

    // Charger le panier pour afficher les quantités correctes
    this.cartService.loadCart().subscribe();
  }

  // --- APPLIQUER LES FILTRES ---

  applyFilters(): void {
    let result = [...this.products];

    // 1. Recherche texte
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // 2. Segment (homme / femme / petite-maroquinerie)
    // => suppose que plus tard tu ajouteras un champ segment côté back
    if (this.selectedSegment) {
      result = result.filter(p => (p as any).segment === this.selectedSegment);
    }

    // 3. Catégorie (sacs-sacoches / ceintures / etc.)
    if (this.selectedCategory) {
      result = result.filter(p => (p as any).category === this.selectedCategory);
    }

    // 4. Prix minimum
    if (this.priceMin != null) {
      result = result.filter(p => p.price >= this.priceMin!);
    }

    // 5. Prix maximum
    if (this.priceMax != null) {
      result = result.filter(p => p.price <= this.priceMax!);
    }

    this.filteredProducts = result;
    this.page = 1; // reset pagination quand filtres changent
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  // --- PAGINATION ---

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

  // --- LOGIQUE PANIER ---

  getQuantity(p: Product): number {
    if (!p.id) return 0;
    const item = this.cartService.items.find((i: CartItem) => i.productId === p.id);
    return item ? item.quantity : 0;
  }

  increase(p: Product): void {
    if (!p.id) return;
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
}
