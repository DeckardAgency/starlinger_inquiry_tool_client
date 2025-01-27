import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Inquiry Tool | Dashboard'
  },
  {
    path: 'shop',
    component: ShopComponent,
    title: 'Inquiry Tool | Shop'
  }
];
