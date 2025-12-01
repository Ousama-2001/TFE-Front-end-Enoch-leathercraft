import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CurrencyPipe } from '@angular/common';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, TranslatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit {
  currentYear = new Date().getFullYear();

  products: Product[] = [];
  latestProducts: Product[] = [];

  loading = false;
  error = '';

  logoUrl = 'http://localhost:8080/uploads/products/logo.jpg';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  // ========================================================
  //                INIT : CHARGER PRODUITS
  // ========================================================
  ngOnInit(): void {
    this.loading = true;

    this.productService.getAll().subscribe({
      next: (list) => {
        this.products = list;

        // Derniers 4 produits
        this.latestProducts = [...this.products]
          .sort((a, b) => b.id - a.id)
          .slice(0, 4);

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }

  // ========================================================
  //                   IMAGE PRODUIT
  // ========================================================
  getImage(product: Product): string {
    // 👉 EXACTEMENT comme dans products.html
    if (product.imageUrls && product.imageUrls.length > 0) {
      return 'http://localhost:8080' + product.imageUrls[0];
    }

    return 'assets/img/products/placeholder-bag.jpg';
  }

  // ========================================================
  //                  NAVIGATION
  // ========================================================
  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToProductDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
