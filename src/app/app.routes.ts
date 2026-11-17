import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Farmers } from './pages/farmers/farmers';
import { Suppliers } from './pages/suppliers/suppliers';
import { Customers } from './pages/customers/customers';
import { Inventory } from './pages/inventory/inventory';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard | Coconut Management System'
  },
  {
    path: 'farmers',
    component: Farmers,
    title: 'Farmers | Coconut Management System'
  },
  {
    path: 'suppliers',
    component: Suppliers,
    title: 'Suppliers | Coconut Management System'
  },
  {
    path: 'customers',
    component: Customers,
    title: 'Customers | Coconut Management System'
  },
  {
    path: 'inventory',
    component: Inventory,
    title: 'Inventory | Coconut Management System'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
