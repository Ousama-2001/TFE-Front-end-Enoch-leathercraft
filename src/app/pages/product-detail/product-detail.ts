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
  stockMessage = '';

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
        this.loading = false;
        // recharge l’état du panier pour avoir les quantités à jour
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

  /** Stock disponible pour ce produit (0 si null / undefined) */
  get stockAvailable(): number {
    return this.product?.stockQuantity ?? 0;
  }

  /** Produit en rupture ? */
  get isOutOfStock(): boolean {
    return this.stockAvailable <= 0;
  }

  /** Quantité actuelle de ce produit dans le panier */
  get quantity(): number {
    if (!this.product) return 0;
    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === this.product!.id,
    );
    return item ? item.quantity : 0;
  }

  /** Peut-on encore augmenter (sans dépasser le stock) ? */
  get canIncrease(): boolean {
    if (!this.product) return false;
    if (this.isOutOfStock) return false;
    return this.quantity < this.stockAvailable;
  }

  private showStockMessage(msg: string): void {
    this.stockMessage = msg;
    setTimeout(() => (this.stockMessage = ''), 2000);
  }

  increase(): void {
    if (!this.product || !this.product.id) return;

    if (this.isOutOfStock) {
      this.showStockMessage('Produit en rupture de stock.');
      return;
    }

    if (!this.canIncrease) {
      this.showStockMessage(
        `Stock insuffisant : il reste seulement ${this.stockAvailable} pièce(s).`,
      );
      return;
    }

    this.cartService.addProduct(this.product.id, 1).subscribe({
      error: () => this.showStockMessage("Erreur lors de la mise à jour du panier."),
    });
  }

  decrease(): void {
    if (!this.product || !this.product.id) return;

    if (this.quantity <= 1) {
      this.cartService.removeItem(this.product.id).subscribe();
    } else {
      this.cartService
        .updateQuantity(this.product.id, this.quantity - 1)
        .subscribe();
    }
  }

  addToCart(): void {
    if (!this.product || !this.product.id) return;

    if (this.isOutOfStock) {
      this.showStockMessage('Ce produit est actuellement en rupture de stock.');
      return;
    }

    if (!this.canIncrease) {
      this.showStockMessage(
        `Stock insuffisant : il reste seulement ${this.stockAvailable} pièce(s).`,
      );
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
        this.addedMessage = "Erreur lors de l'ajout au panier";
        setTimeout(() => (this.addedMessage = ''), 2000);
      },
    });
  }
}
