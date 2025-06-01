import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BreadcrumbsComponent} from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import {Breadcrumb} from '@core/models';

@Component({
    selector: 'app-order-confirmation',
    imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbsComponent],
    templateUrl: './order-confirmation.component.html',
    styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {

  breadcrumbs: Breadcrumb[] = [
      { label: 'Dashboard', link: '/dashboard' },
      { label: 'Order Confirmation' }
    ];

    ngOnInit(): void {}
}
