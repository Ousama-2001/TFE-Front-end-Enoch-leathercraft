import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { AdminGuard } from './guards/admin-guard';
import { OrderSuccessComponent } from './pages/order-sucess/order-sucess';

export const routes: Routes = [

  // --- Homepage ---
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.HomeComponent),
  },

  // --- Routes Publiques ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },

  // --- Route Admin Protégée ---
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },

  // --- Détail produit ---
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail')
        .then(m => m.ProductDetailComponent),
  },

  // --- Panier ---
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart')
        .then(m => m.CartComponent),
  },

  // --- Page profil / compte ---
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/account-page/account-page')
        .then(m => m.AccountPageComponent),
  },

  // --- ✅ Commandes client (liste + détail) ---
  {
    path: 'my-orders',
    loadComponent: () =>
      import('./pages/my-orders/my-orders')
        .then(m => m.MyOrdersComponent),
  },
  {
    path: 'my-orders/:id',
    loadComponent: () =>
      import('./pages/order-detail/order-detail')
        .then(m => m.OrderDetailComponent),
  },

  // --- Mot de passe oublié / reset ---
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password')
        .then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password')
        .then(m => m.ResetPasswordComponent),
  },

  // --- Page de Succès ---
  {
    path: 'order-success/:reference',
    component: OrderSuccessComponent
  },

  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about').then(m => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then(m => m.ContactComponent),
  },

  // --- Redirections ---
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
