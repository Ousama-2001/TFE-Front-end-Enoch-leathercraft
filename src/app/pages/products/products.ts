import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  // Pagination
  page = 1;
  pageSize = 8; // Nombre de produits par page

  constructor(
    private productService: ProductService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // 1. Charger les produits depuis le backend
    this.productService.getAll().subscribe({
      next: (list) => {
        this.products = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });

    // 2. Charger le panier pour afficher les quantités correctes (si l'utilisateur est connecté)
    this.cartService.loadCart().subscribe();
  }

  // --- LOGIQUE PAGINATION ---

  get paginatedProducts(): Product[] {
    // Calcule les produits à afficher pour la page courante
    const start = (this.page - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize) || 1;
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      // Remonter en haut de page lors du changement
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- LOGIQUE PANIER ---

  // Récupère la quantité d'un produit spécifique dans le panier
  getQuantity(p: Product): number {
    if (!p.id) return 0;

    // On cherche l'item dans le tableau local du CartService
    const item = this.cartService.items.find((i: CartItem) => i.productId === p.id);
    return item ? item.quantity : 0;
  }

  // Ajouter au panier (+1)
  increase(p: Product): void {
    if (!p.id) return;
    this.cartService.addProduct(p.id, 1).subscribe();
  }

  // Retirer du panier (-1)
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
