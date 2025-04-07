import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';
import {ManualEntryComponent} from './manual-entry/manual-entry.component';
import {InquiryToolComponent} from './inquiry-tool/inquiry-tool.component';
import {CartComponent} from './cart/cart.component';

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
  },
  {
    path: 'manual-entry',
    component: ManualEntryComponent,
    title: 'Inquiry Tool | Manual entry'
  },
  {
    path: 'inquiry-tool',
    component: InquiryToolComponent,
    title: 'Inquiry Tool | Inquiry Tool'
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Inquiry Tool | Cart'
  }
];
