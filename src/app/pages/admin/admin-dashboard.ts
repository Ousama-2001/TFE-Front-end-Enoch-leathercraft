import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
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

// Pipe "any" pour éviter les erreurs de typage strict dans le HTML
@Pipe({ name: 'any', standalone: true })
export class AnyPipe implements PipeTransform {
  transform(value: any): any { return value; }
}

type OrderStatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
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

  // Filtres
  orderStatusFilter: OrderStatusFilter = 'ALL';
  productsMode: 'active' | 'archived' = 'active';

  // Stats
  stats: SalesStatsResponse | null = null;
  statsLoading = false;
  statsError: string | null = null;

  // Commandes
  orders: AdminOrderResponse[] = [];
  ordersLoading = false;
  ordersError: string | null = null;

  // Modale Commande
  showOrderModal = false;
  selectedOrder: AdminOrderResponse | null = null;
  modalStatus: string = 'PENDING'; // Stocke le statut temporaire de la modale

  statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID', label: 'Payée' },
    { value: 'SHIPPED', label: 'Expédiée' },
    { value: 'DELIVERED', label: 'Livrée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'RETURN_REQUESTED', label: 'Retour demandé' },
    { value: 'RETURN_APPROVED', label: 'Retour accepté' },
    { value: 'RETURN_REJECTED', label: 'Retour refusé' }
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
  showCreateForm = false;
  editingProductId: number | null = null;
  isSubmitting = false;

  // Images
  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];
  currentImages: ProductImageVm[] = [];

  // Modales diverses
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  deleteTargetName = '';

  // Selects
  segmentOptions = [{ id: 1, label: 'Homme' }, { id: 2, label: 'Femme' }, { id: 3, label: 'Petite maroquinerie' }];
  typeOptions = [{ id: 4, label: 'Sacs & sacoches' }, { id: 5, label: 'Ceintures' }, { id: 6, label: 'Portefeuilles' }, { id: 7, label: 'Portes-cartes' }, { id: 8, label: 'Sets de table' }];

  // Form Produit
  skuAuto = true;
  newProduct: ProductCreateRequest = {
    sku: '', name: '', description: '', price: 0, weightGrams: 0, isActive: true, currency: 'EUR', slug: '', segmentCategoryId: null, typeCategoryId: null,
    promoPrice: null, promoStartAt: null, promoEndAt: null
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

  // ✅ LOGIQUE PROMO
  get hasPromo(): boolean { return this.newProduct.promoPrice !== null && this.newProduct.promoPrice !== undefined; }
  togglePromo(): void {
    if (this.hasPromo) { this.newProduct.promoPrice = null; this.newProduct.promoStartAt = null; this.newProduct.promoEndAt = null; }
    else { this.newProduct.promoPrice = 0 as any; this.newProduct.promoStartAt = this.todayDateOnly() as any; }
  }
  private todayDateOnly(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // ✅ LOGIQUE IMAGES
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
    this.currentImages = [];
  }
  deleteExistingImage(imageId: number): void {
    if(imageId < 0) { alert("Impossible de supprimer une image sans ID."); return; }
    if(!this.editingProductId) return;
    if(!confirm("Supprimer définitivement cette image ?")) return;

    (this.productService as any).deleteImage(this.editingProductId, imageId).subscribe({
      next: () => { this.currentImages = this.currentImages.filter(i => i.id !== imageId); },
      error: () => alert("Erreur suppression image.")
    });
  }

  // ✅ HELPERS EMAIL & DATE
  getOrderEmail(o: any): string {
    // Essaie de trouver l'email un peu partout
    return o?.customerEmail || o?.email || o?.userEmail || o?.user?.email || 'Email non trouvé';
  }

  // ✅ TRI DES COMMANDES (Date/Heure réelle)
  get sortedOrders() {
    return [...this.orders].sort((a, b) => {
      // Convertit en timestamp (fonctionne avec ISO string ou Date object)
      const dateA = new Date((a as any).createdAt).getTime();
      const dateB = new Date((b as any).createdAt).getTime();
      return dateB - dateA; // Plus récent d'abord
    });
  }

  get filteredOrders() {
    const b = this.sortedOrders;
    return this.orderStatusFilter === 'ALL' ? b : b.filter(o => (o as any).status === this.orderStatusFilter);
  }

  // ✅ MODALE COMMANDE (Correction État)
  openOrderModal(o: any) {
    this.selectedOrder = o;
    // IMPORTANT : On initialise le selecteur avec l'état ACTUEL de la commande
    this.modalStatus = (o as any).status;
    this.showOrderModal = true;
  }

  closeOrderModal() { this.showOrderModal = false; }

  saveOrderStatusFromModal() {
    if(!this.selectedOrder) return;
    const id = (this.selectedOrder as any).id;

    this.adminStatsService.updateOrderStatus(id, this.modalStatus).subscribe({
      next: (updated) => {
        // Mise à jour de la liste locale
        this.orders = this.orders.map(o => (o as any).id === (updated as any).id ? updated : o);
        this.selectedOrder = updated; // Met à jour la modale si on la garde ouverte
        this.closeOrderModal();
      },
      error: (err) => alert("Erreur lors de la mise à jour du statut.")
    });
  }

  // RESTE DU CODE (inchangé mais nécessaire)
  loadStats(): void { this.statsLoading=true; this.adminStatsService.getSalesStats().subscribe({next:d=>{this.stats=d;this.statsLoading=false},error:()=>this.statsLoading=false}); }
  loadOrders(): void { this.ordersLoading=true; this.adminStatsService.getAllOrders().subscribe({next:l=>{this.orders=l??[];this.ordersLoading=false},error:()=>this.ordersLoading=false}); }
  get sortedReturnOrdersAll() { return this.sortedOrders.filter(o=>{const s=(o as any).status; return s==='RETURN_REQUESTED'||s==='RETURN_APPROVED'||s==='RETURN_REJECTED'}); }
  getStatusClass(s:string){ return s.toLowerCase(); }

  loadLowStock(){ this.lowStockLoading=true; this.adminStatsService.getLowStockProducts(this.lowStockThreshold).subscribe({next:l=>{this.lowStockProducts=l??[];this.lowStockLoading=false},error:()=>this.lowStockLoading=false}); }
  saveStock(p:any){ if(p.id) this.adminStatsService.updateProductStock(p.id, p.stockQuantity).subscribe(); }
  onThresholdChange(){ this.loadLowStock(); }

  setProductsMode(m: 'active'|'archived'){ this.productsMode=m; this.toggleCreateForm(); this.loadProducts(); }
  loadProducts(){ this.loading=true; const obs=this.productsMode==='active'?this.productService.getAll():this.productService.getArchived(); obs.subscribe({next:l=>{this.products=l??[];this.loading=false},error:()=>this.loading=false}); }

  toggleCreateForm(){
    if(this.productsMode==='archived') return;
    if(this.editingProductId!==null) this.resetForm();
    else { this.showCreateForm=!this.showCreateForm; this.error=''; }
  }

  resetForm(){ this.showCreateForm=false; this.editingProductId=null; this.isSubmitting=false; this.clearSelectedFiles(); this.newProduct={sku:'',name:'',description:'',price:0,weightGrams:0,isActive:true,currency:'EUR',slug:'',segmentCategoryId:null,typeCategoryId:null} as any; }

  startEdit(p: Product){
    if(this.productsMode==='archived')return;
    this.showCreateForm=true; this.editingProductId=p.id??null; this.clearSelectedFiles();
    const anyP:any=p;
    if(anyP.images && anyP.images.length) {
      this.currentImages = anyP.images.map((i:any)=>({id:i.id, url:i.url.startsWith('http')?i.url:`http://localhost:8080${i.url}`, isPrimary:!!i.isPrimary}));
    } else {
      this.currentImages = (p.imageUrls||[]).map((u,i)=>({id:-(i+1), url:u.startsWith('http')?u:`http://localhost:8080/${u}`, isPrimary:i===0}));
    }
    this.newProduct = {...p, segmentCategoryId:(p as any).segmentCategoryId, typeCategoryId:(p as any).typeCategoryId} as any;
    if((p as any).promoStartAt) this.newProduct.promoStartAt = ((p as any).promoStartAt).substring(0,10);
    if((p as any).promoEndAt) this.newProduct.promoEndAt = ((p as any).promoEndAt).substring(0,10);
  }

  submitForm(){
    if(!this.newProduct.name || !this.newProduct.sku || Number(this.newProduct.price)<=0) return;
    this.isSubmitting=true;
    const pl={...this.newProduct};
    if(!pl.promoPrice) { pl.promoPrice=null; pl.promoStartAt=null; pl.promoEndAt=null; }
    if(this.editingProductId===null) this.productService.create(pl,this.selectedFiles).subscribe({next:c=>{this.products.unshift(c);this.resetForm();this.isSubmitting=false},error:()=>this.isSubmitting=false});
    else this.productService.update(this.editingProductId, pl, this.selectedFiles.length?this.selectedFiles:null).subscribe({next:u=>{this.products=this.products.map(x=>x.id===u.id?u:x);this.resetForm();this.isSubmitting=false},error:()=>this.isSubmitting=false});
  }

  get filteredTypeOptions(){
    const s=this.newProduct.segmentCategoryId;
    if(s===1||s===2) return this.typeOptions.filter(t=>t.id===4||t.id===5);
    if(s===3) return this.typeOptions.filter(t=>t.id===6||t.id===7||t.id===8);
    return this.typeOptions;
  }
  onSegmentChange(){ this.ensureAutoSku(); }
  onTypeChange(){ this.ensureAutoSku(); }
  onSkuManualInput(){ this.skuAuto=false; }
  resetSkuAuto(){ this.skuAuto=true; this.ensureAutoSku(); }
  ensureAutoSku(){ if(this.skuAuto && this.newProduct.segmentCategoryId) this.newProduct.sku = 'GEN-ITM-'+String(Date.now()).slice(-4); }
  clampPrice(){ if(this.newProduct.price<0) this.newProduct.price=0; }
  clampPromoPrice(){ if(this.newProduct.promoPrice && this.newProduct.promoPrice<0) this.newProduct.promoPrice=0; }

  openDeleteConfirm(p:Product){ this.deleteTargetId=p.id??null; this.deleteTargetName=p.name; this.showDeleteConfirm=true; }
  cancelDelete(){ this.showDeleteConfirm=false; }
  confirmDelete(){ if(this.deleteTargetId) this.productService.delete(this.deleteTargetId).subscribe({next:()=>{this.products=this.products.filter(x=>x.id!==this.deleteTargetId);this.cancelDelete()}}); }
  restoreProduct(p:Product){ if(p.id) this.productService.restore(p.id).subscribe({next:()=>this.loadProducts()}); }

  loadCoupons(){ this.couponsLoading=true; this.couponService.getAllAdmin().subscribe({next:l=>{this.coupons=(l??[]).sort((a,b)=>(a.code||'').localeCompare(b.code||''));this.couponsLoading=false},error:()=>this.couponsLoading=false}); }
  clampCouponPercent(){ let v=Number(this.couponForm.percent); if(v<1)v=1; if(v>90)v=90; this.couponForm.percent=v; }
  resetCouponForm(){ this.editingCouponId=null; this.couponForm={code:'',percent:10,startsAt:null,endsAt:null,active:true,maxUses:null}; }
  submitCouponForm(){
    const pl={...this.couponForm, code:this.couponForm.code.toUpperCase(), startsAt:this.couponForm.startsAt?`${this.couponForm.startsAt}T00:00:00Z`:null, endsAt:this.couponForm.endsAt?`${this.couponForm.endsAt}T23:59:59Z`:null};
    if(this.editingCouponId==null) this.couponService.createAdmin(pl).subscribe({next:c=>{this.coupons.unshift(c);this.resetCouponForm()},error:()=>alert('Erreur')});
    else this.couponService.updateAdmin(this.editingCouponId, pl).subscribe({next:u=>{this.coupons=this.coupons.map(c=>c.id===u.id?u:c);this.resetCouponForm()},error:()=>alert('Erreur')});
  }
  editCoupon(c:any){ this.editingCouponId=c.id; this.couponForm={...c, startsAt:c.startsAt?c.startsAt.substring(0,10):null, endsAt:c.endsAt?c.endsAt.substring(0,10):null}; }
  deleteCoupon(c:any){ if(confirm('Supprimer?')) this.couponService.deleteAdmin(c.id).subscribe({next:()=>this.coupons=this.coupons.filter(x=>x.id!==c.id)}); }
  getCouponStatusLabel(c:any){ return c.active?'Actif':'Inactif'; }
  getCouponStatusClass(c:any){ return c.active?'pill-ok':'pill-off'; }

  openReturnDetails(o:any){ this.selectedReturnOrder=o; this.showReturnDetailsModal=true; }
  closeReturnDetails(){ this.showReturnDetailsModal=false; }
  approveReturn(o:any){ this.adminStatsService.approveReturn(o.id).subscribe(u=>this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x)); }
  openRejectModal(o:any){ this.selectedReturnOrder=o; this.showRejectModal=true; }
  closeRejectModal(){ this.showRejectModal=false; }
  confirmReject(){ if(this.selectedReturnOrder) this.adminStatsService.rejectReturn((this.selectedReturnOrder as any).id, this.rejectReason).subscribe(u=>{this.orders=this.orders.map(x=>(x as any).id===(u as any).id?u:x);this.closeRejectModal()}); }

  getPromoStatusLabel(p:Product){return p.promoPrice?'Active':'—';}
  getPromoStatusClass(p:Product){return p.promoPrice?'promo-active':'promo-inactive';}
}
