import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { OrderResponse } from '../../services/cart.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-page">
      <div class="success-card">
        <div class="icon">🎉</div>

        <ng-container *ngIf="!loading && !error; else loadingOrError">
          <h1>Merci pour votre commande !</h1>
          <p class="subtitle">Votre paiement a été confirmé.</p>

          <div class="order-ref" *ngIf="orderReference">
            Référence : <strong>{{ orderReference }}</strong>
          </div>

          <p class="info">
            Un email de confirmation vous a été envoyé.
          </p>

          <a routerLink="/products" class="btn-home">Retour à la boutique</a>
        </ng-container>

        <ng-template #loadingOrError>
          <div *ngIf="loading" class="info">
            Vérification de votre paiement en cours...
          </div>
          <div *ngIf="!loading && error" class="info">
            {{ error }}
          </div>
          <a routerLink="/products" class="btn-home">Retour à la boutique</a>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #12254b 0, #050811 55%, #02030a 100%);
      color: #f5f7ff;
      padding: 20px;
      font-family: system-ui, sans-serif;
    }
    .success-card {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 50px;
      border-radius: 24px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .icon { font-size: 4rem; margin-bottom: 20px; }
    h1 { margin: 0 0 10px 0; font-size: 2rem; font-weight: 700; }
    .subtitle { color: #94a3b8; margin-bottom: 30px; font-size: 1.1rem; }
    .order-ref {
      background: rgba(74, 222, 128, 0.1);
      color: #4ade80;
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 30px;
      font-family: monospace;
      font-size: 1.3rem;
      border: 1px dashed rgba(74, 222, 128, 0.3);
    }
    .info { color: #cbd5e1; margin-bottom: 40px; }
    .btn-home {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 14px 30px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn-home:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4); }
  `]
})
export class OrderSuccessComponent implements OnInit {
  orderReference: string | null = null;
  loading = true;
  error: string | null = null;
  order: OrderResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.orderReference = this.route.snapshot.paramMap.get('reference');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.loading = false;
      this.error = 'Aucune session de paiement trouvée.';
      return;
    }

    this.paymentService.confirmStripePayment(sessionId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur confirmation Stripe : ', err);
        this.error = 'Le paiement n’a pas pu être confirmé.';
        this.loading = false;
      }
    });
  }
}
