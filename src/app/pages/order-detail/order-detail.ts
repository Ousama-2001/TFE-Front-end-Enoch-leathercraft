// src/app/pages/order-detail/order-detail.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, OrderResponse } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-order-detail',
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss'],
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink, TranslatePipe],
})
export class OrderDetailComponent implements OnInit {

  order: OrderResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private lang: LanguageService
  ) {}

  private tr(key: string): string {
    return this.lang.t(key);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.error = this.tr('orders.detail.error.invalidId');
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
        this.error = this.tr('orders.detail.error.loadFailed');
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.tr(`order.status.${status}`);
  }
}
