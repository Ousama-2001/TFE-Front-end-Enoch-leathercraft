import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductCreateRequest } from '../../services/products.service';
import { AdminStatsService, SalesStatsResponse, AdminOrderResponse } from '../../services/admin-stats.service';
import { CouponService, Coupon, CouponRequest } from '../../services/coupon.service';

import { AdminReviewsPageComponent } from '../admin-reviews/admin-reviews';
import { SuperAdminUsersPageComponent } from '../super-admin-users/super-admin-users';
import { SuperAdminRequestsPageComponent } from '../super-admin-requests/super-admin-requests';
import { SuperAdminContactMessagesComponent } from '../super-admin-contact-messages/super-admin-contact-messages';

type OrderStatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
type PromoStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CurrencyPipe, DatePipe,
    AdminReviewsPageComponent, SuperAdminUsersPageComponent, SuperAdminRequestsPageComponent, SuperAdminContactMessagesComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'stats';
  isSuperAdmin = false;
  isAdminOrSuperAdmin = false;

  // Filtres
  orderStatusFilter: OrderStatusFilter = 'ALL';
  productsMode: 'active' | 'archived' = 'active';
  showProductForm = false;

  // Stats
  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  // Commandes
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
    { value: 'RETURN_APPROVED', label: 'Retour accepté' },
    { value: 'RETURN_REJECTED', label: 'Retour refusé' },
  ];

  // Stock
  lowStockProducts: Product[] = [];
  lowStockLoading = false;
  lowStockError: string | null = null;
  lowStockThreshold = 5;

  // Produits
  products: Product[] = [];
  loading = false;
  error = '';
  editingProductId: number | null = null;
  isSubmitting = false;

  // Images
  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];
  currentImagesFromApi: string[] = [];

  // Modales
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';

  // Selects
  segmentOptions = [
    { id: 1, label: 'Homme' }, { id: 2, label: 'Femme' }, { id: 3, label: 'Petite maroquinerie' }
  ];
  typeOptions = [
    { id: 4, label: 'Sacs & sacoches' }, { id: 5, label: 'Ceintures' }, { id: 6, label: 'Portefeuilles' },
    { id: 7, label: 'Portes-cartes' }, { id: 8, label: 'Sets de table' }
  ];

  // Form Produit
  skuAuto = true;
  newProduct: ProductCreateRequest = {
    sku: '', name: '', description: '', material: '', price: 0, weightGrams: 0,
    isActive: true, currency: 'EUR', slug: '', segmentCategoryId: null, typeCategoryId: null,
    promoPrice: null, promoStartAt: null, promoEndAt: null,
  } as any;

  // Coupons
  coupons: Coupon[] = [];
  couponsLoading = false;
  couponsError: string | null = null;
  couponForm: CouponRequest = { code: '', percent: 10, startsAt: null, endsAt: null, active: true, maxUses: null };
  editingCouponId: number | null = null;
  couponSubmitting = false;

  // Retours
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

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'stats' && !this.stats) this.loadStats();
    else if ((tab === 'orders' || tab === 'returns') && !this.orders.length) this.loadOrders();
    else if (tab === 'stock') this.loadLowStock();
    else if (tab === 'products') this.loadProducts();
    else if (tab === 'promotions') this.loadCoupons();
  }

  // ==========================================
  // ✅ LOGIQUE PROMO & IMAGES
  // ==========================================
  get hasPromo(): boolean { return this.newProduct.promoPrice !== null && this.newProduct.promoPrice !== undefined; }

  togglePromo(): void {
    if (this.hasPromo) {
      this.newProduct.promoPrice = null;
      this.newProduct.promoStartAt = null;
      this.newProduct.promoEndAt = null;
    } else {
      this.newProduct.promoPrice = 0 as any;
      this.newProduct.promoStartAt = this.todayDateOnly() as any;
    }
  }

  private todayDateOnly(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  onFilesSelected(event: any): void {
    const files: File[] = Array.from(event.target.files || []);
    if (!files.length) return;
    this.selectedFiles.push(...files);
    files.forEach(f => this.selectedPreviews.push(URL.createObjectURL(f)));
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    URL.revokeObjectURL(this.selectedPreviews[index]);
    this.selectedPreviews.splice(index, 1);
  }

  clearSelectedFiles(): void {
    this.selectedPreviews.forEach(u => URL.revokeObjectURL(u));
    this.selectedPreviews = [];
    this.selectedFiles = [];
    this.currentImagesFromApi = [];
  }

  // ==========================================
  // PRODUITS
  // ==========================================
  loadProducts(): void {
    this.loading = true;
    const obs = this.productsMode === 'active' ? this.productService.getAll() : this.productService.getArchived();
    obs.subscribe({
      next: (l) => { this.products = l ?? []; this.loading = false; },
      error: () => { this.error = 'Erreur chargement produits'; this.loading = false; }
    });
  }

  get filteredTypeOptions() {
    const seg = this.newProduct.segmentCategoryId;
    if (seg === 1 || seg === 2) return this.typeOptions.filter((t) => t.id === 4 || t.id === 5);
    if (seg === 3) return this.typeOptions.filter((t) => t.id === 6 || t.id === 7 || t.id === 8);
    return this.typeOptions;
  }

  onSkuManualInput(): void { this.skuAuto = false; }
  resetSkuAuto(): void { this.skuAuto = true; this.ensureAutoSku(); }
  onSegmentChange(): void { this.ensureAutoSku(); }
  onTypeChange(): void { this.ensureAutoSku(); }
  clampPrice(): void { if(this.newProduct.price < 0) this.newProduct.price = 0 as any; }
  clampPromoPrice(): void { if(this.newProduct.promoPrice && this.newProduct.promoPrice < 0) this.newProduct.promoPrice = 0 as any; }

  private ensureAutoSku(): void {
    if (!this.skuAuto || !this.newProduct.segmentCategoryId) return;
    let seg = 'GEN';
    if(this.newProduct.segmentCategoryId === 1) seg = 'HOM';
    if(this.newProduct.segmentCategoryId === 2) seg = 'FEM';
    if(this.newProduct.segmentCategoryId === 3) seg = 'PM';
    this.newProduct.sku = `${seg}-ITM-${String(Date.now()).slice(-4)}` as any;
  }

  openCreateProduct(): void {
    if (this.productsMode === 'archived') return;
    this.resetForm();
    this.showProductForm = true;
    setTimeout(() => document.getElementById('product-form-panel')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProductId = null;
    this.clearSelectedFiles();
  }

  resetForm(): void {
    this.editingProductId = null;
    this.isSubmitting = false;
    this.clearSelectedFiles();
    this.skuAuto = true;
    this.newProduct = {
      sku: '', name: '', description: '', material: '', price: 0, weightGrams: 0,
      isActive: true, currency: 'EUR', slug: '', segmentCategoryId: null, typeCategoryId: null,
      promoPrice: null, promoStartAt: null, promoEndAt: null,
    } as any;
  }

  startEdit(p: Product): void {
    if (this.productsMode === 'archived') return;
    this.skuAuto = false;
    this.editingProductId = p.id ?? null;
    this.showProductForm = true;
    this.clearSelectedFiles();
    this.currentImagesFromApi = (p.imageUrls || []).map(u =>
      u.startsWith('http') ? u : `http://localhost:8080${u.startsWith('/') ? '' : '/'}${u}`
    );
    this.newProduct = {
      ...p,
      segmentCategoryId: (p as any).segmentCategoryId,
      typeCategoryId: (p as any).typeCategoryId,
      promoStartAt: this.isoToDateOnly((p as any).promoStartAt),
      promoEndAt: this.isoToDateOnly((p as any).promoEndAt),
      promoPrice: (p as any).promoPrice > 0 ? (p as any).promoPrice : null,
    } as any;
    setTimeout(() => document.getElementById('product-form-panel')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  submitForm(): void {
    if (!this.newProduct.name || !this.newProduct.sku || Number(this.newProduct.price) <= 0) return;
    this.isSubmitting = true;
    const payload = { ...this.newProduct };
    if (!payload.promoPrice) { payload.promoPrice = null; payload.promoStartAt = null; payload.promoEndAt = null; }

    if (this.editingProductId === null) {
      this.productService.create(payload, this.selectedFiles).subscribe({
        next: (c) => { this.products.unshift(c); this.closeProductForm(); this.isSubmitting = false; },
        error: () => this.isSubmitting = false
      });
    } else {
      this.productService.update(this.editingProductId, payload, this.selectedFiles.length ? this.selectedFiles : null).subscribe({
        next: (u) => { this.products = this.products.map(p => p.id === u.id ? u : p); this.closeProductForm(); this.isSubmitting = false; },
        error: () => this.isSubmitting = false
      });
    }
  }

  setProductsMode(mode: 'active' | 'archived'): void {
    this.productsMode = mode;
    this.closeProductForm();
    this.loadProducts();
  }

  openDeleteConfirm(p: Product): void { this.deleteTargetId = p.id ?? null; this.deleteTargetName = p.name; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; }
  confirmDelete(): void {
    if (!this.deleteTargetId) return;
    this.productService.delete(this.deleteTargetId).subscribe({
      next: () => { this.products = this.products.filter(p => p.id !== this.deleteTargetId); this.cancelDelete(); }
    });
  }
  restoreProduct(p: Product): void {
    if (!p.id) return;
    this.productService.restore(p.id).subscribe({ next: () => this.loadProducts() });
  }

  private isoToDateOnly(v?: string | null): string | null {
    return (v && v.length >= 10) ? v.substring(0, 10) : null;
  }

  // ==========================================
  // COMMANDES, STOCK, COUPONS
  // ==========================================
  loadStats(): void { this.statsLoading=true; this.adminStatsService.getSalesStats().subscribe({next: d=>{this.stats=d;this.statsLoading=false}, error:()=>this.statsLoading=false}); }

  loadOrders(): void { this.ordersLoading=true; this.adminStatsService.getAllOrders().subscribe({next: l=>{this.orders=l??[];this.ordersLoading=false}, error:()=>this.ordersLoading=false}); }
  get sortedOrders() { return [...this.orders].sort((a,b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime()); }
  get filteredOrders() { const b = this.sortedOrders; return this.orderStatusFilter==='ALL'?b:b.filter(o=>(o as any).status===this.orderStatusFilter); }
  get sortedReturnOrdersAll() { return this.sortedOrders.filter(o=>{const s=(o as any).status; return s==='RETURN_REQUESTED'||s==='RETURN_APPROVED'||s==='RETURN_REJECTED'}); }

  loadLowStock(): void { this.lowStockLoading=true; this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({next: l=>{this.lowStockProducts=l??[];this.lowStockLoading=false}, error:()=>this.lowStockLoading=false}); }
  saveStock(p: any) { if(!p.id)return; this.adminStatsService.updateProductStock(p.id, p.stockQuantity).subscribe(); }
  onThresholdChange() { this.loadLowStock(); }

  loadCoupons(): void { this.couponsLoading=true; this.couponService.getAllAdmin().subscribe({next: l=>{this.coupons=(l??[]).sort((a,b)=>(a.code||'').localeCompare(b.code||''));this.couponsLoading=false}, error:()=>this.couponsLoading=false}); }
  clampCouponPercent(): void { let v=Number(this.couponForm.percent); if(v<1)v=1; if(v>90)v=90; this.couponForm.percent=v; }
  resetCouponForm(): void { this.editingCouponId=null; this.couponForm={code:'',percent:10,startsAt:null,endsAt:null,active:true,maxUses:null}; }
  submitCouponForm(): void {
    const pl = { ...this.couponForm, code: this.couponForm.code.toUpperCase(), startsAt: this.dateToIso(this.couponForm.startsAt), endsAt: this.dateToIsoEnd(this.couponForm.endsAt) };
    this.couponSubmitting=true;
    if(this.editingCouponId==null) this.couponService.createAdmin(pl).subscribe({next: c=>{this.coupons.unshift(c);this.resetCouponForm();this.couponSubmitting=false},error:()=>this.couponSubmitting=false});
    else this.couponService.updateAdmin(this.editingCouponId, pl).subscribe({next: u=>{this.coupons=this.coupons.map(c=>c.id===u.id?u:c);this.resetCouponForm();this.couponSubmitting=false},error:()=>this.couponSubmitting=false});
  }
  editCoupon(c: any) { this.editingCouponId=c.id; this.couponForm={...c, startsAt:this.isoToDateOnly(c.startsAt), endsAt:this.isoToDateOnly(c.endsAt)}; }
  deleteCoupon(c: any) { if(confirm('Supprimer?')) this.couponService.deleteAdmin(c.id).subscribe({next:()=>this.coupons=this.coupons.filter(x=>x.id!==c.id)}); }

  private dateToIso(d: any) { return d ? `${d}T00:00:00Z` : null; }
  private dateToIsoEnd(d: any) { return d ? `${d}T23:59:59Z` : null; }

  // HELPERS
  getOrderEmail(o:any){return o?.customerEmail||'';}
  getStatusClass(s:string){return s.toLowerCase();}
  getPromoStatusLabel(p:Product){return p.promoPrice?'Active':'—';}
  getPromoStatusClass(p:Product){return p.promoPrice?'promo-active':'promo-inactive';}
  getCouponStatusLabel(c:any){return c.active?'Actif':'Inactif';}
  getCouponStatusClass(c:any){return c.active?'pill-ok':'pill-off';}

  // MODALES
  openOrderModal(o:any){this.selectedOrder=o;this.showOrderModal=true;}
  closeOrderModal(){this.showOrderModal=false;}
  saveOrderStatusFromModal(){if(this.selectedOrder) this.adminStatsService.updateOrderStatus((this.selectedOrder as any).id, this.modalStatus).subscribe({next: u=>{this.orders=this.orders.map(o=>(o as any).id===(u as any).id?u:o);this.closeOrderModal()}});}

  openReturnDetails(o:any){this.selectedReturnOrder=o;this.showReturnDetailsModal=true;}
  closeReturnDetails(){this.showReturnDetailsModal=false;}
  approveReturn(o:any){this.adminStatsService.approveReturn(o.id).subscribe(u=>this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x));}
  openRejectModal(o:any){this.selectedReturnOrder=o;this.showRejectModal=true;}
  closeRejectModal(){this.showRejectModal=false;}
  confirmReject(){if(this.selectedReturnOrder) this.adminStatsService.rejectReturn((this.selectedReturnOrder as any).id, this.rejectReason).subscribe(u=>{this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x);this.closeRejectModal()});}
}
