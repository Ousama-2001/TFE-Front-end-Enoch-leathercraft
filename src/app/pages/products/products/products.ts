import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService, Product } from '../../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:900px;margin:24px auto;padding:0 12px">
      <h1>Produits</h1>
      <div *ngIf="loading">Chargement...</div>
      <div *ngIf="error" style="background:#3a1616;border:1px solid #7a2b2b;color:#ffc0c0;padding:10px;border-radius:8px">{{ error }}</div>

      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">
        <div style="background:#181818;border:1px solid #2a2a2a;border-radius:12px;padding:16px" *ngFor="let p of items">
          <h3>{{ p.name }}</h3>
          <p style="opacity:.8">{{ p.description || '—' }}</p>
          <p style="font-weight:700">{{ p.price }} {{ p.currency }}</p>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  loading = true;
  error = '';
  items: Product[] = [];
  constructor(private api: ProductsService) {}
  ngOnInit(): void {
    this.api.list().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.error = 'Impossible de charger les produits'; this.loading = false; }
    });
  }
}
