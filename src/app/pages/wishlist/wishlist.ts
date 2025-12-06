import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../services/cart.service';
import {
  WishlistService,
  WishlistItemResponse,
} from '../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
})
export class WishlistComponent implements OnInit {
  items: WishlistItemResponse[] = [];
  loading = false;
  error = '';

  // ✅ Pagination locale
  page = 1;
  pageSize = 8;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Charger le panier pour connaître les quantités déjà présentes
    this.cartService.loadCart().subscribe({
      error: () => {
        /* on ignore les erreurs panier ici */
      },
    });

    // Charge la wishlist depuis le back
    this.wishlistService.load().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
        if (this.page > this.totalPages) {
          this.page = this.totalPages;
        }
      },
      error: () => {
        this.error = 'Impossible de charger votre wishlist.';
        this.loading = false;
      },
    });

    // Reste synchronisé avec le BehaviorSubject (toggle ailleurs, etc.)
    this.wishlistService.wishlist$.subscribe((items) => {
      this.items = items;
      if (this.page > this.totalPages) {
        this.page = this.totalPages;
      }
    });
  }

  // ===================== PAGINATION =====================

  get paginatedItems(): WishlistItemResponse[] {
    const start = (this.page - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.items.length) {
      return 1;
    }
    return Math.ceil(this.items.length / this.pageSize);
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }
    this.page = newPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===================== IMAGE PRODUIT =====================

  getProductImageUrl(w: WishlistItemResponse): string {
    const imgs = w.product?.imageUrls;
    if (imgs && imgs.length > 0) {
      const first = imgs[0];
      if (first.startsWith('http://') || first.startsWith('https://')) {
        return first;
      }
      return 'http://localhost:8080' + first;
    }
    return 'assets/img/products/placeholder-bag.jpg';
  }

  // ===================== STOCK / PANIER =====================

  /** quantité actuelle de ce produit dans le panier */
  getQuantityInCart(w: WishlistItemResponse): number {
    const id = w.product?.id;
    if (!id) return 0;
    return this.cartService.getQuantity(id);
  }

  /** true si on ne peut plus ajouter (stock max ou rupture) */
  isAddDisabled(w: WishlistItemResponse): boolean {
    const p = w.product;
    if (!p || !p.id) return true;

    if (p.stockQuantity == null) {
      // stock illimité / non géré → on laisse actif
      return false;
    }

    const current = this.cartService.getQuantity(p.id);
    return current >= p.stockQuantity || p.stockQuantity <= 0;
  }

  /** true si l’utilisateur a atteint le stock max mais il reste au moins 1 en stock */
  isMaxQuantityReached(w: WishlistItemResponse): boolean {
    const p = w.product;
    if (!p || !p.id || p.stockQuantity == null || p.stockQuantity <= 0) {
      return false;
    }
    const current = this.cartService.getQuantity(p.id);
    return current >= p.stockQuantity;
  }

  // ===================== ACTIONS =====================

  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  remove(productId: number): void {
    this.wishlistService.remove(productId).subscribe({
      error: (err) => {
        console.error('Erreur lors du retrait de la wishlist', err);
      },
    });
  }
  clearWishlist(): void {
    if (!confirm('Voulez-vous vraiment vider toute votre wishlist ?')) {
      return;
    }

    this.wishlistService.clear().subscribe({
      next: () => {
        this.items = [];
        this.page = 1;
      },
      error: (err) => {
        console.error('Erreur lors du vidage de la wishlist', err);
      }
    });
  }

  addToCart(w: WishlistItemResponse): void {
    const productId = w.product?.id;
    if (!productId) return;

    if (this.isAddDisabled(w)) {
      alert('Stock maximum atteint pour ce produit.');
      return;
    }

    this.cartService.addProduct(productId, 1).subscribe({
      next: () => {
        // on recharge juste pour avoir les totaux à jour
        this.cartService.loadCart().subscribe({
          error: () => {},
        });
      },
      error: (err) => {
        console.error('Erreur ajout panier depuis wishlist', err);
      },
    });
  }
}
