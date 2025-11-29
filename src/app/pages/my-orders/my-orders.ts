import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  OrderService,
  OrderResponse
} from '../../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterModule],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.scss'],
})
export class MyOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getMyOrders().subscribe({
      next: (list) => {
        this.orders = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes client', err);
        this.error = 'Impossible de charger vos commandes.';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PAID': return 'Payée';
      case 'SHIPPED': return 'Expédiée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }
}
