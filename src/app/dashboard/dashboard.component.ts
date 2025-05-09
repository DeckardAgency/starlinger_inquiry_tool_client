import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QuickActionsComponent} from '../components/quick-actions/quick-actions.component';
import {ActiveInquiriesComponent} from '../components/active-inquiries/active-inquiries.component';
import {ActivityHistoryComponent} from '../components/activity-history/activity-history.component';
import {BreadcrumbsComponent} from '../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    QuickActionsComponent,
    ActiveInquiriesComponent,
    ActivityHistoryComponent,
    BreadcrumbsComponent
  ],
  templateUrl: "dashboard.component.html",
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  breadcrumbs = [
    { label: 'Dashboard' }
  ];
}
