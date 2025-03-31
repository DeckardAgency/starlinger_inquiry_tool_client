import { Component } from '@angular/core';
import {QuickCartService} from '../../services/quick-cart.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  constructor(public quickCartService: QuickCartService) {}

  toggleCart() {
    this.quickCartService.toggleCart();
  }
}
