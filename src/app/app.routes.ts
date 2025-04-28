import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ShopComponent } from './features/shop/shop.component';
import { ManualEntryInputFormComponent } from './features/manual-entry/input-form/manual-entry-input-form.component';
import { ManualEntryTemplateComponent } from './features/manual-entry/template/manual-entry-template.component';
import { InquiryToolComponent } from './features/inquiry-tool/inquiry-tool.component';
import { CartComponent } from './features/cart/cart.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './core/auth/auth.guard';
import { ManualEntryCartComponent } from './features/manual-entry-cart/manual-entry-cart.component';

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
    path: 'manual-entry/input-form',
    component: ManualEntryInputFormComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Manual Entry - InputForm'
  },
  {
    path: 'manual-entry/template',
    component: ManualEntryTemplateComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Manual Entry - Template'
  },
  {
    path: 'manual-entry-cart',
    component: ManualEntryCartComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Inquiry Overview'
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
