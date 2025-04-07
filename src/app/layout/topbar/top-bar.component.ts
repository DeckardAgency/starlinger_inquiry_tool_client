import { Component } from '@angular/core';
import {QuickCartService} from '../../services/quick-cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  constructor(
    public quickCartService: QuickCartService,
    private router: Router
  ) {}

  toggleCart() {
    this.quickCartService.toggleCart();
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
