import { Routes } from '@angular/router';
import { LoginComponent } from '@features/login/login.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { AuthGuard } from '@core/auth/auth.guard';
import { ShopComponent } from '@features/shop/shop.component';
import { ManualEntryInputFormComponent } from '@features/manual-entry/input-form/manual-entry-input-form.component';
import { ManualEntryTemplateComponent } from '@features/manual-entry/template/manual-entry-template.component';
import { ManualEntryCartComponent } from '@features/manual-entry-cart/manual-entry-cart.component';
import { InquiryToolComponent } from '@features/inquiry-tool/inquiry-tool.component';
import { CartComponent } from '@features/cart/cart.component';
import { OrderConfirmationComponent } from '@features/order-confirmation/order-confirmation.component';
import { ActiveInquiriesComponent } from '@features/my-inquiries/active/active-inquiries.component';
import { DraftInquiriesComponent } from '@features/my-inquiries/drafts/draft-inquiries.component';
import { InquiryHistoryComponent } from '@features/my-inquiries/history/inquiry-history.component';
import { OrderDetailComponent } from '@features/inquiry-detail/shop/order-detail.component';
import { InquiryDetailComponent } from '@features/inquiry-detail/manual-entry/inquiry-detail.component';

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
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
    title: 'Inquiry Tool | Order Confirmation'
  },
  {
    path: 'my-inquiries/active',
    component: ActiveInquiriesComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Active Inquiries'
  },
  {
    path: 'my-inquiries/drafts',
    component: DraftInquiriesComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Draft Inquiries'
  },
  {
    path: 'my-inquiries/history',
    component: InquiryHistoryComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Inquiry History'
  },
  {
    path: 'my-inquiries/active/inquiry/:id/view',
    component: InquiryDetailComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Inquiry Details'
  },
  {
    path: 'my-inquiries/active/order/:id/view',
    component: OrderDetailComponent,
    canActivate: [AuthGuard],
    title: 'Inquiry Tool | Order Details'
  }
];
