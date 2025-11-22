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
  addedMessage = '';   // pour le texte "Produit ajouté au panier ✔"

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

        // on récupère l'état du panier pour les quantités
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

  // quantité actuelle du produit dans le panier
  get quantity(): number {
    if (!this.product) return 0;

    const item = this.cartService.items.find(
      (i: CartItem) => i.productId === this.product!.id
    );

    return item ? item.quantity : 0;
  }

  // +1
  increase(): void {
    if (!this.product?.id) return;

    this.cartService.addProduct(this.product.id, 1).subscribe();
  }

  // -1 ou suppression si on arrive à 0
  decrease(): void {
    if (!this.product?.id) return;

    if (this.quantity <= 1) {
      this.cartService.removeItem(this.product.id).subscribe();
    } else {
      this.cartService.updateQuantity(this.product.id, this.quantity - 1).subscribe();
    }
  }

  // bouton principal "Ajouter au panier"
  addToCart(): void {
    if (!this.product?.id) return;

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
