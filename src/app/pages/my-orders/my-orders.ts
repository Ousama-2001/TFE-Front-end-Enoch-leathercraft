// src/app/pages/my-orders/my-orders.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  OrderService,
  OrderResponse,
  StripeCheckoutResponse,
  ReturnRequestPayload
} from '../../services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterModule, FormsModule],
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
  selectedReason: { [orderId: number]: string } = {};
  returnComment: { [orderId: number]: string } = {};

  returnReasons = [
    'Taille incorrecte',
    'Article endommagé / défectueux',
    'Article ne correspond pas à la description',
    'Commande incomplète',
    'Je n’aime pas l’article',
    'Autre'
  ];

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
      case 'PENDING':           return 'En attente';
      case 'PAID':              return 'Payée';
      case 'SHIPPED':           return 'Expédiée';
      case 'DELIVERED':         return 'Livrée';
      case 'CANCELLED':         return 'Annulée';
      case 'RETURN_REQUESTED':  return 'Retour demandé';
      case 'RETURN_APPROVED':   return 'Retour accepté';
      case 'RETURN_REJECTED':   return 'Retour refusé';
      default:                  return status;
    }
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

  // ✅ Annulation autorisée quand PENDING ou PAID
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
      next: (resp: StripeCheckoutResponse) => {
        this.actionLoading[o.id] = false;
        if (resp.checkoutUrl) {
          window.location.href = resp.checkoutUrl;
        } else {
          this.errorMessage = 'URL de paiement introuvable.';
        }
      },
      error: (err) => {
        console.error('Erreur paiement commande', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = 'Erreur lors du paiement de la commande.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openReturnForm(o: OrderResponse): void {
    this.showReturnForm[o.id] = true;
    if (!this.selectedReason[o.id]) {
      this.selectedReason[o.id] = this.returnReasons[0];
    }
  }

  cancelReturnForm(o: OrderResponse): void {
    this.showReturnForm[o.id] = false;
  }

  submitReturn(o: OrderResponse): void {
    if (!this.canRequestReturn(o)) return;

    const reason = this.selectedReason[o.id];
    const comment = this.returnComment[o.id];

    if (!reason) {
      this.errorMessage = 'Veuillez sélectionner un motif de retour.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const payload: ReturnRequestPayload = { reason, comment };

    this.actionLoading[o.id] = true;
    this.infoMessage = '';
    this.errorMessage = '';

    this.orderService.requestReturn(o.id, payload).subscribe({
      next: (updated) => {
        this.orders = this.orders.map(order =>
          order.id === updated.id ? updated : order
        );
        this.actionLoading[o.id] = false;
        this.showReturnForm[o.id] = false;
        this.infoMessage = 'Demande de retour enregistrée.';
        setTimeout(() => this.infoMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur demande de retour', err);
        this.actionLoading[o.id] = false;
        this.errorMessage = 'Impossible de demander le retour pour cette commande.';
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

  // 🔖 Étiquette de retour : fichier texte simple avec l’adresse + ref commande
  downloadReturnLabel(o: OrderResponse): void {
    if (!this.hasReturnLabel(o)) return;

    const content = `ETIQUETTE DE RETOUR - Enoch Leathercraft Shop

Référence commande : ${o.reference}

Expéditeur :
${/* tu peux personnaliser plus tard avec le profil */ ''}_________________________

Destinataire :
Enoch Leathercraft – Service Retours
Rue de la Maroquinerie 42
1000 Bruxelles
Belgique

Merci d'insérer cette étiquette dans le colis ou de la coller à l'extérieur.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retour-${o.reference}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
