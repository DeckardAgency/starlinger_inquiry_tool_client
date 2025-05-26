import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickActionsComponent } from '@shared/components/dashboard/quick-actions/quick-actions.component';
import { ActiveInquiriesComponent } from '@shared/components/dashboard/active-inquiries/active-inquiries.component';
import { ActivityHistoryComponent } from '@shared/components/dashboard/activity-history/activity-history.component';
import {CarouselComponent, CarouselImage} from '@shared/components/carousel/carousel.component';

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
    CarouselComponent
  ],
    templateUrl: "dashboard.component.html",
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  breadcrumbs = [
    { label: 'Dashboard' }
  ];

  carouselImages: CarouselImage[] = [
    {
      url: 'https://picsum.photos/800/400?random=1',
      alt: 'Random image 1',
      caption: 'Beautiful landscape'
    },
    {
      url: 'https://picsum.photos/800/400?random=2',
      alt: 'Random image 2',
      caption: 'Amazing architecture'
    },
    {
      url: 'https://picsum.photos/800/400?random=3',
      alt: 'Random image 3',
      caption: 'Natural wonders'
    },
    {
      url: 'https://picsum.photos/800/400?random=4',
      alt: 'Random image 4',
      caption: 'Urban exploration'
    },
    {
      url: 'https://picsum.photos/800/400?random=5',
      alt: 'Random image 5',
      caption: 'Modern design'
    }
  ];
}
