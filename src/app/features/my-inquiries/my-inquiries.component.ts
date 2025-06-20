import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-my-inquiries',
  imports: [CommonModule, BreadcrumbsComponent],
  templateUrl: './my-inquiries.component.html',
  styleUrls: ['./my-inquiries.component.scss']
})
export class MyInquiriesComponent implements OnInit {

  breadcrumbs = [
    { label: 'My inquiries' }
  ];

    ngOnInit(): void {
    }

}
