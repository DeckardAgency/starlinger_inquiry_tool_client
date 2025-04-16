import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';
import { ManualEntryInputFormComponent } from './manual-entry/input-form/manual-entry-input-form.component';
import { ManualEntryTemplateComponent } from './manual-entry/template/manual-entry-template.component';
import { InquiryToolComponent } from './inquiry-tool/inquiry-tool.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { ManualEntryCartComponent } from './manual-entry-cart/manual-entry-cart.component';

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
