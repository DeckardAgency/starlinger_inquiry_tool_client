import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { QuickCartService } from '../../services/quick-cart.service';
import { Router } from '@angular/router';
import {SearchComponent} from '../../components/search/search.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [SearchComponent],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  constructor(
    public cartService: CartService,
    public quickCartService: QuickCartService,
    private router: Router
  ) {}

  toggleCart() {
    this.cartService.toggleCart();
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
