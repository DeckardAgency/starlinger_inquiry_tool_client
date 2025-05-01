import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbsComponent} from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import {IconComponent} from '@shared/components/icon/icon.component';
import {InquiryTableComponent} from '@shared/components/inquiry-table/inquiry-table.component';

@Component({
  selector: 'app-draft-inquiries',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, IconComponent, InquiryTableComponent],
  templateUrl: './draft-inquiries.component.html',
  styleUrls: ['./draft-inquiries.component.scss']
})
export class DraftInquiriesComponent implements OnInit {

  ngOnInit(): void {
  }

  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'Drafts' }
  ];
}
