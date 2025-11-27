import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  AdminStatsService,
  SalesStatsResponse,
  AdminOrderResponse
} from '../../services/admin-stats.service';
import { Product } from '../../services/products.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {

  // --- Stats ---
  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  // --- Stock faible ---
  lowStockProducts: Product[] = [];
  lowStockLoading = false;
  lowStockError: string | null = null;
  lowStockThreshold = 5;

  // --- Commandes ---
  orders: AdminOrderResponse[] = [];
  ordersLoading = false;
  ordersError: string | null = null;

  constructor(
    private adminStatsService: AdminStatsService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadLowStock();
    this.loadOrders();
  }

  // ----- Stats -----
  loadStats(): void {
    this.statsLoading = true;
    this.statsError = null;

    this.adminStatsService.getSalesStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.statsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats', err);
        this.statsError = 'Impossible de charger les statistiques de ventes.';
        this.statsLoading = false;
      }
    });
  }

  // ----- Stock faible -----
  loadLowStock(): void {
    this.lowStockLoading = true;
    this.lowStockError = null;

    this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({
      next: (list) => {
        this.lowStockProducts = list;
        this.lowStockLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stock bas', err);
        this.lowStockError = 'Impossible de charger les produits en stock faible.';
        this.lowStockLoading = false;
      }
    });
  }

  onThresholdChange(): void {
    this.loadLowStock();
  }

  // ----- Commandes -----
  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;

    this.adminStatsService.getAllOrders().subscribe({
      next: (list) => {
        this.orders = list;
        this.ordersLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes', err);
        this.ordersError = 'Impossible de charger les commandes.';
        this.ordersLoading = false;
      }
    });
  }
}
