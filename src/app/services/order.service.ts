import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour le détail des produits (DTO)
export interface OrderItemResponse {
  productName: string;
  unitPrice: number;
  quantity: number;
}

// Interface pour la commande complète (DTO)
export interface OrderResponse {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Valide le panier et crée une commande.
   * C'est cette méthode qui manquait et provoquait l'erreur dans cart.component.ts
   */
  checkout(): Observable<OrderResponse> {
    // On envoie un POST vide, car le backend utilise le token utilisateur pour retrouver le panier
    return this.http.post<OrderResponse>(`${this.baseUrl}/checkout`, {});
  }

  /**
   * Récupère l'historique des commandes de l'utilisateur
   */
  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.baseUrl}/my-orders`);
  }
}
