// src/app/pages/wishlist/wishlist.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../services/cart.service';
import {
  WishlistService,
  WishlistItemResponse,
} from '../../services/wishlist.service';
import { ProductService } from '../../services/products.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'], // ✅ correspond bien à ton fichier
})
export class WishlistComponent implements OnInit {
  items: WishlistItemResponse[] = [];
  loading = false;
  error = '';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Charge une fois depuis le back
    this.wishlistService.load().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger votre wishlist.';
        this.loading = false;
      },
    });

    // Reste synchronisé si la wishlist change ailleurs
    this.wishlistService.wishlist$.subscribe((items) => {
      this.items = items;
    });
  }

  /** 🔍 URL d’image : même logique que les produits */
  getProductImageUrl(w: WishlistItemResponse): string {
    return this.productService.getMainImageUrl(w.product);
  }

  /** 🔗 Aller sur la fiche produit */
  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  /** ❌ Retirer de la wishlist */
  remove(productId: number): void {
    this.wishlistService.remove(productId).subscribe({
      error: (err) => {
        console.error('Erreur lors du retrait de la wishlist', err);
      },
    });
  }

  /** ✅ Vérifie si on peut ajouter au panier (stock respecté) */
  canAddToCart(w: WishlistItemResponse): boolean {
    const p = w.product;
    if (!p || !p.id) return false;

    // Pas de stock configuré → on autorise
    if (p.stockQuantity == null) return true;

    const currentQty = this.cartService.getQuantity(p.id);
    return p.stockQuantity > 0 && currentQty < p.stockQuantity;
  }

  /** 🧺 Ajouter au panier depuis la wishlist (avec contrôle de stock) */
  addToCart(w: WishlistItemResponse): void {
    const p = w.product;
    if (!p || !p.id) return;

    const stock = p.stockQuantity;
    const currentQty = this.cartService.getQuantity(p.id);

    if (stock != null) {
      if (stock <= 0) {
        alert('Ce produit est en rupture de stock.');
        return;
      }
      if (currentQty >= stock) {
        alert(
          'Vous avez déjà atteint le stock maximum pour ce produit dans votre panier.'
        );
        return;
      }
    }

    this.cartService.addProduct(p.id, 1).subscribe({
      error: (err) => {
        console.error('Erreur ajout panier depuis wishlist', err);
      },
    });
  }
}
