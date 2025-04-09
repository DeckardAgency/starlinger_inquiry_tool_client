import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';
import { ManualEntryComponent } from './manual-entry/manual-entry.component';
import { InquiryToolComponent } from './inquiry-tool/inquiry-tool.component';
import { CartComponent } from './cart/cart.component';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Inquiry Tool | Login'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Dashboard'
  },
  {
    path: 'shop',
    component: ShopComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Shop'
  },
  {
    path: 'manual-entry',
    component: ManualEntryComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Manual entry'
  },
  {
    path: 'inquiry-tool',
    component: InquiryToolComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Inquiry Tool'
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Cart'
  }
];
