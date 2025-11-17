import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService, Product } from '../../services/products.service';

export interface NewProduct {
  sku: string;
  name: string;
  description: string;
  material: string;
  price: number;
  weightGrams: number;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  showCreateForm = false;

  newProduct: NewProduct = {
    sku: '',
    name: '',
    description: '',
    material: '',
    price: 0,
    weightGrams: 0,
    isActive: true,
  };

  constructor(private productService: ProductService) {}

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
      error: (err: any) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.error = '';
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  createProduct(): void {
    this.error = '';

    if (!this.newProduct.name || !this.newProduct.sku || !this.newProduct.price) {
      this.error = 'Nom, SKU et prix sont obligatoires.';
      return;
    }

    const slug = this.slugify(this.newProduct.name);

    const payload = {
      ...this.newProduct,
      slug,
      currency: 'EUR',
    };

    this.productService.create(payload).subscribe({
      next: (created: Product) => {
        this.products = [created, ...this.products];
        this.showCreateForm = false;
        this.newProduct = {
          sku: '',
          name: '',
          description: '',
          material: '',
          price: 0,
          weightGrams: 0,
          isActive: true,
        };
      },
      error: (err: any) => {
        console.error('Erreur création produit', err);
        this.error = 'Impossible de créer le produit.';
      },
    });
  }

  onDelete(id: number): void {
    if (!confirm('Supprimer ce produit ?')) {
      return;
    }

    this.error = '';

    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p: Product) => p.id !== id);
      },
      error: (err: any) => {
        console.error('Erreur suppression produit', err);
        this.error = 'Impossible de supprimer ce produit.';
      },
    });
  }
}
