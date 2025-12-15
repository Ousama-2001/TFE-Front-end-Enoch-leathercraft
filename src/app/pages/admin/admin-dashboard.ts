// src/app/pages/admin/admin-dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductCreateRequest } from '../../services/products.service';
import {
  AdminStatsService,
  SalesStatsResponse,
  AdminOrderResponse,
} from '../../services/admin-stats.service';

import { AdminReviewsPageComponent } from '../admin-reviews/admin-reviews';
import { SuperAdminUsersPageComponent } from '../super-admin-users/super-admin-users';
import { SuperAdminRequestsPageComponent } from '../super-admin-requests/super-admin-requests';
import { SuperAdminContactMessagesComponent } from '../super-admin-contact-messages/super-admin-contact-messages';

type OrderStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED';

interface ProductImageVm {
  id: number;
  url: string;
  isPrimary: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    AdminReviewsPageComponent,
    SuperAdminUsersPageComponent,
    SuperAdminRequestsPageComponent,
    SuperAdminContactMessagesComponent,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {

  activeTab:
    | 'stats'
    | 'orders'
    | 'returns'
    | 'products'
    | 'stock'
    | 'reviews'
    | 'support'
    | 'users'
    | 'requests' = 'stats';

  isSuperAdmin = false;
  isAdminOrSuperAdmin = false;

  orderStatusFilter: OrderStatusFilter = 'ALL';

  productsMode: 'active' | 'archived' = 'active';

  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  orders: AdminOrderResponse[] = [];
  ordersLoading = false;
  ordersError: string | null = null;

  showOrderModal = false;
  selectedOrder: AdminOrderResponse | null = null;
  modalStatus: string = 'PENDING';

  statusOptions = [
    { value: 'PENDING',           label: 'En attente' },
    { value: 'PAID',              label: 'Payée' },
    { value: 'SHIPPED',           label: 'Expédiée' },
    { value: 'DELIVERED',         label: 'Livrée' },
    { value: 'CANCELLED',         label: 'Annulée' },
    { value: 'RETURN_REQUESTED',  label: 'Retour demandé' },
    { value: 'RETURN_APPROVED',   label: 'Retour accepté (manuel)' },
    { value: 'RETURN_REJECTED',   label: 'Retour refusé (manuel)' },
  ];

  lowStockProducts: Product[] = [];
  lowStockLoading = false;
  lowStockError: string | null = null;
  lowStockThreshold = 5;

  products: Product[] = [];
  loading = false;
  error = '';
  showCreateForm = false;

  editingProductId: number | null = null;

  // ✅ nouvelles images (files)
  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];

  // ✅ images existantes DB (avec id)
  currentImages: ProductImageVm[] = [];

  isSubmitting = false;

  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';

  segmentOptions = [
    { id: 1, label: 'Homme' },
    { id: 2, label: 'Femme' },
    { id: 3, label: 'Petite maroquinerie' },
  ];

  typeOptions = [
    { id: 4, label: 'Sacs & sacoches' },
    { id: 5, label: 'Ceintures' },
    { id: 6, label: 'Portefeuilles' },
    { id: 7, label: 'Portes-cartes' },
    { id: 8, label: 'Sets de table' },
  ];

  get filteredTypeOptions() {
    const seg = this.newProduct.segmentCategoryId;

    if (seg === 1 || seg === 2) {
      return this.typeOptions.filter(t => t.id === 4 || t.id === 5);
    }

    if (seg === 3) {
      return this.typeOptions.filter(t => t.id === 6 || t.id === 7 || t.id === 8);
    }

    return this.typeOptions;
  }

  newProduct: ProductCreateRequest = {
    sku: '',
    name: '',
    description: '',
    price: 0,
    weightGrams: 0,
    isActive: true,
    currency: 'EUR',
    slug: '',
    segmentCategoryId: null,
    typeCategoryId: null,
  };

  // ------- RETOURS (modales) -------
  showReturnDetailsModal = false;
  showRejectModal = false;
  selectedReturnOrder: AdminOrderResponse | null = null;
  rejectReason: string = '';

  constructor(
    private adminStatsService: AdminStatsService,
    private productService: ProductService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.auth.isSuperAdmin();
    this.isAdminOrSuperAdmin = this.auth.isAdmin();

    this.loadStats();
    this.loadOrders();
    this.loadLowStock();
    this.loadProducts();
  }

  setTab(
    tab:
      | 'stats'
      | 'orders'
      | 'returns'
      | 'products'
      | 'stock'
      | 'reviews'
      | 'support'
      | 'users'
      | 'requests'
  ): void {
    this.activeTab = tab;

    if (tab === 'stats') {
      if (!this.stats) this.loadStats();
    } else if (tab === 'orders' || tab === 'returns') {
      if (!this.orders.length) this.loadOrders();
    } else if (tab === 'stock') {
      this.loadLowStock();
    } else if (tab === 'products') {
      this.loadProducts();
    }
  }

  private sortOrdersByDateDesc(list: AdminOrderResponse[]): AdminOrderResponse[] {
    return [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return db - da;
    });
  }

  get sortedOrders(): AdminOrderResponse[] {
    return this.sortOrdersByDateDesc(this.orders);
  }

  setOrderStatusFilter(s: OrderStatusFilter): void {
    this.orderStatusFilter = s;
  }

  get filteredOrders(): AdminOrderResponse[] {
    const base = this.sortedOrders;
    if (this.orderStatusFilter === 'ALL') return base;
    return base.filter(o => o.status === this.orderStatusFilter);
  }

  get sortedReturnOrdersAll(): AdminOrderResponse[] {
    return this.sortOrdersByDateDesc(
      this.orders.filter(o =>
        o.status === 'RETURN_REQUESTED' ||
        o.status === 'RETURN_APPROVED' ||
        o.status === 'RETURN_REJECTED'
      )
    );
  }

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

  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;

    this.adminStatsService.getAllOrders().subscribe({
      next: list => {
        this.orders = list ?? [];
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
      case 'PENDING':           return 'pending';
      case 'PAID':              return 'paid';
      case 'SHIPPED':           return 'shipped';
      case 'DELIVERED':         return 'delivered';
      case 'CANCELLED':         return 'cancelled';
      case 'RETURN_REQUESTED':  return 'return-requested';
      case 'RETURN_APPROVED':   return 'return-approved';
      case 'RETURN_REJECTED':   return 'return-rejected';
      default:                  return '';
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

  loadLowStock(): void {
    this.lowStockLoading = true;
    this.lowStockError = null;

    this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({
      next: list => {
        this.lowStockProducts = list ?? [];
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

  setProductsMode(mode: 'active' | 'archived'): void {
    if (this.productsMode === mode) return;

    this.productsMode = mode;

    if (mode === 'archived') {
      this.showCreateForm = false;
      this.editingProductId = null;
      this.clearSelectedFiles();
      this.currentImages = [];
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    const source$ =
      this.productsMode === 'active'
        ? this.productService.getAll()
        : this.productService.getArchived();

    source$.subscribe({
      next: (list: Product[]) => {
        this.products = list ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      },
    });
  }

  onFilesSelected(event: any): void {
    const files: File[] = Array.from(event.target.files || []);
    if (!files.length) return;

    this.selectedFiles = files;

    this.selectedPreviews.forEach((u) => URL.revokeObjectURL(u));
    this.selectedPreviews = files.map((f) => URL.createObjectURL(f));
  }

  removeSelectedFile(index: number): void {
    if (index < 0 || index >= this.selectedFiles.length) return;
    this.selectedFiles.splice(index, 1);

    const prev = this.selectedPreviews[index];
    if (prev) URL.revokeObjectURL(prev);
    this.selectedPreviews.splice(index, 1);
  }

  clearSelectedFiles(): void {
    this.selectedPreviews.forEach((u) => URL.revokeObjectURL(u));
    this.selectedPreviews = [];
    this.selectedFiles = [];
  }

  toggleCreateForm(): void {
    if (this.productsMode === 'archived') return;

    if (this.editingProductId !== null) {
      this.resetForm();
    } else {
      this.showCreateForm = !this.showCreateForm;
      this.error = '';
    }
  }

  clampPrice(): void {
    if (this.newProduct.price == null) return;
    if (this.newProduct.price < 0) this.newProduct.price = 0;
  }

  private skuPrefixFromSelection(): string {
    const seg = this.newProduct.segmentCategoryId;
    const type = this.newProduct.typeCategoryId;

    const segCode =
      seg === 1 ? 'MEN' :
        seg === 2 ? 'WOM' :
          seg === 3 ? 'SLG' : 'PRD';

    const typeCode =
      type === 4 ? 'BAG' :
        type === 5 ? 'BLT' :
          type === 6 ? 'WAL' :
            type === 7 ? 'CRD' :
              type === 8 ? 'SET' : 'ITM';

    return `${segCode}-${typeCode}`;
  }

  private generateSku(): string {
    const prefix = this.skuPrefixFromSelection();
    const suffix = String(Date.now()).slice(-4);
    return `${prefix}-${suffix}`;
  }

  private autoSkuIfEmpty(): void {
    if (!this.newProduct.sku || !this.newProduct.sku.trim()) {
      this.newProduct.sku = this.generateSku();
    }
  }

  normalizeSku(): void {
    if (!this.newProduct.sku) return;
    this.newProduct.sku = this.newProduct.sku.trim().toUpperCase();
  }

  onSegmentChange(): void {
    const allowedIds = this.filteredTypeOptions.map(t => t.id);
    if (this.newProduct.typeCategoryId != null && !allowedIds.includes(this.newProduct.typeCategoryId)) {
      this.newProduct.typeCategoryId = null;
    }
    this.autoSkuIfEmpty();
  }

  onTypeChange(): void {
    this.autoSkuIfEmpty();
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

    if (this.productsMode === 'archived') {
      this.error = 'Impossible de créer ou éditer en mode "archivés".';
      return;
    }

    if (!this.newProduct.name || !this.newProduct.sku || !this.newProduct.price) {
      this.error = 'Nom, SKU et prix sont obligatoires.';
      return;
    }

    if (this.newProduct.price < 0) {
      this.newProduct.price = 0;
    }

    if (!this.newProduct.segmentCategoryId || !this.newProduct.typeCategoryId) {
      this.error = 'Merci de choisir un segment et un type de produit.';
      return;
    }

    if (this.editingProductId === null && !this.selectedFiles.length) {
      this.error = 'Veuillez sélectionner au moins une image pour créer un nouveau produit.';
      return;
    }

    const slug = this.slugify(this.newProduct.name);

    const payload: ProductCreateRequest = {
      ...this.newProduct,
      slug,
      currency: this.newProduct.currency ?? 'EUR',
    };

    this.isSubmitting = true;

    // CREATE
    if (this.editingProductId === null) {
      this.productService.create(payload, this.selectedFiles).subscribe({
        next: (created: Product) => {
          this.products = [created, ...this.products];
          this.resetForm();
        },
        error: (err) => {
          this.handleError(err);
          this.isSubmitting = false;
        },
      });
      return;
    }

    // UPDATE
    const filesToSend = this.selectedFiles.length ? this.selectedFiles : null;

    this.productService.update(this.editingProductId, payload, filesToSend).subscribe({
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

  private toAbsoluteUrl(u: string): string {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/')) return 'http://localhost:8080' + u;
    return 'http://localhost:8080/' + u;
  }

  startEdit(p: Product): void {
    if (this.productsMode === 'archived') return;

    this.showCreateForm = true;
    this.editingProductId = p.id ?? null;
    this.error = '';

    this.clearSelectedFiles();

    // ✅ Priorité : images[] (avec id) si dispo, sinon fallback imageUrls[]
    const anyP: any = p as any;

    if (Array.isArray(anyP.images) && anyP.images.length) {
      this.currentImages = anyP.images.map((img: any) => ({
        id: img.id,
        url: this.toAbsoluteUrl(img.url),
        isPrimary: !!img.isPrimary,
      }));
    } else {
      const urls = (p.imageUrls || []).map(u => this.toAbsoluteUrl(u)).filter(Boolean);
      this.currentImages = urls.map((url, idx) => ({
        id: -(idx + 1), // ids fake (pas supprimables)
        url,
        isPrimary: idx === 0,
      }));
    }

    this.newProduct = {
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      weightGrams: p.weightGrams ?? 0,
      isActive: p.isActive ?? true,
      currency: (p as any).currency ?? 'EUR',
      slug: (p as any).slug ?? '',
      segmentCategoryId: (p as any).segmentCategoryId ?? null,
      typeCategoryId: (p as any).typeCategoryId ?? null,
    };
  }

  deleteExistingImage(imageId: number): void {
    // ids fake => pas supprimables (fallback)
    if (imageId < 0) {
      alert("Cette image vient de 'imageUrls' (sans id). Charge le produit avec 'images' pour pouvoir supprimer.");
      return;
    }
    if (!this.editingProductId) return;

    if (!confirm('Supprimer cette image ?')) return;

    this.productService.deleteImage(this.editingProductId, imageId).subscribe({
      next: () => {
        this.currentImages = this.currentImages.filter(img => img.id !== imageId);
      },
      error: err => {
        console.error('Erreur suppression image', err);
        alert('Impossible de supprimer cette image.');
      }
    });
  }

  restoreProduct(p: Product): void {
    if (!p.id) return;

    if (!confirm(`Restaurer le produit "${p.name}" ?`)) return;

    this.isSubmitting = true;
    this.productService.restore(p.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Erreur restauration produit', err);
        this.isSubmitting = false;
        alert('Erreur lors de la restauration du produit.');
      }
    });
  }

  handleError(err: any): void {
    console.error('Erreur backend:', err);
    this.error = err.error?.message || 'Une erreur est survenue. Vérifiez le serveur.';
  }

  private resetForm(): void {
    this.showCreateForm = false;
    this.editingProductId = null;
    this.isSubmitting = false;

    this.clearSelectedFiles();
    this.currentImages = [];

    this.newProduct = {
      sku: '',
      name: '',
      description: '',
      price: 0,
      weightGrams: 0,
      isActive: true,
      currency: 'EUR',
      slug: '',
      segmentCategoryId: null,
      typeCategoryId: null,
    };
  }

  onLogout(): void {
    this.auth.logout();
  }

  openDeleteConfirm(p: Product): void {
    if (this.productsMode === 'archived') return;

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
        this.error = 'Impossible d’archiver ce produit.';
        this.cancelDelete();
      },
    });
  }

  openReturnDetails(order: AdminOrderResponse): void {
    this.selectedReturnOrder = order;
    this.showReturnDetailsModal = true;
  }

  closeReturnDetails(): void {
    this.showReturnDetailsModal = false;
    this.selectedReturnOrder = null;
  }

  approveReturn(order: AdminOrderResponse): void {
    if (!order.id) return;

    this.adminStatsService.approveReturn(order.id).subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === updated.id ? updated : o);
      },
      error: err => {
        console.error('Erreur acceptation retour', err);
        this.ordersError = 'Impossible d’accepter ce retour.';
      }
    });
  }

  openRejectModal(order: AdminOrderResponse): void {
    this.selectedReturnOrder = order;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedReturnOrder = null;
  }

  confirmReject(): void {
    if (!this.selectedReturnOrder?.id) return;

    const id = this.selectedReturnOrder.id;
    const reason = this.rejectReason.trim();

    if (!reason) {
      alert('Merci de saisir une raison de refus.');
      return;
    }

    this.adminStatsService.rejectReturn(id, reason).subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === updated.id ? updated : o);
        this.closeRejectModal();
      },
      error: err => {
        console.error('Erreur refus retour', err);
        this.ordersError = 'Impossible de refuser ce retour.';
      }
    });
  }
}
