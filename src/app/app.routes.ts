// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductsComponent } from './pages/products/products';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'admin', component: AdminDashboardComponent }, // on sécurisera plus tard
  { path: '**', redirectTo: 'products' },
];
