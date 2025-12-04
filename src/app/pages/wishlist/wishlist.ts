// src/app/pages/wishlist/wishlist.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  WishlistService,
  WishlistItem,
} from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  loading = false;
  error = '';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    this.loading = true;
    this.error = '';

    this.wishlistService.get().subscribe({
      next: (items) => {
        this.items = items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement wishlist', err);
        this.error = "Impossible de charger votre wishlist.";
        this.loading = false;
      },
    });
  }

  remove(productId: number): void {
    this.wishlistService.remove(productId).subscribe({
      next: () => {
        this.items = this.items.filter(
          (it) => it.product.id !== productId
        );
      },
      error: (err) => {
        console.error('Erreur suppression wishlist', err);
      },
    });
  }

  addToCart(item: WishlistItem): void {
    const p = item.product;
    if (!p || !p.id) {
      return;
    }

    this.cartService.addProduct(p.id, 1).subscribe({
      next: () => {
        // Optionnel : petit log ou toast
        console.log('Produit ajouté au panier depuis la wishlist');
      },
      error: (err) => {
        console.error('Erreur ajout panier depuis wishlist', err);
      },
    });
  }

  /**
   * Même logique que dans products.html :
   * si imageUrls existe et a au moins 1 élément,
   * on prend http://localhost:8080 + imageUrls[0],
   * sinon placeholder.
   */
  getProductImageUrl(item: WishlistItem): string {
    const imgs = item.product.imageUrls;
    if (imgs && imgs.length > 0) {
      return 'http://localhost:8080' + imgs[0];
    }
    return 'assets/img/products/placeholder-bag.jpg';
  }
}
