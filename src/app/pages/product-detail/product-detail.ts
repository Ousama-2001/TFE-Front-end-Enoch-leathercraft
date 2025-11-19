import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';   // 🔹 ICI

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  addedMessage = ''; // petit feedback

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,   // 🔹 ICI
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.error = 'Produit invalide.';
      return;
    }

    this.loading = true;
    this.productService.getOne(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produit', err);
        this.error = 'Produit introuvable.';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  addToCart(): void {
    if (!this.product) return;
    this.cartService.addProduct(this.product, 1);
    this.addedMessage = 'Produit ajouté au panier ✔';

    setTimeout(() => (this.addedMessage = ''), 2000);
  }
}
