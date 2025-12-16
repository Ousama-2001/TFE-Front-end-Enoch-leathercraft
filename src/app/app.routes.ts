// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { AdminGuard } from './guards/admin-guard';
import { OrderSuccessComponent } from './pages/order-sucess/order-sucess';
import { superAdminGuard } from './guards/super-admin.guard';
import { CheckoutComponent } from './pages/checkout/checkout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ✅ AU LANCEMENT : HOME
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // --- Homepage ---
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.HomeComponent),
  },

  // --- Routes Publiques ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },

  // --- Détail produit ---
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(
        (m) => m.ProductDetailComponent
      ),
  },

  // --- Panier ---
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cart/cart').then((m) => m.CartComponent),
  },

  // --- Checkout ---
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },

  // --- Wishlist ---
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/wishlist/wishlist').then((m) => m.WishlistComponent),
  },

  // --- Profil / Compte ---
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/account-page/account-page').then(
        (m) => m.AccountPageComponent
      ),
  },

  // --- Commandes client ---
  {
    path: 'my-orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-orders/my-orders').then(
        (m) => m.MyOrdersComponent
      ),
  },
  {
    path: 'my-orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/order-detail/order-detail').then(
        (m) => m.OrderDetailComponent
      ),
  },

  // --- Mot de passe oublié / reset ---
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  // ✅ CONFIRMATION CHANGEMENT EMAIL (PUBLIC)
  {
    path: 'confirm-email-change',
    loadComponent: () =>
      import('./pages/confirm-email-change/confirm-email-change').then(
        (m) => m.ConfirmEmailChangeComponent
      ),
  },

  // --- Page de Succès commande ---
  { path: 'order-success/:reference', component: OrderSuccessComponent },

  // --- Pages simples ---
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.ContactComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/terms/terms').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy').then((m) => m.PrivacyComponent),
  },

  // --- Admin ---
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/reviews',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./pages/admin-reviews/admin-reviews').then(
        (m) => m.AdminReviewsPageComponent
      ),
  },
  {
    path: 'super-admin/users',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./pages/super-admin-users/super-admin-users').then(
        (m) => m.SuperAdminUsersPageComponent
      ),
  },
  {
    path: 'super-admin/requests',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./pages/super-admin-requests/super-admin-requests').then(
        (m) => m.SuperAdminRequestsPageComponent
      ),
  },

  // --- Fallback ---
  { path: '**', redirectTo: 'home' },
];
