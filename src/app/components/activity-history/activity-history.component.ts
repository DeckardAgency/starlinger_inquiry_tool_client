import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface InquiryHistory {
  id: string;
  machine: string;
  dateCreated: string;
  customer: {
    initials: string;
    name: string;
    image?: string;
  };
  partsOrdered: number;
  status: 'Completed' | 'Confirmed' | 'Processing' | 'Cancelled';
}

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="activity-history">
      <div class="activity-history__header">
        <h2 class="activity-history__title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Activity / History
        </h2>
        <a routerLink="/history" class="activity-history__view-all">
          View all
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

      <div class="activity-history__tabs">
        <button
          *ngFor="let tab of tabs"
          class="activity-history__tab"
          [class.activity-history__tab--active]="activeTab === tab"
          (click)="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="activity-history__table-wrapper">
        <table class="activity-history__table">
          <thead>
            <tr>
              <th>Inquiry ID</th>
              <th>Machine model</th>
              <th>
                Date Created
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5h10M5 12.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </th>
              <th>Customer</th>
              <th>Parts ordered</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (inquiry of inquiryHistory; track inquiry.id) {
              <tr>
                <td>{{ inquiry.id }}</td>
                <td>{{ inquiry.machine }}</td>
                <td>{{ inquiry.dateCreated }}</td>
                <td>
                  <div class="customer-cell">
                    @if (inquiry.customer.image) {
                      <img [src]="inquiry.customer.image" [alt]="inquiry.customer.name" class="customer-cell__image">
                    } @else {
                      <div class="customer-cell__initials">{{ inquiry.customer.initials }}</div>
                    }
                    {{ inquiry.customer.name }}
                  </div>
                </td>
                <td>{{ inquiry.partsOrdered }}</td>
                <td>
                  <span class="status-badge" [class]="'status-badge--' + inquiry.status.toLowerCase()">
                    {{ inquiry.status }}
                  </span>
                </td>
                <td>
                  <button class="action-menu">
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 10.833a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666ZM10 5a.833.833 0 1 0 0-1.667A.833.833 0 0 0 10 5Zm0 11.667a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .activity-history {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      &__title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 500;
        color: #18181B;

        svg {
          color: #71717A;
        }
      }

      &__view-all {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #DC2626;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
      }

      &__tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #E4E4E7;
        padding-bottom: 1rem;
      }

      &__tab {
        padding: 0.5rem 1rem;
        border: none;
        background: none;
        color: #71717A;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #18181B;
        }

        &--active {
          color: #DC2626;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: -1rem;
            left: 0;
            width: 100%;
            height: 2px;
            background: #DC2626;
          }
        }
      }

      &__table-wrapper {
        overflow-x: auto;
      }

      &__table {
        width: 100%;
        border-collapse: collapse;

        th {
          text-align: left;
          padding: 1rem;
          font-weight: 500;
          color: #71717A;
          border-bottom: 1px solid #E4E4E7;

          svg {
            margin-left: 0.5rem;
            vertical-align: middle;
          }
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #E4E4E7;
          color: #18181B;
        }
      }
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      &__image {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        object-fit: cover;
      }

      &__initials {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: #F4F4F5;
        color: #71717A;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 0.875rem;
      }
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;

      &--completed {
        background: #DCFCE7;
        color: #16A34A;
      }

      &--confirmed {
        background: #DCFCE7;
        color: #16A34A;
      }

      &--processing {
        background: #EDE9FE;
        color: #7C3AED;
      }

      &--cancelled {
        background: #FEE2E2;
        color: #DC2626;
      }
    }

    .action-menu {
      padding: 0.5rem;
      border: none;
      background: none;
      color: #71717A;
      cursor: pointer;
      border-radius: 0.5rem;
      transition: all 0.2s;

      &:hover {
        background: #F4F4F5;
        color: #18181B;
      }
    }
  `]
})
export class ActivityHistoryComponent {
  tabs = ['All Inquiries', 'Completed', 'Confirmed', 'Processing', 'Cancelled'];
  activeTab = 'All Inquiries';

  // Completed inquiries
  completedInquiries: InquiryHistory[] = [
    {
      id: '0001',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 12,
      status: 'Completed'
    },
    {
      id: '0002',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 192,
      status: 'Completed'
    },
    {
      id: '0006',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 60,
      status: 'Completed'
    },
    {
      id: '0007',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'IJ',
        name: 'Ivan Jozic'
      },
      partsOrdered: 72,
      status: 'Completed'
    }
  ];

  // Confirmed inquiries
  confirmedInquiries: InquiryHistory[] = [
    {
      id: '0003',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'ME',
        name: 'Martin Ertl'
      },
      partsOrdered: 48,
      status: 'Confirmed'
    },
    {
      id: '0008',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'JK',
        name: 'John Kowalski'
      },
      partsOrdered: 35,
      status: 'Confirmed'
    },
    {
      id: '0009',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'RM',
        name: 'Robert Miller'
      },
      partsOrdered: 89,
      status: 'Confirmed'
    }
  ];

  // Processing inquiries
  processingInquiries: InquiryHistory[] = [
    {
      id: '0004',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'ME',
        name: 'Martin Ertl'
      },
      partsOrdered: 36,
      status: 'Processing'
    },
    {
      id: '0010',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'LB',
        name: 'Lucy Brown'
      },
      partsOrdered: 156,
      status: 'Processing'
    },
    {
      id: '0011',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'TS',
        name: 'Tom Smith'
      },
      partsOrdered: 42,
      status: 'Processing'
    }
  ];

  // Cancelled inquiries
  cancelledInquiries: InquiryHistory[] = [
    {
      id: '0005',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 24,
      status: 'Cancelled'
    },
    {
      id: '0012',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '12-03-2024',
      customer: {
        initials: 'PW',
        name: 'Peter Wilson'
      },
      partsOrdered: 18,
      status: 'Cancelled'
    },
    {
      id: '0013',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '12-03-2024',
      customer: {
        initials: 'SD',
        name: 'Sarah Davis'
      },
      partsOrdered: 67,
      status: 'Cancelled'
    }
  ];

  // Combine all inquiries for the "All Inquiries" tab
  allInquiries: InquiryHistory[] = [
    ...this.completedInquiries,
    ...this.confirmedInquiries,
    ...this.processingInquiries,
    ...this.cancelledInquiries
  ].sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID in descending order

  get inquiryHistory(): InquiryHistory[] {
    switch (this.activeTab) {
      case 'Completed':
        return this.completedInquiries;
      case 'Confirmed':
        return this.confirmedInquiries;
      case 'Processing':
        return this.processingInquiries;
      case 'Cancelled':
        return this.cancelledInquiries;
      default:
        return this.allInquiries;
    }
  }
}
