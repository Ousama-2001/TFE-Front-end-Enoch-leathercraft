import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <- ajoute ça
import {
  ProductService,
  Product,
  ProductCreateRequest,
} from '../../services/products.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  showCreateForm = false;

  // null = création / non-null = édition
  editingProductId: number | null = null;

  // popup de confirmation de suppression
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';

  newProduct: ProductCreateRequest = {
    sku: '',
    name: '',
    description: '',
    material: '',
    price: 0,
    weightGrams: 0,
    isActive: true,
    currency: 'EUR',
    slug: '',
  };

  constructor(
    private productService: ProductService,
    private auth: AuthService // <- injecte ici
  ) {}


  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getAll().subscribe({
      next: (list: Product[]) => {
        this.products = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }

  toggleCreateForm(): void {
    if (this.editingProductId !== null) {
      this.resetForm();
    } else {
      this.showCreateForm = !this.showCreateForm;
      this.error = '';
    }
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  submitForm(): void {
    this.error = '';

    if (!this.newProduct.name || !this.newProduct.sku || !this.newProduct.price) {
      this.error = 'Nom, SKU et prix sont obligatoires.';
      return;
    }

    const slug = this.slugify(this.newProduct.name);

    const payload: ProductCreateRequest = {
      ...this.newProduct,
      slug,
      currency: this.newProduct.currency ?? 'EUR',
    };

    if (this.editingProductId === null) {
      this.createProduct(payload);
    } else {
      this.updateProduct(this.editingProductId, payload);
    }
  }

  private createProduct(payload: ProductCreateRequest): void {
    this.productService.create(payload).subscribe({
      next: (created: Product) => {
        this.products = [created, ...this.products];
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur création produit', err);
        if (err.status === 400 || err.status === 409) {
          this.error = 'Ce SKU existe déjà ou les données sont invalides.';
        } else {
          this.error = 'Impossible de créer le produit.';
        }
      },
    });
  }

  private updateProduct(id: number, payload: ProductCreateRequest): void {
    this.productService.update(id, payload).subscribe({
      next: (updated: Product) => {
        this.products = this.products.map((p) => (p.id === id ? updated : p));
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur mise à jour produit', err);
        if (err.status === 404) {
          this.error = 'Produit introuvable.';
        } else if (err.status === 400 || err.status === 409) {
          this.error = 'Ce SKU existe déjà ou les données sont invalides.';
        } else {
          this.error = 'Impossible de mettre à jour le produit.';
        }
      },
    });
  }

  startEdit(p: Product): void {
    this.showCreateForm = true;
    this.editingProductId = p.id;
    this.error = '';

    this.newProduct = {
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      material: p.material ?? '',
      price: p.price,
      weightGrams: p.weightGrams ?? 0,
      isActive: p.isActive ?? true,
      currency: p.currency ?? 'EUR',
      slug: p.slug ?? '',
    };
  }

  private resetForm(): void {
    this.showCreateForm = false;
    this.editingProductId = null;
    this.newProduct = {
      sku: '',
      name: '',
      description: '',
      material: '',
      price: 0,
      weightGrams: 0,
      isActive: true,
      currency: 'EUR',
      slug: '',
    };
  }
  onLogout(): void {
    this.auth.logout();
  }

  // ---------- suppression avec popup ----------

  openDeleteConfirm(p: Product): void {
    this.deleteTargetId = p.id;
    this.deleteTargetName = p.name;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
    this.deleteTargetName = '';
  }

  confirmDelete(): void {
    if (this.deleteTargetId == null) return;

    const id = this.deleteTargetId;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Erreur suppression produit', err);
        this.error = 'Impossible de supprimer ce produit.';
        this.cancelDelete();
      },
    });
  }
}
