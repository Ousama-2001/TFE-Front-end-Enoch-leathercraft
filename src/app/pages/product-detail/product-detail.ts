import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/products.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  addedMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
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
        console.log('Produit détail :', p); // debug stock
        this.loading = false;
        this.cartService.loadCart().subscribe();
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

  // ---- Stock réel détecté (stockQuantity OU stock) ----
  get stockQuantity(): number {
    if (!this.product) return 0;
    const anyProd: any = this.product as any;

    if (typeof anyProd.stockQuantity === 'number') {
      return anyProd.stockQuantity;
    }
    if (typeof anyProd.stock === 'number') {
      return anyProd.stock;
    }
    return 0;
  }

  get isOutOfStock(): boolean {
    return this.stockQuantity <= 0;
  }

  // Quantité actuelle du produit dans le panier
  get quantity(): number {
    if (!this.product) return 0;
    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === this.product!.id,
    );
    return item ? item.quantity : 0;
  }

  // Est-ce qu'on peut encore ajouter au panier ?
  canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.isOutOfStock) return false;
    return this.quantity < this.stockQuantity;
  }

  private showTempMessage(msg: string): void {
    this.addedMessage = msg;
    setTimeout(() => (this.addedMessage = ''), 1800);
  }

  increase(): void {
    if (!this.product || !this.product.id) return;
    if (!this.canAddToCart()) {
      this.showTempMessage('Stock maximum atteint pour ce produit.');
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      error: () => {
        this.showTempMessage("Erreur lors de la mise à jour du panier.");
      }
    });
  }

  decrease(): void {
    if (!this.product || !this.product.id) return;
    if (this.isOutOfStock) return;

    if (this.quantity <= 1) {
      this.cartService.removeItem(this.product.id).subscribe({
        error: () => {
          this.showTempMessage("Erreur lors de la mise à jour du panier.");
        }
      });
    } else {
      this.cartService
        .updateQuantity(this.product.id, this.quantity - 1)
        .subscribe({
          error: () => {
            this.showTempMessage("Erreur lors de la mise à jour du panier.");
          }
        });
    }
  }

  addToCart(): void {
    if (!this.product || !this.product.id) return;

    if (!this.canAddToCart()) {
      if (this.isOutOfStock) {
        this.showTempMessage('Stock insuffisant pour ce produit.');
      } else {
        this.showTempMessage('Stock maximum atteint pour ce produit.');
      }
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      next: () => {
        this.addedMessage = 'Produit ajouté au panier ✔';
        const btn = document.querySelector('.btn-cart-animated');
        btn?.classList.add('added');

        setTimeout(() => {
          btn?.classList.remove('added');
          this.addedMessage = '';
        }, 1500);
      },
      error: () => {
        this.showTempMessage("Erreur lors de l'ajout au panier.");
      },
    });
  }
}
