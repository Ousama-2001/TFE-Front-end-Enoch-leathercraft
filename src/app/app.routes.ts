import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { AdminGuard } from './guards/admin-guard';
import { OrderSuccessComponent } from './pages/order-sucess/order-sucess'; // Vérifie le nom de ton dossier

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

  // --- Routes Lazy-loaded (chargées uniquement quand on clique dessus) ---
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then(m => m.CartComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.ProfileComponent)
  },

  // --- Route de Succès de Commande ---
  {
    path: 'order-success/:reference',
    component: OrderSuccessComponent
  },

  // --- Redirections par défaut ---
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' } // Redirige n'importe quelle URL inconnue vers l'accueil
];
