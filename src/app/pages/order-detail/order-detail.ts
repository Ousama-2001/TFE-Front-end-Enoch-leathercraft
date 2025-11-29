import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, OrderResponse } from '../../services/order.service';

@Component({
  standalone: true,
  selector: 'app-order-detail',
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss'],
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
})
export class OrderDetailComponent implements OnInit {

  order: OrderResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.error = 'Identifiant de commande invalide.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.orderService.getMyOrderById(id).subscribe({
      next: (o: OrderResponse) => {
        this.order = o;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement commande', err);
        this.error = 'Impossible de charger les détails de la commande.';
        this.loading = false;
      }
    });
  }

  getTotalItems(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ↪ Utilisé dans ton template : {{ getStatusLabel(order.status) }}
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PAID':
        return 'Payée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }
}
