import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CartService, CheckoutPayload } from '../../services/cart.service';
import { PaymentService, StripeCheckoutResponse } from '../../services/payment.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, TranslatePipe],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class CheckoutComponent implements OnInit {

  checkoutForm!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    public cart: CartService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // On recharge le panier pour être sûr d'avoir les infos à jour (prix, promo, stock)
    this.cart.loadCart().subscribe({
      next: (cart) => {
        if (!cart.items.length) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => this.router.navigate(['/cart'])
    });

    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      street: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['Belgique', [Validators.required]],
      notes: [''],
    });
  }

  get f() {
    return this.checkoutForm.controls;
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  onSubmit(): void {
    this.error = null;

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.cart.items.length) {
      this.error = 'Votre panier est vide.';
      return;
    }

    this.loading = true;

    const v = this.checkoutForm.value;

    // ✅ CORRECTION : On inclut le promoCode stocké dans le CartService
    const payload: CheckoutPayload = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      street: v.street,
      postalCode: v.postalCode,
      city: v.city,
      country: v.country,
      notes: v.notes,
      promoCode: this.cart.promoCode // <--- L'élément manquant était ici !
    };

    this.paymentService.startStripeCheckout(payload).subscribe({
      next: (res: StripeCheckoutResponse) => {
        this.loading = false;
        // Redirection vers Stripe Checkout
        window.location.href = res.checkoutUrl;
      },
      error: (err) => {
        console.error('Erreur Stripe checkout : ', err);
        this.loading = false;

        // Affichage erreur métier si dispo
        if (err.status === 409 && err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Impossible de démarrer le paiement. Réessayez plus tard.';
        }
      }
    });
  }
}
