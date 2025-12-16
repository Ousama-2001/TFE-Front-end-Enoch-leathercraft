// src/app/pages/admin/admin-dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import {
  ProductService,
  Product,
  ProductCreateRequest,
} from '../../services/products.service';
import {
  AdminStatsService,
  SalesStatsResponse,
  AdminOrderResponse,
} from '../../services/admin-stats.service';

import { CouponService, Coupon, CouponRequest } from '../../services/coupon.service';

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

type PromoStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';

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
    | 'promotions'
    | 'stock'
    | 'reviews'
    | 'support'
    | 'users'
    | 'requests' = 'stats';

  isSuperAdmin = false;
  isAdminOrSuperAdmin = false;

  orderStatusFilter: OrderStatusFilter = 'ALL';

  productsMode: 'active' | 'archived' = 'active';
  showProductForm = false;

  // ------- STATS -------
  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  // ------- COMMANDES -------
  orders: AdminOrderResponse[] = [];
  ordersLoading = false;
  ordersError: string | null = null;

  showOrderModal = false;
  selectedOrder: AdminOrderResponse | null = null;
  modalStatus: string = 'PENDING';

  statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID', label: 'Payée' },
    { value: 'SHIPPED', label: 'Expédiée' },
    { value: 'DELIVERED', label: 'Livrée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'RETURN_REQUESTED', label: 'Retour demandé' },
    { value: 'RETURN_APPROVED', label: 'Retour accepté (manuel)' },
    { value: 'RETURN_REJECTED', label: 'Retour refusé (manuel)' },
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

  editingProductId: number | null = null;

  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];
  currentImagesFromApi: string[] = [];

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
      return this.typeOptions.filter((t) => t.id === 4 || t.id === 5);
    }

    if (seg === 3) {
      return this.typeOptions.filter((t) => t.id === 6 || t.id === 7 || t.id === 8);
    }

    return this.typeOptions;
  }

  // =========================
  // ✅ COUPONS UI
  // =========================
  coupons: Coupon[] = [];
  couponsLoading = false;
  couponsError: string | null = null;

  couponForm: CouponRequest = {
    code: '',
    percent: 10,
    startsAt: null, // UI: YYYY-MM-DD -> on convertit en ISO Z au submit
    endsAt: null,
    active: true,
    maxUses: null,
  };

  editingCouponId: number | null = null;
  couponSubmitting = false;

  // =========================
  // ✅ SKU AUTO (on le garde côté TS, mais tu peux cacher l’affichage en HTML)
  // =========================
  skuAuto = true;

  // =========================
  // ✅ NEW PRODUCT (Option B: promoStartAt/promoEndAt = YYYY-MM-DD)
  // =========================
  newProduct: ProductCreateRequest = {
    sku: '',
    name: '',
    description: '',
    // material & isActive : tu ne veux plus dans le form, mais ça ne casse rien de les garder ici
    material: '',
    price: 0,
    weightGrams: 0,
    isActive: true,
    currency: 'EUR',
    slug: '',
    segmentCategoryId: null,
    typeCategoryId: null,

    // ✅ promo produit (date only)
    promoPrice: null,
    promoStartAt: null, // "YYYY-MM-DD"
    promoEndAt: null,   // "YYYY-MM-DD"

    // promoCode supprimé (géré par coupons)
  } as any;

  // ------- RETOURS (modales) -------
  showReturnDetailsModal = false;
  showRejectModal = false;
  selectedReturnOrder: AdminOrderResponse | null = null;
  rejectReason: string = '';

  constructor(
    private adminStatsService: AdminStatsService,
    public productService: ProductService,
    private auth: AuthService,
    private couponService: CouponService
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
      | 'promotions'
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
    } else if (tab === 'promotions') {
      this.loadCoupons();
    }
  }

  // =========================
  // ✅ Helpers dates
  // - Produits : Option B => on garde "YYYY-MM-DD" tel quel
  // - Coupons  : backend attend Instant => on convertit date-only en ISO
  // =========================
  private dateOnlyToIsoStart(v?: string | null): string | null {
    if (!v) return null;
    const s = String(v).trim();
    if (!s) return null;
    if (s.length === 10) return `${s}T00:00:00Z`;
    return s;
  }

  private dateOnlyToIsoEnd(v?: string | null): string | null {
    if (!v) return null;
    const s = String(v).trim();
    if (!s) return null;
    if (s.length === 10) return `${s}T23:59:59Z`;
    return s;
  }

  private isoToDateOnly(v?: string | null): string | null {
    if (!v) return null;
    const s = String(v);
    if (s.length >= 10) return s.substring(0, 10);
    return null;
  }

  private todayDateOnly(): string {
    // YYYY-MM-DD (timezone locale)
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // =========================
  // ✅ SKU AUTO helpers
  // =========================
  private segmentCode(segId: number | null | undefined): string {
    if (segId === 1) return 'HOM';
    if (segId === 2) return 'FEM';
    if (segId === 3) return 'PM';
    return 'GEN';
  }

  private typeCode(typeId: number | null | undefined): string {
    switch (typeId) {
      case 4: return 'BAG';
      case 5: return 'BELT';
      case 6: return 'WAL';
      case 7: return 'CARD';
      case 8: return 'MAT';
      default: return 'ITEM';
    }
  }

  private buildSku(segId: number | null, typeId: number | null): string {
    const s = this.segmentCode(segId);
    const t = this.typeCode(typeId);
    const suf = String(Date.now()).slice(-5);
    return `${s}-${t}-${suf}`;
  }

  private ensureAutoSku(): void {
    if (!this.skuAuto) return;
    if (!this.newProduct.segmentCategoryId || !this.newProduct.typeCategoryId) return;

    this.newProduct.sku = this.buildSku(
      this.newProduct.segmentCategoryId as any,
      this.newProduct.typeCategoryId as any
    ) as any;
  }

  onSkuManualInput(): void {
    this.skuAuto = false;
  }

  resetSkuAuto(): void {
    this.skuAuto = true;
    this.ensureAutoSku();
  }

  // =========================
  // ✅ COMMANDES
  // =========================
  private sortOrdersByDateDesc(list: AdminOrderResponse[]): AdminOrderResponse[] {
    return [...list].sort((a, b) => {
      const da = new Date((a as any).createdAt).getTime();
      const db = new Date((b as any).createdAt).getTime();
      return db - da;
    });
  }

  get sortedOrders(): AdminOrderResponse[] {
    return this.sortOrdersByDateDesc(this.orders);
  }

  get filteredOrders(): AdminOrderResponse[] {
    const base = this.sortedOrders;
    if (this.orderStatusFilter === 'ALL') return base;
    return base.filter((o) => (o as any).status === this.orderStatusFilter);
  }

  get sortedReturnOrdersAll(): AdminOrderResponse[] {
    return this.sortOrdersByDateDesc(
      this.orders.filter((o) => {
        const st = (o as any).status;
        return (
          st === 'RETURN_REQUESTED' ||
          st === 'RETURN_APPROVED' ||
          st === 'RETURN_REJECTED'
        );
      })
    );
  }

  getOrderEmail(o: AdminOrderResponse | null | undefined): string {
    if (!o) return '';
    const anyO: any = o as any;
    return (
      anyO.customerEmail ||
      anyO.email ||
      anyO.customer?.email ||
      anyO.userEmail ||
      anyO.buyerEmail ||
      ''
    );
  }

  // ========= STATS =========
  loadStats(): void {
    this.statsLoading = true;
    this.statsError = null;

    this.adminStatsService.getSalesStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.statsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats', err);
        this.statsError = 'Impossible de charger les statistiques de ventes.';
        this.statsLoading = false;
      },
    });
  }

  // ========= COMMANDES =========
  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;

    this.adminStatsService.getAllOrders().subscribe({
      next: (list) => {
        this.orders = list ?? [];
        this.ordersLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes', err);
        this.ordersError = 'Impossible de charger les commandes.';
        this.ordersLoading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'PAID': return 'paid';
      case 'SHIPPED': return 'shipped';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      case 'RETURN_REQUESTED': return 'return-requested';
      case 'RETURN_APPROVED': return 'return-approved';
      case 'RETURN_REJECTED': return 'return-rejected';
      default: return '';
    }
  }

  openOrderModal(order: AdminOrderResponse): void {
    this.selectedOrder = { ...order };
    this.modalStatus = (order as any).status;
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  saveOrderStatusFromModal(): void {
    if (!(this.selectedOrder as any)?.id) return;

    const orderId = (this.selectedOrder as any).id;
    const newStatus = this.modalStatus;

    this.adminStatsService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((o) =>
          (o as any).id === (updated as any).id ? updated : o
        );
        this.selectedOrder = updated;
        this.closeOrderModal();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut commande', err);
        this.ordersError = 'Impossible de mettre à jour le statut de la commande.';
      },
    });
  }

  // ========= STOCK =========
  loadLowStock(): void {
    this.lowStockLoading = true;
    this.lowStockError = null;

    this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({
      next: (list) => {
        this.lowStockProducts = list ?? [];
        this.lowStockLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stock bas', err);
        this.lowStockError = 'Impossible de charger les produits en stock faible.';
        this.lowStockLoading = false;
      },
    });
  }

  onThresholdChange(): void {
    this.loadLowStock();
  }

  saveStock(p: Product): void {
    if (p.id == null) return;
    const newQty = Math.max(0, Number(p.stockQuantity ?? 0));

    this.adminStatsService.updateProductStock(p.id, newQty).subscribe({
      next: (updated) => {
        p.stockQuantity = updated.stockQuantity;
      },
      error: (err) => {
        console.error('Erreur mise à jour stock', err);
        this.lowStockError = 'Impossible de mettre à jour le stock pour ce produit.';
      },
    });
  }

  // ========= MODE PRODUITS =========
  setProductsMode(mode: 'active' | 'archived'): void {
    if (this.productsMode === mode) return;

    this.productsMode = mode;

    if (mode === 'archived') {
      this.closeProductForm();
    }

    this.loadProducts();
  }

  // ========= CRUD PRODUITS =========
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

  openCreateProduct(): void {
    if (this.productsMode === 'archived') return;
    this.resetForm();
    this.showProductForm = true;

    setTimeout(() => {
      const el = document.getElementById('product-form-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProductId = null;
    this.clearSelectedFiles();
    this.currentImagesFromApi = [];
    this.error = '';
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

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  clampPrice(): void {
    const v = Number(this.newProduct.price ?? 0);
    if (isNaN(v) || v < 0) this.newProduct.price = 0 as any;
  }

  clampPromoPrice(): void {
    if (this.newProduct.promoPrice == null) return;
    let v = Number(this.newProduct.promoPrice ?? 0);
    if (isNaN(v) || v < 0) v = 0;
    this.newProduct.promoPrice = v as any;

    // ✅ si on met un prix promo, on met la date du jour par défaut si vide
    if (v > 0 && !this.newProduct.promoStartAt) {
      this.newProduct.promoStartAt = this.todayDateOnly() as any;
    }
  }

  private normalizeProductPromoFields(): void {
    // ✅ si promoPrice vide/0 => on nettoie
    const promo = Number(this.newProduct.promoPrice ?? 0);
    if (!promo || promo <= 0) {
      (this.newProduct as any).promoPrice = null;
      (this.newProduct as any).promoStartAt = null;
      (this.newProduct as any).promoEndAt = null;
      return;
    }

    // ✅ si end < start => swap
    const s = this.newProduct.promoStartAt ? String(this.newProduct.promoStartAt) : null;
    const e = this.newProduct.promoEndAt ? String(this.newProduct.promoEndAt) : null;

    if (s && e && e < s) {
      const tmp = (this.newProduct as any).promoStartAt;
      (this.newProduct as any).promoStartAt = (this.newProduct as any).promoEndAt;
      (this.newProduct as any).promoEndAt = tmp;
    }
  }

  submitForm(): void {
    this.error = '';

    if (this.productsMode === 'archived') {
      this.error = 'Impossible de créer ou éditer en mode "archivés".';
      return;
    }

    if (!this.newProduct.name || !this.newProduct.sku || Number(this.newProduct.price ?? 0) <= 0) {
      this.error = 'Nom, SKU et prix sont obligatoires.';
      return;
    }

    if (!this.newProduct.segmentCategoryId || !this.newProduct.typeCategoryId) {
      this.error = 'Merci de choisir un segment et un type de produit.';
      return;
    }

    if (this.editingProductId === null && !this.selectedFiles.length) {
      this.error = 'Veuillez sélectionner au moins une image pour créer un nouveau produit.';
      return;
    }

    // ✅ promo produit (LocalDate)
    this.normalizeProductPromoFields();

    const slug = this.slugify(String(this.newProduct.name));

    const payload: ProductCreateRequest = {
      ...this.newProduct,
      slug,
      currency: (this.newProduct as any).currency ?? 'EUR',
      isActive: (this.newProduct as any).isActive ?? true,
      // ✅ PRODUIT: Option B => on envoie YYYY-MM-DD tel quel
      promoStartAt: (this.newProduct as any).promoStartAt ?? null,
      promoEndAt: (this.newProduct as any).promoEndAt ?? null,
      promoPrice: (this.newProduct as any).promoPrice ?? null,
      material: (this.newProduct as any).material ?? '',
    } as any;

    this.isSubmitting = true;

    if (this.editingProductId === null) {
      this.productService.create(payload, this.selectedFiles).subscribe({
        next: (created: Product) => {
          this.products = [created, ...this.products];
          this.resetForm();
          this.showProductForm = false;
          this.isSubmitting = false;
        },
        error: (err) => {
          this.handleError(err);
          this.isSubmitting = false;
        },
      });
      return;
    }

    const filesToSend = this.selectedFiles.length ? this.selectedFiles : null;

    this.productService.update(this.editingProductId, payload, filesToSend).subscribe({
      next: (updated: Product) => {
        this.products = this.products.map((p) => (p.id === updated.id ? updated : p));
        this.resetForm();
        this.showProductForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        this.handleError(err);
        this.isSubmitting = false;
      },
    });
  }

  startEdit(p: Product): void {
    if (this.productsMode === 'archived') return;

    this.skuAuto = false;
    this.editingProductId = p.id ?? null;
    this.error = '';
    this.showProductForm = true;

    this.clearSelectedFiles();

    this.currentImagesFromApi = (p.imageUrls || [])
      .map((u) => {
        if (!u) return '';
        if (u.startsWith('http://') || u.startsWith('https://')) return u;
        if (u.startsWith('/')) return 'http://localhost:8080' + u;
        return 'http://localhost:8080/' + u;
      })
      .filter(Boolean);

    // ✅ promoStartAt / promoEndAt : back renvoie LocalDate (YYYY-MM-DD)
    const promoStart = (p as any).promoStartAt ?? null;
    const promoEnd = (p as any).promoEndAt ?? null;

    this.newProduct = {
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      material: (p as any).material ?? '',
      price: p.price,
      weightGrams: p.weightGrams ?? 0,
      isActive: (p as any).isActive ?? true,
      currency: (p as any).currency ?? 'EUR',
      slug: (p as any).slug ?? '',
      segmentCategoryId: (p as any).segmentCategoryId ?? null,
      typeCategoryId: (p as any).typeCategoryId ?? null,

      promoPrice: (p as any).promoPrice ?? null,
      promoStartAt: this.isoToDateOnly(promoStart),
      promoEndAt: this.isoToDateOnly(promoEnd),
    } as any;

    setTimeout(() => {
      const el = document.getElementById('product-form-panel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
      },
    });
  }

  handleError(err: any): void {
    console.error('Erreur backend:', err);
    this.error = err.error?.message || 'Une erreur est survenue. Vérifiez le serveur.';
  }

  resetForm(): void {
    this.editingProductId = null;
    this.isSubmitting = false;

    this.clearSelectedFiles();
    this.currentImagesFromApi = [];

    this.skuAuto = true;

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
      segmentCategoryId: null,
      typeCategoryId: null,

      promoPrice: null,
      promoStartAt: null,
      promoEndAt: null,
    } as any;
  }

  // ✅ Segment change : filtre + SKU auto
  onSegmentChange(): void {
    const allowedIds = this.filteredTypeOptions.map((t) => t.id);
    if (
      this.newProduct.typeCategoryId != null &&
      !allowedIds.includes(this.newProduct.typeCategoryId as any)
    ) {
      this.newProduct.typeCategoryId = null as any;
    }
    this.ensureAutoSku();
  }

  // ✅ Type change : SKU auto
  onTypeChange(): void {
    this.ensureAutoSku();
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

  // =========================
  // ✅ PROMO helpers (produits) - calcul local, pas besoin d’un champ backend
  // =========================
  private parseDateOnly(d?: string | null): Date | null {
    if (!d) return null;
    const s = String(d).substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    // 00:00 local
    return new Date(`${s}T00:00:00`);
  }

  getPromoStatus(p: Product): PromoStatus {
    const promoPrice = Number((p as any).promoPrice ?? 0);
    if (!promoPrice || promoPrice <= 0) return 'INACTIVE';

    const now = new Date();

    const start = this.parseDateOnly((p as any).promoStartAt ?? null);
    const end = this.parseDateOnly((p as any).promoEndAt ?? null);

    if (start && now.getTime() < start.getTime()) return 'UPCOMING';
    if (end) {
      // fin de journée
      const endEod = new Date(end.getTime());
      endEod.setHours(23, 59, 59, 999);
      if (now.getTime() > endEod.getTime()) return 'EXPIRED';
    }

    return 'ACTIVE';
  }

  getPromoStatusLabel(p: Product): string {
    const s = this.getPromoStatus(p);
    switch (s) {
      case 'ACTIVE': return 'Promo';
      case 'UPCOMING': return 'À venir';
      case 'EXPIRED': return 'Expirée';
      default: return '—';
    }
  }

  getPromoStatusClass(p: Product): string {
    const s = this.getPromoStatus(p);
    switch (s) {
      case 'ACTIVE': return 'promo-active';
      case 'UPCOMING': return 'promo-upcoming';
      case 'EXPIRED': return 'promo-expired';
      default: return 'promo-inactive';
    }
  }

  // ------- RETOURS (modales) -------
  openReturnDetails(order: AdminOrderResponse): void {
    this.selectedReturnOrder = order;
    this.showReturnDetailsModal = true;
  }

  closeReturnDetails(): void {
    this.showReturnDetailsModal = false;
    this.selectedReturnOrder = null;
  }

  approveReturn(order: AdminOrderResponse): void {
    const anyO: any = order as any;
    if (!anyO.id) return;

    this.adminStatsService.approveReturn(anyO.id).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((o) =>
          (o as any).id === (updated as any).id ? updated : o
        );
      },
      error: (err) => {
        console.error('Erreur acceptation retour', err);
        this.ordersError = 'Impossible d’accepter ce retour.';
      },
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
    const anyO: any = this.selectedReturnOrder as any;
    if (!anyO?.id) return;

    const id = anyO.id;
    const reason = this.rejectReason.trim();

    if (!reason) {
      alert('Merci de saisir une raison de refus.');
      return;
    }

    this.adminStatsService.rejectReturn(id, reason).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((o) =>
          (o as any).id === (updated as any).id ? updated : o
        );
        this.closeRejectModal();
      },
      error: (err) => {
        console.error('Erreur refus retour', err);
        this.ordersError = 'Impossible de refuser ce retour.';
      },
    });
  }

  // =========================
  // ✅ COUPONS CRUD (Instant côté back)
  // =========================
  loadCoupons(): void {
    this.couponsLoading = true;
    this.couponsError = null;

    this.couponService.getAllAdmin().subscribe({
      next: (list) => {
        this.coupons = (list ?? []).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
        this.couponsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement coupons', err);
        this.couponsError = 'Impossible de charger les coupons.';
        this.couponsLoading = false;
      },
    });
  }

  clampCouponPercent(): void {
    let v = Number(this.couponForm.percent ?? 0);
    if (isNaN(v)) v = 0;
    v = Math.round(v);
    if (v < 1) v = 1;
    if (v > 90) v = 90;
    this.couponForm.percent = v;
  }

  private normalizeCouponCode(raw: string): string {
    return (raw || '').trim().toUpperCase().replace(/\s+/g, '-');
  }

  submitCouponForm(): void {
    this.couponsError = null;

    const code = this.normalizeCouponCode(this.couponForm.code);
    const percent = Number(this.couponForm.percent ?? 0);

    if (!code) {
      this.couponsError = 'Le code coupon est obligatoire.';
      return;
    }
    if (!percent || percent < 1 || percent > 90) {
      this.couponsError = 'Le pourcentage doit être entre 1 et 90.';
      return;
    }

    const startsIso = this.dateOnlyToIsoStart(this.couponForm.startsAt ?? null);
    const endsIso = this.dateOnlyToIsoEnd(this.couponForm.endsAt ?? null);

    const payload: CouponRequest = {
      code,
      percent,
      active: this.couponForm.active ?? true,
      startsAt: startsIso,
      endsAt: endsIso,
      maxUses: this.couponForm.maxUses ?? null,
    };

    this.couponSubmitting = true;

    if (this.editingCouponId == null) {
      this.couponService.createAdmin(payload).subscribe({
        next: (created) => {
          this.coupons = [created, ...this.coupons];
          this.resetCouponForm();
          this.couponSubmitting = false;
        },
        error: (err) => {
          console.error('Erreur création coupon', err);
          this.couponsError = err?.error?.message || 'Impossible de créer le coupon.';
          this.couponSubmitting = false;
        },
      });
      return;
    }

    this.couponService.updateAdmin(this.editingCouponId, payload).subscribe({
      next: (updated) => {
        this.coupons = this.coupons.map((c) => (c.id === updated.id ? updated : c));
        this.resetCouponForm();
        this.couponSubmitting = false;
      },
      error: (err) => {
        console.error('Erreur update coupon', err);
        this.couponsError = err?.error?.message || 'Impossible de modifier le coupon.';
        this.couponSubmitting = false;
      },
    });
  }

  editCoupon(c: Coupon): void {
    this.editingCouponId = c.id;

    this.couponForm = {
      code: c.code,
      percent: c.percent,
      startsAt: this.isoToDateOnly(c.startsAt ?? null),
      endsAt: this.isoToDateOnly(c.endsAt ?? null),
      active: c.active,
      maxUses: c.maxUses ?? null,
    };
  }

  toggleCouponActive(c: Coupon): void {
    const payload: CouponRequest = {
      code: c.code,
      percent: c.percent,
      startsAt: c.startsAt ?? null,
      endsAt: c.endsAt ?? null,
      active: !c.active,
      maxUses: c.maxUses ?? null,
    };

    this.couponService.updateAdmin(c.id, payload).subscribe({
      next: (updated) => {
        this.coupons = this.coupons.map((x) => (x.id === updated.id ? updated : x));
      },
      error: (err) => {
        console.error('Erreur toggle coupon', err);
        alert('Impossible de changer le statut du coupon.');
      },
    });
  }

  deleteCoupon(c: Coupon): void {
    if (!confirm(`Supprimer le coupon "${c.code}" ?`)) return;

    this.couponService.deleteAdmin(c.id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter((x) => x.id !== c.id);
      },
      error: (err) => {
        console.error('Erreur suppression coupon', err);
        alert('Impossible de supprimer le coupon.');
      },
    });
  }

  resetCouponForm(): void {
    this.editingCouponId = null;
    this.couponForm = {
      code: '',
      percent: 10,
      startsAt: null,
      endsAt: null,
      active: true,
      maxUses: null,
    };
    this.couponsError = null;
    this.couponSubmitting = false;
  }

  getCouponStatus(c: Coupon): PromoStatus {
    const now = new Date();
    const start = c.startsAt ? new Date(c.startsAt) : null;
    const end = c.endsAt ? new Date(c.endsAt) : null;

    if (!c.active) return 'INACTIVE';
    if (start && now.getTime() < start.getTime()) return 'UPCOMING';
    if (end && now.getTime() > end.getTime()) return 'EXPIRED';
    return 'ACTIVE';
  }

  getCouponStatusLabel(c: Coupon): string {
    const s = this.getCouponStatus(c);
    switch (s) {
      case 'ACTIVE': return 'Actif';
      case 'UPCOMING': return 'À venir';
      case 'EXPIRED': return 'Expiré';
      default: return 'Inactif';
    }
  }

  getCouponStatusClass(c: Coupon): string {
    const s = this.getCouponStatus(c);
    switch (s) {
      case 'ACTIVE': return 'pill-ok';
      case 'UPCOMING': return 'pill-warn';
      case 'EXPIRED': return 'pill-bad';
      default: return 'pill-off';
    }
  }
}
