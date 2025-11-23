import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponse } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  orders: OrderResponse[] = [];

  constructor(
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: (err) => console.error(err)
    });
  }
}
