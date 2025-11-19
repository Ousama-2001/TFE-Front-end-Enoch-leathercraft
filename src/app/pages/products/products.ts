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

  // pagination (on s’en sert au point 3)
  page = 1;
  pageSize = 8;

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

  // produits de la page courante
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

  addToCart(p: Product): void {
    this.cart.addProduct(p, 1);
  }
}
