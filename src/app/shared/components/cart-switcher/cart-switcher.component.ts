import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-cart-switcher',
    imports: [CommonModule, RouterLink, RouterModule],
    templateUrl: './cart-switcher.component.html',
    styleUrls: ['./cart-switcher.component.scss']
})
export class CartSwitcherComponent implements OnInit {
  currentUrl: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    // Initialize current URL
    this.currentUrl = this.router.url;

    // Subscribe to router events to update currentUrl
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
    });
  }
}
