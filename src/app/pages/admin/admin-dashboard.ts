import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductCreateRequest } from '../../services/products.service';
import { Observable } from 'rxjs';

// Interfaces pour les commandes dans le dashboard
interface OrderItem { productName: string; quantity: number; unitPrice: number; }
interface AdminOrder {
  id: number;
  reference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {

  activeTab: 'products' | 'orders' = 'products';

  // --- Produits ---
  products: Product[] = [];
  loadingProducts = false;
  error: string = ''; // Ajout de la propriété error manquante
  showCreateForm = false;
  editingProductId: number | null = null;
  selectedFile: File | null = null;
  currentImagePreview: string | null = null;
  isSubmitting = false;
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';
  newProduct: ProductCreateRequest = {
    sku: '', name: '', description: '', material: '', price: 0,
    weightGrams: 0, isActive: true, currency: 'EUR', slug: '',
  };

  // --- Commandes ---
  orders: AdminOrder[] = [];
  loadingOrders = false;
  private http = inject(HttpClient);

  constructor(
    private productService: ProductService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // --- NAVIGATION ONGLETS ---
  switchTab(tab: 'products' | 'orders'): void {
    this.activeTab = tab;
    if (tab === 'products') this.loadProducts();
    else this.loadOrders();
  }

  // --- LOGIQUE PRODUITS ---
  loadProducts(): void {
    this.loadingProducts = true;
    this.error = '';
    this.productService.getAll().subscribe({
      next: (list) => { this.products = list; this.loadingProducts = false; },
      error: (err) => {
        this.handleError(err);
        this.loadingProducts = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.selectedFile = event.target.files[0];
    }
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  submitForm(): void {
    this.error = '';

    if (!this.newProduct.name || !this.newProduct.sku || !this.newProduct.price) {
      this.error = 'Nom, SKU et prix sont obligatoires.';
      return;
    }

    if (this.editingProductId === null && !this.selectedFile) {
      this.error = 'Veuillez sélectionner une image pour créer un nouveau produit.';
      return;
    }

    const payload: ProductCreateRequest = {
      ...this.newProduct,
      slug: this.slugify(this.newProduct.name),
      currency: this.newProduct.currency ?? 'EUR',
    };

    this.isSubmitting = true;
    let productObservable: Observable<Product>;

    if (this.editingProductId === null) {
      // On utilise ! car on a vérifié selectedFile juste au-dessus
      productObservable = this.productService.create(payload, this.selectedFile!);
    } else {
      productObservable = this.productService.update(this.editingProductId, payload, this.selectedFile);
    }

    productObservable.subscribe({
      next: (result) => {
        this.loadProducts();
        this.resetForm();
      },
      error: (err) => {
        this.handleError(err);
        this.isSubmitting = false;
      },
    });
  }

  startEdit(p: Product): void {
    this.showCreateForm = true;
    this.editingProductId = p.id;
    this.selectedFile = null;
    this.error = '';
    this.currentImagePreview = p.imageUrls && p.imageUrls.length > 0 ? 'http://localhost:8080' + p.imageUrls[0] : null;
    this.newProduct = { ...p, description: p.description ?? '', material: p.material ?? '', weightGrams: p.weightGrams ?? 0, slug: p.slug ?? '' };
  }

  handleError(err: any): void {
    console.error('Erreur backend:', err);
    this.error = err.error?.message || 'Une erreur est survenue. Vérifiez le serveur.';
  }

  private resetForm(): void {
    this.showCreateForm = false; this.editingProductId = null; this.selectedFile = null; this.currentImagePreview = null; this.isSubmitting = false;
    this.newProduct = { sku: '', name: '', description: '', material: '', price: 0, weightGrams: 0, isActive: true, currency: 'EUR', slug: '' };
    this.error = '';
  }

  toggleCreateForm(): void {
    if (this.editingProductId !== null) this.resetForm();
    else this.showCreateForm = !this.showCreateForm;
  }
  openDeleteConfirm(p: Product): void { this.deleteTargetId = p.id; this.deleteTargetName = p.name; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deleteTargetId = null; }
  confirmDelete(): void {
    if (this.deleteTargetId == null) return;
    this.productService.delete(this.deleteTargetId).subscribe({
      next: () => { this.loadProducts(); this.cancelDelete(); },
      error: (err) => { this.handleError(err); this.cancelDelete(); }
    });
  }


  // --- LOGIQUE COMMANDES ---

  loadOrders() {
    this.loadingOrders = true;
    this.error = '';
    this.http.get<AdminOrder[]>('http://localhost:8080/api/admin/orders')
      .subscribe({
        next: (data) => { this.orders = data; this.loadingOrders = false; },
        error: (err) => {
          this.handleError(err);
          this.loadingOrders = false;
        }
      });
  }

  updateOrderStatus(id: number, status: string) {
    let message = '';
    if (status === 'PAID') message = "Confirmer que le paiement a été reçu ?";
    else if (status === 'SHIPPED') message = "Confirmer l'expédition de la commande ?";
    else if (status === 'DELIVERED') message = "Confirmer la livraison finale ?";
    else message = `Passer la commande en statut : ${status} ?`;

    if(!confirm(message)) return;
    this.error = '';

    this.http.patch(`http://localhost:8080/api/admin/orders/${id}/status?status=${status}`, {})
      .subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error("Erreur mise à jour statut :", err);
          this.error = `Échec de la mise à jour: ${err.error?.message || 'Erreur serveur.'}`;
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'PAID': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SHIPPED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DELIVERED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  onLogout(): void { this.auth.logout(); }
}
