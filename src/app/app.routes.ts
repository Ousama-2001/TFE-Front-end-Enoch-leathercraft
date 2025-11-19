// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { AdminGuard } from './guards/admin-guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },
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


  { path: '', redirectTo: 'products', pathMatch: 'full' },
];

