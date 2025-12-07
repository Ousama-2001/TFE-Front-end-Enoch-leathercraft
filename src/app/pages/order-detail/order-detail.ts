// src/app/pages/order-detail/order-detail.ts
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

  currentLang: 'fr' | 'en' =
    (localStorage.getItem('lang') === 'en' ? 'en' : 'fr');

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

  getStatusLabel(status: string): string {
    const labels = {
      fr: {
        PENDING: 'En attente',
        PAID: 'Payée',
        SHIPPED: 'Expédiée',
        DELIVERED: 'Livrée',
        CANCELLED: 'Annulée',
        RETURN_REQUESTED: 'Retour demandé'
      },
      en: {
        PENDING: 'Pending',
        PAID: 'Paid',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
        RETURN_REQUESTED: 'Return requested'
      }
    } as const;

    const lang = this.currentLang;
    // @ts-ignore
    return labels[lang][status] ?? status;
  }
}
