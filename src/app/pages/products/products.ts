import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  // 🔹 pagination
  page = 1;
  pageSize = 4; // 4 produits par page → tu verras la pagination

  constructor(
    private productService: ProductService,
    public cart: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (list) => (this.products = list),
      error: (err) => console.error('Erreur chargement produits', err),
    });
  }

  // produits visibles sur la page courante
  get paginatedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize) || 1;
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
  }

  // 🔹 quantité actuelle d'un produit dans le panier
  getQuantity(p: Product): number {
    const item = this.cart.items.find((i) => i.productId === p.id);
    return item ? item.quantity : 0;
  }

  // +1
  increase(p: Product): void {
    this.cart.addProduct(p, 1);
  }

  // -1 / retirer
  decrease(p: Product): void {
    const current = this.getQuantity(p);
    if (current <= 1) {
      this.cart.removeItem(p.id);
    } else {
      this.cart.updateQuantity(p.id, current - 1);
    }
  }
}
