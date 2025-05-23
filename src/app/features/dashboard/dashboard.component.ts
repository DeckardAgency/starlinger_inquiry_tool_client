import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickActionsComponent } from '@shared/components/dashboard/quick-actions/quick-actions.component';
import { ActiveInquiriesComponent } from '@shared/components/dashboard/active-inquiries/active-inquiries.component';
import { ActivityHistoryComponent } from '@shared/components/dashboard/activity-history/activity-history.component';
import {SpreadsheetComponent} from '@shared/components/spreadsheet/spreadsheet.component';

@Component({
    selector: 'app-dashboard',
  imports: [
    CommonModule,
    QuickActionsComponent,
    ActiveInquiriesComponent,
    ActivityHistoryComponent,
    QuickActionsComponent,
    ActiveInquiriesComponent,
    ActivityHistoryComponent,
    SpreadsheetComponent
  ],
    templateUrl: "dashboard.component.html",
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  breadcrumbs = [
    { label: 'Dashboard' }
  ];
}
