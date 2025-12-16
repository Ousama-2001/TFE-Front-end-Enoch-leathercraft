import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductCreateRequest } from '../../services/products.service';
import { AdminStatsService, SalesStatsResponse, AdminOrderResponse } from '../../services/admin-stats.service';
import { CouponService, Coupon, CouponRequest } from '../../services/coupon.service';

import { AdminReviewsPageComponent } from '../admin-reviews/admin-reviews';
import { SuperAdminUsersPageComponent } from '../super-admin-users/super-admin-users'; // ✅ Import de ton composant User
import { SuperAdminRequestsPageComponent } from '../super-admin-requests/super-admin-requests';
import { SuperAdminContactMessagesComponent } from '../super-admin-contact-messages/super-admin-contact-messages';

@Pipe({ name: 'any', standalone: true })
export class AnyPipe implements PipeTransform {
  transform(value: any): any { return value; }
}

type OrderStatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_REJECTED';
type ProductFilter = 'ALL' | 'ACTIVE' | 'PROMO' | 'ARCHIVED';

interface ProductImageVm { id: number; url: string; isPrimary: boolean; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CurrencyPipe, DatePipe, AnyPipe,
    AdminReviewsPageComponent, SuperAdminUsersPageComponent, SuperAdminRequestsPageComponent, SuperAdminContactMessagesComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'stats';
  isSuperAdmin = false;
  isAdminOrSuperAdmin = false;

  pageSize = 10;
  ordersPage = 1; returnsPage = 1; productsPage = 1;

  orderStatusFilter: OrderStatusFilter = 'ALL';
  orderSearchTerm: string = '';
  returnStatusFilter: string = 'ALL';
  returnSearchTerm: string = '';
  selectedProductFilter: ProductFilter = 'ALL';
  productSearchTerm: string = '';
  productsMode: 'active' | 'archived' = 'active';

  // DATA
  stats: SalesStatsResponse | null = null;
  orders: AdminOrderResponse[] = [];
  products: Product[] = [];
  coupons: Coupon[] = [];

  // LOADING / ERRORS
  statsLoading=false; statsError:string|null=null;
  ordersLoading=false; ordersError:string|null=null;
  loading=false; error=''; // Pour produits
  couponsLoading=false; couponsError:string|null=null;
  lowStockLoading=false;

  // MODALS & FORMS
  showOrderModal=false; selectedOrder:any=null; modalStatus='PENDING';
  showReturnDetailsModal=false; selectedReturnOrder:any=null;
  showRejectModal=false; rejectReason='';
  showDeleteConfirm=false; deleteTargetId:number|null=null; deleteTargetName='';

  // PRODUITS
  showCreateForm=false; editingProductId:number|null=null; isSubmitting=false; productFormError:string|null=null;
  skuAuto = true;
  newProduct: ProductCreateRequest = { sku:'', name:'', description:'', price:null, weightGrams:null, isActive:true, currency:'EUR', slug:'', segmentCategoryId:null, typeCategoryId:null, promoPrice:null, promoStartAt:null, promoEndAt:null } as any;
  selectedFiles:File[]=[]; selectedPreviews:string[]=[]; currentImages:ProductImageVm[]=[]; previewImage:string|null=null;

  // COUPONS (AMÉLIORÉ)
  editingCouponId:number|null=null; couponSubmitting=false; couponError:string|null=null; couponErrors:{[key:string]:string}={};
  couponForm: CouponRequest = { code:'', percent:10, startsAt:null, endsAt:null, active:true, maxUses:null };

  // OPTIONS & STOCK
  orderStatusOptions = [ { value: 'PENDING', label: 'En attente' }, { value: 'PAID', label: 'Payée' }, { value: 'SHIPPED', label: 'Expédiée' }, { value: 'DELIVERED', label: 'Livrée' }, { value: 'CANCELLED', label: 'Annulée' } ];
  returnStatusOptions = [ { value: 'RETURN_REQUESTED', label: 'Demande reçue' }, { value: 'RETURN_APPROVED', label: 'Retour accepté' }, { value: 'RETURN_REJECTED', label: 'Retour refusé' } ];
  segmentOptions = [ { id: 1, label: 'Homme' }, { id: 2, label: 'Femme' }, { id: 3, label: 'Petite maroquinerie' } ];
  typeOptions = [ { id: 4, label: 'Sacs & sacoches' }, { id: 5, label: 'Ceintures' }, { id: 6, label: 'Portefeuilles' }, { id: 7, label: 'Portes-cartes' }, { id: 8, label: 'Sets de table' } ];
  lowStockProducts:Product[]=[]; lowStockThreshold=5;

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
    // 'users' géré par le composant enfant
  }

  // --- COUPONS LOGIC ---
  loadCoupons(){ this.couponsLoading=true; this.couponService.getAllAdmin().subscribe({next:l=>{this.coupons=(l??[]).sort((a,b)=>(a.code||'').localeCompare(b.code||''));this.couponsLoading=false},error:()=>this.couponsLoading=false}); }

  resetCouponForm(){
    this.editingCouponId=null;
    this.couponErrors={};
    // ✅ AUTO-DATE: Aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    // ✅ ACTIVE PAR DÉFAUT
    this.couponForm={ code:'', percent:10, active:true, maxUses:null, startsAt: today, endsAt: null };
  }

  // ✅ VALIDATION COUPON
  submitCouponForm(){
    this.couponErrors = {};
    let isValid = true;

    if (!this.couponForm.code || this.couponForm.code.trim() === '') {
      this.couponErrors['code'] = "Le code est obligatoire.";
      isValid = false;
    }
    if (this.couponForm.percent === null || this.couponForm.percent === undefined) {
      this.couponErrors['percent'] = "Requis.";
      isValid = false;
    } else if (this.couponForm.percent < 1 || this.couponForm.percent > 100) {
      this.couponErrors['percent'] = "Entre 1 et 100.";
      isValid = false;
    }
    if (this.couponForm.startsAt && this.couponForm.endsAt) {
      if (new Date(this.couponForm.endsAt) < new Date(this.couponForm.startsAt)) {
        this.couponErrors['dates'] = "La fin doit être après le début.";
        isValid = false;
      }
    }

    if (!isValid) return;

    this.couponSubmitting = true;
    const pl={...this.couponForm, code:this.couponForm.code.toUpperCase(), startsAt:this.couponForm.startsAt?`${this.couponForm.startsAt}T00:00:00Z`:null, endsAt:this.couponForm.endsAt?`${this.couponForm.endsAt}T23:59:59Z`:null};

    if(this.editingCouponId==null) {
      this.couponService.createAdmin(pl).subscribe({
        next:c=>{this.coupons.unshift(c);this.resetCouponForm();this.couponSubmitting=false},
        error:()=>{alert('Erreur création');this.couponSubmitting=false}
      });
    } else {
      this.couponService.updateAdmin(this.editingCouponId, pl).subscribe({
        next:u=>{this.coupons=this.coupons.map(c=>c.id===u.id?u:c);this.resetCouponForm();this.couponSubmitting=false},
        error:()=>{alert('Erreur mise à jour');this.couponSubmitting=false}
      });
    }
  }

  editCoupon(c:any){
    this.editingCouponId=c.id;
    this.couponErrors={};
    this.couponForm={...c, startsAt:c.startsAt?c.startsAt.substring(0,10):null, endsAt:c.endsAt?c.endsAt.substring(0,10):null};
  }
  deleteCoupon(c:any){ if(confirm('Supprimer?')) this.couponService.deleteAdmin(c.id).subscribe({next:()=>this.coupons=this.coupons.filter(x=>x.id!==c.id)}); }
  getCouponStatusLabel(c:any){ return c.active?'Actif':'Inactif'; }
  getCouponStatusClass(c:any){ return c.active?'pill-ok':'pill-off'; }

  // --- PRODUCTS ---
  toggleCreateForm(){ if(this.selectedProductFilter==='ARCHIVED')return; if(this.editingProductId!==null)this.resetForm(); else{this.showCreateForm=!this.showCreateForm; this.productFormError=null;} }
  resetForm(){ this.showCreateForm=false; this.editingProductId=null; this.isSubmitting=false; this.clearSelectedFiles(); this.productFormError=null; this.newProduct={sku:'',name:'',description:'',price:null,weightGrams:null,isActive:true,currency:'EUR',slug:'',segmentCategoryId:null,typeCategoryId:null} as any; }
  startEdit(p: Product){ if(this.selectedProductFilter==='ARCHIVED')return; this.showCreateForm=true; this.editingProductId=p.id??null; this.clearSelectedFiles(); const anyP:any=p; if(anyP.images && anyP.images.length) { this.currentImages = anyP.images.map((i:any)=>({id:i.id, url:i.url.startsWith('http')?i.url:`http://localhost:8080${i.url}`, isPrimary:!!i.isPrimary})); } else { this.currentImages = (p.imageUrls||[]).map((u,i)=>({id:-(i+1), url:u.startsWith('http')?u:`http://localhost:8080/${u}`, isPrimary:i===0})); } this.newProduct = {...p, segmentCategoryId:(p as any).segmentCategoryId, typeCategoryId:(p as any).typeCategoryId} as any; if((p as any).promoStartAt) this.newProduct.promoStartAt = ((p as any).promoStartAt).substring(0,10); if((p as any).promoEndAt) this.newProduct.promoEndAt = ((p as any).promoEndAt).substring(0,10); }
  openDeleteConfirm(p:Product){ this.deleteTargetId=p.id??null; this.deleteTargetName=p.name; this.showDeleteConfirm=true; }
  cancelDelete(){ this.showDeleteConfirm=false; }
  confirmDelete(){ if(this.deleteTargetId) this.productService.delete(this.deleteTargetId).subscribe({next:()=>{this.products=this.products.filter(x=>x.id!==this.deleteTargetId);this.cancelDelete()}}); }
  restoreProduct(p:Product){ if(p.id) this.productService.restore(p.id).subscribe({next:()=>this.loadProducts()}); }
  submitForm(){ /* Validation produits inchangée */ this.isSubmitting=true; if(!(this.newProduct as any).slug) (this.newProduct as any).slug = this.newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'); const pl={...this.newProduct}; if(!pl.promoStartAt) { pl.promoPrice=null; pl.promoStartAt=null; pl.promoEndAt=null; } if(this.editingProductId===null) { this.productService.create(pl,this.selectedFiles).subscribe({next:c=>{this.products.unshift(c);this.resetForm();this.isSubmitting=false},error:(e)=>{console.error(e); this.productFormError="Erreur création"; this.isSubmitting=false}}); } else { this.productService.update(this.editingProductId, pl, this.selectedFiles.length?this.selectedFiles:null).subscribe({next:u=>{this.products=this.products.map(x=>x.id===u.id?u:x);this.resetForm();this.isSubmitting=false},error:()=>this.isSubmitting=false}); } }

  // Helpers UI (SKU Auto)
  onSkuManualInput(){ this.skuAuto=false; }
  resetSkuAuto(){ this.skuAuto=true; this.ensureAutoSku(); }
  onSegmentChange(){ this.ensureAutoSku(); }
  onTypeChange(){ this.ensureAutoSku(); }
  ensureAutoSku(){ if(this.skuAuto) { const seg = this.newProduct.segmentCategoryId ? 'S'+this.newProduct.segmentCategoryId : 'XX'; const typ = this.newProduct.typeCategoryId ? 'T'+this.newProduct.typeCategoryId : 'XX'; this.newProduct.sku = `${seg}-${typ}-${String(Date.now()).slice(-4)}`; } }
  get filteredTypeOptions(){ const s=this.newProduct.segmentCategoryId; if(s===1||s===2) return this.typeOptions.filter(t=>t.id===4||t.id===5); if(s===3) return this.typeOptions.filter(t=>t.id===6||t.id===7||t.id===8); return this.typeOptions; }

  // COMMON HELPERS
  loadStats(): void { this.statsLoading=true; this.adminStatsService.getSalesStats().subscribe({next:d=>{this.stats=d;this.statsLoading=false},error:()=>this.statsLoading=false}); }
  loadOrders(): void { this.ordersLoading=true; this.adminStatsService.getAllOrders().subscribe({next:l=>{this.orders=l??[];this.ordersLoading=false},error:()=>this.ordersLoading=false}); }
  onProductFilterChange(): void { this.productsPage = 1; this.showCreateForm = false; this.productsMode = (this.selectedProductFilter === 'ARCHIVED') ? 'archived' : 'active'; this.loadProducts(); }
  loadProducts(): void { this.loading = true; const obs = this.selectedProductFilter === 'ARCHIVED' ? this.productService.getArchived() : this.productService.getAll(); obs.subscribe({ next: (l) => { this.products = l ?? []; this.loading = false; }, error: () => { this.error = 'Erreur chargement produits'; this.loading = false; } }); }

  get sortedOrders() { return [...this.orders].sort((a,b)=>new Date((b as any).createdAt).getTime()-new Date((a as any).createdAt).getTime()); }
  get filteredOrders() { let list = this.sortedOrders.filter(o => !['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED'].includes(o.status)); if (this.orderStatusFilter !== 'ALL') { list = list.filter(o => (o as any).status === this.orderStatusFilter); } if (this.orderSearchTerm.trim()) { list = list.filter(o => o.reference.toLowerCase().includes(this.orderSearchTerm.toLowerCase())); } return list; }
  get paginatedOrders() { const s=(this.ordersPage-1)*this.pageSize; return this.filteredOrders.slice(s,s+this.pageSize); }
  get totalOrdersPages() { return Math.ceil(this.filteredOrders.length/this.pageSize)||1; }
  changeOrdersPage(d:number){ this.ordersPage=Math.max(1,Math.min(this.totalOrdersPages,this.ordersPage+d)); }

  get filteredProducts() { let list = this.products; const term = this.productSearchTerm.toLowerCase().trim(); if (term) { list = list.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)); } if (this.selectedProductFilter === 'PROMO') { list = list.filter(p => !!p.promoPrice && p.promoPrice > 0); } return list; }
  get paginatedProducts() { const start = (this.productsPage - 1) * this.pageSize; return this.filteredProducts.slice(start, start + this.pageSize); }
  get totalProductsPages() { return Math.ceil(this.filteredProducts.length / this.pageSize) || 1; }
  changeProductsPage(delta: number) { this.productsPage = Math.max(1, Math.min(this.totalProductsPages, this.productsPage + delta)); }

  // Helpers UI
  get hasPromo(): boolean { return this.newProduct.promoStartAt !== null; }
  togglePromo(): void { if (this.hasPromo) { this.newProduct.promoPrice = null; this.newProduct.promoStartAt = null; this.newProduct.promoEndAt = null; } else { this.newProduct.promoPrice = null; this.newProduct.promoStartAt = this.todayDateOnly() as any; } }
  private todayDateOnly(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  getOrderEmail(o: any): string { return o?.customerEmail || o?.email || o?.userEmail || o?.user?.email || 'N/A'; }
  getStatusClass(s:string){ return s.toLowerCase(); }
  getStatusLabel(status: string): string { const found = [...this.orderStatusOptions, ...this.returnStatusOptions].find(o => o.value === status); return found ? found.label : status; }
  get sortedReturnOrdersAll() { return this.sortedOrders.filter(o=>{const s=(o as any).status; return s==='RETURN_REQUESTED'||s==='RETURN_APPROVED'||s==='RETURN_REJECTED'}); }
  get filteredReturns() { let list = this.sortedReturnOrdersAll; if (this.returnStatusFilter !== 'ALL') { list = list.filter(o => o.status === this.returnStatusFilter); } if (this.returnSearchTerm.trim()) { const term = this.returnSearchTerm.toLowerCase().trim(); list = list.filter(o => o.reference.toLowerCase().includes(term)); } return list; }
  get paginatedReturns() { const s=(this.returnsPage-1)*this.pageSize; return this.filteredReturns.slice(s,s+this.pageSize); }
  get totalReturnsPages() { return Math.ceil(this.filteredReturns.length/this.pageSize)||1; }
  changeReturnsPage(d:number){ this.returnsPage=Math.max(1,Math.min(this.totalReturnsPages,this.returnsPage+d)); }

  // Modals & Others
  openOrderModal(o:any){ this.selectedOrder=o; this.modalStatus = o.status; this.showOrderModal=true; }
  closeOrderModal(){ this.showOrderModal=false; }
  saveOrderStatusFromModal(){ if(this.selectedOrder) this.adminStatsService.updateOrderStatus((this.selectedOrder as any).id, this.modalStatus).subscribe({next:u=>{this.orders=this.orders.map(o=>(o as any).id===(u as any).id?u:o);this.closeOrderModal()}});}
  openReturnDetails(o:any){ this.selectedReturnOrder=o; this.modalStatus = o.status; this.showReturnDetailsModal=true; }
  closeReturnDetails(){ this.showReturnDetailsModal=false; }
  saveReturnStatusFromModal(){ if(!this.selectedReturnOrder) return; this.adminStatsService.updateOrderStatus((this.selectedReturnOrder as any).id, this.modalStatus).subscribe({next:u=>{this.orders=this.orders.map(o=>(o as any).id===(u as any).id?u:o);this.closeReturnDetails()}}); }
  approveReturn(o:any){ this.adminStatsService.approveReturn(o.id).subscribe(u=>this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x)); }
  openRejectModal(o:any){ this.selectedReturnOrder=o; this.showRejectModal=true; }
  closeRejectModal(){ this.showRejectModal=false; }
  confirmReject(){ if(this.selectedReturnOrder) this.adminStatsService.rejectReturn((this.selectedReturnOrder as any).id, this.rejectReason).subscribe(u=>{this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x);this.closeRejectModal()}); }
  loadLowStock(){ this.lowStockLoading=true; this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({next:l=>{this.lowStockProducts=l??[];this.lowStockLoading=false},error:()=>this.lowStockLoading=false}); }
  saveStock(p:any){ if(p.id) this.adminStatsService.updateProductStock(p.id, p.stockQuantity).subscribe(); }
  onThresholdChange(){ this.loadLowStock(); }
  onFilesSelected(event: any): void { const files: File[] = Array.from(event.target.files || []); if (!files.length) return; this.selectedFiles.push(...files); files.forEach(f => this.selectedPreviews.push(URL.createObjectURL(f))); }
  removeSelectedFile(index: number): void { this.selectedFiles.splice(index, 1); URL.revokeObjectURL(this.selectedPreviews[index]); this.selectedPreviews.splice(index, 1); }
  clearSelectedFiles(): void { this.selectedPreviews.forEach(u => URL.revokeObjectURL(u)); this.selectedPreviews = []; this.selectedFiles = []; this.currentImages = []; }
  deleteExistingImage(imageId: number): void { if(imageId < 0) return; if(!confirm("Supprimer?")) return; (this.productService as any).deleteImage(this.editingProductId, imageId).subscribe(() => this.currentImages = this.currentImages.filter(i => i.id !== imageId)); }
  openImagePreview(url: string) { this.previewImage = url; }
  closeImagePreview() { this.previewImage = null; }

  getPromoStatusClass(p: Product): string { if (!p.promoPrice || p.promoPrice <= 0) return 'pill-off'; const now = new Date(); const start = p.promoStartAt ? new Date(p.promoStartAt) : null; const end = p.promoEndAt ? new Date(p.promoEndAt) : null; if (start && now < start) return 'pill-soft'; if (end && now > end) return 'pill-off'; return 'promo-active'; }
  getPromoStatusLabel(p:Product){ if (!p.promoPrice || p.promoPrice <= 0) return '—'; const now = new Date(); const start = p.promoStartAt ? new Date(p.promoStartAt) : null; const end = p.promoEndAt ? new Date(p.promoEndAt) : null; if (start && now < start) return 'À venir'; if (end && now > end) return 'Expirée'; return 'En cours'; }
}
