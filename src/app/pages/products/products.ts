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

  page = 1;
  pageSize = 4;

  constructor(
    private productService: ProductService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (list) => (this.products = list),
      error: (err) => console.error('Erreur chargement produits', err),
    });

    // très important : récupérer les quantités du back
    this.cartService.loadCart().subscribe();
  }

  // Pagination
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

  // Quantité du produit dans le panier
  getQuantity(p: Product): number {
    return p.id ? this.cartService.getQuantity(p.id) : 0;
  }

  // +1
  increase(p: Product): void {
    if (!p.id) return;
    this.cartService.addProduct(p.id, 1).subscribe();
  }

  // -1
  decrease(p: Product): void {
    if (!p.id) return;

    const q = this.cartService.getQuantity(p.id);
    if (q <= 1) {
      this.cartService.removeItem(p.id).subscribe();
    } else {
      this.cartService.updateQuantity(p.id, q - 1).subscribe();
    }
  }
}
