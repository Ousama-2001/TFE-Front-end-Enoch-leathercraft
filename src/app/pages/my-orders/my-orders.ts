// src/app/pages/my-orders/my-orders.ts
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

  infoMessage = '';
  errorMessage = '';

  actionLoading: { [orderId: number]: boolean } = {};

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.infoMessage = '';
    this.errorMessage = '';

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
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':   return 'status-pill pending';
      case 'PAID':      return 'status-pill paid';
      case 'SHIPPED':   return 'status-pill shipped';
      case 'DELIVERED': return 'status-pill delivered';
      case 'CANCELLED': return 'status-pill cancelled';
      default:          return 'status-pill';
    }
  }

  canCancel(o: OrderResponse): boolean {
    return o.status === 'PENDING';
  }

  canPay(o: OrderResponse): boolean {
    return o.status === 'PENDING';
  }

  canDownloadInvoice(o: OrderResponse): boolean {
    return o.status === 'PAID' || o.status === 'DELIVERED';
  }

  cancelOrder(o: OrderResponse): void {
    if (!this.canCancel(o)) return;
    if (!confirm(`Annuler la commande ${o.reference} ?`)) return;

    this.actionLoading[o.id] = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.orderService.cancelOrder(o.id).subscribe({
      next: (updated) => {
        this.orders = this.orders.map(order =>
          order.id === updated.id ? updated : order
        );
        this.actionLoading[o.id] = false;
        this.infoMessage = 'Commande annulée avec succès.';
        setTimeout(() => this.infoMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur annulation commande', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = "Impossible d'annuler cette commande.";
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  payOrder(o: OrderResponse): void {
    if (!this.canPay(o)) return;

    this.actionLoading[o.id] = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.orderService.payOrder(o.id).subscribe({
      next: (resp) => {
        // redirection directe vers Stripe
        window.location.href = resp.checkoutUrl;
      },
      error: (err) => {
        console.error('Erreur paiement commande', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = 'Erreur lors du paiement de la commande.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  downloadInvoice(o: OrderResponse): void {
    if (!this.canDownloadInvoice(o)) return;

    this.actionLoading[o.id] = true;
    this.errorMessage = '';

    this.orderService.downloadInvoice(o.id).subscribe({
      next: (blob) => {
        this.actionLoading[o.id] = false;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${o.reference}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = 'Impossible de télécharger la facture.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
