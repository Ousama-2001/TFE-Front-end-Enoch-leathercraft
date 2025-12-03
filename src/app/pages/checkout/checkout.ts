import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CartService, OrderResponse } from '../../services/cart.service';
import {TranslatePipe} from '../../pipes/translate.pipe';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recharge le panier à l'arrivée sur la page
    this.cart.loadCart().subscribe({
      next: (cart) => {
        if (!cart.items.length) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.router.navigate(['/cart']);
      }
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

  // On laisse ce getter, mais on l'utilise avec f['firstName'] dans le HTML
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

    // Pour l’instant : on valide juste la commande via le back existant
    this.cart.checkout().subscribe({
      next: (order: OrderResponse) => {
        this.loading = false;
        this.router.navigate(['/order-success', order.reference]);
      },
      error: (err) => {
        console.error('Erreur checkout : ', err);
        this.loading = false;
        this.error = 'Une erreur est survenue lors de la validation de la commande.';
      }
    });
  }
}
