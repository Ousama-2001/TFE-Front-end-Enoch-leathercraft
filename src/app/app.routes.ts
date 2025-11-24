import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { AdminGuard } from './guards/admin-guard';
import { OrderSuccessComponent } from './pages/order-sucess/order-sucess';

export const routes: Routes = [
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

  // --- Routes Lazy-loaded ---
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail')
        .then(m => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart')
        .then(m => m.CartComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/account-page/account-page')
        .then(m => m.AccountPageComponent),
  },

  // --- Mot de passe oublié ---
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password')
        .then(m => m.ForgotPasswordComponent),
  },

  // --- Reset password ---
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password')
        .then(m => m.ResetPasswordComponent),
  },

  // --- Route de Succès ---
  {
    path: 'order-success/:reference',
    component: OrderSuccessComponent
  },

  // --- Redirections ---
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' }
];
