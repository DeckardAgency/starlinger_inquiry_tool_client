import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { InquiryService, InquiryResponse } from '@services/http/inquiry.service';
import { AuthService } from '@core/auth/auth.service';
import {LogMessage} from '@core/models';

interface Product {
  partNo: string;
  name: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  discount: string;
  price: number;
}

interface Machine {
  id: string;
  name: string;
  products: Product[];
  isOpen: boolean;
}


@Component({
    selector: 'app-inquiry-detail',
    imports: [CommonModule, BreadcrumbsComponent, IconComponent, RouterModule],
    templateUrl: './inquiry-detail.component.html',
    styleUrls: ['./inquiry-detail.component.scss']
})
export class InquiryDetailComponent implements OnInit {
  inquiryId: string = '#0001';
  internalReference: string = '000123-ABC';
  dateCreated: string = '14-03-2024';
  partsOrdered: number = 12;
  totalPrice: number = 9764.19;
  amountToPay: number = 7811.352;

  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'Active Inquiries', link: '/my-inquiries/active' },
    { label: '...' },
  ];

  status: string = 'Payment pending';
  type: string = 'Shop';
  fulfillmentStatus: string = 'Unfulfilled';

  machines: Machine[] = [
    {
      id: '1',
      name: '200XE Winding Machine',
      isOpen: true,
      products: [
        {
          partNo: 'AIVV-01152',
          name: 'Power panel T30 4,3" WQVGA color touch',
          weight: '0,4 kg',
          quantity: 2,
          unitPrice: 556.17,
          discount: '10 %',
          price: 1112.34
        },
        {
          partNo: 'ZME-01171D',
          name: 'Modul FU-Stacofil 200XE',
          weight: '1,4 kg',
          quantity: 3,
          unitPrice: 442.46,
          discount: '20 %',
          price: 1327.38
        },
        {
          partNo: 'AEPI-01072',
          name: 'ABTASTKOPF f. induktives Winkelmesssystem',
          weight: '0,263 kg',
          quantity: 2,
          unitPrice: 868.10,
          discount: '–',
          price: 1736.36
        }
      ]
    },
    {
      id: '2',
      name: 'Alpha 6.0 Machine',
      isOpen: true,
      products: [
        {
          partNo: 'AIHR-01039',
          name: 'Heating element',
          weight: '1,5 kg',
          quantity: 3,
          unitPrice: 1855.01,
          discount: '10 %',
          price: 5565.03
        },
        {
          partNo: 'VYC-00245F',
          name: 'SL 6 Shuttle Wheel (6,5") for Reed 10"',
          weight: '0,09 kg',
          quantity: 2,
          unitPrice: 11.54,
          discount: '–',
          price: 23.08
        }
      ]
    }
  ];

  logMessages: LogMessage[] = [
    {
      type: 'Order',
      date: '19-03-2024',
      time: '16:30',
      user: 'Support',
      message: 'Order completed'
    },
    {
      type: 'Order',
      date: '18-03-2024',
      time: '09:15',
      user: 'Support',
      message: 'Preparing order'
    },
    {
      type: 'Payment',
      date: '17-03-2024',
      time: '14:45',
      user: 'Anes Kapetanovic',
      message: 'Payment completed'
    },
    {
      type: 'Email',
      date: '16-03-2024',
      time: '10:00',
      user: 'Support',
      message: 'Missing shipping info'
    },
    {
      type: 'Order',
      date: '15-03-2024',
      time: '19:30',
      user: 'Support',
      message: 'All products are availible'
    },
    {
      type: 'Order',
      date: '14-03-2024',
      time: '18:00',
      user: 'Anes Kapetanovic',
      message: 'Order submitted'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inquiryService: InquiryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // In a real implementation, we would fetch the data from the API
    // this.route.paramMap.pipe(
    //   switchMap(params => {
    //     const id = params.get('id');
    //     if (!id) {
    //       return of(null);
    //     }
    //     return this.inquiryService.getInquiryById(id);
    //   })
    // ).subscribe(data => {
    //   if (data) {
    //     // Process the data
    //   }
    // });
  }

  goBack(): void {
    this.router.navigate(['/my-inquiries/active']);
  }

  toggleMachine(machine: Machine): void {
    machine.isOpen = !machine.isOpen;
  }

  getLogTypeBadgeClass(type: string): string {
    return `inquiry-detail__log-type--${type.toLowerCase()}`;
  }
}
