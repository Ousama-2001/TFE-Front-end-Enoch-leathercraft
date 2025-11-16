// src/app/pages/products/products.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }
}
