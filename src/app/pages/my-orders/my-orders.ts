import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { OrderService, OrderResponse, StripeCheckoutResponse, ReturnRequestPayload } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterModule, FormsModule, TranslatePipe],
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

  showReturnForm: { [orderId: number]: boolean } = {};
  selectedReasonKey: { [orderId: number]: string } = {};
  returnComment: { [orderId: number]: string } = {};

  returnReasonKeys = [
    'returns.reason.size',
    'returns.reason.damaged',
    'returns.reason.notAsDescribed',
    'returns.reason.incomplete',
    'returns.reason.dontLike',
    'returns.reason.other',
  ];

  constructor(
    private orderService: OrderService,
    private lang: LanguageService
  ) {}

  private tr(key: string): string {
    return this.lang.t(key);
  }

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
        this.orders = [...list].sort((a, b) => {
          const da = new Date(a.createdAt as any).getTime();
          const db = new Date(b.createdAt as any).getTime();
          return db - da;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes client', err);
        this.error = this.tr('orders.error');
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.tr(`order.status.${status}`);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':           return 'status-pill pending';
      case 'PAID':              return 'status-pill paid';
      case 'SHIPPED':           return 'status-pill shipped';
      case 'DELIVERED':         return 'status-pill delivered';
      case 'CANCELLED':         return 'status-pill cancelled';
      case 'RETURN_REQUESTED':  return 'status-pill return-requested';
      case 'RETURN_APPROVED':   return 'status-pill return-approved';
      case 'RETURN_REJECTED':   return 'status-pill return-rejected';
      default:                  return 'status-pill';
    }
  }

  canCancel(o: OrderResponse): boolean {
    return o.status === 'PENDING' || o.status === 'PAID';
  }
  canPay(o: OrderResponse): boolean {
    return o.status === 'PENDING';
  }
  canDownloadInvoice(o: OrderResponse): boolean {
    return o.status === 'PAID' || o.status === 'DELIVERED';
  }
  canRequestReturn(o: OrderResponse): boolean {
    return o.status === 'DELIVERED';
  }
  hasReturnLabel(o: OrderResponse): boolean {
    return o.status === 'RETURN_APPROVED';
  }

  cancelOrder(o: OrderResponse): void {
    if (!this.canCancel(o)) return;

    const msg = this.tr('orders.confirm.cancel').replace('{ref}', o.reference);
    if (!confirm(msg)) return;

    this.actionLoading[o.id] = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.orderService.cancelOrder(o.id).subscribe({
      next: (updated) => {
        this.orders = this.orders.map(x => x.id === updated.id ? updated : x);
        this.actionLoading[o.id] = false;
        this.infoMessage = this.tr('orders.info.cancelled');
        setTimeout(() => this.infoMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur annulation commande', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = this.tr('orders.error.cancel');
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
      next: (resp: StripeCheckoutResponse) => {
        this.actionLoading[o.id] = false;
        if (resp.checkoutUrl) window.location.href = resp.checkoutUrl;
        else this.errorMessage = this.tr('orders.error.paymentUrlMissing');
      },
      error: (err) => {
        console.error('Erreur paiement commande', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = this.tr('orders.error.pay');
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openReturnForm(o: OrderResponse): void {
    this.showReturnForm[o.id] = true;
    if (!this.selectedReasonKey[o.id]) this.selectedReasonKey[o.id] = this.returnReasonKeys[0];
  }

  cancelReturnForm(o: OrderResponse): void {
    this.showReturnForm[o.id] = false;
  }

  submitReturn(o: OrderResponse): void {
    if (!this.canRequestReturn(o)) return;

    const reasonKey = this.selectedReasonKey[o.id];
    const comment = this.returnComment[o.id];

    if (!reasonKey) {
      this.errorMessage = this.tr('returns.error.selectReason');
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const payload: ReturnRequestPayload = {
      reason: this.tr(reasonKey),
      comment
    };

    this.actionLoading[o.id] = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.orderService.requestReturn(o.id, payload).subscribe({
      next: (updated) => {
        this.orders = this.orders.map(x => x.id === updated.id ? updated : x);
        this.actionLoading[o.id] = false;
        this.showReturnForm[o.id] = false;
        this.infoMessage = this.tr('returns.info.saved');
        setTimeout(() => this.infoMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur demande de retour', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = this.tr('returns.error.requestFailed');
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
        a.download = `invoice-${o.reference}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = this.tr('orders.error.invoice');
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ PDF bon de retour
  downloadReturnLabel(o: OrderResponse): void {
    if (!this.hasReturnLabel(o)) return;

    this.actionLoading[o.id] = true;
    this.errorMessage = '';

    this.orderService.downloadReturnLabel(o.id).subscribe({
      next: (blob) => {
        this.actionLoading[o.id] = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `return-label-${o.reference}.pdf`; // ✅ ICI
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement bon retour', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = this.tr('returns.error.labelDownload');
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
