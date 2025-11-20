import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';

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
    private cartService: CartService, // ✅ on garde
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

  // 🔹 quantité actuelle de CE produit dans le panier
  get quantity(): number {
    if (!this.product) return 0;
    const item = this.cartService.items.find(
      (i) => i.productId === this.product!.id,
    );
    return item ? item.quantity : 0;
  }

  // 🔹 +1 dans le panier
  increase(): void {
    if (!this.product) return;
    this.cartService.addProduct(this.product, 1);
  }

  // 🔹 -1 (ou suppression si on arrive à 0/1)
  decrease(): void {
    if (!this.product) return;

    if (this.quantity <= 1) {
      this.cartService.removeItem(this.product.id);
    } else {
      this.cartService.updateQuantity(this.product.id, this.quantity - 1);
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.cartService.addProduct(this.product, 1);

    // Animation bouton
    const btn = document.querySelector('.btn-cart-animated');
    btn?.classList.add('added');

    setTimeout(() => {
      btn?.classList.remove('added');
    }, 1500);
  }

}
