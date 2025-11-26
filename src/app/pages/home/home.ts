import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  error: string | null = null;

  // Logo servi par ton backend
  readonly logoUrl = 'http://localhost:8080/uploads/products/logo.jpg';

  constructor(
    private router: Router,
    public productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        // On ne montre que quelques produits sur la home (style concurrents)
        this.products = data.slice(0, 4);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits pour le moment.';
        this.loading = false;
      }
    });
  }

  getImage(product: Product): string {
    if (!product.imageUrls || product.imageUrls.length === 0) {
      return 'assets/images/placeholder-product.jpg';
    }

    return 'http://localhost:8080' + product.imageUrls[0];
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToProductDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
