import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import {
  ProductService,
  Product,
  ProductCreateRequest
} from '../../services/products.service';
import {
  AdminStatsService,
  SalesStatsResponse,
  AdminOrderResponse,
} from '../../services/admin-stats.service';

// Gestion des avis
import { AdminReviewsPageComponent } from '../admin-reviews/admin-reviews';
// Gestion des utilisateurs (super admin)
import { SuperAdminUsersPageComponent } from '../super-admin-users/super-admin-users';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    AdminReviewsPageComponent,
    SuperAdminUsersPageComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {

  // ------- Onglet actif -------
  // on ajoute 'reviews' et 'users'
  activeTab: 'stats' | 'orders' | 'products' | 'stock' | 'reviews' | 'users' = 'stats';

  // ------- STATS -------
  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  // ------- COMMANDES -------
  orders: AdminOrderResponse[] = [];
  ordersLoading = false;
  ordersError: string | null = null;

  // Modal détail commande
  showOrderModal = false;
  selectedOrder: AdminOrderResponse | null = null;
  modalStatus: string = 'PENDING';

  statusOptions = [
    { value: 'PENDING',   label: 'En attente' },
    { value: 'PAID',      label: 'Payée' },
    { value: 'SHIPPED',   label: 'Expédiée' },
    { value: 'DELIVERED', label: 'Livrée' },
    { value: 'CANCELLED', label: 'Annulée' },
  ];

  // ------- STOCK -------
  lowStockProducts: Product[] = [];
  lowStockLoading = false;
  lowStockError: string | null = null;
  lowStockThreshold = 5;

  // ------- CRUD PRODUITS -------
  products: Product[] = [];
  loading = false;
  error = '';
  showCreateForm = false;

  editingProductId: number | null = null;
  selectedFile: File | null = null;
  currentImagePreview: string | null = null;
  isSubmitting = false;

  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';

  newProduct: ProductCreateRequest = {
    sku: '',
    name: '',
    description: '',
    material: '',
    price: 0,
    weightGrams: 0,
    isActive: true,
    currency: 'EUR',
    slug: '',
  };

  constructor(
    private adminStatsService: AdminStatsService,
    private productService: ProductService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadOrders();
    this.loadLowStock();
    this.loadProducts();
  }

  // ========= Onglets =========
  setTab(tab: 'stats' | 'orders' | 'products' | 'stock' | 'reviews' | 'users'): void {
    this.activeTab = tab;

    if (tab === 'stats') {
      if (!this.stats) this.loadStats();
    } else if (tab === 'orders') {
      if (!this.orders.length) this.loadOrders();
    } else if (tab === 'stock') {
      this.loadLowStock();
    } else if (tab === 'products') {
      if (!this.products.length) this.loadProducts();
    }
    // 'reviews' et 'users' → les composants enfants gèrent leurs propres chargements
  }

  // ========= STATS =========
  loadStats(): void {
    this.statsLoading = true;
    this.statsError = null;

    this.adminStatsService.getSalesStats().subscribe({
      next: data => {
        this.stats = data;
        this.statsLoading = false;
      },
      error: err => {
        console.error('Erreur chargement stats', err);
        this.statsError = 'Impossible de charger les statistiques de ventes.';
        this.statsLoading = false;
      }
    });
  }

  // ========= COMMANDES =========
  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;

    this.adminStatsService.getAllOrders().subscribe({
      next: list => {
        this.orders = list;
        this.ordersLoading = false;
      },
      error: err => {
        console.error('Erreur chargement commandes', err);
        this.ordersError = 'Impossible de charger les commandes.';
        this.ordersLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':   return 'pending';
      case 'PAID':      return 'paid';
      case 'SHIPPED':   return 'shipped';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      default:          return '';
    }
  }

  openOrderModal(order: AdminOrderResponse): void {
    this.selectedOrder = { ...order };
    this.modalStatus = order.status;
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  saveOrderStatusFromModal(): void {
    if (!this.selectedOrder?.id) return;

    const orderId = this.selectedOrder.id;
    const newStatus = this.modalStatus;

    this.adminStatsService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updated) => {
        this.orders = this.orders.map(o => o.id === updated.id ? updated : o);
        this.selectedOrder = updated;
        this.closeOrderModal();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut commande', err);
        this.ordersError = 'Impossible de mettre à jour le statut de la commande.';
      }
    });
  }

  // ========= STOCK =========
  loadLowStock(): void {
    this.lowStockLoading = true;
    this.lowStockError = null;

    this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({
      next: list => {
        this.lowStockProducts = list;
        this.lowStockLoading = false;
      },
      error: err => {
        console.error('Erreur chargement stock bas', err);
        this.lowStockError = 'Impossible de charger les produits en stock faible.';
        this.lowStockLoading = false;
      }
    });
  }

  onThresholdChange(): void {
    this.loadLowStock();
  }

  saveStock(p: Product): void {
    if (p.id == null) return;
    const newQty = p.stockQuantity ?? 0;

    this.adminStatsService.updateProductStock(p.id, newQty).subscribe({
      next: updated => {
        p.stockQuantity = updated.stockQuantity;
      },
      error: err => {
        console.error('Erreur mise à jour stock', err);
        this.lowStockError = 'Impossible de mettre à jour le stock pour ce produit.';
      }
    });
  }

  // ========= CRUD PRODUITS =========
  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getAll().subscribe({
      next: (list: Product[]) => {
        this.products = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.selectedFile = event.target.files[0];
    }
  }

  toggleCreateForm(): void {
    if (this.editingProductId !== null) {
      this.resetForm();
    } else {
      this.showCreateForm = !this.showCreateForm;
      this.error = '';
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

    const slug = this.slugify(this.newProduct.name);

    const payload: ProductCreateRequest = {
      ...this.newProduct,
      slug,
      currency: this.newProduct.currency ?? 'EUR',
    };

    this.isSubmitting = true;

    if (this.editingProductId === null) {
      // Création
      if (this.selectedFile) {
        this.productService.create(payload, this.selectedFile).subscribe({
          next: (created: Product) => {
            this.products = [created, ...this.products];
            this.resetForm();
          },
          error: (err) => {
            this.handleError(err);
            this.isSubmitting = false;
          },
        });
      }
    } else {
      // Edition
      this.productService.update(this.editingProductId, payload, this.selectedFile).subscribe({
        next: (updated: Product) => {
          this.products = this.products.map((p) => (p.id === updated.id ? updated : p));
          this.resetForm();
        },
        error: (err) => {
          this.handleError(err);
          this.isSubmitting = false;
        },
      });
    }
  }

  startEdit(p: Product): void {
    this.showCreateForm = true;
    this.editingProductId = p.id ?? null;
    this.error = '';
    this.selectedFile = null;

    if (p.imageUrls && p.imageUrls.length > 0) {
      this.currentImagePreview = 'http://localhost:8080' + p.imageUrls[0];
    } else {
      this.currentImagePreview = null;
    }

    this.newProduct = {
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      material: p.material ?? '',
      price: p.price,
      weightGrams: p.weightGrams ?? 0,
      isActive: p.isActive ?? true,
      currency: p.currency ?? 'EUR',
      slug: p.slug ?? '',
    };
  }

  handleError(err: any): void {
    console.error('Erreur backend:', err);
    this.error = err.error?.message || 'Une erreur est survenue. Vérifiez le serveur.';
  }

  private resetForm(): void {
    this.showCreateForm = false;
    this.editingProductId = null;
    this.selectedFile = null;
    this.currentImagePreview = null;
    this.isSubmitting = false;

    this.newProduct = {
      sku: '',
      name: '',
      description: '',
      material: '',
      price: 0,
      weightGrams: 0,
      isActive: true,
      currency: 'EUR',
      slug: '',
    };
  }

  onLogout(): void {
    this.auth.logout();
  }

  // ---------- suppression produit ----------
  openDeleteConfirm(p: Product): void {
    this.deleteTargetId = p.id ?? null;
    this.deleteTargetName = p.name;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
    this.deleteTargetName = '';
  }

  confirmDelete(): void {
    if (this.deleteTargetId == null) return;

    const id = this.deleteTargetId;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Erreur suppression produit', err);
        this.error = 'Impossible de supprimer ce produit.';
        this.cancelDelete();
      },
    });
  }
}
