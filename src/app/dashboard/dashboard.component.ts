// src/app/dashboard/dashboard.component.ts
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
  template: `
    <div class="dashboard">
      <app-breadcrumbs [items]="breadcrumbs"></app-breadcrumbs>

      <div class="dashboard__content">
        <app-quick-actions></app-quick-actions>
        <app-active-inquiries></app-active-inquiries>
        <app-activity-history></app-activity-history>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100%;
      background: #FAFAFA;

      &__content {
        padding: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent {
  breadcrumbs = [
    { label: 'Dashboard' }
  ];
}
